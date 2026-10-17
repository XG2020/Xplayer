/* Offline regressions for endpoint matching, generated assets and leak detection. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),vm=require('node:vm'),crypto=require('node:crypto');
const {scanEndpoints,checkEndpoints}=require('../tools/check-endpoints.cjs');
const root=path.resolve(__dirname,'..');
// Numeric fixtures let regressions exercise real service identities without publishing names.
const hosts={
 catalogue:String.fromCharCode(97,112,105,46,98,121,116,101,97,109,111,110,101,46,99,110),
 library:String.fromCharCode(100,109,107,117,46,98,121,116,101,97,109,111,110,101,46,99,110),
 alternate:String.fromCharCode(100,97,110,109,117,46,122,120,122,46,101,101)
};
const video='https://v.qq.com/x/page/testvideo.html',legacyId='test-episode P';
let passed=0,failed=0;
function expect(condition,message){if(!condition)throw Error(message);}
async function test(name,run){
 try{await run();passed++;console.log('PASS '+name);}
 catch(error){failed++;console.error('FAIL '+name+': '+error.message);}
}
function temporaryFixture(run){
 const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'xplayer-endpoint-privacy-')),confirmed=fs.realpathSync(temporary);
 try{return run(temporary);}
 finally{
  const resolved=fs.realpathSync(temporary),base=path.resolve(os.tmpdir())+path.sep;
  if(resolved!==confirmed||!resolved.startsWith(base)||!path.basename(resolved).startsWith('xplayer-endpoint-privacy-'))throw Error('Unsafe temporary cleanup target');
  fs.rmSync(resolved,{recursive:true});
 }
}
function sealedFixture(endpoint){
 const key=crypto.randomBytes(32),share=crypto.randomBytes(32),nonce=crypto.randomBytes(12);
 const cipher=crypto.createCipheriv('aes-256-gcm',key,nonce);cipher.setAAD(Buffer.from('Xplayer/builtin-endpoint/v1'));
 const ciphertext=Buffer.concat([cipher.update(endpoint,'utf8'),cipher.final()]);
 const data={version:1,nonce:nonce.toString('base64'),tag:cipher.getAuthTag().toString('base64'),keyShareA:share.toString('base64'),
  keyShareB:Buffer.from(key.map((value,index)=>value^share[index])).toString('base64'),ciphertext:ciphertext.toString('base64')};
 return '<?php\n// Generated test data.\nreturn array (\n'+Object.entries(data).map(([name,value])=>"  '"+name+"' => "+(typeof value==='number'?value:"'"+value+"'")+',').join('\n')+'\n);\n';
}
function sandbox(){
 const context=vm.createContext({URL,URLSearchParams,setTimeout,clearTimeout,crypto:{randomUUID:()=> 'endpoint-regression'}});
 context.window=context;
 context.document={baseURI:'https://player.example/index.php',getElementById:()=>({textContent:'{}'})};
 vm.runInContext(fs.readFileSync(path.join(root,'assets/vendor/crypto/crypto-js.min.js'),'utf8'),context);
 return context;
}
function loadSources(folder,api,sourceVideo=video){
 const context=sandbox();
 vm.runInContext(fs.readFileSync(path.join(root,folder,'danmaku-sources.js'),'utf8'),context);
 const sources=context.XplayerDanmakuSources;
 sources.configure({apis:[api],localFallback:false,context:{url:sourceVideo,id:legacyId,externalIds:[legacyId]}});
 return sources;
}
function read(sources,transport){
 return new Promise((resolve,reject)=>sources.read('https://player.example/danmaku.php?id=test',(error,rows)=>error?reject(Error('Mocked library read failed')):resolve(rows),transport));
}
function send(sources,payload,transport){
 return new Promise((resolve,reject)=>sources.send('',payload,error=>error?reject(Error('Mocked library send failed')):resolve(),transport));
}
function loadPosterFilter(folder){
 const context=sandbox(),data={source:video,danmakuApi:'danmaku.php',settings:{},title:'Demo'};
 context.document.getElementById=()=>({textContent:JSON.stringify(data)});
 context.location=new URL(context.document.baseURI);
 context.$=()=>({on(){return this;}});
 context.$.ajaxSetup=()=>{};context.$.ajaxPrefilter=()=>{};
 context.XGGM={video:{},jump:{last(){}},danmu:{report(){}},MYad:{pause:{}},play(){}};
 context.XplayerPlaybackSettings={read:()=>({autoplay:false})};
 context.XplayerContextMenu={create:()=>[]};context.addEventListener=()=>{};
 const source=fs.readFileSync(path.join(root,folder,'compatibility.js'),'utf8');
 const marker='    global.XplayerBootstrap=';
 expect(source.includes(marker),'Compatibility entry point is missing');
 // Expose the existing internal filter only in this isolated VM; production stays unchanged.
 vm.runInContext(source.replace(marker,'    global.testSeriesPicture=seriesPicture;\n'+marker),context);
 return context.testSeriesPicture;
}
async function main(){
 await test('leak detector covers source, docs, generated files and escaped hosts',()=>temporaryFixture(temporary=>{
   const fixtures={
    'src/demo.js':'// demo\nconst api="https://'+hosts.catalogue+'/vlist/";',
    'README.md':'Demo\nhttps://'+hosts.library.toUpperCase()+'/dmku/',
    'assets/player/demo.js':'"https://'+hosts.alternate+'/";',
    'src/matcher.js':'/'+hosts.catalogue.replace(/\./g,'\\.')+'/',
    'Cache/example.json':hosts.catalogue,'var/example.txt':hosts.library,
    'node_modules/example/index.js':hosts.alternate,'.git/example.txt':hosts.catalogue,
    'includes/Mysql.Include.php':hosts.catalogue,'includes/Admin.Credentials.php':hosts.library,
    'includes/Setup.Token.php':hosts.alternate,'.env.local':hosts.catalogue,
    'safe.md':'https://service.example/path'
   };
   for(const [relative,contents] of Object.entries(fixtures)){
    const file=path.join(temporary,relative);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,contents);
   }
   const result=scanEndpoints(temporary);
   expect(result.files===5,'Scanner included local runtime files or skipped shipped text');
   expect(JSON.stringify([...result.failures].sort())===JSON.stringify(['README.md:2','assets/player/demo.js:1','src/demo.js:2','src/matcher.js:1'].sort()),'Scanner missed a protected hostname or reported the wrong location');
   let rejected=false;
   try{checkEndpoints(temporary);}catch(error){
    rejected=true;expect(Object.values(hosts).every(host=>!error.message.toLowerCase().includes(host)),'Failure diagnostics exposed a hostname');
   }
   expect(rejected,'Build guard did not reject plaintext');
 }));
 await test('leak detector follows encrypted default rotation without stale hash results',()=>temporaryFixture(temporary=>{
  const source=path.join(temporary,'demo.js'),configuration=path.join(temporary,'includes/Builtin.Endpoint.php');
  const first='https://service.example.com/vlist/?url=',second='https://adapter.example.com/catalogue?url={url}';
  fs.mkdirSync(path.dirname(configuration));fs.writeFileSync(source,JSON.stringify(first));
  expect(scanEndpoints(temporary).failures.length===0,'Unconfigured fixture host was already protected');
  fs.writeFileSync(configuration,sealedFixture(first));
  expect(JSON.stringify(scanEndpoints(temporary).failures)==='["demo.js:1"]','Encrypted default host was not detected after a previous scan');
  fs.writeFileSync(configuration,sealedFixture(second));
  expect(scanEndpoints(temporary).failures.length===0,'Rotated configuration retained a stale protected host');
  fs.writeFileSync(source,JSON.stringify(second));
  expect(JSON.stringify(scanEndpoints(temporary).failures)==='["demo.js:1"]','Rotated encrypted default host was not detected');
 }));
 await test('damaged or executable encrypted configuration fails with generic diagnostics',()=>temporaryFixture(temporary=>{
  const configuration=path.join(temporary,'includes/Builtin.Endpoint.php'),original=sealedFixture('https://service.example.com/?url=');
  fs.mkdirSync(path.dirname(configuration));
  const damaged=original.replace(/('tag' => ')([^']+)/,(_,prefix,value)=>{
   const bytes=Buffer.from(value,'base64');bytes[0]^=1;return prefix+bytes.toString('base64');
  });
  for(const contents of [damaged,original+'throw new Exception("untrusted diagnostics");',original.replace("'version' => 1","'version' => 2")]){
   fs.writeFileSync(configuration,contents);let rejected=false;
   try{scanEndpoints(temporary);}catch(error){
    rejected=true;expect(error.message==='Encrypted built-in endpoint configuration is invalid','Configuration failure exposed private diagnostics');
   }
   expect(rejected,'Damaged or executable configuration was accepted');
  }
 }));
 for(const folder of ['src/player','assets/player']){
  await test(folder+': alternate library retains read/write protocol and status filtering',async()=>{
   const sources=loadSources(folder,'https://'+hosts.alternate.toUpperCase()+'/?ac=dm');
   const rows=await read(sources,(address,payload,callback)=>{
    const url=new URL(address);
    expect(url.searchParams.get('type')==='json'&&!url.searchParams.has('ac'),'Alternate read query changed');
    expect(url.searchParams.get('id')===video,'Supported platform URL is not used for reading');
    callback(null,{code:23,danmuku:[[1,5,'#4994c4','有1条弹幕正在赶来，请遵守弹幕礼仪，祝您观影愉快！'],[8,5,16711680,'Actual comment']]});
   });
   const selected=sources.getSelected(),digest=crypto.createHash('md5').update(video).digest('hex');
   expect(selected.kind==='zxz'&&selected.writeId===digest&&!sources.canReport(),'Alternate adapter selection changed');
   expect(rows.length===1&&rows[0][4]==='Actual comment'&&rows[0][1]==='top'&&rows[0][2]==='#ff0000','Alternate comment normalization changed');
   await send(sources,{text:'Test',time:4,color:'#ff0000',type:'top'},(address,payload,callback,format)=>{
    const url=new URL(address);
    expect(format==='form'&&payload.player===digest&&payload.type===5,'Alternate write protocol changed');
    expect(!url.searchParams.has('id')&&!url.searchParams.has('type')&&!url.searchParams.has('ac'),'Read parameters leaked into write endpoint');
    callback(null,{success:true});
   });
  });
  await test(folder+': alternate library hashes direct media identities',async()=>{
   const media='https://media.example/video.mp4',sources=loadSources(folder,'https://'+hosts.alternate+'/',media);
   await read(sources,(address,payload,callback)=>{
    expect(new URL(address).searchParams.get('id')===crypto.createHash('md5').update(media).digest('hex'),'Direct media identifier changed');
    callback(null,{code:23,danmuku:[[8,1,16777215,'Actual comment']]});
   });
  });
  await test(folder+': known library probes only supported paths and exact hosts',async()=>{
   const cases=[
    [hosts.library,'/dmku',true],[hosts.library.toUpperCase(),'/dmku/',true],[hosts.library,'/dmku/index.php',true],
    [hosts.library,'/other',false],['prefix.'+hosts.library,'/dmku/',false],[hosts.library+'.example','/dmku/',false],
    ['prefix'+hosts.library,'/dmku/',false],['library.example','/dmku/',false]
   ];
   for(const [host,pathname,probeExpected] of cases){
    const sources=loadSources(folder,'https://'+host+pathname),calls=[];
    const generic=[1,'top','#ffffff','system','Generic notice'];
    const actual=[8,'right','#ff0000','tester','Actual comment'];
    const rows=await read(sources,(address,payload,callback)=>{
     const query=new URL(address).searchParams;calls.push(query.get('id'));
     expect(query.get('ac')==='dm','Legacy read action changed');
     callback(null,{code:23,danmuku:query.get('id').startsWith('__xplayer_unmatched_')?[generic]:[generic,actual]});
    });
    expect(calls.length===(probeExpected?2:1),'Fallback probe matched an unexpected host or path');
    expect(rows.length===(probeExpected?1:2)&&rows.at(-1)[4]==='Actual comment','Fallback notice removal changed');
    expect(sources.getSelected().kind==='legacy'&&sources.canReport(),'Legacy library reporting changed');
   }
  });
  await test(folder+': alternate adapter rejects hostname prefixes and suffixes',async()=>{
   for(const host of ['prefix.'+hosts.alternate,hosts.alternate+'.example','prefix'+hosts.alternate]){
    const sources=loadSources(folder,'https://'+host+'/');
    await read(sources,(address,payload,callback)=>{
     expect(new URL(address).searchParams.get('ac')==='dm','Similar hostname selected alternate protocol');
     callback(null,{code:23,danmuku:[[8,'right','#ffffff','tester','Actual comment']]});
    });
    expect(sources.getSelected().kind==='legacy'&&sources.canReport(),'Similar hostname selected alternate adapter');
   }
  });
  await test(folder+': poster placeholder filtering preserves host and path boundaries',()=>{
   const filter=loadPosterFilter(folder),endpoint='https://'+hosts.catalogue;
   for(const suffix of ['/poster-background.php','/POSTER-BACKGROUND.PHP/','/poster-%62ackground.php?size=1']){
    expect(filter(endpoint+suffix)==='','Known placeholder was not filtered');
   }
   for(const candidate of [endpoint+'/cover.jpg',endpoint+'/poster-background.php-other','https://prefix.'+hosts.catalogue+'/poster-background.php',endpoint+'.example/poster-background.php']){
    expect(filter(candidate)===new URL(candidate).href,'Legitimate artwork or a different host was filtered');
   }
   expect(filter('javascript:alert(1)')===''&&filter('https://user:pass@image.example/cover.jpg')==='','Unsafe artwork URL was accepted');
  });
 }
 await test('all project source, documentation and built assets pass the leak guard',()=>checkEndpoints(root));
 console.log(`${passed}/${passed+failed} tests passed`);process.exitCode=failed?1:0;
}
main().catch(()=>{console.error('FAIL endpoint privacy test setup');process.exitCode=1;});

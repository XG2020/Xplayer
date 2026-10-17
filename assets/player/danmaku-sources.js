/* Ordered danmaku libraries. Read failover never retries or moves a write. */
(function(global){
 'use strict';
 let configured=null,context={},policy={},selected=null,sequence=0,activeReads=[],lastTransport=null;
 const fallbackProbes=new Map();
 const modes={0:'right',1:'top',2:'bottom',4:'bottom',5:'top',right:'right',top:'top',bottom:'bottom'};
 const zxzModes={right:1,top:5,bottom:4};
 // LLQ opens an URL string, which encodes spaces as %20. Some deployed libraries
 // route +P and %20P to different upstream data, despite echoing the same group name.
 function queryHref(address){address.search=address.search.replace(/\+/g,'%20');return address.href;}
 // Platform episode IDs survive title changes, tracking parameters and parser CDN URLs.
 function identify(ctx){
  const episode=String(ctx.episode||1),explicit=String(ctx.explicitId||'').trim();
  if(explicit)return {externalIds:[explicit+' P'+episode],creationId:explicit+' P'+episode,localId:explicit+' P'+episode};
  let address;try{address=new URL(ctx.url);}catch(_){}
  const host=address?.hostname.toLowerCase()||'',path=address?.pathname||'',query=address?.searchParams;
  const on=domain=>host===domain||host.endsWith('.'+domain);
  const valid=value=>/^[A-Za-z0-9_=-]{1,128}$/.test(String(value||''))?String(value):'';
  const meta=ctx.metadata||{},parsed=ctx.playbackIdentity||{};
  const provided=field=>valid(parsed[field])||valid(meta[field]);
  let platform='',video='',stable='',match;
  if(on('qq.com')&&(host==='v.qq.com'||host==='m.v.qq.com')){
   platform='qq';match=path.match(/\/x\/(?:cover\/[^/]+|page)\/([A-Za-z0-9]+)\.html$/);
   video=valid(query?.get('vid'))||match?.[1]||provided('vid')||provided('videoId');stable=video;
  }else if(on('iqiyi.com')){
   platform='iqiyi';match=path.match(/\/(v_[A-Za-z0-9]+)\.html$/);
   video=valid(query?.get('tvid'))||provided('tvid')||provided('vid')||provided('videoId');stable=match?.[1]||video;
   video=video||stable;
  }else if(on('youku.com')){
   platform='youku';match=path.match(/\/id_([A-Za-z0-9=]+)\.html$/);
   video=match?.[1]||provided('vid')||provided('videoId');stable=video;
  }else if(on('mgtv.com')){
   platform='mgtv';match=path.match(/\/b\/\d+\/(\d+)\.html$/);
   video=match?.[1]||provided('videoId')||provided('vid');stable=video;
  }else if(on('bilibili.com')){
   platform='bilibili';match=path.match(/\/bangumi\/play\/(ep\d+)/)||path.match(/\/video\/(BV[A-Za-z0-9]+|av\d+)/);
   video=match?.[1]||(/^\/bangumi\/play\/ss\d+\/?$/.test(path)&&provided('vid')?'ep'+provided('vid'):'');
   const part=/^(BV|av)/.test(video)?':p'+(/^[1-9]\d*$/.test(query?.get('p')||'')?query.get('p'):'1'):'';
   stable=video+part;if(part)video=stable;
  }
  const digest=global.CryptoJS?.MD5(String(ctx.url||'')).toString();
  const localId=platform&&stable?platform+':'+stable:'url:'+digest+(address?'':':'+episode);
  // LLQ's decrypted bootstrap funcGID takes MD5(original URL).slice(-20).
  // It initializes config.sid to an empty string; dmid appends exactly " P".
  // Native vid, a full MD5, a title or " P1" address different library groups.
  const llqId=digest.slice(-20)+' P';
  let canonical=String(ctx.url||'');
  if(platform&&stable&&address){
   const normalized=new URL(address);
   for(const key of [...normalized.searchParams.keys()]){
    if(/^(?:utm_.+|ptag|from|source|spm|spm_id_from|share_source|share_medium|share_plat|share_session_id|vd_source|qyTrace)$/.test(key))normalized.searchParams.delete(key);
   }
   normalized.hash='';canonical=normalized.href;
  }
  const creationId=global.CryptoJS.MD5(canonical).toString().slice(-20)+' P';
  const ids=[llqId,creationId,String(ctx.id||'')];
  return {platform,videoId:video,localId,llqId,creationId,externalIds:[...new Set(ids.filter(Boolean))]};
 }
 function bootstrap(){try{return JSON.parse(document.getElementById('xplayer-bootstrap')?.textContent||'{}');}catch(_){return {};}}
 function sources(){
  if(configured)return configured;
  const data=bootstrap();
  if(Array.isArray(data.danmakuApis)&&(!data.danmakuApis.length||data.danmakuApis[0]===data.danmakuApi))return data.danmakuApis.slice(0,10);
  const single=typeof data.danmakuApi==='string'?data.danmakuApi:global.config?.api;
  return typeof single==='string'?(single?[single]:[]):['danmaku.php'];
 }
 function currentContext(address){
  const data=bootstrap(),request=new URL(address,document.baseURI);
  return {url:data.source||'',title:'',episode:global.config?.sid||1,id:request.searchParams.get('id')||global.XGGM?.id||'',...context};
 }
 function color(value){
  if(typeof value==='string'){
   value=value.trim();
   if(/^#[\da-f]{6}$/i.test(value))return value.toLowerCase();
   if(/^#[\da-f]{3}$/i.test(value))return '#'+value.slice(1).toLowerCase().split('').map(part=>part+part).join('');
   // Numeric API colors are RGB integers, even when encoded as JSON strings.
   // Hex without a prefix must contain a-f to avoid confusing decimal values.
   if(/^(?:\d{1,8}|0x[\da-f]{1,6})$/i.test(value))value=Number(value);
   else if(/^[\da-f]{6}$/i.test(value)&&/[a-f]/i.test(value))return '#'+value.toLowerCase();
   else{
    const rgb=value.match(/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i);
    if(rgb&&rgb.slice(1).every(part=>Number(part)<=255))return '#'+rgb.slice(1).map(part=>Number(part).toString(16).padStart(2,'0')).join('');
   }
  }
  if(typeof value==='number'&&Number.isInteger(value)&&value>=0&&value<=0xffffff)return '#'+value.toString(16).padStart(6,'0');
  return '#ffffff';
 }
 function normalize(payload,source){
  if(!payload||typeof payload!=='object')throw Error('弹幕接口返回的数据格式不正确');
  if(payload.success===false||payload.code!==undefined&&![0,23,200].includes(Number(payload.code)))throw Error(String(payload.msg||payload.message||'弹幕接口返回错误'));
  const reportedId=payload.player||payload.videoId||(source.kind==='zxz'?payload.id:'');
  if(reportedId!==undefined&&reportedId!==null&&String(reportedId)!==''&&![source.id,source.writeId,source.context.url].includes(String(reportedId)))throw Error('弹幕接口返回了其他视频的标识');
  const list=Array.isArray(payload)?payload:Array.isArray(payload.danmuku)?payload.danmuku:Array.isArray(payload.data)?payload.data:Array.isArray(payload.comments)?payload.comments:null;
  if(!list)throw Error('弹幕接口返回的数据格式不正确');
  if(payload.matched===false||payload.announcement===true)return [];
  const rows=[];
  for(const [index,row] of list.slice(0,10000).entries()){
   let time,type,text,shade,author='',id='',date='',size='27.5px';
   if(Array.isArray(row)&&source.kind==='zxz'){
    [time,type,shade,text,date]=row;
    type=Number(type)===5?'top':Number(type)===4?'bottom':'right';
    if(/^\d{10}$/.test(String(date)))date=new Date(Number(date)*1000).toISOString().slice(0,10);
   }else if(Array.isArray(row)){
    [time,type,shade,author,text]=row;id=row[5]??'';date=row[6]??'';size=row[7]||size;
   }else if(row&&typeof row==='object'){
    if(row.announcement===true||row.system===true||['notice','announcement'].includes(row.type))continue;
    if(typeof row.p==='string'&&typeof row.m==='string'){
     const values=row.p.split(',');time=values[0];type=Number(values[1])===5?'top':Number(values[1])===4?'bottom':'right';shade=Number(values[2]);author=values[3]||'';id=row.cid||'';text=row.m;
    }else{time=row.time;type=row.mode??row.type;shade=row.color;author=row.author||row.user||'';id=row.id||row.cid||'';text=row.text??row.content;size=row.size||size;}
   }else continue;
   if(time===null||time===undefined||time===''||!Number.isFinite(Number(time))||Number(time)<0||typeof text!=='string'||!text.trim())continue;
   // This exact first status row is injected by ZXZ, in either native or Artplayer format.
   if(source.kind==='zxz'&&index===0&&Number(time)===1&&modes[type]==='top'&&String(shade).toLowerCase()==='#4994c4'&&/^有\d+条弹幕正在赶来，请遵守弹幕礼仪，祝您观影愉快[~～!！]?$/.test(text))continue;
   rows.push([Number(time),modes[type]||'right',color(shade),String(author),text,String(id),String(date),String(size)]);
  }
  return rows;
 }
 function rowSignature(rows){
  // Providers may echo the requested name or regenerate IDs/dates on a fallback.
  // Compare only the actual on-screen comments, independent of their order.
  return JSON.stringify(rows.map(row=>JSON.stringify([row[0],row[1],row[2],row[4]])).sort());
 }
 function fallbackProbe(source,transport){
  const address=new URL(source.readUrl);address.searchParams.delete('id');
  const key=address.href,cached=fallbackProbes.get(key);
  if(cached&&cached.expires>Date.now())return cached.result;
  const entry={expires:Infinity,result:null};
  // Only the known public LLQ endpoint is probed. Never write to the library.
  const id='__xplayer_unmatched_'+(global.crypto?.randomUUID?.()||Date.now().toString(36)+Math.random().toString(36).slice(2));
  address.searchParams.set('id',id);
  entry.result=new Promise(resolve=>{
   let settled=false,request;
   function finish(error,rows){
    if(settled)return;settled=true;clearTimeout(timer);
    entry.expires=Date.now()+(error?5000:60000);
    resolve({error,rows:error?[]:rows});
   }
   const timer=setTimeout(()=>{finish(true);try{request?.abort();}catch(_){}},2500);
   try{
    request=transport(address.href,null,(error,payload)=>{
     if(error){finish(error);return;}
     try{finish(null,normalize(payload,{...source,id,writeId:id,context:{...source.context,url:''}}));}catch(error){finish(error);}
    });
   }catch(error){finish(error);}
  });
  fallbackProbes.set(key,entry);
  return entry.result;
 }
 function describe(raw,ctx){
  if(typeof raw!=='string'||raw!=='danmaku.php'&&(!/^https?:\/\/[^/]/i.test(raw)||/[\x00-\x20\x7f<>"'\\]/.test(raw)))throw Error('请手动输入以 https:// 或 http:// 开头的完整弹幕库地址');
  const base=new URL(raw,document.baseURI);if(!/^https?:$/.test(base.protocol)||base.username||base.password)throw Error('弹幕接口地址不正确');
  const local=new URL('danmaku.php',document.baseURI),isLocal=base.origin===local.origin&&base.pathname===local.pathname;
  const settings={...bootstrap(),...policy};
  const allowed=(settings.danmakuCreateApis||[]).some(value=>{try{return new URL(value,document.baseURI).href===base.href;}catch(_){return false;}});
  const source={base:base.href,kind:'legacy',context:ctx,id:String(ctx.externalIds?.[0]||ctx.id||''),canSend:true,canReport:true,isLocal,canCreate:isLocal||allowed};
  if(isLocal&&ctx.localId)source.id=String(ctx.localId);
  source.writeId=source.id;
  // These fingerprints identify protocol quirks only; they are not authorization.
  const hostFingerprint=global.CryptoJS?.MD5(base.hostname).toString();
  if(hostFingerprint==='33e12d696d8b5fe249c243a0009d9b4c'){
   source.kind='zxz';source.canReport=false;
   const videoUrl=/^https?:\/\//i.test(ctx.url||'')?ctx.url:ctx.mediaUrl;
   if(!videoUrl||!/^https?:\/\//i.test(videoUrl))throw Error('缺少当前视频原链接');
   source.writeId=global.CryptoJS?.MD5(videoUrl).toString();
   if(!source.writeId)throw Error('无法建立当前视频弹幕标识');
   const host=new URL(videoUrl).hostname;
   source.id=/(^|\.)(?:bilibili\.com|b23\.tv|v\.qq\.com|iqiyi\.com|mgtv\.com|youku\.com)$/i.test(host)?videoUrl:source.writeId;
   base.searchParams.delete('ac');base.searchParams.set('type','json');base.searchParams.set('id',source.id);
   source.readUrl=base.href;const send=new URL(source.base);for(const key of ['ac','type','id','mode'])send.searchParams.delete(key);source.sendUrl=send.href;
  }else{
   if(!source.id)throw Error('缺少当前视频弹幕标识');
   source.checkFallback=hostFingerprint==='34a8e323adfc22506e8b694f8b92f03d'&&/^\/dmku(?:\/(?:index\.php)?)?$/.test(base.pathname);
   base.searchParams.set('ac','dm');base.searchParams.set('id',source.id);source.readUrl=queryHref(base);
   const send=new URL(base);send.searchParams.delete('id');source.sendUrl=send.href;
  }
  return source;
 }
 function withId(source,id){
  const address=new URL(source.readUrl);address.searchParams.set('id',id);
  return {...source,id,writeId:id,readUrl:queryHref(address)};
 }
 function applySource(source,rows){
  selected={...source,rows};
  if(global.config)global.config.api=source.base;
  const player=global.XGGM?.dp;
  if(player?.danmaku){
   const address=new URL(source.readUrl);address.searchParams.delete('id');
   player.danmaku.options.api.address=address.href;player.danmaku.options.api.id=source.writeId;
   player.options.danmaku.api=address.href;player.options.danmaku.id=source.writeId;
  }
 }
 function readOne(source,transport,callback){
  // Start the cached control request alongside the video read, with its own
  // short deadline. A video switch may reuse it without waiting on an old read.
  const probe=source.checkFallback?fallbackProbe(source,transport):null;
  const request=transport(source.readUrl,null,(error,payload)=>{
   if(error){callback(error);return;}
   let rows;try{rows=normalize(payload,source);}catch(error){callback({status:200,response:{msg:error.message}});return;}
   const canSend=source.canSend&&payload.canSend!==false&&payload.writable!==false;
   const finish=()=>callback(null,rows,{...source,canSend,canCreate:source.canCreate&&canSend&&payload.canCreate!==false,name:typeof payload.name==='string'?payload.name:source.id},payload);
   if(!probe||!rows.length){finish();return;}
   probe.then(result=>{
    if(result.error){callback({status:200,response:{msg:'暂时无法确认弹幕是否匹配当前视频'}});return;}
    // Remove generic notices even when real video comments are returned alongside them.
    const generic=new Set(result.rows.map(row=>rowSignature([row])));
    rows=rows.filter(row=>!generic.has(rowSignature([row])));
    finish();
   });
  });
  if(request){activeReads=activeReads.filter(item=>item.readyState!==4);activeReads.push(request);}
 }
 function read(address,callback,transport){
  const version=++sequence;activeReads.forEach(request=>{try{request.abort();}catch(_){}});activeReads=[];selected=null;lastTransport=transport;
  const list=sources(),ctx=currentContext(address);let index=0,empty=null,lastError=null,localTried=false;
  const localFallback=({...bootstrap(),...policy}).danmakuLocalFallback!==false;
  function readLibrary(source){
   if(source.isLocal)localTried=true;
   const ids=source.kind==='zxz'?[source.id]:[...new Set([source.id,...(source.isLocal?[ctx.legacyLocalId]:ctx.externalIds||[])].filter(Boolean))];
   let candidate=0;
   function attempt(){
    if(version!==sequence)return;
    if(candidate>=ids.length){next();return;}
    const current=candidate===0?source:withId(source,ids[candidate]);candidate++;
    readOne(current,transport,(error,rows,actual)=>{
     if(version!==sequence)return;
     if(error){lastError=error;next();return;}
     if(rows.length){applySource(actual,rows);callback(null,rows);return;}
     // New external groups retain LLQ's key format; compatibility aliases are only selected when populated.
     const creation=source.isLocal||source.kind==='zxz'||!ctx.creationId?candidate===1:actual.id===ctx.creationId;
     if(creation&&actual.canCreate&&!empty)empty={source:actual};
     attempt();
    });
   }
   attempt();
  }
  function next(){
   if(version!==sequence)return;
   if(index>=list.length){
    if(empty){applySource(empty.source,[]);callback(null,[]);return;}
    if(localFallback&&!localTried){readLibrary(describe('danmaku.php',ctx));return;}
    callback(lastError||{status:0,response:{msg:'没有可用的弹幕库，请配置允许创建空库的接口或启用本站数据库兜底'}},[]);
    return;
   }
   let source;try{source=describe(list[index++],ctx);}catch(error){lastError={status:0,response:{msg:error.message}};next();return;}
   readLibrary(source);
  }
  next();
 }
 function send(address,payload,callback,transport){
  const source=selected;
  if(!source||!source.canSend){callback(new Error('当前没有可发送的弹幕库'));return;}
  const body=source.kind==='zxz'?{player:source.writeId,text:payload.text,color:color(payload.color),time:payload.time,type:zxzModes[payload.type]??1}:{...payload,player:source.writeId};
  transport(source.sendUrl,body,(error,result)=>{
   if(error){callback(new Error(error.response?.msg||'弹幕发送失败，请检查网络后重试'));return;}
   if(result?.success===false||result?.code!==undefined&&![0,23,200].includes(Number(result.code))){callback(new Error(String(result.msg||result.message||'弹幕发送失败')));return;}
   if(!result||typeof result!=='object'||result.code===undefined&&result.success!==true){callback(new Error('弹幕发送结果无法确认'));return;}
   if(selected===source)selected.rows.push([payload.time,payload.type,payload.color,payload.author||'',payload.text,String(result.id||''),'',payload.size||'27.5px']);
   callback(null,result);
  },source.kind==='zxz'?'form':'json');
 }
 function getList(){
  const source=selected;if(!source||!lastTransport)return Promise.resolve({code:23,danum:0,danmuku:[],name:''});
  return new Promise((resolve,reject)=>readOne(source,lastTransport,(error,rows,actual)=>{
   if(error){reject(new Error(error.response?.msg||'弹幕列表暂不可用'));return;}
   if(selected!==source){reject(new Error('视频或弹幕库已切换'));return;}
   if(selected===source)selected.rows=rows;
   resolve({code:23,danum:rows.length,danmuku:rows,name:actual.name||source.name||source.id});
  }));
 }
 function report(fields){
  const source=selected;if(!source||!source.canReport)return Promise.reject(new Error('当前弹幕库未提供举报接口'));
  const target=new URL(source.base);target.searchParams.set('ac','report');Object.entries(fields).forEach(([key,value])=>target.searchParams.set(key,String(value)));
  return new Promise((resolve,reject)=>lastTransport(target.href,null,(error,result)=>{
   const success=result&&typeof result==='object'&&(result.code!==undefined&&[0,23,200].includes(Number(result.code))||result.success===true);
   if(error||!success){reject(new Error(error?.response?.msg||result?.msg||'举报未成功'));return;}
   resolve(result);
  }));
 }
 global.XplayerDanmakuSources={
  configure(options={}){
   if(Array.isArray(options.apis))configured=options.apis.filter(value=>typeof value==='string'&&value.trim()).slice(0,10);
   if(Array.isArray(options.createApis))policy.danmakuCreateApis=options.createApis;
   if(typeof options.localFallback==='boolean')policy.danmakuLocalFallback=options.localFallback;
   if(options.context)context={...context,...options.context};
  },
  updateContext(values){context={...context,...values};},
  identify,read,send,getList,report,
  getSelected(){return selected?{api:selected.base,kind:selected.kind,id:selected.id,writeId:selected.writeId,reportTitle:selected.name||selected.writeId,canSend:selected.canSend,canReport:selected.canReport,count:selected.rows.length}:null;},
  canReport(){return !!selected?.canReport;}
 };
})(window);

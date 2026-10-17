/* Keep protected service names out of shipped source, documentation and assets. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const protectedSuffixes=new Set([
 '62a587fb75c8567a6745f2a16496486d6a59ff5b5b34d6943c2a6b7f54baf21d',
 '2e7cb3f8784fa4184702d16d084351bfb663aa3586084c3d8634e4c25d52a1ec',
 'b71441efabccc1ce725ceff8077bb5a9f7b3c35f1990c0704b3245d979df44d0'
]);
const skippedDirectories=new Set(['.git','node_modules','cache','var']);
const localFiles=new Set(['includes/mysql.include.php','includes/admin.credentials.php','includes/setup.token.php']);
const textFile=/\.(?:[cm]?js|jsx|tsx?|json|map|css|html?|md|markdown|php|phtml|xml|svg|ya?ml|toml|ini|conf|config|sql|txt|sh|ps1|bat|cmd|vue|svelte)$/i;
function configuredFingerprint(root){
 const file=path.join(root,'includes/Builtin.Endpoint.php');
 if(!fs.existsSync(file))return null;
 try{
  // Parse only the data syntax emitted by the sealing tool. Never execute PHP.
  if(fs.statSync(file).size>100000)throw Error();
  const source=fs.readFileSync(file,'utf8');
  const match=source.match(/^<\?php\s*(?:\/\/[^\r\n]*(?:\r?\n|$)\s*)*return\s+array\s*\(([\s\S]*)\)\s*;\s*$/);
  if(!match)throw Error();
  const data={},entry=/\s*'(version|nonce|tag|keyShareA|keyShareB|ciphertext)'\s*=>\s*(1|'[A-Za-z0-9+/]*={0,2}')\s*,/gy;
  let offset=0,field;
  while((field=entry.exec(match[1]))){
   if(Object.hasOwn(data,field[1]))throw Error();
   data[field[1]]=field[2]==='1'?1:field[2].slice(1,-1);offset=entry.lastIndex;
  }
  if(match[1].slice(offset).trim()||Object.keys(data).length!==6||data.version!==1)throw Error();
  const bytes={};
  for(const [name,length] of Object.entries({nonce:12,tag:16,keyShareA:32,keyShareB:32,ciphertext:null})){
   const value=data[name];
   if(typeof value!=='string'||!value||value.length>16000)throw Error();
   bytes[name]=Buffer.from(value,'base64');
   if(bytes[name].toString('base64')!==value||(length===null?!bytes[name].length||bytes[name].length>12000:bytes[name].length!==length))throw Error();
  }
  const key=Buffer.from(bytes.keyShareA.map((value,index)=>value^bytes.keyShareB[index]));
  const decipher=crypto.createDecipheriv('aes-256-gcm',key,bytes.nonce,{authTagLength:16});
  // Version 1 uses the same authenticated context as BuiltinEndpoint::CONTEXT.
  decipher.setAAD(Buffer.from('Xplayer/builtin-endpoint/v1'));decipher.setAuthTag(bytes.tag);
  const endpoint=new TextDecoder('utf-8',{fatal:true}).decode(Buffer.concat([decipher.update(bytes.ciphertext),decipher.final()]));
  const address=new URL(endpoint),placeholders=endpoint.split('{url}').length-1;
  if(!/^https:\/\//i.test(endpoint)||/[\x00-\x20\x7f\\#]/.test(endpoint)||address.protocol!=='https:'||address.port||address.username||address.password||!address.search||
   !(placeholders===1&&address.search.includes('{url}')||placeholders===0&&endpoint.endsWith('=')))throw Error();
  return crypto.createHash('sha256').update(address.hostname.toLowerCase()).digest('hex');
 }catch(_){throw Error('Encrypted built-in endpoint configuration is invalid');}
}
function protectedHost(host,fingerprints,hashCache){
 const labels=host.toLowerCase().replace(/\\\./g,'.').split('.');
 for(let index=0;index<labels.length-1;index++){
  const suffix=labels.slice(index).join('.');
  if(!hashCache.has(suffix))hashCache.set(suffix,fingerprints.has(crypto.createHash('sha256').update(suffix).digest('hex')));
  if(hashCache.get(suffix))return true;
 }
 return false;
}
function scanEndpoints(root=path.resolve(__dirname,'..')){
 root=path.resolve(root);
 const fingerprints=new Set(protectedSuffixes),configured=configuredFingerprint(root),hashCache=new Map();
 if(configured)fingerprints.add(configured);
 const failures=[];let files=0;
 function walk(folder){
  for(const entry of fs.readdirSync(folder,{withFileTypes:true}).sort((left,right)=>left.name.localeCompare(right.name))){
   if(entry.isSymbolicLink())continue;
   const file=path.join(folder,entry.name),relative=path.relative(root,file).split(path.sep).join('/');
   if(entry.isDirectory()){
    if(!skippedDirectories.has(entry.name.toLowerCase()))walk(file);
    continue;
   }
   if(!entry.isFile()||localFiles.has(relative.toLowerCase())||/^\.env(?:\.|$)/i.test(entry.name))continue;
   if(!textFile.test(entry.name)&&!['.htaccess','.gitignore','.gitattributes'].includes(entry.name))continue;
   files++;
   const lines=fs.readFileSync(file,'utf8').split(/\r?\n/);
   for(const [index,line] of lines.entries()){
    // Accept ordinary domain tokens and escaped dots used in source regexes.
    const hosts=line.match(/(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\\?\.))+[a-z]{2,63}/gi)||[];
    if(hosts.some(host=>protectedHost(host,fingerprints,hashCache)))failures.push(relative+':'+(index+1));
   }
  }
 }
 walk(root);
 return {files,failures};
}
function checkEndpoints(root){
 const result=scanEndpoints(root);
 if(result.failures.length)throw Error('Protected endpoint plaintext at:\n'+result.failures.join('\n'));
 return result;
}
module.exports={scanEndpoints,checkEndpoints};
if(require.main===module){
 try{const result=checkEndpoints();console.log(`PASS: ${result.files} source, documentation and asset files contain no protected endpoint plaintext`);}
 catch(error){console.error(error.message);process.exitCode=1;}
}

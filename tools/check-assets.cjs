/* Verify shipped assets without fetching anything. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),failures=[];
function walk(folder){return fs.readdirSync(folder,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(path.join(folder,entry.name)):[path.join(folder,entry.name)]);}
const files=walk(path.join(root,'assets'));
let cssReferences=0,hashes=0;
for(const file of files.filter(file=>file.endsWith('.css'))){
 const text=fs.readFileSync(file,'utf8');
 for(const match of text.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*))\s*\)/g)){
  const reference=(match[1]??match[2]??match[3]).trim();
  if(!reference||reference.startsWith('data:')||reference.startsWith('#'))continue;
  if(/^(?:https?:)?\/\//.test(reference)){failures.push(file+': external CSS resource '+reference);continue;}
  const relative=decodeURIComponent(reference.split(/[?#]/,1)[0]);
  const target=path.resolve(reference.startsWith('/')?root:path.dirname(file),relative.replace(/^\//,''));
  cssReferences++;if(!fs.existsSync(target))failures.push(file+': missing '+reference);
 }
}
for(const pkg of JSON.parse(fs.readFileSync(path.join(root,'assets/vendor/manifest.json'),'utf8'))){
 for(const [relative,expected] of Object.entries(pkg.sha256)){
  const file=path.join(root,relative);hashes++;
  if(!fs.existsSync(file)||crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')!==expected)failures.push('Manifest mismatch: '+relative);
 }
}
for(const badge of JSON.parse(fs.readFileSync(path.join(root,'assets/player/badges/manifest.json'),'utf8'))){
 const file=path.join(root,'assets/player/badges',badge.file);hashes++;
 if(!fs.existsSync(file)||crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')!==badge.sha256)failures.push('Badge mismatch: '+badge.file);
}
for(const relative of ['index.php','admin/Head.Include.php','install/index.php']){
 const text=fs.readFileSync(path.join(root,relative),'utf8');
 for(const match of text.matchAll(/PlayerAssets::url\('([^']+)'/g)){
  if(!fs.existsSync(path.resolve(root,match[1])))failures.push(relative+': missing '+match[1]);
 }
 for(const match of text.matchAll(/(?:src|href)="([^"?<>]+\.(?:js|css|svg|png))(?=[?"])/g)){
  const reference=match[1];if(/^(?:https?:)?\/\//.test(reference)){failures.push(relative+': external UI asset '+reference);continue;}
  if(!fs.existsSync(path.resolve(root,path.dirname(relative),reference)))failures.push(relative+': missing '+reference);
 }
}
if(failures.length){console.error(failures.join('\n'));process.exitCode=1;}
else console.log(`PASS: ${cssReferences} CSS references, ${hashes} vendor hashes, page asset references`);

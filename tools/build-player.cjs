/* Deterministic build of the recovered original player; no bundler dependency/input evaluation. */
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),source=path.join(root,'src/player'),output=path.join(root,'assets/player');
fs.mkdirSync(output,{recursive:true});
// Array positions preserve the recovered module IDs; filenames describe their purpose.
const files=JSON.parse(fs.readFileSync(path.join(source,'module-manifest.json'),'utf8'));
const actual=fs.readdirSync(path.join(source,'modules')).filter(name=>name.endsWith('.js'));
if(!Array.isArray(files)||files.length!==50||new Set(files).size!==files.length||
 files.some(name=>typeof name!=='string'||!/^[a-z][a-z0-9-]*\.js$/.test(name)||!actual.includes(name))||
 actual.some(name=>!files.includes(name)))throw Error('Module manifest must name all 50 modules exactly once');
const head=`/* Xplayer Pro: recovered original modules. Build: node tools/build-player.cjs */
(function(global){'use strict';const modules=[\n`;
const tail=`\n];const cache={};
function requireModule(id){if(cache[id])return cache[id].exports;const module=cache[id]={i:id,l:false,exports:{}};modules[id].call(module.exports,module,module.exports,requireModule);module.l=true;return module.exports;}
requireModule.m=modules;requireModule.c=cache;requireModule.o=(object,key)=>Object.prototype.hasOwnProperty.call(object,key);
requireModule.d=(object,key,get)=>{if(!requireModule.o(object,key))Object.defineProperty(object,key,{configurable:false,enumerable:true,get});};
requireModule.n=module=>{const get=module&&module.__esModule?()=>module.default:()=>module;requireModule.d(get,'a',get);return get;};
requireModule.p='/';requireModule.s=5;global.xplayer=requireModule(5).default;
})(window);\n`;
fs.writeFileSync(path.join(output,'common.js'),head+files.map(name=>fs.readFileSync(path.join(source,'modules',name),'utf8').trim().replace('module.exports = ', '').replace(/;$/, '')).join(',\n')+tail);
for(const [input,dest] of [['controller.js','config.js'],['contextmenu.js','contextmenu.js'],['contextmenu.css','contextmenu.css'],['compatibility.js','compatibility.js'],['start.js','start.js']])fs.copyFileSync(path.join(source,input),path.join(output,dest));
for(const file of ['controls.js','controls.css','progress.js','progress.css','playback-settings.js','playback-settings.css','picture-in-picture.js','picture-in-picture.css'])fs.copyFileSync(path.join(source,file),path.join(output,file));
for(const file of ['loading.js','loading.css'])fs.copyFileSync(path.join(source,file),path.join(output,file));
fs.copyFileSync(path.join(source,'danmaku-sources.js'),path.join(output,'danmaku-sources.js'));
fs.copyFileSync(path.join(source,'visibility.js'),path.join(output,'visibility.js'));
for(const file of ['danmaku-content.js','danmaku-content.css'])fs.copyFileSync(path.join(source,file),path.join(output,file));
fs.mkdirSync(path.join(output,'badges'),{recursive:true});
for(const file of fs.readdirSync(path.join(source,'badges')))fs.copyFileSync(path.join(source,'badges',file),path.join(output,'badges',file));
fs.writeFileSync(path.join(output,'loading-animation-data.js'),'window.XplayerLoadingAnimation='+JSON.stringify(JSON.parse(fs.readFileSync(path.join(source,'loading-animation.json'),'utf8')))+';\n');
fs.writeFileSync(path.join(output,'control-icon-data.js'),'window.XplayerControlIconData='+JSON.stringify(JSON.parse(fs.readFileSync(path.join(source,'control-icons.json'),'utf8')))+';\n');
fs.copyFileSync(path.join(source,'sign.png'),path.join(output,'sign.png'));
require('./check-endpoints.cjs').checkEndpoints(root);
console.log('Built original core + controller + local bridge');

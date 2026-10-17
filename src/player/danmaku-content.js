/* Decode supported source badges into local image nodes. Never insert provider HTML. */
(function(global){
 'use strict';
 const names={
  '20181108_ca3106lt79':'v1','20181108_zozlj6h3sx':'v2','20181108_dcd42cbb8t':'v3',
  '20181108_kmvs8c81wgf':'v4','20181108_9emyfllpvo5':'v5','20181108_modlxx19wxm':'v6',
  '20181108_vrbs64jccp':'v7','20190430_j2554xpzpqp':'starlight'
 };
 const base=new URL('assets/player/badges/',document.baseURI).href,cache=new Map();
 const badgeWidth=350/177+.15;
 function decode(text){
  const named={amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '};
  return text.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi,(whole,value)=>{
   if(value[0]!=='#')return named[value.toLowerCase()];
   const code=parseInt(value.slice(/^#x/i.test(value)?2:1),/^#x/i.test(value)?16:10);
   return code>0&&code<=0x10ffff&&(code<0xd800||code>0xdfff)?String.fromCodePoint(code):'\ufffd';
  });
 }
 function attribute(tag,name){
  const match=tag.match(new RegExp('(?:^|\\s)'+name+'\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))','i'));
  return match?decode(match[1]??match[2]??match[3]):'';
 }
 function parts(value){
  const raw=String(value??'');if(cache.has(raw))return cache.get(raw);
  const result=[];let end=0;
  for(const match of raw.matchAll(/<img\b[^>]*>/gi)){
   if(match.index>end)result.push({text:decode(raw.slice(end,match.index))});
   let name='';
   try{
    const url=new URL(attribute(match[0],'src'),document.baseURI);
    const id=url.pathname.match(/^\/vupload\/0\/([a-zA-Z0-9_]+)\/0$/)?.[1];
    if(/^https?:$/.test(url.protocol)&&url.hostname==='puui.qpic.cn'&&!url.username&&!url.password&&!url.port&&!url.search&&!url.hash)name=names[id]||'';
   }catch(_){}
   if(name)result.push({badge:name,src:base+'tencent-'+name+'.png',alt:name==='starlight'?'星光':name.toUpperCase()});
   else{const alt=attribute(match[0],'alt').slice(0,80);if(alt)result.push({text:alt});}
   end=match.index+match[0].length;
  }
  if(end<raw.length)result.push({text:decode(raw.slice(end))});
  if(cache.size>=1000)cache.delete(cache.keys().next().value);
  cache.set(raw,result);return result;
 }
 function render(target,value){
  const doc=target.ownerDocument;target.replaceChildren();
  for(const part of parts(value)){
   if(part.badge){
    const img=doc.createElement('img');img.className='xplayer-danmaku-badge';img.alt=part.alt;
    img.width=140;img.height=118;img.draggable=false;img.src=part.src;target.append(img);
   }else target.append(doc.createTextNode(part.text));
  }
 }
 function fontSize(value,doc=document){
  const match=String(value||'27.5px').trim().match(/^(\d+(?:\.\d+)?)(px|rem|em)$/i);
  if(!match)return 27.5;
  const root=parseFloat(doc.defaultView.getComputedStyle(doc.documentElement).fontSize)||16;
  return Math.max(12,Math.min(50,Number(match[1])*(match[2].toLowerCase()==='px'?1:root)));
 }
 global.XplayerDanmakuContent={
  parts,render,fontSize,
  plainText(value){return parts(value).map(part=>part.badge?'['+part.alt+']':part.text).join('');},
  measure(context,value,size){return parts(value).reduce((width,part)=>width+(part.badge?size*badgeWidth:context.measureText(part.text).width),0);}
 };
})(window);

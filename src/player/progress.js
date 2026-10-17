/* Independent, muted frame previews and a histogram of loaded danmaku times. */
(function(global){
 'use strict';
 const NS='http://www.w3.org/2000/svg';
 const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
 const stamp=value=>{const seconds=Math.max(0,Math.floor(value)),hours=Math.floor(seconds/3600);return(hours?hours+':':'')+String(Math.floor(seconds/60)%60).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');};
 global.XplayerProgress={attach(player){
  if(player.progressFeatures)return player.progressFeatures;
  const bar=player.template.barWrap,preview=player.template.barPreview;
  if(!bar||!preview)return;
  let destroyed=false,active=false,generation=0,wanted=0,wantedX=0,source='',clone=null,hls=null,ready=null,failed=false,processing=false,timer=0,lastStart=0,densityTimer=0;
  let cancellation=new AbortController();
  const cache=new Map(),listeners=[],playerListeners=[];
  const density=document.createElement('div');density.className='xplayer-progress-density';density.setAttribute('role','img');
  const svg=document.createElementNS(NS,'svg');svg.setAttribute('viewBox','0 0 1000 30');svg.setAttribute('preserveAspectRatio','none');
  const area=document.createElementNS(NS,'path');area.dataset.role='area';svg.append(area);density.append(svg);bar.prepend(density);
  const canvas=document.createElement('canvas');canvas.className='xplayer-bar-preview-canvas xplayer-progress-frame';canvas.width=192;canvas.height=108;
  const label=document.createElement('span');label.className='xplayer-progress-preview-time';
  preview.classList.add('xplayer-progress-preview');preview.replaceChildren(canvas,label);preview.dataset.state='loading';
  function on(node,event,callback,options){node.addEventListener(event,callback,options);listeners.push(()=>node.removeEventListener(event,callback,options));}
  function onPlayer(event,callback){player.on(event,callback);playerListeners.push([event,callback]);}
  function duration(){const value=Number(player.video.duration);return Number.isFinite(value)&&value>0?value:0;}
  function mediaSource(){
   const candidates=[player.mediaEngine&&player.mediaEngine.url,player.video.currentSrc,player.video.src,player.quality&&player.quality.url,player.options.video.url];
   return candidates.find(value=>typeof value==='string'&&/^https?:/i.test(value))||'';
  }
  function refreshDensity(){
   if(destroyed)return;
   const length=duration(),count=length?clamp(Math.ceil(length/5),24,160):0,bins=Array(count).fill(0);
   for(const row of player.danmaku&&Array.isArray(player.danmaku.dan)?player.danmaku.dan:[]){
    const raw=Array.isArray(row)?row[0]:row&&row.time;if(raw===null||raw===undefined||raw==='')continue;const time=Number(raw);
    if(count&&Number.isFinite(time)&&time>=0&&time<=length)bins[Math.min(count-1,Math.floor(time/length*count))]++;
   }
   const total=bins.reduce((a,b)=>a+b,0);density.dataset.count=String(total);density.dataset.bins=JSON.stringify(bins);density.dataset.duration=String(length);
   density.setAttribute('aria-label','弹幕密度，'+total+'条弹幕');
   // A symmetric weighted average smooths measured bins; an empty source stays flat.
   const values=bins.map((_,index)=>{let sum=0,weight=0;for(let offset=-2;offset<=2;offset++){const position=index+offset;if(position>=0&&position<count){const w=3-Math.abs(offset);sum+=bins[position]*w;weight+=w;}}return sum/weight;});
   const maximum=Math.max(0,...values),points=values.map((value,index)=>({x:(index+.5)/count*1000,y:maximum?30-26*value/maximum:30}));
   points.push({x:1000,y:30});let path='M 0 30';
   for(let index=0;index<points.length-1;index++){const point=points[index],next=points[index+1];path+=' Q '+point.x.toFixed(2)+' '+point.y.toFixed(2)+' '+((point.x+next.x)/2).toFixed(2)+' '+((point.y+next.y)/2).toFixed(2);}
   path+=' L 1000 30 Z';area.setAttribute('d',path);
  }
  function queueDensity(){clearTimeout(densityTimer);densityTimer=setTimeout(refreshDensity,0);}
  function releaseMedia(){
   generation++;cancellation.abort();cancellation=new AbortController();ready=null;failed=false;cache.clear();
   if(hls){hls.destroy();hls=null;}
   if(clone){clone.pause();clone.removeAttribute('src');clone.load();clone.remove();clone=null;}
   preview.dataset.state='loading';delete preview.dataset.frameTime;
  }
  function syncSource(){const next=mediaSource();if(next!==source){releaseMedia();source=next;}return source;}
  function waitMedia(video,predicate,events,timeout=10000){
   return new Promise((resolve,reject)=>{
    const signal=cancellation.signal;let timeoutId;
    const cleanup=()=>{clearTimeout(timeoutId);events.forEach(event=>video.removeEventListener(event,check));video.removeEventListener('error',error);signal.removeEventListener('abort',abort);};
    const finish=error=>{cleanup();error?reject(error):resolve();};
    const check=()=>{if(predicate())finish();};
    const error=()=>finish(new Error('Preview media unavailable'));
    const abort=()=>finish(new Error('Preview cancelled'));
    if(signal.aborted){abort();return;}
    events.forEach(event=>video.addEventListener(event,check));video.addEventListener('error',error);signal.addEventListener('abort',abort,{once:true});
    timeoutId=setTimeout(error,timeout);check();
   });
  }
  function ensureMedia(){
   if(ready)return ready;
   const address=syncSource();if(!address)return Promise.reject(new Error('Preview source unavailable'));
   clone=document.createElement('video');clone.className='xplayer-preview-source';clone.muted=true;clone.defaultMuted=true;clone.volume=0;clone.playsInline=true;clone.preload='metadata';clone.crossOrigin='anonymous';clone.disableRemotePlayback=true;
   clone.setAttribute('aria-hidden','true');clone.tabIndex=-1;player.container.append(clone);
   const video=clone;
   ready=waitMedia(video,()=>video.readyState>=1,['loadedmetadata','loadeddata']);
   if((player.type==='hls'||/\.m3u8(?:[?#]|$)/i.test(address))&&!video.canPlayType('application/vnd.apple.mpegurl')&&global.Hls&&Hls.isSupported()){
    hls=new Hls({startPosition:wanted,startLevel:0,maxBufferLength:4,maxMaxBufferLength:6,backBufferLength:0});
    hls.on(Hls.Events.ERROR,(_,data)=>{if(data.fatal&&clone===video)video.dispatchEvent(new Event('error'));});hls.loadSource(address);hls.attachMedia(video);
   }else{video.src=address;video.load();}
   return ready;
  }
  function sizePreview(){
   const ratio=player.video.videoWidth&&player.video.videoHeight?player.video.videoWidth/player.video.videoHeight:16/9;
   let width=Math.min(192,Math.max(80,player.container.clientWidth-24)),height=width/ratio;
   if(height>140){height=140;width=height*ratio;}
   canvas.width=Math.round(width);canvas.height=Math.round(height);preview.style.width=Math.round(width)+'px';
   preview.style.left=clamp(wantedX-width/2,0,Math.max(0,bar.clientWidth-width))+'px';
  }
  function showFrame(frame,key){
   if(!active||destroyed)return;
   sizePreview();canvas.getContext('2d').drawImage(frame,0,0,canvas.width,canvas.height);preview.dataset.frameTime=String(key);preview.dataset.state='ready';
  }
  function keyTime(){return Math.round(Math.min(wanted,Math.max(0,duration()-.05))*2)/2;}
  function schedule(){
   if(!active||destroyed||processing||failed)return;
   clearTimeout(timer);timer=setTimeout(render,Math.max(0,160-(performance.now()-lastStart)));
  }
  async function render(){
   if(!active||destroyed||processing||failed)return;
   syncSource();const key=keyTime(),ticket=generation;
   if(cache.has(key)){showFrame(cache.get(key),key);return;}
   processing=true;lastStart=performance.now();
   try{
    await ensureMedia();if(destroyed||ticket!==generation)return;
    const video=clone,target=clamp(key,0,Math.max(0,video.duration-.05));
    if(hls)hls.startLoad(target);
    if(Math.abs(video.currentTime-target)>.03||video.readyState<2){
     video.currentTime=target;
     await waitMedia(video,()=>!video.seeking&&video.readyState>=2&&Math.abs(video.currentTime-target)<.15,['seeked','loadeddata','canplay']);
    }
    if(destroyed||ticket!==generation)return;
    const frame=document.createElement('canvas'),ratio=video.videoWidth/video.videoHeight;frame.width=Math.max(1,Math.round(Math.min(192,140*ratio)));frame.height=Math.max(1,Math.round(frame.width/ratio));
    const context=frame.getContext('2d');context.drawImage(video,0,0,frame.width,frame.height);
    // Reading one pixel detects a tainted cross-origin canvas without changing the main video.
    context.getImageData(0,0,1,1);cache.set(key,frame);if(cache.size>24)cache.delete(cache.keys().next().value);
    if(active&&key===keyTime())showFrame(frame,key);
   }catch(error){if(!destroyed&&ticket===generation){failed=true;preview.dataset.state='unavailable';delete preview.dataset.frameTime;}}
   finally{if(hls)hls.stopLoad();processing=false;if(active&&!failed&&(ticket!==generation||key!==keyTime()))schedule();}
  }
  function move(event){
   const length=duration();if(!length||destroyed)return;
   const point=event.touches&&event.touches[0]||event.changedTouches&&event.changedTouches[0]||event;
   const box=bar.getBoundingClientRect();if(!box.width)return;
   syncSource();active=true;const position=clamp((point.clientX-box.left)/box.width,0,1);wantedX=position*bar.clientWidth;wanted=position*length;
   preview.dataset.time=String(wanted);label.textContent=stamp(wanted);sizePreview();preview.style.display='block';bar.classList.add('xplayer-progress-hover');
   const key=keyTime();if(cache.has(key))showFrame(cache.get(key),key);else{preview.dataset.state=failed?'unavailable':'loading';delete preview.dataset.frameTime;schedule();}
  }
  function hide(){active=false;clearTimeout(timer);preview.style.display='none';bar.classList.remove('xplayer-progress-hover');}
  function sourceChanged(){hide();syncSource();queueDensity();}
  function destroy(){
   if(destroyed)return;destroyed=true;hide();clearTimeout(densityTimer);releaseMedia();listeners.forEach(remove=>remove());
   playerListeners.forEach(([event,callback])=>{if(event!=='destroy'&&player.events.events[event])player.events.events[event]=player.events.events[event].filter(fn=>fn!==callback);});
   density.remove();preview.replaceChildren();preview.classList.remove('xplayer-progress-preview');delete player.progressFeatures;
  }
  on(bar,'pointermove',move,{passive:true});on(bar,'pointerenter',move,{passive:true});on(bar,'pointerleave',hide);on(bar,'touchmove',move,{passive:true});on(bar,'touchend',hide,{passive:true});on(bar,'touchcancel',hide,{passive:true});
  onPlayer('danmaku_load_start',queueDensity);onPlayer('danmaku_load_end',queueDensity);onPlayer('danmaku_send',queueDensity);onPlayer('danmaku_clear',queueDensity);
  onPlayer('loadedmetadata',()=>{sourceChanged();sizePreview();});onPlayer('durationchange',queueDensity);onPlayer('loadstart',sourceChanged);onPlayer('quality_start',sourceChanged);onPlayer('resize',()=>{sizePreview();queueDensity();});onPlayer('destroy',destroy);
  const api={destroy,refreshDensity};player.progressFeatures=api;syncSource();refreshDensity();return api;
 }};
})(window);

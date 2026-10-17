/* Verify frame presentation after visibility/focus changes without reloading media. */
(function(global){
 'use strict';
 global.XplayerVisibility={attach(player){
  if(player.visibilityFeatures)return player.visibilityFeatures;
  let destroyed=false,video=null,owner=null,ownerDocument=null,frameRequest=0,frameGeneration=0,generation=0,probe=null;
  let callbacks=0,lastFrameAt=0,lastMediaTime=null,cadence=[],buffering=false,lastRepairAt=0,repairs=0;
  const ownerListeners=[],videoListeners=[],permanent=[],playerListeners=[];
  const state={reason:'idle',strategy:null,lastRepairMediaTime:null};
  function listen(list,target,event,callback,options){target.addEventListener(event,callback,options);list.push(()=>target.removeEventListener(event,callback,options));}
  function remove(list){list.splice(0).forEach(callback=>callback());}
  function source(){return video&&(video.currentSrc||video.src)||'';}
  function surfaceVisible(){
   if(!video||!ownerDocument)return false;
   return ownerDocument.visibilityState==='visible'||ownerDocument.pictureInPictureElement===video;
  }
  function running(){return !destroyed&&video===player.video&&surfaceVisible()&&!video.paused&&!video.ended&&!video.seeking&&video.playbackRate>0&&video.readyState>=2&&!video.error;}
  function eligible(){
   if(!running()||buffering&&video.readyState<3||!video.videoWidth||!video.videoHeight||player.audioReloading||player.switchingQuality||player.time?.enableprogressChecker===false)return false;
   if(Number.isFinite(video.duration)&&video.duration-video.currentTime<.15)return false;
   if(ownerDocument.pictureInPictureElement===video)return true;
   if(typeof video.checkVisibility==='function'&&!video.checkVisibility({opacityProperty:true,visibilityProperty:true}))return false;
   const bounds=video.getBoundingClientRect(),style=owner.getComputedStyle(video);
   return video.isConnected&&bounds.width>0&&bounds.height>0&&style.display!=='none'&&style.visibility==='visible'&&Number(style.opacity)>0;
  }
  function frameMetric(){
   if(typeof video.requestVideoFrameCallback==='function')return {kind:'presented',count:callbacks};
   try{const frames=video.getVideoPlaybackQuality?.().totalVideoFrames;if(Number.isFinite(frames))return {kind:'decoded',count:frames};}catch(_){}
   return Number.isFinite(video.webkitDecodedFrameCount)?{kind:'decoded',count:video.webkitDecodedFrameCount}:null;
  }
  function cancelFrame(){
   frameGeneration++;
   if(frameRequest&&video){try{video.cancelVideoFrameCallback?.(frameRequest);}catch(_){}frameRequest=0;}
  }
  function watchFrames(){
   if(frameRequest||!running()||typeof video.requestVideoFrameCallback!=='function')return;
   const watched=video,version=frameGeneration;
   try{frameRequest=watched.requestVideoFrameCallback((_,metadata)=>{
    if(destroyed||video!==watched||version!==frameGeneration)return;frameRequest=0;
    const now=Date.now(),mediaTime=Number(metadata.mediaTime);
    if(lastFrameAt&&lastMediaTime!==null&&mediaTime>lastMediaTime){
     // Media timestamps avoid interpreting a background scheduling pause as low FPS.
     const interval=(mediaTime-lastMediaTime)/Math.max(.1,watched.playbackRate)*1000;
     if(interval>0&&interval<15000){cadence.push(interval);if(cadence.length>12)cadence.shift();}
    }
    callbacks++;lastFrameAt=now;if(Number.isFinite(mediaTime))lastMediaTime=mediaTime;
    watchFrames();
   });}catch(_){frameRequest=0;}
  }
  function cancelProbe(){
   generation++;
   if(probe){try{probe.owner.clearTimeout(probe.timer);}catch(_){}probe=null;}
  }
  function later(callback,delay,version){
   const host=owner;
   const timer=host.setTimeout(()=>{if(destroyed||version!==generation)return;probe=null;callback();},delay);
   probe={owner:host,timer};
  }
  function windowLength(){
   if(!cadence.length)return 2500;
   const ordered=cadence.slice().sort((a,b)=>a-b),interval=ordered[Math.floor(ordered.length/2)];
   return Math.max(1500,Math.min(15000,interval*3));
  }
  function inSeekableRange(time){
   for(let index=0;index<video.seekable.length;index++)if(time>=video.seekable.start(index)&&time<=video.seekable.end(index))return true;
   return false;
  }
  function recover(version,snapshot){
   if(version!==generation||!eligible()||source()!==snapshot.source||Date.now()-lastRepairAt<10000)return;
   const position=video.currentTime;
   if(!Number.isFinite(position)||!inSeekableRange(position)){state.reason='not-seekable';return;}
   // Assigning the current position refreshes the decoder/compositor route. It never
   // calls play(), reloads src, changes volume/rate, or creates an audio source node.
   try{
    video.currentTime=position;
    repairs++;lastRepairAt=Date.now();state.reason='frame-recovery';state.strategy='same-time-seek';state.lastRepairMediaTime=position;
    player.container?.dispatchEvent(new global.CustomEvent('xplayer:frame-recovery',{detail:{reason:'presentation-stalled',strategy:'same-time-seek',mediaTime:position}}));
   }catch(_){state.reason='seek-unavailable';}
  }
  function measure(version){
   if(version!==generation||!eligible())return;
   const metric=frameMetric();if(!metric){state.reason='no-frame-counter';return;}
   const snapshot={metric,time:video.currentTime,source:source(),started:Date.now()};
   state.reason='checking';
   later(()=>{
    if(!eligible()||source()!==snapshot.source)return;
    const current=frameMetric(),advance=video.currentTime-snapshot.time;
    if(!current||current.kind!==metric.kind||current.count>metric.count){state.reason='frames-moving';return;}
    // Lack of new frames alone is normal for paused/buffering/very low-frame-rate media.
    if(advance<Math.max(.25,.6*video.playbackRate)){state.reason='clock-not-advancing';return;}
    recover(version,snapshot);
   },windowLength(),version);
  }
  function check(reason='visible'){
   if(destroyed)return;
   syncOwner();cancelProbe();cancelFrame();lastFrameAt=0;lastMediaTime=null;
   if(!eligible()){state.reason=surfaceVisible()?'inactive':'hidden';return;}
   watchFrames();state.reason=reason;
   const version=generation;
   // Give the browser time to restore an occluded surface before taking a baseline.
   later(()=>measure(version),450,version);
  }
  function resetMedia(){
   cancelProbe();cancelFrame();callbacks=0;lastFrameAt=0;lastMediaTime=null;cadence=[];state.reason='media-changing';
  }
  function syncOwner(){
   const current=player.video;if(!current||destroyed)return;
   if(current!==video){
    resetMedia();remove(videoListeners);video=current;buffering=false;
    listen(videoListeners,video,'pause',()=>{cancelProbe();cancelFrame();state.reason='paused';});
    listen(videoListeners,video,'ended',()=>{cancelProbe();cancelFrame();state.reason='ended';});
    listen(videoListeners,video,'seeking',()=>{cancelProbe();cancelFrame();lastFrameAt=0;lastMediaTime=null;});
    listen(videoListeners,video,'seeked',()=>check('seeked'));
    listen(videoListeners,video,'playing',()=>{buffering=false;check('playing');});
    listen(videoListeners,video,'canplay',()=>{buffering=false;watchFrames();});
    listen(videoListeners,video,'waiting',()=>{buffering=true;cancelProbe();});
    listen(videoListeners,video,'stalled',()=>{buffering=true;cancelProbe();});
    listen(videoListeners,video,'loadstart',resetMedia);
    listen(videoListeners,video,'emptied',resetMedia);
    listen(videoListeners,video,'enterpictureinpicture',()=>check('native-pip'));
    listen(videoListeners,video,'leavepictureinpicture',()=>check('native-pip-return'));
   }
   const document=current.ownerDocument,window=document.defaultView;
   if(document!==ownerDocument){
    cancelProbe();cancelFrame();remove(ownerListeners);ownerDocument=document;owner=window;lastFrameAt=0;lastMediaTime=null;
    listen(ownerListeners,document,'visibilitychange',()=>{if(surfaceVisible())check('visible');else{cancelProbe();cancelFrame();state.reason='hidden';}});
    listen(ownerListeners,window,'focus',()=>check('focus'));
    listen(ownerListeners,window,'blur',()=>{cancelProbe();state.reason='blurred';});
    listen(ownerListeners,window,'pageshow',()=>check('pageshow'));
    listen(ownerListeners,window,'resize',()=>check('resize'));
   }
  }
  function onPlayer(event,callback){player.on(event,callback);playerListeners.push([event,callback]);}
  function destroy(){
   if(destroyed)return;destroyed=true;cancelProbe();cancelFrame();remove(ownerListeners);remove(videoListeners);remove(permanent);
   playerListeners.forEach(([event,callback])=>{if(event!=='destroy'&&player.events?.events[event])player.events.events[event]=player.events.events[event].filter(item=>item!==callback);});
   if(player.visibilityFeatures===api)delete player.visibilityFeatures;state.reason='destroyed';
  }
  const api={check,destroy,getState(){return {...state,repairs,frameCallbacks:callbacks,lastFrameAt,lastMediaTime,visible:surfaceVisible(),watching:!!probe};}};
  player.visibilityFeatures=api;
  listen(permanent,player.container,'xplayer:pip-change',()=>check('pip-surface'));
  // A visible Document PiP window may remain unfocused when the user returns to its opener.
  listen(permanent,global,'focus',()=>{if(owner!==global)check('opener-focus');});
  listen(permanent,global.document,'visibilitychange',()=>{if(owner!==global&&global.document.visibilityState==='visible')check('opener-visible');});
  onPlayer('quality_start',()=>{syncOwner();check('quality-change');});onPlayer('quality_end',()=>check('quality-ready'));onPlayer('loadedmetadata',()=>check('metadata'));onPlayer('destroy',destroy);
  syncOwner();check('attached');return api;
 }};
})(window);

/* Original Xplayer animation data and desktop skin, served entirely locally. */
(function(global){
 'use strict';
 global.XplayerControls={attach(player){
  if(!global.lottie||!global.XplayerControlIconData)return;
  const animations=new Map(),cleanup=[];
  const theme=document.createElement('style'),color=player.options.theme;
  player.container.style.setProperty('--xplayer-theme',color);
  theme.textContent=`.xplayer-setting-speeds:hover .title,.xplayer .xplayer-controller .xplayer-icons.xplayer-comment-box .yzm-xplayer-send-icon,.showdan-setting .xplayer-toggle input:checked+label,.xplayer-volume-bar-inner,.xplayer-thumb,.xplayer-played,.xplayer-danmaku-bar-inner,.xplayer-controller .xplayer-icons .xplayer-toggle input:checked+label,.xplayer label.checked,.xplayer-comment-setting-type input:checked+span,.xplayer-comment-setting-font input:checked+span{background-color:${color}!important}.xplayer-controller .xplayer-icons .xplayer-toggle input+label:after,.xplayer .memory-play .play-jump,.xplayer-bezel,.xplayer-setting-speed-item:hover .xplayer-label{color:${color}!important}`;
  player.container.append(theme);cleanup.push(()=>theme.remove());
  function render(selector,id){
   const node=player.container.querySelector(selector);if(!node)return;
   const previous=animations.get(node);if(previous){previous.animation.destroy();node.removeEventListener('mouseenter',previous.hover);}
   node.replaceChildren();
   const animation=lottie.loadAnimation({container:node,renderer:'svg',loop:false,autoplay:false,animationData:JSON.parse(JSON.stringify(XplayerControlIconData[id]))});
   const hover=()=>animation.goToAndPlay(0,true);node.addEventListener('mouseenter',hover);
   animation.addEventListener('complete',()=>animation.goToAndStop(0,true));
   animations.set(node,{animation,hover});node.dataset.originalIcon=id;
  }
  render('.xplayer-full-icon span','1');render('.xplayer-fulloff-icon span','1');render('.xplayer-setting-icon span','8');
  const picture=()=>render('.xplayer-full-in-icon span',document.pictureInPictureElement?'6':'5');picture();
  player.video.addEventListener('enterpictureinpicture',picture);player.video.addEventListener('leavepictureinpicture',picture);
  const volume=()=>{
   const node=player.template.volumeIcon,muted=player.video.muted||player.video.volume===0;
   if(muted){const item=animations.get(node);if(item){const fallback=node.innerHTML;item.animation.destroy();node.innerHTML=fallback;node.removeEventListener('mouseenter',item.hover);animations.delete(node);}delete node.dataset.originalIcon;return;}
   render('.xplayer-volume-icon span','4');
  };
  volume();player.video.addEventListener('volumechange',volume);
  cleanup.push(()=>player.video.removeEventListener('volumechange',volume),()=>player.video.removeEventListener('enterpictureinpicture',picture),()=>player.video.removeEventListener('leavepictureinpicture',picture));
  player.on('destroy',()=>{cleanup.forEach(run=>run());animations.forEach(({animation,hover},node)=>{node.removeEventListener('mouseenter',hover);animation.destroy();});animations.clear();});
 }};
})(window);

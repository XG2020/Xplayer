/* Local copy of the original Xplayer loading animation; no remote bootstrap. */
(function(global){
 'use strict';
 const host=document.getElementById('xplayer-loading');if(!host)return;
 const picture=document.createElement('div');picture.className='xplayer-loading-animation';picture.setAttribute('aria-hidden','true');
 const status=document.createElement('p');status.className='xplayer-loading-status';status.textContent='正在准备视频';host.replaceChildren(picture,status);
 const animation=global.lottie&&global.XplayerLoadingAnimation?lottie.loadAnimation({container:picture,renderer:'svg',loop:true,autoplay:true,animationData:JSON.parse(JSON.stringify(global.XplayerLoadingAnimation))}):null;
 global.XplayerLoading={show(message){host.hidden=false;status.textContent=message||'正在加载视频';animation?.play();},hide(){host.hidden=true;animation?.pause();}};
 global.addEventListener('pagehide',()=>animation?.destroy(),{once:true});
})(window);

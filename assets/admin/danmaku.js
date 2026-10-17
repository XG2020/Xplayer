/* Local moderation only. All writes require the existing admin session and CSRF token. */
(() => {
 'use strict';
 const root=document.getElementById('danmaku-management');if(!root)return;
 const find=id=>document.getElementById(id),form=find('dm-search'),body=find('dm-rows'),dialog=find('dm-confirm');
 const csrf=document.querySelector('meta[name="xplayer-csrf"]')?.content||'';
 const selected=new Set();
 let rows=[],page=1,pages=1,reading=false,writing=false,ready=false,sequence=0,readController=null,pending=null,returnFocus=null;
 let filters={keyword:'',player:'',reported:'0'};
 const linkedPlayer=new URLSearchParams(location.search).get('player');
 if(linkedPlayer!==null){filters.player=linkedPlayer;form.elements.player.value=linkedPlayer;}
 function rememberPlayer(){const address=new URL(location.href);if(filters.player)address.searchParams.set('player',filters.player);else address.searchParams.delete('player');history.replaceState(null,'',address);}
 const element=(tag,text,className)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=String(text);if(className)node.className=className;return node;};
 function feedback(message,error=false){const box=find('dm-feedback');box.textContent=message;box.classList.toggle('error',error);box.hidden=!message;}
 function selection(){return rows.filter(row=>selected.has(row.id));}
 function sync(){
  const chosen=selection(),blocked=reading||writing||!ready,all=find('dm-select-page');
  all.disabled=blocked||!rows.length;all.checked=!!rows.length&&chosen.length===rows.length;all.indeterminate=chosen.length>0&&chosen.length<rows.length;
  find('dm-selection').textContent=chosen.length?'已选择本页 '+chosen.length+' 条弹幕':'未选择弹幕';
  find('dm-delete-selected').disabled=blocked||!chosen.length;
  find('dm-dismiss-selected').disabled=blocked||!chosen.some(row=>row.reportCount>0);
  find('dm-prev').disabled=blocked||page<=1;find('dm-next').disabled=blocked||page>=pages;
  find('dm-refresh').disabled=writing;
  body.querySelectorAll('input,button').forEach(control=>{control.disabled=blocked;});
  form.querySelectorAll('input,select,button').forEach(control=>{control.disabled=writing;});
  find('dm-results').setAttribute('aria-busy',String(reading||writing));
 }
 async function post(fields,signal){
  const response=await fetch('./api.php',{method:'POST',credentials:'same-origin',headers:{'X-CSRF-Token':csrf,'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body:new URLSearchParams(fields),signal});
  let result;try{result=await response.json();}catch(_){throw Error('后台返回了异常响应，请刷新页面或重新登录后再试');}
  if(!response.ok||result.code!==200)throw Error(result.msg||'操作失败，请稍后重试');
  return result;
 }
 function empty(message){const row=element('tr'),cell=element('td',message,'dm-empty');cell.colSpan=7;row.append(cell);body.replaceChildren(row);}
 function clock(value){const seconds=Math.max(0,Number(value)||0),whole=Math.floor(seconds),hours=Math.floor(whole/3600);return(hours?hours+':':'')+String(Math.floor(whole/60)%60).padStart(2,'0')+':'+String(whole%60).padStart(2,'0');}
 function timestamp(value,compact=false){
  const date=new Date(Number(value)*1000),node=element('time');
  if(!Number.isFinite(date.getTime())){node.textContent='—';return node;}
  node.dateTime=date.toISOString();node.title=date.toLocaleString('zh-CN');
  node.append(document.createTextNode(date.toLocaleDateString('zh-CN')));
  node.append(compact?document.createTextNode(' '):element('br'));
  node.append(document.createTextNode(date.toLocaleTimeString('zh-CN',{hour12:false})));return node;
 }
 function action(label,name,id,className){const button=element('button',label,className);button.type='button';button.dataset.dmAction=name;button.dataset.id=id;return button;}
 function render(){
  body.replaceChildren();
  if(!rows.length){empty(filters.keyword||filters.player||filters.reported==='1'?'没有符合条件的弹幕，请调整筛选条件。':'本站还没有弹幕，使用本地弹幕库发送后会显示在这里。');return;}
  for(const row of rows){
   const tr=element('tr'),checkCell=element('td',undefined,'dm-check'),checkbox=element('input');
   checkbox.type='checkbox';checkbox.value=row.id;checkbox.dataset.dmSelect=row.id;checkbox.setAttribute('aria-label','选择弹幕 '+row.id);checkCell.append(checkbox);
   const contentCell=element('td');contentCell.append(element('div',row.content,'dm-content'),element('span',row.author+' · #'+row.id,'dm-meta'));
   const videoCell=element('td'),video=action(row.playerId,'filter',row.id,'dm-video');video.title='只看此视频的弹幕';videoCell.append(video);
   const position=element('td');position.append(element('span',clock(row.time)));position.title=String(row.time)+' 秒';
   const mode=element('span',undefined,'dm-meta dm-mode'),swatch=element('i',undefined,'dm-color');swatch.setAttribute('aria-hidden','true');
   if(/^#[\da-f]{6}$/i.test(row.color))swatch.style.backgroundColor=row.color;
   mode.append(swatch,document.createTextNode(({right:'滚动',top:'顶部',bottom:'底部'})[row.mode]||row.mode));position.append(mode);
   const created=element('td',undefined,'dm-date');created.append(timestamp(row.createdAt));
   const reported=element('td');
   if(row.reportCount>0){
    const details=element('details',undefined,'dm-reports'),summary=element('summary',row.reportCount+' 条举报'),list=element('ul');
    for(const report of row.reports){const item=element('li');item.append(document.createTextNode(report.reason),timestamp(report.createdAt,true));list.append(item);}
    details.append(summary,list);if(row.reportCount>row.reports.length)details.append(element('small','显示最近 '+row.reports.length+' 条','dm-meta'));reported.append(details);
   }else reported.append(element('span','无','dm-meta'));
   const actions=element('td'),buttons=element('div',undefined,'dm-row-actions');buttons.append(action('删除','delete',row.id,'dm-delete'));
   if(row.reportCount>0)buttons.append(action('忽略举报','dismiss',row.id));actions.append(buttons);
   tr.append(checkCell,contentCell,videoCell,position,created,reported,actions);body.append(tr);
  }
 }
 async function load(target=1,keepFeedback=false){
  if(writing)return;
  const ticket=++sequence;readController?.abort();readController=new AbortController();const controller=readController;
  const timer=setTimeout(()=>controller.abort(),20000);reading=true;ready=false;selected.clear();rows=[];empty('正在读取弹幕…');sync();
  find('dm-page-status').textContent='正在加载…';if(!keepFeedback)feedback('');
  try{
   const result=await post({method:'DanmakuList',...filters,page:String(target)},controller.signal);if(ticket!==sequence)return;
   const data=result.data;
   if(!data||!Array.isArray(data.items)||!data.summary)throw Error('弹幕列表返回格式异常');
   rows=data.items;page=data.page;pages=data.pages;ready=true;render();
   for(const stat of root.querySelectorAll('[data-dm-stat]'))stat.textContent=Number(data.summary[stat.dataset.dmStat]||0).toLocaleString('zh-CN');
   find('dm-page-status').textContent='共 '+Number(data.total).toLocaleString('zh-CN')+' 条 · 第 '+page+' / '+pages+' 页 · 每页 '+data.pageSize+' 条';
  }catch(error){
   if(ticket!==sequence)return;
   const message=error.name==='AbortError'?'读取超时，请点击“刷新列表”重试':error.message;
   empty('弹幕列表暂时无法读取。');find('dm-page-status').textContent='读取失败';feedback(message,true);
  }finally{clearTimeout(timer);if(ticket===sequence){reading=false;sync();}}
 }
 function confirmAction(kind,chosen,trigger){
  if(writing||reading||!ready)return;
  if(kind==='dismiss')chosen=chosen.filter(row=>row.reportCount>0);
  if(!chosen.length)return;
  pending={kind,ids:chosen.map(row=>row.id)};returnFocus=trigger;
  const deleting=kind==='delete';find('dm-confirm-title').textContent=deleting?'删除 '+chosen.length+' 条弹幕？':'忽略 '+chosen.length+' 条弹幕的举报？';
  find('dm-confirm-description').textContent=deleting?'将永久删除所选弹幕及其关联举报，无法撤销。':'将清除所选弹幕的当前举报记录，保留弹幕正文。举报记录清除后无法恢复。';
  const preview=find('dm-confirm-preview');preview.replaceChildren();
  chosen.slice(0,3).forEach(row=>preview.append(element('li','#'+row.id+' · '+row.content.slice(0,100)+(row.content.length>100?'…':''))));
  if(chosen.length>3)preview.append(element('li','另有 '+(chosen.length-3)+' 条选中弹幕'));
  const submit=find('dm-confirm-submit');submit.disabled=false;submit.textContent=deleting?'确认删除':'确认忽略';submit.className='button '+(deleting?'dm-danger':'primary');
  find('dm-confirm-status').textContent='';dialog.showModal();find('dm-confirm-cancel').focus();
 }
 function restoreFocus(){pending=null;if(returnFocus?.isConnected&&!returnFocus.disabled)returnFocus.focus();else find('dm-refresh').focus();returnFocus=null;}
 dialog.addEventListener('close',restoreFocus);
 dialog.addEventListener('cancel',event=>{if(writing)event.preventDefault();});
 find('dm-confirm-cancel').addEventListener('click',()=>{if(!writing)dialog.close();});
 find('dm-confirm-submit').addEventListener('click',async()=>{
  if(!pending||writing)return;
  const operation=pending,submit=find('dm-confirm-submit'),cancel=find('dm-confirm-cancel'),status=find('dm-confirm-status');
  const fields={method:operation.kind==='delete'?'DanmakuDelete':'DanmakuDismissReports'};operation.ids.forEach((id,index)=>fields['ids['+index+']']=id);
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);writing=true;sync();submit.disabled=true;cancel.disabled=true;
  status.classList.remove('error');status.textContent='正在处理，请稍候…';let succeeded=false,uncertain=false;
  try{const result=await post(fields,controller.signal);succeeded=true;feedback(result.msg);}
  catch(error){uncertain=true;ready=false;status.textContent=(error.name==='AbortError'||error instanceof TypeError?'操作结果尚未确认。':error.message+'。')+'请关闭此窗口并刷新列表检查，不要重复提交。';status.classList.add('error');}
  finally{clearTimeout(timer);writing=false;submit.disabled=uncertain;cancel.disabled=false;sync();}
  if(succeeded){dialog.close();await load(page,true);}
 });
 body.addEventListener('change',event=>{const input=event.target;if(!input.matches('[data-dm-select]'))return;if(input.checked)selected.add(input.value);else selected.delete(input.value);sync();});
 body.addEventListener('click',event=>{
  const button=event.target.closest('button[data-dm-action]');if(!button||reading||writing)return;
  const row=rows.find(item=>item.id===button.dataset.id);if(!row)return;
  if(button.dataset.dmAction==='filter'){form.elements.player.value=row.playerId;form.requestSubmit();}
  else confirmAction(button.dataset.dmAction,[row],button);
 });
 find('dm-select-page').addEventListener('change',event=>{selected.clear();rows.forEach(row=>{if(event.target.checked)selected.add(row.id);});body.querySelectorAll('[data-dm-select]').forEach(input=>{input.checked=selected.has(input.value);});sync();});
 find('dm-delete-selected').addEventListener('click',event=>confirmAction('delete',selection(),event.currentTarget));
 find('dm-dismiss-selected').addEventListener('click',event=>confirmAction('dismiss',selection(),event.currentTarget));
 form.addEventListener('submit',event=>{event.preventDefault();if(!form.reportValidity()||writing)return;filters={keyword:form.elements.keyword.value.trim(),player:form.elements.player.value.trim(),reported:form.elements.reported.value};rememberPlayer();load(1);});
 form.addEventListener('reset',event=>{if(writing){event.preventDefault();return;}filters={keyword:'',player:'',reported:'0'};rememberPlayer();load(1);});
 find('dm-refresh').addEventListener('click',()=>load(page));find('dm-prev').addEventListener('click',()=>load(page-1));find('dm-next').addEventListener('click',()=>load(page+1));
 load();
})();

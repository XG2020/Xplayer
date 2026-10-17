/* Group actions operate only on the local store and require an authenticated POST. */
(() => {
 'use strict';
 const root=document.getElementById('danmaku-groups');if(!root)return;
 const find=id=>document.getElementById('dmg-'+id),form=find('search'),body=find('rows'),dialog=find('confirm');
 const csrf=document.querySelector('meta[name="xplayer-csrf"]')?.content||'',selected=new Set();
 let rows=[],page=1,pages=1,ready=false,reading=false,writing=false,sequence=0,request=null,pending=null,returnFocus=null;
 let filters={keyword:'',reported:'0'};
 const node=(tag,text,className)=>{const item=document.createElement(tag);if(text!==undefined)item.textContent=String(text);if(className)item.className=className;return item;};
 const number=value=>Number(value||0).toLocaleString('zh-CN');
 const chosen=()=>rows.filter(row=>selected.has(row.key));
 function message(text,error=false){const box=find('feedback');box.textContent=text;box.classList.toggle('error',error);box.hidden=!text;}
 function controls(){
  const count=chosen().length,blocked=reading||writing||!ready,all=find('select-page');
  all.checked=!!rows.length&&count===rows.length;all.indeterminate=count>0&&count<rows.length;all.disabled=blocked||!rows.length;
  find('selection').textContent=count?'已选择本页 '+count+' 个分组':'未选择分组';find('clear-selected').disabled=blocked||!count;
  find('prev').disabled=blocked||page<=1;find('next').disabled=blocked||page>=pages;find('refresh').disabled=writing;
  body.querySelectorAll('button,input').forEach(item=>{item.disabled=blocked;});
  form.querySelectorAll('button,input,select').forEach(item=>{item.disabled=writing;});find('results').setAttribute('aria-busy',String(reading||writing));
 }
 async function post(fields,signal){
  const response=await fetch('./api.php',{method:'POST',credentials:'same-origin',headers:{'X-CSRF-Token':csrf,'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body:new URLSearchParams(fields),signal});
  let result;try{result=await response.json();}catch(_){throw Error('后台返回异常响应，请重新读取分组列表确认结果');}
  if(!response.ok||result.code!==200)throw Error(result.msg||'操作失败，请稍后重试');return result;
 }
 function empty(text){const row=node('tr'),cell=node('td',text,'dm-empty');cell.colSpan=6;row.append(cell);body.replaceChildren(row);}
 function render(){
  body.replaceChildren();
  if(!rows.length){empty(filters.keyword||filters.reported==='1'?'没有符合条件的视频分组。':'本站还没有视频分组，收到本地弹幕后会自动显示。');return;}
  for(const row of rows){
   const tr=node('tr'),select=node('td',undefined,'dm-check'),checkbox=node('input');checkbox.type='checkbox';checkbox.value=row.key;checkbox.dataset.groupSelect=row.key;checkbox.setAttribute('aria-label','选择视频 '+row.playerId);select.append(checkbox);
   const video=node('td');video.append(node('span',row.playerId,'dmg-player'));
   const count=node('td',number(row.comments),'dmg-count'),reports=node('td',number(row.reports),'dmg-count'+(row.reports>0?' dmg-reported':''));
   const dateCell=node('td',undefined,'dm-date'),date=new Date(Number(row.latestAt)*1000);
   if(Number.isFinite(date.getTime())){const time=node('time');time.dateTime=date.toISOString();time.title=date.toLocaleString('zh-CN');time.append(document.createTextNode(date.toLocaleDateString('zh-CN')),node('br'),document.createTextNode(date.toLocaleTimeString('zh-CN',{hour12:false})));dateCell.append(time);}else dateCell.textContent='—';
   const actions=node('td'),buttons=node('div',undefined,'dm-row-actions dmg-actions'),view=node('a','查看弹幕'),clear=node('button','清空分组','dm-delete');
   view.href='danmaku.php?player='+encodeURIComponent(row.playerId);clear.type='button';clear.dataset.clearGroup=row.key;buttons.append(view,clear);actions.append(buttons);tr.append(select,video,count,reports,dateCell,actions);body.append(tr);
  }
 }
 async function load(target=1,keepMessage=false){
  if(writing)return;
  const ticket=++sequence;request?.abort();request=new AbortController();const controller=request,timer=setTimeout(()=>controller.abort(),20000);
  reading=true;ready=false;rows=[];selected.clear();empty('正在读取视频分组…');find('page-status').textContent='正在加载…';if(!keepMessage)message('');controls();
  try{
   const result=await post({method:'DanmakuGroups',...filters,page:String(target)},controller.signal);if(ticket!==sequence)return;
   const data=result.data;if(!data||!Array.isArray(data.items)||!data.summary)throw Error('分组列表返回格式异常');
   rows=data.items;page=data.page;pages=data.pages;ready=true;render();
   root.querySelectorAll('[data-dmg-stat]').forEach(item=>{item.textContent=number(data.summary[item.dataset.dmgStat]);});
   find('page-status').textContent='共 '+number(data.total)+' 个分组 · 第 '+page+' / '+pages+' 页 · 每页 '+data.pageSize+' 组';
  }catch(error){if(ticket!==sequence)return;empty('分组列表暂时无法读取。');find('page-status').textContent='读取失败';message(error.name==='AbortError'?'读取超时，请刷新分组重试':error.message,true);}
  finally{clearTimeout(timer);if(ticket===sequence){reading=false;controls();}}
 }
 function confirm(items,trigger){
  if(reading||writing||!ready||!items.length)return;
  pending=items.map(row=>row.key);returnFocus=trigger;
  const comments=items.reduce((sum,row)=>sum+Number(row.comments),0),reports=items.reduce((sum,row)=>sum+Number(row.reports),0);
  find('confirm-title').textContent='清空 '+items.length+' 个视频分组？';find('confirm-description').textContent='所选分组当前共有 '+number(comments)+' 条弹幕、'+number(reports)+' 条举报。将永久删除这些弹幕及关联举报，无法撤销。';
  const preview=find('confirm-preview');preview.replaceChildren();items.forEach(row=>{const item=node('li');item.append(node('span',row.playerId,'dmg-player'),node('span',number(row.comments)+' 条弹幕 · '+number(row.reports)+' 条举报','dm-meta'));preview.append(item);});
  find('confirm-status').textContent='';find('confirm-status').classList.remove('error');find('confirm-submit').disabled=false;dialog.showModal();find('confirm-cancel').focus();
 }
 dialog.addEventListener('cancel',event=>{if(writing)event.preventDefault();});
 dialog.addEventListener('close',()=>{pending=null;if(returnFocus?.isConnected&&!returnFocus.disabled)returnFocus.focus();else find('refresh').focus();returnFocus=null;});
 find('confirm-cancel').addEventListener('click',()=>{if(!writing)dialog.close();});
 find('confirm-submit').addEventListener('click',async()=>{
  if(!pending||writing)return;
  const fields={method:'DanmakuClearGroups'};pending.forEach((key,index)=>{fields['keys['+index+']']=key;});
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),30000),submit=find('confirm-submit'),cancel=find('confirm-cancel');
  writing=true;submit.disabled=true;cancel.disabled=true;controls();find('confirm-status').textContent='正在清空，请稍候…';let success=false;
  try{const result=await post(fields,controller.signal);success=true;message(result.msg||'所选视频分组已处理');}
  catch(error){ready=false;find('confirm-status').textContent=(error.name==='AbortError'?'操作结果尚未确认。':error.message+'。')+'请关闭此窗口并刷新分组列表检查结果，不要重复提交。';find('confirm-status').classList.add('error');}
  finally{clearTimeout(timer);writing=false;cancel.disabled=false;controls();}
  if(success){dialog.close();await load(page,true);}
 });
 body.addEventListener('change',event=>{const input=event.target;if(!input.matches('[data-group-select]'))return;if(input.checked)selected.add(input.value);else selected.delete(input.value);controls();});
 body.addEventListener('click',event=>{const button=event.target.closest('button[data-clear-group]');if(!button)return;const row=rows.find(item=>item.key===button.dataset.clearGroup);if(row)confirm([row],button);});
 find('select-page').addEventListener('change',event=>{selected.clear();if(event.target.checked)rows.forEach(row=>selected.add(row.key));body.querySelectorAll('[data-group-select]').forEach(input=>{input.checked=selected.has(input.value);});controls();});
 find('clear-selected').addEventListener('click',event=>confirm(chosen(),event.currentTarget));
 form.addEventListener('submit',event=>{event.preventDefault();if(writing||!form.reportValidity())return;filters={keyword:form.elements.keyword.value.trim(),reported:form.elements.reported.value};load(1);});
 form.addEventListener('reset',event=>{if(writing){event.preventDefault();return;}filters={keyword:'',reported:'0'};load(1);});
 find('refresh').addEventListener('click',()=>load(page));find('prev').addEventListener('click',()=>load(page-1));find('next').addEventListener('click',()=>load(page+1));load();
})();

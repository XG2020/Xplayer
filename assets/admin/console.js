/* The admin UI uses browser APIs only; passwords and keys never enter client logs/storage. */
(() => {
 'use strict';
 const csrf=document.querySelector('meta[name="xplayer-csrf"]')?.content;
 const dirty=new Set();
 const themeButtons=document.querySelectorAll('.theme-toggle');
 function setTheme(theme){document.documentElement.dataset.theme=theme;try{localStorage.setItem('xplayer.admin.theme',theme);}catch(_){}themeButtons.forEach(button=>button.setAttribute('aria-label',theme==='dark'?'切换到浅色模式':'切换到深色模式'));}
 setTheme(document.documentElement.dataset.theme==='dark'?'dark':'light');
 themeButtons.forEach(button=>button.addEventListener('click',()=>setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark')));
 const menuButton=document.querySelector('.menu-toggle');
 const closeNav=()=>{document.body.classList.remove('nav-open');menuButton?.setAttribute('aria-expanded','false');};
 menuButton?.addEventListener('click',()=>{const open=document.body.classList.toggle('nav-open');menuButton.setAttribute('aria-expanded',String(open));});
 document.querySelector('.nav-overlay')?.addEventListener('click',closeNav);
 document.addEventListener('keydown',event=>{if(event.key==='Escape')closeNav();});
 async function post(fields){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
  try{const response=await fetch('./api.php',{method:'POST',credentials:'same-origin',headers:{'X-CSRF-Token':csrf,'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body:new URLSearchParams(fields),signal:controller.signal});
   const result=await response.json();if(!response.ok||result.code&&result.code!==200)throw Error(result.msg||'保存失败，请检查设置后重试');return result;
  }catch(error){if(error.name==='AbortError')throw Error('请求超时，设置未确认保存，请稍后重试');throw error;}finally{clearTimeout(timer);}
 }
 let toastTimer;
 const toast=document.createElement('div');toast.className='save-toast';toast.hidden=true;
 const toastText=document.createElement('span');toastText.setAttribute('role','status');toastText.setAttribute('aria-live','polite');
 const toastClose=document.createElement('button');toastClose.type='button';toastClose.className='toast-close';toastClose.setAttribute('aria-label','关闭提示');toastClose.textContent='×';toastClose.addEventListener('click',()=>{toast.hidden=true;clearTimeout(toastTimer);});
 toast.append(toastText,toastClose);document.body.append(toast);
 function notify(message,error=false){clearTimeout(toastTimer);toast.classList.toggle('error',error);toast.hidden=false;toastText.textContent=message;toastTimer=setTimeout(()=>{toast.hidden=true;},error?11000:6500);}
 function status(form,message,state='idle'){
  const target=form.querySelector('.form-status');if(!target)return;
  // Toasts announce the final result; the inline result remains visible beside Save.
  const result=state==='success'||state==='error';target.setAttribute('aria-live',result?'off':'polite');
  target.textContent=message;target.classList.toggle('error',state==='error');target.classList.toggle('success',state==='success');target.dataset.state=state;
  if(result)notify(message,state==='error');
 }
 function busy(form,value){form.setAttribute('aria-busy',String(value));const button=form.querySelector('button[type=submit]');if(button)button.classList.toggle('is-busy',value);}
 const login=document.getElementById('login-form');
 login?.addEventListener('submit',async event=>{event.preventDefault();if(!login.reportValidity())return;const button=login.querySelector('button[type=submit]');button.disabled=true;busy(login,true);status(login,'正在验证账号…','pending');try{await post({method:'Login',account_u:login.account_u.value.trim(),account_p:login.account_p.value});location.assign('./');}catch(error){status(login,error.message,'error');}finally{button.disabled=false;busy(login,false);}});
 function listValue(value){const lines=value.split(/\r?\n/).map(line=>line.trim()).filter(Boolean);if(lines.some(line=>line.includes('###')||line.includes('&&&')))throw Error('接口地址包含保留分隔符，请对地址中的特殊字符进行 URL 编码');return lines.map((line,index)=>index+'###'+line).join('&&&');}
 function formValues(form){
  const result={};for(const input of form.querySelectorAll('[name]')){if(input.type==='checkbox')result[input.name]=input.checked?'1':'0';else result[input.name]=input.dataset.lineList?listValue(input.value):input.value;}
  if(form.dataset.settingsForm==='player'){
   result.button=[result.buttonLabel||'',result.buttonUrl||''].map(value=>'"'+value.trim().replace(/"/g,'""')+'"').join(',');
   if(result.startAdType&&!result.startAdMedia.trim())throw Error('请选择播放前广告素材，或将广告类型设为不显示');
   result.startAD=result.startAdType?[result.startAdType,result.startAdMedia,result.startAdLink,result.startAdSeconds].join(','):'';
   result.pauseAD=result.pauseAdImage?[result.pauseAdImage,result.pauseAdLink].join(','):'';
   for(const key of ['buttonLabel','buttonUrl','startAdType','startAdMedia','startAdLink','startAdSeconds','pauseAdImage','pauseAdLink'])delete result[key];
  }
  return result;
 }
 document.querySelectorAll('[data-settings-form]').forEach(form=>{
  form.addEventListener('input',()=>{dirty.add(form);status(form,'有未保存的修改','dirty');});
  form.addEventListener('change',()=>{dirty.add(form);status(form,'有未保存的修改','dirty');});
  form.addEventListener('submit',async event=>{
   event.preventDefault();if(!form.reportValidity())return;
   let values;try{values=formValues(form);}catch(error){status(form,error.message,'error');return;}
   const controls=[...form.querySelectorAll('input,textarea,select,button')],disabled=controls.map(control=>control.disabled);controls.forEach(control=>control.disabled=true);busy(form,true);status(form,'正在保存，请稍候…','pending');
   const fields={method:'SaveSettings',section:form.dataset.settingsForm};for(const [key,value]of Object.entries(values))fields['data['+key+']']=value;
   try{const result=await post(fields);dirty.delete(form);status(form,result.msg||'设置已保存','success');const key=form.querySelector('[name=secretKEY]');if(key)key.value='';}catch(error){status(form,error.message,'error');}finally{controls.forEach((control,index)=>control.disabled=disabled[index]);busy(form,false);}
  });
 });
 const passwordForm=document.getElementById('password-form');
 if(passwordForm){
  const current=passwordForm.elements.current_password,next=passwordForm.elements.new_password,confirm=passwordForm.elements.confirm_password;
  const validate=()=>{const bytes=new TextEncoder().encode(next.value).length;next.setCustomValidity(next.value&&(bytes<12||bytes>72)?'新密码长度应为 12–72 字节':'');confirm.setCustomValidity(confirm.value!==next.value?'两次输入的新密码不一致':'');};
  passwordForm.addEventListener('input',()=>{validate();if([current,next,confirm].some(input=>input.value))dirty.add(passwordForm);else dirty.delete(passwordForm);status(passwordForm,'填写完成后点击修改密码','dirty');});
  passwordForm.addEventListener('submit',async event=>{
   event.preventDefault();validate();if(!passwordForm.reportValidity())return;
   if([...document.querySelectorAll('[data-settings-form]')].some(form=>form.getAttribute('aria-busy')==='true')){status(passwordForm,'请等待设置保存完成，再修改密码','error');return;}
   if([...dirty].some(form=>form!==passwordForm)){status(passwordForm,'请先保存其他设置，再修改密码','error');return;}
   const fields={method:'ChangePassword',current_password:current.value,new_password:next.value,confirm_password:confirm.value};
   const controls=[...document.querySelectorAll('[data-settings-form],#password-form')].flatMap(form=>[...form.querySelectorAll('input,textarea,select,button')]),disabled=controls.map(control=>control.disabled);
   controls.forEach(control=>control.disabled=true);busy(passwordForm,true);status(passwordForm,'正在修改密码…','pending');let changed=false;
   try{await post(fields);changed=true;dirty.delete(passwordForm);passwordForm.reset();status(passwordForm,'管理员密码已修改，正在返回登录页…','success');setTimeout(()=>location.assign('./'),1600);}catch(error){status(passwordForm,error.message,'error');}finally{if(!changed){controls.forEach((control,index)=>control.disabled=disabled[index]);busy(passwordForm,false);}}
  });
 }
 window.addEventListener('beforeunload',event=>{if(dirty.size){event.preventDefault();event.returnValue='';}});
 const chart=document.getElementById('activity-chart');
 async function loadChart(){
  const note=document.getElementById('chart-status'),table=document.getElementById('activity-table');note.textContent='正在读取统计…';
  try{const rows=await post({method:'DashBoard',size:document.getElementById('chart-days').value});if(!Array.isArray(rows))throw Error('统计数据暂不可用');chart.replaceChildren();table.replaceChildren();const maximum=Math.max(1,...rows.map(row=>Number(row.use)||0));
   rows.forEach(row=>{const group=document.createElement('div');group.className='chart-day';group.title=row.time+' · 调用 '+row.use+' / 成功 '+row.useok;const bars=document.createElement('div');bars.className='chart-bars';for(const field of ['use','useok']){const bar=document.createElement('i');bar.style.height=Math.max(1,(Number(row[field])||0)/maximum*100)+'%';bars.append(bar);}const label=document.createElement('span');label.textContent=row.time.slice(5);group.append(bars,label);chart.append(group);const tr=document.createElement('tr');for(const value of [row.time,row.use,row.useok]){const td=document.createElement('td');td.textContent=value;tr.append(td);}table.append(tr);});chart.classList.toggle('chart-month',rows.length>10);note.textContent=rows.every(row=>!Number(row.use))?'这段时间还没有播放调用，首次使用后会在这里显示。':'';
  }catch(error){note.textContent=error.message;note.classList.add('error');}
 }
 if(chart){document.getElementById('chart-days').addEventListener('change',loadChart);loadChart();}
})();

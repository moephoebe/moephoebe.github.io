const input=document.querySelector('#searchInput');
const results=document.querySelector('#results');
const start=document.querySelector('#searchStart');
const empty=document.querySelector('#emptyState');
const tabs=[...document.querySelectorAll('#resultTabs button')];
const groups=[...document.querySelectorAll('.result-group')];
const states=[...document.querySelectorAll('.state')];
const label=document.querySelector('#stageLabel');
const toast=document.querySelector('#toast');
let toastTimer;

function showToast(text){toast.textContent=text;toast.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.hidden=true,1800)}
function setTab(name){
  tabs.forEach(btn=>btn.classList.toggle('active',btn.dataset.tab===name));
  groups.forEach(group=>group.hidden=name!=='all'&&group.dataset.kind!==name);
  results.hidden=false;start.hidden=true;empty.hidden=true;
  const names={all:'全部',customer:'客户',message:'会话',group:'群聊'};
  label.textContent=`搜索结果 · ${names[name]}`;
}
function setState(name){
  states.forEach(btn=>btn.classList.toggle('active',btn.dataset.state===name));
  document.querySelector('#resultTabs').hidden=name==='start'||name==='empty';
  if(name==='start'){input.value='';results.hidden=true;empty.hidden=true;start.hidden=false;label.textContent='搜索前 · 历史与快捷条件'}
  if(name==='empty'){input.value='不存在的客户';results.hidden=true;start.hidden=true;empty.hidden=false;label.textContent='无搜索结果'}
  if(name==='result'){input.value='李玉真';setTab('all')}
  if(name==='customer'){input.value='李玉真';setTab('customer')}
}
tabs.forEach(btn=>btn.addEventListener('click',()=>setTab(btn.dataset.tab)));
document.querySelectorAll('[data-tab-link]').forEach(btn=>btn.addEventListener('click',()=>setTab(btn.dataset.tabLink)));
states.forEach(btn=>btn.addEventListener('click',()=>setState(btn.dataset.state)));
document.querySelectorAll('[data-query]').forEach(btn=>btn.addEventListener('click',()=>{input.value=btn.dataset.query;setTab('all');showToast(`正在搜索“${btn.dataset.query}”`)}));
document.querySelectorAll('.history-chips button').forEach(btn=>btn.addEventListener('click',()=>{input.value=btn.textContent;setTab('all')}));
document.querySelectorAll('.message-action').forEach(btn=>btn.addEventListener('click',()=>showToast(btn.dataset.toast)));
document.querySelector('#clearBtn').addEventListener('click',()=>setState('start'));
document.querySelector('#replayBtn').addEventListener('click',()=>setState('result'));
document.querySelector('#emptyReset').addEventListener('click',()=>setState('start'));
document.querySelector('#clearHistory').addEventListener('click',e=>{document.querySelector('.history-chips').innerHTML='';e.currentTarget.hidden=true;showToast('搜索记录已清空')});
input.addEventListener('input',()=>{if(!input.value.trim())setState('start')});
input.addEventListener('keydown',e=>{if(e.key==='Enter'){input.value.trim().length<2?setState('empty'):setTab('all')}});
const sheet=document.querySelector('#filterSheet');
document.querySelector('#filterBtn').addEventListener('click',()=>sheet.hidden=false);
document.querySelector('#sheetMask').addEventListener('click',()=>sheet.hidden=true);
document.querySelector('#closeSheet').addEventListener('click',()=>sheet.hidden=true);
document.querySelectorAll('.sheet-options button').forEach(btn=>btn.addEventListener('click',()=>{[...btn.parentElement.children].forEach(x=>x.classList.remove('selected'));btn.classList.add('selected')}));
document.querySelector('#resetFilter').addEventListener('click',()=>document.querySelectorAll('.sheet-options').forEach(group=>{[...group.children].forEach((x,i)=>x.classList.toggle('selected',i===0))}));
document.querySelector('#confirmFilter').addEventListener('click',()=>{sheet.hidden=true;showToast('已应用筛选条件')});
setState('result');

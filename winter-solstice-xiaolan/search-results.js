const input=document.querySelector('#searchInput');
const results=document.querySelector('#results');
const start=document.querySelector('#searchStart');
const empty=document.querySelector('#emptyState');
const tabs=[...document.querySelectorAll('#resultTabs button')];
const groups=[...document.querySelectorAll('.result-group')];
const states=[...document.querySelectorAll('.state')];
const label=document.querySelector('#stageLabel');
const toast=document.querySelector('#toast');
const phone=document.querySelector('.phone');
const aiSwitch=document.querySelector('#aiSwitch');
const aiLoading=document.querySelector('#aiLoading');
const aiAnalysis=document.querySelector('#aiAnalysis');
const aiMatch=[...document.querySelectorAll('.ai-match')];
const resultSummary=document.querySelector('.result-summary');
let toastTimer;
let aiTimer;

function showToast(text){toast.textContent=text;toast.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.hidden=true,1800)}
function setTab(name){
  tabs.forEach(btn=>btn.classList.toggle('active',btn.dataset.tab===name));
  groups.forEach(group=>group.hidden=name!=='all'&&group.dataset.kind!==name);
  results.hidden=false;start.hidden=true;empty.hidden=true;
  const names={all:'全部',customer:'客户',message:'会话',group:'群聊'};
  label.textContent=`搜索结果 · ${names[name]}`;
}
function setAiMode(enabled){
  aiSwitch.setAttribute('aria-checked',String(enabled));
  phone.classList.toggle('ai-active',enabled);
  document.querySelector('#aiHint').textContent=enabled?'已开启，可用一句话描述要找的客户':'开启后，小蓝可以理解经营场景';
  input.placeholder=enabled?'例如：找出本月生日且30天未联系的高客':'搜索客户姓名、手机号或聊天内容';
  if(!enabled){
    clearTimeout(aiTimer);aiLoading.hidden=true;aiAnalysis.hidden=true;aiMatch.forEach(x=>x.hidden=true);
    results.classList.remove('ai-result-mode');resultSummary.hidden=false;
    resultSummary.querySelector('span').textContent='找到 8 条相关结果';
  }
}
function runAiSearch(query=input.value.trim()){
  setAiMode(true);
  input.value=query||'找出本月生日且30天未联系的高客';
  setTab('customer');
  aiAnalysis.hidden=true;aiLoading.hidden=false;resultSummary.hidden=true;
  groups.forEach(group=>group.hidden=true);
  label.textContent='AI 搜索 · 正在理解';
  const stepEls=[...document.querySelectorAll('.thinking-steps span')];
  stepEls.forEach((x,i)=>{x.classList.toggle('active',i===0);x.classList.remove('done')});
  document.querySelector('#aiLoadingTitle').textContent='小蓝正在理解你的搜索意图';
  document.querySelector('#aiLoadingText').textContent='识别客户对象与经营条件...';
  clearTimeout(aiTimer);
  setTimeout(()=>{stepEls[0].classList.replace('active','done');stepEls[1].classList.add('active');document.querySelector('#aiLoadingText').textContent='关联客户档案、沟通记录与保单信息...'},550);
  setTimeout(()=>{stepEls[1].classList.replace('active','done');stepEls[2].classList.add('active');document.querySelector('#aiLoadingText').textContent='计算客户匹配度并生成排序...'},1050);
  aiTimer=setTimeout(()=>{
    aiLoading.hidden=true;aiAnalysis.hidden=false;resultSummary.hidden=false;
    resultSummary.querySelector('span').textContent='搜索完成 · 找到 10 位客户';
    results.classList.add('ai-result-mode');
    groups.forEach(group=>group.hidden=group.dataset.kind!=='customer');
    aiMatch.forEach(x=>x.hidden=false);
    label.textContent='AI 搜索 · 智能排序';
    stepEls[2].classList.replace('active','done');
  },1550);
}
function setState(name){
  states.forEach(btn=>btn.classList.toggle('active',btn.dataset.state===name));
  document.querySelector('#resultTabs').hidden=name==='start'||name==='empty';
  if(name==='start'){setAiMode(false);input.value='';results.hidden=true;empty.hidden=true;start.hidden=false;label.textContent='搜索前 · 历史与快捷条件'}
  if(name==='empty'){setAiMode(false);input.value='不存在的客户';results.hidden=true;start.hidden=true;empty.hidden=false;label.textContent='无搜索结果'}
  if(name==='result'){setAiMode(false);input.value='李玉真';setTab('all')}
  if(name==='customer'){setAiMode(false);input.value='李玉真';setTab('customer')}
  if(name==='ai'){runAiSearch('找出本月生日且30天未联系的高客')}
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
input.addEventListener('keydown',e=>{if(e.key==='Enter'){if(aiSwitch.getAttribute('aria-checked')==='true')runAiSearch();else input.value.trim().length<2?setState('empty'):setTab('all')}});
aiSwitch.addEventListener('click',()=>{const next=aiSwitch.getAttribute('aria-checked')!=='true';setAiMode(next);if(next&&!input.value.trim())input.value='找出本月生日且30天未联系的高客';if(!next)setState('result')});
document.querySelector('#aiSubmit').addEventListener('click',()=>runAiSearch());
document.querySelectorAll('[data-ai-refine]').forEach(btn=>btn.addEventListener('click',()=>{input.value=`${input.value}，${btn.dataset.aiRefine}`;runAiSearch(input.value)}));
const sheet=document.querySelector('#filterSheet');
document.querySelector('#filterBtn').addEventListener('click',()=>sheet.hidden=false);
document.querySelector('#sheetMask').addEventListener('click',()=>sheet.hidden=true);
document.querySelector('#closeSheet').addEventListener('click',()=>sheet.hidden=true);
document.querySelectorAll('.sheet-options button').forEach(btn=>btn.addEventListener('click',()=>{[...btn.parentElement.children].forEach(x=>x.classList.remove('selected'));btn.classList.add('selected')}));
document.querySelector('#resetFilter').addEventListener('click',()=>document.querySelectorAll('.sheet-options').forEach(group=>{[...group.children].forEach((x,i)=>x.classList.toggle('selected',i===0))}));
document.querySelector('#confirmFilter').addEventListener('click',()=>{sheet.hidden=true;showToast('已应用筛选条件')});
setState('result');

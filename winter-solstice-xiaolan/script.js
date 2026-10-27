const panel=document.querySelector('#xiaolanPanel');
const messages=document.querySelector('#messages');
const stageStatus=document.querySelector('#stageStatus');
const journey=[...document.querySelectorAll('.journey-item')];
const capabilities=[...document.querySelectorAll('.capability')];
const toastEl=document.querySelector('#toast');
const historyWindow=document.querySelector('#historyWindow');
const dockButton=document.querySelector('#xiaolanDock');
const composerField=document.querySelector('.composer-field');
let timers=[];
let selectedAction='physical';
let composerDraft='';
let timelinePreviousStatus='';
let gridUpdated=false;
let latestGridUpdate={key:'',count:0};

const customerGrid={
  base:{label:'基础格',progress:100,summary:'38岁 · 三口之家',detail:'女，38岁，三口之家，高客。信息来自客户档案。',tone:'warm'},
  hobby:{label:'爱好格',progress:30,summary:'亲子与家庭活动',detail:'过往沟通中提到周末常陪伴家人，兴趣信息仍需继续补充。',tone:'warm'},
  health:{label:'健康格',progress:0,summary:'待了解',detail:'暂无明确健康需求信息。'},
  income:{label:'收入格',progress:0,summary:'待了解',detail:'暂无明确收入信息，可在需求沟通中自然了解。'},
  career:{label:'事业格',progress:30,summary:'工作较忙',detail:'客户曾提到近期工作忙，具体职业与发展阶段待补充。',tone:'warm'},
  finance:{label:'财商格',progress:0,summary:'待了解',detail:'暂无明确理财偏好和风险承受信息。'},
  family:{label:'家庭格',progress:70,summary:'女儿即将结婚',detail:'三口之家，女儿近期筹备婚礼，家庭责任与保障需求较高。',tone:'warm'},
  policy:{label:'保单格',progress:100,summary:'持有保单 5 件',detail:'现有保单 5 件，已具备较完整的基础保障。',tone:'warm'},
  pain:{label:'痛点格',progress:0,summary:'待了解',detail:'暂无明确痛点信息，可在后续对话中持续识别。'}
};

const openingCopy='李姐，今日冬至，白昼渐长，温暖可期。感谢您一路以来的信任与支持，祝您冬至安康，阖家幸福，万事顺遂。';
const customerAnalysis='客户李玉真，38 岁、三口之家、高客，距离上次初次面谈已经半年，客户热度回落，属于休眠唤醒型跟进。跟进时机选冬至节气祝福，不直接谈保单、降低客户防备心，重新激活对话链路。';
const copies={
  physical:'李姐，您最近正好想做体检呀～您的高端体检权益还有 1 次可用，我可以帮您查一下近期时间，您看工作日还是周末更方便？',
  event:'李姐，我们公司 10 月 15 日下午有一场免费的心梗风险检测活动，想到您也关注家里人的健康，想邀请您参加。',
  follow:'李姐，您先忙，我把体检权益和可预约时间整理好，明天再发给您～'
};

function later(fn,ms){const id=setTimeout(fn,ms);timers.push(id);return id}
function clearTimers(){timers.forEach(clearTimeout);timers=[]}
function setStep(index,text){
  hideDock();
  closeHistoryWindow();
  journey.forEach((el,i)=>el.classList.toggle('active',i===index));
  const capabilityIndex=[0,1,2,2,3][index]??0;
  capabilities.forEach((el,i)=>el.classList.toggle('active',i===capabilityIndex));
  stageStatus.textContent=text;
}
function scrollChat(){requestAnimationFrame(()=>messages.scrollTo({top:messages.scrollHeight,behavior:'smooth'}))}
function toast(text){toastEl.textContent=text;toastEl.hidden=false;later(()=>toastEl.hidden=true,1500)}
function timelineContent(){return `<div class="timeline-toolbar"><div><b>客户互动时光轴</b><small>共 8 个关键触点 · 关系温度 +26℃</small></div><button class="timeline-summary" data-track-filter="all">全局概览</button></div>
  <div class="timeline-filters" aria-label="互动轨迹筛选"><button class="active" data-track-filter="all">全部</button><button data-track-filter="material">资料</button><button data-track-filter="event">活动</button><button data-track-filter="service">服务</button></div>
  <div class="timeline-scroll">
    <section class="timeline-month"><header><b>2025年09月</b><span>关系建立 · +8℃</span></header>
      <div class="timeline-date"><time>09.18</time><button class="timeline-event type-service" data-track-kind="service" aria-expanded="false"><i>访</i><span><b>初次面谈</b><em>已完成</em><small>客户关注家庭健康和养老规划</small><u>建立基础画像，适合从服务关怀持续跟进。</u></span></button></div>
      <div class="timeline-date"><time>09.20</time><button class="timeline-event type-material" data-track-kind="material" aria-expanded="false"><i>书</i><span><b>递送保障计划书</b><em>已查看 2 次</em><small>《家庭保障与养老规划》· 停留 3分26秒</small><u>客户重点查看养老部分，可在后续沟通中自然回访。</u></span></button></div>
    </section>
    <section class="timeline-month"><header><b>2025年10月</b><span>持续互动 · +6℃</span></header>
      <div class="timeline-date"><time>10.05</time><button class="timeline-event type-event" data-track-kind="event" aria-expanded="false"><i>邀</i><span><b>健康讲座邀约</b><em>已报名</em><small>家庭健康管理线上讲座</small><u>客户对健康主题有兴趣，关系从业务沟通转向服务连接。</u></span></button></div>
      <div class="timeline-date"><time>10.20</time><button class="timeline-event type-service" data-track-kind="service" aria-expanded="false"><i>权</i><span><b>体检权益提醒</b><em>待跟进</em><small>客户回复“最近忙，之后再约”</small><u>需求仍在，但当时机不成熟；适合轻量关怀后再承接。</u></span></button></div>
    </section>
    <section class="timeline-month current"><header><b>2025年12月</b><span>关系升温 · +12℃</span></header>
      <div class="timeline-date"><time>12.18</time><button class="timeline-event type-material" data-track-kind="material" aria-expanded="false"><i>阅</i><span><b>浏览健康服务页</b><em>主动行为</em><small>查看高端体检与预约说明</small><u>客户近期主动关注体检，当前是承接健康需求的好时机。</u></span></button></div>
      <div class="timeline-date active"><time>今天</time><button class="timeline-event type-event" data-track-kind="event" aria-expanded="true"><i>聊</i><span><b>冬至关怀互动</b><em>进行中</em><small>客户积极回应：“谢谢你啊，还记得我。”</small><u>关系温度明显回升，建议先自然寒暄，再询问近期状态。</u></span></button></div>
    </section>
  </div>`}
function gridContent(){
  const entries=Object.entries(customerGrid);const filled=entries.filter(([,item])=>item.progress>0).length;
  const updatedItem=customerGrid[latestGridUpdate.key];
  return `<div class="grid-toolbar"><div><b>客户信息九宫格</b><small>完整度 ${filled}/9 · 小蓝自动识别更新</small></div><span class="grid-score">${filled}/9</span></div>${gridUpdated?`<div class="grid-update"><i>✦</i><span><b>本次对话新增 ${latestGridUpdate.count} 条信息</b><small>${updatedItem.label}：${updatedItem.summary}</small></span></div>`:''}<div class="nine-grid">${entries.map(([key,item])=>`<button class="grid-card ${item.progress?'filled':'empty'} ${item.tone||''} ${key===latestGridUpdate.key&&gridUpdated?'updated selected':''}" data-grid-key="${key}" data-grid-title="${item.label}" data-grid-detail="${item.detail}" aria-label="${item.label} ${item.progress?`完整度 ${item.progress}%`:'待补充'}"><span><b>${item.label}</b>${key===latestGridUpdate.key&&gridUpdated?'<em>新</em>':''}</span><strong>${item.progress?`完整度 ${item.progress}%`:'待补充 ›'}</strong><small>${item.summary}</small><i style="--progress:${item.progress}%"></i></button>`).join('')}</div><div class="grid-detail"><span>✦</span><p><b>${gridUpdated?`${updatedItem.label}已自动更新`:'点击任一格查看记录依据'}</b><small>${gridUpdated?updatedItem.detail:'客户对话中的关键信息会由小蓝识别并记录。'}</small></p></div>`
}
function shell(body){return `<div class="panel-top"><span class="mini-avatar avatar-photo xiaolan-photo" aria-label="小蓝头像"></span><b>小蓝</b><button class="close-panel" aria-label="关闭">×</button></div><div class="panel-tabs" role="tablist"><button class="active" data-panel-tab="assistant" role="tab" aria-selected="true">智能建议</button><button data-panel-tab="timeline" role="tab" aria-selected="false"><i>◷</i> 时光轴 <em>8</em></button><button data-panel-tab="grid" role="tab" aria-selected="false"><i>▦</i> 九宫格 ${gridUpdated?'<em class="new-dot">新</em>':''}</button></div><div class="panel-body"><div class="panel-view assistant-view">${body}</div><div class="panel-view timeline-view" hidden>${timelineContent()}</div><div class="panel-view grid-view" hidden>${gridContent()}</div></div>`}
function bindClose(){panel.querySelector('.close-panel')?.addEventListener('click',closePanel);bindPanelTabs()}
function bindPanelTabs(){
  const tabButtons=[...panel.querySelectorAll('[data-panel-tab]')];
  const assistantView=panel.querySelector('.assistant-view');
  const timelineView=panel.querySelector('.timeline-view');
  const gridView=panel.querySelector('.grid-view');
  tabButtons.forEach(button=>button.addEventListener('click',()=>{
    const activeTab=button.dataset.panelTab;
    const showTimeline=activeTab==='timeline';
    const showGrid=activeTab==='grid';
    const wasAssistantVisible=!assistantView.hidden;
    if(wasAssistantVisible&&activeTab!=='assistant')timelinePreviousStatus=stageStatus.textContent;
    tabButtons.forEach(item=>{const selected=item===button;item.classList.toggle('active',selected);item.setAttribute('aria-selected',String(selected))});
    assistantView.hidden=activeTab!=='assistant';timelineView.hidden=!showTimeline;gridView.hidden=!showGrid;
    if(showTimeline)stageStatus.textContent='客户时光轴 · 8 个互动触点';
    else if(showGrid)stageStatus.textContent=`客户九宫格 · ${gridUpdated?'已自动更新':'持续完善中'}`;
    else if(timelinePreviousStatus)stageStatus.textContent=timelinePreviousStatus;
  }));
  const filterButtons=[...panel.querySelectorAll('[data-track-filter]')];
  filterButtons.forEach(button=>button.addEventListener('click',()=>{
    const kind=button.dataset.trackFilter;
    filterButtons.forEach(item=>item.classList.toggle('active',item.dataset.trackFilter===kind));
    panel.querySelectorAll('.timeline-event').forEach(event=>event.closest('.timeline-date').hidden=kind!=='all'&&event.dataset.trackKind!==kind);
    panel.querySelectorAll('.timeline-month').forEach(month=>month.hidden=[...month.querySelectorAll('.timeline-date')].every(date=>date.hidden));
  }));
  panel.querySelectorAll('.timeline-event').forEach(event=>event.addEventListener('click',()=>{
    const expanded=event.getAttribute('aria-expanded')==='true';
    event.setAttribute('aria-expanded',String(!expanded));
  }));
  panel.querySelectorAll('.grid-card').forEach(card=>card.addEventListener('click',()=>{
    panel.querySelectorAll('.grid-card').forEach(item=>item.classList.remove('selected'));card.classList.add('selected');
    const detail=panel.querySelector('.grid-detail');detail.querySelector('b').textContent=card.dataset.gridTitle;
    detail.querySelector('small').textContent=card.dataset.gridDetail;
  }));
}
function closePanel(){clearTimers();panel.hidden=true;stageStatus.textContent='小蓝已收起'}
function closeHistoryWindow(){historyWindow.hidden=true;dockButton.setAttribute('aria-expanded','false')}
function hideDock(){closeHistoryWindow();dockButton.hidden=true}
function showDock(){dockButton.hidden=false;dockButton.classList.remove('dock-arrive');requestAnimationFrame(()=>dockButton.classList.add('dock-arrive'))}
function toggleHistoryWindow(){
  const shouldOpen=historyWindow.hidden;
  if(!shouldOpen){closeHistoryWindow();return}
  clearTimers();panel.hidden=true;historyWindow.hidden=false;dockButton.setAttribute('aria-expanded','true');
  stageStatus.textContent='小蓝 · 历史会话建议';
}
function setComposerDraft(text){
  composerDraft=text;composerField.textContent=text;composerField.classList.add('has-draft');
  closeHistoryWindow();toast('推荐话术已填入输入框');
}
function clearComposerDraft(){composerDraft='';composerField.textContent='发消息...';composerField.classList.remove('has-draft')}
function emptyState(){return `<div class="cold-empty" id="coldEmpty"><span class="cold-empty-dot"></span><p>暂无历史会话</p><small>小蓝正在结合客户画像准备开场</small></div>`}
function skeleton(){return `<div class="cold-skeleton" aria-label="分析加载中"><i></i><i></i><i></i></div>`}
function analysisCard(label='客户分析',copy=customerAnalysis){return `<div class="cold-card cold-analysis-card" data-label="${label}">${copy}</div>`}

function reset(){
  clearTimers();selectedAction='physical';gridUpdated=false;latestGridUpdate={key:'',count:0};customerGrid.health.progress=0;customerGrid.health.summary='待了解';customerGrid.health.detail='暂无明确健康需求信息。';panel.hidden=true;hideDock();clearComposerDraft();toastEl.hidden=true;
  messages.innerHTML=emptyState();setStep(0,'冷启动 · 无历史会话');
  later(showColdAnalysisLoading,520);
}

function showColdAnalysisLoading(){
  panel.hidden=false;setStep(1,'正在读取客户画像');
  panel.innerHTML=shell(`<div class="thinking-title"><b>⌘ 正在分析客户</b><span>冷启动</span></div><div class="cold-progress"></div><div class="cold-card">${skeleton()}</div>`);
  bindClose();later(showColdAnalysis,760);
}

function showColdAnalysis(autoAdvance=true){
  panel.hidden=false;setStep(1,'客户分析已完成');
  panel.innerHTML=shell(`<div class="thinking-title"><b>⌘ 客户分析</b><span>已完成</span></div>${analysisCard()}`);
  bindClose();if(autoAdvance)later(showColdCopyLoading,1450);
}

function showColdCopyLoading(){
  panel.hidden=false;setStep(2,'正在生成冬至开场话术');
  panel.innerHTML=shell(`<div class="thinking-title"><b>⌘ 客户分析</b><span>已完成</span></div>${analysisCard()}<div class="cold-copy-head"><i>✦</i><span>正在准备沟通话术<span class="dots"><i></i><i></i><i></i></span></span></div><div class="cold-card">${skeleton()}</div>`);
  bindClose();later(showColdReady,920);
}

function showColdReady(){
  panel.hidden=false;setStep(2,'已为你准备沟通话术');
  panel.innerHTML=shell(`<div class="thinking-title"><b>⌘ 客户分析</b><span>已完成</span></div>${analysisCard()}<div class="cold-copy-head"><i>✦</i><span>已为你准备沟通话术</span></div><div class="cold-card cold-script-card result-copy" id="coldCopy">${openingCopy}</div><div class="panel-actions cold-actions"><button id="editCold">编辑</button><button class="primary" id="sendCold">采纳并发送</button></div>`);
  bindClose();
  panel.querySelector('#editCold').addEventListener('click',()=>{const el=panel.querySelector('#coldCopy');el.contentEditable='true';el.focus();toast('可直接修改开场话术')});
  panel.querySelector('#sendCold').addEventListener('click',()=>sendColdOpening(panel.querySelector('#coldCopy').innerText.trim()));
}

function appendMessage(side,text,entryId=''){
  const article=document.createElement('article');article.className=`message ${side}`;
  if(side==='agent')article.innerHTML=`<div class="bubble"></div><div class="avatar avatar-photo agent-avatar" aria-label="代理人头像"></div>`;
  else article.innerHTML=`<div class="avatar avatar-photo customer-avatar" aria-label="客户李玉真头像"></div><div class="bubble"></div>${entryId?`<button class="ai-entry" id="${entryId}" aria-label="请小蓝分析这条消息"><span class="avatar-photo xiaolan-photo"></span><small>小蓝</small></button>`:''}`;
  article.querySelector('.bubble').textContent=text;messages.appendChild(article);
  requestAnimationFrame(()=>article.classList.add('visible'));scrollChat();return article;
}

function appendFestivalCard(){
  const article=document.createElement('article');article.className='message agent image-message';
  article.innerHTML='<div class="festival-card"><span>立冬</span><small>冬之始 · 万物藏</small><i>一</i></div><div class="avatar avatar-photo agent-avatar" aria-label="代理人头像"></div>';
  messages.appendChild(article);requestAnimationFrame(()=>article.classList.add('visible'));scrollChat();
}

function beginThread(){messages.innerHTML='<div class="time-divider">09:15</div>'}

function sendColdOpening(text){
  clearTimers();panel.hidden=true;beginThread();appendMessage('agent',text);setStep(2,'开场话术已发送');toast('已发送给李玉真');
  later(appendFestivalCard,360);
  later(()=>{
    const reply=appendMessage('customer','谢谢你啊，还记得我。','aiEntry1');setStep(3,'客户已回应 · 点击小蓝头像');
    reply.querySelector('#aiEntry1').addEventListener('click',openFirst);
  },1150);
}

function buildOpeningThread(withCustomer=true){
  beginThread();appendMessage('agent',openingCopy);appendFestivalCard();
  if(withCustomer){const reply=appendMessage('customer','谢谢你啊，还记得我。','aiEntry1');reply.querySelector('#aiEntry1').addEventListener('click',openFirst)}
}

function openFirst(){
  clearTimers();document.querySelector('#aiEntry1')?.setAttribute('hidden','');panel.hidden=false;setStep(3,'正在分析客户回应');
  panel.innerHTML=shell(`<div class="thinking-title"><b>⌘ 客户回应分析</b><span>理解当前对话</span></div><div class="cold-progress"></div><div class="cold-card">${skeleton()}</div>`);bindClose();
  later(showResponseAnalysis,650);
}

function showResponseAnalysis(){
  setStep(3,'已识别积极关系信号');
  panel.innerHTML=shell(`<div class="thinking-title"><b>⌘ 客户回应分析</b><span>已完成</span></div>${analysisCard('回应分析','客户说“还记得我”，表达出被重视后的积极回应。当前关系温度回升，适合先自然寒暄、延续信任，不宜立刻转入产品介绍。')}`);bindClose();
  later(showResponseCopyLoading,1150);
}

function showResponseCopyLoading(){
  stageStatus.textContent='正在生成自然回复';
  panel.innerHTML=shell(`<div class="thinking-title"><b>⌘ 客户回应分析</b><span>已完成</span></div>${analysisCard('回应分析','客户说“还记得我”，表达出被重视后的积极回应。当前关系温度回升，适合先自然寒暄、延续信任，不宜立刻转入产品介绍。')}<div class="cold-copy-head"><i>✦</i><span>正在生成推荐话术<span class="dots"><i></i><i></i><i></i></span></span></div><div class="cold-card">${skeleton()}</div>`);bindClose();
  later(showReply,850);
}

function showReply(){
  setStep(3,'已为你准备好回复');
  panel.innerHTML=shell(`<div class="thinking-title"><b>⌘ 客户回应分析</b><span>已完成</span></div>${analysisCard('回应分析','客户被记得后产生积极情绪，适合轻松寒暄并延续关系温度。')}<div class="cold-copy-head"><i>✦</i><span>推荐话术</span></div><div class="result-copy cold-script-card" id="replyCopy">当然记得啊，最近过得怎么样？</div><div class="panel-actions cold-actions"><button id="editReply">编辑</button><button class="primary" id="sendReply">采纳并发送</button></div>`);bindClose();
  panel.querySelector('#editReply').addEventListener('click',()=>{const el=panel.querySelector('#replyCopy');el.contentEditable='true';el.focus();toast('可直接修改话术')});
  panel.querySelector('#sendReply').addEventListener('click',()=>sendFirst(panel.querySelector('#replyCopy').innerText.trim()));
}

function sendFirst(text){
  panel.hidden=true;appendMessage('agent',text);setStep(3,'话术已发送');toast('已发送给李玉真');
  later(()=>{const reply=appendMessage('customer','挺好的，最近想去体检','aiEntry2');updateCustomerGrid('health','近期想去体检',80,'客户主动表示近期想体检，健康需求明确，适合承接体检权益。',1);setStep(4,'已更新健康格 · 点击小蓝头像');reply.querySelector('#aiEntry2').addEventListener('click',()=>{reply.querySelector('#aiEntry2').hidden=true;showThinking()})},800);
}

function updateCustomerGrid(key,summary,progress,detail,count=1){const item=customerGrid[key];if(!item)return;gridUpdated=true;latestGridUpdate={key,count};item.progress=progress;item.summary=summary;item.detail=detail;toast(`小蓝已将新信息更新至「${item.label}」`)}

function showThinking(){
  clearTimers();panel.hidden=false;setStep(4,'思考中…');
  panel.innerHTML=shell(`<div class="thinking-title"><b>⌘ 思考中…</b><span>理解当前对话</span></div><div class="thought-list">
    <div class="thought active"><i>·</i><div><b>正在了解你和李姐的聊天…</b><small>识别到客户提及体检意向</small></div></div>
    <div class="thought"><i>·</i><div><b>正在寻找合适的跟进机会…</b><small>查找可用权益与健康活动</small></div></div>
    <div class="thought"><i>·</i><div><b>正在准备推荐内容…</b><small>结合客户画像和当前语境</small></div></div>
    <div class="thought"><i>·</i><div><b>正在生成结果</b><small>即将完成</small></div></div>
  </div>`);bindClose();
  const thoughts=[...panel.querySelectorAll('.thought')];
  thoughts.forEach((item,i)=>later(()=>{thoughts.forEach((x,j)=>{x.classList.toggle('active',j===i);if(j<i){x.classList.add('done');x.querySelector('i').textContent='✓'}});if(i===thoughts.length-1)later(showActions,500)},i*460));
}

function showActions(){
  panel.hidden=false;setStep(4,'已找到 3 个跟进机会');
  panel.innerHTML=shell(`<div class="thinking-title"><b>⌘ 思考完成</b><span>已找到 3 个跟进机会</span></div><div class="insight"><b>客户提到“最近想去体检”</b>建议优先承接健康需求，避免生硬转向产品。</div><div class="action-list">
    <button class="action-card selected" data-action="physical"><span>1</span><span><b>体检预约</b><small>高端体检尚未预约 · 权益可用1次</small></span><i></i></button>
    <button class="action-card" data-action="event"><span>2</span><span><b>健康活动</b><small>10月15日 · 心梗风险检测</small></span><i></i></button>
    <button class="action-card" data-action="follow"><span>3</span><span><b>稍后跟进</b><small>明日整理权益与时间后回访</small></span><i></i></button>
  </div><div class="panel-actions"><button class="primary" id="generateReply">查看推荐话术</button></div>`);bindClose();
  panel.querySelectorAll('.action-card').forEach(btn=>btn.addEventListener('click',()=>{panel.querySelectorAll('.action-card').forEach(x=>x.classList.remove('selected'));btn.classList.add('selected');selectedAction=btn.dataset.action}));
  panel.querySelector('#generateReply').addEventListener('click',generateActionCopy);
}

function generateActionCopy(){
  panel.innerHTML=shell(`<div class="loading-row"><span class="loader">✦</span><div><b>正在生成推荐话术<span class="dots"><i></i><i></i><i></i></span></b><small>结合李玉真的权益与当前需求</small></div></div>`);bindClose();stageStatus.textContent='正在生成自然话术';later(showActionCopy,900);
}
function showActionCopy(){
  setStep(4,'已生成建议话术');panel.innerHTML=shell(`<div class="thinking-title"><b>✦ 已为你准备好回复</b><span>客户权益已校验</span></div><div class="result-copy" id="actionCopy">${copies[selectedAction]}</div><div class="panel-actions"><button id="backActions">上一步</button><button class="primary" id="sendAction">采纳并发送</button></div>`);bindClose();panel.querySelector('#backActions').addEventListener('click',showActions);panel.querySelector('#sendAction').addEventListener('click',sendAction);
}
function sendAction(){
  const text=panel.querySelector('#actionCopy').innerText.trim();panel.hidden=true;appendMessage('agent',text);toast('建议话术已发送');
  later(()=>{const reply=appendMessage('customer',selectedAction==='physical'?'周末比较方便，麻烦你帮我看看吧。':'好的，那你把详细信息发我吧。','aiEntry3');if(selectedAction==='physical')updateCustomerGrid('health','近期想体检 · 偏好周末',100,'客户主动表示近期想体检，并明确周末方便。信息来自本次会话，可直接承接体检预约。',2);stageStatus.textContent='本轮对话已完成 · 点击小蓝查看沉淀信息';reply.querySelector('#aiEntry3').addEventListener('click',showCompletionSummary);showDock()},750);
}

function showCompletionSummary(){
  document.querySelector('#aiEntry3')?.setAttribute('hidden','');panel.hidden=false;stageStatus.textContent='本轮对话信息已沉淀';
  panel.innerHTML=shell(`<div class="thinking-title"><b>✦ 关键信息已记录</b><span>来自本次对话</span></div><div class="insight"><b>小蓝识别到 2 条健康信息</b>客户近期有体检意向，并明确周末方便，已自动写入健康格，后续推荐将结合这些信息。</div><div class="panel-actions"><button class="primary" data-open-grid>查看九宫格</button></div>`);bindClose();
  panel.querySelector('[data-open-grid]').addEventListener('click',()=>panel.querySelector('[data-panel-tab="grid"]').click());
}

function jumpToResponse(){clearTimers();panel.hidden=true;buildOpeningThread(true);setStep(3,'客户已回应 · 正在分析');later(openFirst,350)}
function jumpToActions(){clearTimers();panel.hidden=true;buildOpeningThread(false);appendMessage('customer','谢谢你啊，还记得我。');appendMessage('agent','当然记得啊，最近过得怎么样？');appendMessage('customer','挺好的，最近想去体检');updateCustomerGrid('health','近期想去体检',80,'客户主动表示近期想体检，健康需求明确，适合承接体检权益。',1);showActions()}

dockButton.addEventListener('click',toggleHistoryWindow);
document.querySelector('#closeHistory').addEventListener('click',closeHistoryWindow);
historyWindow.querySelectorAll('.history-copy').forEach(btn=>btn.addEventListener('click',()=>setComposerDraft(btn.dataset.copy)));
historyWindow.querySelectorAll('.history-action').forEach(btn=>btn.addEventListener('click',()=>{
  historyWindow.querySelectorAll('.history-action').forEach(item=>item.classList.remove('selected'));
  btn.classList.add('selected');selectedAction=btn.dataset.action;
}));
document.querySelector('#historyGenerate').addEventListener('click',()=>setComposerDraft(copies[selectedAction]));
composerField.addEventListener('click',()=>{
  if(!composerDraft)return;
  hideDock();
  if(messages.querySelector('.cold-empty'))beginThread();
  appendMessage('agent',composerDraft);clearComposerDraft();stageStatus.textContent='历史建议话术已发送';toast('已发送给李玉真');
});

document.querySelector('#restartBtn').addEventListener('click',reset);
journey.forEach((item,i)=>item.addEventListener('click',()=>{
  clearTimers();
  if(i===0)reset();
  if(i===1){messages.innerHTML=emptyState();showColdAnalysis(false)}
  if(i===2){messages.innerHTML=emptyState();showColdReady()}
  if(i===3)jumpToResponse();
  if(i===4)jumpToActions();
}));
reset();

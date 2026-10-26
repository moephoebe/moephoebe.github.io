const slides=document.querySelector('#slides');
const slideEls=[...document.querySelectorAll('.slide')];
const goButtons=[...document.querySelectorAll('[data-go]')];
const journeyButtons=[...document.querySelectorAll('.journey-nav button')];
const dots=[...document.querySelectorAll('.dots button')];
const values=[...document.querySelectorAll('[data-value]')];
const nextBtn=document.querySelector('#nextBtn');
const nextLabel=nextBtn.querySelector('span');
const stageName=document.querySelector('#stageName');
const names=['触客唤醒','养客升温','促成转化'];
let current=0;
let autoTimer;

function show(index,userAction=false){
  current=Math.max(0,Math.min(2,index));
  slides.style.transform=`translateX(-${current*33.3333}%)`;
  slideEls.forEach((slide,i)=>slide.classList.toggle('active',i===current));
  journeyButtons.forEach((button,i)=>{button.classList.toggle('active',i===current);button.setAttribute('aria-selected',String(i===current))});
  dots.forEach((dot,i)=>dot.classList.toggle('active',i===current));
  values.forEach((item,i)=>item.classList.toggle('active',i===current));
  stageName.textContent=names[current];
  nextLabel.textContent=current===2?'立即体验':'下一步';
  nextBtn.querySelector('i').textContent=current===2?'✓':'→';
  if(userAction)stopAuto();
}

function stopAuto(){clearInterval(autoTimer);autoTimer=null}
function startAuto(){stopAuto();autoTimer=setInterval(()=>{if(current===2){stopAuto();return}show(current+1)},3800)}

goButtons.forEach(button=>button.addEventListener('click',()=>show(Number(button.dataset.go),true)));
nextBtn.addEventListener('click',()=>{if(current<2){show(current+1,true);return}window.location.href='index.html'});
document.querySelector('#skipBtn').addEventListener('click',()=>{window.location.href='index.html'});
document.querySelector('#replayBtn').addEventListener('click',()=>{show(0);startAuto()});

let startX=0;
document.querySelector('#phone').addEventListener('pointerdown',event=>{startX=event.clientX});
document.querySelector('#phone').addEventListener('pointerup',event=>{const distance=event.clientX-startX;if(Math.abs(distance)>45)show(current+(distance<0?1:-1),true)});

show(0);
startAuto();

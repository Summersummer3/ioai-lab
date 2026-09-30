'use strict';
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon=(name,cls='icon')=>`<svg class="${cls}" aria-hidden="true" focusable="false"><use href="#i-${name}"/></svg>`;
const num=s=>`<span class="num">${s}</span>`;
const lessonUrl=id=>id===1?'/curriculum.json':`/week${id}.json`;
const sentence=s=>/[。！？]$/.test(s)?s:`${s}。`;
const STATE_LABEL={done:'已完成',active:'进行中',todo:'未开始'};
let courses,progress,learned={};
const passed=id=>!!progress.passed?.[id];
const hinted=id=>progress.hints?.[id]>0;
const openTask=d=>d.tasks.findIndex(id=>!passed(id));
// "ioai-learned" is written by the practice page: {"w<week>d<day, 1-based>": ISO time}.
function readLearned(){try{const v=JSON.parse(localStorage.getItem('ioai-learned'));return v&&typeof v==='object'?v:{}}catch{return{}}}
const started=(w,day)=>!!learned[`w${w.id}d${day+1}`]||w.days[day].tasks.some(id=>passed(id)||hinted(id));
function dayLink(w,day){const task=Math.max(openTask(w.days[day]),0),on=started(w,day);return{started:on,task,href:`practice.html?week=${w.id}&day=${day+1}${on?`&task=${task+1}&mode=practice`:'&mode=learn'}`}}
function firstOpen(w){const day=w.days.findIndex(d=>openTask(d)>=0);return day<0?null:{w,day,task:openTask(w.days[day])}}
async function loadLesson(id){try{const r=await fetch(lessonUrl(id),{cache:'no-store'});return r.ok?await r.json():null}catch{return null}}
function renderToday(next,lesson){
  const weeks=courses.weeks,all=weeks.reduce((n,w)=>n+w.total,0),done=weeks.reduce((n,w)=>n+w.done,0),days=weeks.reduce((n,w)=>n+w.days.length,0);
  const facts=list=>{$('today-progress').innerHTML=list.map(t=>`<span>${t}</span>`).join('')};
  if(!next){const first=weeks[0];$('today-title').textContent='全部练习已完成';$('today-lead').textContent=`${weeks.length} 周、${all} 道练习都已通过。`;facts([`全部 ${num(`${done} / ${all}`)}`]);$('strip-label').textContent='接下来：';$('strip-text').textContent='隔几天从空白重做一遍，或在自由练习场组合学过的方法。';$('today-next').hidden=true;$('continue-text').textContent=`复习第 ${first.id} 周`;$('continue-link').href=dayLink(first,0).href;return}
  const {w,day}=next,d=w.days[day],info=lesson?.days?.[day],link=dayLink(w,day),task=link.task,title=info?.tasks?.[task]?.title,prev=weeks[weeks.indexOf(w)-1],n=d.tasks.length,k=d.tasks.filter(passed).length;
  $('today-title').innerHTML=`<span class="nw">第 ${w.id} 周 · 第 ${day+1} 天：</span><span class="nw">${esc(d.short)}</span>`;
  $('today-lead').textContent=info?[info.title,info.description].filter(Boolean).map(sentence).join(''):'';$('today-lead').hidden=!$('today-lead').textContent;
  facts(done?[...(!w.done&&prev&&prev.done===prev.total?[`第 ${prev.id} 周已完成`]:[]),`本周 ${num(`${w.done} / ${w.total}`)}`,`全部 ${num(`${done} / ${all}`)}`]:[`共 ${num(weeks.length)} 周`,`${num(days)} 天`,`${num(all)} 道练习`]);
  $('strip-text').textContent=info?.question||'';$('strip-copy').hidden=!info?.question;
  $('today-next').innerHTML=!link.started?`先读笔记、运行示例，再做 ${n} 题。`:k?`已通过 ${num(`${k} / ${n}`)} 题，接着做第 ${task+1} 题。`:`从第 ${task+1} 题开始练习，笔记随时可以切回。`;
  $('continue-text').textContent=!link.started?`开始学习：第 ${day+1} 天 · ${d.short}`:title?`继续：${title}`:`继续：第 ${day+1} 天第 ${task+1} 题`;
  $('continue-link').href=link.href;
}
function step(w,d,i,next){
  const n=d.tasks.length,k=d.tasks.filter(passed).length,current=next?.w===w&&next.day===i,state=k===n?'done':current?'current':started(w,i)?'partial':'todo';
  return `<li class="step is-${state}"><a href="${dayLink(w,i).href}"${current?' aria-current="step"':''}><span class="step-head"><span class="mark">${state==='done'?icon('check'):''}</span><span class="step-day">第 ${i+1} 天</span></span><span class="step-name">${esc(d.short)}</span><span class="step-count">${num(`${k} / ${n}`)}${state==='done'?'<span class="sr-only">，已完成</span>':''}</span></a>${i<w.days.length-1?'<span class="step-line" aria-hidden="true"></span>':''}</li>`;
}
function renderWeeks(next){
  const opened=next?.w||courses.weeks[0];
  $('weeks').innerHTML=courses.weeks.map(w=>{
    const open=w===opened,start=firstOpen(w),id=`week-${w.id}`,href=dayLink(w,w.state==='done'||!start?0:start.day).href,action=w.state==='done'?'复习本周':w.state==='active'?'继续本周':'开始本周';
    return `<div class="week is-${w.state}${open?' is-open':''}"><div class="week-row"><div class="week-title"><h3><button class="week-toggle" type="button" aria-expanded="${open}" aria-controls="${id}-plan" aria-describedby="${id}-state ${id}-count">第 ${w.id} 周 · ${esc(w.title)}</button></h3><span class="state" id="${id}-state">${STATE_LABEL[w.state]}</span></div><p class="week-desc">${esc(w.description)}</p><div class="week-meta"><span class="week-count" id="${id}-count">${num(`${w.done} / ${w.total}`)} 题</span><span class="meter" aria-hidden="true"><span style="width:${w.total?w.done/w.total*100:0}%"></span></span></div><a class="week-action button-secondary" href="${href}">${action}<span class="sr-only">：第 ${w.id} 周</span></a>${icon('chevron','icon chev')}</div><div class="plan" id="${id}-plan"${open?'':' hidden'}><ol class="steps" aria-label="第 ${w.id} 周每日安排">${w.days.map((d,i)=>step(w,d,i,next)).join('')}</ol></div></div>`;
  }).join('');
}
function toggleWeek(button){const open=button.getAttribute('aria-expanded')!=='true';document.querySelectorAll('.week-toggle').forEach(b=>{const on=b===button&&open,plan=$(b.getAttribute('aria-controls'));b.setAttribute('aria-expanded',on);b.closest('.week').classList.toggle('is-open',on);if(on&&plan.hidden)plan.classList.add('reveal');plan.hidden=!on})}
async function init(){try{const responses=await Promise.all([fetch('/courses.json',{cache:'no-store'}),fetch('/api/state',{cache:'no-store'})]);if(responses.some(r=>!r.ok))throw Error();[courses,progress]=await Promise.all(responses.map(r=>r.json()));progress??={};learned=readLearned();
for(const w of courses.weeks){w.total=w.days.reduce((n,d)=>n+d.tasks.length,0);w.done=w.days.reduce((n,d)=>n+d.tasks.filter(passed).length,0);w.state=w.done===w.total?'done':w.done||w.days.some((_,i)=>started(w,i))?'active':'todo'}
const nextWeek=courses.weeks.find(w=>w.done<w.total),next=nextWeek?firstOpen(nextWeek):null;
renderToday(next,next&&await loadLesson(next.w.id));renderWeeks(next);
$('free-link').href=`practice.html?week=${(next?.w||courses.weeks.at(-1)).id}&free=1`;
$('weeks').addEventListener('click',e=>{const b=e.target.closest('.week-toggle');if(b)toggleWeek(b)});
if(document.modelContext?.registerTool){try{
  document.modelContext.registerTool({
    name:'read_week_overview',description:'读取各周课程及其完成数量。',
    inputSchema:{type:'object',properties:{},additionalProperties:false},
    annotations:{readOnlyHint:true},
    execute:async()=>({weeks:courses.weeks.map(w=>({week:w.id,title:w.title,completed:w.done,total:w.total}))})
  });
}catch{}}
}catch{$('today').innerHTML='<h1 id="today-title">课程暂时未加载</h1><p class="error" role="alert">请重新双击启动脚本，再刷新这个页面。</p>';$('weeks-section').hidden=true}finally{$('main').removeAttribute('aria-busy')}}
init();window.addEventListener('pageshow',e=>{if(e.persisted)location.reload()});

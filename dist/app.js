'use strict';
let curriculum, allWeeks, config, state={schemaVersion:3,week:1,positions:{},codes:{},passed:{},hints:{},seen:{},day:0,task:0}, free=false, mode='learn', busy=false, aborter=null, saveTimer, toastTimer, errorLine=0, gutterKey='', tabOut=false, paintFrame=0;
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const weekLabel=()=>`第 ${state.week} 周`;
const icon=(name,cls='')=>`<svg class="icon${cls?' '+cls:''}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const num=n=>`<span class="num">${n}</span>`;
const day=()=>curriculum.days[state.day];
const task=()=>day().tasks[state.task];
const learning=()=>!free&&mode==='learn';
const checking=()=>!free&&mode==='practice';
const codeKey=()=>free?'free':task().id;
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
function weekHeading(){document.title=`IOAI Lab · 第 ${state.week} 周练习`;$('week-title').innerHTML=`第 ${num(state.week)} 周 · ${esc(curriculum.title)}`}
function toast(message){$('toast').textContent=message;$('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),3000)}
function saved(ok){$('save-status').textContent=ok?'已自动保存到本机':'本地服务未连接 · 请导出备份';$('save-alert').hidden=ok}
async function persist(){state.schemaVersion=3;state.positions[state.week]={day:state.day,task:state.task};try{localStorage.setItem('ioai-week1',JSON.stringify(state))}catch{};try{const r=await fetch('/api/state',{method:'POST',headers:{'Content-Type':'application/json','X-Lab-Token':config.token},body:JSON.stringify(state)});if(!r.ok)throw Error();saved(true)}catch{saved(false)}}
function save(){clearTimeout(saveTimer);saveTimer=setTimeout(persist,350)}

// "Learned" lives in the browser (the server keeps a fixed field list): {"w2d4": ISO time}. The home page reads the same key.
function readLearned(){try{const v=JSON.parse(localStorage.getItem('ioai-learned'));return v&&typeof v==='object'&&!Array.isArray(v)?v:{}}catch{return{}}}
function markLearned(){const all=readLearned(),k=`w${state.week}d${state.day+1}`;if(all[k])return;all[k]=new Date().toISOString();try{localStorage.setItem('ioai-learned',JSON.stringify(all))}catch{}}
function started(i){return !!readLearned()[`w${state.week}d${i+1}`]||curriculum.days[i].tasks.some(t=>state.passed[t.id]||(state.hints[t.id]||0)>0)}
const ruleMode=i=>started(i)?'practice':'learn';
const scratchKey=()=>`ioai-scratch-w${state.week}d${state.day+1}`;
const SCRATCH_START='# 示例草稿：点笔记代码上的\n# 「复制到运行区」，示例会出现在这里。\n# 改一改再运行，看看结果怎么变。\n';
const FREE_START='import numpy as np\nimport pandas as pd\nimport matplotlib.pyplot as plt\n\n# 从这里开始你的实验\nx = np.arange(10)\nprint(x ** 2)\n';
function readScratch(){try{return localStorage.getItem(scratchKey())}catch{return null}}

// Python highlighting: the textarea stays the real input (undo, IME, keyboard); an aria-hidden <pre> underneath shows the colours.
const PY_KEYWORDS=new Set('False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield'.split(' '));
const PY_BUILTINS=new Set('abs all any bool bytes callable chr dict dir divmod enumerate filter float format frozenset getattr hasattr hash hex id input int isinstance issubclass iter len list map max min next object open ord pow print range repr reversed round set setattr slice sorted str sum super tuple type vars zip self cls Exception ValueError TypeError KeyError IndexError NameError AttributeError ZeroDivisionError RuntimeError'.split(' '));
const PY_TOKEN=/(#[^\n]*)|((?:[rRbBuUfF]{1,2})?(?:'''[\s\S]*?(?:'''|$)|"""[\s\S]*?(?:"""|$)|'(?:\\.|[^'\\\n])*(?:'|$|(?=\n))|"(?:\\.|[^"\\\n])*(?:"|$|(?=\n))))|(0[xX][\da-fA-F_]+|0[oO][0-7_]+|0[bB][01_]+|(?:\d[\d_]*(?:\.[\d_]*)?|\.\d[\d_]*)(?:[eE][+-]?\d[\d_]*)?[jJ]?)|(@[A-Za-z_][\w.]*)|([A-Za-z_]\w*)/g;
function atLineStart(src,i){while(i>0&&(src[i-1]===' '||src[i-1]==='\t'))i--;return i===0||src[i-1]==='\n'}
function callFollows(src,i){while(src[i]===' '||src[i]==='\t')i++;return src[i]==='('}
function pyTokens(src){const out=[];let last=0,prev='',m;PY_TOKEN.lastIndex=0;while((m=PY_TOKEN.exec(src))){if(m.index>last)out.push(['',src.slice(last,m.index)]);const t=m[0];let c='';if(m[1])c='c';else if(m[2])c='s';else if(m[3])c='n';else if(m[4])c=atLineStart(src,m.index)?'d':'';else c=PY_KEYWORDS.has(t)?'k':prev==='def'||prev==='class'?'f':PY_BUILTINS.has(t)?'b':callFollows(src,PY_TOKEN.lastIndex)?'f':'';prev=m[5]?t:'';out.push([c,t]);last=PY_TOKEN.lastIndex}if(last<src.length)out.push(['',src.slice(last)]);return out}
const escHtml=s=>s.replace(/[&<>]/g,c=>c==='&'?'&amp;':c==='<'?'&lt;':'&gt;');
function highlight(src){let h='';for(const [c,t] of pyTokens(src))h+=c?`<span class="t${c}">${escHtml(t)}</span>`:escHtml(t);return h}
function highlightLines(src){const rows=[''];for(const [c,t] of pyTokens(src))t.split('\n').forEach((part,i)=>{if(i)rows.push('');if(part)rows[rows.length-1]+=c?`<span class="t${c}">${escHtml(part)}</span>`:escHtml(part)});return rows.map(r=>`<span class="line">${r}</span>`).join('')}
function paint(now){cancelAnimationFrame(paintFrame);const draw=()=>{const v=$('editor').value;$('code-view').innerHTML=highlight(v)+(v.endsWith('\n')?' ':'')};if(now)draw();else paintFrame=requestAnimationFrame(draw)}
function syncScroll(){const ed=$('editor');$('code-view').style.transform=`translate(${-ed.scrollLeft}px,${-ed.scrollTop}px)`;$('line-numbers').scrollTop=ed.scrollTop;if(errorLine)placeBand()}

function lines(){const n=$('editor').value.split('\n').length,k=n+':'+errorLine,g=$('line-numbers');if(k!==gutterKey){gutterKey=k;g.style.setProperty('--digits',String(Math.max(n,10)).length);g.innerHTML=Array.from({length:n},(_,i)=>`<span${i+1===errorLine?' class="error-line"':''}>${i+1}</span>`).join('')}g.scrollTop=$('editor').scrollTop}
function placeBand(){const b=$('error-band');b.hidden=!errorLine;if(!errorLine)return;const ed=$('editor'),cs=getComputedStyle(ed),lh=parseFloat(cs.lineHeight);b.style.height=lh+'px';b.style.transform=`translateY(${parseFloat(cs.paddingTop)+(errorLine-1)*lh-ed.scrollTop}px)`}
function markError(n){errorLine=n;const ed=$('editor');if(n){const cs=getComputedStyle(ed),lh=parseFloat(cs.lineHeight),top=parseFloat(cs.paddingTop)+(n-1)*lh;if(top<ed.scrollTop||top+lh>ed.scrollTop+ed.clientHeight)ed.scrollTop=top-(ed.clientHeight-lh)/2}lines();placeBand()}
function edited(){if(errorLine){errorLine=0;placeBand()}lines();paint();remember()}
const lineStart=(v,i)=>i&&v.lastIndexOf('\n',i-1)+1;
// insertText keeps the browser undo stack (setRangeText wipes it); setting the selection afterwards closes the typing group so each Tab/Enter undoes on its own.
function editRange(a,from,to,text,s=from+text.length,e=s){a.setSelectionRange(from,to);if(!(text?document.execCommand('insertText',false,text):from===to||document.execCommand('delete'))){a.setRangeText(text,from,to);edited()}a.setSelectionRange(s,e)}
function indentLines(a,out){const v=a.value,s=a.selectionStart,e=a.selectionEnd,from=lineStart(v,s);if(!out&&!v.slice(s,e).includes('\n'))return editRange(a,s,e,'    ');let to=v.indexOf('\n',e>s&&v[e-1]==='\n'?e-1:e);if(to<0)to=v.length;const old=v.slice(from,to),rows=old.split('\n'),cut=rows.map(r=>out?r.match(/^ {0,4}/)[0].length:0),text=rows.map((r,i)=>out?r.slice(cut[i]):r&&'    '+r).join('\n');if(text===old)return;if(rows.length>1||!out)editRange(a,from,to,text,from,from+text.length);else editRange(a,from,to,text,Math.max(from,s-cut[0]),Math.max(from,e-cut[0]))}
// Line comments: one undo step; ignore an unselected next line at column zero.
function toggleComment(a){
 const v=a.value,s=a.selectionStart,e=a.selectionEnd,dir=a.selectionDirection,from=lineStart(v,s);
 let to=v.indexOf('\n',e>s&&v[e-1]==='\n'?e-1:e);if(to<0)to=v.length;
 const rows=v.slice(from,to).split('\n'),nonempty=rows.filter(r=>r.trim());
 const remove=nonempty.length>0&&nonempty.every(r=>/^[ \t]*#/.test(r));
 const edits=[];let offset=from;
 for(const row of rows){
  if(row.trim()||rows.length===1){const indent=row.match(/^[ \t]*/)[0].length,pos=offset+indent;
   edits.push({pos,cut:remove?(row[indent+1]===' '?2:1):0,put:remove?'':'# '});}
  offset+=row.length+1;
 }
 if(!edits.length)return;
 let text=v.slice(from,to);for(const edit of [...edits].reverse()){const i=edit.pos-from;text=text.slice(0,i)+edit.put+text.slice(i+edit.cut)}
 const map=pos=>{let delta=0;for(const x of edits){if(pos<x.pos)break;if(pos<=x.pos+x.cut)return x.pos+delta+x.put.length;delta+=x.put.length-x.cut}return pos+delta};
 const top=a.scrollTop,left=a.scrollLeft;editRange(a,from,to,text,map(s),map(e));a.setSelectionRange(map(s),map(e),dir);a.scrollTop=top;a.scrollLeft=left;syncScroll();
}
function remember(){const v=$('editor').value;if(learning()){try{localStorage.setItem(scratchKey(),v)}catch{};return}state.codes[codeKey()]=v;try{localStorage.setItem('ioai-week1',JSON.stringify(state))}catch{};save()}
function setEditor(value){const ed=$('editor');ed.value=value;ed.scrollTop=0;ed.scrollLeft=0;paint(true);syncScroll()}

const dayDone=d=>d.tasks.every(t=>state.passed[t.id]);
const stepKind=i=>!free&&i===state.day?'current':dayDone(curriculum.days[i])?'done':started(i)?'started':'upcoming';
function stepHtml(d,i,kinds){const kind=kinds[i],done=dayDone(d),cur=kind==='current',named=kind!=='upcoming',joined=i&&kinds[i-1]!=='upcoming',status={current:'，当前',done:'，已完成',started:'，进行中',upcoming:'，未开始'}[kind];return `<li class="step ${kind}${cur&&done?' done':''}${joined?' joined':i?' spaced':''}">${joined?'<span class="step-line" aria-hidden="true"></span>':''}<a class="step-link" href="practice.html?week=${state.week}&amp;day=${i+1}" data-day="${i}"${cur?' aria-current="step"':''}><span class="step-box"><span class="step-mark" aria-hidden="true">${done?icon('check'):''}</span><span class="step-day">第 ${num(i+1)} 天</span><span class="${named?'step-name':'sr-only'}">${named?'':' · '}${esc(d.short)}</span><span class="sr-only">${status}</span></span></a></li>`}
function progress(){const all=curriculum.days.flatMap(d=>d.tasks),n=all.filter(t=>state.passed[t.id]).length;$('progress-text').innerHTML=`${n} / ${all.length}`;const dayFocus=$('days').contains(document.activeElement),kinds=curriculum.days.map((_,i)=>stepKind(i));$('days').innerHTML=curriculum.days.map((d,i)=>stepHtml(d,i,kinds)).join('');const track=$('days').parentElement,now=$('days').querySelector('.current');if(now&&track.scrollWidth>track.clientWidth)track.scrollLeft+=now.getBoundingClientRect().left-track.getBoundingClientRect().left-(track.clientWidth-now.offsetWidth)/2;if(dayFocus)$('days').querySelector('[aria-current]')?.focus();renderPractice();$('free-link').toggleAttribute('aria-current',free);if(free)$('free-link').setAttribute('aria-current','page')}
function renderPractice(){const d=day(),focus=$('practice-list').contains(document.activeElement);$('practice-list').innerHTML=d.tasks.map((t,i)=>{const passed=!!state.passed[t.id],cur=checking()&&i===state.task;return `<li><button type="button" class="practice-row" data-task="${i}"${cur?' aria-current="step"':''}><span class="row-num">${i+1}</span><span class="row-title">${esc(t.title)}</span><span class="state-mark${passed?' passed':''}" aria-hidden="true">${passed?icon('check'):''}</span><span class="sr-only">${passed?'，已通过':'，未通过'}</span></button></li>`}).join('');if(focus)$('practice-list').querySelector(`[data-task="${state.task}"]`)?.focus()}
function renderTaskTabs(){const d=day(),focus=$('task-tabs').contains(document.activeElement);$('task-tabs').innerHTML=d.tasks.map((t,i)=>`<button class="task-tab${state.passed[t.id]?' passed':''}" role="tab" id="task-tab-${i}" aria-selected="${i===state.task}" aria-controls="task-panel" tabindex="${i===state.task?0:-1}" data-task="${i}"><span class="tab-num">${state.passed[t.id]?icon('check'):i+1}</span>${esc(t.short)}</button>`).join('');$('task-panel').setAttribute('aria-labelledby','task-tab-'+state.task);if(focus)$('task-tab-'+state.task).focus()}
function setStatus(text,tone=''){$('run-status').textContent=text;$('run-status').dataset.tone=tone}
function resetResult(){setStatus('准备就绪');$('run-summary').textContent='';const [lead,sub]=learning()?['运行示例后，结果会显示在这里。','把笔记里的代码复制到运行区，或直接改写后运行。']:free?['写下一个想法，运行看看。','文字输出、图表和生成的文件会显示在这里。']:['写下你的思路，运行看看。','输出、检查结果和图表会显示在这里。'];$('result-content').innerHTML=`<div class="empty-result"><p>${lead}</p><small>${sub}</small></div>`}
function placeThumb(){const tab=$(mode==='practice'?'mode-practice':'mode-learn'),sw=$('mode-switch');sw.dataset.at=mode;sw.style.setProperty('--thumb-x',tab.offsetLeft-1+'px');sw.style.setProperty('--thumb-w',tab.offsetWidth+2+'px');if(!sw.hidden&&tab.offsetWidth)requestAnimationFrame(()=>sw.dataset.ready='')}
function render(){const url=new URL(location.href);url.searchParams.set('week',state.week);url.searchParams.set('day',state.day+1);url.searchParams.set('task',state.task+1);if(free){url.searchParams.set('free','1');url.searchParams.delete('mode')}else{url.searchParams.delete('free');url.searchParams.set('mode',mode)}history.replaceState(null,'',url);document.body.dataset.mode=free?'free':mode;progress();const d=day(),t=task();
$('breadcrumb').innerHTML=`<span>${weekLabel()}</span>${icon('chevron-right','crumb-sep')}<span class="crumb-now">${free?'自由练习场':`第 ${state.day+1} 天 · ${esc(d.short)}`}</span>`;
$('lecture-no').innerHTML=free?'':`第${num(state.day+1)}讲`;$('lecture-no').hidden=free;$('lecture-title').textContent=free?'让想法跑起来':d.title;$('question-label').textContent=free?'运行环境：':'本讲核心问题：';$('question-text').textContent=free?'可使用 NumPy、Pandas、Matplotlib 和 scikit-learn；每次运行都是全新的环境。':d.question;
$('mode-switch').hidden=free;$('mode-learn').setAttribute('aria-selected',learning());$('mode-practice').setAttribute('aria-selected',checking());$('mode-learn').tabIndex=checking()?-1:0;$('mode-practice').tabIndex=checking()?0:-1;$('handout-body').setAttribute('aria-labelledby',checking()?'mode-practice':'mode-learn');$('practice-meta').innerHTML=`${num(d.tasks.length)} 题`;$('practice-count').textContent=d.tasks.length;
$('learn-view').hidden=checking();$('practice-view').hidden=!checking();syncNotes();
if(checking()){renderTaskTabs();$('task-level').textContent=`练习 ${state.task+1} / ${d.tasks.length}`;$('task-title').textContent=t.title;$('task-description').innerHTML=t.description;$('requirements').innerHTML=`<div class="mini-label">完成这些步骤</div><ul>${t.requirements.map(x=>`<li>${x}</li>`).join('')}</ul>`;$('data-panel').innerHTML=t.data||'';const ex=exampleFor(state.task);$('example-row').hidden=ex<0;if(ex>=0){$('example-link').href='#note-sec-'+(ex+1);$('example-link').innerHTML=`${icon('arrow-left')}相关知识：${esc(notesHeads[ex].textContent)}`}$('solution-details').open=false;$('solution-code').innerHTML=highlight(t.solution);renderHints();$('handout-scroll').scrollTop=0}
$('file-name').textContent=free?'playground.py':learning()?'示例草稿.py':`${t.id}.py`;$('run-button').className=learning()?'button-secondary':free?'button-primary':'button-run';$('run-button').innerHTML=icon('play','icon-fill')+(free?'运行代码':learning()?'运行':'运行并检查');
setEditor(free?(state.codes.free??FREE_START):learning()?(readScratch()??SCRATCH_START):(state.codes[t.id]??t.starter));
$('start-practice').hidden=!learning();$('next-task').hidden=learning();$('next-task').innerHTML=free?`${icon('arrow-left')}回到第 ${state.day+1} 天`:(state.day===6&&state.task===2?'返回训练中心':state.task===2?`进入第 ${state.day+2} 天`:'下一题')+(free?'':icon('arrow-right'));footStatus();
markError(0);resetResult();placeThumb()}
function footStatus(){if(free){$('foot-status').textContent='每次运行最长 30 秒，变量不会跨次保留。';return}if(checking()){const d=day(),n=d.tasks.filter(t=>state.passed[t.id]).length;$('foot-status').innerHTML=`本讲练习已通过 ${num(`${n} / ${d.tasks.length}`)} 题`;return}const cur=currentSection();$('foot-status').innerHTML=!notesHeads.length?'':cur<0?`本讲共 ${num(notesHeads.length)} 节`:`${num(`${cur+1} / ${notesHeads.length}`)} · ${esc(notesHeads[cur].textContent)}`}
function navigate(d,t,m){if(busy){toast('请先停止当前运行');return}remember();saveNotesPos();free=false;state.day=d;state.task=t;mode=m||ruleMode(d);if(mode==='practice')markLearned();save();render()}
function setMode(m,t=state.task){if(free)return;if(busy){toast('请先停止当前运行');return}if(m===mode&&t===state.task)return;const switched=m!==mode;remember();saveNotesPos();mode=m;state.task=t;if(m==='practice')markLearned();save();render();if(switched)shiftViews()}
// The one authored transition: the thumb slides (CSS) and the incoming view drifts in from the side it was chosen on.
function shiftViews(){if(reduceMotion.matches)return;const to=checking()?$('practice-view'):$('learn-view'),dx=checking()?14:-14;to.animate([{opacity:.35,transform:`translateX(${dx}px)`},{opacity:1,transform:'none'}],{duration:300,easing:'cubic-bezier(.16,1,.3,1)'})}
function renderHints(){if(!checking())return;const t=task(),n=state.hints[t.id]||0,done=n>=t.hints.length,b=$('hint-button');$('hint-count').textContent=`${n} / ${t.hints.length}`;$('hints').innerHTML=t.hints.slice(0,n).map((h,i)=>`<div class="hint">${i+1}. ${h}</div>`).join('');b.setAttribute('aria-disabled',done);b.querySelector('use').setAttribute('href',done?'#i-check':'#i-bulb');$('hint-text').textContent=done?(t.hints.length?'提示已全部展开':'本题没有提示'):'给我一点提示'}
const ERROR_TIPS={KeyError:'找不到这个键或列名。检查拼写和大小写，可以先 <code>print(df.columns)</code> 看看有哪些列。',NameError:'变量或函数还没定义。检查拼写，或者确认本次代码里已经创建过它；每次运行都是全新环境。',TypeError:'数据类型和操作对不上，比如把文字和数字相加，或者给函数传错了参数。可以用 <code>type(x)</code> 看看变量是什么类型。',ValueError:'类型没问题，但取值不合适，比如形状对不上、含有缺失值，或者把文字转成数字。先打印数据和 <code>.shape</code> 看看。',IndexError:'下标超出了范围。下标从 0 开始，长度为 n 时最后一个是 n-1；可以先打印 <code>len()</code> 或 <code>.shape</code>。',AttributeError:'这个对象没有这个属性或方法。检查拼写，并用 <code>type(x)</code> 确认对象类型，比如数组和 DataFrame 的方法不一样。',ImportError:'导入失败。检查模块名的拼写；这里可以使用 numpy、pandas、matplotlib 和 sklearn（scikit-learn 的导入名）。',SyntaxError:'这一行不符合 Python 语法。常见原因：括号或引号没有配对、漏了冒号、用了中文标点。也看看上一行。',IndentationError:'缩进没有对齐。同一段代码要对齐；以冒号结尾的行（if、for、def 等）下一行要多缩进 4 个空格。',ZeroDivisionError:'除数是 0。检查分母，比如数量为 0 或数据为空的情况。'};
ERROR_TIPS.ModuleNotFoundError=ERROR_TIPS.ImportError;ERROR_TIPS.TabError=ERROR_TIPS.IndentationError;
function errorCard(r,head){const x=r.error_info,msg=x?x.message:r.error.trim(),tip=x&&ERROR_TIPS[x.type],box=document.createElement('div');box.className='error-card';box.innerHTML=`<p class="error-head">${icon('alert')}<strong>${esc(head)}</strong></p>${msg?`<pre class="error-message">${esc(msg)}</pre>`:''}${tip?`<p class="error-tip">${tip}</p>`:''}${x?.trace?`<details class="error-trace"><summary>查看完整报错</summary><pre>${esc(x.trace)}</pre></details>`:''}`;return box}
async function run(){if(busy)return;remember();const graded=checking(),runKey=graded?task().id:null,code=$('editor').value;busy=true;aborter=new AbortController();$('run-button').disabled=true;$('stop-button').hidden=false;markError(0);setStatus('正在运行…','busy');$('run-summary').textContent='正在运行';$('result-content').innerHTML='<p class="output-text">正在执行 Python…</p>';try{const response=await fetch('/api/run',{method:'POST',signal:aborter.signal,headers:{'Content-Type':'application/json','X-Lab-Token':config.token},body:JSON.stringify({code,task:runKey})});const r=await response.json();if(!response.ok)throw Error(r.error||'运行服务出错');const el=$('result-content'),checks=r.checks||[],ok=checks.filter(c=>c.passed).length,x=r.error_info,head=r.error?x?(x.line?`第 ${x.line} 行出错：${x.type}`:`代码出错：${x.type}`):'运行没有完成':'',skipped=r.error&&graded&&!checks.length;el.replaceChildren();if(r.stdout){const p=document.createElement('pre');p.className='output-text';p.textContent=r.stdout;el.append(p)}if(r.error)el.append(errorCard(r,head));if(skipped){const p=document.createElement('p');p.className='check skipped';p.innerHTML=`${icon('circle')}<span>${x?'代码出错，':''}本次没有运行检查。改好后再运行一次。</span>`;el.append(p)}for(const c of checks){const block=document.createElement('div');block.className=`check ${c.passed?'':'fail'}`;block.innerHTML=`${icon(c.passed?'check':'circle')}<div>${esc(c.name)}${!c.passed?`<small>${esc(c.message)}</small>`:''}</div>`;el.append(block)}for(const src of r.images||[]){const img=document.createElement('img');img.src='data:image/png;base64,'+src;img.alt='本次 Python 运行生成的图表';img.className='result-figure';el.append(img)}if(r.files?.length){const wrap=document.createElement('div');wrap.className='result-files';for(const f of r.files){const a=document.createElement('a');a.href='data:application/octet-stream;base64,'+f.data;a.download=f.name;a.textContent='下载 '+f.name;wrap.append(a)}el.append(wrap)}const passed=graded&&!r.error&&checks.length&&ok===checks.length;if(passed){state.passed[runKey]={at:new Date().toISOString(),withSolution:!!state.seen[runKey]};save();progress();renderTaskTabs();footStatus();const p=document.createElement('div');p.className='success-banner';p.innerHTML=icon('check')+(state.seen[runKey]?'本题通过。看过解法的题，记得隔天独立重做。':'本题通过，做得好！试着解释每一步为什么这样写。');el.append(p)}if(!el.children.length)el.innerHTML='<p class="output-text">运行完成，没有输出。可以用 print() 查看变量。</p>';if(x?.line>0&&$('editor').value===code)markError(Math.min(x.line,code.split('\n').length));const [text,tone,said]=r.error?['运行出错','danger',head+(skipped?'。本次没有运行检查':'')]:!graded||!checks.length?['运行成功','done','运行成功']:passed?['全部通过','done','全部检查通过，本题完成']:[`未通过 · ${ok}/${checks.length}`,'warn',`未通过：${checks.length} 项检查中通过了 ${ok} 项`];setStatus(text,tone);$('run-summary').textContent=said}catch(e){const stopped=e.name==='AbortError';$('result-content').innerHTML=`<p class="output-text output-error">${stopped?'运行已停止。':esc(e.message)+'。请确认本地服务正在运行。'}</p>`;setStatus(stopped?'已停止':'连接失败',stopped?'':'danger');$('run-summary').textContent=stopped?'运行已停止':'连接失败，请确认本地服务正在运行'}finally{busy=false;$('run-button').disabled=false;$('stop-button').hidden=true;aborter=null}}
$('editor').addEventListener('input',edited);$('editor').addEventListener('scroll',syncScroll,{passive:true});$('editor').addEventListener('blur',()=>tabOut=false);$('editor').addEventListener('keydown',e=>{if(e.isComposing||e.keyCode===229)return;const a=e.target;if(e.key==='Escape'){tabOut=true;return}if(e.key==='Tab'&&!e.altKey&&!e.ctrlKey&&!e.metaKey){if(tabOut){tabOut=false;return}e.preventDefault();indentLines(a,e.shiftKey);return}if(!['Shift','Control','Alt','Meta'].includes(e.key))tabOut=false;if((e.metaKey||e.ctrlKey)&&!e.altKey&&!e.shiftKey&&(e.key==='/'||e.code==='Slash')){e.preventDefault();toggleComment(a);return}if((e.metaKey||e.ctrlKey)&&e.key==='Enter'){e.preventDefault();run()}else if(e.key==='Enter'){e.preventDefault();const start=a.selectionStart,prefix=a.value.slice(lineStart(a.value,start),start),indent=(prefix.match(/^ */)||[''])[0]+(prefix.trimEnd().endsWith(':')?'    ':'');editRange(a,start,a.selectionEnd,'\n'+indent)}});
$('task-tabs').addEventListener('click',e=>{const b=e.target.closest('[data-task]');if(b)navigate(state.day,Number(b.dataset.task),'practice')});
$('task-tabs').addEventListener('keydown',e=>{const n=day().tasks.length,i=Number(e.target.closest('[data-task]')?.dataset.task??state.task),to={ArrowLeft:(i+n-1)%n,ArrowRight:(i+1)%n,Home:0,End:n-1}[e.key];if(to===undefined||e.altKey||e.ctrlKey||e.metaKey)return;e.preventDefault();if(to===state.task)$('task-tab-'+to).focus();else navigate(state.day,to,'practice')});
$('mode-switch').addEventListener('click',e=>{const b=e.target.closest('[data-mode]');if(b)setMode(b.dataset.mode)});
$('mode-switch').addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key)||e.altKey||e.ctrlKey||e.metaKey)return;e.preventDefault();const to=e.key==='Home'?'learn':e.key==='End'?'practice':mode==='learn'?'practice':'learn';setMode(to);$(to==='learn'?'mode-learn':'mode-practice').focus()});
$('practice-list').addEventListener('click',e=>{const b=e.target.closest('[data-task]');if(b)setMode('practice',Number(b.dataset.task))});
$('days').addEventListener('click',e=>{const a=e.target.closest('a[data-day]');if(!a||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();const d=Number(a.dataset.day);if(free||d!==state.day)navigate(d,0)});
$('start-practice').onclick=()=>setMode('practice');
$('skip-link').onclick=e=>{e.preventDefault();$('editor').focus()};
$('run-button').onclick=run;$('stop-button').onclick=()=>{aborter?.abort();fetch('/api/stop',{method:'POST',headers:{'X-Lab-Token':config.token}}).catch(()=>{})};
$('hint-button').onclick=()=>{const t=task(),n=state.hints[t.id]||0;if(n>=t.hints.length)return;state.hints[t.id]=n+1;renderHints();save()};$('solution-details').addEventListener('toggle',()=>{if($('solution-details').open&&checking()){state.seen[task().id]=true;save()}});
$('reset-code').onclick=()=>{if(busy)return;if(learning()){if(!confirm('将示例草稿恢复为初始内容？'))return;try{localStorage.removeItem(scratchKey())}catch{};setEditor(SCRATCH_START);lines();toast('已恢复示例草稿');return}if(!confirm('将当前代码恢复为初始模板？已通过记录会保留。'))return;delete state.codes[codeKey()];if(!free){delete state.hints[codeKey()];delete state.seen[codeKey()];}save();render();toast('已恢复初始代码')};
$('free-link').addEventListener('click',e=>{if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();if(free)return;if(busy)return toast('请先停止当前运行');remember();saveNotesPos();free=true;render()});
$('next-task').onclick=async()=>{if(busy)return toast('请先停止当前运行');if(free){remember();free=false;mode=ruleMode(state.day);render();return}if(state.day===6&&state.task===2){remember();clearTimeout(saveTimer);await persist();location.href='/';}else if(state.task===2)navigate(state.day+1,0);else navigate(state.day,state.task+1,'practice')};
$('save-alert').onclick=()=>$('backup').click();

// Notes: inline in the handout; the rail lists its h3 sections, and the reading position is kept per day.
const freeNotes=()=>'<h3>你的 Python 草稿纸</h3><p>尝试今天学到的方法，也可以把自己的小例子写在这里。输出文字用 <code>print()</code>，显示图表用 <code>plt.show()</code>。</p><div class="free-note">'+(state.week>=2?'scikit-learn 自带的数据集（如 <code>load_iris()</code>、<code>load_wine()</code>）无需下载，直接加载即可；<code>scores.csv</code> 和 <code>review.csv</code> 也在每次运行中可用。':'每次运行都可以直接读取 <code>scores.csv</code> 和 <code>review.csv</code>。')+'每次运行最长 30 秒。代码在本机 Python 中执行，请只运行你理解的代码。</div><h3>运行环境</h3><p>NumPy、Pandas、Matplotlib 和 scikit-learn 已安装。变量不会跨次运行保留，请在同一份代码中导入库、定义数据和执行操作。</p><p>'+(state.week>=2?'本周练习用的 <code>load_iris()</code>、<code>load_wine()</code> 是 scikit-learn 自带的数据集，无需下载就能加载。第 1 周的 <code>scores.csv</code> 和 <code>review.csv</code> 在每次运行中也可以直接读取。':'内置数据文件：<code>scores.csv</code> 用于第 3–6 天，<code>review.csv</code> 用于第 7 天，每次运行都可以直接读取。')+'运行生成的 CSV 和文本文件可以从结果区下载。</p>';
let notesKey=null,notesHeads=[],notesCode=[],notesObserver=null,notesTimer;
const notesId=()=>`${state.week}-${free?'free':state.day+1}`;
const tocLabel=h=>h.textContent.replace(/^(示例 \d+) · .*/,'$1');
function readNotesPos(){try{return JSON.parse(localStorage.getItem('ioai-notes-pos'))||{}}catch{return{}}}
const notesVisible=()=>!$('learn-view').hidden&&$('handout-body').getClientRects().length>0;
// On phones the CSS lets the handout grow with the page, so section tracking follows the window scroll there.
const pageFlow=()=>getComputedStyle($('handout-scroll')).overflowY==='visible';
// Reading position is stored as [section index, fraction of that section] so it survives width changes.
// A stop puts its heading just below the sticky 学习/练习 bar.
function notesStops(){const v=$('handout-scroll'),bar=$('mode-bar'),max=Math.max(0,v.scrollHeight-v.clientHeight),base=v.getBoundingClientRect().top-v.scrollTop+(getComputedStyle(bar).position==='sticky'?bar.offsetHeight:0)+8;let last=0;return[0,...notesHeads.map(h=>last=Math.min(max,Math.max(last,h.getBoundingClientRect().top-base))),max]}
function saveNotesPos(){if(!notesKey||!notesVisible()||pageFlow())return;const s=notesStops(),top=$('handout-scroll').scrollTop,all=readNotesPos();let k=0;while(k<s.length-2&&top>=s[k+1])k++;const span=s[k+1]-s[k];all[notesKey]=[k,span>0?Math.round((top-s[k])/span*1000)/1000:0];try{localStorage.setItem('ioai-notes-pos',JSON.stringify(all))}catch{}}
function restoreNotesPos(){const p=readNotesPos()[notesKey],s=notesStops(),k=p?Math.min(p[0],s.length-2):0;$('handout-scroll').scrollTop=p?s[k]+(s[k+1]-s[k])*p[1]:0}
function currentSection(){const v=$('handout-scroll');if(!notesVisible())return -1;const r=v.getBoundingClientRect(),line=pageFlow()?(scrollY>=document.documentElement.scrollHeight-innerHeight-2?innerHeight:innerHeight*.3):v.scrollTop>=v.scrollHeight-v.clientHeight-2?r.bottom:r.top+v.clientHeight*.3;let cur=-1;notesHeads.forEach((h,i)=>{if(h.getBoundingClientRect().top<=line)cur=i});return cur}
function markSection(){const cur=learning()?currentSection():-1;$('toc-list').querySelectorAll('a').forEach((a,i)=>i===cur?a.setAttribute('aria-current','true'):a.removeAttribute('aria-current'));const a=$('toc-list').querySelector('[aria-current]'),rail=$('toc-card').parentElement;if(a&&rail.scrollHeight>rail.clientHeight){const r=rail.getBoundingClientRect(),b=a.getBoundingClientRect();if(b.top<r.top||b.bottom>r.bottom)rail.scrollTop+=b.top-r.top-(rail.clientHeight-b.height)/2}if(learning())footStatus()}
function observeNotes(){notesObserver?.disconnect();notesObserver=null;if(!notesHeads.length)return;notesObserver=new IntersectionObserver(markSection,{root:$('handout-scroll'),rootMargin:'0px 0px -70% 0px'});notesHeads.forEach(h=>notesObserver.observe(h))}
function renderNotes(){const c=$('notes-content');notesKey=notesId();c.innerHTML=free?freeNotes():day().notes;notesCode=[];c.querySelectorAll('pre.note-code').forEach(pre=>{const snippet=pre.textContent.replace(/\n+$/,''),setup=pre.dataset.setup,code=setup?`# 准备代码：本段示例需要的导入和数据\n${setup}\n\n# 当前示例\n${snippet}`:snippet,label=pre.previousElementSibling?.classList.contains('note-label')?pre.previousElementSibling:null,box=document.createElement('div'),i=notesCode.push(code)-1;box.className='code-block';box.dataset.code=i;box.innerHTML=`<div class="code-bar">${label?`<p class="code-label">${label.innerHTML}${setup?' · 含准备代码':''}</p>`:setup?'<p class="code-label">含准备代码</p>':''}<div class="code-actions"><button type="button" class="button-secondary run-example" aria-label="运行这段代码">${icon('play','icon-fill')}运行</button><button type="button" class="button-secondary copy-to-runner" aria-label="把这段代码复制到运行区">复制到运行区</button></div></div><div class="code-panel"><button type="button" class="copy-code" title="复制代码" aria-label="复制代码">${icon('copy')}</button></div>`;label?.remove();pre.replaceWith(box);pre.innerHTML=`<code>${highlightLines(snippet)}</code>`;box.lastElementChild.prepend(pre)});c.querySelectorAll('ol.note-explanations').forEach((ol,i)=>{ol.querySelectorAll(':scope>li>code:first-child').forEach(code=>code.parentElement.append(code));const label=ol.previousElementSibling;if(!label?.classList.contains('note-label'))return;label.id=`note-ex-${i+1}`;label.classList.add('sr-only');ol.setAttribute('aria-labelledby',label.id)});notesHeads=[...c.querySelectorAll('h3')];notesHeads.forEach((h,i)=>{h.id=`note-sec-${i+1}`;h.tabIndex=-1});$('toc-list').innerHTML=notesHeads.map((h,i)=>`<li><a href="#note-sec-${i+1}" data-sec="${i}" title="${esc(h.textContent)}"><span>${esc(tocLabel(h))}</span></a></li>`).join('');$('toc-card').hidden=free||!notesHeads.length;$('learn-meta').innerHTML=`笔记 ${num(notesHeads.length)} 节`;observeNotes()}
async function placeNotes(){await Promise.all([...$('notes-content').querySelectorAll('img')].map(i=>i.complete?0:i.decode().catch(()=>0)));if(!notesVisible())return;restoreNotesPos();markSection()}
function syncNotes(){if(notesKey!==notesId())renderNotes();if(!$('learn-view').hidden)placeNotes();else markSection()}
function exampleFor(i){const t=day().tasks[i];return notesHeads.findIndex(h=>h.textContent.trim()===(t.noteSection||`示例 ${i+1} · ${t.title}`))}
function goToSection(i){const h=notesHeads[i];if(!h)return;if(checking()){const all=readNotesPos();all[notesKey]=[i+1,0];try{localStorage.setItem('ioai-notes-pos',JSON.stringify(all))}catch{};setMode('learn');if(pageFlow())h.scrollIntoView()}else if(pageFlow()){h.scrollIntoView();markSection()}else{$('handout-scroll').scrollTop=notesStops()[i+1];saveNotesPos();markSection()}if(learning())h.focus({preventScroll:true})}
$('handout-scroll').addEventListener('scroll',()=>{clearTimeout(notesTimer);notesTimer=setTimeout(()=>{if(learning()){saveNotesPos();markSection()}},250)},{passive:true});
addEventListener('scroll',()=>{if(!learning()||!pageFlow())return;clearTimeout(notesTimer);notesTimer=setTimeout(markSection,150)},{passive:true});
function openToc(open){$('toc-card').classList.toggle('open',open);$('toc-toggle').setAttribute('aria-expanded',open)}
$('toc-toggle').onclick=()=>openToc(!$('toc-card').classList.contains('open'));
$('toc-list').onclick=e=>{const a=e.target.closest('a[data-sec]');if(!a)return;e.preventDefault();if($('toc-toggle').offsetParent)openToc(false);goToSection(Number(a.dataset.sec))};
$('example-link').onclick=e=>{e.preventDefault();const i=exampleFor(state.task);if(i>=0)goToSection(i)};
// Replacing the whole scratch through insertText keeps Cmd/Ctrl+Z able to bring the previous draft back.
function toRunner(code){const ed=$('editor'),back=document.activeElement;ed.focus({preventScroll:true});ed.setSelectionRange(0,ed.value.length);if(!document.execCommand('insertText',false,code)){ed.value=code;edited()}ed.setSelectionRange(0,0);ed.scrollTop=0;ed.scrollLeft=0;syncScroll();if(back&&back!==document.body)back.focus({preventScroll:true})}
// When the run area sits below the notes (single column), bring it up so the pasted code and the result are visible.
function showRunner(){const r=$('runner'),b=r.getBoundingClientRect();if(b.top<0||b.bottom>innerHeight&&b.top>innerHeight*.4)r.scrollIntoView({behavior:reduceMotion.matches?'auto':'smooth',block:'start'})}
$('notes-content').addEventListener('click',async e=>{const b=e.target.closest('button');if(!b)return;const box=b.closest('.code-block'),code=box&&notesCode[box.dataset.code];if(code===undefined)return;if(b.classList.contains('copy-to-runner')||b.classList.contains('run-example')){if(busy)return toast('请先停止当前运行');toRunner(code);showRunner();if(b.classList.contains('run-example'))run();else toast('已复制到运行区 · ⌘/Ctrl + Z 可撤销');return}if(!b.classList.contains('copy-code'))return;try{await navigator.clipboard.writeText(code)}catch{const t=document.createElement('textarea');t.value=code;t.setAttribute('readonly','');t.style.cssText='position:fixed;top:0;left:0;opacity:0';b.after(t);t.select();const ok=document.execCommand('copy');t.remove();b.focus();if(!ok)return toast('复制失败，请手动选择代码')}toast('已复制代码')});

// Backup helpers: include browser-only drafts and reading progress in portable exports.
function cleanBrowserBackup(value={}){
 const v=value&&typeof value==='object'?value:{},out={scratch:{},learned:{},notesPos:{}};
 for(const w of allWeeks.map(w=>w.id))for(let d=1;d<=7;d++){
  const id=`w${w}d${d}`,draft=v.scratch?.[id],at=v.learned?.[id];
  if(typeof draft==='string'&&draft.length<=40000)out.scratch[id]=draft;
  if(typeof at==='string'&&at.length<=50)out.learned[id]=at;
 }
 for(const w of allWeeks.map(w=>w.id))for(const d of [1,2,3,4,5,6,7,'free']){
  const id=`${w}-${d}`,p=v.notesPos?.[id];
  if(Array.isArray(p)&&p.length===2&&Number.isInteger(p[0])&&p[0]>=0&&p[0]<=1000&&Number.isFinite(p[1])&&p[1]>=0&&p[1]<=1)out.notesPos[id]=p;
 }
 return out;
}
function browserBackup(){
 const scratch={};
 for(const w of allWeeks.map(w=>w.id))for(let d=1;d<=7;d++){
  const id=`w${w}d${d}`;try{const value=localStorage.getItem('ioai-scratch-'+id);if(value!==null)scratch[id]=value}catch{}
 }
 return cleanBrowserBackup({scratch,learned:readLearned(),notesPos:readNotesPos()});
}
function buildBackup(){
 return {...state,schemaVersion:3,positions:{...state.positions,[state.week]:{day:state.day,task:state.task}},browser:browserBackup()};
}
function restoreBrowserBackup(value){
 const v=cleanBrowserBackup(value);
 for(const w of allWeeks.map(w=>w.id))for(let d=1;d<=7;d++){
  const id=`w${w}d${d}`,key='ioai-scratch-'+id;
  if(Object.hasOwn(v.scratch,id))localStorage.setItem(key,v.scratch[id]);else localStorage.removeItem(key);
 }
 localStorage.setItem('ioai-learned',JSON.stringify(v.learned));
 localStorage.setItem('ioai-notes-pos',JSON.stringify(v.notesPos));
}
// End backup helpers.

function download(name,content,type='text/plain'){const a=document.createElement('a'),url=URL.createObjectURL(new Blob([content],{type}));a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
$('download-code').onclick=()=>download($('file-name').textContent,$('editor').value);$('backup').onclick=()=>{remember();saveNotesPos();download('ioai-lab-backup.json',JSON.stringify(buildBackup(),null,2),'application/json');toast('学习备份已导出（含示例草稿）')};
function validateState(v){if(!v||typeof v!=='object'||Array.isArray(v))throw Error('备份格式不正确');const validIds=new Set(['free',...allWeeks.flatMap(w=>w.days.flatMap(d=>d.tasks.map(t=>t.id)))]);const cleaned={schemaVersion:3,week:allWeeks.some(w=>w.id===v.week)?v.week:1,positions:{},codes:{},passed:{},hints:{},seen:{},day:Number.isInteger(v.day)&&v.day>=0&&v.day<7?v.day:0,task:Number.isInteger(v.task)&&v.task>=0&&v.task<3?v.task:0};for(const field of ['codes','passed','hints','seen'])for(const [id,value]of Object.entries(v[field]||{})){if(!validIds.has(id))continue;if(field==='codes'&&typeof value==='string'&&value.length<=40000)cleaned.codes[id]=value;if(field==='passed'&&value)cleaned.passed[id]=value;if(field==='seen')cleaned.seen[id]=!!value;if(field==='hints'&&Number.isInteger(value))cleaned.hints[id]=Math.max(0,Math.min(2,value))}for(const week of allWeeks.map(w=>String(w.id))){const pos=v.positions?.[week];if(pos&&Number.isInteger(pos.day)&&pos.day>=0&&pos.day<7&&Number.isInteger(pos.task)&&pos.task>=0&&pos.task<3)cleaned.positions[week]={day:pos.day,task:pos.task};}if(!cleaned.positions[cleaned.week])cleaned.positions[cleaned.week]={day:cleaned.day,task:cleaned.task};return cleaned}
$('restore').onclick=()=>$('import').click();
$('import').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{if(f.size>4000000)throw Error('备份文件过大');const raw=JSON.parse(await f.text()),v=validateState(raw),browser=cleanBrowserBackup(raw.browser);if(busy)throw Error('请先停止当前运行');if(confirm('用这份备份替换当前代码和学习进度？')){saveNotesPos();restoreBrowserBackup(browser);state=v;curriculum=allWeeks.find(w=>w.id===state.week);free=false;mode=ruleMode(state.day);weekHeading();await persist();render();toast('已恢复学习进度')}}catch(error){toast(error.message)}finally{e.target.value=''}};
addEventListener('resize',()=>{placeThumb();if(errorLine)placeBand()});
async function init(){try{
const responses=await Promise.all([fetch('/api/config',{cache:'no-store'}),fetch('/courses.json',{cache:'no-store'}),fetch('/api/state',{cache:'no-store'})]);
if(responses.some(r=>!r.ok))throw Error('本地服务不可用');
const [cfg,catalog,saved]=await Promise.all(responses.map(r=>r.json()));config=cfg;
if(cfg.version<3)throw Error('请重启本地服务后刷新，加载第三周课程');
allWeeks=await Promise.all(catalog.weeks.map(async w=>{const r=await fetch(w.id===1?'/curriculum.json':`/week${w.id}.json`,{cache:'no-store'});if(!r.ok)throw Error('课程未加载');return {...await r.json(),id:w.id,title:w.title}}));
if(saved&&Object.keys(saved).length)state=validateState(saved);else try{const local=JSON.parse(localStorage.getItem('ioai-week1'));if(local)state=validateState(local)}catch{}
const params=new URLSearchParams(location.search),wanted=allWeeks.some(w=>w.id===Number(params.get('week')))?Number(params.get('week')):1;
const position=state.positions[wanted]||{day:0,task:0};state.week=wanted;state.day=position.day;state.task=position.task;
const requestedDay=Number(params.get('day')),requestedTask=Number(params.get('task'));
if(Number.isInteger(requestedDay)&&requestedDay>=1&&requestedDay<=7){state.day=requestedDay-1;state.task=0;}
if(Number.isInteger(requestedTask)&&requestedTask>=1&&requestedTask<=3)state.task=requestedTask-1;
free=params.get('free')==='1';curriculum=allWeeks.find(w=>w.id===wanted);const wantedMode=params.get('mode');mode=wantedMode==='learn'||wantedMode==='practice'?wantedMode:ruleMode(state.day);if(!free&&mode==='practice')markLearned();weekHeading();render();
document.querySelectorAll('a[data-leave]').forEach(a=>a.addEventListener('click',async e=>{if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();if(busy)return toast('请先停止当前运行');remember();saveNotesPos();clearTimeout(saveTimer);await persist();location.href=a.href;}));
if(document.modelContext?.registerTool){try{
document.modelContext.registerTool({name:'read_learning_progress',description:'读取各周练习进度和当前题目。',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:async()=>({week:state.week,completed:Object.keys(state.passed),current:free?'free':task().id,mode:free?'free':mode})});
document.modelContext.registerTool({name:'open_practice_day',description:'打开本周指定学习日（尚未开始的一天先进入学习），不运行代码，也不标记完成。',inputSchema:{type:'object',properties:{day:{type:'integer',minimum:1,maximum:7}},required:['day'],additionalProperties:false},execute:async input=>{if(!Number.isInteger(input.day)||input.day<1||input.day>7||busy)throw Error('无效日期或代码正在运行');navigate(input.day-1,0);return{week:state.week,day:input.day,task:task().id,mode}}});}catch{}}
}catch(e){setStatus('启动失败','danger');$('result-content').innerHTML='<p class="output-error">请重新双击启动脚本打开网页。页面需要本地 Python 服务。</p>';console.error(e)}}
init();

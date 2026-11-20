if(new URLSearchParams(location.search).has('embed'))document.body.classList.add('embedded-board');
const page=document.body.dataset.page,$=id=>document.getElementById(id);
let latest=null,initialized=false,wallKey='',boardKey='',countdownTimer,manualRound=null,manualRubric='',manualDrafts={};
let judgingMode='gemini';
try{judgingMode=localStorage.getItem('gdg-judging-mode')||'gemini';}catch{}
if(!['gemini','manual','imported'].includes(judgingMode))judgingMode='gemini';
const phaseLabel={collecting:'Submissions open',closed:'Submissions closed',judging:'AI judging',ready:'Shortlist ready',revealed:'Top three revealed'};
const node=(tag,text,className)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(className)e.className=className;return e;};
async function request(path,data){const response=await fetch(path,data===undefined?{cache:'no-store'}:{method:'POST',headers:{'Content-Type':'application/json','X-Workshop-Host':'1'},body:JSON.stringify(data)});const result=await response.json();if(!response.ok)throw Error(result.error||'Please try again.');return result;}
function showError(message){$('error').textContent=message;}
function rubric(container,criteria){
 const labels={'Impact & Sustainability Value':'Impact','Innovation & Differentiation':'Innovation','Feasibility & Deliverability':'Feasibility','Strategic Fit & Theme Relevance':'Relevance','Commercial & Value Multiplication':'Value'};
 container.replaceChildren(...criteria.map(c=>{
  const label=labels[c.name]??c.name;
  if(page!=='join')return node('span',`${label} ${c.weight}%`);
  const row=node('tr'),heading=node('th',label);heading.scope='row';row.append(heading,node('td',`${c.weight}%`));return row;
 }));
}
function renderWall(container,ideas){if(!ideas.length){const empty=node('div',undefined,'empty');const dino=node('img');dino.src='/assets/dinosaur.png';dino.alt='Waiting dinosaur';empty.append(dino,node('h3','The next big idea could be yours.'),node('p','Scan the code. Share one useful idea.'));container.replaceChildren(empty);return;}container.replaceChildren(...ideas.map(idea=>{const card=node('article',undefined,'idea-card');card.append(node('h3',idea.title),node('div',idea.name,'name'),node('p',idea.idea));return card;}));}
let bubbleScene=null;
const still=matchMedia('(prefers-reduced-motion: reduce)');
function renderBubbles(wall,ideas){
 if(bubbleScene?.wall!==wall){
  if(bubbleScene)cancelAnimationFrame(bubbleScene.frame);
  bubbleScene={wall,bodies:new Map(),frame:0,last:0};
 }
 const scene=bubbleScene;
 if(!ideas.length){cancelAnimationFrame(scene.frame);renderWall(wall,[]);scene.bodies.clear();return;}
 wall.querySelector('.empty')?.remove();
 const populated=scene.bodies.size>0,ids=new Set(ideas.map(idea=>idea.id));
 for(const [id,body]of scene.bodies)if(!ids.has(id)){body.el.remove();scene.bodies.delete(id);}
 for(const idea of ideas){
  let body=scene.bodies.get(idea.id);
  if(!body){
   const el=node('article',undefined,'idea-bubble');el.dataset.id=idea.id;el.append(node('h3',idea.title));wall.append(el);
   body={el,x:0,y:0,w:0,h:0,vx:(Math.random()>.5?1:-1)*(7+Math.random()*7),vy:(Math.random()>.5?1:-1)*(5+Math.random()*5),fresh:true,arriving:populated};scene.bodies.set(idea.id,body);
   if(!still.matches)el.animate([{opacity:0,scale:.25},{opacity:1,scale:1.07,offset:.75},{opacity:1,scale:1}],{duration:650,easing:'cubic-bezier(.2,.8,.2,1)'});
  }else body.el.firstChild.textContent=idea.title;
 }
 layoutBubbles();
}
function layoutBubbles(){
 const scene=bubbleScene;if(!scene?.wall.isConnected)return;
 const {wall,bodies}=scene,items=[...bodies.values()],width=wall.clientWidth;
 if(scene.width!==undefined&&scene.width!==width)for(const b of items){b.fresh=true;b.arriving=false;}
 wall.classList.toggle('is-still',still.matches);
 wall.style.setProperty('--bubble-font',`${width<500?18:items.length>35?21:28}px`);
 for(const b of items){b.w=b.el.offsetWidth;b.h=b.el.offsetHeight;}
 const height=Math.max(380,innerHeight-wall.getBoundingClientRect().top-36,items.reduce((area,b)=>area+(b.w+18)*(b.h+18),0)/Math.max(1,width*.56));
 wall.style.height=still.matches?'auto':`${height}px`;
 let rowX=16,rowY=16,rowHeight=0,arrival=false;
 for(const [index,b]of items.entries()){
  if(rowX+b.w>width-12){rowX=16;rowY+=rowHeight+22;rowHeight=0;}
  if(b.fresh){
   b.x=b.arriving?(width-b.w)/2+(Math.random()-.5)*50:items.length<8?(width-b.w)*(index+1)/(items.length+1):rowX;
   b.y=b.arriving?(height-b.h)/2:items.length<8?height*.35+(index%2?30:-30):rowY;
   arrival||=b.arriving;b.fresh=false;
  }
  rowX+=b.w+22;rowHeight=Math.max(rowHeight,b.h);
 }
 scene.width=width;scene.height=height;
 if(!arrival)for(let i=0;i<60;i++)separateBubbles(scene,0);
 paintBubbles(scene);
 cancelAnimationFrame(scene.frame);scene.last=0;
 if(!still.matches&&items.length)scene.frame=requestAnimationFrame(tickBubbles);
}
function separateBubbles(scene,dt){
 const items=[...scene.bodies.values()];
 for(const b of items){b.x+=b.vx*dt;b.y+=b.vy*dt;}
 // ponytail: at most 120 real submissions; native rectangle separation avoids a physics dependency.
 for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++){
  const a=items[i],b=items[j],dx=b.x+b.w/2-a.x-a.w/2,dy=b.y+b.h/2-a.y-a.h/2;
  const ox=(a.w+b.w)/2+12-Math.abs(dx),oy=(a.h+b.h)/2+12-Math.abs(dy);
  if(ox<=0||oy<=0)continue;
  const strength=dt ? .16 : .51;
  if(ox<oy){const push=(dx>=0?1:-1)*ox*strength;a.x-=push;b.x+=push;if((b.vx-a.vx)*dx<0)[a.vx,b.vx]=[b.vx,a.vx];}
  else{const push=(dy>=0?1:-1)*oy*strength;a.y-=push;b.y+=push;if((b.vy-a.vy)*dy<0)[a.vy,b.vy]=[b.vy,a.vy];}
 }
 for(const b of items){
  const right=Math.max(8,scene.width-b.w-8),bottom=Math.max(8,scene.height-b.h-8);
  if(b.x<8||b.x>right)b.vx=b.x<8?Math.abs(b.vx):-Math.abs(b.vx);
  if(b.y<8||b.y>bottom)b.vy=b.y<8?Math.abs(b.vy):-Math.abs(b.vy);
  b.x=Math.max(8,Math.min(right,b.x));b.y=Math.max(8,Math.min(bottom,b.y));
 }
}
function paintBubbles(scene){for(const b of scene.bodies.values())b.el.style.transform=`translate(${b.x}px,${b.y}px)`;}
function tickBubbles(time){
 const scene=bubbleScene;if(!scene?.wall.isConnected)return;
 if(still.matches){layoutBubbles();return;}
 const dt=scene.last?Math.min((time-scene.last)/1000,.04):0;scene.last=time;
 if(!document.hidden){separateBubbles(scene,dt);paintBubbles(scene);}
 scene.frame=requestAnimationFrame(tickBubbles);
}
if(page==='board'){addEventListener('resize',layoutBubbles);still.addEventListener('change',layoutBubbles);document.fonts.ready.then(layoutBubbles);}
function renderHost(s){
 if(!initialized){$('theme').value=s.theme;$('criteria').value=s.criteria.map(c=>`${c.name} | ${c.weight}${c.guidance?` | ${c.guidance}`:''}`).join('\n');$('model').value=s.model;$('ai-details').open=!s.aiReady;initialized=true;}
 $('judging-mode').value=judgingMode;
 $('external-judging').hidden=judgingMode!=='imported';$('gemini-connection').hidden=judgingMode!=='gemini';
 $('count').textContent=s.count;$('phase').textContent=phaseLabel[s.phase];$('phase').classList.toggle('closed',s.phase!=='collecting');
 $('join-link').textContent=s.joinUrl;$('join-link').href=s.joinUrl;
 $('ai-status').textContent=s.aiReady?'Gemini key ready':'Connect Gemini';
 const busy=s.phase==='judging',evaluated=s.results.length>0,closed=s.phase==='closed';
 $('collect').textContent=s.phase==='collecting'?'Close submissions':'Open submissions';$('collect').disabled=busy||evaluated;
 $('analyse').hidden=judgingMode==='imported';
 $('analyse').textContent=busy?'Analysing…':judgingMode==='manual'?'Calculate ranking':'Analyse all ideas';
 $('analyse').disabled=busy||s.count<3||evaluated||(judgingMode==='manual'?!closed:!s.aiReady);
 $('reveal').disabled=s.phase!=='ready';$('new-round').disabled=busy;$('save').disabled=busy||evaluated;
 $('judging-mode').disabled=busy||evaluated;$('import-file').disabled=busy||s.count>0||evaluated;
 for(const id of ['export-markdown','export-csv','scores-file'])$(id).disabled=!closed||s.count<3||evaluated;
 $('host-hint').textContent=busy?'Every idea is being scored against the same rubric.':s.error||(evaluated?'Review every score below, then reveal the top three.':judgingMode==='manual'?'Close submissions, enter a 0–10 score for every criterion, then calculate. Drafts stay in this browser.':judgingMode==='imported'?'Close submissions, export the complete prompt, then import one CSV row per idea.':!s.aiReady?'Connect Gemini or choose manual scoring / ChatGPT CSV import.':s.count<3?'Collect at least three ideas.':'Analysing closes submissions and sends all ideas in one request.');
 const rubricKey=JSON.stringify(s.criteria),storageKey=`gdg-manual-${s.round}`;
 if(manualRound!==s.round||manualRubric!==rubricKey){
  manualRound=s.round;manualRubric=rubricKey;manualDrafts={};
  try{const saved=JSON.parse(localStorage.getItem(storageKey)||'{}');if(saved.rubric===rubricKey)manualDrafts=saved.values||{};}catch{}
 }
 const key=JSON.stringify([s.ideas,s.criteria,s.round,judgingMode]);
 if(key!==wallKey){
  renderWall($('wall'),s.ideas);wallKey=key;
  if(judgingMode==='manual')for(const [index,card]of [...$('wall').querySelectorAll('.idea-card')].entries()){
   const idea=s.ideas[index],fields=node('div',undefined,'manual-scores');
   s.criteria.forEach((criterion,j)=>{
    const label=node('label',`${criterion.name} (${criterion.weight}%)`),input=node('input');
    input.type='number';input.min='0';input.max='10';input.step='any';input.required=true;
    input.dataset.idea=idea.id;input.dataset.criterion=j;input.setAttribute('aria-label',`${idea.title}: ${criterion.name}`);
    input.value=manualDrafts[idea.id]?.[j]??'';label.title=criterion.guidance||'';label.append(input);fields.append(label);
    input.addEventListener('input',()=>{
     (manualDrafts[idea.id]??={})[j]=input.value;
     try{localStorage.setItem(storageKey,JSON.stringify({rubric:rubricKey,values:manualDrafts}));}catch{}
    });
   });card.append(fields);
  }
 }
 for(const input of document.querySelectorAll('.manual-scores input'))input.disabled=!closed||evaluated;
 $('review').hidden=!evaluated;
 if(evaluated){$('review-list').replaceChildren(...s.results.map((r,i)=>{const row=node('div',undefined,'review-row');row.append(node('span',`${r.total}/100`,'review-score'),node('b',`${i+1}. ${r.title}`),node('p',r.name==='Participant'?'':r.name),node('p',r.strength),node('p',`Improve: ${r.improve}`),node('p',s.criteria.map((c,j)=>`${c.name}: ${r.scores[j]}/10`).join(' · ')));return row;}));}
}
async function downloadJudging(path){
 showError('');
 try{
  const response=await fetch(path,{cache:'no-store'});
  if(!response.ok)throw Error((await response.json()).error||'Export failed.');
  const url=URL.createObjectURL(await response.blob()),link=node('a');
  link.href=url;link.download=`gdg-judging-round-${latest.round}.${path.endsWith('.md')?'md':'csv'}`;link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
  $('judging-status').textContent=`Exported all ${latest.count} ideas with the saved rubric. Ask ChatGPT to follow the included CSV instructions.`;
 }catch(error){showError(error.message);}
}
function renderJoin(s){$('theme').textContent=s.theme;rubric($('rubric'),s.criteria);$('submit').disabled=s.phase!=='collecting';$('join-status').textContent=s.phase==='collecting'?'':s.phase==='judging'?'The ideas are being judged.':s.phase==='revealed'?'The top three are on the live board.':'Submissions are closed. Watch the live board.';}
function renderPodium(s){
 const content=$('board-content');content.replaceChildren();const hero=node('div',undefined,'hero');hero.append(node('h1','Your top three.'));content.append(hero);
 const podium=node('section',undefined,'podium');
 for(const i of [1,0,2]){const r=s.results[i];if(!r)continue;const winner=node('article',undefined,`winner ${i===0?'first':i===2?'third':'second'}`);winner.append(node('h3',r.title),node('div',r.name==='Participant'?'':r.name,'who'),node('p',r.strength));const step=node('div',undefined,'step');step.append(node('div',String(i+1),'place'),node('div',`${r.total}/100`,'score'));winner.append(step);podium.append(winner);}
 content.append(podium);$('ai-note').hidden=false;$('ai-note').textContent=`${s.judgingSource==='manual'?'Host-scored':s.judgingSource==='imported'?'Imported scores':'AI'} shortlist · Same theme. Same criteria. Discuss the ideas together.`;
 if(still.matches)return;
 const confetti=node('div',undefined,'confetti');confetti.setAttribute('aria-hidden','true');content.append(confetti);
 const flights=[];
 for(let i=0;i<48;i++){
  const piece=node('i'),side=i%2,direction=side?-1:1;
  piece.style[side?'right':'left']='0';piece.style.width=`${6+Math.random()*5}px`;piece.style.height=`${16+Math.random()*14}px`;confetti.append(piece);
  const distance=innerWidth*(.2+Math.random()*.6),height=innerHeight*(.38+Math.random()*.44),spin=direction*(600+Math.random()*500);
  // Native keyframes follow a ballistic arc: fast launch, a high crest, then a fluttering fall.
  const frames=Array.from({length:21},(_,j)=>{const t=j/20;return{transform:`translate3d(${direction*distance*t}px,${height*(6.25*t*t-5*t)}px,0) rotate(${spin*t}deg) rotateY(${720*t}deg)`,opacity:j===0||j===20?0:j===19?.4:1};});
  flights.push(piece.animate(frames,{duration:2200+Math.random()*250,delay:3100+Math.random()*120,easing:'linear',fill:'both'}).finished.catch(()=>{}));
 }
 Promise.all(flights).then(()=>confetti.remove());
}
function renderBoard(s){clearTimeout(countdownTimer);const content=$('board-content');
 if(s.phase==='revealed'&&Date.now()/1000<s.revealAt){const remaining=Math.max(1,Math.ceil(s.revealAt-Date.now()/1000));content.replaceChildren();const message=node('section',undefined,'stage-message');message.append(node('h2','Here come your top three.'),node('div',remaining,'countdown'));content.append(message);boardKey='countdown';countdownTimer=setTimeout(()=>renderBoard(latest),100);return;}
 const key=JSON.stringify([s.phase,s.round,s.theme,s.criteria,s.ideas,s.results,s.revealAt,s.judgingSource]);if(key===boardKey)return;boardKey=key;$('ai-note').hidden=true;
 if(s.phase==='revealed'){renderPodium(s);return;}
 if(s.phase==='judging'||s.phase==='ready'){content.replaceChildren();const message=node('section',undefined,'stage-message');const dots=node('div',undefined,'judging-dots');for(let i=0;i<4;i++)dots.append(node('i'));message.append(dots,node('h2',s.phase==='judging'?'Finding the standout ideas…':'The shortlist is ready.'),node('p',s.phase==='judging'?'Same theme. Same criteria.':'Waiting for the big reveal.','muted'));content.append(message);return;}
 if(!content.querySelector('.bubble-wall')||content.dataset.round!==String(s.round)){
  content.replaceChildren();content.dataset.round=s.round;
  const hero=node('div',undefined,'hero'),title=node('div',undefined,'board-theme');title.append(node('div',s.theme,'eyebrow'),node('h1','Ideas in the room.'));
  const join=node('div',undefined,'board-join'),count=node('div',undefined,'count');count.append(node('span',s.count,'submission-count'),node('small','submitted'));
  const qr=node('a');qr.href=s.joinUrl;qr.setAttribute('aria-label','Scan to submit a project');const image=node('img');image.src='/assets/challenge-qr.png';image.alt='Scan to submit a project';qr.append(image);join.append(count,qr);hero.append(title,join);
  const chips=node('div',undefined,'rubric'),wall=node('section',undefined,'bubble-wall');wall.setAttribute('aria-label','Submitted project titles');content.append(hero,chips,wall);
 }
 content.querySelector('.board-theme .eyebrow').textContent=s.theme;
 content.querySelector('.submission-count').textContent=s.count;
 content.querySelector('.board-join a').href=s.joinUrl;
 rubric(content.querySelector('.rubric'),s.criteria);
 renderBubbles(content.querySelector('.bubble-wall'),s.ideas);
}
async function refresh(){try{latest=await request(page==='host'?'/api/host':'/api/state');if(page==='host')renderHost(latest);else if(page==='join')renderJoin(latest);else renderBoard(latest);}catch(error){showError(error.message);}}
async function action(path,data){showError('');try{await request(path,data);await refresh();return true;}catch(error){showError(error.message);return false;}}
if(page==='host'){
 $('config-form').addEventListener('submit',async e=>{e.preventDefault();const criteria=$('criteria').value.split('\n').filter(line=>line.trim()).map(line=>{const [name,weight,...guidance]=line.split('|');return{name:name.trim(),weight:Number(weight?.trim()),guidance:guidance.join('|').trim()};});await action('/api/config',{theme:$('theme').value,criteria});});
 $('connect-form').addEventListener('submit',async e=>{e.preventDefault();if(await action('/api/connect',{key:$('api-key').value,model:$('model').value})){$('api-key').value='';$('ai-details').open=false;}});
 $('judging-mode').addEventListener('change',()=>{judgingMode=$('judging-mode').value;try{localStorage.setItem('gdg-judging-mode',judgingMode);}catch{}renderHost(latest);});
 $('import-file').addEventListener('change',async e=>{
  const file=e.target.files[0];if(!file)return;
  try{
   if(file.size>12*1024*1024)throw Error('Choose an export smaller than 12 MB.');
   const data=JSON.parse(await file.text());initialized=false;wallKey='';await action('/api/import',data);
  }catch(error){showError(error instanceof SyntaxError?'Choose a valid ideas export JSON file.':error.message);}
  e.target.value='';
 });
 $('scores-file').addEventListener('change',async e=>{
  const file=e.target.files[0];if(!file)return;
  try{
   if(file.size>12*1024*1024)throw Error('Choose a CSV smaller than 12 MB.');
   if(await action('/api/import-scores',{csv:await file.text()}))$('judging-status').textContent='All scores imported. Review the full ranking below, then reveal the top three.';
  }catch(error){showError(error.message);}
  e.target.value='';
 });
 $('export-markdown').addEventListener('click',()=>downloadJudging('/api/judging.md'));
 $('export-csv').addEventListener('click',()=>downloadJudging('/api/judging.csv'));
 $('collect').addEventListener('click',()=>action('/api/collect',{open:latest.phase!=='collecting'}));
 $('analyse').addEventListener('click',async()=>{
  const data={mode:judgingMode};
  if(judgingMode==='manual'){
   const inputs=[...document.querySelectorAll('.manual-scores input')];
   const invalid=inputs.find(input=>!input.reportValidity());if(invalid){invalid.focus();return;}
   data.ratings=latest.ideas.map(idea=>({id:idea.id,scores:latest.criteria.map((_,j)=>Number(inputs.find(input=>input.dataset.idea===String(idea.id)&&input.dataset.criterion===String(j)).value)),strength:'Host-scored against the saved rubric.',improve:'Discuss the next validation step.'}));
  }
  $('analyse').disabled=true;await action('/api/rank',data);
 });
 $('reveal').addEventListener('click',async()=>{if(await action('/api/reveal',{}))window.open('/board','gdg-live-board');});
 $('new-round').addEventListener('click',async()=>{if(confirm('Start a new round? Current ideas stay archived on this computer.')){initialized=false;wallKey='';await action('/api/new-round',{});}});
}else if(page==='join'){
 let client=localStorage.getItem('gdg-client');if(!client){client=Array.from(crypto.getRandomValues(new Uint8Array(16)),n=>n.toString(16).padStart(2,'0')).join('');localStorage.setItem('gdg-client',client);}
 try{const draft=JSON.parse(localStorage.getItem('gdg-idea-draft')||'{}');for(const key of ['title','idea'])if(draft[key])$(key).value=draft[key];}catch{}
 const updateWords=()=>{const count=$('idea').value.trim().split(/\s+/u).filter(Boolean).length;$('word-count').textContent=`${count} / 200 words`;$('idea').setCustomValidity(count>200?'Keep the brief introduction to 200 words or fewer.':'');};
 $('idea').addEventListener('input',updateWords);updateWords();
 $('idea-form').addEventListener('submit',async e=>{e.preventDefault();$('submit').disabled=true;showError('');const draft={title:$('title').value,idea:$('idea').value};try{await request('/api/ideas',{client,name:'Participant',...draft});localStorage.setItem('gdg-idea-draft',JSON.stringify(draft));$('submitted').hidden=false;$('submit').textContent='Update idea';}catch(error){showError(error.message);}await refresh();});
}else{
 $('fullscreen').addEventListener('click',()=>{const p=document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen();p?.catch(()=>{});});
}
refresh();setInterval(refresh,2000);

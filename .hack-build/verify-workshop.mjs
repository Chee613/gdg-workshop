import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const hosted=process.env.GDG_HOSTED_CHECK==='1',password='test-only-presenter-password';
const credentials=hosted?{httpCredentials:{username:'presenter',password}}:{};
const fixture=spawn('python',['.hack-build/workshop-fixture.py'],{cwd:fileURLToPath(new URL('../',import.meta.url)),env:{...process.env,WORKSHOP_HOST_PASSWORD:hosted?password:''},windowsHide:true,stdio:['ignore','pipe','ignore']});
const base=await new Promise((resolve,reject)=>{fixture.stdout.once('data',data=>resolve(data.toString().trim().split('\n')[0]));fixture.once('error',reject);fixture.once('exit',code=>reject(Error(`Fixture exited ${code}`)));});
const browser=await chromium.launch({headless:true,channel:'chrome'}),errors=[];
const host=await browser.newPage({...credentials,viewport:{width:1440,height:1000}}),board=await browser.newPage({viewport:{width:1440,height:900}});
for(const p of [host,board])p.on('pageerror',e=>errors.push(e.message));
const post=(path,data,host=true)=>fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json',...(host?{'X-Workshop-Host':'1',...(hosted?{Authorization:'Basic '+Buffer.from('presenter:'+password).toString('base64')}:{})}:{})},body:JSON.stringify(data)});
try{
 await host.goto(base+'/host');await host.getByRole('heading',{name:'Let the ideas roll in.'}).waitFor();
 await board.goto(base+'/board');await board.getByRole('heading',{name:'Ideas in the room.'}).waitFor();
 assert.equal(await board.locator('.rubric span').count(),5);
 const defaults=await (await host.request.get(base+'/api/host')).json();
 assert.ok(defaults.criteria.every(c=>c.guidance));
 assert.ok((await host.getByLabel('Judging criteria').inputValue()).includes(defaults.criteria[0].guidance));
 assert.ok(!(await board.locator('body').textContent()).includes(defaults.criteria[0].guidance));
 const preview=await browser.newPage({viewport:{width:390,height:844}});
 await preview.goto(base+'/join');await preview.waitForFunction(()=>document.querySelectorAll('#rubric tr').length===5);
 assert.equal(await preview.getByRole('table',{name:'Judging criteria'}).count(),1);
 assert.deepEqual(await preview.locator('#rubric th').allTextContents(),['Impact','Innovation','Feasibility','Relevance','Value']);
 assert.deepEqual(await preview.locator('#rubric td').allTextContents(),defaults.criteria.map(c=>`${c.weight}%`));
 assert.equal(await preview.locator('#idea-form [placeholder]').count(),0);
 assert.equal(await preview.locator('#idea-help').textContent(),'Maximum 200 words.');
 assert.ok(!(await preview.locator('body').textContent()).includes(defaults.criteria[0].guidance));
 assert.equal(await preview.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await preview.screenshot({path:'.hack-build/session-default-rubric-mobile.png',fullPage:true});await preview.close();
 await board.screenshot({path:'.hack-build/session-default-rubric.png',fullPage:true});
 const saved=host.waitForResponse(r=>r.url().endsWith('/api/config')&&r.request().method()==='POST');
 await host.getByRole('button',{name:'Save challenge',exact:true}).click();assert.ok((await saved).ok());
 assert.deepEqual((await (await host.request.get(base+'/api/host')).json()).criteria,defaults.criteria,'Saving preserves private guidance');
 assert.equal((await post('/api/config',{theme:'x',criteria:[]})).status,400);
 assert.equal((await post('/api/collect',{open:false},false)).status,hosted?401:403);
 await host.getByLabel('Theme / topic').fill('Useful campus ideas');
 await host.getByLabel('Judging criteria').fill('Impact | 40\nFeasibility | 30\nClarity | 30');
 await host.getByRole('button',{name:'Save challenge',exact:true}).click();
 for(let i=0;i<3;i++){
  const participant=await browser.newContext({viewport:{width:390,height:844}}),p=await participant.newPage();p.on('pageerror',e=>errors.push(e.message));
  await p.goto(base+'/join');await p.getByRole('heading',{name:'Useful campus ideas'}).waitFor();
  assert.equal(await p.locator('#idea-form input,#idea-form textarea').count(),2,'Only title and introduction are required');
  if(i===0){
   await p.getByLabel('Brief introduction').fill(Array(201).fill('everyday').join(' '));
   assert.equal(await p.locator('#word-count').textContent(),'201 / 200 words');
   assert.ok(!(await p.getByLabel('Brief introduction').evaluate(e=>e.checkValidity())));
   await p.getByLabel('Brief introduction').fill(Array(200).fill('everyday').join(' '));
   assert.ok(await p.getByLabel('Brief introduction').evaluate(e=>e.checkValidity()));
  }
  await p.getByLabel('Project title').fill(i===2?'<img src=x onerror=alert(1)>':`Campus idea ${i+1}`);
  await p.getByLabel('Brief introduction').fill('Help students find available study spaces with a simple availability map.');
  await p.getByRole('button',{name:'Submit idea',exact:true}).click();await p.getByRole('heading',{name:"You're on the board."}).waitFor();
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  if(i===0){await p.getByRole('button',{name:'Update idea',exact:true}).click();await p.waitForResponse(r=>r.url().endsWith('/api/state'));await p.screenshot({path:'.hack-build/session-join.png',fullPage:true});}
  await participant.close();
 }
 await host.waitForFunction(()=>document.querySelector('#count').textContent==='3');
 await board.waitForFunction(()=>document.querySelectorAll('.idea-bubble').length===3);
 assert.equal(await board.locator('.idea-bubble img').count(),0,'Participant HTML renders as text');
 assert.equal(await board.getByRole('button',{name:'Join the challenge',exact:true}).count(),0);
 assert.ok(await board.locator('.board-join img[src$="challenge-qr.png"]').isVisible());
 assert.equal(await board.locator('.idea-bubble').first().textContent(),'Campus idea 1');
 assert.ok(!(await board.locator('#board-content').textContent()).includes('availability map'),'Audience sees titles only');
 await host.screenshot({path:'.hack-build/session-host.png',fullPage:true});await board.screenshot({path:'.hack-build/session-board.png',fullPage:true});
 for(let i=3;i<5;i++)assert.equal((await post('/api/ideas',{client:`ranking_participant_${i}`,name:'Participant',title:`Campus idea ${i+1}`,idea:'Help students find a quiet place to study.'},false)).status,200);
 await host.getByRole('button',{name:'Analyse all ideas',exact:true}).click();
 await host.waitForFunction(()=>document.querySelector('#phase').textContent==='Shortlist ready');
 await host.getByRole('heading',{name:'Full ranking',exact:true}).waitFor();
 assert.equal(await host.locator('.review-row').count(),5,'Presenter sees every ranked submission');
 const complete=(await (await host.request.get(base+'/api/host')).json()).results;
 assert.equal(complete.length,5);
 assert.deepEqual(complete.map(r=>r.total),[...complete.map(r=>r.total)].sort((a,b)=>b-a),'All rankings descend by score');
 assert.deepEqual(await host.locator('.review-row b').allTextContents(),complete.map((r,i)=>`${i+1}. ${r.title}`));
 await host.screenshot({path:'.hack-build/session-full-ranking.png',fullPage:true});
 assert.equal((await (await fetch(base+'/api/state')).json()).results.length,0,'Scores stay private before reveal');
 assert.equal((await post('/api/ideas',{client:'abcdef0123456789',name:'Late',title:'Late idea',idea:'A late submission should be rejected.'},false)).status,409);
 const popupPromise=host.waitForEvent('popup');await host.getByRole('button',{name:'Reveal top three',exact:true}).click();const popup=await popupPromise;await popup.close();
 await board.locator('.winner').first().waitFor();
 const audience=(await (await fetch(base+'/api/state')).json()).results;
 assert.deepEqual(audience.map(r=>r.id),complete.slice(0,3).map(r=>r.id),'Public results expose only the top three');
 const burst=await board.locator('.confetti i').evaluateAll(pieces=>{
  const flights=pieces.map(piece=>{const animation=piece.getAnimations()[0];animation.pause();const timing=animation.effect.getTiming();animation.currentTime=timing.delay;const start=piece.getBoundingClientRect();animation.currentTime=timing.delay+timing.duration*.4;const peak=piece.getBoundingClientRect();return{start:start.toJSON(),peak:peak.toJSON(),delay:timing.delay};});
  return {flights,width:innerWidth,height:innerHeight};
 });
 assert.ok(burst.flights.every(f=>f.start.top>=burst.height-30),'Ribbons launch from the bottom, rather than fall from above');
 assert.ok(burst.flights.some(f=>f.start.left<20)&&burst.flights.some(f=>f.start.right>burst.width-20),'Both bottom corners pop');
 assert.ok(Math.max(...burst.flights.map(f=>f.delay))-Math.min(...burst.flights.map(f=>f.delay))<200,'Ribbons pop together');
 assert.ok(burst.flights.every(f=>f.peak.top<f.start.top-burst.height*.3),'Ribbons shoot upward before falling');
 await board.waitForFunction(()=>[...document.querySelectorAll('.winner')].every(el=>getComputedStyle(el).opacity==='1'));
 await board.screenshot({path:'.hack-build/session-ribbon-pop.png',fullPage:true});
 await board.emulateMedia({reducedMotion:'reduce'});
 assert.equal(await board.locator('.confetti').isVisible(),false,'Reduced motion hides the burst');
 await board.evaluate(()=>document.querySelectorAll('.confetti i').forEach(piece=>piece.getAnimations().forEach(animation=>animation.finish())));
 assert.equal(await board.locator('.winner').count(),3);assert.equal(await board.locator('.winner.first .who').textContent(),'');
 await board.screenshot({path:'.hack-build/session-podium.png',fullPage:true});
 await board.setViewportSize({width:390,height:844});assert.equal(await board.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await board.screenshot({path:'.hack-build/session-podium-mobile.png',fullPage:true});
 host.once('dialog',dialog=>dialog.accept());await host.getByRole('button',{name:'New round',exact:true}).click();await host.waitForFunction(()=>document.querySelector('#count').textContent==='0');
 const slides=await browser.newPage({...credentials,viewport:{width:1280,height:720}});
 slides.on('pageerror',e=>errors.push(e.message));
 const judgingRequests=[];slides.on('request',r=>{if(r.method()==='POST')judgingRequests.push(new URL(r.url()).pathname)});
 await slides.goto(base+'/Hackathon-Tips.html?preview=shared#challenge');
 await slides.waitForSelector('#dino-motion[data-ready="true"]');
 assert.equal(await slides.locator('.slide.active').getAttribute('aria-label'),'Cover','Shared challenge links return to the cover');
 assert.equal(await slides.locator('[data-rank],[data-dashboard],.ranking-preview').count(),0);
 assert.deepEqual(judgingRequests,[],'Shared slides never start judging');
 await slides.close();
 await post('/api/new-round',{});
 const titles=['Pocket Pantry','Laundry Buddy','Quiet Corner','Bus Whisperer','Study Spark','Daily Dose','Split & Settle','Sign to Voice'];
 for(let i=0;i<48;i++)assert.equal((await post('/api/ideas',{client:`bubble_participant_${i}`,name:'Participant',title:i===47?'A'.repeat(70):`${titles[i%titles.length]} ${i+1}`,idea:'A brief introduction that must stay off the public wall.'},false)).status,200);
 await board.emulateMedia({reducedMotion:'no-preference'});await board.setViewportSize({width:1440,height:900});await board.goto(base+'/board');
 await board.waitForFunction(()=>document.querySelectorAll('.idea-bubble').length===48);
 const first=board.locator('.idea-bubble').first();const before=await first.getAttribute('style');
 await board.waitForTimeout(1000);assert.notEqual(await first.getAttribute('style'),before,'Title bubbles gently drift');
 await board.evaluate(()=>document.querySelector('.idea-bubble').dataset.preserved='true');
 await post('/api/ideas',{client:'bubble_arrival_0001',name:'Participant',title:'Fresh arrival',idea:'Another private brief introduction for the test.'},false);
 await board.waitForFunction(()=>document.querySelectorAll('.idea-bubble').length===49);
 assert.equal(await first.getAttribute('data-preserved'),'true','New submissions retain existing bubbles');
 await board.waitForTimeout(1800);
 async function checkBubbles(){
  const sizes=await board.locator('.bubble-wall').evaluate(wall=>({wall:wall.getBoundingClientRect().toJSON(),bubbles:[...wall.querySelectorAll('.idea-bubble')].map(el=>el.getBoundingClientRect().toJSON())}));
  for(const b of sizes.bubbles){assert.ok(b.left>=sizes.wall.left&&b.right<=sizes.wall.right+1,'Bubble stays within wall');assert.ok(b.top>=sizes.wall.top&&b.bottom<=sizes.wall.bottom+1,'Bubble stays within wall vertically');}
  for(let i=0;i<sizes.bubbles.length;i++)for(let j=i+1;j<sizes.bubbles.length;j++){
   const a=sizes.bubbles[i],b=sizes.bubbles[j];
   assert.ok(Math.min(a.right,b.right)-Math.max(a.left,b.left)<5||Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)<5,'Titles separate instead of covering each other');
  }
  assert.equal(await board.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 }
 await checkBubbles();await board.screenshot({path:'.hack-build/session-bubbles.png',fullPage:true});
 await board.setViewportSize({width:390,height:844});await board.waitForTimeout(1800);await checkBubbles();
 await board.screenshot({path:'.hack-build/session-bubbles-mobile.png',fullPage:true});
 await board.emulateMedia({reducedMotion:'reduce'});
 await board.locator('.bubble-wall.is-still').waitFor();
 const staticBefore=await first.boundingBox();await board.waitForTimeout(300);assert.deepEqual(await first.boundingBox(),staticBefore,'Reduced motion keeps titles still');
 assert.deepEqual(errors,[]);
 console.log('Passed: mobile submissions, persistence/update, host protection, rubric validation, complete score validation, AI workflow with isolated test provider, hidden results, countdown, podium and new round.');
}finally{await browser.close();fixture.kill();}

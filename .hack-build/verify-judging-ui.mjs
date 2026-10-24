import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';

const browser=await chromium.launch({headless:true,channel:'chrome'});
try{
 for(const [name,source] of [['main','gdg hackathon sharing/workshop/server.py'],['backup','.hack-build/backup-repo/server.py']]){
  if(name==='backup'){try{await fs.access(source);}catch{console.log('Backup checkout absent; main application checked independently.');continue;}}
  const fixture=spawn('python',['-u','.hack-build/judging-fixture.py',source],{windowsHide:true,stdio:['ignore','pipe','pipe']});
  let output='',stderr='';fixture.stderr.on('data',data=>stderr+=data);
  const base=await new Promise((resolve,reject)=>{fixture.stdout.on('data',data=>{output+=data;const match=output.match(/http:\/\/127\.0\.0\.1:\d+/);if(match)resolve(match[0]);});fixture.once('exit',code=>reject(Error(`${code}: ${stderr}`)));});
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[];
  try{
   const host=await context.newPage();host.on('pageerror',e=>errors.push(e.message));await host.goto(base+'/host');
   await host.getByLabel('Judging method').waitFor({timeout:5000});
   const state=await (await host.request.get(base+'/api/host')).json();
   const bundle={format:'gdg-idea-backup-v1',theme:'Browser judging',criteria:state.criteria,ideas:[1,2,3].map(id=>({id,title:`Useful idea ${id}`,idea:'Help residents solve an everyday problem with a practical AI pilot.'}))};
   await host.getByLabel('Import ideas export').setInputFiles({name:'ideas.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(bundle))});
   await host.waitForFunction(()=>document.querySelector('#count').textContent==='3');
   await host.getByLabel('Judging method').selectOption('manual');
   assert.equal(await host.locator('.manual-scores input').count(),15);
   await host.getByLabel(`Useful idea 1: ${state.criteria[0].name}`,{exact:true}).fill('9');
   await host.reload();await host.waitForFunction(()=>document.querySelectorAll('.manual-scores input').length===15);
   assert.equal(await host.getByLabel('Judging method').inputValue(),'manual');
   assert.equal(await host.getByLabel(`Useful idea 1: ${state.criteria[0].name}`,{exact:true}).inputValue(),'9');
   await host.getByRole('button',{name:'Calculate ranking',exact:true}).click();
   assert.equal((await (await host.request.get(base+'/api/host')).json()).results.length,0);
   for(const id of [1,2,3])for(const criterion of state.criteria)await host.getByLabel(`Useful idea ${id}: ${criterion.name}`,{exact:true}).fill(String(10-id));
   await host.getByRole('button',{name:'Calculate ranking',exact:true}).click();
   await host.waitForFunction(()=>document.querySelectorAll('.review-row').length===3);
   assert.deepEqual((await (await host.request.get(base+'/api/host')).json()).results.map(r=>r.total),[90,80,70]);
   const popup=context.waitForEvent('page');await host.getByRole('button',{name:'Reveal top three',exact:true}).click();const board=await popup;
   await board.locator('.winner').first().waitFor();assert.match(await board.locator('#ai-note').textContent(),/Host-scored/);
   await host.request.post(base+'/api/new-round',{headers:{'X-Workshop-Host':'1'},data:{}});
   await host.request.post(base+'/api/import',{headers:{'X-Workshop-Host':'1'},data:bundle});
   await host.reload();await host.waitForFunction(()=>document.querySelector('#count').textContent==='3');
   await host.getByLabel('Judging method').selectOption('imported');
   const downloadPromise=host.waitForEvent('download');await host.getByRole('button',{name:'Export ChatGPT prompt (.md)',exact:true}).click();
   const download=await downloadPromise;const markdown=await fs.readFile(await download.path(),'utf8');
   assert.ok(markdown.includes(state.criteria[0].guidance)&&markdown.includes(bundle.ideas[2].idea));
   const batch=JSON.parse(markdown.split('```json\n')[1].split('\n```')[0]);
   const csv='round,snapshot,idea_id,score_1,score_2,score_3,score_4,score_5,strength,improve\r\n'+batch.ideas.map(i=>`${batch.round},${batch.snapshot},${i.idea_id},8,7,9,8,6,Useful.,Pilot it.`).join('\r\n');
   await host.getByLabel('Import judged scores CSV').setInputFiles({name:'scores.csv',mimeType:'text/csv',buffer:Buffer.from(csv)});
   await host.waitForFunction(()=>document.querySelectorAll('.review-row').length===3);
   assert.equal((await (await host.request.get(base+'/api/host')).json()).judgingSource,'imported');
   assert.equal(await host.getByRole('button',{name:'Reveal top three',exact:true}).isEnabled(),true);
   await host.screenshot({path:`.hack-build/${name}-judging-host.png`,fullPage:true});
   await host.request.post(base+'/api/new-round',{headers:{'X-Workshop-Host':'1'},data:{}});
   await host.request.post(base+'/api/import',{headers:{'X-Workshop-Host':'1'},data:bundle});
   await host.reload();await host.getByLabel('Judging method').selectOption('gemini');
   await host.getByLabel('Gemini API key',{exact:true}).fill('fake-key-for-fixture-only');
   await host.getByRole('button',{name:'Use this connection',exact:true}).click();
   await host.getByRole('button',{name:'Analyse all ideas',exact:true}).click();
   await host.waitForFunction(()=>document.querySelectorAll('.review-row').length===3);
   assert.equal((await (await host.request.get(base+'/api/host')).json()).judgingSource,'gemini');
   assert.deepEqual(errors,[]);
   console.log(`Passed ${name}: manual draft persistence/validation, full ranking/reveal, real Markdown download/CSV file import, Gemini connection and judging.`);
  }finally{await context.close();fixture.kill();await new Promise(resolve=>fixture.once('exit',resolve));}
 }
}finally{await browser.close();}

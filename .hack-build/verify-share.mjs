import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';

const fixture=spawn('python',['-u','.hack-build/workshop-fixture.py'],{windowsHide:true,stdio:['ignore','pipe','ignore']});
const base=await new Promise((resolve,reject)=>{fixture.stdout.once('data',data=>resolve(data.toString().trim()));fixture.once('error',reject);});
const browser=await chromium.launch({headless:true,channel:'chrome'}),errors=[];
const page=await browser.newPage({viewport:{width:1280,height:720},reducedMotion:'reduce'});
page.on('pageerror',error=>errors.push(error.message));
try{
 await page.goto(base+'/Hackathon-Tips.html#cover');
 await page.waitForSelector('#dino-motion[data-ready="true"]');
 assert.equal(await page.locator('.slide').count(),13,'The shared presentation must omit the three event-only slides');
 assert.equal(await page.locator('.slide-jump button').count(),13);
 assert.equal(await page.locator('.slide[aria-label="Challenge"],.slide[aria-label="Slido"],.slide[aria-label="Questions"],[data-rank],[data-dashboard],a[href*="sli.do"],.ranking-preview').count(),0);
 assert.equal(await page.locator('script[src*="challenge-slide"]').count(),0,'No challenge polling script in the shared deck');
 await page.keyboard.press('ArrowRight');
 await page.waitForFunction(()=>document.querySelector('.slide.active').getAttribute('aria-label')==='Intro');
 await page.keyboard.press('ArrowLeft');
 await page.waitForFunction(()=>document.querySelector('.slide.active').getAttribute('aria-label')==='Cover');
 for(const hash of ['challenge','slido','questions']){
  await page.goto(base+'/Hackathon-Tips.html#'+hash);
  await page.waitForSelector('#dino-motion[data-ready="true"]');
  assert.equal(await page.locator('.slide.active').getAttribute('aria-label'),'Cover','Hidden slide links cannot reopen event content');
 }
 await page.getByRole('button',{name:'Go directly to Criteria',exact:true}).click();
 await page.keyboard.press('ArrowRight');
 await page.waitForFunction(()=>document.querySelector('.slide.active').getAttribute('aria-label')==='Timer');
 await page.keyboard.press('ArrowRight');
 await page.waitForFunction(()=>document.querySelector('.slide.active').getAttribute('aria-label')==='Thanks');
 assert.equal(await page.locator('.slide.active a.qr-link').count(),2,'Keep the attendance and feedback forms');
 await page.emulateMedia({media:'print'});
 assert.equal(await page.locator('.slide:visible').count(),13,'Printing must not restore hidden slides');
 assert.deepEqual(errors,[]);
 console.log('Passed: 13-slide shared deck, hidden slides absent from navigation/HTML/print/deep links, working arrows, timer and closing forms.');
}finally{await browser.close();fixture.kill();}

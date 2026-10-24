import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {coverPose} from '../gdg hackathon sharing/remotion/cover-pose.mjs';
const dt=1/60;
const limits={playing:.025,sleeping:.025,watching:.025,breath:.023,blink:.32,head:.15};
for(let frame=0;frame<1800;frame++){
 const a=coverPose(frame*dt),b=coverPose((frame+1)*dt);
 for(const key of Object.keys(a))assert.ok(Math.abs(b[key]-a[key])<limits[key],`${key} snapped at frame ${frame}`);
}
assert.deepEqual(coverPose(0),coverPose(30),'Loop endpoints match exactly');
for(const key of Object.keys(coverPose(0))){
 const before=(coverPose(0)[key]-coverPose(30-dt)[key])/dt;
 const after=(coverPose(dt)[key]-coverPose(0)[key])/dt;
 assert.ok(Math.abs(before-after)<.03,`${key} changes velocity at the loop seam`);
}
const browser=await chromium.launch({headless:true,channel:'chrome'});
const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];
const base=process.env.PREVIEW_URL||'http://127.0.0.1:8777';
page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto(base+'/Hackathon-Tips.html?preview=smooth-loop#cover');
 await page.waitForSelector('.cover-lounge');
 await page.evaluate(()=>document.fonts.ready);
 for(const name of ['environment','dino-pixel','blink-pixel']){
  const response=await page.request.get(`${base}/assets/cover-lounge-${name}.png`);
  assert.equal(response.status(),200,`Generated ${name} asset is bundled`);
 }
 const sofa=await page.locator('.cover-sofa').boundingBox();
 for(const seconds of [0,2.5,8,9,10,18,20,22,26,28,29.8]){
  await page.waitForFunction(frame=>Number(document.querySelector('#arcade-dino').dataset.frame)>=frame,seconds*60,{timeout:15000});
  await page.locator('.cover-lounge').screenshot({path:`.hack-build/loop-${seconds}.png`});
 }
 await page.waitForFunction(()=>Number(document.querySelector('#arcade-dino').dataset.frame)<60,{timeout:5000});
 assert.deepEqual(await page.locator('.cover-sofa').boundingBox(),sofa,'The sofa stays planted through the animation');
 await page.locator('.stage').screenshot({path:'.hack-build/smooth-cover.png'});
 assert.equal(await page.locator('.slide.active').getAttribute('aria-label'),'Cover');
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.reload();await page.waitForSelector('.cover-lounge');
 const before=await page.locator('#arcade-dino').getAttribute('data-frame');await page.waitForTimeout(400);
 assert.equal(await page.locator('#arcade-dino').getAttribute('data-frame'),before,'Reduced motion stays still');
 assert.deepEqual(errors,[]);
 console.log('Passed: 1800 continuous poses, matching loop position and velocity, full automatic browser loop, reduced motion.');
}finally{await browser.close();}

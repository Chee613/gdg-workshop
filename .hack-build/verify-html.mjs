import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const root=fileURLToPath(new URL('../',import.meta.url)),dir=path.join(root,'.hack-build');
const spec=JSON.parse(await fs.readFile(path.join(dir,'deck-spec.json'),'utf8'));
const browser=await chromium.launch({headless:true,channel:'chrome'});
const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
const active=()=>page.locator('.slide.active').getAttribute('aria-label');
const settle=()=>page.waitForFunction(()=>document.body.dataset.transitioning!=='true'&&document.querySelector('#dino-motion')?.dataset.phase==='idle');
try{
 await page.goto('http://127.0.0.1:8776/Hackathon-Tips.html?motion=v33#intro');
 await page.waitForSelector('#dino-motion[data-ready="true"]');await page.evaluate(()=>document.fonts.ready);
 await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));
 assert.equal(await page.locator('.slide').count(),12);assert.equal(await page.locator('.slide-jump button').count(),12);
 assert.equal(await page.locator('.slide-jump').textContent(),'');assert.equal(await page.locator('.sticker').count(),4);
 const sources=new Set(await page.locator('[data-source]').evaluateAll(els=>els.map(el=>el.dataset.source)));
 for(const file of Object.keys(JSON.parse(await fs.readFile(path.join(dir,'photos.json'),'utf8'))))assert.ok(sources.has(file),`Preserve ${file}`);
 for(const [i,slide]of spec.entries()){
  await page.getByRole('button',{name:`Go directly to ${slide.name}`,exact:true}).click();await settle();
  assert.equal(await active(),slide.name);
  if(slide.buildTitle){
   const title=page.locator('.slide.active .design-title'),before=await title.boundingBox();
   assert.ok(Math.abs(before.x+before.width/2-640)<2&&Math.abs(before.y+before.height/2-360)<2,'Design title starts centred');
   assert.ok(await page.locator('.slide.active [data-build-body]').isHidden());
   await page.locator('.stage').screenshot({path:path.join(dir,`${slide.name.toLowerCase()}-title-intro.png`)});
   await page.mouse.click(1110,220);assert.equal(await active(),slide.name,'First click reveals content, not the next slide');
   await page.waitForFunction(()=>document.querySelector('.slide.active').dataset.build==='revealed');await settle();
   const after=await title.boundingBox();assert.ok(Math.abs(after.x-72)<2&&Math.abs(after.y-117)<2,'Title morphs to the header');
   if(slide.name==='Demo'){
   assert.ok(await page.locator('.slide.active [src*="bad-design-meme"]').isVisible());
   const meme=await page.locator('.slide.active [src*="bad-design-meme"]').boundingBox();assert.ok(meme.x>after.x+after.width&&Math.abs(meme.y-after.y)<6,'Meme sits beside the heading');
   assert.equal(await page.locator('.slide.active [src$="-slot.svg"]').count(),0,'Bad-design placeholders are replaced');
   assert.deepEqual(await page.locator('.slide.active .copy').allTextContents(),['Bad UI','Bad slides']);
   const gallery=page.locator('.slide.active .example-gallery');
   const visiblePair=page.locator('.slide.active .example-pair[aria-hidden="false"]');
   for(const pair of [['bad-ui-finance.png','bad-slide-inbound.png'],['bad-ui-oasis.png','bad-slide-architecture.png']]){
    assert.equal(await visiblePair.count(),1,'Only one UI/slide pair is active');
    assert.equal(await visiblePair.locator('img').count(),2);
    for(const file of pair){
     const example=visiblePair.locator(`[src$="${file}"]`);
     assert.ok(await example.isVisible());
     assert.ok((await example.boundingBox()).height>=380,'Examples have a large borderless display area');
     assert.equal(await example.evaluate(el=>getComputedStyle(el).objectFit),'contain');
     await example.click();
     assert.ok(await page.getByRole('dialog',{name:'Enlarged design example'}).isVisible());
     assert.ok((await page.locator('.image-preview img').getAttribute('src')).endsWith(file));
     assert.deepEqual(await page.locator('.image-preview').evaluate(el=>({width:el.clientWidth,height:el.clientHeight,border:getComputedStyle(el).borderWidth,padding:getComputedStyle(el).padding})),{width:1280,height:720,border:'0px',padding:'0px'});
     await page.keyboard.press('ArrowRight');assert.equal(await active(),'Demo');
     await page.keyboard.press('Escape');
    }
    if(pair[0]==='bad-ui-finance.png'){
     await page.getByRole('button',{name:'Next examples',exact:true}).click();
     await page.waitForFunction(()=>{const el=document.querySelector('.slide.active .example-gallery');return Math.abs(el.scrollLeft-el.clientWidth)<1});
    }
   }
   await page.getByRole('button',{name:'Previous examples',exact:true}).click();
   await page.waitForFunction(()=>document.querySelector('.slide.active .example-gallery').scrollLeft<1);
   await gallery.focus();await page.keyboard.press('ArrowRight');
   await page.waitForFunction(()=>{const el=document.querySelector('.slide.active .example-gallery');return Math.abs(el.scrollLeft-el.clientWidth)<1});
   assert.equal(await active(),'Demo','Gallery arrows do not navigate the deck');
   await page.keyboard.press('ArrowLeft');
   await page.waitForFunction(()=>document.querySelector('.slide.active .example-gallery').scrollLeft<1);
   assert.equal(await page.locator('.slide.active [src$="bad-ui.svg"],.slide.active [src$="bad-slide.svg"]').count(),0);
   }else if(slide.name==='Pitch'){
    assert.equal(await page.locator('.slide.active img[src*="pace-too-"]').count(),2);
    assert.ok(await page.locator('.slide.active img[src$="pace-too-slow.png"]').isVisible());
    assert.ok(!(await page.locator('.slide.active').textContent()).includes('Plain language. Tone. Pace.'));
    const branch=await page.locator('.slide.active .code-title').first().boundingBox();
    assert.ok(branch.y-after.y-after.height<45,'Pace branches sit close to the main if title');
   }else if(slide.name==='Brainstorm'){
    assert.equal(await title.textContent(),'Hackathon tips');
    assert.equal(await page.locator('.slide.active .copy').first().textContent(),'Idea Brainstorming');
    assert.ok(await page.locator('.slide.active .photo').first().isVisible());
    const heading=await page.locator('.slide.active .copy').first().boundingBox();
    const meme=await page.locator('.slide.active [src$="brainstorm-drake.png"]').boundingBox();
    assert.ok(heading.y+heading.height<meme.y,'Brainstorming heading is not covered by the meme');
    for(const brand of ['Gemini','ChatGPT','Claude','Grok']){
     const logo=page.getByRole('img',{name:`${brand} logo`,exact:true});
     assert.ok(await logo.isVisible());const box=await logo.boundingBox();
     assert.ok(box.x>=280&&box.x+box.width<=594&&box.y>=350&&box.y+box.height<445,'Logos stay inside the AI meme panel');
    }
   }
  }
  if(slide.certify){
   assert.deepEqual(await page.locator('.slide.active .copy').allTextContents(),['UI / Slide Design','Good UI']);
   assert.equal(await page.locator('[data-certify-button],.certify-action').count(),0,'Certification has no button');
   const gallery=await page.locator('.slide.active .example-gallery').boundingBox();
   const label=await page.locator('.slide.active .copy').last().boundingBox();
   assert.equal(gallery.x+gallery.width/2,640);assert.equal(label.x+label.width/2,640);
   for(const [x,y]of [[10,400],[640,450],[1230,400]]){
    await page.getByRole('button',{name:'Go directly to Design',exact:true}).click();await settle();
    assert.ok(await page.locator('.slide.active .certified-badge').isHidden());
    await page.mouse.click(x,y);await settle();
    assert.equal(await active(),'Design','A first click on either half or the image stamps without navigation');
    assert.equal(await page.locator('.slide.active').getAttribute('data-certify'),'stamped');
    assert.ok(await page.locator('.image-preview').isHidden(),'The stamping click does not open the image');
   }
   const badge=await page.getByRole('img',{name:'Good Slide Certified badge',exact:true}).boundingBox();
   assert.ok(badge.x>1000&&badge.y<130&&badge.x+badge.width<=1280,'Badge lands in the top-right corner');
   const visible=page.locator('.slide.active .example-pair[aria-hidden="false"]');
   assert.equal(await visible.locator('img').count(),1);
   assert.ok((await visible.locator('img').getAttribute('src')).endsWith('good-ui-house.png'));
   await page.getByRole('button',{name:'Next examples',exact:true}).click();
   await page.waitForFunction(()=>{const v=document.querySelector('.slide.active .example-gallery');return Math.abs(v.scrollLeft-v.clientWidth)<1});
   assert.ok((await visible.locator('img').getAttribute('src')).endsWith('good-ui-sign.jpg'));
   await visible.locator('img').click();assert.ok(await page.locator('.image-preview').isVisible());await page.keyboard.press('Escape');
   await page.getByRole('button',{name:'Previous examples',exact:true}).click();
   await page.waitForFunction(()=>document.querySelector('.slide.active .example-gallery').scrollLeft<1);
  }
  const overflow=await page.locator('.slide.active .copy').evaluateAll(els=>els.filter(el=>el.scrollWidth>el.clientWidth+1||el.scrollHeight>el.clientHeight+1).map(el=>el.textContent));
  assert.deepEqual(overflow,[],`${slide.name} copy fits`);
  assert.ok(await page.locator('.slide.active .photo').evaluateAll(els=>els.every(el=>el.getAnimations().length===0&&getComputedStyle(el).opacity==='1')),'Keep photos still');
  await page.locator('.stage').screenshot({path:path.join(dir,`html-slide-${i+1}.png`)});
 }
 assert.deepEqual(await page.locator('.slide[aria-label="Intro"] .copy').allTextContents(),['Meet the builders.','Hackathon masterclass','Zayn','Shawn','Edmund']);
 assert.equal(await page.locator('.slide[aria-label="Stories"] [src*="upload-"]').count(),2);
 assert.deepEqual(spec.slice(0,7).map(s=>s.name),['Intro','Stories','Brainstorm','Idea','Build','Showcase','Demo']);
 assert.equal(await page.locator('.slide[aria-label="Brainstorm"] [src$="brainstorm-drake.png"]').count(),1);
 assert.equal(await page.locator('.slide[aria-label="Brainstorm"] [aria-label^="Ban sign"]').count(),1);
 assert.equal(await page.locator('.slide[aria-label="Showcase"] .copy').textContent(),'Project Showcase');
 assert.equal(await page.locator('.slide[aria-label="Design"] .example-pair').count(),2);
 assert.equal(await page.locator('.slide[aria-label="Stories"] .heading').textContent(),'Hackathon');
 const storyTitle=await page.locator('.slide[aria-label="Stories"] .heading').evaluate(el=>({x:parseFloat(el.style.left),w:parseFloat(el.style.width)}));
 const trophyX=await page.locator('.slide[aria-label="Stories"] .sticker').evaluate(el=>parseFloat(el.style.left));
 assert.ok(trophyX>=storyTitle.x+storyTitle.w&&trophyX<storyTitle.x+storyTitle.w+30,'Trophy follows the Hackathon title');
 assert.equal(await page.locator('.slide[aria-label="Challenge"] .slide-action').count(),1);
 assert.equal(await page.locator('.slide[aria-label="Challenge"] a[href$="/board"]').count(),1);
 const qr=await page.locator('.slide[aria-label="Challenge"] [src$="challenge-qr.png"]').evaluate(el=>({x:parseFloat(el.style.left),y:parseFloat(el.style.top),w:parseFloat(el.style.width)}));
 assert.equal(qr.x+qr.w/2,640);assert.ok(qr.w>=380);
 assert.equal(await page.locator('[data-rank] img[src$="gdg-mark.png"]').count(),1);
 assert.equal(await page.locator('.slide[aria-label="Compare"]').count(),0);
 assert.ok(!spec.some(s=>s.name==='Compare'));
 assert.equal(qr.y,140,'QR sits closer to the theme');
 assert.equal(await page.locator('.slide[aria-label="Pitch"] .design-title').textContent(),'if (Pitch || Presentation_Video) {');
 assert.equal(await page.locator('.slide[aria-label="Pitch"] [src$="pace-too-slow.png"]').count(),1);
 assert.equal(await page.locator('.slide[aria-label="Pitch"] [src$="pace-too-fast.png"]').count(),1);
 const paceCode=(await page.locator('.slide[aria-label="Pitch"] .design-title,.slide[aria-label="Pitch"] .code-title').allTextContents()).join('\n');
 const paceExample=new Function('Pitch','Presentation_Video','pace','console',paceCode);
 for(const [pace,expected]of [['Too Slow','Audience: 😴'],['Too Fast','Audience: 🤯'],['Just Right','Audience: 😎']]){const messages=[];paceExample(true,false,pace,{log:value=>messages.push(value)});assert.deepEqual(messages,[expected]);}
 const inactive=[];paceExample(false,false,'Too Slow',{log:value=>inactive.push(value)});assert.deepEqual(inactive,[]);
 assert.ok((await page.locator('.slide[aria-label="Criteria"] .copy').allTextContents()).includes('Judging criteria'));
 assert.ok((await page.locator('.slide[aria-label="Criteria"] .copy').allTextContents()).includes('Pitch / Presentation Video'));
 await page.getByRole('button',{name:'Go directly to Intro',exact:true}).click();
 for(const [i,scene]of ['window','pipe','balloon','chase','spring','bowling','ufo','portal','rocket','hole','finish'].entries()){
  if(spec[i].certify){await page.mouse.click(1110,220);await settle();assert.equal(await active(),spec[i].name);}
  if(spec[i].buildTitle){await page.mouse.click(1110,220);await settle();assert.equal(await active(),spec[i].name);}
  await page.mouse.click(1110,220);assert.equal(await active(),spec[i].name,'Old slide stays through exit');
  await page.waitForFunction(scene=>document.querySelector('#dino-motion').dataset.scene===scene,scene);
  if(scene==='pipe'){
   await page.waitForFunction(()=>document.querySelector('#dino-motion').dataset.phase==='enter');
   const samples=await page.evaluate(async()=>{
    const points=[];
    while(document.querySelector('#dino-motion').dataset.phase==='enter'){
     const dino=document.querySelector('#arcade-dino'),pipe=document.querySelector('.warp-pipe');
     if(pipe){const d=dino.getBoundingClientRect(),p=pipe.getBoundingClientRect();points.push({action:dino.dataset.action,x:d.x,right:d.right,bottom:d.bottom,pipeX:p.x,pipeRight:p.right,pipeTop:p.y});}
     await new Promise(requestAnimationFrame);
    }
    return points;
   });
   assert.ok(samples.some(p=>p.action==='pipe-up')&&samples.some(p=>p.action==='pipe-hop'),'Dino rises vertically then jumps out');
   for(const p of samples.filter(p=>p.action==='pipe-up'))assert.ok(Math.abs(p.x-(p.pipeX+14))<1,'Rise straight through the pipe opening');
   for(const p of samples.filter(p=>p.action==='pipe-hop'&&p.x<p.pipeRight&&p.right>p.pipeX))assert.ok(p.bottom<=p.pipeTop+1,'Jump stays above the pipe rim');
   const p=samples.at(-1);assert.ok(p.x>=p.pipeRight+16,'Dino lands clear of the pipe');
  }
  if(['ufo','portal','rocket','hole','finish'].includes(scene)){
   await page.waitForFunction(()=>document.querySelector('#dino-motion').dataset.phase==='exit'&&Number(document.querySelector('#arcade-dino').dataset.frame)>=50);
   const feature={ufo:'.ufo',portal:'.teleport-portal',magnet:'.giant-magnet',rocket:'.rocket',hole:'.trapdoor',finish:'.finish-line'}[scene];
   assert.ok(await page.locator(feature).isVisible(),`${scene} has its own prop`);
   if(scene==='finish'){
    const gate=await page.locator('.finish-line').boundingBox(),button=await page.locator('[data-rank]').boundingBox();
    assert.ok(gate.x>button.x+button.width+100,'Finish gate is clear of the ranking button');
   }
   await page.locator('.stage').screenshot({path:path.join(dir,`arcade-${scene}-exit.png`)});
   await page.waitForFunction(()=>document.querySelector('#dino-motion').dataset.phase==='enter');
   await page.waitForFunction(()=>Number(document.querySelector('#arcade-dino').dataset.frame)>=22);
   await page.locator('.stage').screenshot({path:path.join(dir,`arcade-${scene}-enter.png`)});
  }
  await settle();assert.equal(await active(),spec[i+1].name);
  assert.ok(await page.locator('#arcade-dino').evaluate(el=>Number.isFinite(Number(el.dataset.x))&&Number(el.dataset.y)===(el.dataset.action==='champion'?35:62)&&Number(el.dataset.size)===1),'Dinosaur lands visibly on the next slide');
 }
 await page.getByRole('button',{name:'Go directly to Intro',exact:true}).click();await page.mouse.click(1110,220);
 await page.getByRole('button',{name:'Go directly to Challenge',exact:true}).click();await settle();assert.equal(await active(),'Challenge','Pills interrupt transitions');
 await page.getByRole('button',{name:'Go directly to Demo',exact:true}).click();
 await page.getByRole('button',{name:'Go directly to Demo',exact:true}).click();
 await page.mouse.click(1110,220);await page.getByRole('button',{name:'Go directly to Challenge',exact:true}).click();await settle();assert.equal(await active(),'Challenge','Pills cancel a title morph');
 await page.getByRole('button',{name:'Go directly to Demo',exact:true}).click();await page.getByRole('button',{name:'Go directly to Demo',exact:true}).click();
 await page.mouse.click(1110,220);await page.emulateMedia({reducedMotion:'reduce'});await settle();
 assert.equal(await active(),'Demo');assert.ok(await page.locator('.slide.active [src*="bad-design-meme"]').isVisible(),'Reduced motion completes the reveal');
 await page.mouse.click(1110,220);await settle();assert.equal(await active(),'Design');
 await page.mouse.click(1110,220);await settle();assert.equal(await active(),'Design');
 assert.ok(await page.locator('.slide.active .certified-badge').isVisible(),'Reduced motion still stamps the badge');
 await page.mouse.click(1110,220);await settle();assert.equal(await active(),'Pitch');
 await page.mouse.click(100,220);await settle();assert.equal(await active(),'Design');
 await page.mouse.click(100,220);await settle();assert.equal(await active(),'Demo');assert.ok(await page.locator('.slide.active [src*="bad-design-meme"]').isVisible(),'Backward navigation returns to revealed content');
 await page.getByRole('button',{name:'Go directly to Design',exact:true}).click();
 await page.getByRole('button',{name:'Go directly to Design',exact:true}).click();
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.mouse.click(400,220);
 await page.getByRole('button',{name:'Go directly to Challenge',exact:true}).click();await settle();
 assert.equal(await active(),'Challenge','Pill navigation cancels a stamp animation');
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.getByRole('button',{name:'Go directly to Pitch',exact:true}).click();
 await page.getByRole('button',{name:'Go directly to Pitch',exact:true}).click();
 await page.mouse.click(1110,220);await settle();assert.equal(await active(),'Pitch');
 await page.mouse.click(1110,220);await settle();assert.equal(await active(),'Criteria');
 await page.mouse.click(100,400);await settle();assert.equal(await active(),'Pitch');
 assert.ok(await page.locator('.slide.active [src$="pace-too-slow.png"]').isVisible(),'Backward navigation keeps pitch revealed');
 await page.getByRole('button',{name:'Go directly to Challenge',exact:true}).click();
 await page.emulateMedia({reducedMotion:'reduce'});await page.mouse.click(100,400);await settle();assert.equal(await active(),'Criteria');
 await page.keyboard.press('Home');await settle();assert.equal(await active(),'Intro');
 await page.keyboard.press('n');assert.ok(await page.locator('#speaker').isVisible());await page.keyboard.press('Escape');
 for(const [width,height]of [[390,844],[1920,1080]]){
  await page.setViewportSize({width,height});
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth||document.documentElement.scrollHeight>innerHeight),false);
  await page.screenshot({path:path.join(dir,width===390?'html-mobile.png':'html-wide.png')});
 }
 await page.setViewportSize({width:1280,height:720});
 await page.getByRole('button',{name:'Go directly to Thanks',exact:true}).click();await settle();
 assert.equal(await active(),'Thanks');
 assert.deepEqual(await page.locator('.slide.active .copy').allTextContents(),['Thank You']);
 assert.ok(await page.locator('.slide.active [src$="black-cat-cat-meme.gif"]').isVisible());
 assert.ok(await page.locator('.winner-trophy').isVisible());
 assert.equal(await page.locator('.winner-confetti').count(),0);
 assert.equal(await page.locator('.slide.active .cat-firework').count(),2);
 assert.ok((await page.locator('.slide.active .cat-chroma').evaluate(el=>getComputedStyle(el).filter)).includes('cat-chroma'));
 assert.equal(await page.locator('#arcade-dino').getAttribute('data-action'),'champion');
 await page.locator('.stage').screenshot({path:path.join(dir,'thank-you-finale.png')});
 await page.keyboard.press('End');await settle();assert.equal(await active(),'Thanks');
 assert.deepEqual(errors,[]);
 await fs.writeFile(path.join(dir,'html-checks.json'),JSON.stringify({passed:true,slides:12,names:spec.map(s=>s.name),sourceImages:[...sources],checks:['all original photos','both uploads','named portraits','twelve direct pills','eleven different arcade transitions','both centred titles and click-to-reveal morphs','bad and good screenshot carousels with a certification stamp','two pace memes with matching labels','separate criteria slide','interrupted title morph','static pictures','text fit','notes','keyboard','reduced motion','responsive fit']},null,2));
 console.log('Passed: twelve slides, Hackathon title and trophy, three click-to-reveal Morphs, pace memes, text fit and all navigation.');
}finally{await browser.close();}

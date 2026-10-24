(() => {
 const clock=document.querySelector('[data-countdown]');
 if(!clock)return;
 const duration=5*60*1000,face=clock.querySelector('[role="timer"]'),status=clock.querySelector('.clock-status');
 const toggle=clock.querySelector('[data-clock-toggle]'),progress=clock.querySelector('[data-clock-progress]');
 const stage=clock.closest('.slide'),host=document.getElementById('dino-motion'),motion=matchMedia('(prefers-reduced-motion: reduce)');
 const asset=name=>new URL('assets/'+name,document.baseURI).href;
 let remaining=duration,deadline=null,ticker=null,runner=null,run=null,runWidth=0;
 const stop=()=>{clearInterval(ticker);ticker=null;};
 function moveDino(left){
  const image=host?.querySelector('#arcade-dino');
  if(!stage.classList.contains('active')||host?.dataset.phase!=='idle'||!image){
   run?.cancel();run=null;
   if(runner){runner.removeAttribute('data-clock-runner');if(host?.dataset.phase==='idle')runner.src=asset('dinosaur.png');}
   runner=null;return;
  }
  if(runner!==image){run?.cancel();run=null;runner=image;runWidth=0;}
  if(!run){run=runner.animate([],{duration,fill:'both',easing:'linear'});run.pause();runner.dataset.clockRunner='true';}
  if(runWidth!==runner.offsetWidth){
   runWidth=runner.offsetWidth;
   const origin=parseFloat(runner.style.left);
   run.effect.setKeyframes([{transform:'translateX('+(40-origin)+'px)'},{transform:'translateX('+(host.clientWidth-40-runWidth-origin)+'px)'}]);
  }
  const elapsed=duration-left;
  run.currentTime=elapsed;
  if(deadline!==null&&!motion.matches){if(run.playState!=='running')run.play();}else run.pause();
  const sprite=deadline!==null&&!motion.matches?'dino-run-'+(Math.floor(elapsed/100)%2+1)+'.png':'dinosaur.png';
  if(runner.src!==asset(sprite))runner.src=asset(sprite);
 }
 function paint(){
  // Use the deadline so background-tab throttling cannot stretch five minutes.
  const left=deadline===null?remaining:Math.max(0,deadline-Date.now());
  if(left===0){remaining=0;deadline=null;stop();status.textContent="Time’s up";}
  const seconds=Math.ceil(left/1000);
  face.textContent=String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');
  progress.setAttribute('stroke-dashoffset',String(2*Math.PI*184*(1-left/duration)));
  clock.dataset.state=deadline!==null?'running':remaining===0?'done':remaining===duration?'ready':'paused';
  toggle.textContent=deadline!==null?'Pause':remaining===0?'Restart':remaining===duration?'Start':'Resume';
  moveDino(left);
 }
 toggle.addEventListener('click',()=>{
  if(deadline!==null){remaining=Math.max(0,deadline-Date.now());deadline=null;stop();status.textContent='Paused';}
  else{if(remaining===0)remaining=duration;deadline=Date.now()+remaining;ticker=setInterval(paint,100);status.textContent='';}
  paint();
 });
 clock.querySelector('[data-clock-reset]').addEventListener('click',()=>{stop();deadline=null;remaining=duration;status.textContent='Ready';paint();});
 document.addEventListener('visibilitychange',paint);
 window.addEventListener('resize',paint);
 motion.addEventListener('change',paint);
 const observer=new MutationObserver(paint);
 observer.observe(stage,{attributes:true,attributeFilter:['class']});
 if(host)observer.observe(host,{attributes:true,attributeFilter:['data-phase'],childList:true});
 paint();
})();

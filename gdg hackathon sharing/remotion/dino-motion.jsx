import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Player} from '@remotion/player';
import {Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

const rest=[130,130,190,310,130,190,190,130,190,190,130,580], names=window.gdgStages;
const asset=name=>new URL(`assets/${name}`,document.baseURI).href;
const at=(t,times,values,easing)=>interpolate(t,times,values,{extrapolateLeft:'clamp',extrapolateRight:'clamp',...(easing?{easing}:{})});

function WelcomeCape({x,y,t}){
 const width=at(t,[0,.4],[30,960]),wave=Math.sin(t*35)*3;
 return <svg className="welcome-cape" role="img" aria-label="Welcome to GDG Hackathon Masterclass" data-unfurled={width===960} viewBox="0 0 980 64" style={{position:'absolute',left:x+10-980,top:604+y-22,width:980,height:64,clipPath:`inset(0 0 0 ${980-width}px)`}}>
  <g transform="translate(980 0) scale(-1 1)">
  <path className="cape-cloth" d={`M0 32L28 5Q260 ${-1+wave} 500 7T960 5L944 32L960 59Q720 ${65+wave} 500 57T28 59Z`} fill="white" stroke="#111315" strokeWidth="3"/>
  <path d="M0 32L28 59L160 59L28 48Z" fill="#111315"/>
  <path d="M37 20H47V30H37ZM51 34H61V44H51Z" fill="#111315"/>
  </g>
  <text x="490" y="41" textAnchor="middle" fontFamily="'Bricolage Grotesque',sans-serif" fontSize="30" fontWeight="800"><tspan fill="#4285F4">Welcome to </tspan><tspan fill="#EA4335">GDG </tspan><tspan fill="#FBBC04" stroke="#775600" strokeWidth=".65" paintOrder="stroke fill">Hackathon </tspan><tspan fill="#34A853">Masterclass</tspan></text>
 </svg>;
}

function Pipe({x}){
 return <svg className="warp-pipe" aria-label="Warp pipe" viewBox="0 0 64 52" style={{position:'absolute',left:x,top:652,width:64,height:52,overflow:'visible'}} shapeRendering="crispEdges">
  <path d="M8 14H56V52H8Z" fill="#34A853" stroke="#186D34" strokeWidth="2"/>
  <path d="M14 16H22V50H14Z" fill="#89D793"/><path d="M47 16H54V50H47Z" fill="#258140"/>
  <path d="M0 0H64V17H0Z" fill="#34A853" stroke="#186D34" strokeWidth="2"/>
  <path d="M4 3H60V7H4Z" fill="#89D793"/>
 </svg>;
}

function PacMan({x,direction,t}){
 const angle=.10+.48*Math.abs(Math.sin(t*22)),dx=Math.cos(angle)*19,dy=Math.sin(angle)*19;
 return <svg className="pacman" aria-label="Pac-Man chasing the dinosaur" viewBox="0 0 42 42" style={{position:'absolute',left:x,top:662,width:42,height:42,scale:`${direction} 1`}}>
  <path d={`M21 21L${21+dx} ${21-dy}A19 19 0 1 0 ${21+dx} ${21+dy}Z`} fill="#FBBC04" stroke="#CC9200" strokeWidth="1.5"/>
  <circle cx="24" cy="9" r="2" fill="#111315"/>
 </svg>;
}

function Ufo({x,beam,t}){
 return <svg className="ufo" aria-label="UFO beaming the dinosaur aboard" viewBox="0 0 100 114" style={{position:'absolute',left:x-50,top:590,width:100,height:114}}>
  <defs><linearGradient id="tractor-beam" x2="0" y2="1"><stop stopColor="#34A853" stopOpacity=".6"/><stop offset="1" stopColor="#34A853" stopOpacity=".04"/></linearGradient></defs>
  <path d="M36 35H64L96 114H4Z" fill="url(#tractor-beam)" opacity={beam}/>
  <path d="M28 26A22 22 0 0 1 44 5Q64 1 72 26" fill="#D2E3FC" stroke="#4285F4" strokeWidth="3"/>
  <circle cx="50" cy="17" r="7" fill="#34A853"/><circle cx="47" cy="16" r="1.5"/><circle cx="53" cy="16" r="1.5"/>
  <ellipse cx="50" cy="30" rx="44" ry="13" fill="#4285F4" stroke="#174EA6" strokeWidth="2"/>
  {[24,42,60,78].map((cx,i)=><circle key={cx} cx={cx} cy={32+Math.sin(i)*3} r="3.5" fill={['#EA4335','#FBBC04','#34A853','#fff'][(i+Math.floor(t*12))%4]}/>)}
 </svg>;
}

function Portal({x,open,t,entering}){
 return <svg className="teleport-portal" aria-label="Glowing teleport portal" viewBox="0 0 62 78" style={{position:'absolute',left:x-31,top:628,width:62,height:78,scale:open}}>
  <ellipse cx="31" cy="39" rx="20" ry="32" fill="#111315" stroke={entering?'#34A853':'#4285F4'} strokeWidth="6"/>
  <ellipse cx="31" cy="39" rx="13" ry="25" fill="none" stroke="#D2E3FC" strokeWidth="2" strokeDasharray="8 9" strokeDashoffset={-t*110}/>
  <path d="M5 16L10 21M49 9L45 15M54 59L59 64M6 60L12 57" stroke="#FBBC04" strokeWidth="3"/>
 </svg>;
}

function Rocket({x,y,t,lit,size}){
 return <svg className="rocket" aria-label="Dinosaur riding a rocket" viewBox="0 0 52 78" style={{position:'absolute',left:x-9,top:y,width:52,height:78,scale:size,transformOrigin:'50% 0'}}>
  {lit&&<path d={`M17 53Q26 ${72+Math.sin(t*95)*5} 35 53L26 61Z`} fill="#FBBC04" stroke="#EA4335" strokeWidth="3"/>}
  <path d="M15 35L5 55L18 51M37 35L47 55L34 51" fill="#4285F4"/>
  <path d="M16 51V25Q16 12 26 5Q36 12 36 25V51Z" fill="white" stroke="#5F6368" strokeWidth="2"/>
  <path d="M17 20Q20 10 26 5Q32 10 35 20Z" fill="#EA4335"/>
  <circle cx="26" cy="31" r="6" fill="#D2E3FC" stroke="#4285F4" strokeWidth="2"/>
  <path d="M17 48H35" stroke="#34A853" strokeWidth="5"/>
 </svg>;
}

function Trapdoor({x,open,opacity}){
 return <svg className="trapdoor" aria-label="Secret trapdoor beneath the dinosaur" viewBox="0 0 120 64" style={{position:'absolute',left:x-60,top:650,width:120,height:64,opacity}}>
  <ellipse cx="60" cy="53" rx="53" ry="9" fill="#111315" stroke="#4285F4" strokeWidth="3"/>
  <path d={`M7 52H113L104 ${52-open*43}H16Z`} fill="#E8F0FE" stroke="#4285F4" strokeWidth="3"/>
  <path d={`M48 ${48-open*32}H72`} stroke="#34A853" strokeWidth="4"/>
 </svg>;
}

function ArcadeScene({phase,kind,from,to,direction}){
 const frame=useCurrentFrame(),{durationInFrames,fps}=useVideoConfig(),t=frame/(durationInFrames-1)*.8;
 const exiting=phase==='exit', entering=phase==='enter';
 const champion=to===names.length-1&&!exiting;
 const welcome=exiting&&kind==='window'&&from===0&&to===1;
 let x=rest[exiting?from:to],y=62,facing=1,action='idle',pipe=null,chaser=null,board=null,clip=false,surprise=false;
 let size=1,opacity=1,rotation=0,ufo=null,beam=0,portal=null,portalOpen=1,rocket=null,hole=null,balloons=null,bowling=null;
 if(exiting&&kind==='window'){
  x=welcome?at(t,[0,.8],[rest[from],2310]):at(t,[0,.28,.68],[rest[from],26,-66]);
  y=welcome?62:at(t,[0,.28,.46,.68],[62,62,4,-70]);facing=welcome?1:-1;
  action=welcome||t<.28?'run':'window-jump';
 }else if(entering&&(kind==='window'||kind==='spring')){
  x=rest[to];y=t<.46?at(t,[0,.46],[-680,62],Easing.bezier(.6,0,1,1)):at(t,[.46,.56,.66],[62,44,62]);
  action=t<.46?'fall':t<.66?'land':'idle';
 }else if(exiting&&kind==='pipe'){
  pipe=608;x=at(t,[0,.3,.52],[rest[from],540,622]);y=at(t,[0,.29,.41,.52,.6,.75],[62,62,-20,10,10,110]);
  clip=t>=.52;action=t<.29?'run':t<.6?'pipe-hop':'pipe-down';
 }else if(entering&&kind==='pipe'){
  pipe=Math.max(24,rest[to]-154);
  x=at(t,[0,.32,.64],[pipe+14,pipe+14,rest[to]]);y=at(t,[0,.26,.38,.64],[108,4,-24,62]);
  clip=t<.32;facing=1;action=t<.32?'pipe-up':t<.64?'pipe-hop':'idle';
 }else if(exiting&&kind==='chase'){
  surprise=t<.2;facing=t<.18?-direction:direction;
  x=t<.18?rest[from]+Math.sin(t*110)*2:at(t,[.18,.73],[rest[from],direction>0?1340:-70],Easing.bezier(.25,0,.6,1));
  y=62-(t<.18?Math.sin(t/.18*Math.PI)*8:Math.abs(Math.sin(t*45))*2);
  chaser=at(t,[0,.18,.8],[direction>0?-65:1310,rest[from]-direction*130,direction>0?1210:50]);
  action=t<.18?'surprised':'flee';
 }else if(entering&&kind==='chase'){
  x=at(t,[0,.57],[direction>0?-60:1310,rest[to]],Easing.bezier(.16,1,.3,1));facing=direction;
  action=t<.57?'skid':'idle';
 }else if(exiting&&kind==='spring'){
  board=at(t,[.28,.36,.42],[0,1,0]);x=at(t,[0,.28,.38,.73],[rest[from],600,600,direction>0?1350:-80]);
  y=at(t,[0,.28,.38,.56,.73],[62,44,50,-70,-130]);facing=t<.38?1:direction;
  action=t<.28?'run':t<.38?'spring-squash':'launch';
 }else if(kind==='ufo'&&(exiting||entering)){
  if(exiting){
   ufo=at(t,[0,.22,.58,.8],[-100,rest[from]+17,rest[from]+17,1390]);
   beam=at(t,[.18,.25,.55,.62],[0,1,1,0]);surprise=t>.16&&t<.34;
   y=at(t,[.3,.56],[62,-2],Easing.bezier(.42,0,.58,1));size=at(t,[.4,.58],[1,.15]);opacity=at(t,[.53,.6],[1,0]);
   x=rest[from]+Math.sin(t*75)*at(t,[.3,.55],[0,4]);rotation=Math.sin(t*40)*at(t,[.3,.55],[0,15]);
   action=t<.3?'surprised':'abducted';
  }else{
   ufo=at(t,[0,.16,.5,.8],[-100,rest[to]+17,rest[to]+17,1390]);beam=at(t,[.14,.2,.48,.6],[0,1,1,0]);
   y=at(t,[0,.2,.48,.57,.66],[-2,-2,62,48,62]);size=at(t,[.18,.32],[.15,1]);opacity=at(t,[.16,.22],[0,1]);
   action=t<.48?'ufo-drop':t<.66?'land':'idle';
  }
 }else if(kind==='portal'&&(exiting||entering)){
  if(exiting){
   portal=rest[from]+210;portalOpen=at(t,[0,.18],[0,1]);
   x=at(t,[0,.16,.56],[rest[from],rest[from],portal-17]);size=at(t,[.48,.66],[1,0]);opacity=at(t,[.62,.7],[1,0]);rotation=at(t,[.46,.66],[0,100]);
   action=t<.48?'run':'teleport-in';
  }else{
   portal=rest[to]-72;portalOpen=at(t,[.55,.8],[1,0]);
   x=at(t,[0,.16,.55],[portal-17,portal-17,rest[to]]);size=at(t,[.05,.24],[0,1]);rotation=at(t,[.05,.32],[-100,0]);
   y=62-20*Math.sin(at(t,[.16,.55],[0,Math.PI]));action=t<.24?'teleport-out':t<.55?'run':'idle';
  }
 }else if(kind==='rocket'&&(exiting||entering)){
  if(exiting){
   y=at(t,[0,.26,.42,.8],[62,62,48,-740],Easing.bezier(.42,0,.8,1));
   x=rest[from]+(t<.3?Math.sin(t*100)*2:0);rocket={x,y:604+y+24,size:at(t,[0,.16],[0,1]),lit:t>.2};
   action=t<.3?'rocket-ready':'rocket-launch';
  }else{
   y=at(t,[0,.38,.52,.62],[-740,46,62,62],Easing.bezier(.2,0,.5,1));
   rocket={x,y:604+y+24+at(t,[.38,.7],[0,120]),size:at(t,[.42,.75],[1,0]),lit:t<.38};
   action=t<.38?'rocket-return':t<.62?'land':'idle';
  }
 }else if(kind==='hole'&&(exiting||entering)){
  if(exiting){
   hole={x:600,open:at(t,[.2,.38],[0,1])};x=at(t,[0,.35],[rest[from],582]);surprise=t>.32&&t<.47;
   y=at(t,[.43,.7],[62,160],Easing.bezier(.6,0,1,1));action=t<.35?'run':t<.45?'surprised':'trapdoor-fall';
  }else{
   hole={x:rest[to]+17,open:at(t,[.48,.75],[1,0])};
   y=at(t,[0,.16,.4,.58],[160,160,20,62]);action=t<.4?'trapdoor-pop':t<.58?'land':'idle';
  }
 }else if(kind==='balloon'&&(exiting||entering)){
  if(exiting){
   y=at(t,[0,.24,.8],[62,62,-740],Easing.bezier(.42,0,.75,1));action=t<.24?'balloon-ready':'balloon-lift';
   balloons={x:x-25,y:604+y-80};
  }else{
   y=at(t,[0,.48,.6],[-740,62,62],Easing.bezier(.2,0,.5,1));action=t<.48?'balloon-return':'idle';
   balloons={x:x-25,y:604+y-80-at(t,[.48,.8],[0,850])};
  }
 }else if(kind==='bowling'&&(exiting||entering)){
  if(exiting){
   bowling=at(t,[0,.24,.8],[-60,rest[from]-25,1400]);surprise=t<.24;
   x=at(t,[.24,.8],[rest[from],1400]);rotation=at(t,[.24,.8],[0,900]);y=62-20*Math.abs(Math.sin(at(t,[.24,.8],[0,Math.PI*3])));
   action=t<.24?'surprised':'bowling-roll';
  }else{
   x=at(t,[0,.55],[-70,rest[to]],Easing.bezier(.16,1,.3,1));rotation=at(t,[0,.55],[-540,0]);action=t<.55?'bowling-return':'idle';
  }
 }else if(kind==='finish'&&(exiting||entering)){
  if(exiting){
   x=at(t,[0,.8],[rest[from],direction>0?1400:-100]);facing=direction;action='run';
  }else if(!champion){
   x=at(t,[0,.55],[-70,rest[to]]);action=t<.55?'run':'idle';
  }
 }
 if(champion){
  x=entering?at(t,[0,.35],[-70,rest[to]],Easing.bezier(.16,1,.3,1)):rest[to];
  y=35-(entering?25*Math.sin(at(t,[.35,.65],[0,Math.PI])):0);
  action=entering&&t<.35?'run':'champion';
 }
 const running=['run','flee','skid'].includes(action);
 return <>
  <div aria-hidden="true" style={{position:'absolute',left:0,top:704,width:1280,height:2,background:'#DADCE0'}}/>
  <div aria-hidden="true" style={{position:'absolute',left:0,top:710,width:1280,height:3,backgroundImage:'repeating-linear-gradient(90deg,transparent 0 28px,#E8EAED 28px 32px,transparent 32px 75px)'}}/>
  {board!==null&&<div className="springboard" aria-label="Springboard" style={{position:'absolute',left:592,top:686+board*7,width:60,height:18-board*7,borderBottom:'4px solid #4285F4',borderTop:'6px solid #EA4335',background:'repeating-linear-gradient(135deg,transparent 0 6px,#5F6368 6px 9px,transparent 9px 13px)'}}/>}
  {chaser!==null&&<PacMan x={chaser} direction={direction} t={t}/>}
  {ufo!==null&&<Ufo x={ufo} beam={beam} t={t}/>}
  {hole!==null&&<Trapdoor {...hole} opacity={entering?at(t,[.65,.8],[1,0]):1}/>}
  {rocket!==null&&<Rocket {...rocket} t={t}/>}
  {balloons!==null&&<svg className="dino-balloons" aria-label="GDG balloons lifting the dinosaur" viewBox="0 0 90 112" style={{position:'absolute',left:balloons.x,top:balloons.y,width:90,height:112}}>
   <path d="M24 38L46 108L67 40M44 30L46 108" fill="none" stroke="#5F6368" strokeWidth="1.5"/>
   <ellipse cx="24" cy="26" rx="17" ry="23" fill="#4285F4"/><ellipse cx="66" cy="28" rx="17" ry="23" fill="#EA4335"/><ellipse cx="45" cy="19" rx="17" ry="24" fill="#FBBC04"/>
   <path d="M18 12L15 18M61 13L58 19M40 4L37 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
  </svg>}
  {bowling!==null&&<svg className="bowling-ball" aria-label="Bowling ball sending the dinosaur rolling" viewBox="0 0 42 42" style={{position:'absolute',left:bowling,top:662,width:42,height:42,rotate:`${t*1000}deg`}}>
   <circle cx="21" cy="21" r="20" fill="#4285F4"/><circle cx="16" cy="12" r="3" fill="#174EA6"/><circle cx="25" cy="12" r="3" fill="#174EA6"/><circle cx="21" cy="20" r="3" fill="#174EA6"/>
  </svg>}
  {exiting&&kind==='finish'&&<svg className="finish-line" aria-label="Dinosaur crossing the finish line" viewBox="0 0 116 78" style={{position:'absolute',left:1010,top:626,width:116,height:78}}>
   <path d="M9 2V78M107 2V78" stroke="#4285F4" strokeWidth="4"/>
   <rect x="9" y="3" width="98" height="20" fill="white" stroke="#111315" strokeWidth="2"/>
   {[0,1,2,3,4,5,6,7,8,9].map(i=><rect key={i} x={9+i*9.8} y={i%2?13:3} width="9.8" height="10" fill="#111315"/>)}
  </svg>}
  {champion&&<>
   <img className="winner-trophy" src={asset('sticker-trophy.png')} alt="Chrome dinosaur won the trophy" style={{position:'absolute',left:rest[to]+70,top:640+(entering?at(t,[.35,.6],[-45,0]):0),width:64,height:64,opacity:entering?at(t,[.35,.48],[0,1]):1}}/>
  </>}
  {welcome&&<WelcomeCape x={x} y={y} t={t}/>}
  <div style={{position:'absolute',inset:0,...(clip?{clipPath:'inset(0 0 68px 0)'}:{})}}>
   <img id="arcade-dino" src={asset(running?`dino-run-${Math.floor(welcome?frame/fps*10:t*14)%2+1}.png`:'dinosaur.png')}
    alt={`Dinosaur in ${names[exiting?from:to]}`} data-action={action} data-x={x} data-y={y} data-size={size} data-frame={frame}
    style={{position:'absolute',left:x,top:604+y,width:champion?60:35,height:champion?65:38,imageRendering:'pixelated',objectFit:'contain',scale:`${facing*size} ${size}`,opacity,rotate:`${action==='launch'?direction*-16:rotation}deg`}}/>
  </div>
  {surprise&&<span className="surprise" aria-label="Dinosaur is surprised" style={{position:'absolute',left:x+12,top:628,font:'bold 27px monospace',color:'#EA4335'}}>!</span>}
  {pipe!==null&&<Pipe x={pipe}/>}
  {portal!==null&&<Portal x={portal} open={portalOpen} t={t} entering={entering}/>}
 </>;
}

function ArcadePlayer(){
 const player=useRef(null),pending=useRef(null),serial=useRef(0),lastFrame=useRef(59),host=document.getElementById('dino-motion');
 const initial=Math.max(0,names.indexOf(document.querySelector('.slide.active').getAttribute('aria-label')));
 const [job,setJob]=useState({phase:'idle',kind:'window',from:initial,to:initial,direction:1,id:0});
 const durationInFrames=job.phase==='exit'?(job.kind==='window'&&job.from===0&&job.to===1?270:108):60;
 const complete=()=>{host.dataset.phase='idle';const resolve=pending.current;pending.current=null;resolve?.();};
 useEffect(()=>{
  // ponytail: the Player's ended event is the slide-change clock; no second timer to drift.
  player.current.addEventListener('ended',complete);
  window.arcadeTransition=options=>new Promise(resolve=>{pending.current=resolve;setJob({...options,id:++serial.current});});
  window.arcadeIdle=stage=>setJob({phase:'idle',kind:'window',from:stage,to:stage,direction:1,id:++serial.current});
  window.finishArcade=()=>{player.current.pause();player.current.seekTo(lastFrame.current);complete();};
  host.dataset.ready='true';
  return()=>{player.current?.removeEventListener('ended',complete);delete window.arcadeTransition;delete window.arcadeIdle;delete window.finishArcade;};
 },[]);
 useLayoutEffect(()=>{
  lastFrame.current=durationInFrames-1;
  player.current.pause();player.current.seekTo(0);host.dataset.phase=job.phase;host.dataset.scene=job.kind;
  if(job.phase==='idle')return;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){player.current.seekTo(lastFrame.current);complete();}else player.current.play();
 },[job]);
 return <Player ref={player} component={ArcadeScene} inputProps={job} durationInFrames={durationInFrames} compositionWidth={1280} compositionHeight={720} fps={60}
  controls={false} autoPlay={false} loop={false} moveToBeginningWhenEnded={false} clickToPlay={false} doubleClickToFullscreen={false} spaceKeyToPlayOrPause={false}
  style={{width:1280,height:720,backgroundColor:'transparent'}}/>;
}

createRoot(document.getElementById('dino-motion')).render(<ArcadePlayer/>);

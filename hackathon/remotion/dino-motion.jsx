import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Player} from '@remotion/player';
import {Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {coverPose} from './cover-pose.mjs';

const names=window.gdgStages,rest=names.map(name=>({Cover:535,Brainstorm:190,Idea:310,Showcase:190,Demo:190,Pitch:190,Criteria:190,Timer:190,Questions:190,Thanks:580})[name]??130);
const timing={window:[4.5,1.2],pipe:[1.8,1.25],plane:[1.8,1.35],balloon:[2.1,1.3],bridge:[1.8,1.25],chase:[1.6,1],spring:[1.8,1.1],bowling:[1.8,1.15],ufo:[2.15,1.65],portal:[1.8,1.2],rocket:[2.4,1.8],hole:[1.8,1.2],magnet:[1.8,1.3],train:[2,1.35],finish:[1.8,1.25]};
const asset=name=>new URL(`assets/${name}`,document.baseURI).href;
const at=(t,times,values,easing=Easing.inOut(Easing.quad))=>interpolate(t,times,values,{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing});

function PaperPlane({x,y,bank,opacity}){
 return <svg className="paper-plane" aria-label="Paper plane carrying the dinosaur" viewBox="0 0 116 45" style={{position:'absolute',left:x-36,top:604+y+31,width:116,height:45,rotate:`${bank}deg`,opacity}}>
  <path d="M3 13L110 2L67 39L50 25L32 33L36 22Z" fill="white" stroke="#4285F4" strokeWidth="2.5" strokeLinejoin="round"/>
  <path d="M36 22L110 2L50 25L32 33Z" fill="#D2E3FC" stroke="#4285F4" strokeWidth="1.5"/>
  <path d="M5 32H21M13 40H28" stroke="#34A853" strokeWidth="2" strokeLinecap="round"/>
 </svg>;
}

function DrawnBridge({start,end,draw,opacity}){
 const tip=start+(end-start)*draw;
 return <svg className="drawn-bridge" aria-label="Pencil drawing a bridge for the dinosaur" viewBox="0 0 1280 96" style={{position:'absolute',left:0,top:620,width:1280,height:96,opacity}}>
  <path d={`M${start} 81Q${(start+end)/2} 63 ${end} 81`} pathLength="1" fill="none" stroke="#4285F4" strokeWidth="5" strokeDasharray="1" strokeDashoffset={1-draw} strokeLinecap="round"/>
  <g transform={`translate(${tip-4} 70) rotate(-35)`}><path d="M0 0V-42H12V0L6 12Z" fill="#FBBC04" stroke="#775600" strokeWidth="1.5"/><path d="M0-42V-49H12V-42" fill="#EA4335"/><path d="M2 3L6 12L10 3" fill="#111315"/></g>
 </svg>;
}

function Magnet({x,pull,opacity}){
 return <svg className="giant-magnet" aria-label="Magnet pulling the dinosaur" viewBox="0 0 100 68" style={{position:'absolute',left:x,top:636,width:100,height:68,opacity}}>
  <path d="M35 12H60A22 22 0 0 1 60 56H35V42H60A8 8 0 0 0 60 26H35Z" fill="#EA4335" stroke="#A52714" strokeWidth="2"/>
  <path d="M26 12H42V26H26ZM26 42H42V56H26Z" fill="#E8F0FE" stroke="#4285F4" strokeWidth="2"/>
  <g opacity={pull} fill="none" stroke="#4285F4" strokeWidth="2" strokeLinecap="round"><path d="M15 18L5 12M13 34H0M15 50L5 56"/></g>
 </svg>;
}

function Train({x,rotation,opacity}){
 return <svg className="gdg-train" aria-label="GDG express train carrying the dinosaur" viewBox="0 0 160 66" style={{position:'absolute',left:x-40,top:648,width:160,height:66,opacity}}>
  <path d="M8 25H91V48H8ZM91 10H133L151 28V48H91Z" fill="#E8F0FE" stroke="#4285F4" strokeWidth="2"/>
  <path d="M101 16H126L136 27H101Z" fill="#4285F4"/><path d="M4 48H155" stroke="#34A853" strokeWidth="4"/>
  <path d="M96 5H131" stroke="#EA4335" strokeWidth="5" strokeLinecap="round"/><rect x="141" y="32" width="9" height="9" rx="2" fill="#FBBC04"/>
  {[24,72,119].map(cx=><g key={cx} transform={`rotate(${rotation} ${cx} 53)`}><circle cx={cx} cy="53" r="9" fill="white" stroke="#5F6368" strokeWidth="3"/><path d={`M${cx-6} 53H${cx+6}M${cx} 47V59`} stroke="#4285F4" strokeWidth="2"/></g>)}
 </svg>;
}

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

function CoverLounge({activity,seconds}){
 const {playing,sleeping,watching,breath,blink,head}=coverPose(seconds);
 const gamePhase=(seconds%3.75)/3.75;
 const jump=Math.sin(Math.PI*Math.max(0,Math.min(1,(gamePhase-.64)/.34)))**2*74;
 const dino=asset('cover-lounge-dino-pixel.png');
 return <svg className="cover-lounge" role="img" aria-label={activity==='sleep'?'Dinosaur taking a nap':activity==='play'?'Dinosaur playing Dino Run on TV':'Dinosaur watching TV'} viewBox="0 0 1774 887" style={{position:'absolute',left:390,top:455,width:500,height:250,overflow:'visible'}}>
  <defs>
   <clipPath id="cover-tv-screen"><rect x="1148" y="374" width="411" height="258" rx="23"/></clipPath>
   <clipPath id="cover-dino-lower"><path d="M0 400H420V565H1000V887H0Z"/></clipPath>
   <clipPath id="cover-dino-torso"><rect x="420" y="355" width="480" height="245"/></clipPath>
   <clipPath id="cover-dino-head"><rect width="1000" height="420"/></clipPath>
   <radialGradient id="cover-eye-feather"><stop offset=".7" stopColor="white"/><stop offset="1" stopColor="black"/></radialGradient>
   <mask id="cover-eye-patch"><ellipse cx="605" cy="203" rx="75" ry="58" fill="url(#cover-eye-feather)"/></mask>
  </defs>
  <image className="cover-sofa" href={asset('cover-lounge-environment.png')} width="1774" height="887"/>
  <ellipse cx="655" cy="775" rx="185" ry="12" fill="#111315" opacity=".07"/>
  <g className="cover-dino" data-breath={breath}>
   <image href={dino} width="1774" height="887" clipPath="url(#cover-dino-lower)"/>
   <g className="cover-dino-body" transform={`rotate(${playing*.6+sleeping*1.4} 550 590) translate(0 ${590*(1-(1+breath*.003))}) scale(1 ${1+breath*.003})`}>
    <image href={dino} width="1774" height="887" clipPath="url(#cover-dino-torso)"/>
    <g className="cover-dino-head" transform={`rotate(${head} 550 375)`}>
     <image href={dino} width="1774" height="887" clipPath="url(#cover-dino-head)"/>
     <image href={asset('cover-lounge-blink-pixel.png')} width="1774" height="887" mask="url(#cover-eye-patch)" opacity={blink}/>
    </g>
   </g>
  </g>
  <g clipPath="url(#cover-tv-screen)">
   <g opacity={watching*.9}>
    {['#4285F4','#EA4335','#FBBC04','#34A853'].map((color,i)=><rect key={color} x={1182+i*89} y={470-Math.sin(seconds*Math.PI*2/5+i)*16} width="66" height={116+Math.sin(seconds*Math.PI*2/5+i)*16} rx="12" fill={color}/>)}
   </g>
   <g opacity={playing*.9}>
    <path d="M1160 615H1550" stroke="white" strokeOpacity=".65" strokeWidth="3"/>
    <image href={asset(`dino-run-${Math.floor(seconds*10)%2+1}.png`)} x="1200" y={539-jump} width="67" height="74" style={{imageRendering:'pixelated',filter:'brightness(0) invert(1)'}}/>
    <image href={asset('cactus.png')} x={1630-gamePhase*520} y="551" width="38" height="62" style={{imageRendering:'pixelated',filter:'brightness(0) invert(1)'}}/>
   </g>
   <g opacity={sleeping*.9}>
    <path d="M1378 440A66 66 0 1 0 1390 553A62 62 0 0 1 1378 440Z" fill="#D2E3FC"/>
    <circle cx="1450" cy="455" r="5" fill="#FBBC04"/><circle cx="1252" cy="521" r="4" fill="white"/>
   </g>
  </g>
  {[0,1,2].map(i=>{const drift=((seconds+i)%3)/3;return <text key={i} x={890+drift*30} y={250-drift*95} fontFamily="Arial,sans-serif" fontWeight="700" fontSize={40+drift*16} fill="#4285F4" opacity={sleeping*Math.sin(drift*Math.PI)**2*.65}>z</text>;})}
 </svg>;
}

function ArcadeScene({phase,kind,from,to,direction}){
 const frame=useCurrentFrame(),{durationInFrames,fps}=useVideoConfig(),t=frame/(durationInFrames-1)*.8;
 const exiting=phase==='exit', entering=phase==='enter';
 const champion=to===names.length-1&&!exiting;
 const coverIdle=phase==='idle'&&names[to]==='Cover',seconds=frame/fps;
 const activity=seconds<8||seconds>=29?'watch':seconds<18?'play':'sleep';
 const welcome=exiting&&kind==='window'&&from===0&&to===1;
 let x=rest[exiting?from:to],y=62,facing=1,action='idle',pipe=null,chaser=null,board=null,clip=false,surprise=false;
 let size=1,opacity=1,rotation=0,ufo=null,beam=0,portal=null,portalOpen=1,rocket=null,hole=null,balloons=null,bowling=null,plane=null,bridge=null,magnet=null,train=null;
 if(exiting&&kind==='window'){
  x=welcome?at(t,[0,.8],[rest[from],2310],Easing.linear):at(t,[0,.28,.68],[rest[from],26,-66]);
  y=welcome?62:at(t,[0,.28,.46,.68],[62,62,4,-70]);facing=welcome?1:-1;
  action=welcome||t<.28?'run':'window-jump';
 }else if(entering&&kind==='window'){
  x=at(t,[0,.64],[-65,rest[to]],Easing.out(Easing.cubic));action=t<.64?'run':'idle';
 }else if(entering&&kind==='spring'){
  x=rest[to];y=t<.46?at(t,[0,.46],[-680,62],Easing.bezier(.6,0,1,1)):at(t,[.46,.56,.66],[62,44,62]);
  action=t<.46?'fall':t<.66?'land':'idle';
 }else if(exiting&&kind==='pipe'){
  pipe=608;x=at(t,[0,.3,.52],[rest[from],540,622]);y=at(t,[0,.29,.41,.52,.6,.75],[62,62,-20,10,10,110]);
  clip=t>=.52;action=t<.29?'run':t<.6?'pipe-hop':'pipe-down';
 }else if(entering&&kind==='pipe'){
  pipe=Math.max(24,rest[to]-154);
  x=at(t,[0,.32,.64],[pipe+14,pipe+14,rest[to]]);y=at(t,[0,.26,.38,.64],[108,4,-24,62]);
  clip=t<.32;facing=1;action=t<.32?'pipe-up':t<.64?'pipe-hop':'idle';
 }else if(kind==='plane'&&(exiting||entering)){
  if(exiting){
   x=at(t,[0,.2,.8],[rest[from],rest[from]+50,1390]);y=at(t,[0,.2,.55,.8],[62,62,26,38]);
   plane={x,y,bank:at(t,[0,.28,.8],[0,-7,-2]),opacity:at(t,[0,.16],[0,1])};
   action=t<.2?'plane-board':'plane-glide';rotation=at(t,[.2,.45],[0,-5]);
  }else{
   x=at(t,[0,.52],[-120,rest[to]],Easing.out(Easing.cubic));y=at(t,[0,.52],[34,62]);
   plane={x:x+at(t,[.52,.8],[0,600]),y:y+at(t,[.52,.8],[0,45]),bank:at(t,[.5,.8],[0,12]),opacity:at(t,[.58,.8],[1,0])};
   action=t<.52?'plane-land':'idle';
  }
 }else if(kind==='bridge'&&(exiting||entering)){
  if(exiting){
   bridge={start:rest[from]-25,end:1370,draw:at(t,[0,.5],[0,1]),opacity:1};
   x=at(t,[.22,.8],[rest[from],1380]);y=62-9*Math.sin(at(t,[.22,.8],[0,Math.PI]));action=t<.22?'drawing':'run';
  }else{
   bridge={start:-100,end:rest[to]+40,draw:1,opacity:at(t,[.58,.8],[1,0])};
   x=at(t,[0,.6],[-70,rest[to]],Easing.out(Easing.cubic));y=62-9*Math.sin(at(t,[0,.6],[0,Math.PI]));action=t<.6?'run':'idle';
  }
 }else if(kind==='magnet'&&(exiting||entering)){
  if(exiting){
   const grab=at(t,[.16,.36],[0,1]);x=at(t,[.32,.8],[rest[from],1390],Easing.in(Easing.cubic));y=62-18*grab;rotation=-10*grab;
   magnet={x:x+60,pull:grab,opacity:at(t,[0,.16],[0,1])};action=t<.32?'magnet-resist':'magnet-pull';
  }else{
   x=at(t,[0,.58],[-70,rest[to]],Easing.out(Easing.cubic));y=at(t,[0,.48,.6,.7],[44,44,64,62]);rotation=at(t,[.4,.65],[-10,0]);
   magnet={x:x+60+at(t,[.48,.8],[0,1300]),pull:at(t,[.45,.6],[1,0]),opacity:at(t,[.65,.8],[1,0])};action=t<.48?'magnet-pull':t<.7?'land':'idle';
  }
 }else if(kind==='train'&&(exiting||entering)){
  if(exiting){
   x=at(t,[.24,.8],[rest[from],1400],Easing.in(Easing.cubic));y=at(t,[0,.16,.24],[62,28,31]);
   train={x:x-20,y,rotation:(x-rest[from])*5,opacity:at(t,[0,.14],[0,1])};action=t<.24?'train-board':'train-ride';
  }else{
   x=at(t,[0,.5],[-150,rest[to]],Easing.out(Easing.cubic));y=at(t,[0,.45,.55,.68],[31,31,22,62]);
   train={x:x-20+at(t,[.5,.8],[0,1500]),rotation:(x+150+at(t,[.5,.8],[0,1500]))*5,opacity:at(t,[.72,.8],[1,0])};action=t<.5?'train-ride':t<.68?'train-hop':'idle';
  }
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
   x=at(t,[0,.32],[rest[from],1220]);y=at(t,[0,.32,.42,.8],[62,62,20,-740],Easing.bezier(.42,0,.8,1));
   rocket={x:1220,y:604+y+24+at(t,[0,.24],[110,0]),size:at(t,[.12,.28],[0,1]),lit:t>.35};
   action=t<.32?'run':t<.42?'rocket-ready':'rocket-launch';
  }else{
   x=at(t,[0,.36,.7],[1220,1220,rest[to]]);y=at(t,[0,.32,.42,.64],[-740,20,40,62],Easing.bezier(.2,0,.5,1));
   rocket={x:1220,y:604+y+24+at(t,[.32,.6],[0,150]),size:at(t,[.35,.6],[1,0]),lit:t<.32};
   facing=t>.36?-1:1;action=t<.32?'rocket-return':t<.64?'rocket-dismount':t<.7?'run':'idle';
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
   x=at(t,[.16,.8],[rest[from],1400]);y=62-4*Math.sin(at(t,[.16,.8],[0,Math.PI]));action=t<.16?'balloon-ready':'balloon-lift';
   balloons={x:x-14,y:604+y-35};
  }else{
   x=at(t,[0,.52],[-80,rest[to]],Easing.out(Easing.cubic));y=at(t,[0,.52],[52,62]);action=t<.52?'balloon-return':'idle';
   balloons={x:x-14+at(t,[.52,.8],[0,1300]),y:604+y-35-at(t,[.52,.8],[0,30])};
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
 if(coverIdle){x=rest[to];y=14;action=`cover-${activity}`;rotation=activity==='sleep'?-10:0;}
 const running=['run','flee','skid'].includes(action);
 const landing=entering&&action==='land'?1-.1*Math.sin(at(t,[.48,.66],[0,Math.PI])):1;
 const dinoWidth=champion?60:coverIdle?78:welcome?at(t,[0,.08],[78,35]):35;
 const dinoHeight=champion?65:coverIdle?86:welcome?at(t,[0,.08],[86,38]):38;
 return <>
  <div aria-hidden="true" style={{position:'absolute',left:0,top:704,width:1280,height:2,background:'#DADCE0'}}/>
  <div aria-hidden="true" style={{position:'absolute',left:0,top:710,width:1280,height:3,backgroundImage:'repeating-linear-gradient(90deg,transparent 0 28px,#E8EAED 28px 32px,transparent 32px 75px)'}}/>
  {coverIdle&&<CoverLounge activity={activity} seconds={seconds}/>}
  {!coverIdle&&<div className="dino-shadow" aria-hidden="true" style={{position:'absolute',left:x+5,top:700,width:25*size,height:4,borderRadius:'50%',background:'#111315',opacity:.12*opacity*Math.max(0,1-Math.abs(62-y)/100)}}/>}
  {bridge&&<DrawnBridge {...bridge}/>}
  {plane&&<PaperPlane {...plane}/>}
  {magnet&&<Magnet {...magnet}/>}
  {train&&<Train {...train}/>}
  {board!==null&&<div className="springboard" aria-label="Springboard" style={{position:'absolute',left:592,top:686+board*7,width:60,height:18-board*7,borderBottom:'4px solid #4285F4',borderTop:'6px solid #EA4335',background:'repeating-linear-gradient(135deg,transparent 0 6px,#5F6368 6px 9px,transparent 9px 13px)'}}/>}
  {chaser!==null&&<PacMan x={chaser} direction={direction} t={t}/>}
  {ufo!==null&&<Ufo x={ufo} beam={beam} t={t}/>}
  {hole!==null&&<Trapdoor {...hole} opacity={entering?at(t,[.65,.8],[1,0]):1}/>}
  {rocket!==null&&<Rocket {...rocket} t={t}/>}
  {balloons!==null&&<svg className="dino-balloons" aria-label="GDG balloons lifting the dinosaur" viewBox="0 0 90 112" style={{position:'absolute',left:balloons.x,top:balloons.y,width:52,height:64}}>
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
   <img id="arcade-dino" src={asset(running?`dino-run-${Math.floor(seconds*12)%2+1}.png`:'dinosaur.png')}
    alt={`Dinosaur in ${names[exiting?from:to]}`} data-action={action} data-x={x} data-y={y} data-size={size} data-frame={frame}
    style={{position:'absolute',visibility:coverIdle?'hidden':'visible',left:x,top:604+y-(welcome?dinoHeight-38:0),width:dinoWidth,height:dinoHeight,imageRendering:'pixelated',objectFit:'contain',transformOrigin:'50% 100%',scale:`${facing*size/Math.sqrt(landing)} ${size*landing}`,opacity,rotate:`${action==='launch'?direction*-16:rotation}deg`}}/>
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
 const coverIdle=job.phase==='idle'&&names[job.to]==='Cover',fps=60;
 const durationInFrames=coverIdle?30*fps:job.phase==='idle'?fps:Math.round((timing[job.kind]??timing.pipe)[job.phase==='exit'?0:1]*fps);
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
  player.current.pause();player.current.seekTo(0);host.dataset.phase=job.phase;host.dataset.scene=job.kind;host.dataset.duration=durationInFrames;
  if(job.phase==='idle'&&!coverIdle)return;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){player.current.seekTo(lastFrame.current);complete();}else player.current.play();
 },[job]);
 return <Player ref={player} component={ArcadeScene} inputProps={job} durationInFrames={durationInFrames} compositionWidth={1280} compositionHeight={720} fps={fps}
  controls={false} autoPlay={coverIdle&&!matchMedia('(prefers-reduced-motion: reduce)').matches} initiallyMuted loop={coverIdle} moveToBeginningWhenEnded={false} clickToPlay={false} doubleClickToFullscreen={false} spaceKeyToPlayOrPause={false}
  style={{width:1280,height:720,backgroundColor:'transparent'}}/>;
}

createRoot(document.getElementById('dino-motion')).render(<ArcadePlayer/>);

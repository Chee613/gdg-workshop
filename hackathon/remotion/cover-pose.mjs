// One periodic pose clock keeps the hands, body and TV in the same activity.
export function coverPose(seconds) {
 const t=((seconds%30)+30)%30;
 const ease=x=>{x=Math.max(0,Math.min(1,x));return x*x*x*(x*(x*6-15)+10);};
 const rise=(a,b)=>ease((t-a)/(b-a));
 const playing=rise(8,10)*(1-rise(17,20));
 const sleeping=rise(19.5,22)*(1-rise(26,29));
 const watching=1-rise(8,10)+rise(26,29);
 const wave=(period,phase=0)=>Math.sin(t*Math.PI*2/period+phase);
 const breath=wave(5)*(1-sleeping*.3);
 const blink=Math.max(sleeping,...[2.4,6.8,11.3,15.5,18.4,28.2].map(start=>ease((t-start)/.1)*(1-ease((t-start-.1)/.2))));
 return {playing,sleeping,watching,breath,blink,
  head:sleeping*3-playing*.5+wave(10)*.35};
}

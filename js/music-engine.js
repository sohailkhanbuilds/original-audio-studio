// Procedural composition engine v0.2: every render gets a fresh seed, motif and arrangement.
// All sound is synthesized locally; this does not load or copy existing songs.
const SCALES={horror:[0,2,3,5,7,8,10],funny:[0,2,4,7,9,11],adventure:[0,2,4,5,7,9,11],scifi:[0,2,3,6,7,9,10],racing:[0,2,4,7,9,10],survival:[0,2,3,5,7,8,10]};
const ROOTS={horror:45,funny:60,adventure:52,scifi:48,racing:50,survival:43};
const PROG={horror:[0,5,3,6],funny:[0,5,3,4],adventure:[0,4,5,3],scifi:[0,3,6,4],racing:[0,5,3,4],survival:[0,3,4,1]};
const CHORDS={major:[0,4,7],minor:[0,3,7],sus:[0,5,7],dim:[0,3,6]};
const pick=a=>a[Math.floor(Math.random()*a.length)],hz=n=>440*2**((n-69)/12);
function rng(seed){let x=seed>>>0;return()=>{x+=0x6D2B79F5;let t=x;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}}
export function compose({genre='adventure',mood='balanced',bpm=92,duration=30,instruments=['piano','strings','bass','drums']}){
 const seed=(Math.random()*0xffffffff)>>>0,rand=rng(seed),choose=a=>a[Math.floor(rand()*a.length)];
 let scale=(SCALES[genre]||SCALES.adventure).slice();
 if(mood==='dark')scale=[0,1,3,5,6,8,10];if(mood==='hopeful')scale=[0,2,4,5,7,9,11];if(mood==='chaotic')scale=[0,1,2,5,6,8,11];if(mood==='calm')scale=[0,2,4,7,9];
 const root=ROOTS[genre]??52,beat=60/bpm,step=beat/2,barDur=beat*4,totalBars=Math.max(3,Math.ceil(duration/barDur)),events=[];
 const progression=PROG[genre]||PROG.adventure;
 // Compose a short motif first, then repeat it with controlled transformations for musical identity.
 const motif=Array.from({length:8},(_,i)=>({degree:choose(scale.map((_,j)=>j)),rest:rand()<(genre==='horror' ? 0.28 : 0.12),len:choose([.55,.8,1,1.35])}));
 motif[0].rest=false;motif[4].rest=false;
 const melodyTypes=instruments.filter(x=>['piano','bells','flute','brass'].includes(x));
 const add=(t,d,n,v,type)=>{if(t<duration+.01)events.push({t,d,n,v,type})};
 for(let bar=0;bar<totalBars;bar++){
  const section=bar/totalBars<.22?'intro':bar/totalBars>.78?'outro':bar/totalBars>.56?'climax':'theme';
  const chordDegree=progression[bar%progression.length],base=root-12+scale[chordDegree%scale.length];
  const chordQuality=(genre==='horror'||genre==='survival'||mood==='dark')?'minor':genre==='funny'?'major':(chordDegree===5?'minor':'major');
  const triad=CHORDS[chordQuality]||CHORDS.major;
  const energy=section==='intro' ? 0.58 : section==='climax' ? 1.18 : section==='outro' ? 0.5 : 1;
  // Harmonic bed with small voicing shifts; use fewer layers at intro/outro.
  if(instruments.includes('pad'))triad.forEach((interval,i)=>add(bar*barDur,barDur*.94,base+interval+12+(i===1?12:0),.035*energy,'pad'));
  if(instruments.includes('strings')&&(section!=='intro'||bar===0))triad.forEach((interval,i)=>add(bar*barDur+.02,barDur*.88,base+interval+12+(i===2?12:0),.055*energy,'strings'));
  if(instruments.includes('bass')){add(bar*barDur,beat*1.65,base-12,.16*energy,'bass');if(genre==='racing'||genre==='funny')add(bar*barDur+beat*2,beat*.8,base-12,.12*energy,'bass')}
  // Motif repetition plus transposition/occasional passing notes keeps phrases related, not identical.
  const motifShift=bar%4===2?2:bar%4===3?-1:0;
  for(let i=0;i<8;i++){
   const item=motif[(i+(bar%2===1?2:0))%motif.length],at=bar*barDur+i*step;
   if(item.rest&&rand()<.78)continue;
   if(section==='intro'&&i>3&&rand()<.65)continue;
   if(section==='outro'&&i>4&&rand()<.75)continue;
   if(!melodyTypes.length)continue;
   let degree=(item.degree+motifShift+(bar%3===1&&rand()<.35?choose([-2,1,2]):0)+scale.length*4)%scale.length;
   let note=root+12+scale[degree]+(section==='climax'&&rand()<.28?12:0);
   let type=choose(melodyTypes);
   if(genre==='funny'&&rand()<.35&&instruments.includes('bells'))type='bells';
   if(genre==='horror'&&rand()<.25&&instruments.includes('bells'))type='bells';
   const accent=(i===0||i===4)?1.2:1;
   add(at,step*item.len,note,.105*energy*accent,type);
   if(section==='climax'&&rand()<.18)add(at+step*.25,step*.4,note+scale[choose([1,2,4])%scale.length],.055,'bells');
  }
  // Genre-specific drum patterns with section-level variation.
  if(instruments.includes('drums')){
   for(let i=0;i<8;i++){
    const at=bar*barDur+i*step,beatIndex=i%4;
    let kick=genre==='racing'?[0,2,4,6].includes(i):genre==='funny'?[0,3,4,7].includes(i):[0,4].includes(i);
    if(kick&&rand()<(section==='intro' ? 0.55 : section==='climax' ? 0.98 : 0.82))add(at,.15,36,.13*energy,'kick');
    if([2,6].includes(i)&&rand()<(genre==='horror'?.48:.82))add(at,.12,38,.09*energy,'snare');
    if((genre==='racing'||genre==='funny'||i%2===1)&&rand()<(section==='outro' ? 0.3 : 0.85))add(at,.045,42,.035*energy,'hat');
   }
  }
  if((genre==='horror'||genre==='survival')&&instruments.includes('pad'))add(bar*barDur,barDur*.95,root-24,.04,'drone');
 }
 // A final resolving note helps the ending feel intentional.
 if(melodyTypes.length)add(Math.max(0,duration-beat*.7),beat*.65,root+12,.07,choose(melodyTypes));
 return{genre,mood,bpm,duration,instruments,events:events.sort((a,b)=>a.t-b.t),seed,sections:['intro','theme','variation','climax','outro']};
}
const cfg={piano:{wave:'triangle',decay:2.2,cut:2600,partials:[1,.28,.12]},strings:{wave:'sawtooth',decay:3.4,cut:1800,partials:[1,.32]},bass:{wave:'triangle',decay:1.4,cut:650,partials:[1,.18]},bells:{wave:'sine',decay:2.4,cut:5000,partials:[1,.48,.22,.1]},flute:{wave:'sine',decay:1.7,cut:2200,partials:[1,.12]},brass:{wave:'sawtooth',decay:1.25,cut:1500,partials:[1,.42,.18]},pad:{wave:'sawtooth',decay:3.8,cut:1200,partials:[1,.2]},kick:{wave:'sine',decay:.18,cut:240,partials:[1]},snare:{wave:'triangle',decay:.16,cut:4800,partials:[1]},hat:{wave:'square',decay:.055,cut:7500,partials:[1]},drone:{wave:'sine',decay:4.5,cut:420,partials:[1,.15]}};
function noiseSource(ctx,t,d,kind,cut,out){const len=Math.max(1,Math.ceil(ctx.sampleRate*Math.min(.25,d))),buf=ctx.createBuffer(1,len,ctx.sampleRate),data=buf.getChannelData(0);for(let i=0;i<len;i++)data[i]=Math.random()*2-1;const src=ctx.createBufferSource(),f=ctx.createBiquadFilter();src.buffer=buf;f.type=kind;f.frequency.setValueAtTime(cut,t);src.connect(f);f.connect(out);src.start(t);src.stop(t+d);return src}
function voice(ctx,out,e,origin=ctx.currentTime){const s=cfg[e.type]||cfg.piano,t=origin+e.t,d=Math.max(.025,Math.min(e.d,s.decay)),amp=ctx.createGain(),filter=ctx.createBiquadFilter(),pan=ctx.createStereoPanner?ctx.createStereoPanner():null,nodes=[];filter.type='lowpass';filter.frequency.setValueAtTime(s.cut,t);filter.Q.setValueAtTime(e.type==='strings'||e.type==='brass'?1.1:.5,t);amp.gain.setValueAtTime(.0001,t);amp.gain.exponentialRampToValueAtTime(Math.max(.0002,e.v),t+Math.min(.025,d*.18));amp.gain.setValueAtTime(Math.max(.0002,e.v),Math.max(t+.026,t+d-Math.min(.045,d*.18)));amp.gain.exponentialRampToValueAtTime(.0001,t+d);if(pan){pan.pan.setValueAtTime(e.type==='bells'?.22:e.type==='flute'?.12:e.type==='strings'?-.12:0,t);amp.connect(pan);pan.connect(out)}else amp.connect(out);filter.connect(amp);
if(e.type==='snare'||e.type==='hat'){nodes.push(noiseSource(ctx,t,d,e.type==='snare'?'bandpass':'highpass',e.type==='snare'?2100:5200,filter));if(e.type==='snare'){const o=ctx.createOscillator(),g=ctx.createGain();o.type='triangle';o.frequency.setValueAtTime(180,t);g.gain.setValueAtTime(e.v*.5,t);g.gain.exponentialRampToValueAtTime(.0001,t+Math.min(.09,d));o.connect(g);g.connect(amp);o.start(t);o.stop(t+Math.min(.1,d));nodes.push(o)}return nodes}
const parts=s.partials||[1],count=e.type==='strings'||e.type==='pad'?3:parts.length;for(let i=0;i<count;i++){const o=ctx.createOscillator(),g=ctx.createGain(),part=parts[i%parts.length];o.type=s.wave;o.frequency.setValueAtTime(e.type==='kick'?105:hz(e.n)*(i===1&&count>1?1.003:i===2&&count>2?.997:part>1?part:1),t);if(e.type==='kick'){o.frequency.setValueAtTime(105,t);o.frequency.exponentialRampToValueAtTime(38,t+Math.min(.14,d))}if(e.type==='strings'||e.type==='pad')o.detune.setValueAtTime((i-1)*7,t);g.gain.setValueAtTime(i===0?1:(e.type==='strings'||e.type==='pad'?.18:Math.max(.06,part*.38)),t);o.connect(g);g.connect(filter);o.start(t);o.stop(t+d+.025);nodes.push(o)}return nodes}
export function play(track,done){const C=window.AudioContext||window.webkitAudioContext;if(!C)throw Error('Web Audio not supported');const c=new C(),master=c.createGain(),dry=c.createGain(),delay=c.createDelay(1),feedback=c.createGain(),wet=c.createGain();master.gain.value=.82;dry.gain.value=.88;delay.delayTime.value=track.genre==='horror'?.24:.16;feedback.gain.value=.16;wet.gain.value=.12;dry.connect(master);delay.connect(feedback);feedback.connect(delay);delay.connect(wet);wet.connect(master);master.connect(c.destination);const origin=c.currentTime+.05,nodes=track.events.flatMap(e=>voice(c,dry,e,origin));const id=setTimeout(()=>{c.close();done()},(track.duration+.5)*1000);return{stop(){clearTimeout(id);nodes.forEach(n=>{try{n.stop()}catch{}});c.close()}}}
export async function wav(track){const C=window.OfflineAudioContext||window.webkitOfflineAudioContext;if(!C)throw Error('WAV export not supported');const rate=44100,frames=Math.ceil((track.duration+.8)*rate),ctx=new C(2,frames,rate),master=ctx.createGain(),dry=ctx.createGain(),delay=ctx.createDelay(1),feedback=ctx.createGain(),wet=ctx.createGain();master.gain.value=.82;dry.gain.value=.88;delay.delayTime.value=track.genre==='horror'?.24:.16;feedback.gain.value=.16;wet.gain.value=.12;dry.connect(master);delay.connect(feedback);feedback.connect(delay);delay.connect(wet);wet.connect(master);master.connect(ctx.destination);track.events.forEach(e=>voice(ctx,dry,e,0));const b=await ctx.startRendering(),buf=new ArrayBuffer(44+frames*4),v=new DataView(buf),str=(o,s)=>[...s].forEach((x,i)=>v.setUint8(o+i,x.charCodeAt(0)));str(0,'RIFF');v.setUint32(4,36+frames*4,true);str(8,'WAVE');str(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,2,true);v.setUint32(24,rate,true);v.setUint32(28,rate*4,true);v.setUint16(32,4,true);v.setUint16(34,16,true);str(36,'data');v.setUint32(40,frames*4,true);let p=44;for(let i=0;i<frames;i++)for(let ch=0;ch<2;ch++){const x=Math.max(-1,Math.min(1,b.getChannelData(ch)[i]));v.setInt16(p,x<0?x*32768:x*32767,true);p+=2}return new Blob([buf],{type:'audio/wav'})}

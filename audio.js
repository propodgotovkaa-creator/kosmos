// Quiet, short cues leave room for the child to pronounce each word.
export function playSound(context,kind,index=0){
 const start=context.currentTime+.015;
 function chime(frequency,offset=0,volume=.032,duration=.48,endFrequency=frequency){
  const oscillator=context.createOscillator(),gain=context.createGain();
  const at=start+offset;oscillator.type='sine';
  oscillator.frequency.setValueAtTime(frequency,at);
  oscillator.frequency.exponentialRampToValueAtTime(endFrequency,at+duration);
  gain.gain.setValueAtTime(0,at);
  gain.gain.linearRampToValueAtTime(volume,at+.018);
  gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
  oscillator.connect(gain);gain.connect(context.destination);
  oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};
  oscillator.start(at);oscillator.stop(at+duration+.025);
 }
 if(kind==='dock'){
  // A filtered, rounded mechanical click, followed by a faint confirmation shimmer.
  const buffer=context.createBuffer(1,Math.ceil(context.sampleRate*.065),context.sampleRate);
  const samples=buffer.getChannelData(0);
  for(let i=0;i<samples.length;i++)samples[i]=(Math.random()*2-1)*Math.exp(-i/(context.sampleRate*.009));
  const source=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain();
  source.buffer=buffer;filter.type='lowpass';filter.frequency.value=1300;filter.Q.value=.5;
  gain.gain.setValueAtTime(.11,start);source.connect(filter);filter.connect(gain);gain.connect(context.destination);
  source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};source.start(start);
  chime(320,0,.028,.1,180);chime(784,.075,.014,.38);chime(1176,.13,.004,.4);
 }else if(kind==='success'){
  [523.25,659.25,783.99,1046.5].forEach((frequency,i)=>chime(frequency,i*.105,.022,.68));
  chime(1568,.36,.003,.65);
 }else if(kind==='error'){
  chime(329.63,0,.018,.27);chime(293.66,.15,.014,.32);
 }else{
  const frequency=[523.25,587.33,659.25,783.99][index%4];
  chime(frequency,0,.032,.43);chime(frequency*2,.045,.006,.38);
  chime(frequency*1.5,.1,.003,.35);
 }
}

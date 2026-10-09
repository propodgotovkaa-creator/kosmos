import {vocabulary,rounds,makeSequence,answer,flightFrame,flightDuration} from './logic.js';
const $=id=>document.getElementById(id),ns='http://www.w3.org/2000/svg';
const buttons=[];let phase='menu',sequence=[],progress=0,run=0,ready=false,sound=true,audio,hiddenAt=0;
let dockStart=0,dock=0,nextBlink=performance.now()+3500,blinkUntil=0;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const lampEls=[];
for(let i=0;i<4;i++){const c=document.createElementNS(ns,'circle');c.setAttribute('cx',-75+i*50);c.setAttribute('cy',-3);c.setAttribute('r',16);c.classList.add('lamp');$('lamps').append(c);lampEls.push(c);}
for(const [i,id] of rounds[0].cards.entries()){
 const item=vocabulary.find(v=>v.id===id),b=document.createElement('button');
 b.className='card';b.dataset.id=id;b.dataset.number=i+1;b.setAttribute('aria-label',item.label);b.disabled=true;
 b.style.backgroundImage=`url(assets/cards-${item.sheet}.webp)`;b.style.backgroundPosition=`${item.cell%2*100}% ${Math.floor(item.cell/2)*100}%`;
 b.addEventListener('click',()=>choose(id,b));$('cards').append(b);buttons.push(b);
}
function lamps(){lampEls.forEach((l,i)=>l.classList.toggle('on',i<progress));$('progress').textContent=`Огоньки: ${progress} из 4`;}
function message(title,hint){$('instruction').textContent=title;$('hint').textContent=hint;}
function controls(){buttons.forEach(b=>b.disabled=phase!=='input');$('repeat').disabled=!['input','error'].includes(phase);}
function clearCards(){buttons.forEach(b=>b.classList.remove('lit','correct','wrong'));}
function tone(kind,index=0){
 if(!sound)return;
 try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();
 const start=audio.currentTime,notes=kind==='success'?[523,659,784]:[kind==='error'?220:kind==='dock'?392:[440,494,554,659][index%4]];
 notes.forEach((f,i)=>{const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.value=f;o.connect(g);g.connect(audio.destination);const t=start+i*.13;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(kind==='error'?.025:.055,t+.025);g.gain.exponentialRampToValueAtTime(.001,t+.22);o.start(t);o.stop(t+.24);});
 }catch{/* The visual game works even when browser audio is unavailable. */}
}
const delay=ms=>new Promise(resolve=>{
 let remaining=ms,last=performance.now();
 const resetClock=()=>{last=performance.now();};
 document.addEventListener('visibilitychange',resetClock);
 const tick=()=>{const now=performance.now();if(!document.hidden)remaining-=now-last;last=now;
 if(remaining<=0){document.removeEventListener('visibilitychange',resetClock);resolve();}else setTimeout(tick,Math.min(50,remaining));};
 setTimeout(tick,Math.min(50,remaining));
});
async function demonstrate(){
 if(!ready)return;const token=++run;phase='demo';progress=0;dock=0;dockStart=0;clearCards();lamps();controls();$('welcome').hidden=true;$('success').hidden=true;
 message('Смотри и запоминай','Назови картинки, когда они загорятся.');
 await delay(600);if(token!==run)return;
 for(const id of sequence){
  const b=buttons.find(b=>b.dataset.id===id);b.classList.add('lit');tone('note',buttons.indexOf(b));
  await delay(1000);if(token!==run)return;b.classList.remove('lit');
  await delay(350);if(token!==run)return;
 }
 phase='input';message('Теперь твоя очередь','Нажми на картинки в том же порядке.');controls();buttons[0].focus({preventScroll:true});
}
async function choose(id,b){
 if(phase!=='input')return;const token=run;const result=answer(sequence,progress,id);progress=result.progress;lamps();
 if(result.kind==='wrong'){
  phase='error';b.classList.add('wrong');tone('error');message('Попробуем ещё раз','Начни сначала или посмотри шифр ещё раз.');controls();
  await delay(700);if(token!==run)return;clearCards();phase='input';controls();return;
 }
 b.classList.add('correct');tone('note',progress-1);
 if(result.kind==='complete'){
  phase='docking';dockStart=performance.now();controls();message('Все огоньки горят!','Подключаем трос…');
  await delay(reduced?200:1900);if(token!==run)return;tone('dock');message('Открываем люк','Корабль готов принять космонавта.');
  await delay(reduced?200:1100);if(token!==run)return;message('Возвращаемся на корабль','Трос помогает котёнку добраться до люка.');
  await delay((reduced?1200:flightDuration)- (reduced?400:3000));if(token!==run)return;
  phase='success';tone('success');message('Котёнок в безопасности!','Ты помог космонавту вернуться к кораблю.');$('success').hidden=false;$('again').focus({preventScroll:true});
 }else{
  await delay(230);if(token!==run)return;b.classList.remove('correct');
 }
}
function menu(){++run;phase='menu';dockStart=0;dock=0;progress=0;clearCards();lamps();controls();$('welcome').hidden=false;$('success').hidden=true;message('Поможем котёнку?','Запомни картинки и подключи трос к кораблю.');$('start').focus({preventScroll:true});}
function start(){sequence=makeSequence(rounds[0].cards,sequence);tone('note',0);demonstrate();}
$('start').addEventListener('click',start);$('again').addEventListener('click',start);$('repeat').addEventListener('click',demonstrate);$('home').addEventListener('click',menu);$('to-menu').addEventListener('click',menu);
$('sound').addEventListener('click',()=>{sound=!sound;$('sound').setAttribute('aria-pressed',String(sound));$('sound').setAttribute('aria-label',sound?'Выключить звук':'Включить звук');if(sound)tone('note');});
$('fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{$('fullscreen').hidden=true;}});
if(!document.fullscreenEnabled)$('fullscreen').hidden=true;
$('reload').addEventListener('click',()=>location.reload());
document.addEventListener('keydown',e=>{if(e.repeat)return;if(phase==='input'&&/^[1-4]$/.test(e.key)){e.preventDefault();buttons[+e.key-1].click();}if(e.key==='Escape'&&phase!=='menu')menu();});
document.addEventListener('visibilitychange',()=>{
 if(document.hidden){hiddenAt=performance.now();if(phase==='demo'){++run;clearCards();phase='paused';controls();}audio?.suspend();}
 else{if(dockStart)dockStart+=performance.now()-hiddenAt;nextBlink=performance.now()+2500;if(phase==='paused')demonstrate();}
});
function cubic(a,b,c,d,t){return (1-t)**3*a+3*(1-t)**2*t*b+3*(1-t)*t*t*c+t**3*d;}
function animate(now){
 const t=now/1000,elapsed=dockStart?now-dockStart:0;
 const f=flightFrame(dockStart?elapsed:0,reduced);
 const floatY=reduced?0:Math.sin(t*.95)*7,floatX=reduced?0:Math.sin(t*.55)*4;
 const catX=1190+floatX,catY=58+floatY;
 const cx=(catX+325)*(1-f.travel)+400*f.travel;
 const cy=(catY+282)*(1-f.travel)+255*f.travel;
 const scale=f.scale;
 const tx=cx-325*scale,ty=cy-282*scale;
 $('cat-group').setAttribute('transform',`translate(${tx} ${ty}) scale(${scale})`);
 $('cat-group').setAttribute('opacity',f.heroOpacity);
 if(now>nextBlink){blinkUntil=now+150;nextBlink=now+3200+Math.random()*2600;}
 $('blink').setAttribute('opacity',String(now<blinkUntil?1:0));
 $('open-hatch').setAttribute('opacity',f.hatch>0?1:0);
 $('hatch-door').setAttribute('transform',`translate(190 0) scale(${Math.max(.01,1-f.hatch)} 1) translate(-190 0)`);
 $('hatch-door').setAttribute('opacity',1-Math.max(0,(f.hatch-.85)/.15));
 const x=tx+239*scale,y=ty+403*scale,px=843+(740-843)*f.dock,py=326+(302-326)*f.dock+(1-f.dock)*floatY*.4;
 $('plug').setAttribute('x',px-34);$('plug').setAttribute('y',py-63.5);
 const rear=px+121,sag=1-f.travel;
 const c1x=rear+(x-rear)*.3,c1y=py+85*sag,c2x=x-(x-rear)*.25,c2y=y+115*sag;
 const path=`M ${rear} ${py} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${x} ${y}`;
 for(const id of ['cable-shadow','cable','cable-rib']){$(id).setAttribute('d',path);$(id).setAttribute('opacity',f.cableOpacity);}
 const mx=cubic(rear,c1x,c2x,x,.4),my=cubic(py,c1y,c2y,y,.4);
 $('indicator').setAttribute('transform',`translate(${mx} ${my}) rotate(${14*(1-f.travel)}) scale(${1-f.travel*.5})`);
 $('indicator').setAttribute('opacity',f.cableOpacity);
 $('dock-glow').setAttribute('opacity',f.dock>.94?String(.3+Math.max(0,1-(elapsed-1900)/850)*.4):'0');
 requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
Promise.all(['scene','scene-open','cat','cat-blink','plug','cards-1'].map(name=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve();img.onerror=reject;img.src=`assets/${name}.webp`;}))).then(()=>{ready=true;$('start').disabled=false;$('start').textContent='Начать полёт';}).catch(()=>{$('load-error').hidden=false;});

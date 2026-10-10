import {vocabulary,rounds,makeSequence,answer,flightFrame,flightDuration,heroes,nextRound,connectorFrame} from './logic.js?v=5';
const $=id=>document.getElementById(id),ns='http://www.w3.org/2000/svg';
const buttons=[];let phase='menu',sequence=[],progress=0,run=0,ready=false,sound=true,audio,hiddenAt=0;
let roundIndex=0,enterStart=0;const previousSequences=[];
let dockStart=0,dock=0,nextBlink=performance.now()+3500,blinkUntil=0;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const lampEls=[];
for(let i=0;i<4;i++){const c=document.createElementNS(ns,'circle');c.setAttribute('cx',-75+i*50);c.setAttribute('cy',-3);c.setAttribute('r',16);c.classList.add('lamp');$('lamps').append(c);lampEls.push(c);}
function renderRound(index){
 roundIndex=index;const round=rounds[index],hero=heroes[round.hero];
 $('game').dataset.round=String(index+1);$('game').dataset.hero=round.hero;
 $('hero-art').setAttribute('href',`assets/${round.hero}.webp`);
 $('blink').setAttribute('href',`assets/${round.hero}-blink.webp`);
 $('eyesClip').replaceChildren();
 for(const [cx,cy,rx,ry] of hero.eyes){const e=document.createElementNS(ns,'ellipse');for(const [k,v] of Object.entries({cx,cy,rx,ry}))e.setAttribute(k,v);$('eyesClip').append(e);}
 buttons.length=0;$('cards').replaceChildren();
 for(const [i,id] of round.cards.entries()){
  const item=vocabulary.find(v=>v.id===id),b=document.createElement('button');
  b.className='card';b.dataset.id=id;b.dataset.number=i+1;b.setAttribute('aria-label',item.label);b.disabled=true;
  b.style.backgroundImage=`url(assets/cards-${item.sheet}.webp)`;b.style.backgroundPosition=`${item.cell%2?92.1:7.4}% ${Math.floor(item.cell/2)?94:5}%`;
  b.addEventListener('click',()=>choose(id,b));$('cards').append(b);buttons.push(b);
 }
 dockStart=0;dock=0;progress=0;lamps();nextBlink=performance.now()+3000;blinkUntil=0;
}
for(const [i,round] of rounds.entries()){
 const img=document.createElement('img');img.src=`assets/${round.hero}.webp`;img.alt=heroes[round.hero].name;img.style.setProperty('--delay',`${-i*.6}s`);$('rescued-team').append(img);
}
function lamps(){lampEls.forEach((l,i)=>l.classList.toggle('on',i<progress));$('progress').textContent=`Огоньки: ${progress} из 4`;}
function message(title,hint){$('instruction').textContent=title;$('hint').textContent=hint;}
function controls(){$('game').dataset.phase=phase;buttons.forEach(b=>b.disabled=phase!=='input');$('repeat').disabled=!['input','error'].includes(phase);}
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
 if(!ready)return;const token=++run;phase='demo';progress=0;dock=0;dockStart=0;$('cards').classList.remove('changing');clearCards();lamps();controls();$('welcome').hidden=true;$('success').hidden=true;
 message('Смотри и запоминай','Назови картинки, когда они загорятся.');
 await delay(600);if(token!==run)return;
 for(const id of sequence){
  const b=buttons.find(b=>b.dataset.id===id);b.classList.add('lit');tone('note',buttons.indexOf(b));
  await delay(1000);if(token!==run)return;b.classList.remove('lit');
  await delay(350);if(token!==run)return;
 }
 phase='input';message('Теперь твоя очередь','Нажми на картинки в том же порядке.');controls();
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
  await delay(reduced?200:1100);if(token!==run)return;message('Возвращаемся на корабль','Трос помогает космонавту добраться до люка.');
  await delay((reduced?1200:flightDuration)- (reduced?400:3000));if(token!==run)return;
  tone('success');message(`${heroes[rounds[roundIndex].hero].name} на корабле!`,'Космонавт в безопасности.');
  const next=nextRound(roundIndex);
  if(next===null){phase='success';controls();$('cards').classList.add('changing');$('success').hidden=false;$('again').focus({preventScroll:true});}
  else{await delay(650);if(token!==run)return;beginRound(next);}
 }else{
  await delay(230);if(token!==run)return;b.classList.remove('correct');
 }
}
async function beginRound(index){
 const token=++run;phase='transition';controls();$('welcome').hidden=true;$('success').hidden=true;$('cards').classList.add('changing');
 if(index>0){await delay(450);if(token!==run)return;}
 renderRound(index);enterStart=performance.now();
 sequence=makeSequence(rounds[index].cards,previousSequences[index]||[]);previousSequences[index]=[...sequence];
 message(`На связи — ${heroes[rounds[index].hero].name.toLowerCase()}`,'Запомни новый шифр.');
 await delay(reduced?200:900);if(token!==run)return;$('cards').classList.remove('changing');
 await delay(350);if(token!==run)return;demonstrate();
}
function menu(){++run;phase='menu';enterStart=0;renderRound(0);clearCards();controls();$('cards').classList.remove('changing');$('welcome').hidden=false;$('success').hidden=true;message('Поможем космонавтам?','Запомни картинки и подключи трос к кораблю.');$('start').focus({preventScroll:true});}
function start(){if(!ready)return;tone('note',0);beginRound(0);}
$('start').addEventListener('click',start);$('again').addEventListener('click',start);$('repeat').addEventListener('click',demonstrate);$('home').addEventListener('click',menu);$('to-menu').addEventListener('click',menu);
$('sound').addEventListener('click',()=>{sound=!sound;$('sound').setAttribute('aria-pressed',String(sound));$('sound').setAttribute('aria-label',sound?'Выключить звук':'Включить звук');if(sound)tone('note');});
$('fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{$('fullscreen').hidden=true;}});
if(!document.fullscreenEnabled)$('fullscreen').hidden=true;
$('reload').addEventListener('click',()=>location.reload());
document.addEventListener('keydown',e=>{if(e.repeat)return;if(phase==='input'&&/^[1-4]$/.test(e.key)){e.preventDefault();buttons[+e.key-1].click();}if(e.key==='Escape'&&phase!=='menu')menu();});
document.addEventListener('visibilitychange',()=>{
 if(document.hidden){hiddenAt=performance.now();if(phase==='demo'){++run;clearCards();phase='paused';controls();}audio?.suspend();}
 else{if(dockStart)dockStart+=performance.now()-hiddenAt;if(enterStart)enterStart+=performance.now()-hiddenAt;nextBlink=performance.now()+2500;if(phase==='paused')demonstrate();}
});
function cubic(a,b,c,d,t){return (1-t)**3*a+3*(1-t)**2*t*b+3*(1-t)*t*t*c+t**3*d;}
function animate(now){
 const t=now/1000,elapsed=dockStart?now-dockStart:0;
 const f=flightFrame(dockStart?elapsed:0,reduced);
 const floatY=reduced?0:Math.sin(t*.95)*7,floatX=reduced?0:Math.sin(t*.55)*4;
 const entering=enterStart&&!reduced?Math.min(1,(now-enterStart)/900):1;
 const arrive=entering*entering*(3-2*entering);
 const catX=1190+floatX+(1-arrive)*95,catY=58+floatY;
 const cx=(catX+325)*(1-f.travel)+400*f.travel;
 const cy=(catY+282)*(1-f.travel)+255*f.travel;
 const scale=f.scale;
 const tx=cx-325*scale,ty=cy-282*scale;
 $('hero-group').setAttribute('transform',`translate(${tx} ${ty}) scale(${scale})`);
 $('hero-group').setAttribute('opacity',f.heroOpacity*arrive);
 if(now>nextBlink){blinkUntil=now+150;nextBlink=now+3200+Math.random()*2600;}
 $('blink').setAttribute('opacity',String(now<blinkUntil?1:0));
 $('open-hatch').setAttribute('opacity',f.hatch>0?1:0);
 $('hatch-door').setAttribute('transform',`translate(190 0) scale(${Math.max(.01,1-f.hatch)} 1) translate(-190 0)`);
 $('hatch-door').setAttribute('opacity',1-Math.max(0,(f.hatch-.85)/.15));
 const anchor=heroes[rounds[roundIndex].hero].anchor;
 const connection=connectorFrame(f.dock);
 const x=tx+anchor[0]*scale,y=ty+anchor[1]*scale,px=connection.x,py=connection.y+(1-Math.min(1,f.dock/.62))*floatY*.4;
 $('plug').setAttribute('opacity',arrive);$('plug').setAttribute('x',px-64);$('plug').setAttribute('y',py-86.5);
 const rear=px+170,sag=1-f.travel;
 const c1x=rear+(x-rear)*.3,c1y=py+85*sag,c2x=x-(x-rear)*.25,c2y=y+115*sag;
 const path=`M ${rear} ${py} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${x} ${y}`;
 for(const id of ['cable-shadow','cable','cable-rib']){$(id).setAttribute('d',path);$(id).setAttribute('opacity',f.cableOpacity*arrive);}
 const mx=cubic(rear,c1x,c2x,x,.4),my=cubic(py,c1y,c2y,y,.4);
 $('indicator').setAttribute('transform',`translate(${mx} ${my}) rotate(${14*(1-f.travel)}) scale(${1-f.travel*.5})`);
 $('indicator').setAttribute('opacity',f.cableOpacity*arrive);
 $('dock-glow').setAttribute('opacity',f.dock>.94?String(.3+Math.max(0,1-(elapsed-1900)/850)*.4):'0');
 requestAnimationFrame(animate);
}
renderRound(0);controls();requestAnimationFrame(animate);
Promise.all(['scene','scene-open','plug-v2','cards-1','cards-2','cards-3',...rounds.flatMap(r=>[r.hero,r.hero+'-blink'])].map(name=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve();img.onerror=reject;img.src=`assets/${name}.webp`;}))).then(()=>{ready=true;$('start').disabled=false;$('start').textContent='Начать полёт';}).catch(()=>{$('load-error').hidden=false;});

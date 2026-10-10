export const vocabulary = [
 ['dog','Собака',1,0],['bag','Сумка',1,1],['juice','Сок',1,2],['boots','Сапоги',1,3],
 ['honeycomb','Соты',2,0],['owl','Сова',2,1],['lettuce','Салат',2,2],['scooter','Самокат',2,3],
 ['plane','Самолёт',3,0],['sled','Санки',3,1],['dustpan','Совок',3,2],['chest','Сундук',3,3],
 ["fox", "Лиса", 4, 0],
 ["wasp", "Оса", 4, 1],
 ["moustache", "Усы", 4, 2],
 ["scythe", "Коса", 4, 3],
 ["sock", "Носок", 5, 0],
 ["sand", "Песок", 5, 1],
 ["beads", "Бусы", 5, 2],
 ["scales", "Весы", 5, 3],
 ["dishes", "Посуда", 6, 0],
 ["nose", "Нос", 6, 1],
 ["coconut", "Кокос", 6, 2],
 ["cactus", "Кактус", 6, 3],
 ["tray", "Поднос", 7, 0],
 ["bus", "Автобус", 7, 1],
 ["pineapple", "Ананас", 7, 2],
 ["compass", "Компас", 7, 3],
 ["vacuum", "Пылесос", 8, 0],
 ["glass", "Стакан", 8, 1],
 ["mask", "Маска", 8, 2],
 ["cabbage", "Капуста", 8, 3],
 ["hardhat", "Каска", 9, 0],
 ["table", "Стол", 9, 1],
 ["garlic", "Чеснок", 9, 2],
 ["foxtail", "Хвост", 9, 3],
 ["chair", "Стул", 10, 0]
].map(([id,label,sheet,cell])=>({id,label,sheet,cell}));
export const rounds = [
 {hero:'cat',cards:['dog','bag','juice','boots']},
 {hero:'bear',cards:['honeycomb','owl','lettuce','scooter']},
 {hero:'squirrel',cards:['plane','sled','dustpan','chest']},
 {hero:'dog',cards:['dog','honeycomb','plane','bag']},
 {hero:'raccoon',cards:['owl','juice','sled','lettuce']},
 {hero:'wolf',cards:['boots','scooter','dustpan','chest']}
];
export function makeSequence(cards, previous=[], random=Math.random){
 const out=[...cards];
 for(let i=out.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}
 if(out.every((x,i)=>x===previous[i])&&out.length>1)[out[0],out[1]]=[out[1],out[0]];
 return out;
}
export function answer(sequence,progress,id){
 if(progress>=sequence.length)return {progress,kind:'complete'};
 if(sequence[progress]!==id)return {progress:0,kind:'wrong'};
 const next=progress+1;return {progress:next,kind:next===sequence.length?'complete':'correct'};
}

export const flightDuration=8200;
const clamp=x=>Math.min(1,Math.max(0,x));
const ease=x=>{const t=clamp(x);return t*t*(3-2*t);};
export function flightFrame(elapsed,reduced=false){
 const t=reduced?elapsed*flightDuration/1200:elapsed;
 const dock=ease(t/1900);
 const opening=ease((t-2000)/1000),closing=ease((t-7000)/1100);
 const travel=ease((t-3100)/3000);
 const depth=ease((t-5700)/1100);
 return {dock,hatch:opening*(1-closing),travel,scale:1-travel*.58-depth*.22,heroOpacity:1-depth,cableOpacity:1-ease((t-6050)/650)};
}

export const heroes={
 cat:{name:'Котёнок',anchor:[239,403],eyes:[[238,208,38,42],[322,244,42,44]]},
 bear:{name:'Мишка',anchor:[246,370],eyes:[[270,165,27,30],[345,195,31,33]]},
 squirrel:{name:'Белочка',anchor:[180,380],eyes:[[188,195,26,28],[266,220,31,32]]},
 dog:{name:'Собака',anchor:[238,368],eyes:[[272,148,27,31],[347,177,32,33]]},
 raccoon:{name:'Енот',anchor:[235,366],eyes:[[267,173,29,31],[340,199,30,32]]},
 wolf:{name:'Волчонок',anchor:[231,367],eyes:[[241,168,26,30],[310,192,30,32]]}
};
export function nextRound(index){return index+1<rounds.length?index+1:null;}

// Align with the socket axis before sliding the nose behind its front rim.
export function connectorFrame(dock){
 const approach=ease(dock/.62),insert=ease((dock-.62)/.38);
 return {x:970-44*approach-190*insert,y:326-26*approach,insert};
}

export const courses=[
 {id:'initial',label:'С в начале',example:'Собака · сумка · сок',words:rounds.slice(0,3).flatMap(r=>r.cards)},
 {id:'middle',label:'С в середине',example:'Лиса · усы · бусы',words:['fox','wasp','moustache','scythe','sock','sand','beads','scales','dishes']},
 {id:'final',label:'С в конце',example:'Нос · кокос · ананас',words:['nose','coconut','cactus','tray','bus','pineapple','compass','vacuum']},
 {id:'cluster',label:'С в стечениях',example:'Стакан · маска · стул',words:['glass','mask','cabbage','hardhat','table','garlic','foxtail','chair']}
];
export function roundsFor(courseId){
 const course=courses.find(c=>c.id===courseId);
 if(!course)throw new Error('Unknown course');
 if(courseId==='initial')return rounds.map(r=>({...r,cards:[...r.cards]}));
 return rounds.map((r,i)=>({hero:r.hero,cards:Array.from({length:4},(_,j)=>course.words[(i*4+j)%course.words.length])}));
}

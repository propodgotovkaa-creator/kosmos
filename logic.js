export const vocabulary = [
 ['dog','Собака',1,0],['bag','Сумка',1,1],['juice','Сок',1,2],['boots','Сапоги',1,3],
 ['honeycomb','Соты',2,0],['owl','Сова',2,1],['lettuce','Салат',2,2],['scooter','Самокат',2,3],
 ['plane','Самолёт',3,0],['sled','Санки',3,1],['dustpan','Совок',3,2],['chest','Сундук',3,3]
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
 return {x:843-69*approach-90*insert,y:326-26*approach,insert};
}

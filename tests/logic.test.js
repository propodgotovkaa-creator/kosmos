import test from 'node:test';import assert from 'node:assert/strict';
import {vocabulary,rounds,makeSequence,answer} from '../logic.js';
test('six unique heroes; all 12 words occur exactly twice, without duplicates within round',()=>{assert.equal(new Set(rounds.map(r=>r.hero)).size,6);const counts=new Map(vocabulary.map(v=>[v.id,0]));for(const r of rounds){assert.equal(r.cards.length,4);assert.equal(new Set(r.cards).size,4);for(const id of r.cards){assert.ok(counts.has(id));counts.set(id,counts.get(id)+1);}}for(const n of counts.values())assert.equal(n,2);assert.equal(new Set(rounds.slice(0,3).flatMap(r=>r.cards)).size,12);});
test('shuffle is a permutation, does not change cards, avoids previous sequence',()=>{const cards=rounds[0].cards,copy=[...cards];for(let n=0;n<50;n++){const next=makeSequence(cards,cards,()=>.9999);assert.deepEqual([...next].sort(),[...cards].sort());assert.notDeepEqual(next,cards);}assert.deepEqual(cards,copy);});
test('each correct answer lights one lamp; docking only on fourth',()=>{const seq=rounds[0].cards;let p=0;for(let i=0;i<4;i++){const a=answer(seq,p,seq[i]);p=a.progress;assert.equal(p,i+1);assert.equal(a.kind,i===3?'complete':'correct');}assert.deepEqual(answer(seq,p,'dog'),{progress:4,kind:'complete'});});
test('wrong or repeated picture resets progress; correct sequence can restart',()=>{const s=rounds[0].cards;assert.deepEqual(answer(s,2,s[0]),{progress:0,kind:'wrong'});assert.deepEqual(answer(s,0,s[0]),{progress:1,kind:'correct'});assert.deepEqual(answer(s,1,s[0]),{progress:0,kind:'wrong'});});
import {flightFrame,flightDuration} from '../logic.js';
test('hatch opens after docking, hero enters before door closes, cable retracts',()=>{
 assert.equal(flightFrame(0).hatch,0);assert.equal(flightFrame(1800).travel,0);
 assert.equal(flightFrame(1900).dock,1);assert.equal(flightFrame(1900).hatch,0);
 assert.equal(flightFrame(3000).hatch,1);assert.equal(flightFrame(3000).travel,0);
 assert.equal(flightFrame(5000).hatch,1);assert.ok(flightFrame(5000).travel>0);
 assert.equal(flightFrame(6900).heroOpacity,0);assert.equal(flightFrame(6900).cableOpacity,0);assert.equal(flightFrame(6900).hatch,1);
 assert.equal(flightFrame(flightDuration).hatch,0);assert.equal(flightFrame(flightDuration).heroOpacity,0);
 assert.deepEqual(flightFrame(1200,true),flightFrame(flightDuration));
});
import {heroes,nextRound} from '../logic.js';
import {existsSync} from 'node:fs';
test('six configured heroes have both frames, valid eyes and cable anchor',()=>{for(const r of rounds){const h=heroes[r.hero];assert.ok(h?.name);assert.equal(h.eyes.length,2);assert.ok(h.anchor[0]>0&&h.anchor[0]<650&&h.anchor[1]>0&&h.anchor[1]<563);for(const suffix of ['', '-blink'])assert.ok(existsSync(new URL(`../assets/${r.hero}${suffix}.webp`,import.meta.url)));}});
test('complete course advances through six heroes and terminates after wolf',()=>{const visited=[];let i=0;while(i!==null){visited.push(rounds[i].hero);i=nextRound(i);assert.ok(visited.length<=6);}assert.deepEqual(visited,['cat','bear','squirrel','dog','raccoon','wolf']);});

import {connectorFrame} from '../logic.js';
test('connector aligns first, inserts behind socket rim, stays seated during flight',()=>{
 const aligned=connectorFrame(.62),seated=connectorFrame(1);
 assert.equal(aligned.y,300);assert.equal(aligned.insert,0);
 assert.equal(seated.y,aligned.y);assert.ok(seated.x<aligned.x-60);
 assert.equal(seated.insert,1);
 for(const t of [1900,3000,5000,6900,8200])assert.deepEqual(connectorFrame(flightFrame(t).dock),seated);
});

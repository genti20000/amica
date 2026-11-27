import test from 'node:test';
import assert from 'node:assert/strict';
import {tableBlockClashes,validWindow,findTableBlock,appliesToKaraoke,isFullDay} from '../src/lib/tableBlocks.js';
const date='2026-11-27', b={blocked_date:date,is_full_day:0,start_time:'18:00',end_time:'21:00',scope:'main'};
test('two-hour reservation overlap and precise reopening',()=>{assert.equal(tableBlockClashes(b,'17:00'),true);assert.equal(tableBlockClashes(b,'18:00'),true);assert.equal(tableBlockClashes(b,'20:30'),true);assert.equal(tableBlockClashes(b,'21:00'),false);assert.equal(tableBlockClashes(b,'22:00'),false);assert.equal(tableBlockClashes(b,'16:00'),false);});
test('overnight window',()=>{const x={...b,start_time:'23:00',end_time:'01:00'};assert.equal(validWindow(x.start_time,x.end_time),true);assert.equal(tableBlockClashes(x,'22:00'),true);assert.equal(tableBlockClashes(x,'00:30'),true);assert.equal(tableBlockClashes(x,'01:00'),false);});
test('multiple windows and service dates',()=>{const x={...b,start_time:'22:00',end_time:'23:00'};assert.equal(findTableBlock([b,x],date,'21:00'),x);assert.equal(findTableBlock([b,x],'2026-11-28','19:00'),undefined);});
test('legacy whole venue closures and main-only windows',()=>{assert.equal(appliesToKaraoke(b),false);assert.equal(appliesToKaraoke({...b,scope:undefined}),true);assert.equal(isFullDay({is_full_day:true}),true);assert.equal(tableBlockClashes({is_full_day:1},'23:00'),true);});
test('reject malformed, reversed, zero length and out-of-service windows',()=>{for(const [a,b] of [['21:00','18:00'],['18:00','18:00'],['xx','19:00'],['16:00','19:00'],['23:00','04:00']])assert.equal(validWindow(a,b),false);});

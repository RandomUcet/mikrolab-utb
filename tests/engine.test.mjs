import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {allCards,allQuestions,attemptStats,calendarStreak,due,nextReview,pickQuestions,planReview,initialState,validateContent} from '../dist/js/engine.js';
import {sanitizeState,backupJson,parseBackup} from '../dist/js/store.js';
const content=JSON.parse(readFileSync(new URL('../dist/content.json',import.meta.url),'utf8'));

test('study content has all 13 seminars plus one AI case module',()=>{
 assert.equal(validateContent(content),true);assert.equal(content.topics.length,14);
 assert.equal(allQuestions(content).length,126);assert.equal(allCards(content).length,86);
 assert.deepEqual(content.topics.slice(0,13).map(t=>t.order),Array.from({length:13},(_,i)=>i+1));
 for(const t of content.topics){assert.equal(t.questions.length,9);assert.ok(t.sections.length>=2);assert.ok(t.source);assert.ok(t.deepDive?.steps.length>=4);}
});
test('every choice is nonempty and distractors differ',()=>{
 for(const {question} of allQuestions(content)){
  assert.equal(question.options.length,4);assert.equal(new Set(question.options).size,4,question.id);
  for(const choice of question.options)assert.ok(choice.trim());
  assert.ok(question.stem.length>=8&&question.explanation.length>=20,question.id);
 }
});
test('new cards are planned, known cards are not introduced twice',()=>{
 const state=initialState();const first=planReview(content,state,8);assert.equal(first.length,8);
 assert.equal(first[0].card.id,content.topics[0].cards[0].id);
 const e=first[0];state.cards[e.card.id]=nextReview(undefined,e.card.id,e.topic.id,'good',new Date('2026-11-23T12:00:00Z'));
 const after=planReview(content,state,8);assert.notEqual(after[0].card.id,e.card.id);
});
test('failed recall returns soon and successful recall expands intervals',()=>{
 const now=new Date('2026-11-23T12:00:00Z');const fail=nextReview(undefined,'c','t','again',now);
 assert.equal(new Date(fail.dueAt).getTime()-now.getTime(),3*60*1000);
 const good=nextReview(undefined,'c','t','good',now);assert.equal(good.interval,2);assert.equal(due(good,now),false);
 const againGood=nextReview(good,'c','t','good',new Date(good.dueAt));assert.ok(againGood.interval>good.interval);
 const easy=nextReview(good,'c','t','easy',new Date(good.dueAt));assert.ok(easy.interval>againGood.interval);
});
test('mixed exam shuffles across topic categories without repeats',()=>{
 const entries=pickQuestions(content,30,null,()=>.3);assert.equal(entries.length,30);
 assert.equal(new Set(entries.map(x=>x.question.id)).size,entries.length);
 assert.ok(new Set(entries.slice(0,14).map(x=>x.topic.id)).size>9);
 const one=pickQuestions(content,6,'trh-prace',()=>.6);assert.equal(one.length,6);assert.ok(one.every(x=>x.topic.id==='trh-prace'));
});
test('backup roundtrips validated data and drops unknown IDs',()=>{
 const original=initialState();original.dailyGoal=12;original.examDate='2026-12-15';original.visitedTopics=['zaklady'];
 const restored=parseBackup(backupJson(original),content);assert.equal(restored.dailyGoal,12);
 assert.deepEqual(restored.visitedTopics,['zaklady']);assert.equal(restored.examDate,'2026-12-15');
 const bad={...original,visitedTopics:['zaklady','hacker'],cards:{fake:{lastRating:'easy',dueAt:'2030-01-01',lastAt:'2030-01-01',ease:2,interval:2,repetitions:2,topicId:'hacker'}}};
 const sanitized=sanitizeState(bad,content);assert.deepEqual(sanitized.visitedTopics,['zaklady']);assert.equal(Object.keys(sanitized.cards).length,0);
 assert.throws(()=>parseBackup('{"app":"untrusted","state":{}}',content));
});
test('attempt stats handle empty sessions',()=>{
 assert.deepEqual(attemptStats([]),{right:0,total:0,percentage:0});
 assert.deepEqual(attemptStats([{correct:true},{correct:false},{correct:true}]),{right:2,total:3,percentage:67});
});

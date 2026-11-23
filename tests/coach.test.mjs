import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {adaptiveQuestions,unresolvedMistakes,weakTopics,studySummary,dueForecast} from '../dist/js/coach.js';
import {initialState,nextReview} from '../dist/js/engine.js';
import {sanitizeState} from '../dist/js/store.js';
const content=JSON.parse(readFileSync(new URL('../dist/content.json',import.meta.url),'utf8'));

test('mistake resolves when a later correct attempt supersedes wrong one',()=>{
 const state=initialState();const q=content.topics[0].questions[0];
 state.attempts.push({questionId:q.id,topicId:'zaklady',correct:false,at:'2026-11-22T10:00:00Z',mode:'practice'});
 assert.equal(unresolvedMistakes(content,state).length,1);
 state.attempts.push({questionId:q.id,topicId:'zaklady',correct:true,at:'2026-11-22T11:00:00Z',mode:'practice'});
 assert.equal(unresolvedMistakes(content,state).length,0);
});
test('coach prioritizes weak and unvisited topics without predicting grades',()=>{
 const state=initialState();const q=content.topics[8].questions[0];
 state.attempts.push({questionId:q.id,topicId:'vyrobni-faktory',correct:false,at:'2026-11-22T10:00:00Z',mode:'practice'});
 const ordered=weakTopics(content,state);assert.equal(ordered[0].topic.id,'vyrobni-faktory');
 const summary=studySummary(content,state,new Date('2026-11-23T10:00:00Z'));
 assert.equal(summary.mistakes,1);assert.equal(summary.missing,14);assert.equal(summary.examDays,null);
});
test('adaptive practice contains distinct questions from multiple topics',()=>{
 const state=initialState();const selected=adaptiveQuestions(content,state,12,()=>.5);
 assert.equal(selected.length,12);
 assert.equal(new Set(selected.map(x=>x.question.id)).size,12);
 assert.equal(new Set(selected.map(x=>x.topic.id)).size,12);
});
test('review forecast respects the due date of known cards',()=>{
 const state=initialState(),topic=content.topics[0],card=topic.cards[0];
 const now=new Date('2026-11-23T12:00:00Z');
 state.cards[card.id]=nextReview(undefined,card.id,topic.id,'good',now);
 const next=dueForecast(content,state,now,7);assert.equal(next.reduce((a,b)=>a+b,0),1);
 assert.equal(next[2],1);
});
test('invalid exam date in imported data is ignored',()=>{
 const raw={...initialState(),examDate:'2026-17-72'};
 assert.equal(sanitizeState(raw,content).examDate,undefined);
});

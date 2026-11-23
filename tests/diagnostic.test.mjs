import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {planDiagnostic,makeDiagnosticRecord,diagnosticSummary} from '../dist/js/diagnostic.js';
import {sanitizeState,backupJson,parseBackup} from '../dist/js/store.js';
import {initialState} from '../dist/js/engine.js';
import {weakTopics} from '../dist/js/coach.js';
import {MikroLab} from '../dist/js/ui.js';
const content=JSON.parse(readFileSync(new URL('../dist/content.json',import.meta.url),'utf8'));
function fake(){const obj=Object.create(MikroLab.prototype);obj.content=content;obj.state=initialState();return obj;}

test('diagnostic covers every topic with one real question',()=>{
 for(let i=0;i<10;i++){
  const questions=planDiagnostic(content,i,()=>.47);
  assert.equal(questions.length,14);
  assert.equal(new Set(questions.map(x=>x.topic.id)).size,14);
  for(const {topic,question} of questions)assert.ok(topic.questions.some(q=>q.id===question.id));
 }
});
test('diagnostic summary is separate from exam attempts and survives backups',()=>{
 const entries=planDiagnostic(content,0,()=>.4);
 const rec=makeDiagnosticRecord(entries,entries.map((_,i)=>i%2===0),new Date('2026-11-23T12:00:00Z'));
 const summary=diagnosticSummary(content,rec);
 assert.equal(summary.mastered,7);assert.equal(summary.needsWork.length,7);
 const state=initialState();state.diagnostics=[rec];
 const restored=parseBackup(backupJson(state),content);
 assert.deepEqual(restored.diagnostics,[rec]);assert.equal(restored.attempts.length,0);
 assert.throws(()=>makeDiagnosticRecord(entries,[true]),/Nekompletní/);
});
test('sanitizer filters impossible and mismatched diagnostic answer IDs',()=>{
 const item=planDiagnostic(content,0,()=>.3)[0];
 const raw={...initialState(),diagnostics:[{id:'baseline',at:'2026-11-23T12:00:00Z',answers:[
  {topicId:item.topic.id,questionId:item.question.id,correct:false},
  {topicId:item.topic.id,questionId:'unknown',correct:true},
  {topicId:'invalid',questionId:item.question.id,correct:true},
  {topicId:item.topic.id,questionId:item.question.id,correct:'false'}
 ]}]};
 const clean=sanitizeState(raw,content);
 assert.deepEqual(clean.diagnostics[0].answers,[{topicId:item.topic.id,questionId:item.question.id,correct:false}]);
});
test('diagnostic weakness yields to subsequent practice evidence',()=>{
 const e=planDiagnostic(content,0,()=>.3)[0];
 const state=initialState();state.diagnostics=[makeDiagnosticRecord([e],[false])];
 assert.equal(weakTopics(content,state).find(w=>w.topic.id===e.topic.id).reason,'Doporučeno po vstupní diagnostice');
 state.attempts=[{questionId:e.question.id,topicId:e.topic.id,correct:true,mode:'practice',at:'2026-11-23T12:15:00Z'}];
 assert.notEqual(weakTopics(content,state).find(w=>w.topic.id===e.topic.id).reason,'Doporučeno po vstupní diagnostice');
});
test('answer and explanation are hidden until diagnostic completion',()=>{
 const app=fake(),entries=planDiagnostic(content,0,()=>.5);
 assert.match(app.diagnosticScreen(),/14 KAPITOL/);
 app.view='diagnostic';
 app.quiz={kind:'diagnostic',entries,index:0,chosen:1,results:[],done:false,topicId:null};
 assert.doesNotMatch(app.quizScreen(),/Správně je|Správná odpověď/);
 app.state.diagnostics=[makeDiagnosticRecord(entries,entries.map((_,i)=>i%2===0))];
 app.quiz.done=true;
 assert.match(app.quizScreen(),/ROZBOR OTÁZEK/);
});

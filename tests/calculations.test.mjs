import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CALC_SKILLS,seededRandom,generateCalcProblem,parseNumericResponse,gradeCalcProblem,calcSkillProgress,suggestedCalcSkill} from '../dist/js/calculations.js';
import {sanitizeState,parseBackup,backupJson} from '../dist/js/store.js';
import {initialState} from '../dist/js/engine.js';
import {MikroLab} from '../dist/js/ui.js';
const content=JSON.parse(readFileSync(new URL('../dist/content.json',import.meta.url),'utf8'));

test('at least twelve distinct calculation skills reference actual chapters',()=>{
 assert.equal(CALC_SKILLS.length,12);
 assert.equal(new Set(CALC_SKILLS.map(s=>s.id)).size,CALC_SKILLS.length);
 for(const skill of CALC_SKILLS){
  assert.ok(content.topics.some(t=>t.id===skill.topicId),skill.id);
  assert.ok(skill.title&&skill.formula&&skill.summary,skill.id);
 }
});

test('generators produce finite, deterministic and checked tasks across 100 seeds per skill',()=>{
 for(const skill of CALC_SKILLS)for(let i=0;i<100;i++){
  const p=generateCalcProblem(skill.id,seededRandom(i+900));
  const p2=generateCalcProblem(skill.id,seededRandom(i+900));
  assert.deepEqual(p,p2,`nondeterministic ${skill.id}`);
  assert.equal(p.skillId,skill.id);assert.equal(p.topicId,skill.topicId);
  assert.ok(Number.isFinite(p.answer),`nonfinite ${skill.id}`);
  assert.ok(p.prompt.length>45&&p.hint.length>30,`insufficient explanations ${skill.id}`);
  assert.ok(p.steps.length>=2,`missing steps ${skill.id}`);
  assert.ok(p.tolerance>=0);
  const good=gradeCalcProblem(p,String(p.answer));
  assert.deepEqual(good,{valid:true,correct:true,value:p.answer},`expected answer rejected for ${skill.id}`);
  const wrong=gradeCalcProblem(p,String(p.answer+Math.max(5,p.tolerance*20)));
  assert.equal(wrong.correct,false,`false positive for ${skill.id}`);
 }
});

test('Czech and dot decimal formats, negatives and invalid input are handled strictly',()=>{
 assert.equal(parseNumericResponse(' 1 234,50 '),1234.5);
 assert.equal(parseNumericResponse('-12,5'),-12.5);
 assert.equal(parseNumericResponse('2.75'),2.75);
 for(const bad of ['',' ','2+2','1,2,3','Infinity','100 Kč','1e5','2..5'])assert.equal(parseNumericResponse(bad),null,bad);
});

test('recent per-skill mastery and suggested training favour unsolved tasks',()=>{
 const skill=CALC_SKILLS[0].id;
 assert.equal(calcSkillProgress([],skill).accuracy,null);
 const attempts=Array.from({length:10},(_,i)=>({skillId:skill,topicId:CALC_SKILLS[0].topicId,correct:i>1,hinted:false,at:'2026-11-23T12:00:00Z',response:12}));
 assert.deepEqual(calcSkillProgress(attempts,skill),{attempts:8,correct:8,accuracy:100});
 assert.notEqual(suggestedCalcSkill(attempts,()=>.3),skill);
});

test('math attempts survive legacy-compatible backups and invalid attempts are removed',()=>{
 const state=initialState();
 state.mathAttempts=[{skillId:'elasticita',topicId:'spotrebitel',correct:false,hinted:true,at:'2026-11-23T12:00:00Z',response:3.5}];
 assert.deepEqual(parseBackup(backupJson(state),content).mathAttempts,state.mathAttempts);
 const dirty={...state,mathAttempts:[...state.mathAttempts,{...state.mathAttempts[0],skillId:'fake'}, {...state.mathAttempts[0],response:Infinity}]};
 assert.equal(sanitizeState(dirty,content).mathAttempts.length,1);
 const legacy={version:1,cards:{},attempts:[],exams:[]};
 assert.deepEqual(sanitizeState(legacy,content).mathAttempts,[]);
});

test('math trainer hides correct answer until submission and exposes selection',()=>{
 const app=Object.create(MikroLab.prototype);
 app.content=content;app.state=initialState();app.mathChoice='adaptive';app.mathProblem=null;app.mathHinted=false;app.mathResult=null;app.mathInputError='';
 const html=app.mathTrainer();
 assert.match(html,/Počítej s porozuměním/);
 assert.match(html,/Vyhodnotit/);
 assert.doesNotMatch(html,/POSTUP ŘEŠENÍ/);
 app.mathResult={value:999,valid:true,correct:false};
 const checked=app.mathTrainer();
 assert.match(checked,/POSTUP ŘEŠENÍ/);
 assert.match(checked,/Další příklad/);
});

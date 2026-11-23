import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {MikroLab} from '../dist/js/ui.js';
import {initialState,marketEquilibrium,pickQuestions} from '../dist/js/engine.js';
const content=JSON.parse(readFileSync(new URL('../dist/content.json',import.meta.url),'utf8'));
function fake(){const obj=Object.create(MikroLab.prototype);obj.content=content;obj.state=initialState();obj.topicId=content.topics[0].id;obj.demandShift=0;obj.supplyShift=0;obj.graphModel='goods';return obj;}

test('screen templates are available without external services',()=>{
 const app=fake();assert.match(app.home(),/Rozumět. Procvičit/);
 assert.equal((app.topics().match(/class="topic-card"/g)||[]).length,14);
 assert.match(app.lesson(),/Náklad obětované příležitosti/);
 assert.match(app.lesson(),/VÝKLAD DO HLOUBKY/);
 assert.match(app.coach(),/Dnešní doporučení/);
 assert.match(app.mistakes(),/Moje chyby/);
 assert.match(app.reviewScreen(),/Trénink paměti/);
 assert.match(app.exam(),/cvičný zápočet/i);
 assert.match(app.glossary(),/Knihovna pojmů/);
 assert.match(app.stats(),/Procvičené oblasti/);
 assert.match(app.settings(),/Stáhnout zálohu/);
 assert.match(app.lab(),/interaktivní model/i);
});
test('illustrative market equilibrium obeys intended S and D shifts',()=>{
 assert.deepEqual(marketEquilibrium(),{quantity:75,price:50});
 const moreD=marketEquilibrium(10,0);assert.ok(moreD.quantity>75&&moreD.price>50);
 const moreS=marketEquilibrium(0,-10);assert.ok(moreS.quantity>75&&moreS.price<50);
 const lessD=marketEquilibrium(-10,0);assert.ok(lessD.quantity<75&&lessD.price<50);
});
test('quiz UI keeps correct answers hidden during simulated exam',()=>{
 const app=fake();app.view='exam';app.quiz={kind:'exam',entries:pickQuestions(content,10,null,()=>.5),index:0,chosen:0,results:[],done:false,topicId:null};
 assert.doesNotMatch(app.quizScreen(),/Správná odpověď/);
 app.quiz.kind='practice';assert.match(app.quizScreen(),/Správně je|Správná odpověď/);
});

test('service worker precaches all generated JS modules required offline',()=>{
 const source=readFileSync(new URL('../dist/sw.js',import.meta.url),'utf8');
 for(const name of ['main','ui','engine','store','coach','calculations','types','diagnostic','visuals'])assert.ok(source.includes(`./js/${name}.js`),name);
});

test('standalone HTML contains diagnostic and worked plot modules',()=>{
 const html=readFileSync(new URL('../MikroLab_offline.html',import.meta.url),'utf8');
 for(const name of ['function planDiagnostic(', 'function diagnosticSummary(', 'function marketProblemSvg(', 'function laborProblemSvg('])assert.ok(html.includes(name),name);
 assert.match(html,/MikroLab 0\.4/);
});

test('diagnostic attempts become actionable mistakes without duplicating exam history',()=>{
 const app=fake();
 const entries=content.topics.map(topic=>({topic,question:topic.questions[0]}));
 const attempts=entries.map(({topic,question},i)=>({
  questionId:question.id,topicId:topic.id,correct:i!==0,
  mode:'exam',at:'2026-11-23T16:00:00.000Z'
 }));
 app.quiz={kind:'diagnostic',entries,index:entries.length-1,chosen:0,results:attempts,done:false,topicId:null};
 app.persist=()=>{};
 app.render=()=>{};
 app.nextQuestion();
 assert.equal(app.state.diagnostics.length,1);
 assert.equal(app.state.attempts.length,entries.length);
 assert.equal(app.state.exams.length,0);
 assert.equal(app.state.attempts.filter(a=>!a.correct).length,1);
});

test('diagnostic history in statistics is not portrayed as a reliable grade prediction',()=>{const app=fake();app.state.diagnostics=[{id:'baseline-1',at:'2026-11-23T12:00:00.000Z',answers:[{topicId:content.topics[0].id,questionId:content.topics[0].questions[0].id,correct:false}]}];const html=app.stats();assert.match(html,/Historie orientačních průchodů/);assert.match(html,/nedokazuje zlepšení ani zhoršení/);});

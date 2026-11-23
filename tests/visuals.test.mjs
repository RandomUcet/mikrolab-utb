import {test} from 'node:test';
import assert from 'node:assert/strict';
import {generateCalcProblem,seededRandom,gradeCalcProblem} from '../dist/js/calculations.js';
import {marketProblemSvg,laborProblemSvg,demandShiftEquilibrium} from '../dist/js/visuals.js';
import {MikroLab} from '../dist/js/ui.js';
import {initialState} from '../dist/js/engine.js';

test('equilibrium plot reflects generated coefficients and shifted demand',()=>{
 for(let i=0;i<100;i++){
  const p=generateCalcProblem('rovnovaha-trhu',seededRandom(i));
  assert.ok(p.market);
  const before=demandShiftEquilibrium(p.market);
  assert.equal(before.price,p.answer);
  const after=demandShiftEquilibrium(p.market,10);
  assert.ok(after.price>before.price&&after.quantity>before.quantity);
  assert.match(marketProblemSvg(p),/<svg/);
 }
});
test('labor chart uses generated wages and actual MRPL',()=>{
 for(let i=0;i<100;i++){
  const p=generateCalcProblem('trh-prace',seededRandom(i));
  assert.equal(p.answer,p.labor.mpl*p.labor.price);
  assert.ok(laborProblemSvg(p).includes(p.labor.wage+' Kč'));
 }
});
test('solution chart is locked until a numerical answer is graded',()=>{
 const p=generateCalcProblem('rovnovaha-trhu',seededRandom(71));
 const app=Object.create(MikroLab.prototype);
 app.mathProblem=p;app.mathChoice=p.skillId;app.mathHinted=false;app.mathScenarioShift=0;app.mathMplDelta=0;app.mathResult=null;app.mathInputError='';app.state=initialState();app.content={topics:[{id:p.topicId,title:'Tržní mechanismus'}]};
 assert.doesNotMatch(app.mathTrainer(),/GRAF K VYŘEŠENÉ ÚLOZE/);
 app.mathResult=gradeCalcProblem(p,String(p.answer));
 assert.match(app.mathTrainer(),/mathDemandShift/);
});

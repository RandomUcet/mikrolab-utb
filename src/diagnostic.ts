import type {CourseContent,Question,Topic,DiagnosticRecord} from './types.js';
export function planDiagnostic(content:CourseContent,runIndex=0,random:()=>number=Math.random):{topic:Topic;question:Question}[]{
 const plan=content.topics.map(topic=>{
  const level=1+((topic.order+runIndex)%3);
  const eligible=topic.questions.filter(q=>q.level===level);
  const pool=eligible.length?eligible:topic.questions;
  const question=pool[Math.floor(Math.min(.999999,Math.max(0,random()))*pool.length)];
  return {topic,question};
 });
 for(let i=plan.length-1;i>0;i--){
  const j=Math.floor(Math.min(.999999,Math.max(0,random()))*(i+1));
  [plan[i],plan[j]]=[plan[j],plan[i]];
 }
 return plan;
}
export function makeDiagnosticRecord(entries:{topic:Topic;question:Question}[],correct:boolean[],now=new Date()):DiagnosticRecord{
 if(entries.length!==correct.length)throw new Error('Nekompletní vstupní test');
 if(new Set(entries.map(x=>x.topic.id)).size!==entries.length)throw new Error('Vstupní test obsahuje opakovanou kapitolu');
 return {id:'baseline-'+now.getTime(),at:now.toISOString(),answers:entries.map((entry,i)=>({topicId:entry.topic.id,questionId:entry.question.id,correct:correct[i]}))};
}
export function diagnosticSummary(content:CourseContent,record:DiagnosticRecord){
 const byTopic=new Map(record.answers.map(x=>[x.topicId,x.correct]));
 const rows=content.topics.filter(x=>byTopic.has(x.id)).map(topic=>({topicId:topic.id,title:topic.title,correct:byTopic.get(topic.id)!}));
 const mastered=rows.filter(x=>x.correct).length;
 return {total:rows.length,mastered,needsWork:rows.filter(x=>!x.correct),promising:rows.filter(x=>x.correct)};
}

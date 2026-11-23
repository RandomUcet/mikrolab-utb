import type {CalcAttempt} from './calculations.js';
export interface CourseContent {
  schemaVersion: number;
  subject: string;
  school: string;
  edition: string;
  disclaimer: string;
  sources: {label: string; kind: string}[];
  topics: Topic[];
}
export interface Topic {
  id: string;
  order: number;
  title: string;
  blurb: string;
  minutes: number;
  objectives: string[];
  sections: {heading: string; body: string}[];
  example: {title: string; situation: string; reasoning: string; conclusion: string};
  pitfall: string;
  source: string;
  deepDive?: {
    title:string;
    lead:string;
    steps:string[];
    formula:string;
    challenge:string;
    solution:string;
  };
  cards: Flashcard[];
  questions: Question[];
}
export interface Flashcard { id: string; front: string; back: string }
export interface Question {
  id: string;
  stem: string;
  options: [string,string,string,string];
  answer: number;
  explanation: string;
  level: number;
}
export type Rating = 'again' | 'hard' | 'good' | 'easy';
export interface ReviewState { cardId: string; topicId: string; repetitions: number; ease: number; interval: number; dueAt: string; lastAt: string; lastRating: Rating }
export interface Attempt { questionId: string; topicId: string; correct: boolean; at: string; mode: 'practice'|'exam' }
export interface DiagnosticAnswer {topicId:string;questionId:string;correct:boolean}
export interface DiagnosticRecord {id:string;at:string;answers:DiagnosticAnswer[]}
export interface ExamResult { id: string; at: string; correct: number; total: number; topicIds: string[] }
export interface UserState {
  version: 1;
  cards: Record<string,ReviewState>;
  attempts: Attempt[];
  mathAttempts: CalcAttempt[];
  exams: ExamResult[];
  diagnostics: DiagnosticRecord[];
  visitedTopics: string[];
  reviewDays: string[];
  dailyGoal: number;
  preference: 'light'|'dark';
  examDate?:string;
}

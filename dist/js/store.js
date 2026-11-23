import { CALC_SKILLS } from './calculations.js';
import { allCards, allQuestions, initialState } from './engine.js';
export const STORAGE_KEY = 'mikrolab-progress-v1';
function isObj(x) { return Boolean(x) && typeof x === 'object' && !Array.isArray(x); }
export function sanitizeState(raw, content) {
    const fresh = initialState();
    if (!isObj(raw) || raw.version !== 1)
        return fresh;
    const cardIds = new Set(allCards(content).map(x => x.card.id));
    const questionIds = new Set(allQuestions(content).map(x => x.question.id));
    const topicIds = new Set(content.topics.map(x => x.id));
    if (isObj(raw.cards))
        for (const [id, v] of Object.entries(raw.cards)) {
            if (!cardIds.has(id) || !isObj(v) || typeof v.dueAt !== 'string' || !Number.isFinite(Date.parse(v.dueAt)) || !['again', 'hard', 'good', 'easy'].includes(String(v.lastRating)))
                continue;
            const { topicId, lastAt, interval, repetitions, ease } = v;
            if (!topicIds.has(String(topicId)) || !Number.isFinite(Date.parse(String(lastAt))) || ![interval, repetitions, ease].every(x => typeof x === 'number' && Number.isFinite(x)))
                continue;
            fresh.cards[id] = { cardId: id, topicId: String(topicId), interval: Math.max(0, Math.min(Number(interval), 3650)), repetitions: Math.max(0, Math.min(1000, Number(repetitions))), ease: Math.max(1.3, Math.min(3, Number(ease))), dueAt: String(v.dueAt), lastAt: String(lastAt), lastRating: v.lastRating };
        }
    if (Array.isArray(raw.attempts))
        fresh.attempts = raw.attempts.slice(-6000).filter(x => isObj(x) && questionIds.has(String(x.questionId)) && topicIds.has(String(x.topicId)) && typeof x.correct === 'boolean' && ['practice', 'exam'].includes(String(x.mode)) && Number.isFinite(Date.parse(String(x.at)))).map(x => ({ questionId: String(x.questionId), topicId: String(x.topicId), correct: Boolean(x.correct), mode: x.mode, at: String(x.at) }));
    const skillIds = new Set(CALC_SKILLS.map(s => s.id));
    if (Array.isArray(raw.mathAttempts))
        fresh.mathAttempts = raw.mathAttempts.slice(-2500).filter(x => isObj(x) && skillIds.has(x.skillId) && topicIds.has(String(x.topicId)) && typeof x.correct === 'boolean' && typeof x.hinted === 'boolean' && typeof x.response === 'number' && Number.isFinite(x.response) && typeof x.at === 'string' && Number.isFinite(Date.parse(x.at))).map(x => ({ skillId: x.skillId, topicId: String(x.topicId), correct: Boolean(x.correct), hinted: Boolean(x.hinted), response: Number(x.response), at: String(x.at) }));
    if (Array.isArray(raw.exams))
        fresh.exams = raw.exams.slice(-250).filter(x => isObj(x) && typeof x.id === 'string' && Number.isFinite(Date.parse(String(x.at))) && Number.isInteger(x.correct) && Number.isInteger(x.total) && Number(x.correct) >= 0 && Number(x.total) >= Number(x.correct)).map(x => ({ id: String(x.id), at: String(x.at), correct: Number(x.correct), total: Number(x.total), topicIds: Array.isArray(x.topicIds) ? x.topicIds.filter((id) => topicIds.has(String(id))).map(String) : [] }));
    if (Array.isArray(raw.diagnostics))
        fresh.diagnostics = raw.diagnostics.slice(-30).filter(x => isObj(x) && typeof x.id === 'string' && typeof x.at === 'string' && Number.isFinite(Date.parse(x.at)) && Array.isArray(x.answers)).map(x => ({
            id: String(x.id), at: String(x.at), answers: x.answers.filter(a => isObj(a) && topicIds.has(String(a.topicId)) && questionIds.has(String(a.questionId)) && typeof a.correct === 'boolean' && content.topics.some(t => t.id === a.topicId && t.questions.some(q => q.id === a.questionId))).slice(0, content.topics.length).map(a => { const r = a; return { topicId: String(r.topicId), questionId: String(r.questionId), correct: Boolean(r.correct) }; })
        })).filter(x => new Set(x.answers.map(a => a.topicId)).size === x.answers.length && x.answers.length > 0);
    if (Array.isArray(raw.reviewDays))
        fresh.reviewDays = [...new Set(raw.reviewDays.filter((d) => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)))].slice(-1000);
    if (Array.isArray(raw.visitedTopics))
        fresh.visitedTopics = [...new Set(raw.visitedTopics.filter(id => topicIds.has(String(id))).map(String))];
    if (Number.isInteger(raw.dailyGoal))
        fresh.dailyGoal = Math.max(4, Math.min(30, Number(raw.dailyGoal)));
    if (raw.preference === 'dark')
        fresh.preference = 'dark';
    if (typeof raw.examDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.examDate) && Number.isFinite(Date.parse(raw.examDate)))
        fresh.examDate = raw.examDate;
    return fresh;
}
export function loadState(content) { try {
    return sanitizeState(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null'), content);
}
catch {
    return initialState();
} }
export function saveState(state) { try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
}
catch {
    return false;
} }
export function backupJson(state) { return JSON.stringify({ app: 'MikroLab', exportedAt: new Date().toISOString(), state }, null, 2); }
export function parseBackup(json, content) {
    const obj = JSON.parse(json);
    if (!isObj(obj) || obj.app !== 'MikroLab' || !isObj(obj.state) || obj.state.version !== 1)
        throw new Error('Soubor není platná záloha MikroLabu.');
    return sanitizeState(obj.state, content);
}

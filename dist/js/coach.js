import { calcSkillProgress, CALC_SKILLS } from './calculations.js';
import { allQuestions, dueCards, topicProgress } from './engine.js';
/** A question is unresolved if the student's most recent answer to it was wrong. */
export function unresolvedMistakes(content, state) {
    const last = new Map();
    for (const item of state.attempts) {
        last.set(item.questionId, item);
    }
    return allQuestions(content).filter(x => last.get(x.question.id)?.correct === false);
}
export function weakTopics(content, state) {
    const outstanding = new Set(unresolvedMistakes(content, state).map(x => x.question.id));
    const baseline = new Map(state.diagnostics?.at(-1)?.answers.map(x => [x.topicId, x.correct]) ?? []);
    return content.topics.map(topic => {
        const attempts = state.attempts.filter(a => a.topicId === topic.id);
        const recent = attempts.slice(-8);
        const recentAccuracy = recent.length ? Math.round(recent.filter(a => a.correct).length * 100 / recent.length) : null;
        const p = topicProgress(topic, state);
        const pending = topic.questions.filter(q => outstanding.has(q.id)).length;
        // Prioritize errors, unseen topics and lower recent accuracy; not a grade prediction.
        const diagnosticWeak = baseline.get(topic.id) === false && recent.length === 0;
        const priority = (diagnosticWeak ? 24 : 0) + pending * 15 + (recentAccuracy === null ? 25 : Math.round((100 - recentAccuracy) * 0.7)) + (p.finished ? 0 : 18);
        const reason = diagnosticWeak ? 'Doporučeno po vstupní diagnostice' : pending ? `${pending} otáz${pending === 1 ? 'ka' : 'ek'} k opravě` : recentAccuracy === null ? 'Zatím bez procvičování' : recentAccuracy < 75 ? 'Nízká úspěšnost posledních odpovědí' : 'Udržovací opakování';
        return { topic, attempts: attempts.length, accuracy: p.accuracy, recentAccuracy, pending, priority, reason };
    }).sort((a, b) => b.priority - a.priority || a.topic.order - b.topic.order);
}
export function studySummary(content, state, now = new Date()) {
    const due = dueCards(content, state, now).length;
    const mistakes = unresolvedMistakes(content, state).length;
    const mathNeedsWork = CALC_SKILLS.filter(s => { const p = calcSkillProgress(state.mathAttempts ?? [], s.id); return p.attempts === 0 || p.accuracy !== null && p.accuracy < 75; }).length;
    const missing = content.topics.filter(t => !state.visitedTopics.includes(t.id)).length;
    const weak = weakTopics(content, state);
    const attempts7 = state.attempts.filter(a => new Date(a.at).getTime() >= now.getTime() - 7 * 86400000);
    const recentAccuracy = attempts7.length ? Math.round(attempts7.filter(a => a.correct).length * 100 / attempts7.length) : null;
    const examDays = state.examDate ? Math.ceil((new Date(`${state.examDate}T12:00:00`).getTime() - now.getTime()) / 86400000) : null;
    return { due, mistakes, missing, weak, recentAccuracy, attempts7: attempts7.length, examDays, mathNeedsWork };
}
export function adaptiveQuestions(content, state, count, random = Math.random) {
    const pool = allQuestions(content);
    const latest = new Map();
    for (const attempt of state.attempts)
        latest.set(attempt.questionId, attempt);
    const weakMap = new Map(weakTopics(content, state).map(w => [w.topic.id, w.priority]));
    const sorted = pool.map(entry => {
        const prior = latest.get(entry.question.id);
        const wrong = prior?.correct === false ? 85 : 0;
        const unseen = !prior ? 36 : 0;
        const strength = (weakMap.get(entry.topic.id) ?? 0) * 0.45;
        return { entry, score: wrong + unseen + strength + random() * 5 };
    }).sort((a, b) => b.score - a.score);
    const selected = [];
    const counts = new Map();
    // First pass: spread selection across chapters to avoid monothematic quizzes.
    const chapters = new Set();
    for (const x of sorted) {
        if (selected.length >= Math.min(count, pool.length))
            break;
        if (!chapters.has(x.entry.topic.id)) {
            selected.push(x.entry);
            chapters.add(x.entry.topic.id);
            counts.set(x.entry.topic.id, 1);
        }
    }
    for (const x of sorted) {
        if (selected.length >= Math.min(count, pool.length))
            break;
        if (selected.some(y => y.question.id === x.entry.question.id))
            continue;
        selected.push(x.entry);
        counts.set(x.entry.topic.id, (counts.get(x.entry.topic.id) ?? 0) + 1);
    }
    return selected;
}
export function dueForecast(content, state, now = new Date(), days = 7) {
    const result = Array.from({ length: days }, () => 0);
    const current = now.getTime();
    const known = new Set(content.topics.flatMap(t => t.cards.map(c => c.id)));
    for (const [id, review] of Object.entries(state.cards)) {
        if (!known.has(id))
            continue;
        const i = Math.max(0, Math.ceil((new Date(review.dueAt).getTime() - current) / 86400000));
        if (i < days)
            result[i]++;
    }
    return result;
}

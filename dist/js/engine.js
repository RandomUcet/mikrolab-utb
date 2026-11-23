export const DAY_MS = 86_400_000;
export function initialState() { return { version: 1, cards: {}, attempts: [], exams: [], mathAttempts: [], visitedTopics: [], reviewDays: [], dailyGoal: 8, preference: 'light' }; }
export function allCards(content) { return content.topics.flatMap(topic => topic.cards.map(card => ({ topic, card }))); }
export function allQuestions(content) { return content.topics.flatMap(topic => topic.questions.map(question => ({ topic, question }))); }
export function due(review, at = new Date()) { return Boolean(review && new Date(review.dueAt).getTime() <= at.getTime()); }
export function nextReview(previous, cardId, topicId, rating, now = new Date()) {
    let ease = Math.max(1.3, Math.min(3.0, previous?.ease ?? 2.3));
    let repetitions = previous?.repetitions ?? 0;
    let interval = previous?.interval ?? 0;
    let delayMs = 0;
    if (rating === 'again') {
        repetitions = 0;
        interval = 0;
        ease = Math.max(1.3, ease - .2);
        delayMs = 3 * 60_000;
    }
    else if (rating === 'hard') {
        repetitions += 1;
        interval = previous?.interval ? Math.max(1, Math.round(previous.interval * 1.25)) : 1;
        ease = Math.max(1.3, ease - .1);
        delayMs = interval * DAY_MS;
    }
    else if (rating === 'good') {
        repetitions += 1;
        interval = previous?.interval ? Math.max(2, Math.round(previous.interval * ease)) : 2;
        delayMs = interval * DAY_MS;
    }
    else {
        repetitions += 1;
        ease = Math.min(3, ease + .1);
        interval = previous?.interval ? Math.max(Math.round(previous.interval * (ease + .6)), Math.round(previous.interval * (previous.ease)) + 1, 4) : 5;
        delayMs = interval * DAY_MS;
    }
    return { cardId, topicId, repetitions, ease, interval, dueAt: new Date(now.getTime() + delayMs).toISOString(), lastAt: now.toISOString(), lastRating: rating };
}
export function dueCards(content, state, now = new Date()) {
    return allCards(content).filter(({ card }) => due(state.cards[card.id], now));
}
export function newCards(content, state) {
    return allCards(content).filter(({ card }) => !state.cards[card.id]);
}
export function planReview(content, state, limit = state.dailyGoal) {
    const dueList = dueCards(content, state).sort((a, b) => new Date(state.cards[a.card.id].dueAt).getTime() - new Date(state.cards[b.card.id].dueAt).getTime());
    const unseen = newCards(content, state);
    const ordered = [...dueList, ...unseen];
    return ordered.slice(0, Math.max(1, Math.min(limit, 30)));
}
export function dayKey(iso) { return iso.slice(0, 10); }
export function localDayKey(date) { return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-'); }
export function calendarStreak(state, now = new Date()) {
    const days = new Set([...(state.reviewDays || []), ...Object.values(state.cards).map(c => localDayKey(new Date(c.lastAt))), ...state.attempts.map(a => localDayKey(new Date(a.at)))]);
    let date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (!days.has(localDayKey(date)))
        date.setDate(date.getDate() - 1);
    let streak = 0;
    while (days.has(localDayKey(date))) {
        streak++;
        date.setDate(date.getDate() - 1);
    }
    return streak;
}
export function attemptStats(attempts) { const right = attempts.filter(a => a.correct).length; return { right, total: attempts.length, percentage: attempts.length ? Math.round(right * 100 / attempts.length) : 0 }; }
export function topicProgress(topic, state) {
    const reviewed = topic.cards.filter(c => state.cards[c.id]);
    const practiced = state.attempts.filter(a => a.topicId === topic.id);
    const confident = reviewed.filter(c => (state.cards[c.id]?.repetitions ?? 0) >= 2).length;
    return { reviewed: reviewed.length, total: topic.cards.length, confident, accuracy: attemptStats(practiced).percentage, attempts: practiced.length, finished: state.visitedTopics.includes(topic.id) };
}
export function pickQuestions(content, count, topicId, random = Math.random) {
    const pool = allQuestions(content).filter(x => !topicId || x.topic.id === topicId);
    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    if (!topicId) {
        // Mixed sessions should not accidentally become a run of questions from one chapter.
        const groups = new Map();
        for (const entry of shuffled) {
            if (!groups.has(entry.topic.id))
                groups.set(entry.topic.id, []);
            groups.get(entry.topic.id).push(entry);
        }
        const mixed = [];
        while ([...groups.values()].some(x => x.length)) {
            for (const group of groups.values()) {
                if (group.length)
                    mixed.push(group.shift());
            }
        }
        return mixed.slice(0, Math.min(count, mixed.length));
    }
    return shuffled.slice(0, Math.min(count, shuffled.length));
}
export function recordedAttempt(questionId, topicId, correct, mode, now = new Date()) {
    return { questionId, topicId, correct, mode, at: now.toISOString() };
}
export function examinationResult(attempts) { return { id: `exam-${Date.now()}`, at: new Date().toISOString(), correct: attempts.filter(a => a.correct).length, total: attempts.length, topicIds: [...new Set(attempts.map(a => a.topicId))] }; }
export function validateContent(content) {
    if (!content || typeof content !== 'object')
        return false;
    const c = content;
    if (c.schemaVersion !== 1 || !Array.isArray(c.topics) || c.topics.length === 0)
        return false;
    const topics = new Set();
    const cards = new Set();
    const questions = new Set();
    for (const t of c.topics) {
        if (!t || typeof t.id !== 'string' || topics.has(t.id) || !Array.isArray(t.cards) || !Array.isArray(t.questions) || t.questions.length < 1)
            return false;
        topics.add(t.id);
        for (const card of t.cards) {
            if (!card.id || cards.has(card.id) || !card.front || !card.back)
                return false;
            cards.add(card.id);
        }
        for (const q of t.questions) {
            if (!q.id || questions.has(q.id) || !Array.isArray(q.options) || q.options.length !== 4 || !Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3 || !q.explanation)
                return false;
            questions.add(q.id);
        }
    }
    return true;
}
export function marketEquilibrium(demandShift = 0, supplyShift = 0) {
    const quantity = (60 + demandShift - supplyShift) / 0.8;
    const price = 20 + supplyShift + 0.4 * quantity;
    return { quantity, price };
}

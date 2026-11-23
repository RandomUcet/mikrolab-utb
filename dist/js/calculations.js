export const CALC_SKILLS = [
    { id: 'rovnovaha-trhu', topicId: 'trzni-mechanismus', title: 'Tržní rovnováha', summary: 'Rovnovážná cena z lineárních funkcí poptávky a nabídky.', formula: 'Qd = a − bP, Qs = c + dP; v rovnováze Qd = Qs', level: 2 },
    { id: 'elasticita', topicId: 'spotrebitel', title: 'Cenová elasticita poptávky', summary: 'Bodová elasticita jednoduché lineární poptávky.', formula: '|Ed| = |(dQ/dP) × (P/Q)|', level: 3 },
    { id: 'trzba', topicId: 'firma', title: 'Celková tržba', summary: 'Výpočet příjmů firmy z ceny a prodaného množství.', formula: 'TR = P × Q', level: 1 },
    { id: 'prumerne-naklady', topicId: 'firma', title: 'Průměrné náklady', summary: 'Rozdělení fixních a variabilních nákladů na jednotku.', formula: 'AC = (FC + VC) / Q', level: 2 },
    { id: 'mezni-naklady', topicId: 'firma', title: 'Mezní náklady', summary: 'Změna celkových nákladů při zvýšení produkce.', formula: 'MC = ΔTC / ΔQ', level: 2 },
    { id: 'zisk', topicId: 'dokonala-konkurence', title: 'Ekonomický zisk (model)', summary: 'Rozdíl tržeb a všech zadaných nákladů firmy.', formula: 'π = TR − TC', level: 1 },
    { id: 'mezni-produkt', topicId: 'vyrobni-faktory', title: 'Mezní produkt práce', summary: 'O kolik vzroste výstup při přidání jednotky práce.', formula: 'MPL = ΔQ / ΔL', level: 2 },
    { id: 'trh-prace', topicId: 'trh-prace', title: 'Přínos dodatečného pracovníka', summary: 'Mezní příjem produktu práce a mzdový náklad.', formula: 'MRPL = MPL × P (při konstantní ceně produkce)', level: 2 },
    { id: 'monopol', topicId: 'monopol', title: 'Monopol s konstantními MC', summary: 'Zisk maximalizující produkce při lineární poptávce.', formula: 'P = a − bQ, MR = a − 2bQ, optimum MR = MC', level: 3 },
    { id: 'mezni-uzitek', topicId: 'spotrebitel', title: 'Mezní užitek', summary: 'Rozdíl celkového užitku při další spotřebované jednotce.', formula: 'MU = ΔTU / ΔQ', level: 1 },
    { id: 'soucasna-hodnota', topicId: 'kapital', title: 'Současná hodnota', summary: 'Kolik dnes odpovídá budoucímu příjmu při dané úrokové míře.', formula: 'PV = FV / (1 + r)^n', level: 3 },
    { id: 'bod-zvratu', topicId: 'firma', title: 'Bod zvratu', summary: 'Minimální objem produkce, při kterém jsou tržby rovny nákladům.', formula: 'Q* = FC / (P − AVC)', level: 2 }
];
const byId = new Map(CALC_SKILLS.map(skill => [skill.id, skill]));
const rr = (rng, min, max) => min + Math.floor(Math.min(0.999999, Math.max(0, rng())) * (max - min + 1));
const cz = (x) => Number.isInteger(x) ? String(x) : String(x).replace('.', ',');
const round2 = (x) => Math.round((x + Number.EPSILON) * 100) / 100;
/** Seeded PRNG for reproducible problems in tests and for future remote sync. */
export function seededRandom(seed) {
    let n = seed | 0;
    return () => { n = (n + 0x6d2b79f5) | 0; let t = Math.imul(n ^ (n >>> 15), 1 | n); t ^= t + Math.imul(t ^ (t >>> 7), 61 | t); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export function generateCalcProblem(skillId, rng = Math.random) {
    const skill = byId.get(skillId);
    if (!skill)
        throw new Error(`Neznámá dovednost: ${skillId}`);
    const val = (min, max) => rr(rng, min, max);
    let prompt = '', answer = 0, steps = [], hint = '', unit = '';
    let market;
    let labor;
    switch (skillId) {
        case 'rovnovaha-trhu': {
            const price = val(8, 35), q = val(30, 120), b = val(2, 5), d = val(2, 5);
            const a = q + b * price, c = q - d * price;
            market = { a, b, c, d };
            prompt = `Poptávka je Qd = ${a} − ${b}P a nabídka Qs = ${c} + ${d}P. Urči rovnovážnou cenu P.`;
            answer = price;
            unit = 'Kč';
            hint = 'Polož Qd = Qs a převeď členy s cenou na stejnou stranu.';
            steps = [`Rovnováha nastane, když Qd = Qs: ${a} − ${b}P = ${c} + ${d}P.`, `Převedeme členy: ${a - c} = ${b + d}P.`, `P = (${a - c}) / (${b + d}) = ${price} Kč.`];
            break;
        }
        case 'elasticita': {
            const b = val(2, 5), price = val(5, 25), q = val(12, 75), a = q + b * price;
            prompt = `Poptávka má tvar Q = ${a} − ${b}P. Při ceně P = ${price} je poptávané množství Q = ${q}. Urči absolutní hodnotu bodové cenové elasticity |Ed| (na 2 desetinná místa).`;
            answer = round2(b * price / q);
            unit = 'bez jednotky';
            hint = 'U lineární poptávky je směrnice dQ/dP konstantní. Vypočítej absolutní hodnotu jejího součinu s poměrem P/Q.';
            steps = [`Směrnice poptávky dQ/dP = −${b}.`, `|Ed| = ${b} × ${price} / ${q}.`, `|Ed| = ${cz(answer)} (zaokrouhleno na dvě desetinná místa).`];
            break;
        }
        case 'trzba': {
            const price = val(5, 60) * 10, qty = val(8, 80);
            prompt = `Firma prodala ${qty} výrobků za cenu ${price} Kč za kus. Jaká je její celková tržba?`;
            answer = price * qty;
            unit = 'Kč';
            hint = 'Tržba představuje cenu každého prodaného kusu vynásobenou jejich počtem.';
            steps = [`TR = P × Q.`, `TR = ${price} × ${qty} = ${answer} Kč.`];
            break;
        }
        case 'prumerne-naklady': {
            const qty = val(4, 20) * 10, ac = val(10, 55), fc = val(1, 6) * qty;
            const vc = qty * ac - fc;
            prompt = `Firma vyrábí ${qty} kusů. Fixní náklady jsou ${fc} Kč, celkové variabilní náklady ${vc} Kč. Jaké jsou průměrné celkové náklady AC na jeden kus?`;
            answer = ac;
            unit = 'Kč/kus';
            hint = 'Nejdříve sečti fixní a celkové variabilní náklady, potom je vyděl množstvím.';
            steps = [`TC = FC + VC = ${fc} + ${vc} = ${fc + vc} Kč.`, `AC = TC / Q = ${fc + vc} / ${qty} = ${ac} Kč/kus.`];
            break;
        }
        case 'mezni-naklady': {
            const q0 = val(10, 65), dq = val(1, 5), tc0 = val(80, 300) * 10, mc = val(8, 70), tc1 = tc0 + mc * dq;
            prompt = `Při produkci ${q0} kusů jsou celkové náklady ${tc0} Kč. Při ${q0 + dq} kusech jsou ${tc1} Kč. Vypočti mezní náklady na jeden dodatečný kus v tomto intervalu.`;
            answer = mc;
            unit = 'Kč/kus';
            hint = 'Porovnej přírůstek celkových nákladů s přírůstkem množství.';
            steps = [`ΔTC = ${tc1} − ${tc0} = ${tc1 - tc0} Kč.`, `ΔQ = ${q0 + dq} − ${q0} = ${dq} kusů.`, `MC = ΔTC / ΔQ = ${tc1 - tc0} / ${dq} = ${mc} Kč/kus.`];
            break;
        }
        case 'zisk': {
            const qty = val(10, 70), p = val(30, 90), v = val(12, p - 5), fc = val(1, 15) * 10;
            prompt = `Firma prodá ${qty} kusů za ${p} Kč/kus. Variabilní náklady na kus jsou ${v} Kč a celkové fixní náklady ${fc} Kč. Předpokládej, že jde o všechny relevantní náklady. Vypočti zisk.`;
            answer = (p - v) * qty - fc;
            unit = 'Kč';
            hint = 'Od celkových tržeb odečti variabilní náklady všech výrobků i fixní náklady.';
            steps = [`TR = ${p} × ${qty} = ${p * qty} Kč.`, `TC = ${v} × ${qty} + ${fc} = ${v * qty + fc} Kč.`, `π = TR − TC = ${p * qty} − ${v * qty + fc} = ${answer} Kč.`];
            break;
        }
        case 'mezni-produkt': {
            const labor = val(2, 15), dl = val(1, 4), q0 = val(10, 80), mp = val(4, 35), q1 = q0 + dl * mp;
            prompt = `Firma zvýší počet pracovníků z ${labor} na ${labor + dl}. Produkce vzroste z ${q0} na ${q1} kusů. Jaký je průměrný mezní produkt práce v tomto intervalu?`;
            answer = mp;
            unit = 'kusů/pracovníka';
            hint = 'Urči dodatečný výstup a vyděl jej přírůstkem počtu pracovníků.';
            steps = [`ΔQ = ${q1} − ${q0} = ${q1 - q0} kusů.`, `ΔL = ${labor + dl} − ${labor} = ${dl} pracovníků.`, `MPL = ΔQ / ΔL = ${q1 - q0} / ${dl} = ${mp}.`];
            break;
        }
        case 'trh-prace': {
            const mp = val(4, 24), price = val(4, 20) * 10, wage = val(20, 55) * 10;
            labor = { mpl: mp, price, wage };
            prompt = `Při konstantní ceně výrobku ${price} Kč vytvoří dodatečný pracovník ${mp} kusů. Jeho mzdový náklad je ${wage} Kč za stejné období. Vypočti jeho mezní příjem produktu práce MRPL.`;
            answer = mp * price;
            unit = 'Kč';
            hint = 'V modelu dokonale konkurenčního trhu produktu násobíme dodatečný výstup cenou.';
            steps = [`MRPL = MPL × P.`, `MRPL = ${mp} × ${price} = ${answer} Kč.`, `Porovnej tento přínos s mzdovým nákladem ${wage} Kč; otázka požaduje samotné MRPL.`];
            break;
        }
        case 'monopol': {
            const b = val(1, 4), q = val(8, 35), mc = val(5, 45), a = 2 * b * q + mc;
            prompt = `Monopol čelí inverzní poptávce P = ${a} − ${b}Q. Mezní náklady jsou konstantní MC = ${mc}. Urči množství Q maximalizující zisk (předpokládej vnitřní optimum).`;
            answer = q;
            unit = 'kusů';
            hint = 'U lineární inverzní poptávky má MR dvojnásobný sklon než cena. Polož MR = MC.';
            steps = [`Z P = ${a} − ${b}Q plyne MR = ${a} − ${2 * b}Q.`, `V optimu MR = MC: ${a} − ${2 * b}Q = ${mc}.`, `Q = (${a} − ${mc}) / ${2 * b} = ${q} kusů.`];
            break;
        }
        case 'mezni-uzitek': {
            const qty = val(2, 12), mu = val(3, 23), old = val(15, 80), neu = old + mu;
            prompt = `Celkový užitek ze ${qty} kusů je ${old} jednotek, z ${qty + 1} kusů ${neu} jednotek. Jaký je mezní užitek dalšího kusu?`;
            answer = mu;
            unit = 'jednotek užitku';
            hint = 'Podívej se na změnu užitku způsobenou jedním dalším kusem.';
            steps = [`ΔTU = ${neu} − ${old} = ${mu}.`, `ΔQ = 1.`, `MU = ΔTU / ΔQ = ${mu} jednotek užitku.`];
            break;
        }
        case 'soucasna-hodnota': {
            const r = val(2, 12), n = val(1, 4), fv = val(5, 25) * 1000;
            prompt = `Za ${n} rok${n === 1 ? '' : n >= 2 && n <= 4 ? 'y' : 'ů'} obdržíš ${fv} Kč. Diskontní sazba je ${r} % ročně (roční složené úročení). Jaká je dnešní hodnota této částky? Zaokrouhli na 2 desetinná místa.`;
            answer = round2(fv / Math.pow(1 + r / 100, n));
            unit = 'Kč';
            hint = 'Budoucí částku vyděl úročitelem umocněným počtem let.';
            steps = [`PV = FV / (1 + r)^n.`, `PV = ${fv} / (1 + ${r}/100)^${n}.`, `PV = ${cz(answer)} Kč po zaokrouhlení.`];
            break;
        }
        case 'bod-zvratu': {
            const spread = val(5, 30), qty = val(10, 55), v = val(4, 24), p = v + spread, fc = spread * qty;
            prompt = `Firma prodává výrobek za ${p} Kč/kus, variabilní náklady na kus jsou ${v} Kč a fixní náklady ${fc} Kč. Kolik kusů musí prodat, aby dosáhla bodu zvratu?`;
            answer = qty;
            unit = 'kusů';
            hint = 'Příspěvek na úhradu fixních nákladů na kus je cena minus variabilní náklad na kus.';
            steps = [`Příspěvek na úhradu = ${p} − ${v} = ${spread} Kč/kus.`, `Q* = FC / (P − AVC).`, `Q* = ${fc} / ${spread} = ${qty} kusů.`];
            break;
        }
    }
    if (!Number.isFinite(answer) || !steps.length)
        throw new Error('Nevygenerovaná úloha');
    return { id: `${skillId}:${Math.trunc(rng() * 1_000_000_000)}`, skillId, topicId: skill.topicId, title: skill.title, prompt, answer, unit, tolerance: Number.isInteger(answer) ? 1e-8 : 0.005001, steps, hint, market, labor };
}
/** Czech decimal separator accepted; do not interpret units or arbitrary expressions. */
export function parseNumericResponse(text) {
    const normalized = text.trim().replace(/[\s\u00a0\u202f]/g, '').replace(',', '.');
    if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized))
        return null;
    const n = Number(normalized);
    return Number.isFinite(n) ? n : null;
}
export function gradeCalcProblem(problem, response) {
    const value = parseNumericResponse(response);
    return { valid: value !== null, correct: value !== null && Math.abs(problem.answer - value) <= problem.tolerance, value };
}
export function calcSkillProgress(attempts, skillId) {
    const sample = attempts.filter(a => a.skillId === skillId).slice(-8);
    const correct = sample.filter(a => a.correct).length;
    return { attempts: sample.length, correct, accuracy: sample.length ? Math.round(100 * correct / sample.length) : null };
}
export function suggestedCalcSkill(attempts, random = Math.random) {
    // Favour unfamiliar skills first, then recent errors. Vary selection across skills.
    const last = attempts.at(-1)?.skillId;
    const scored = CALC_SKILLS.map(skill => {
        const p = calcSkillProgress(attempts, skill.id);
        const recent = attempts.filter(a => a.skillId === skill.id).at(-1);
        return { id: skill.id, weight: (p.attempts === 0 ? 90 : 100 - (p.accuracy ?? 0)) + (recent?.correct === false ? 35 : 0) - (last === skill.id ? 75 : 0) + random() * 5 };
    }).sort((a, b) => b.weight - a.weight);
    return scored[0].id;
}

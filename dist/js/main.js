import { MikroLab } from './ui.js';
import { validateContent } from './engine.js';
async function start() {
    const root = document.getElementById('app');
    if (!root)
        return;
    try {
        const response = await fetch('./content.json', { cache: 'no-cache' });
        if (!response.ok)
            throw new Error('Studijní podklady se nepodařilo načíst.');
        const content = await response.json();
        if (!validateContent(content))
            throw new Error('Studijní podklady nejsou platné.');
        new MikroLab(root, content);
    }
    catch (err) {
        root.innerHTML = `<div class="fatal"><h1>MikroLab se nepodařilo spustit</h1><p>${err instanceof Error ? err.message : 'Neznámá chyba.'}</p><p>Spusť aplikaci pomocí <code>npm start</code> a otevři adresu localhost:4173.</p></div>`;
    }
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => { }), { once: true });
    }
}
void start();

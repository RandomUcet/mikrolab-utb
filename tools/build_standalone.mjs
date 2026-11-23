/** Build a one-file portable fallback that opens from Finder without npm or Python. */
import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd();
const jsFiles=['calculations.js','engine.js','store.js','coach.js','ui.js'];
const modules=[];
for(const file of jsFiles){
 let code=await readFile(path.join(root,'dist','js',file),'utf8');
 code=code.replace(/^import\s+[^;]+;\s*$/gm,'').replace(/^export\s+/gm,'');
 modules.push(`// ${file}\n${code}`);
}
const content=await readFile(path.join(root,'dist','content.json'),'utf8');
const css=await readFile(path.join(root,'dist','styles.css'),'utf8');
const inlineData=JSON.stringify(JSON.parse(content)).replace(/</g,'\\u003c').replace(/&/g,'\\u0026');
const script=modules.join('\n')+`\ntry {const root=document.getElementById('app');const data=JSON.parse(document.getElementById('course-content').textContent);if(!validateContent(data))throw new Error('Neplatné materiály.');new MikroLab(root,data);}catch(e){document.querySelector('#app').textContent='MikroLab nelze otevřít: '+String(e.message||e);}`;
const html=`<!doctype html><html lang="cs"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#164539"><title>MikroLab 0.3 · Offline</title><style>${css.replace(/<\/style/gi,'<\\/style')}</style></head><body><div id="app"><div class="boot"><div class="boot-mark">M.</div><p>Načítám studijní materiály…</p></div></div><script id="course-content" type="application/json">${inlineData}</script><script>${script.replace(/<\/script/gi,'<\\/script')}</script></body></html>`;
await writeFile(path.join(root,'MikroLab_offline.html'),html);
console.log('Portable offline file:',(html.length/1024).toFixed(0),'KB');

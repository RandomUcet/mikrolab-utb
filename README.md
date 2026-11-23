# MikroLab v0.3.0 · Mikroekonomie I

**Samostatná studijní webová aplikace pro UTB FLKŘ.** Neoficiální výuková pomůcka postavená na zadaných materiálech; nezaručuje úspěch u zápočtu a její otázky nejsou oficiálním testem univerzity.

**14 kapitol · 126 procvičovacích otázek · 86 kartiček · 12 typů generovaných početních úloh · detailní výklady a grafy.**

## První spuštění na MacBooku s Apple Silicon

**Nejjednodušší (doporučeno):** rozbal ZIP a otevři `Spustit-MikroLab.command`. Aplikace používá vestavěný Python HTTP server, je-li Python 3 dostupný; nepotřebuje opravený Homebrew Node. Otevře se `http://localhost:4173`. Terminál nech spuštěný po dobu práce.

**Nouzová varianta bez Pythonu a Node:** otevři dvojklikem `MikroLab_offline.html`. V souboru jsou přímo vložené styly, skripty a učivo, takže funguje i bez serveru nebo připojení. U souborů otevřených přes `file://` se však pravidla prohlížečů liší: lokální ukládání pokroku nemusí fungovat spolehlivě. Pro dlouhodobé studium používej raději `.command` a pravidelně exportuj zálohy.

**Ruční spuštění:** v rozbalené složce použij:

```bash
python3 tools/local_server.py
```

Potom otevři [http://localhost:4173](http://localhost:4173). Pokud Python nemáš, lze pro vývoj použít Node.js 22 a `npm start` (na Macu s rozbitou Homebrew instalací Node použij předchozí varianty).

## Studijní funkce

| Oblast | Co se děje |
|---|---|
| Kapitoly | Učivo ze 13 seminářů + rozšiřující kapitola AI, detailnější postupy řešení, vzorce, modelové úlohy a časté chyby |
| Aktivní vybavování | 86 kartiček, odpověď se zobrazí až po vlastním pokusu |
| Opakování | Rozložené intervaly plánované podle sebehodnocení, možnost návratu k chybám |
| Studijní plán | Přehled splatných karet, nedokončených kapitol, slabších témat a datum zápočtu |
| Cílený test | Otázky ze slabších a neprobraných témat podle předchozích odpovědí |
| Moje chyby | Seznam nevyřešených otázek; správná pozdější odpověď chybu odstraní |
| Početní trenažér | 12 parametrizovaných typů úloh s novými číselnými variantami, českým desetinným zápisem, nápovědou a vysvětlením celého postupu. Ukládá historii a nabízí slabší oblasti. |
| Zápočet nanečisto | Smíšená sada 10/20/30 otázek, vyhodnocení až na konci |
| Laboratoř grafů | Modelové posuny nabídky a poptávky; trh výrobků i trh práce |
| Statistika | Vývoj po kapitolách, historie testů, opakovací plán |
| Záloha | Export a import stavu ve formátu JSON, bez registrace a externích služeb |

### Jak systém vybírá úlohy

Přehledy počítají dosavadní odpovědi v tomto zařízení. Nevyřešenou chybou je otázka, na kterou byla poslední odpověď chybná. Cílený test upřednostňuje chyby, slabší kapitoly a nezodpovězené otázky, při zachování různých témat. Také početní trenažér sleduje posledních osm odpovědí u každé dovednosti. Jde o transparentní **heuristiku**, nikoliv skrytou generativní AI ani predikci úspěchu. Intervaly kartiček jsou jednoduchá varianta rozloženého opakování, nikoliv validovaný algoritmus FSRS.

## Vývoj

Vyžaduje Node.js ≥20 a TypeScript; pro běžné otevření uživatelské sestavy Node nepotřebuješ.

```bash
npm install
npm run check           # sestavení + testy
npm start               # vývojový HTTP server
```

Početní generátory jsou oddělené v `src/calculations.ts` a testované na 1 200 kombinacích vstupních parametrů. Po každé úpravě TypeScriptu spusť `npm run build`. Sestaví `dist/` a přegeneruje i samostatný soubor `MikroLab_offline.html`.

### Obsah a verzování

`public/content.json` tvoří přímo zveřejněnou datovou sadu. Je generována ze základů `tools/generate_content.py` a udržované kurátorské nadstavby `content/enrichment.json`. **Chceš-li přegenerovat celý obsah**, spusť oba kroky, aby se neztratila rozšíření:

```bash
python3 tools/generate_content.py
python3 tools/enhance_content.py
npm run check
```

Sada obsahuje nové otázky a příklady vytvořené jako výukové parafráze; jde o zjednodušené modely s předpoklady uvedenými v samotném textu. Obsah je oddělen od aplikačního kódu a lze ho rozšiřovat bez změny výukového enginu.

```
src/       výukový engine, generátory početních úloh, pravidlový coach, perzistence a UI (TypeScript)
content/   redakčně doplněné tematické úlohy a výklady
public/    styly, zdrojová data a webové assety
public/sw.js  offline cache pro hostovanou PWA
scripts/   (nepoužito)
tools/     generování obsahu, lokální server, build standalone
 dist/     sestavené webové soubory pro hostování
 tests/    testy scheduleru, importu, obsahu, rozhraní a diagnózy chyb
 .github/workflows/  CI a nasazení na GitHub Pages
```

## GitHub a nasazení

Projekt patří do **samostatného repozitáře**, ne do některého existujícího nesouvisejícího projektu. Po založení prázdného repozitáře `mikrolab-utb` na účtu GitHub:

```bash
git init -b main
git add .
git commit -m "MikroLab v0.3.0 – rozšířená výuková aplikace"
git remote add origin https://github.com/TVUJ_UCET/mikrolab-utb.git
git push -u origin main
```

Zapni **Settings → Pages → Source: GitHub Actions**. Workflow `pages.yml` otestuje, sestaví a publikuje statický web z `dist/`. CI workflow při změnách používá Node 22.

## Ochrana dat

Veškerý pokrok zůstává v `localStorage` prohlížeče a není odesílán na server ani účtům třetích stran. Změna prohlížeče, adresy či smazání jeho dat způsobí ztrátu místního pokroku, pokud nemáš zálohu. JSON zálohy importuj jen od sebe a z důvěryhodného zdroje.

## Metodický základ

- Dunlosky et al. (2013), *Improving Students' Learning With Effective Learning Techniques*: evidence pro practice testing a distributed practice. https://doi.org/10.1177/1529100612453266
- Karpicke & Blunt (2011), *Retrieval practice produces more learning than elaborative studying with concept mapping*. https://pubmed.ncbi.nlm.nih.gov/21252317/
- Kurátorské podklady dodané studentem: UTB FLKŘ, semináře 1–13 a *Mikroekonomie I* (Dohnalová & Dobeš, 2013).
- Pro bonus AI: *Budoucnost českého pracovního trhu* (BCG/MPSV/Aspen, 2025) a *Predikce a realita pracovního trhu očima zaměstnavatelů* (ÚP ČR, 2026).

Viz také [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md), [`docs/LEARNING_DESIGN.md`](docs/LEARNING_DESIGN.md), [`docs/QUALITY_ASSURANCE.md`](docs/QUALITY_ASSURANCE.md), [`docs/ROADMAP.md`](docs/ROADMAP.md).

## Verze 0.3.0 – technické poznámky

- Zálohy z verzí 0.1 a 0.2 se načítají bez ztráty původního postupu. Nově obsahují pole `mathAttempts`.
- Výpočty nejsou generativní AI: typy úloh jsou matematicky parametrizované s deterministickou kontrolou výsledku. Nápověda nepředává výsledek.
- Některé prohlížeče omezují ukládání u offline HTML otevřeného jako `file://`; doporučuje se lokální `.command` server a pravidelné zálohy.
- Pro GitHub Pages: **Settings → Pages → Source: GitHub Actions**. Nasazení vytváří `.github/workflows/pages.yml`.
- Termín zápočtu, početní pokusy, opakovací kartičky a odpovědi zůstávají jen v prohlížeči uživatele.

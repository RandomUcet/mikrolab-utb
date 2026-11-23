# Implementační plán · MikroLab v0.2

## Cíl a hranice projektu

Pomoci samostatnému studentovi připravit se na zápočet z mikroekonomie na základě jeho reálných studijních materiálů. Žádná tvrzení o „zaručeném zápočtu“ nebo univerzálně optimálních intervalech.

## Výukový plán

1. Začít *diagnostickou otázkou*, ne dlouhým pasivním čtením (v první verzi řešeno krátkými tematickými testy).
2. Dát studentovi vysvětlení, modelový příklad a upozornění na častou záměnu.
3. Nechat ho vybavit odpověď dřív, než uvidí řešení.
4. Přeplánovat zopakování kartičky podle sebehodnocení.
5. Průběžně míchat úlohy z více okruhů (cvičný zápočet).
6. Vrátit chybné odpovědi s vysvětlením do rozboru po testu.

## Technická rozhodnutí

| Rozhodnutí | Odůvodnění | Důsledek |
|---|---|---|
| PWA jako statický web | Nejsnazší provoz na Apple Silicon; GitHub Pages | Bez serverové synchronizace |
| TypeScript, bez runtime knihoven | Málo závislostí, snadná auditovatelnost | UI se pro v1 spravuje vlastními komponentami |
| Výukový obsah v JSON | Oddělení výkladu od kódu, snadná kontrola | Úpravy obsahu vyžadují validaci |
| Lokální úložiště + JSON zálohy | Soukromí a offline režim | Ruční přenos mezi zařízeními |
| Rozložené opakování podle intervalů | Transparentní první implementace | Později možnost nahradit FSRS |
| GitHub Actions | Opakovatelné buildy a testy | Před zveřejněním nutné vytvořit repozitář |

## Přijetí v0.1 (akceptační kritéria)

- [x] Pokrytí všech 13 seminárních okruhů + bonus o AI
- [x] 14 lekcí s příkladem a upozorněním na omyl
- [x] 84 kontrolovaných testových otázek
- [x] 58 kartiček pro aktivní vybavování
- [x] Opakovací scheduler, včetně vstupu pro sebehodnocení
- [x] 10/20/30 položek ve smíšeném zápočtu
- [x] Lokální úložiště, export a sanitace importu
- [x] Interaktivní graf nabídky/poptávky
- [x] Automatická kontrola TypeScript kompilací a Node testy
- [x] Bez externího API a databáze
- [ ] Nasazení nového repozitáře na GitHub (nutný nový repozitář; současný přístup k GitHubu nepovoluje jeho vytvoření)
- [ ] Vizuální kontrola v prohlížeči na uživatelově MacBooku (automatický prohlížeč tohoto prostředí je blokován)

## Rizika

- Závěrečný oficiální test se může od této sady úloh výrazně lišit.
- Interpretace mikroekonomických modelů někdy vyžaduje předpoklady, které jsou ve stručném výkladu zjednodušeny.
- Data se mohou ztratit vymazáním lokálního úložiště; proto je k dispozici záloha.
- Rozvrh opakování není individuálně optimalizovaný ani porovnaný s FSRS v klinickém/testovacím výzkumu.

## Iterace v0.2

- [x] Prohloubit všech 14 témat s výpočty a postupy.
- [x] Přidat 42 úloh a 28 kartiček.
- [x] Vytvořit pravidlový studijní plán a nevyřešené chyby.
- [x] Generovat samostatnou offline HTML variantu bez serveru.
- [x] Desktop/mobilní smoke test v prohlížeči přes inline sestavu.
- [x] Rozšířit automatické regresní testování.
- [ ] Publikovat na GitHub Pages po vytvoření prázdného repozitáře vlastníkem účtu.
- [ ] Ověřit skutečné spouštění a perzistenci na macOS/Safari.

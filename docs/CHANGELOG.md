# MikroLab – změny verzí

## 0.4.0 (2026-11-23)

- Orientační diagnostika všech 14 kapitol s odloženou zpětnou vazbou a rozborem výsledků.
- Samostatné ukládání diagnostických výsledků a jejich omezené využití v doporučeních.
- Interaktivní graf podle konkrétních koeficientů tržní rovnováhy po odevzdání odpovědi.
- Interaktivní srovnání MRPL a mzdového nákladu při změně produktivity.
- Testy a oprava offline HTML sestavy i popisků modelu trhu práce.

## 0.3.0 (2026-11-23)

- Přidán početní trenažér s 12 typy úloh: rovnováha, elasticita, tržby, průměrné a mezní náklady, zisk, mezní produkt, trh práce, monopol, mezní užitek, současná hodnota a bod zvratu.
- Parametrizované zadání, vlastní číselná odpověď, nápověda, vyhodnocení a řešení krok za krokem.
- Adaptivní střídání početních témat podle neprocvičených oblastí a posledních chybných odpovědí.
- Ukládání výsledků nových úloh do lokálního profilu a záloh; kompatibilní s daty 0.2.0.
- Početní výuka propojená s kapitolami, přehledem a studijním plánem.
- Rozšířeny automatické testy a ověřeno vykreslení v Chromium pro mobil a desktop.

# Historie verzí

## 0.1.1 – oprava spuštění na macOS

- Nový `Spustit-MikroLab.command` přednostně používá standardní Python 3 místo Homebrew Node.js.
- Přidán bezpečný lokální HTTP server `tools/local_server.py` bez externích závislostí.
- Aktualizován návod na spuštění; zachovány rozvrh opakování, testy a veškerý studijní obsah.
- Obnovena verze service-worker cache pro korektní načtení lokální aktualizace.

## 0.1.0 – první verze

- Výklad mikroekonomie, otázky, kartičky, cvičné zápočty, ekonomická laboratoř a ukládání pokroku.

## 0.2.0 · Rozšířený výklad a diagnostika

- 14 tematických kapitol s hlubším výkladem, krokovým postupem, vztahem/vzorcem a úlohou s odkrytím řešení.
- Obsah navýšen z 84 na 126 úloh a z 58 na 86 opakovacích kartiček.
- Přehled nevyřešených chyb a cílený retest. Opravená odpověď chybu odstraní.
- Adaptivní smíšené procvičování 12 otázek, přehled slabších témat, týdenní výhled kartiček.
- Možnost volitelně nastavit datum zápočtu s perzistencí v lokální záloze.
- Modernizovaný vizuální systém a responsive zobrazení pro desktop a mobil.
- Samostatný `MikroLab_offline.html`, fungující po otevření bez lokálního serveru; lokální ukládání ve `file://` může být omezené.
- Nové regresní testy, test v headless Chromium pro desktop a mobil.

# MikroLab v0.2 · Kontrolní protokol

## Co bylo provedeno

- Kompilace všech zdrojových souborů TypeScriptu pomocí `tsc`.
- Statické testování vyplnění a konzistence 126 otázek a 86 kartiček, kontrola identifikátorů, správných indexů a duplicit odpovědí.
- Automatizované testy scheduleru (správná a chybná odpověď, termíny), záloh (včetně odmítnutí neznámých identifikátorů), tržního modelu, výběru smíšeného testu.
- Testování pravidel pro chyby: poslední chybná odpověď přidá otázku do seznamu, pozdější správná ji odstraní.
- Testování doporučení slabších témat, denního rozvrhu, odhadu sedmidenních termínů a nového zadání data zápočtu.
- Browser smoke test přenosné HTML sestavy v headless Chromium přes `page.set_content` při šířkách 1440 px a 390 px: přehled, studijní plán, výklad s odkrytím řešení, procvičovací otázka a feedback. Na obou šířkách bez JS výjimek.
- Kontrola sestavení `dist/` a samostatné varianty `MikroLab_offline.html`.

## Známá omezení

- Běžná síťová navigace testovacího browseru v tomto prostředí je blokována správcem. Proto byl vizuální smoke test proveden na jednosouborové offline variantě s totožnými styly a UI logikou, nikoliv na reálném nasazení GitHub Pages.
- Nelze zde potvrdit chování na konkrétním MacBooku se Safari. Je potřeba zkusit ovládání, fonty a zachování pokroku po zavření prohlížeče.
- `MikroLab_offline.html` používá režim `file://`; zachování `localStorage` závisí na prohlížeči. Bezpečnější provoz je přes lokální server.
- Možnosti odpovědí a vysvětlení jsou redakčně vytvořené; nebyly formálně recenzovány vyučujícím a nemusí odpovídat formulaci zápočtu.
- Metriky slabších témat jsou doporučení založená na odpovědích, nikoli psychometricky kalibrovaná znalostní škála.

## Doporučený ruční test na MacBooku

1. Spusť `.command`, otevři dashboard a kapitolu Základy ekonomie.
2. Otevři rozšířený výklad, bez nápovědy vyřeš modelový příklad a odkryj postup.
3. V procvičování zvol záměrně jednu nesprávnou odpověď; měla by se objevit v Moje chyby.
4. Spusť Procvičit chyby a odpověz správně. Chyba by měla zmizet.
5. Opakuj několik kartiček, zkontroluj rozložení do dnů na stránce Studijní plán.
6. Vyplň datum zápočtu, exportuj zálohu, obnov ji v jiném profilu/prohlížeči a zkontroluj úspěšnost a termín.
7. Otevři stejnou aplikaci na telefonu, otestuj menu a interaktivní graf.
8. Proveď cvičný zápočet (10 otázek), přesvědč se, že se odpovědi neukazují během testu.

Automatické testy jsou regresní ochrana, nikoli záruka úplné správnosti obsahu či bezchybného chování ve všech prohlížečích.

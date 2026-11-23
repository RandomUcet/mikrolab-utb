# Jak rozšiřovat a kontrolovat obsah

Všechen materiál je v `public/content.json`. Pro reprodukovatelné generování použijte `tools/generate_content.py`, který je hlavním autorským zdrojem současného kurzu.

## Mapování kapitol

1. Úvod do ekonomie, vzácnost, PPF
2. Trh a tržní mechanismus
3. Chování spotřebitele
4. Výroba, náklady a nabídka
5. Dokonalá konkurence
6. Monopol
7. Oligopol
8. Monopolistická konkurence
9. Trhy výrobních faktorů
10. Trh práce a mzda
11. Trh kapitálu
12. Celková rovnováha a Paretova efektivnost
13. Tržní selhání a role státu
14. Bonus: AI a budoucnost trhu práce (BCG 2025, ÚP ČR 2026)

## Smlouva o obsahu

Každé téma musí obsahovat unikátní `id`, název, krátký popis, výukové cíle, sekce výkladu, ilustrativní příklad, častý omyl, přesné označení zdrojů, kartičky a čtyřmožnostní otázky s jedinou správnou odpovědí a vysvětlením.

Při úpravách dodržte:

- žádné vymyšlené statistiky nebo oficiální otázky;
- modelový příklad vždy označit jako příklad, odlišit od empirického zdroje;
- nevydávat teorii platnou jen za předpokladů za univerzální tvrzení;
- kontrolovat přesnost výpočtů i všechny distraktory;
- každý zdroj lze dohledat přes jeho název a kapitolu;
- zkrácená citace materiálů slouží pro dohledání, nejde o kompletní bibliografický aparát.

Po editaci spusťte `python3 tools/generate_content.py` a `npm run check`. Při nasazení se z nového obsahu aktualizuje dist v procesu buildu.

## Struktura otázky

```json
{
  "id": "trh-prace-q1",
  "stem": "Kdo je na trhu práce na straně nabídky?",
  "options": ["Zaměstnavatelé", "Domácnosti a pracovníci", "Pouze stát", "Výrobci strojů"],
  "answer": 1,
  "explanation": "Pracovníci nabízejí své pracovní služby.",
  "level": 1
}
```

`answer` je index 0–3. Změna `id` ruší návaznost na již uložené odpovědi uživatele, proto existující identifikátory neměňte.

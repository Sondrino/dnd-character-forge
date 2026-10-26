# D&D Character Forge

Windows-app for å lage, utvikle og spille D&D-karakterer etter **2024-reglene (5.5e)**: regeldata, terninger, tips og PDF-eksport samlet på ett sted.

**[⬇ Last ned nyeste versjon](../../releases/latest)** · **[📖 Installeringsguide](INSTALLERING.md)**

## Funksjoner

- **Veiviser** i 2024-rekkefølge: class → background/species → ability scores (standard array, point buy, 4d6 eller manuelt) → utstyr → spells → detaljer.
- **Character sheet** i 2024-oppsett som regner ut alt automatisk: AC, HP, saves, skills, angrep, spell DC og slots, Weapon Mastery og bæreevne.
- **Egne verdier:** juster hva som helst (f.eks. +2 STR) oppå utregningen, eller sett en fast verdi.
- **Guide for det som mangler:** klikk på det røde tallet for å se hva som må fikses, steg for steg.
- **Terninger:** klikk på en verdi for å rulle. Støtter advantage/disadvantage, kritiske treff og egen notasjon (`2d6+3`, `4d6kh3`).
- **Regeldata:**
  - 12 classes og 49 subclasses, 10 species, 16 backgrounds og 77 feats.
  - 394 spells, 383 magic items og 336 creatures.
  - Våpen, rustning, utstyr og regelordliste.
- **Info i to nivåer:** klikk et navn for en kort popup. «Mer info» gir full beskrivelse, med lenke til D&D Beyond.
- **Mer:**
  - Level up og level down, short og long rest.
  - Homebrew-editor med effekter som oppdaterer arket.
  - PDF-eksport og flere lagrede karakterer.
  - Norsk eller engelsk, lyst eller mørkt tema.

## Utvikling

```bash
npm install
npm run dev      # starter appen i utviklingsmodus
npm test         # tester for regnemotor, regler og data
npm run dist     # bygger installer + portable .exe i dist/
npm run web      # kun grensesnittet i nettleser (lagrer i localStorage)
```

| Mappe | Innhold |
|---|---|
| `src/main` | Electron-hovedprosess: lagring (JSON i `%APPDATA%`), PDF-eksport, D&D Beyond-vindu |
| `src/preload` | Trygt API mellom app og hovedprosess |
| `src/renderer/src/data` | Regeldata. Nye filer her blir lastet automatisk |
| `src/renderer/src/engine` | Regnemotor (`compute.ts`), tips og formler |
| `src/renderer/src/dice` | Terningparser |
| `src/renderer/src/pages`, `components` | Grensesnitt |

**Effects** (`types/index.ts`) er det som gjør at arket oppdaterer seg når du legger til items eller feats, f.eks. `{ target: 'ac', op: 'add', value: 1 }`.

## Lisens for regeldata

This work includes material from the System Reference Document 5.2.1 ("SRD 5.2.1") by Wizards of the Coast LLC, available at https://www.dndbeyond.com/srd. The SRD 5.2.1 is licensed under the Creative Commons Attribution 4.0 International License, available at https://creativecommons.org/licenses/by/4.0/legalcode.

Oppføringer merket «PHB 2024» inneholder bare spillmekanikk og korte sammendrag skrevet for denne appen. Full tekst står i Player’s Handbook eller på D&D Beyond.

*Dungeons & Dragons og D&D Beyond er varemerker for Wizards of the Coast. Prosjektet er ikke tilknyttet eller godkjent av Wizards of the Coast. Compatible with fifth edition.*

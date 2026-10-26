# Installering – D&D Character Forge

En steg-for-steg-guide for å installere og bruke appen på Windows.

## Krav

- Windows 10 eller 11 (64-bit)
- Ca. 450 MB ledig plass
- Internett trengs bare for å åpne D&D Beyond. Resten av appen virker offline.

## 1. Last ned

Gå til **[Releases](../../releases/latest)** og last ned én av filene under **Assets**:

| Fil | Når du bør velge den |
|---|---|
| `D&D Character Forge Setup 1.2.0.exe` | **Anbefalt.** Installerer appen med snarvei på skrivebordet og i Start-menyen. |
| `D&D Character Forge 1.2.0 Portable.exe` | Kjører uten installasjon, f.eks. fra en minnepinne. |

## 2. Installer

1. Dobbeltklikk på `D&D Character Forge Setup 1.2.0.exe`.
2. Windows viser sannsynligvis en blå boks: **«Windows beskyttet PC-en»**. Det skjer fordi appen ikke er kodesignert, noe som koster penger og er vanlig for hobbyprosjekter. Klikk **«Mer info»** og så **«Kjør likevel»**.
3. Velg installasjonsmappe (standard er fin) og klikk **Installer**.
4. Start appen fra skrivebordet eller Start-menyen.

> **Portable:** Dobbeltklikk på `Portable.exe`. Den samme SmartScreen-advarselen kan dukke opp, og du gjør som i punkt 2. Det første oppstartet tar noen sekunder lenger.

## 3. Kom i gang

1. Klikk **«Ny karakter»**. Veiviseren tar deg gjennom class, opprinnelse, ability scores, utstyr, spells og detaljer.
2. Mangler noe, vises et **rødt tall**. Klikk på det, så får du en guide som viser hva som mangler og lar deg fikse det med en gang.
3. Klikk på navn (spells, våpen, features) for en kort forklaring, og «Mer info» for full beskrivelse.
4. Klikk på en verdi på arket for å rulle terning. Blyanten lar deg justere verdien selv, f.eks. +2 STR for et custom game.
5. **PDF**-knappen lager et utskrivbart ark med alle detaljer.

## Hvor lagres karakterene?

Karakterene lagres automatisk som filer på maskinen din:

```
%APPDATA%\dnd-character-forge\characters\
```

Du kan også åpne mappen fra **Innstillinger → Lagring → Åpne mappe**.

- **Sikkerhetskopi:** kopier mappen over, eller bruk eksport-knappen på hver karakter (`.json`).
- **Flytte til en annen PC:** eksporter karakteren, og bruk **Importer** på forsiden på den nye maskinen.

## Oppdatere til ny versjon

Last ned den nyeste installeren fra [Releases](../../releases/latest) og kjør den. Den erstatter den gamle versjonen. **Karakterene dine beholdes**, siden de ligger i AppData og ikke i programmappen.

## Avinstallere

**Innstillinger → Apper → Installerte apper → D&D Character Forge → Avinstaller.**
Karakterene blir liggende i `%APPDATA%\dnd-character-forge`. Slett den mappen hvis du vil fjerne alt.

## Vanlige problemer

| Problem | Løsning |
|---|---|
| «Windows beskyttet PC-en» | Klikk «Mer info» → «Kjør likevel». |
| Antivirus stopper filen | Legg filen til som unntak. Appen er ikke signert, og det kan gi falske alarmer. |
| D&D Beyond-vinduet er tomt | Sjekk internettforbindelsen. Du kan også velge «Åpne i nettleser» under Innstillinger. |
| PDF-en åpnes ikke | Sjekk at du har et PDF-program (Edge kan åpne PDF). |

## Bygge fra kildekoden (for utviklere)

Krever [Node.js](https://nodejs.org) 20 eller nyere og Git.

```bash
git clone https://github.com/Sondrino/dnd-character-forge.git
cd dnd-character-forge
npm install
npm run dev      # start appen i utviklingsmodus
npm test         # kjør testene
npm run dist     # bygg installer og portable .exe til dist/
```

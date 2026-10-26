# Sikkerhet

## Rapportere en sårbarhet

Har du funnet et sikkerhetsproblem? **Ikke opprett et offentlig issue.** Bruk i stedet
[«Report a vulnerability»](../../security/advisories/new) under *Security*-fanen i repoet.
Da blir rapporten privat. Vi svarer så snart som mulig.

## Sikkerhetstiltak i appen

- **Isolert grensesnitt:** alle vinduer kjører med `sandbox`, `contextIsolation` og uten `nodeIntegration`.
- **Ingen navigering bort fra appen:** lenker i beskrivelser og importerte filer åpnes aldri i appvinduet.
  Bare `http(s)`-lenker åpnes, i D&D Beyond-vinduet eller i nettleseren.
- **IPC-kall** (lagring, PDF, import/eksport) godtas bare fra appens egne sider, og inndata valideres.
  Filnavn renses, så ingen kan skrive utenfor datamappen.
- **Streng Content-Security-Policy:** ingen eksterne skript, ingen `eval`, ingen iframes eller objekter.
- **Ingen tillatelser til nettsider:** D&D Beyond-vinduet får ikke kamera, mikrofon, posisjon eller varsler.
- **Electron-fuses:** `RunAsNode`, `NODE_OPTIONS` og debug-flagg er slått av. Integriteten til app-filene (asar) sjekkes ved oppstart.
- **Offline:** appen sender ingen data noe sted. Karakterer lagres lokalt i `%APPDATA%\dnd-character-forge`.
- **Oppdaterte pakker:** Dependabot varsler om sårbare npm-pakker.

## Verifisere nedlastingen

Hver release oppgir SHA-256-sjekksummer. Slik sjekker du filen i PowerShell:

```powershell
Get-FileHash .\DnD-Character-Forge-Setup-1.2.1.exe -Algorithm SHA256
```

Verdien skal være lik den som står i release-notatene.

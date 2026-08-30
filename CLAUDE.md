# CLAUDE.md — Projektkonventionen

Persönliches FPV-Logbuch von Guido. Astro 5, statisch, GitHub Pages unter
`guidokl.github.io/voidfpv`. Sprache der Seite und der Commits: **Deutsch**.

## Befehle

```bash
npm run dev      # http://localhost:4321/voidfpv
npm run build    # astro check + build
npm run preview
```

## Harte Regeln

**Niemals veröffentlichen:** e-ID, PIN-Zusatz, Versicherungs- oder Vertragsnummern,
Ausweisdaten, Klarname oder Adresse außerhalb von Impressum und Datenschutz, punktgenaue
Koordinaten von Spots mit `coordsPublic: false`. Die PDFs in `MyDocs/` sind per `.gitignore`
ausgeschlossen — das bleibt so.

**Links vor Aufnahme prüfen.** Jede neue URL in `tools.json`, `links.json`, `pilots.json` oder
`films.json` wird tatsächlich aufgerufen, bevor sie eingetragen wird, und bekommt
`lastChecked` beziehungsweise `verified` mit dem heutigen Datum. Keine aus dem Gedächtnis
rekonstruierten Titel, Jahreszahlen oder Kanalnamen.

**Unsicheres kennzeichnen.** Firmware-Stände, Bindungsverfahren und Kompatibilität von
DJI-Air-Units ändern sich schnell. Solche Angaben werden als „vor Kauf prüfen" markiert statt
als Fakt behauptet.

**Rechtsthemen** tragen `legal: true` im Frontmatter und bekommen automatisch den Hinweis
„keine Rechtsberatung". Diesen Hinweis nicht entfernen.

## Design-System „OSD"

Leitbild ist das Overlay in der FPV-Brille, nicht eine Portfolio-Seite. Farben, Abstände,
Schriftgrößen und Motion stehen **ausschließlich** in `src/styles/tokens.css`. Keine
Hex-Werte, keine Pixelwerte direkt in Komponenten.

Ein Akzent (`--accent`, OSD-Amber), zwei Statusfarben (`--armed` rot, `--gps` grün). Mehr nicht.

**Wiederkehrende Formen:**
- Ecken-Ticks (2px L-Winkel) statt Border-Radius
- Zweistellige Indizes in der Navigation, aktiver Eintrag mit Amber-Balken links
- Key/Value-Reihen mit gepunkteter Führungslinie (`SpecTable`)
- Status-LEDs als 6px-**Quadrate**, nicht Kreise
- Buttons eckig, 1px Border, Mono-Uppercase, Hover = Amber-Border, keine Füllung
- Diagramme als handgeschriebenes Inline-SVG, keine Chart-Library

**Verboten:** Lila/Blau-Verläufe, Glassmorphism-Blur, große Radien, Drop-Shadows,
Emoji-Icons, zentrierte Hero-Pill-Buttons, Bounce-Animationen, Tailwind oder ein anderes
Utility-Framework.

**Motion:** 80–120 ms, `ease-out`, sparsam. `prefers-reduced-motion` wird respektiert.

## Technische Fallstricke

- **`base`-Pfad:** Interne Links immer über `href()` aus `src/lib/format.ts`. In Markdown
  erledigt das Rehype-Plugin `src/lib/rehype-base-links.mjs`. Ein hartkodiertes `/wissen`
  bricht auf GitHub Pages.
- **`[hidden]`:** Eigene `display`-Regeln schlagen das Attribut. `global.css` enthält deshalb
  `[hidden] { display: none !important; }` — nicht entfernen.
- **Frontmatter mit Doppelpunkt** im Wert muss in Anführungszeichen stehen, sonst bricht der
  YAML-Parser den Build.
- **Kein Framework-Runtime.** Interaktivität ist Vanilla-TypeScript in `<script>`-Blöcken oder
  `src/scripts/`. Wenn etwas React zu brauchen scheint, ist meist der Entwurf zu kompliziert.

## Inhalte

Markdown für Fließtext (`flights`, `sim`, `posts`, `hardware`, `wissen`, `spots`, `gallery`),
JSON für Listen (`tools`, `links`, `pilots`, `films`, `parts`, `status`). Schemas stehen in
`src/content.config.ts` — neue Felder dort zuerst ergänzen.

Alle abgeleiteten Zahlen kommen aus `src/lib/stats.ts`. Rail-Fuß, Top-Bar-LEDs und Startseite
lesen aus dieser einen Quelle; Kennzahlen nicht an anderer Stelle neu berechnen.

Einträge mit `template: true` sind Vorlagen und zählen nicht in die Statistik.

## Wetter-Bereich

`src/lib/gono.ts` enthält die Regel-Engine. **Alle Grenzwerte stehen in `LIMITS`** — dort
ändern, nie in der Oberfläche. Jede Regel liefert Status *und* Klartext-Begründung; ein Urteil
ohne nachvollziehbaren Grund ist kein gültiger Zustand.

Ein API-Ausfall ist ein regulärer Zustand, kein Bug: Das Offline-Panel muss weiter tragen und
auf dipul, Windy und DWD verweisen. Beim Ändern des Wetter-Codes diesen Pfad mittesten.

## Quelle der Wissensbasis

`MyDocs/Avata-2-Pilot-Guide.md` ist die Ursprungsdatei und bleibt unangetastet. Die Kapitel
unter `src/content/wissen/` sind daraus überführt.

## Offene Punkte

Stehen in `TODO.md` — dort neue Ideen ergänzen, statt sie in Kommentaren zu verstecken.

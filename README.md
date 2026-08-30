# VOID FPV

Persönliches FPV-Logbuch — Einstieg mit der DJI Avata 2. Status, Hardware, Wetter-Briefing,
Wissensbasis, Flugbuch, Werkstatt-Roadmap, Linkverzeichnis.

**Live:** https://guidokl.github.io/voidfpv

---

## Loslegen

```bash
npm install
```

```bash
npm run dev
```

Die Seite läuft dann auf **http://localhost:4321/voidfpv** — der Pfad `/voidfpv` gehört dazu,
weil GitHub Pages die Seite in einem Unterverzeichnis ausliefert.

| Befehl | Wirkung |
|---|---|
| `npm run dev` | Entwicklungsserver mit Hot Reload |
| `npm run build` | Typprüfung und statischer Build nach `dist/` |
| `npm run preview` | `dist/` lokal ausliefern, wie es später live läuft |

---

## Stack

- **Astro 5**, statisch, TypeScript strict
- **Handgeschriebenes CSS** mit Design-Tokens in `src/styles/tokens.css` — bewusst kein Framework
- **Content Collections** mit Zod-Schemas: ein Tippfehler im Frontmatter bricht den Build,
  statt die Seite still zu zerlegen
- **Selbst gehostete Schriften** (Space Grotesk, Inter Tight, JetBrains Mono) — keine externen
  Font-Requests
- **Open-Meteo** und **NOAA SWPC** für das Wetter-Briefing, beide ohne API-Schlüssel und
  ausschließlich im Browser

Kein Framework-Runtime, kein CMS, keine Datenbank, kein Backend.

---

## Inhalte pflegen

Alles liegt unter `src/content/`. Markdown-Dateien für Fließtext, JSON für Listen.

### Neuen Flug eintragen

Kopiere `src/content/flights/_vorlage.md`, benenne sie um (z. B. `2026-09-15-erstes-feld.md`)
und setze `template: false`.

```yaml
---
date: 2026-09-15
spot: Feld nördlich vom Ort
area: Beispielgebiet
drone: DJI Avata 2
controller: RC Motion 3
mode: N            # N | S | M | Easy ACRO
packs: 2
airtimeMin: 34
maxAltM: 30
windMs: 3.5
tempC: 14
conditions: bedeckt, kaum Böen
crashes: 0
spotter: false
summary: Ein Satz, der in der Übersicht steht.
template: false
---
```

Flugzeit, Akkus und Crashes laufen automatisch in die Kennzahlen auf der Startseite und in die
Leiste links.

### Simulator-Session eintragen

`src/content/sim/_vorlage.md` kopieren. Die Stundensumme erscheint sofort in der Rail.

```yaml
---
date: 2026-09-01
sim: Uncrashed
minutes: 25
controller: FPV Remote Controller 3
focus: [Hover halten, Achten fliegen]
notes: Was hängengeblieben ist.
template: false
---
```

### Bericht schreiben

`src/content/posts/_vorlage.md` kopieren. `draft: true` hält einen Text aus der Liste heraus.

### Spot anlegen

Neue Datei in `src/content/spots/`:

```yaml
---
name: Feld nördlich vom Ort
area: Beispielgebiet
lat: 51.0500
lon: 7.0000
coordsPublic: false   # false = Koordinaten werden nur gerundet ausgegeben
type: feld            # feld | wald | lostplace | indoor | sonstiges
access: Feldweg ab Parkplatz, 300 m zu Fuß
dipulChecked: 2026-09-10
notes: Freie Fläche, keine Bebauung in 300 m.
isDefault: false
---
```

Spots erscheinen dann in der Standortauswahl im Wetter-Bereich.

### Foto in die Galerie

Bild nach `src/assets/gallery/` legen, dazu eine Markdown-Datei in `src/content/gallery/`:

```yaml
---
image: ../../assets/gallery/2026-09-15-feld.jpg
caption: Bildunterschrift
date: 2026-09-15
location: Beispielgebiet
tags: [feld, sonnenuntergang]
drone: DJI Avata 2
settings: 4K/60, D-Log M
featured: false
---
```

Astro erzeugt daraus automatisch AVIF und WebP in mehreren Größen.

> **Vor dem Hochladen:** GPS-Daten aus der Bilddatei entfernen (ExifTool steht unter `/tools`).
> Sonst steht der Spot metergenau im öffentlichen Repository.

### Tool, Link oder Teil ergänzen

Diese drei sind JSON-Listen, weil sie sortiert und massenweise geprüft werden:

- `src/content/tools.json`
- `src/content/links.json`
- `src/content/parts.json`

**Regel:** Jede URL vor der Aufnahme im Browser öffnen und `lastChecked` auf das heutige Datum
setzen. Tote Links fliegen raus, statt „ungefähr richtig" stehenzubleiben.

### Papierkram-Status ändern

`src/content/status/status.json` — `state` auf `open`, `pending` oder `done` setzen. Das steuert
die vier Status-LEDs oben rechts auf jeder Seite.

---

## Struktur

```
src/
  assets/fonts/        selbst gehostete Schriften
  components/          Panel, StatTile, DataMatrix, Checklist, Glossary, Stepper, Lightbox …
  content/             alle Inhalte (Markdown + JSON)
  content.config.ts    Schemas — hier stehen die erlaubten Felder
  data/                Glossar, Lernpfad, Checklisten (Code statt Content, weil strukturiert)
  layouts/Base.astro   Rail + Top-Bar + Fuß
  lib/                 stats, nav, format, weather, gono (Regel-Engine), sun
  pages/               die 14 Bereiche plus Impressum und Datenschutz
  scripts/             Client-Logik des Wetter-Briefings
  styles/              tokens.css und global.css
MyDocs/                Quelldatei des Pilot-Guides (PDFs sind per .gitignore ausgeschlossen)
TODO.md                Ideen und offene Punkte
```

---

## Deploy

Push auf `main` löst den Workflow in `.github/workflows/deploy.yml` aus; GitHub Pages steht
bereits auf „GitHub Actions".

Bei anderem Repo-Namen oder eigener Domain muss `base` in `astro.config.mjs` angepasst werden —
das ist die häufigste Fehlerquelle bei Pages. Für eine eigene Domain: `site` auf die Domain
setzen und `base: '/'`.

---

## Was hier nicht hingehört

Das Repository ist öffentlich. Deshalb bewusst ausgeschlossen:

- **e-ID und PIN-Zusatz** — der Papierkram-Bereich zeigt nur `offen`, `läuft` oder `erledigt`
- **Versicherungs- und Vertragsnummern**
- **Ausweisdaten, Bescheide, Zertifikate** — die PDFs in `MyDocs/` sind per `.gitignore`
  ausgenommen
- **punktgenaue Koordinaten** privater Spots, solange `coordsPublic: false` gesetzt ist

Vor dem ersten Push lohnt ein Blick auf `git status`, ob wirklich nur Gewolltes drin ist.

---

## Rechtliches

Die Rechtsteile unter `/wissen` sind eine private Zusammenfassung und **keine Rechtsberatung**.
Verbindlich sind die geltenden Gesetze und die amtlichen Auskünfte — für Geo-Zonen dipul, für
Registrierung und Kompetenznachweis das Luftfahrt-Bundesamt.

Impressum und Datenschutzerklärung sind als Gerüst angelegt. Die mit `AUSFÜLLEN` markierten
Felder müssen vor der Veröffentlichung ersetzt werden.

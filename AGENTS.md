# AGENTS.md

Konventionen für automatisierte Beiträge zu diesem Projekt. Die ausführliche Fassung steht in
[CLAUDE.md](CLAUDE.md); dieses Dokument fasst zusammen, was in jedem Fall gilt.

## Projekt

Persönliches FPV-Logbuch. Astro 5, statisch, TypeScript strict, handgeschriebenes CSS.
Ziel ist GitHub Pages unter `guidokl.github.io/voidfpv`. Seiteninhalt auf **Deutsch**.

```bash
npm run dev      # http://localhost:4321/voidfpv
npm run build    # astro check + build — muss vor jedem Commit durchlaufen
```

## Nicht verhandelbar

1. **Keine personenbezogenen Daten ins Repository.** Keine e-ID, keine PIN, keine
   Versicherungsnummern, keine Ausweisdokumente, keine punktgenauen Koordinaten privater Spots.
   Die PDFs unter `MyDocs/` bleiben per `.gitignore` ausgeschlossen.
2. **Keine unverifizierten Fakten.** URLs, Kanalnamen, Videotitel und Jahreszahlen werden vor
   der Aufnahme geprüft und mit Prüfdatum versehen. Was sich nicht bestätigen lässt, kommt
   nicht rein.
3. **Kein Utility-CSS-Framework, kein UI-Framework.** Styling über die Tokens in
   `src/styles/tokens.css`, Interaktivität in Vanilla-TypeScript.
4. **Interne Links über `href()`** aus `src/lib/format.ts`, nie hartkodiert — sonst brechen
   sie auf GitHub Pages.
5. **Rechtliche Inhalte** bleiben als „keine Rechtsberatung" gekennzeichnet.

## Struktur

| Ort | Inhalt |
|---|---|
| `src/content/` | Inhalte: Markdown für Text, JSON für Listen |
| `src/content.config.ts` | Zod-Schemas — neue Felder hier zuerst |
| `src/lib/stats.ts` | alle abgeleiteten Kennzahlen, einzige Quelle |
| `src/lib/gono.ts` | Grenzwerte des Wetter-Urteils in `LIMITS` |
| `src/styles/tokens.css` | Farben, Abstände, Typografie, Motion |
| `TODO.md` | offene Ideen |

## Stil

Kommentare und Texte in ganzen deutschen Sätzen. Kommentare erklären den Grund, nicht die
Syntax. Neue Komponenten folgen dem vorhandenen Vokabular: Ecken-Ticks statt Radien,
Mono-Labels in Versalien, Statusfarben nur für Status.

Vor dem Commit `npm run build` ausführen — Schema-Fehler und Typfehler brechen den Build
absichtlich.

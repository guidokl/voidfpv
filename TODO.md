# TODO / Ideen

Sammelstelle für alles, was noch nicht gebaut ist. Nicht priorisiert nach Reihenfolge,
sondern nach Aufwand und Nutzen. Erledigtes wandert nach unten unter „Erledigt".

Legende: **[S]** klein (unter 1 h) · **[M]** mittel · **[L]** groß / eigenes Projekt

---

## Von Guido

### Blog-Bereich [M]
Kleiner Journal-Bereich, in dem mal ein Foto, mal ein kurzer Text, mal beides landet —
niedrigere Schwelle als ein ausformulierter Bericht.

*Umsetzungsidee:* Eigene Collection `journal` mit optionalem Bild und freiem Text, dazu
ein `kind`-Feld (`foto` | `notiz` | `link` | `clip`). Darstellung als chronologischer
Stream mit unterschiedlich hohen Karten, keine Titelzwang. Abgrenzung zu `/berichte`:
Berichte sind lange Texte mit Aufbau, das Journal ist der Zettel dazwischen.

### Foren, Reddits, Communities ins Linkverzeichnis [S]
Ist im Linkverzeichnis als Kategorie angelegt und wird beim Ausbau gefüllt.
Kandidaten zum Prüfen: deutschsprachige FPV-Foren, die einschlägigen Subreddits,
Discord-Server der Hersteller, lokale Modellflug-Gruppen.
**Regel bleibt:** jede URL vor Aufnahme aufrufen, `lastChecked` setzen.

### Direkte Karten-Einbettung [M]
Aktuell bewusst nur Deep-Links zu dipul und DrohnenAtlas, weil ein nachgebauter Layer
falsche Sicherheit erzeugt.

*Was trotzdem geht:* Eine eigene Spot-Karte auf OpenStreetMap-Basis (Leaflet oder
MapLibre, selbst gehostet) — sie zeigt **die eigenen Spots**, nicht die Geo-Zonen, und
verlinkt pro Spot direkt in dipul mit vorbelegten Koordinaten. Damit gibt es eine Karte,
ohne die amtliche Auskunft zu imitieren.
*Zu klären:* Tiles von wo (OSM-Policy beachten), Datenschutz bei fremden Tile-Servern,
Marker nur für Spots mit `coordsPublic: true`.

### Automatischer Flug-Log-Transfer [L]
DJI-Flugprotokolle automatisch ins Flugbuch übernehmen, statt jeden Flug zu tippen.

*Realistischer Weg:* Airdata UAV kann DJI-Logs importieren und als CSV exportieren.
Ein kleines Node-Skript liest den Export und erzeugt Markdown-Dateien in
`src/content/flights/` — mit Datum, Flugzeit, Höhe, Distanz. Der Text bleibt manuell,
die Zahlen kommen automatisch.
*Alternative:* `.txt`-Logs direkt aus DJI Fly parsen — Format ist verschlüsselt und
undokumentiert, deshalb eher über Airdata.
*Vorher zu prüfen:* Welche Felder der Export wirklich liefert, sobald die Drohne da ist.

---

## Eigene Vorschläge

### Wetter automatisch zum Flug speichern [M]
Open-Meteo hat eine Archiv-API für historische Werte. Beim Anlegen eines Flugs könnte
ein Skript Wind, Böen, Temperatur und Bewölkung des Flugtages nachladen und ins
Frontmatter schreiben. Nach ein paar Monaten steht damit schwarz auf weiß da, bei
welchen Bedingungen es gut lief und bei welchen nicht.

### Volltextsuche [M]
Pagefind erzeugt beim Build einen statischen Suchindex — passt zu GitHub Pages, kein
Server nötig. Ab etwa 30 Inhaltsseiten lohnt sich das spürbar.

### Offline-fähige Checklisten [M]
Service Worker, der Checklisten, Failsafe-Karte und Papierkram-Status offline vorhält.
Genau die Seiten, die am Spot gebraucht werden — und dort ist oft kein Netz.

### Kosten- und Wartungslog [M]
Zwei Dinge, die im ersten Jahr überraschen:
- **Kosten kumuliert** — Anschaffung, Verbrauchsmaterial, Crashkosten in einer Summe
- **Wartung** — welcher Propellersatz wann getauscht wurde, Akkuzyklen pro Akku

Beides passt als schlanke Collection und ergibt später ehrliche Zahlen statt Gefühl.

### Flugbuch-Export [S]
CSV- oder Druckansicht des Flugbuchs. Praktisch, wenn ein Verband oder eine
Versicherung Flugstunden sehen will.

### RSS-Feed für Berichte und Journal [S]
`@astrojs/rss`, ein paar Zeilen. Kostet nichts und macht die Seite abonnierbar.

### Eigene Clips einbetten [M]
Sobald Material da ist: Frage klären, ob Videos self-hosted laufen (Bandbreite und
Repo-Größe auf GitHub Pages beachten) oder über YouTube mit der Zwei-Klick-Lösung wie
im Szene-Bereich.

### Gyroflow-Workflow dokumentieren [S]
Sobald das erste Material durch die Nachbearbeitung ging: Schritte festhalten, solange
sie frisch sind. Später ist das der meistgelesene eigene Text.

### Betaflight-Dokumentation [M]
Wenn der erste eigene Build kommt: Rates, PID-Änderungen, Failsafe-Einstellungen und
Blackbox-Erkenntnisse pro Modell festhalten. Am besten als Collection, nicht als eine
lange Seite.

### Erste-Hilfe- und Etikette-Karte [S]
Zwei unspektakuläre, aber sinnvolle Abschnitte: was bei einer Schnittverletzung durch
Propeller zu tun ist, und wie man sich gegenüber Spaziergängern, Nachbarn und Tieren
verhält, bevor jemand die Polizei ruft.

---

## Erledigt

- Grundgerüst Astro 5, statisch, GitHub-Pages-tauglich
- Design-System „OSD" (Tokens, Rail, Top-Bar, Panels, Status-LEDs)
- Wissensbasis aus `MyDocs/Avata-2-Pilot-Guide.md` überführt

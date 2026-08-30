export interface Term {
  term: string;
  def: string;
  group: 'fliegen' | 'technik' | 'recht';
}

/** Vokabular aus dem Pilot-Guide, ergaenzt um die Begriffe rund um eigene Builds. */
export const GLOSSARY: Term[] = [
  { term: 'FPV', group: 'fliegen', def: 'First Person View — fliegen mit Livebild in der Brille statt mit Blick auf die Drohne.' },
  { term: 'LOS / VLOS', group: 'recht', def: 'Visual Line of Sight: die Drohne ist mit bloßem Auge sichtbar. Grundvoraussetzung in der Open-Kategorie.' },
  { term: 'BVLOS', group: 'recht', def: 'Beyond VLOS — außer Sicht. In der Open-Kategorie grundsätzlich verboten.' },
  { term: 'Spotter / UA-Observer', group: 'recht', def: 'Person neben dem Piloten, die die Drohne durchgehend sieht und warnt. Bei FPV ohne Verbandsregeln Pflicht.' },
  { term: 'Cinewhoop', group: 'technik', def: 'Kleine FPV-Drohne mit Propellerschutz, ausgelegt auf Kamerafahrten in engen Räumen. Die Avata 2 gehört in diese Klasse.' },
  { term: 'Acro / Manual / M-Mode', group: 'fliegen', def: 'Unstabilisiertes Fliegen mit voller Stick-Kontrolle. Keine Selbstnivellierung, keine Höhenhaltung.' },
  { term: 'Rates', group: 'technik', def: 'Wie aggressiv die Drohne auf Stick-Ausschlag reagiert. Im Simulator grob an die echte Drohne anpassen, sonst überträgt das Training schlechter.' },
  { term: 'Expo', group: 'technik', def: 'Weicherer Mittelbereich der Sticks bei gleicher Maximalrate — feine Korrekturen werden leichter.' },
  { term: 'Throttle', group: 'fliegen', def: 'Gas beziehungsweise Höhenanteil. Im Manual-Modus die schwierigste Achse, weil sie nicht mehr von selbst hält.' },
  { term: 'Yaw / Pitch / Roll', group: 'fliegen', def: 'Gieren (drehen), Nicken (vor/zurück neigen), Rollen (seitlich kippen).' },
  { term: 'RockSteady / HorizonSteady', group: 'technik', def: 'Elektronische Stabilisierung im aufgenommenen Video. HorizonSteady hält zusätzlich den Horizont waagerecht.' },
  { term: 'Gimbal', group: 'technik', def: 'Mechanische Kamerastabilisierung. Die Avata 2 hat nur eine Achse, den Rest übernimmt die Elektronik.' },
  { term: 'O4 / OcuSync', group: 'technik', def: 'DJIs Digitalfunk für Bild und Steuerung. O4 ist die Generation der Avata 2 und der Air Units für eigene Builds.' },
  { term: 'Latency', group: 'technik', def: 'Verzögerung zwischen Kamera und Brille. Bei Goggles 3 rund 24 ms bei 1080p/100 — niedrig genug, dass Acro funktioniert.' },
  { term: 'RTH', group: 'fliegen', def: 'Return to Home — automatische Rückkehr zum Startpunkt. Im Wald mit Vorsicht: die eingestellte RTH-Höhe muss über die Baumkronen reichen.' },
  { term: 'Failsafe', group: 'fliegen', def: 'Verhalten bei Signalverlust. Wählbar zwischen RTH, Hover und Landung — im Wald ist Hover oft die klügere Wahl.' },
  { term: 'Turtle-Mode', group: 'fliegen', def: 'Aufrichten nach Rückenlage über die Motoren, ohne zur Drohne laufen zu müssen.' },
  { term: 'Prop-Guard', group: 'technik', def: 'Propellerschutz. Bei der Avata 2 fest integriert — schützt Umgebung und Props, ersetzt aber keine Vorsicht.' },
  { term: 'C0–C4', group: 'recht', def: 'EU-Geräteklassen für Drohnen. Die Avata 2 ist C1.' },
  { term: 'Open A1 / A2 / A3', group: 'recht', def: 'Unterkategorien der offenen Betriebskategorie. C1 fliegt typischerweise in A1: nicht über Menschenansammlungen.' },
  { term: 'e-ID', group: 'recht', def: 'Betreibernummer vom LBA. Kommt sichtbar an die Drohne — ohne den geheimen PIN-Zusatz.' },
  { term: 'Remote-ID', group: 'recht', def: 'Elektronisches Kennzeichen, das im Flug gesendet wird. Bei C1 Pflicht, muss zusätzlich in DJI Fly eingetragen werden.' },
  { term: 'dipul', group: 'recht', def: 'Offizielle deutsche Karte der Geo-Zonen. Die amtliche Quelle — Apps sind Komfort, dipul ist die Entscheidung.' },
  { term: 'NOTAM', group: 'recht', def: 'Temporäre Luftraumbeschränkung, etwa bei Großveranstaltungen oder Einsätzen.' },
  { term: 'Kp-Index', group: 'technik', def: 'Maß für geomagnetische Aktivität. Hohe Werte bedeuten schlechteres GNSS und unruhigere Positionshaltung.' },
  { term: 'Panoramafreiheit', group: 'recht', def: '§ 59 UrhG — Aufnahmen öffentlich stehender Werke vom Straßenniveau. Gilt nach BGH 2024 ausdrücklich nicht aus der Luft.' },
  { term: 'KUG / KunstUrhG', group: 'recht', def: 'Recht am eigenen Bild. Regelt, wann erkennbare Personen veröffentlicht werden dürfen.' },
  { term: 'Lost Place', group: 'recht', def: 'Verlassener, meist privater Ort. Betreten und Befliegen nur mit Erlaubnis des Verfügungsberechtigten.' },
  { term: 'BNF / PNP', group: 'technik', def: 'Bind-and-Fly beziehungsweise Plug-and-Play. BNF ist fertig gebaut und gebunden, PNP braucht noch Empfänger oder Air Unit.' },
  { term: 'Air Unit', group: 'technik', def: 'Sende-Einheit für Bild und Steuerung in einer selbst gebauten Drohne. Bei DJI die Voraussetzung, um vorhandene Goggles weiterzuverwenden.' },
  { term: 'ELRS', group: 'technik', def: 'ExpressLRS — offener Funkstandard für die Steuerung. Bei einem DJI-Steuerlink nicht zwingend nötig.' },
  { term: 'Betaflight', group: 'technik', def: 'Open-Source-Flugsoftware für selbst gebaute Quads. Rates, PIDs, Failsafe und Blackbox werden dort konfiguriert.' },
  { term: 'Blackbox', group: 'technik', def: 'Flugdatenaufzeichnung in Betaflight. Grundlage fürs Tuning, wenn ein Quad zittert oder Motoren heiß werden.' },
  { term: 'Smoke Stopper', group: 'technik', def: 'Strombegrenzer für den ersten Einschaltversuch nach dem Löten. Verhindert, dass ein Kurzschluss den Regler zerstört.' },
];

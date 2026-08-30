export interface CheckItem {
  id: string;
  text: string;
  note?: string;
}

export interface CheckList {
  id: string;
  title: string;
  intro: string;
  /** einmalig = bleibt abgehakt, wiederkehrend = wird vor jedem Flug zurueckgesetzt */
  kind: 'einmalig' | 'wiederkehrend' | 'referenz';
  items: CheckItem[];
}

export const CHECKLISTS: CheckList[] = [
  {
    id: 'einmalig',
    title: 'Einmalig erledigen',
    kind: 'einmalig',
    intro: 'Reihenfolge einhalten: Die LBA-Registrierung fragt die Versicherungsnummer ab.',
    items: [
      { id: 'haftpflicht', text: 'Drohnen-Haftpflicht abschließen', note: 'DMO, ab ca. 40 €/Jahr — nicht die normale Privathaftpflicht' },
      { id: 'police', text: 'Police und Vertragsnummer als PDF sichern' },
      { id: 'lba', text: 'LBA-Betreiberregistrierung (20 €)', note: 'Ausweis, Versicherungsgesellschaft und -nummer bereithalten' },
      { id: 'eid-kleben', text: 'e-ID-Aufkleber an der Drohne anbringen', note: 'Nur den sichtbaren Teil, ohne PIN-Zusatz' },
      { id: 'eid-fly', text: 'e-ID in DJI Fly eintragen (Remote Identification)' },
      { id: 'a1a3', text: 'A1/A3-Kompetenznachweis ablegen (25 €)', note: '40 Fragen, 75 % zum Bestehen, 5 Jahre gültig' },
      { id: 'apps', text: 'dipul, DrohnenAtlas und UAV Forecast einrichten' },
      { id: 'firmware', text: 'Firmware von Drohne, Goggles und Controller aktualisieren' },
      { id: 'care', text: 'DJI Care Refresh abwägen', note: 'Deckt eigene Schäden, ist keine Haftpflicht' },
    ],
  },
  {
    id: 'vor-dem-flug',
    title: 'Vor jedem Flug',
    kind: 'wiederkehrend',
    intro: 'Zwei Minuten, die den Unterschied zwischen Hobby und Anzeige ausmachen.',
    items: [
      { id: 'dipul', text: 'dipul oder DrohnenAtlas prüfen', note: 'Naturschutz, Flugplatzkreise, Höhenbeschränkung' },
      { id: 'wetter', text: 'Wind, Böen, Sicht und Kp-Index checken', note: 'Böen über 8–10 m/s: draußen lassen, besonders im Wald' },
      { id: 'umfeld', text: 'Umfeld einschätzen: Wanderer, Jagd, Tiere' },
      { id: 'spotter', text: 'FPV-Regel klären: unter 30 m mit Verband, sonst Spotter' },
      { id: 'akkus', text: 'Akkus geladen, Props geprüft, Gimbal-Schutz ab' },
      { id: 'limits', text: 'Höhen- und Distanzlimit gesetzt' },
      { id: 'landeplatz', text: 'Not-Landefläche festgelegt' },
    ],
  },
  {
    id: 'packliste',
    title: 'Packliste',
    kind: 'wiederkehrend',
    intro: 'Was in die Tasche gehört, bevor die Haustür zufällt.',
    items: [
      { id: 'drohne', text: 'Drohne + 3 Akkus + Ladehub + Netzteil' },
      { id: 'goggles', text: 'Goggles + Controller + USB-C-Kabel' },
      { id: 'props', text: '2–3 Propeller-Sets extra', note: '3032S, CW und CCW nicht verwechseln' },
      { id: 'werkzeug', text: 'Kreuzschlitz, Prop-Tool, Mikrofasertuch, Klett oder Gummi' },
      { id: 'sd', text: 'microSD U3/V30 plus Ersatzkarte' },
      { id: 'powerbank', text: 'Powerbank für die Goggles' },
      { id: 'papiere', text: 'Police und e-ID offline als Screenshot' },
      { id: 'optional', text: 'Optional: ND-Filter, Ersatz-Gimbal-Schutz, Taschenlampe' },
    ],
  },
  {
    id: 'einschalten',
    title: 'Einschaltreihenfolge',
    kind: 'wiederkehrend',
    intro: 'Immer gleich, immer in dieser Folge.',
    items: [
      { id: 'e1', text: 'Goggles einschalten' },
      { id: 'e2', text: 'Controller einschalten' },
      { id: 'e3', text: 'Drohne einschalten', note: 'Flach, frei, nicht auf Metall' },
      { id: 'e4', text: 'Firmware-Hinweise prüfen' },
      { id: 'e5', text: 'Remote-ID und e-ID kontrollieren' },
      { id: 'e6', text: 'Kompass/IMU nur kalibrieren, wenn die App es verlangt' },
      { id: 'e7', text: 'Höhen- und Distanzlimit setzen' },
      { id: 'e8', text: 'Props fest, Schutz vollständig, Gimbal frei' },
      { id: 'e9', text: 'dipul final prüfen, dann starten' },
    ],
  },
  {
    id: 'nach-dem-flugtag',
    title: 'Nach dem Flugtag',
    kind: 'wiederkehrend',
    intro: 'Fünf Minuten Wartung, die Reparaturen verhindern.',
    items: [
      { id: 'props-check', text: 'Props auf Risse und Verbiegungen prüfen' },
      { id: 'gitter', text: 'Schutzgitter auf Vollständigkeit prüfen' },
      { id: 'linse', text: 'Kamera und Gimbal entstauben' },
      { id: 'akku-check', text: 'Akkus auf Beulen prüfen, Kontakte trocken halten' },
      { id: 'lagerstand', text: 'Akkus auf Lagerstand bringen, wenn es länger dauert' },
      { id: 'export', text: 'Material exportieren, internen Speicher leeren' },
      { id: 'format', text: 'Speicherkarte in der Drohne formatieren, nicht am PC' },
      { id: 'logbuch', text: 'Flug ins Flugbuch eintragen' },
    ],
  },
];

/** Keine Checkliste, sondern eine Karte zum Nachschlagen im Feld. */
export const FAILSAFE: { situation: string; action: string }[] = [
  { situation: 'Übelkeit', action: 'Sofort Hover oder Landung, Brille runter. Nicht durchhalten.' },
  { situation: 'Signal wird dünn', action: 'Umdrehen, Höhe reduzieren. Nicht tiefer in Beton oder Wald hinein.' },
  { situation: 'Crash auf dem Rücken', action: 'Turtle-Mode nutzen. Nicht sofort zu den Props greifen.' },
  { situation: 'Drohne im Baum', action: 'Motoren aus. Nicht nachziehen, nicht freifliegen. Leiter und Erlaubnis holen.' },
  { situation: 'Leute tauchen auf', action: 'Landen. Nicht über sie hinwegfliegen, auch nicht kurz.' },
  { situation: 'Akku kritisch', action: 'Direkt landen. Kein "noch eine Linie".' },
  { situation: 'GPS unruhig / Kp hoch', action: 'Tiefer und näher bleiben, Positionshaltung nicht vertrauen.' },
  { situation: 'Böen nehmen zu', action: 'Session beenden. Der Wind wird selten wieder besser.' },
];

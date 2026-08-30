export interface Phase {
  id: string;
  index: string;
  title: string;
  scope: string;
  goal: string;
  steps: string[];
  /** Woran man merkt, dass die Phase sitzt */
  done: string;
  state: 'active' | 'next' | 'later';
}

export const LERNPFAD: Phase[] = [
  {
    id: 'phase-0',
    index: '00',
    title: 'Papier und App',
    scope: 'vor dem ersten Akku',
    goal: 'Alles Formale steht, bevor die Drohne überhaupt ankommt.',
    steps: [
      'Drohnen-Haftpflicht abschließen — Empfehlung DMO, ca. 40 €/Jahr inklusive DMFV-Verbandsregeln',
      'LBA-Betreiberregistrierung (20 €) → e-ID',
      'e-ID aufkleben und zusätzlich in DJI Fly unter Remote Identification eintragen',
      'A1/A3-Online-Test (25 €, rund 40 Fragen, 5 Jahre gültig)',
      'dipul und DrohnenAtlas aufs Handy',
      'Firmware von Drohne, Goggles und Controller aktualisieren',
      'microSD U3/V30 besorgen, Props prüfen, Care Refresh abwägen',
    ],
    done: 'Police, e-ID und Kompetenznachweis liegen digital in der Tasche — offline abrufbar.',
    state: 'active',
  },
  {
    id: 'phase-1',
    index: '01',
    title: 'Boden und Simulator',
    scope: '0–5 Stunden',
    goal: 'Die Handgriffe sitzen, bevor etwas fliegt, das kaputtgehen kann.',
    steps: [
      'Tutorial in den Goggles durchklicken',
      'Arming, Disarming und Brake üben — Drohne in der Hand oder auf der Wiese',
      'Motion Sickness antesten: sitzend, 3–5 Minuten, Pause, Horizont im Blick',
      'Simulator parallel starten, besonders bevor der FPV RC 3 zum ersten Mal fliegt',
    ],
    done: 'Die Lock-Taste wird ohne Nachdenken getroffen.',
    state: 'active',
  },
  {
    id: 'phase-2',
    index: '02',
    title: 'Offenes Feld, Normal-Modus',
    scope: '5–15 Akkus',
    goal: 'Distanzgefühl und bewusstes Bremsen.',
    steps: [
      'Großes leeres Feld, kein Naturschutzgebiet, dipul grün',
      'Höhe zunächst auf 15–30 m begrenzen',
      'Rechtecke, Achten, langsames Vorwärtsfliegen — und bewusst bremsen',
      'Start und Landung mit Blick zur Drohne, RealView nutzen',
      'Unter 30 m mit Verbandsregeln allein möglich, darüber Spotter',
    ],
    done: 'Die Drohne steht dort, wo sie stehen soll — ohne Korrekturruckeln.',
    state: 'next',
  },
  {
    id: 'phase-3',
    index: '03',
    title: 'Lost Places und Indoor',
    scope: 'nach dem offenen Feld',
    goal: 'Enge Räume mit ruhiger Hand und geplantem Ausweg.',
    steps: [
      'Nur legaler Zugang, Erlaubnis des Eigentümers schriftlich einholen',
      'Normal-Modus, wenig Gas — der Prop-Schutz hilft, ersetzt aber keine Vorsicht',
      'Dunkle, spiegelnde oder strukturlose Böden machen den Hover unruhig',
      'Keine Menschen im Flugweg, Not-Landefläche vorher festlegen',
      'Erste Sessions kurz halten — Übelkeit und Orientierung',
    ],
    done: 'Eine Halle wird durchflogen, ohne einmal die Orientierung zu verlieren.',
    state: 'later',
  },
  {
    id: 'phase-4',
    index: '04',
    title: 'Waldlinien im Sport-Modus',
    scope: 'wenn Bremsen sitzt',
    goal: 'Tempo zwischen Hindernissen, noch mit Unterstützung.',
    steps: [
      'Weite Schneisen wählen, nicht dichten Jungwald',
      'Sport erst, wenn Brake und Distanzgefühl wirklich sitzen',
      'Ersatzpropeller immer dabei — Bäume fressen Props und Arme',
    ],
    done: 'Eine Linie wird zweimal gleich geflogen, nicht zufällig einmal.',
    state: 'later',
  },
  {
    id: 'phase-5',
    index: '05',
    title: 'Manual / Acro',
    scope: 'nach 15–20 Simulatorstunden',
    goal: 'Volle Kontrolle, volles Risiko — bewusst zuletzt.',
    steps: [
      'FPV RC 3 im Simulator einfliegen: Hover, Achten, Sinkflugkurven, dann Gaps',
      'Erste echte Manual-Flüge hoch über Gras, nicht zwischen Bäumen',
      'Turtle-Mode kennen, bevor er gebraucht wird',
      'Motion 3 bleibt für cineastische Lost-Place-Flüge nützlich — kein Entweder-oder',
    ],
    done: 'Hover und Achten im Simulator sind langweilig geworden.',
    state: 'later',
  },
];

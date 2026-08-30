/**
 * Navigationsstruktur der Seite.
 * Eine Quelle für Rail, Mobile-Drawer, Breadcrumb und Tab-Bars.
 */

export interface NavTab {
  label: string;
  /** Anker innerhalb der Sektionsseite oder absoluter Pfad für eigene Unterseiten */
  href: string;
}

export interface NavItem {
  /** Zweistelliger Index, so wie er in der Rail steht */
  index: string;
  label: string;
  /** Pfad ohne base */
  path: string;
  /** Kurzbeschreibung, erscheint als title-Attribut und im Seitenkopf */
  blurb: string;
  tabs?: NavTab[];
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV: NavGroup[] = [
  {
    label: 'Basis',
    items: [
      {
        index: '01',
        label: 'Status',
        path: '/',
        blurb: 'Wo der Einstieg gerade steht: Hardware, Papiere, nächster Schritt.',
      },
      {
        index: '02',
        label: 'Hangar',
        path: '/hangar',
        blurb: 'Fluggerät, Brille, Controller, Akkus — Datenblätter und Status.',
        tabs: [
          { label: "Übersicht", href: '#uebersicht' },
          { label: 'Avata 2', href: '#avata-2' },
          { label: 'Goggles', href: '#goggles' },
          { label: 'Controller', href: '#controller' },
          { label: "Akkus & Zubehör", href: '#zubehoer' },
          { label: 'Geplant', href: '#geplant' },
        ],
      },
    ],
  },
  {
    label: 'Einsatz',
    items: [
      {
        index: '03',
        label: 'Wetter',
        path: '/wetter',
        blurb: 'Pre-Flight-Briefing: Wind, Böen, Bedingungen, Luftraum, Spots.',
        tabs: [
          { label: 'Briefing', href: '#briefing' },
          { label: 'Wind', href: '#wind' },
          { label: 'Bedingungen', href: '#bedingungen' },
          { label: 'Luftraum & Spots', href: '#luftraum' },
        ],
      },
      {
        index: '04',
        label: 'Tools',
        path: '/tools',
        blurb: 'PC-Programme und Apps: Pflicht, Wetter, Sim, Schnitt, Analyse.',
      },
      {
        index: '05',
        label: 'Sim',
        path: '/sim',
        blurb: 'Simulator-Training am PC — Vergleich, Setup, Trainingsplan, Logbuch.',
        tabs: [
          { label: 'Warum Sim', href: '#warum' },
          { label: 'Vergleich', href: '#vergleich' },
          { label: 'Setup', href: '#setup' },
          { label: 'Trainingsplan', href: '#plan' },
          { label: 'Logbuch', href: '#logbuch' },
        ],
      },
      {
        index: '06',
        label: 'Checks',
        path: '/checklisten',
        blurb: 'Abhakbare Checklisten: einmalig, vor dem Flug, Packliste, Failsafe.',
      },
    ],
  },
  {
    label: 'Logbuch',
    items: [
      {
        index: '07',
        label: 'Flugbuch',
        path: '/flugbuch',
        blurb: 'Jeder Flug mit Ort, Modus, Akkus, Bedingungen und Vorkommnissen.',
      },
      {
        index: '08',
        label: 'Berichte',
        path: '/berichte',
        blurb: 'Längere Texte: Sessions, Lost Places, Lernkurven, Fehlschläge.',
      },
      {
        index: '09',
        label: 'Galerie',
        path: '/galerie',
        blurb: 'Fotos und Clips aus der Luft.',
      },
    ],
  },
  {
    label: 'Referenz',
    items: [
      {
        index: '10',
        label: 'Wissen',
        path: '/wissen',
        blurb: 'Die gesammelte Wissensbasis: Technik, Begriffe, Lernpfad, Recht, Praxis.',
      },
      {
        index: '11',
        label: 'Werkstatt',
        path: '/werkstatt',
        blurb: 'Der Weg zu 3" und 5": BNF, PNP, Selbstbau, Löten, Teile.',
        tabs: [
          { label: 'Ausbau-Pfad', href: '#pfad' },
          { label: 'DJI-kompatibel', href: '#dji' },
          { label: '3" vs 5"', href: '#klassen' },
          { label: "Löten & Werkzeug", href: '#werkzeug' },
          { label: 'Teileliste', href: '#teile' },
        ],
      },
      {
        index: '12',
        label: 'Papiere',
        path: '/papierkram',
        blurb: 'Versicherung, LBA-Registrierung, e-ID, A1/A3 — Reihenfolge und Stand.',
      },
    ],
  },
  {
    label: 'Szene',
    items: [
      {
        index: '13',
        label: 'Legenden',
        path: '/legenden',
        blurb: 'Piloten, legendäre Clips und Filme, die den Sport geprägt haben.',
        tabs: [
          { label: 'Piloten', href: '#piloten' },
          { label: 'Clips', href: '#clips' },
          { label: 'Filme & Dokus', href: '#filme' },
        ],
      },
      {
        index: '14',
        label: 'Links',
        path: '/links',
        blurb: 'Shops, Communities, Lernquellen, Behörden und Hersteller.',
      },
    ],
  },
];

/** Flache Liste aller Einträge */
export const NAV_FLAT: NavItem[] = NAV.flatMap((g) => g.items);

/** Findet den Nav-Eintrag zu einem Pfad (ohne base, ohne trailing slash) */
export function findNavItem(path: string): NavItem | undefined {
  const clean = normalizePath(path);
  return NAV_FLAT.find((i) => normalizePath(i.path) === clean);
}

/** Gruppe, in der ein Eintrag steht */
export function findNavGroup(path: string): NavGroup | undefined {
  const clean = normalizePath(path);
  return NAV.find((g) => g.items.some((i) => normalizePath(i.path) === clean));
}

export function normalizePath(p: string): string {
  const stripped = p.replace(/\/+$/, '');
  return stripped === '' ? '/' : stripped;
}

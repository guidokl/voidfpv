/** Kleine Helfer für Pfade, Zahlen und Datumsangaben. Bewusst ohne Abhängigkeiten. */

/**
 * Hängt den konfigurierten base-Pfad an einen internen Pfad.
 * Immer benutzen — sonst brechen alle Links auf GitHub Pages.
 */
export function href(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
  if (!path.startsWith('/')) return path; // extern oder Anker
  return path === '/' ? base + '/' : base + path;
}

/** Ist der aktuelle Pfad (aus Astro.url.pathname) dieser Nav-Eintrag? */
export function isActive(currentPathname: string, navPath: string): boolean {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
  const current = currentPathname.replace(base, '').replace(/\/+$/, '') || '/';
  const target = navPath.replace(/\/+$/, '') || '/';
  if (target === '/') return current === '/';
  return current === target || current.startsWith(target + '/');
}

const DE = 'de-DE';

export function fmtDate(d: Date | string, opts?: Intl.DateTimeFormatOptions): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return new Intl.DateTimeFormat(DE, opts ?? { day: '2-digit', month: '2-digit', year: 'numeric' })
    .format(date);
}

/** Kompaktes Log-Datum: 2026-08-30 */
export function fmtIso(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toISOString().slice(0, 10);
}

export function fmtNum(n: number, digits = 1): string {
  return new Intl.NumberFormat(DE, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(n);
}

/** Minuten -> "4 h 20 min" bzw. "45 min" */
export function fmtDuration(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

export function msToKmh(ms: number): number {
  return ms * 3.6;
}

/** Beaufort-Stufe aus Windgeschwindigkeit in m/s */
export function beaufort(ms: number): number {
  const limits = [0.3, 1.6, 3.4, 5.5, 8.0, 10.8, 13.9, 17.2, 20.8, 24.5, 28.5, 32.7];
  for (let i = 0; i < limits.length; i++) {
    if (ms < limits[i]!) return i;
  }
  return 12;
}

const DIRS = ['N', 'NNO', 'NO', 'ONO', 'O', 'OSO', 'SO', 'SSO', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];

/** Gradzahl -> Himmelsrichtung (deutsche Kuerzel, O statt E) */
export function windDir(deg: number): string {
  return DIRS[Math.round(((deg % 360) / 22.5)) % 16]!;
}

/** Tage zwischen heute und einem Datum (positiv = Vergangenheit) */
export function daysSince(d: Date | string): number {
  const date = typeof d === 'string' ? new Date(d) : d;
  return Math.floor((Date.now() - date.getTime()) / 86_400_000);
}

/** Koordinaten auf ~1 km runden, damit private Spots nicht punktgenau im HTML stehen */
export function coarse(coord: number): number {
  return Math.round(coord * 100) / 100;
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

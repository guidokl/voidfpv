/**
 * Sonnenstände lokal gerechnet — kein API-Aufruf, keine Abhängigkeit.
 * Verfahren nach der klassischen Sunrise-Equation (NOAA / SunCalc-Ansatz).
 * Genauigkeit liegt im Minutenbereich; für Flugplanung mehr als ausreichend.
 */

const RAD = Math.PI / 180;
const DAY_MS = 86_400_000;
const J1970 = 2_440_588;
const J2000 = 2_451_545;
const J0 = 0.0009;
/** Schiefe der Ekliptik */
const OBLIQUITY = 23.4397 * RAD;

const toJulian = (date: Date) => date.valueOf() / DAY_MS - 0.5 + J1970;
const fromJulian = (j: number) => new Date((j + 0.5 - J1970) * DAY_MS);
const toDays = (date: Date) => toJulian(date) - J2000;

const solarMeanAnomaly = (d: number) => RAD * (357.5291 + 0.98560028 * d);

const eclipticLongitude = (M: number) => {
  // Mittelpunktsgleichung
  const C = RAD * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));
  const P = RAD * 102.9372; // Perihel der Erde
  return M + C + P + Math.PI;
};

const declination = (L: number) => Math.asin(Math.sin(OBLIQUITY) * Math.sin(L));

const julianCycle = (d: number, lw: number) => Math.round(d - J0 - lw / (2 * Math.PI));

const approxTransit = (Ht: number, lw: number, n: number) => J0 + (Ht + lw) / (2 * Math.PI) + n;

const solarTransitJ = (ds: number, M: number, L: number) =>
  J2000 + ds + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L);

const hourAngle = (h: number, phi: number, dec: number) =>
  Math.acos(
    (Math.sin(h) - Math.sin(phi) * Math.sin(dec)) / (Math.cos(phi) * Math.cos(dec)),
  );

/** Sonnenhöhen in Grad, für die Zeiten berechnet werden */
const ANGLES = {
  /** Sonnenmitte am Horizont inkl. Refraktion */
  horizon: -0.833,
  /** bürgerliche Dämmerung — Grenze der blauen Stunde */
  civil: -6,
  /** oberes Ende der goldenen Stunde */
  golden: 6,
} as const;

export interface SunTimes {
  sunrise: Date | null;
  sunset: Date | null;
  /** Ende der morgendlichen goldenen Stunde */
  goldenEndMorning: Date | null;
  /** Beginn der abendlichen goldenen Stunde */
  goldenStartEvening: Date | null;
  /** Beginn der morgendlichen blauen Stunde (bürgerliche Dämmerung) */
  dawn: Date | null;
  /** Ende der abendlichen blauen Stunde */
  dusk: Date | null;
  /** Sonnenhöchststand */
  noon: Date | null;
}

/**
 * Liefert die relevanten Sonnenzeiten für einen Tag und Ort.
 * Bei Polartag oder Polarnacht sind einzelne Werte null — der aufrufende Code
 * muss damit umgehen, statt NaN anzuzeigen.
 */
export function sunTimes(date: Date, lat: number, lon: number): SunTimes {
  const lw = RAD * -lon;
  const phi = RAD * lat;
  const d = toDays(date);

  const n = julianCycle(d, lw);
  const ds = approxTransit(0, lw, n);
  const M = solarMeanAnomaly(ds);
  const L = eclipticLongitude(M);
  const dec = declination(L);
  const Jnoon = solarTransitJ(ds, M, L);

  const timeFor = (angleDeg: number, rising: boolean): Date | null => {
    const w = hourAngle(RAD * angleDeg, phi, dec);
    if (Number.isNaN(w)) return null; // Sonne geht an diesem Tag nicht durch diese Höhe
    const a = approxTransit(w, lw, n);
    const set = solarTransitJ(a, M, L);
    return fromJulian(rising ? Jnoon * 2 - set : set);
  };

  return {
    sunrise: timeFor(ANGLES.horizon, true),
    sunset: timeFor(ANGLES.horizon, false),
    goldenEndMorning: timeFor(ANGLES.golden, true),
    goldenStartEvening: timeFor(ANGLES.golden, false),
    dawn: timeFor(ANGLES.civil, true),
    dusk: timeFor(ANGLES.civil, false),
    noon: fromJulian(Jnoon),
  };
}

/** Ist es zum Zeitpunkt hell genug für einen Flug in der Open-Kategorie? */
export function isDaylight(at: Date, lat: number, lon: number): boolean {
  const t = sunTimes(at, lat, lon);
  if (!t.sunrise || !t.sunset) return false;
  return at >= t.sunrise && at <= t.sunset;
}

/** Formatiert eine Uhrzeit, oder '—' wenn sie an diesem Tag nicht existiert */
export function fmtTime(d: Date | null): string {
  if (!d || Number.isNaN(d.valueOf())) return '—';
  return new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' }).format(d);
}

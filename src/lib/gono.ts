/**
 * Die Regel-Engine hinter dem GO / MARGINAL / NO-GO-Urteil.
 *
 * Alle Grenzwerte stehen an genau einer Stelle — hier. Wer sie ändern will,
 * ändert LIMITS, nicht die Oberfläche. Jede Regel liefert nicht nur einen
 * Status, sondern auch einen Klartext-Grund; das Urteil bleibt damit
 * nachvollziehbar statt orakelhaft.
 */

export type Verdict = 'go' | 'marginal' | 'nogo';

export interface Limits {
  /** Herstellerangabe Avata 2: Windwiderstand bis Stufe 5 */
  gustHard: number;
  /** Eigene Grenze: darüber im Wald unangenehm */
  gustSoft: number;
  windHard: number;
  windSoft: number;
  /** mm/h */
  rainHard: number;
  /** Prozent */
  rainProbSoft: number;
  /** Grad Celsius */
  tempCold: number;
  tempVeryCold: number;
  /** Meter */
  visHard: number;
  visSoft: number;
  /** Kp-Index */
  kpSoft: number;
  kpHard: number;
}

export const LIMITS: Limits = {
  gustHard: 10.7,
  gustSoft: 8,
  windHard: 10.7,
  windSoft: 8,
  rainHard: 0.2,
  rainProbSoft: 60,
  tempCold: 5,
  tempVeryCold: 0,
  visHard: 1000,
  visSoft: 5000,
  kpSoft: 5,
  kpHard: 7,
};

/** Eingangswerte einer Bewertung — alles optional, fehlende Werte werden übersprungen */
export interface Conditions {
  windMs?: number;
  gustMs?: number;
  precipMm?: number;
  precipProb?: number;
  tempC?: number;
  visibilityM?: number;
  weatherCode?: number;
  kp?: number;
  /** Tageslicht am bewerteten Zeitpunkt */
  daylight?: boolean;
}

export interface RuleResult {
  id: string;
  label: string;
  status: Verdict;
  /** Der gemessene Wert, fertig formatiert */
  value: string;
  /** Warum dieser Status — ein Satz, kein Fachchinesisch */
  reason: string;
}

/** WMO-Codes, die Gewitter bedeuten */
const THUNDER = [95, 96, 99];
/** WMO-Codes für Nebel */
const FOG = [45, 48];

const worst = (a: Verdict, b: Verdict): Verdict => {
  const rank = { go: 0, marginal: 1, nogo: 2 };
  return rank[a] >= rank[b] ? a : b;
};

const n1 = (v: number) => v.toFixed(1).replace('.', ',');

export function evaluate(c: Conditions, limits: Limits = LIMITS): {
  verdict: Verdict;
  rules: RuleResult[];
  /** Die Regel, die das Urteil bestimmt hat */
  driver: RuleResult | null;
} {
  const rules: RuleResult[] = [];

  if (c.gustMs != null) {
    const status: Verdict =
      c.gustMs >= limits.gustHard ? 'nogo' : c.gustMs >= limits.gustSoft ? 'marginal' : 'go';
    rules.push({
      id: 'gust',
      label: 'Böen',
      status,
      value: `${n1(c.gustMs)} m/s`,
      reason:
        status === 'nogo'
          ? `Über dem Windwiderstand der Avata 2 (${n1(limits.gustHard)} m/s). Nicht starten.`
          : status === 'marginal'
            ? `Über ${limits.gustSoft} m/s. Auf offenem Feld machbar, im Wald unangenehm bis riskant.`
            : 'Im ruhigen Bereich.',
    });
  }

  if (c.windMs != null) {
    const status: Verdict =
      c.windMs >= limits.windHard ? 'nogo' : c.windMs >= limits.windSoft ? 'marginal' : 'go';
    rules.push({
      id: 'wind',
      label: 'Mittelwind',
      status,
      value: `${n1(c.windMs)} m/s`,
      reason:
        status === 'nogo'
          ? 'Dauerwind über dem Limit — der Rückflug gegen den Wind frisst die Akkureserve.'
          : status === 'marginal'
            ? 'Spürbar. Näher bleiben und Reserve für den Rückweg einplanen.'
            : 'Unkritisch.',
    });
  }

  if (c.precipMm != null) {
    const status: Verdict = c.precipMm >= limits.rainHard ? 'nogo' : 'go';
    rules.push({
      id: 'rain',
      label: 'Niederschlag',
      status,
      value: `${n1(c.precipMm)} mm/h`,
      reason:
        status === 'nogo'
          ? 'Die Avata 2 ist nicht wasserdicht. Regen bedeutet nicht fliegen.'
          : 'Trocken.',
    });
  }

  if (c.precipProb != null && (c.precipMm ?? 0) < limits.rainHard) {
    const status: Verdict = c.precipProb >= limits.rainProbSoft ? 'marginal' : 'go';
    rules.push({
      id: 'rainprob',
      label: 'Regenrisiko',
      status,
      value: `${Math.round(c.precipProb)} %`,
      reason:
        status === 'marginal'
          ? 'Hohe Wahrscheinlichkeit. Kurze Session planen und die Wolken im Blick behalten.'
          : 'Gering.',
    });
  }

  if (c.tempC != null) {
    const status: Verdict =
      c.tempC <= limits.tempVeryCold ? 'marginal' : c.tempC <= limits.tempCold ? 'marginal' : 'go';
    rules.push({
      id: 'temp',
      label: 'Temperatur',
      status,
      value: `${n1(c.tempC)} °C`,
      reason:
        c.tempC <= limits.tempVeryCold
          ? 'Frost. Akkus brechen deutlich ein — warm halten und kürzere Flüge einplanen.'
          : c.tempC <= limits.tempCold
            ? 'Kühl. Akku in der Jacke warmhalten, sonst sinkt die Flugzeit spürbar.'
            : 'Unproblematisch.',
    });
  }

  if (c.visibilityM != null) {
    const status: Verdict =
      c.visibilityM <= limits.visHard ? 'nogo' : c.visibilityM <= limits.visSoft ? 'marginal' : 'go';
    rules.push({
      id: 'vis',
      label: 'Sicht',
      status,
      value: c.visibilityM >= 1000 ? `${Math.round(c.visibilityM / 1000)} km` : `${Math.round(c.visibilityM)} m`,
      reason:
        status === 'nogo'
          ? 'Zu diesig. Ohne freie Sicht auf die Drohne ist der Betrieb nicht zulässig.'
          : status === 'marginal'
            ? 'Eingeschränkt. Nah bleiben, damit die Drohne mit bloßem Auge sichtbar bleibt.'
            : 'Frei.',
    });
  }

  if (c.weatherCode != null) {
    const thunder = THUNDER.includes(c.weatherCode);
    const fog = FOG.includes(c.weatherCode);
    if (thunder || fog) {
      rules.push({
        id: 'wx',
        label: 'Wetterlage',
        status: 'nogo',
        value: thunder ? 'Gewitter' : 'Nebel',
        reason: thunder
          ? 'Gewitter in der Nähe. Nicht starten, unabhängig von allen anderen Werten.'
          : 'Nebel. Keine Sicht zur Drohne.',
      });
    }
  }

  if (c.kp != null) {
    const status: Verdict = c.kp >= limits.kpHard ? 'nogo' : c.kp >= limits.kpSoft ? 'marginal' : 'go';
    rules.push({
      id: 'kp',
      label: 'Kp-Index',
      status,
      value: n1(c.kp),
      reason:
        status === 'nogo'
          ? 'Starke geomagnetische Störung. GNSS unzuverlässig, Positionshaltung nicht vertrauen.'
          : status === 'marginal'
            ? 'Erhöht. Satellitenzahl vor dem Start prüfen, Positionshaltung kann unruhig sein.'
            : 'Ruhig.',
    });
  }

  if (c.daylight != null) {
    rules.push({
      id: 'light',
      label: 'Tageslicht',
      status: c.daylight ? 'go' : 'nogo',
      value: c.daylight ? 'Tag' : 'Dunkelheit',
      reason: c.daylight
        ? 'Innerhalb der hellen Stunden.'
        : 'Nachtflug ist in der Open-Kategorie in Deutschland praktisch ausgeschlossen.',
    });
  }

  const verdict = rules.reduce<Verdict>((acc, r) => worst(acc, r.status), 'go');
  const driver =
    rules.filter((r) => r.status === verdict).sort((a, b) => a.id.localeCompare(b.id))[0] ?? null;

  return { verdict, rules, driver };
}

export const VERDICT_LABEL: Record<Verdict, string> = {
  go: 'GO',
  marginal: 'MARGINAL',
  nogo: 'NO-GO',
};

export const VERDICT_TEXT: Record<Verdict, string> = {
  go: 'Bedingungen im grünen Bereich. Trotzdem dipul prüfen.',
  marginal: 'Fliegbar, aber mit Einschränkung. Die Gründe stehen unten.',
  nogo: 'Mindestens ein Wert liegt außerhalb. Heute besser der Simulator.',
};

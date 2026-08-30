import { getCollection } from 'astro:content';

/**
 * Alle abgeleiteten Kennzahlen an einer Stelle.
 * Rail-Fuss, Top-Bar-LEDs und die Startseite lesen ausschliesslich hier.
 * Vorlagen (template: true) zaehlen bewusst nicht mit.
 */

export interface SiteStats {
  flights: number;
  airtimeMin: number;
  packs: number;
  crashes: number;
  simMinutes: number;
  simSessions: number;
  lastFlight: Date | null;
  daysSinceLastFlight: number | null;
  posts: number;
  photos: number;
  spots: number;
  legal: { done: number; total: number };
  buildDate: Date;
}

export async function getStats(): Promise<SiteStats> {
  const [flightsAll, simAll, postsAll, galleryAll, spotsAll, statusAll] = await Promise.all([
    getCollection('flights'),
    getCollection('sim'),
    getCollection('posts'),
    getCollection('gallery'),
    getCollection('spots'),
    getCollection('status'),
  ]);

  const flights = flightsAll.filter((f) => !f.data.template);
  const sims = simAll.filter((s) => !s.data.template);
  const posts = postsAll.filter((p) => !p.data.draft && !p.data.template);

  const dates = flights.map((f) => f.data.date.getTime());
  const lastFlight = dates.length ? new Date(Math.max(...dates)) : null;

  return {
    flights: flights.length,
    airtimeMin: sum(flights.map((f) => f.data.airtimeMin)),
    packs: sum(flights.map((f) => f.data.packs)),
    crashes: sum(flights.map((f) => f.data.crashes)),
    simMinutes: sum(sims.map((s) => s.data.minutes)),
    simSessions: sims.length,
    lastFlight,
    daysSinceLastFlight: lastFlight
      ? Math.floor((Date.now() - lastFlight.getTime()) / 86_400_000)
      : null,
    posts: posts.length,
    photos: galleryAll.length,
    spots: spotsAll.length,
    legal: {
      done: statusAll.filter((s) => s.data.state === 'done').length,
      total: statusAll.length,
    },
    buildDate: new Date(),
  };
}

/** Die vier LEDs in der Top-Bar, aggregiert aus src/content/status/status.json */
export async function getLedStates() {
  const all = await getCollection('status');
  const keys = ['vers', 'eid', 'a1a3', 'hw'] as const;

  return keys.map((key) => {
    const group = all.filter((s) => s.data.key === key).sort((a, b) => a.data.order - b.data.order);
    const short = group[0]?.data.short ?? key.toUpperCase();
    // Schlechtester Zustand der Gruppe gewinnt: offen > läuft > erledigt
    const state = group.some((s) => s.data.state === 'open')
      ? 'open'
      : group.some((s) => s.data.state === 'pending')
        ? 'pending'
        : 'done';
    return { key, short, state: state as 'open' | 'pending' | 'done' };
  });
}

function sum(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0);
}

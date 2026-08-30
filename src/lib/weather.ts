/**
 * Abruf und Normalisierung der Wetterdaten. Läuft im Browser, nicht beim Build —
 * die Seite ist statisch, die Werte sind es nicht.
 *
 * Quellen:
 *   Open-Meteo  — Wind, Böen, Höhenwind, Niederschlag, Sicht (kein Schlüssel nötig)
 *   NOAA SWPC   — planetarer Kp-Index
 *
 * Beide sind CORS-offen. Ein Ausfall ist ein regulärer Zustand, kein Fehlerfall:
 * die Funktionen werfen, und die Oberfläche zeigt das Offline-Panel.
 */

export interface HourPoint {
  time: Date;
  tempC: number;
  apparentC: number;
  humidity: number;
  dewPointC: number;
  precipMm: number;
  precipProb: number;
  weatherCode: number;
  cloudCover: number;
  cloudCoverLow: number;
  visibilityM: number;
  wind10: number;
  wind80: number;
  wind120: number;
  windDir: number;
  gust: number;
  uvIndex: number;
}

export interface WeatherData {
  fetchedAt: Date;
  timezone: string;
  lat: number;
  lon: number;
  current: {
    time: Date;
    tempC: number;
    wind10: number;
    gust: number;
    windDir: number;
    weatherCode: number;
    cloudCover: number;
    precipMm: number;
    humidity: number;
  };
  hours: HourPoint[];
}

const HOURLY = [
  'temperature_2m',
  'apparent_temperature',
  'relative_humidity_2m',
  'dew_point_2m',
  'precipitation_probability',
  'precipitation',
  'weather_code',
  'cloud_cover',
  'cloud_cover_low',
  'visibility',
  'wind_speed_10m',
  'wind_speed_80m',
  'wind_speed_120m',
  'wind_direction_10m',
  'wind_gusts_10m',
  'uv_index',
].join(',');

const CURRENT = [
  'temperature_2m',
  'wind_speed_10m',
  'wind_gusts_10m',
  'wind_direction_10m',
  'weather_code',
  'cloud_cover',
  'precipitation',
  'relative_humidity_2m',
].join(',');

const CACHE_MS = 10 * 60 * 1000;

function cacheGet<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const { at, data } = JSON.parse(raw) as { at: number; data: T };
    if (Date.now() - at > CACHE_MS) return null;
    return data;
  } catch {
    return null;
  }
}

function cacheSet(key: string, data: unknown): void {
  try {
    sessionStorage.setItem(key, JSON.stringify({ at: Date.now(), data }));
  } catch {
    // Speicher voll oder blockiert — der Abruf funktioniert trotzdem
  }
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const key = `voidfpv:wx:${lat.toFixed(3)},${lon.toFixed(3)}`;
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=${CURRENT}&hourly=${HOURLY}` +
    `&wind_speed_unit=ms&timezone=auto&forecast_days=3`;

  const cached = cacheGet<unknown>(key);
  const raw = cached ?? (await request(url));
  if (!cached) cacheSet(key, raw);

  return normalize(raw as OpenMeteoResponse, lat, lon);
}

/** Aktueller Kp-Index. Eigene Funktion, damit ein Ausfall hier nicht das Briefing kippt. */
export async function fetchKp(): Promise<{ kp: number; at: Date }> {
  const key = 'voidfpv:kp';
  const cached = cacheGet<unknown>(key);
  const raw = cached ?? (await request('https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json'));
  if (!cached) cacheSet(key, raw);

  const rows = raw as { time_tag: string; Kp: number }[];
  const last = rows[rows.length - 1];
  if (!last) throw new Error('Kp-Antwort ohne Werte');
  return { kp: Number(last.Kp), at: new Date(last.time_tag + 'Z') };
}

async function request(url: string): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12_000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

interface OpenMeteoResponse {
  timezone: string;
  current: Record<string, number | string>;
  hourly: Record<string, (number | string)[]>;
}

function normalize(d: OpenMeteoResponse, lat: number, lon: number): WeatherData {
  const h = d.hourly;
  const times = h.time as string[];

  const num = (arr: (number | string)[] | undefined, i: number): number => {
    const v = arr?.[i];
    return typeof v === 'number' ? v : 0;
  };

  const hours: HourPoint[] = times.map((t, i) => ({
    time: new Date(t),
    tempC: num(h.temperature_2m, i),
    apparentC: num(h.apparent_temperature, i),
    humidity: num(h.relative_humidity_2m, i),
    dewPointC: num(h.dew_point_2m, i),
    precipMm: num(h.precipitation, i),
    precipProb: num(h.precipitation_probability, i),
    weatherCode: num(h.weather_code, i),
    cloudCover: num(h.cloud_cover, i),
    cloudCoverLow: num(h.cloud_cover_low, i),
    visibilityM: num(h.visibility, i),
    wind10: num(h.wind_speed_10m, i),
    wind80: num(h.wind_speed_80m, i),
    wind120: num(h.wind_speed_120m, i),
    windDir: num(h.wind_direction_10m, i),
    gust: num(h.wind_gusts_10m, i),
    uvIndex: num(h.uv_index, i),
  }));

  const c = d.current;
  return {
    fetchedAt: new Date(),
    timezone: d.timezone,
    lat,
    lon,
    current: {
      time: new Date(String(c.time)),
      tempC: Number(c.temperature_2m),
      wind10: Number(c.wind_speed_10m),
      gust: Number(c.wind_gusts_10m),
      windDir: Number(c.wind_direction_10m),
      weatherCode: Number(c.weather_code),
      cloudCover: Number(c.cloud_cover),
      precipMm: Number(c.precipitation),
      humidity: Number(c.relative_humidity_2m),
    },
    hours,
  };
}

/** Der Stundenwert, der dem Zeitpunkt am nächsten liegt */
export function hourAt(data: WeatherData, when: Date = new Date()): HourPoint | null {
  if (!data.hours.length) return null;
  let best = data.hours[0]!;
  let bestDiff = Math.abs(best.time.getTime() - when.getTime());
  for (const h of data.hours) {
    const diff = Math.abs(h.time.getTime() - when.getTime());
    if (diff < bestDiff) {
      best = h;
      bestDiff = diff;
    }
  }
  return best;
}

/** Die nächsten n Stunden ab jetzt */
export function nextHours(data: WeatherData, n: number): HourPoint[] {
  const now = Date.now();
  return data.hours.filter((h) => h.time.getTime() >= now - 3_600_000).slice(0, n);
}

/** Klartext zu den WMO-Wettercodes, die in Deutschland vorkommen */
export const WEATHER_CODE: Record<number, string> = {
  0: 'klar',
  1: 'überwiegend klar',
  2: 'teils bewölkt',
  3: 'bedeckt',
  45: 'Nebel',
  48: 'gefrierender Nebel',
  51: 'leichter Nieselregen',
  53: 'Nieselregen',
  55: 'starker Nieselregen',
  56: 'gefrierender Niesel',
  57: 'gefrierender Niesel, stark',
  61: 'leichter Regen',
  63: 'Regen',
  65: 'starker Regen',
  66: 'gefrierender Regen',
  67: 'gefrierender Regen, stark',
  71: 'leichter Schneefall',
  73: 'Schneefall',
  75: 'starker Schneefall',
  77: 'Schneegriesel',
  80: 'leichte Schauer',
  81: 'Schauer',
  82: 'kräftige Schauer',
  85: 'Schneeschauer',
  86: 'starke Schneeschauer',
  95: 'Gewitter',
  96: 'Gewitter mit Hagel',
  99: 'schweres Gewitter mit Hagel',
};

export const codeText = (code: number): string => WEATHER_CODE[code] ?? `Code ${code}`;

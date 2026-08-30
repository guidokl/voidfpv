/**
 * Client-Logik des Wetter-Briefings.
 *
 * Alles hier läuft im Browser: Standortwahl, Abruf, Auswertung, Diagramme.
 * Die Seite selbst ist statisch — sie liefert nur das Gerüst und die Spots.
 */
import { fetchWeather, fetchKp, hourAt, nextHours, codeText, type WeatherData, type HourPoint } from '~/lib/weather';
import { evaluate, VERDICT_LABEL, VERDICT_TEXT, LIMITS, type Verdict } from '~/lib/gono';
import { sunTimes, fmtTime, isDaylight } from '~/lib/sun';
import { windDir, beaufort, msToKmh } from '~/lib/format';

interface Spot {
  id: string;
  name: string;
  area: string;
  lat: number;
  lon: number;
  exact: boolean;
}

const STORE_KEY = 'voidfpv:wx:location';
const $ = <T extends HTMLElement = HTMLElement>(sel: string) => document.querySelector<T>(sel);
const nf = (v: number, d = 1) =>
  new Intl.NumberFormat('de-DE', { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);

let spots: Spot[] = [];
let active: { lat: number; lon: number; label: string } | null = null;

/* ---------------------------------------------------------------- Standort */

function loadStored(): { lat: number; lon: number; label: string } | null {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function store(loc: { lat: number; lon: number; label: string }) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(loc));
  } catch {
    /* privates Fenster — läuft ohne Gedächtnis weiter */
  }
}

/* ------------------------------------------------------------------ Zustand */

function setState(state: 'idle' | 'loading' | 'ready' | 'error') {
  document.querySelectorAll<HTMLElement>('[data-wx-state]').forEach((el) => {
    el.hidden = el.dataset.wxState !== state;
  });
}

function setError(msg: string) {
  const el = $('[data-wx-error-msg]');
  if (el) el.textContent = msg;
  setState('error');
}

/* ------------------------------------------------------------------ Rendern */

async function load(loc: { lat: number; lon: number; label: string }) {
  active = loc;
  store(loc);
  setState('loading');

  const labelEl = $('[data-wx-place]');
  if (labelEl) labelEl.textContent = loc.label;

  let data: WeatherData;
  try {
    data = await fetchWeather(loc.lat, loc.lon);
  } catch (err) {
    setError(
      err instanceof Error && err.name === 'AbortError'
        ? 'Die Wetterabfrage hat zu lange gedauert.'
        : 'Die Wetterdaten sind gerade nicht erreichbar.',
    );
    return;
  }

  // Kp ist Beiwerk: fällt der Abruf aus, läuft das Briefing ohne diesen Wert weiter.
  let kp: number | undefined;
  let kpAt: Date | undefined;
  try {
    const r = await fetchKp();
    kp = r.kp;
    kpAt = r.at;
  } catch {
    kp = undefined;
  }

  setState('ready');
  renderAll(data, loc, kp, kpAt);
}

function renderAll(
  data: WeatherData,
  loc: { lat: number; lon: number; label: string },
  kp: number | undefined,
  kpAt: Date | undefined,
) {
  const now = new Date();
  const h = hourAt(data, now);
  if (!h) return;

  const daylight = isDaylight(now, loc.lat, loc.lon);
  const result = evaluate({
    windMs: data.current.wind10,
    gustMs: data.current.gust,
    precipMm: data.current.precipMm,
    precipProb: h.precipProb,
    tempC: data.current.tempC,
    visibilityM: h.visibilityM,
    weatherCode: data.current.weatherCode,
    kp,
    daylight,
  });

  renderVerdict(result.verdict, result.rules, data);
  renderTimeline(data, loc);
  renderWind(data, h);
  renderConditions(h);
  renderSun(loc, now);
  renderKp(kp, kpAt);
  renderMeta(data);
  renderSpotLinks(loc);
}

/* ------------------------------------------------------------------ Verdict */

function renderVerdict(verdict: Verdict, rules: ReturnType<typeof evaluate>['rules'], data: WeatherData) {
  const box = $('[data-wx-verdict]');
  if (!box) return;
  box.dataset.verdict = verdict;

  const label = $('[data-wx-verdict-label]');
  if (label) label.textContent = VERDICT_LABEL[verdict];

  const text = $('[data-wx-verdict-text]');
  if (text) text.textContent = VERDICT_TEXT[verdict];

  const summary = $('[data-wx-verdict-now]');
  if (summary) {
    summary.textContent =
      `${codeText(data.current.weatherCode)} · ${nf(data.current.tempC)} °C · ` +
      `Wind ${nf(data.current.wind10)} m/s aus ${windDir(data.current.windDir)}, Böen ${nf(data.current.gust)} m/s`;
  }

  const list = $('[data-wx-rules]');
  if (!list) return;
  list.innerHTML = rules
    .map(
      (r) => `
      <li class="rule s-${r.status}">
        <span class="r-dot" aria-hidden="true"></span>
        <span class="r-label">${r.label}</span>
        <span class="r-value">${r.value}</span>
        <span class="r-reason">${r.reason}</span>
      </li>`,
    )
    .join('');
}

/* ----------------------------------------------------------------- Timeline */

function renderTimeline(data: WeatherData, loc: { lat: number; lon: number }) {
  const host = $('[data-wx-timeline]');
  if (!host) return;

  const hours = nextHours(data, 48);
  if (!hours.length) return;

  const W = 960;
  const H = 96;
  const barW = W / hours.length;

  const cells = hours
    .map((p, i) => {
      const v = evaluate({
        windMs: p.wind10,
        gustMs: p.gust,
        precipMm: p.precipMm,
        precipProb: p.precipProb,
        tempC: p.tempC,
        visibilityM: p.visibilityM,
        weatherCode: p.weatherCode,
        daylight: isDaylight(p.time, loc.lat, loc.lon),
      }).verdict;
      const x = i * barW;
      return `<rect x="${x.toFixed(2)}" y="0" width="${(barW + 0.5).toFixed(2)}" height="46"
        class="tl-${v}"><title>${p.time.toLocaleString('de-DE', { weekday: 'short', hour: '2-digit', minute: '2-digit' })} — ${VERDICT_LABEL[v]}, Böen ${nf(p.gust)} m/s</title></rect>`;
    })
    .join('');

  // Achsenbeschriftung alle 6 Stunden
  const ticks = hours
    .map((p, i) => {
      if (p.time.getHours() % 6 !== 0) return '';
      const x = i * barW;
      const label = p.time.toLocaleTimeString('de-DE', { hour: '2-digit' });
      const day = p.time.getHours() === 0
        ? p.time.toLocaleDateString('de-DE', { weekday: 'short' })
        : '';
      return `<line x1="${x.toFixed(2)}" y1="46" x2="${x.toFixed(2)}" y2="52" class="tl-tick" />
        <text x="${(x + 3).toFixed(2)}" y="66" class="tl-lbl">${label}</text>
        ${day ? `<text x="${(x + 3).toFixed(2)}" y="80" class="tl-day">${day}</text>` : ''}`;
    })
    .join('');

  host.innerHTML = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img"
      aria-label="Flugfenster der nächsten 48 Stunden">${cells}${ticks}</svg>`;

  // Bestes Fenster in Worten
  const best = findWindow(hours, loc);
  const note = $('[data-wx-window]');
  if (note) note.textContent = best;
}

function findWindow(hours: HourPoint[], loc: { lat: number; lon: number }): string {
  let bestStart = -1;
  let bestLen = 0;
  let curStart = -1;
  let curLen = 0;

  hours.forEach((p, i) => {
    const v = evaluate({
      windMs: p.wind10,
      gustMs: p.gust,
      precipMm: p.precipMm,
      tempC: p.tempC,
      visibilityM: p.visibilityM,
      weatherCode: p.weatherCode,
      daylight: isDaylight(p.time, loc.lat, loc.lon),
    }).verdict;

    if (v === 'go') {
      if (curStart < 0) curStart = i;
      curLen++;
      if (curLen > bestLen) {
        bestLen = curLen;
        bestStart = curStart;
      }
    } else {
      curStart = -1;
      curLen = 0;
    }
  });

  if (bestStart < 0) {
    return 'In den nächsten 48 Stunden kein durchgehend grünes Fenster. Der Simulator wartet.';
  }
  const from = hours[bestStart]!.time;
  const to = hours[Math.min(bestStart + bestLen - 1, hours.length - 1)]!.time;
  const fmt = (d: Date) =>
    d.toLocaleString('de-DE', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
  return `Längstes grünes Fenster: ${fmt(from)} bis ${fmt(to)} — ${bestLen} Stunden.`;
}

/* --------------------------------------------------------------------- Wind */

function renderWind(data: WeatherData, h: HourPoint) {
  const set = (sel: string, v: string) => {
    const el = $(sel);
    if (el) el.textContent = v;
  };

  set('[data-wx-wind-now]', nf(data.current.wind10));
  set('[data-wx-gust-now]', nf(data.current.gust));
  set('[data-wx-wind-kmh]', `${nf(msToKmh(data.current.wind10), 0)} km/h`);
  set('[data-wx-gust-kmh]', `${nf(msToKmh(data.current.gust), 0)} km/h`);
  set('[data-wx-bft]', `Bft ${beaufort(data.current.wind10)}`);
  set('[data-wx-dir]', `${windDir(data.current.windDir)} (${Math.round(data.current.windDir)}°)`);

  renderProfile(h);
  renderRose(data.current.windDir, data.current.wind10);
  renderTrend(data);
}

/** Höhenprofil 10 / 80 / 120 m als liegendes Balkendiagramm */
function renderProfile(h: HourPoint) {
  const host = $('[data-wx-profile]');
  if (!host) return;

  const rows = [
    { label: '10 m', v: h.wind10, note: 'Bodennah, was am Startplatz ankommt' },
    { label: '80 m', v: h.wind80, note: 'Etwa Baumkronen plus' },
    { label: '120 m', v: h.wind120, note: 'Obergrenze der Open-Kategorie' },
  ];
  const max = Math.max(LIMITS.gustHard, ...rows.map((r) => r.v)) * 1.05;

  host.innerHTML = rows
    .map((r) => {
      const pct = Math.min(100, (r.v / max) * 100);
      const softPct = (LIMITS.windSoft / max) * 100;
      const hardPct = (LIMITS.windHard / max) * 100;
      const tone = r.v >= LIMITS.windHard ? 'nogo' : r.v >= LIMITS.windSoft ? 'marginal' : 'go';
      return `
      <div class="pf-row">
        <span class="pf-label">${r.label}</span>
        <div class="pf-track">
          <span class="pf-mark" style="left:${softPct.toFixed(1)}%"></span>
          <span class="pf-mark hard" style="left:${hardPct.toFixed(1)}%"></span>
          <span class="pf-bar s-${tone}" style="width:${pct.toFixed(1)}%"></span>
        </div>
        <span class="pf-val">${nf(r.v)} m/s</span>
        <span class="pf-note">${r.note}</span>
      </div>`;
    })
    .join('');
}

/** Windrose als SVG — Richtung, aus der es weht */
function renderRose(dirDeg: number, speed: number) {
  const host = $('[data-wx-rose]');
  if (!host) return;

  const S = 160;
  const c = S / 2;
  const r = 62;
  const rings = [0.35, 0.7, 1]
    .map((f) => `<circle cx="${c}" cy="${c}" r="${(r * f).toFixed(1)}" class="rose-ring" />`)
    .join('');

  const spokes = [0, 45, 90, 135, 180, 225, 270, 315]
    .map((a) => {
      const rad = ((a - 90) * Math.PI) / 180;
      return `<line x1="${c}" y1="${c}" x2="${(c + Math.cos(rad) * r).toFixed(1)}" y2="${(c + Math.sin(rad) * r).toFixed(1)}" class="rose-spoke" />`;
    })
    .join('');

  const labels = [
    ['N', 0],
    ['O', 90],
    ['S', 180],
    ['W', 270],
  ]
    .map(([t, a]) => {
      const rad = ((Number(a) - 90) * Math.PI) / 180;
      const rr = r + 12;
      return `<text x="${(c + Math.cos(rad) * rr).toFixed(1)}" y="${(c + Math.sin(rad) * rr + 4).toFixed(1)}" class="rose-lbl">${t}</text>`;
    })
    .join('');

  // Pfeil zeigt in die Richtung, in die der Wind weht (Meteorologie gibt die Herkunft an)
  const rad = ((dirDeg - 90 + 180) * Math.PI) / 180;
  const len = Math.min(r - 6, 20 + speed * 4);
  const x2 = c + Math.cos(rad) * len;
  const y2 = c + Math.sin(rad) * len;
  const headA = rad + Math.PI * 0.85;
  const headB = rad - Math.PI * 0.85;

  host.innerHTML = `<svg viewBox="0 0 ${S} ${S}" role="img" aria-label="Windrichtung ${windDir(dirDeg)}">
    ${rings}${spokes}${labels}
    <line x1="${c}" y1="${c}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" class="rose-arrow" />
    <polyline points="${(x2 + Math.cos(headA) * 8).toFixed(1)},${(y2 + Math.sin(headA) * 8).toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)} ${(x2 + Math.cos(headB) * 8).toFixed(1)},${(y2 + Math.sin(headB) * 8).toFixed(1)}" class="rose-arrow" />
    <circle cx="${c}" cy="${c}" r="2.5" class="rose-hub" />
  </svg>`;
}

/** Wind- und Böenverlauf der nächsten 24 Stunden */
function renderTrend(data: WeatherData) {
  const host = $('[data-wx-trend]');
  if (!host) return;

  const hours = nextHours(data, 24);
  if (hours.length < 2) return;

  const W = 720;
  const H = 180;
  const pad = { l: 34, r: 10, t: 12, b: 26 };
  const iw = W - pad.l - pad.r;
  const ih = H - pad.t - pad.b;
  const max = Math.max(LIMITS.gustHard + 2, ...hours.map((h) => h.gust)) * 1.05;

  const x = (i: number) => pad.l + (i / (hours.length - 1)) * iw;
  const y = (v: number) => pad.t + ih - (v / max) * ih;

  const path = (key: 'wind10' | 'gust') =>
    hours.map((h, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(h[key]).toFixed(1)}`).join(' ');

  const gridVals = [LIMITS.windSoft, LIMITS.windHard];
  const grid = gridVals
    .map(
      (v) => `<line x1="${pad.l}" y1="${y(v).toFixed(1)}" x2="${W - pad.r}" y2="${y(v).toFixed(1)}"
        class="tr-limit ${v === LIMITS.windHard ? 'hard' : ''}" />
        <text x="${W - pad.r}" y="${(y(v) - 4).toFixed(1)}" text-anchor="end" class="tr-lbl">${nf(v, 0)} m/s</text>`,
    )
    .join('');

  const ticks = hours
    .map((h, i) => {
      if (h.time.getHours() % 6 !== 0) return '';
      return `<text x="${x(i).toFixed(1)}" y="${H - 8}" text-anchor="middle" class="tr-lbl">${h.time.toLocaleTimeString('de-DE', { hour: '2-digit' })}</text>`;
    })
    .join('');

  host.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Wind und Böen der nächsten 24 Stunden">
    ${grid}
    <path d="${path('gust')}" class="tr-gust" />
    <path d="${path('wind10')}" class="tr-wind" />
    ${ticks}
  </svg>`;
}

/* -------------------------------------------------------------- Bedingungen */

function renderConditions(h: HourPoint) {
  const host = $('[data-wx-conditions]');
  if (!host) return;

  const spread = h.tempC - h.dewPointC;
  const rows: [string, string, string][] = [
    ['Temperatur', `${nf(h.tempC)} °C`, `gefühlt ${nf(h.apparentC)} °C`],
    ['Luftfeuchte', `${Math.round(h.humidity)} %`, `Taupunkt ${nf(h.dewPointC)} °C`],
    [
      'Nebelrisiko',
      spread < 2 ? 'erhöht' : spread < 4 ? 'gering' : 'kaum',
      `Spread ${nf(spread)} K`,
    ],
    ['Bewölkung', `${Math.round(h.cloudCover)} %`, `tief ${Math.round(h.cloudCoverLow)} %`],
    [
      'Sicht',
      h.visibilityM >= 1000 ? `${Math.round(h.visibilityM / 1000)} km` : `${Math.round(h.visibilityM)} m`,
      h.visibilityM <= LIMITS.visSoft ? 'eingeschränkt' : 'frei',
    ],
    ['Niederschlag', `${nf(h.precipMm)} mm/h`, `${Math.round(h.precipProb)} % Wahrscheinlichkeit`],
    ['UV-Index', nf(h.uvIndex, 0), h.uvIndex >= 6 ? 'Sonnenschutz' : 'unkritisch'],
    ['Wetterlage', codeText(h.weatherCode), ''],
  ];

  host.innerHTML = rows
    .map(
      ([k, v, note]) => `
      <div class="cond">
        <span class="c-key">${k}</span>
        <span class="c-val">${v}</span>
        ${note ? `<span class="c-note">${note}</span>` : ''}
      </div>`,
    )
    .join('');

  const cold = $('[data-wx-cold]');
  if (cold) cold.hidden = h.tempC > LIMITS.tempCold;
}

/* ---------------------------------------------------------------- Sonne, Kp */

function renderSun(loc: { lat: number; lon: number }, now: Date) {
  const host = $('[data-wx-sun]');
  if (!host) return;
  const t = sunTimes(now, loc.lat, loc.lon);

  const rows: [string, string, string][] = [
    ['Blaue Stunde', fmtTime(t.dawn), 'morgens, vor Sonnenaufgang'],
    ['Sonnenaufgang', fmtTime(t.sunrise), 'ab hier ist Flugbetrieb zulässig'],
    ['Goldene Stunde', `bis ${fmtTime(t.goldenEndMorning)}`, 'weiches Licht am Morgen'],
    ['Höchststand', fmtTime(t.noon), 'hartes Licht, wenig Kontrast'],
    ['Goldene Stunde', `ab ${fmtTime(t.goldenStartEvening)}`, 'die beste Zeit für Aufnahmen'],
    ['Sonnenuntergang', fmtTime(t.sunset), 'danach kein Flugbetrieb'],
    ['Blaue Stunde', `bis ${fmtTime(t.dusk)}`, 'abends, nur noch Bodenfotos'],
  ];

  host.innerHTML = rows
    .map(
      ([k, v, note]) => `
      <div class="sun-row">
        <span class="s-key">${k}</span>
        <span class="s-val">${v}</span>
        <span class="s-note">${note}</span>
      </div>`,
    )
    .join('');
}

function renderKp(kp: number | undefined, at: Date | undefined) {
  const host = $('[data-wx-kp]');
  if (!host) return;

  if (kp == null) {
    host.innerHTML = `<p class="kp-out">Kp-Index gerade nicht abrufbar (NOAA SWPC). Das Briefing gilt trotzdem — die Satellitenzahl vor dem Start in der Brille prüfen.</p>`;
    return;
  }

  const tone = kp >= LIMITS.kpHard ? 'nogo' : kp >= LIMITS.kpSoft ? 'marginal' : 'go';
  const text =
    tone === 'nogo'
      ? 'Starke Störung. GNSS unzuverlässig — Positionshaltung nicht vertrauen.'
      : tone === 'marginal'
        ? 'Erhöht. Satellitenzahl vor dem Start prüfen.'
        : 'Ruhig. Keine Auswirkung auf die Positionshaltung zu erwarten.';

  host.innerHTML = `
    <div class="kp s-${tone}">
      <span class="kp-val">${nf(kp)}</span>
      <div class="kp-scale" aria-hidden="true">
        ${Array.from({ length: 9 }, (_, i) => `<span class="${i < Math.round(kp) ? 'on' : ''}"></span>`).join('')}
      </div>
      <p class="kp-text">${text}</p>
      <span class="kp-at mono-label">Stand ${at ? at.toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'} · NOAA SWPC</span>
    </div>`;
}

function renderMeta(data: WeatherData) {
  const el = $('[data-wx-meta]');
  if (!el) return;
  el.textContent =
    `Abgerufen ${data.fetchedAt.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} · ` +
    `Quelle Open-Meteo · Zeitzone ${data.timezone}`;
}

/** Deep-Links mit den aktuellen Koordinaten füllen */
function renderSpotLinks(loc: { lat: number; lon: number }) {
  const lat = loc.lat.toFixed(4);
  const lon = loc.lon.toFixed(4);
  const map: Record<string, string> = {
    dipul: `https://maptool-dipul.dfs.de/?lat=${lat}&lon=${lon}&zoom=13`,
    windy: `https://www.windy.com/?${lat},${lon},11`,
    osm: `https://www.openstreetmap.org/#map=14/${lat}/${lon}`,
    fr24: `https://www.flightradar24.com/${lat},${lon}/10`,
  };
  for (const [key, url] of Object.entries(map)) {
    const el = document.querySelector<HTMLAnchorElement>(`[data-wx-link="${key}"]`);
    if (el) el.href = url;
  }
}

/* --------------------------------------------------------------------- Init */

function init() {
  const root = $('[data-wetter]');
  if (!root) return;

  try {
    spots = JSON.parse(root.dataset.spots ?? '[]');
  } catch {
    spots = [];
  }

  // Spot-Auswahl
  const select = $<HTMLSelectElement>('[data-wx-spot]');
  select?.addEventListener('change', () => {
    const spot = spots.find((s) => s.id === select.value);
    if (spot) load({ lat: spot.lat, lon: spot.lon, label: `${spot.name} · ${spot.area}` });
  });

  // Manuelle Koordinaten
  $<HTMLFormElement>('[data-wx-manual]')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const lat = Number((form.elements.namedItem('lat') as HTMLInputElement).value.replace(',', '.'));
    const lon = Number((form.elements.namedItem('lon') as HTMLInputElement).value.replace(',', '.'));
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
      setError('Die eingegebenen Koordinaten ergeben keinen gültigen Punkt.');
      return;
    }
    load({ lat, lon, label: `${nf(lat, 3)}, ${nf(lon, 3)}` });
  });

  // Standort per Browser — nur auf Klick, nie automatisch
  $('[data-wx-geo]')?.addEventListener('click', () => {
    if (!navigator.geolocation) {
      setError('Dieser Browser bietet keine Standortbestimmung an.');
      return;
    }
    setState('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        load({
          lat: Number(pos.coords.latitude.toFixed(4)),
          lon: Number(pos.coords.longitude.toFixed(4)),
          label: 'Aktueller Standort',
        }),
      () => setError('Standort wurde nicht freigegeben oder konnte nicht bestimmt werden.'),
      { timeout: 10_000, maximumAge: 300_000 },
    );
  });

  // Erneut versuchen
  $('[data-wx-retry]')?.addEventListener('click', () => {
    if (active) load(active);
    else setState('idle');
  });

  const stored = loadStored();
  if (stored) {
    if (select) {
      const match = spots.find((s) => s.lat === stored.lat && s.lon === stored.lon);
      if (match) select.value = match.id;
    }
    load(stored);
  } else {
    setState('idle');
  }
}

init();

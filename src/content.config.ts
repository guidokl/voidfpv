import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

const md = (dir: string) => glob({ pattern: '**/*.md', base: `./src/content/${dir}` });

/* --- Flugbuch ------------------------------------------------------- */
const flights = defineCollection({
  loader: md('flights'),
  schema: z.object({
    date: z.coerce.date(),
    spot: z.string(),
    area: z.string(),
    drone: z.string().default('DJI Avata 2'),
    controller: z.string().optional(),
    mode: z.enum(['N', 'S', 'M', 'Easy ACRO']).default('N'),
    packs: z.number().int().min(0).default(1),
    airtimeMin: z.number().min(0).default(0),
    maxAltM: z.number().optional(),
    windMs: z.number().optional(),
    tempC: z.number().optional(),
    conditions: z.string().optional(),
    crashes: z.number().int().min(0).default(0),
    spotter: z.boolean().default(false),
    summary: z.string(),
    /** true = Vorlage, zählt nicht in die Statistik und ist als Beispiel markiert */
    template: z.boolean().default(false),
  }),
});

/* --- Simulator-Logbuch ---------------------------------------------- */
const sim = defineCollection({
  loader: md('sim'),
  schema: z.object({
    date: z.coerce.date(),
    sim: z.string(),
    minutes: z.number().min(0),
    controller: z.string().default('FPV Remote Controller 3'),
    focus: z.array(z.string()).default([]),
    notes: z.string().optional(),
    template: z.boolean().default(false),
  }),
});

/* --- Berichte -------------------------------------------------------- */
const posts = defineCollection({
  loader: md('posts'),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    excerpt: z.string(),
    draft: z.boolean().default(false),
    template: z.boolean().default(false),
  }),
});

/* --- Hardware -------------------------------------------------------- */
const hardware = defineCollection({
  loader: md('hardware'),
  schema: z.object({
    name: z.string(),
    category: z.enum(['drone', 'goggles', 'controller', 'battery', 'accessory', 'planned']),
    status: z.enum(['owned', 'ordered', 'planned', 'considering']),
    order: z.number().default(50),
    acquired: z.coerce.date().optional(),
    priceEur: z.number().optional(),
    /** Datenblatt: Bezeichnung -> Wert */
    specs: z.record(z.string(), z.string()).default({}),
    summary: z.string(),
  }),
});

/* --- Tools / Apps ----------------------------------------------------
   Als eine JSON-Datei statt vieler Markdown-Dateien: Diese Listen werden
   gepflegt, sortiert und massenweise auf tote Links geprueft. */
const tools = defineCollection({
  loader: file('./src/content/tools.json'),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    category: z.enum([
      'pflicht', 'wetter', 'simulator', 'video', 'flugdaten',
      'recherche', 'werkstatt', 'archiv',
    ]),
    platform: z.array(z.enum(['Windows', 'macOS', 'Linux', 'Android', 'iOS', 'Web'])).default([]),
    price: z.string(),
    status: z.enum(['nutze', 'geplant', 'geprueft', 'verworfen']),
    url: z.string().url(),
    verdict: z.string(),
    lastChecked: z.coerce.date(),
  }),
});

/* --- Linkverzeichnis -------------------------------------------------- */
const links = defineCollection({
  loader: file('./src/content/links.json'),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    category: z.enum(['shop-de', 'shop-int', 'community', 'lernen', 'behoerde', 'hersteller']),
    country: z.string(),
    focus: z.string(),
    note: z.string().optional(),
    url: z.string().url(),
    lastChecked: z.coerce.date(),
  }),
});

/* --- Szene: Piloten --------------------------------------------------- */
const pilots = defineCollection({
  loader: file('./src/content/pilots.json'),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    discipline: z.enum(['freestyle', 'racing', 'cinematic', 'education', 'crew']),
    country: z.string().optional(),
    why: z.string(),
    refs: z.array(z.string()).default([]),
    channelUrl: z.string().url(),
    order: z.number().default(50),
    verified: z.coerce.date(),
  }),
});

/* --- Szene: Clips, Filme, Dokus --------------------------------------- */
const films = defineCollection({
  loader: file('./src/content/films.json'),
  schema: z.object({
    id: z.string(),
    title: z.string(),
    kind: z.enum(['clip', 'film', 'doc']),
    year: z.number().int().optional(),
    by: z.string(),
    url: z.string().url(),
    why: z.string(),
    learn: z.string().optional(),
    order: z.number().default(50),
    verified: z.coerce.date(),
  }),
});

/* --- Spots ------------------------------------------------------------- */
const spots = defineCollection({
  loader: md('spots'),
  schema: z.object({
    name: z.string(),
    area: z.string(),
    lat: z.number(),
    lon: z.number(),
    /** false = Koordinaten werden nur gerundet ausgegeben, nie punktgenau */
    coordsPublic: z.boolean().default(false),
    type: z.enum(['feld', 'wald', 'lostplace', 'indoor', 'sonstiges']),
    access: z.string().optional(),
    dipulChecked: z.coerce.date().optional(),
    notes: z.string().optional(),
    isDefault: z.boolean().default(false),
  }),
});

/* --- Teileliste / Bau-Kandidaten --------------------------------------- */
const parts = defineCollection({
  loader: file('./src/content/parts.json'),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    category: z.enum(['drohne', 'vtx', 'funk', 'akku', 'werkzeug', 'ersatzteil', 'sonstiges']),
    priceEur: z.number().optional(),
    status: z.enum(['wunsch', 'beobachten', 'bestellt', 'gekauft']),
    url: z.string().url().optional(),
    note: z.string().optional(),
  }),
});

/* --- Wissensbasis ------------------------------------------------------ */
const wissen = defineCollection({
  loader: md('wissen'),
  schema: z.object({
    title: z.string(),
    order: z.number(),
    summary: z.string(),
    /** Rechtsthemen bekommen den Disclaimer-Balken */
    legal: z.boolean().default(false),
    updated: z.coerce.date(),
  }),
});

/* --- Galerie ----------------------------------------------------------- */
const gallery = defineCollection({
  loader: md('gallery'),
  schema: ({ image }) =>
    z.object({
      image: image(),
      caption: z.string(),
      date: z.coerce.date(),
      location: z.string().optional(),
      tags: z.array(z.string()).default([]),
      drone: z.string().default('DJI Avata 2'),
      settings: z.string().optional(),
      featured: z.boolean().default(false),
    }),
});

/* --- Papierkram-Status (speist die LEDs oben rechts) -------------------- */
const status = defineCollection({
  loader: file('./src/content/status/status.json'),
  schema: z.object({
    id: z.string(),
    key: z.enum(['vers', 'eid', 'a1a3', 'hw']),
    label: z.string(),
    short: z.string(),
    state: z.enum(['open', 'pending', 'done']),
    order: z.number(),
    costEur: z.string().optional(),
    url: z.string().url().optional(),
    note: z.string(),
  }),
});

export const collections = {
  flights, sim, posts, hardware, tools, links,
  pilots, films, spots, parts, wissen, gallery, status,
};

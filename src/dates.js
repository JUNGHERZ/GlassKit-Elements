// Date helpers shared by <glk-date-strip> and <glk-calendar>. Everything
// works on local calendar days — a date is "YYYY-MM-DD" in the element API
// and a local Date inside — so a day never shifts across midnight the way a
// UTC timestamp would. Names come from Intl, keyed by the element's locale
// attribute or the browser language.

export const pad = n => String(n).padStart(2, '0');

/** Local Date → "YYYY-MM-DD". */
export const isoDate = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** "YYYY-MM-DD" or "YYYY-MM" → local Date, or null when unreadable. */
export function parseIso(text) {
  const m = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(String(text ?? '').trim());
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3] ?? 1));
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Days after a date; the Date constructor rolls over month and year ends. */
export const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

/** A JSON object attribute → object; anything else → {}. */
export function parseJsonObject(text) {
  try {
    const v = JSON.parse(text || '{}');
    return v && typeof v === 'object' && !Array.isArray(v) ? v : {};
  } catch {
    return {};
  }
}

export function resolveLocale(attr) {
  return attr || (typeof navigator !== 'undefined' && navigator.language) || 'en';
}

// Intl formatters are cheap to keep and not to make; one set per locale.
const cache = new Map();
export function formatters(locale) {
  let f = cache.get(locale);
  if (!f) {
    try {
      f = {
        weekday: new Intl.DateTimeFormat(locale, { weekday: 'short' }),
        day: new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
        month: new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' })
      };
    } catch {
      return formatters('en');   // an unknown locale tag throws a RangeError
    }
    cache.set(locale, f);
  }
  return f;
}

/** Short weekday without the trailing dot some locales add ("Mo." → "Mo"). */
export const weekdayShort = (f, d) => f.weekday.format(d).replace(/\.$/, '');

/**
 * First day of the week for a locale, 0 = Sunday … 6 = Saturday. Read from
 * Intl.Locale where the browser has it (getWeekInfo(), or the older weekInfo
 * accessor); Monday where it cannot say.
 */
export function firstWeekday(locale) {
  try {
    const loc = new Intl.Locale(locale);
    const info = typeof loc.getWeekInfo === 'function' ? loc.getWeekInfo() : loc.weekInfo;
    if (info && info.firstDay >= 1 && info.firstDay <= 7) return info.firstDay % 7;
  } catch { /* no Intl.Locale, or an unknown tag */ }
  return 1;
}

/** A tone is a short lowercase token that becomes a __mark--<tone> modifier. */
export const isTone = v => typeof v === 'string' && /^[a-z][a-z0-9-]*$/.test(v);

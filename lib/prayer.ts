import {
  CalculationMethod,
  Coordinates,
  PrayerTimes,
  SunnahTimes,
  HighLatitudeRule,
  Madhab,
  Prayer,
} from 'adhan';
import { DateTime } from 'luxon';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const CALCULATION_METHODS = [
  { id: 'MuslimWorldLeague', name: 'Muslim World League', nameRu: 'Мировая Лига Мусульман', recommended: true },
  { id: 'Egyptian', name: 'Egyptian', nameRu: 'Египетский' },
  { id: 'Karachi', name: 'Karachi', nameRu: 'Карачи' },
  { id: 'UmmAlQura', name: 'Umm al-Qura', nameRu: 'Умм аль-Кура' },
  { id: 'Dubai', name: 'Dubai', nameRu: 'Дубай' },
  { id: 'Qatar', name: 'Qatar', nameRu: 'Катар' },
  { id: 'Kuwait', name: 'Kuwait', nameRu: 'Кувейт' },
  { id: 'Turkey', name: 'Turkey', nameRu: 'Турция' },
  { id: 'Tehran', name: 'Tehran', nameRu: 'Тегеран' },
  { id: 'NorthAmerica', name: 'ISNA', nameRu: 'Северная Америка' },
  { id: 'MoonsightingCommittee', name: 'Moonsighting', nameRu: 'Наблюдение Луны' },
] as const;

// Default iqamah offsets in minutes
const DEFAULT_IQAMAH_OFFSETS: Record<PrayerName, number> = {
  Fajr: 20,
  Sunrise: 0, // Sunrise has no iqamah
  Dhuhr: 10,
  Asr: 10,
  Maghrib: 10,
  Isha: 10,
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PrayerName = 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

export interface PrayerTimesResult {
  times: Record<PrayerName, string>;
  nextPrayer: {
    name: PrayerName;
    time: string;
    countdown: string;
  };
  sunnah: {
    middleOfTheNight: string;
    lastThirdOfTheNight: string;
  };
}

export interface IqamahTimes {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export interface DayPrayerTimes {
  date: string; // ISO date string YYYY-MM-DD
  times: Record<PrayerName, string>;
  sunnah: {
    middleOfTheNight: string;
    lastThirdOfTheNight: string;
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns true when latitude is high enough to require special handling (Russia etc.) */
export const isHighLatitude = (latitude: number): boolean => latitude > 48;

/**
 * Selects the appropriate HighLatitudeRule based on latitude.
 *
 * < 48°  → no rule (undefined / not set)
 * 48-55° → MiddleOfTheNight
 * 55-65° → SeventhOfTheNight
 * > 65°  → AngleBased  (polar / extreme latitudes)
 */
const selectHighLatitudeRule = (latitude: number): string | undefined => {
  const absLat = Math.abs(latitude);
  if (absLat < 48) return undefined;
  if (absLat < 55) return HighLatitudeRule.MiddleOfTheNight;
  if (absLat < 65) return HighLatitudeRule.SeventhOfTheNight;
  return HighLatitudeRule.AngleBased;
};

/** Build adhan CalculationParameters with latitude-aware high-latitude rule. */
const buildParams = (
  latitude: number,
  method: keyof typeof CalculationMethod,
  madhab: Madhab = Madhab.Shafi
) => {
  const params = CalculationMethod[method]();
  params.madhab = madhab;

  const rule = selectHighLatitudeRule(latitude);
  if (rule) {
    params.highLatitudeRule = rule;
  }

  return params;
};

/** Format a JS Date to HH:mm string using local device time. */
const formatTime = (date: Date): string =>
  DateTime.fromJSDate(date).toFormat('HH:mm');

/** Add minutes to a Date and return a new Date. */
const addMinutes = (date: Date, minutes: number): Date =>
  new Date(date.getTime() + minutes * 60 * 1000);

/** Capitalise first letter of a string. */
const capitalise = (s: string): string =>
  s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Map the adhan Prayer enum value to our PrayerName type.
 * adhan returns lowercase string keys matching Prayer enum members.
 */
const prayerEnumToName = (prayer: string): PrayerName => {
  const map: Record<string, PrayerName> = {
    fajr: 'Fajr',
    sunrise: 'Sunrise',
    dhuhr: 'Dhuhr',
    asr: 'Asr',
    maghrib: 'Maghrib',
    isha: 'Isha',
  };
  return map[prayer] ?? 'Fajr';
};

/** Build next-prayer info, properly handling the post-Isha / pre-Fajr gap. */
const buildNextPrayer = (
  prayerTimes: PrayerTimes,
  coords: Coordinates,
  date: Date,
  params: ReturnType<typeof buildParams>
): PrayerTimesResult['nextPrayer'] => {
  const next = prayerTimes.nextPrayer();

  let nextName: PrayerName;
  let nextDate: Date;

  if (next === Prayer.None) {
    // We are past Isha – next prayer is Fajr of the following day.
    nextName = 'Fajr';
    const tomorrow = new Date(date.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowPrayers = new PrayerTimes(coords, tomorrow, params);
    nextDate = tomorrowPrayers.fajr;
  } else {
    nextName = prayerEnumToName(next);
    nextDate = prayerTimes.timeForPrayer(next) ?? prayerTimes.fajr;
  }

  const nextDateTime = DateTime.fromJSDate(nextDate);
  const now = DateTime.now();
  const diff = nextDateTime.diff(now, ['hours', 'minutes']).toObject();
  const hours = Math.max(0, Math.floor(diff.hours ?? 0));
  const minutes = Math.max(0, Math.floor(diff.minutes ?? 0));
  const countdown = `${hours}h ${minutes}m`;

  return {
    name: nextName,
    time: formatTime(nextDate),
    countdown,
  };
};

// ---------------------------------------------------------------------------
// Main exported functions
// ---------------------------------------------------------------------------

/**
 * Calculate prayer times for the current moment.
 *
 * @param latitude   Device latitude
 * @param longitude  Device longitude
 * @param method     Adhan CalculationMethod key (default: MuslimWorldLeague)
 * @param madhab     Adhan Madhab value (default: Madhab.Shafi)
 * @param elevation  Optional elevation in metres (improves accuracy)
 */
export const getPrayerTimes = (
  latitude: number,
  longitude: number,
  method: keyof typeof CalculationMethod = 'MuslimWorldLeague',
  madhab: Madhab = Madhab.Shafi,
  elevation?: number
): PrayerTimesResult => {
  const coords =
    elevation !== undefined
      ? new Coordinates(latitude, longitude, elevation)
      : new Coordinates(latitude, longitude);

  const date = new Date();
  const params = buildParams(latitude, method, madhab);

  const prayerTimes = new PrayerTimes(coords, date, params);
  const sunnahTimes = new SunnahTimes(prayerTimes);

  const times: Record<PrayerName, string> = {
    Fajr: formatTime(prayerTimes.fajr),
    Sunrise: formatTime(prayerTimes.sunrise),
    Dhuhr: formatTime(prayerTimes.dhuhr),
    Asr: formatTime(prayerTimes.asr),
    Maghrib: formatTime(prayerTimes.maghrib),
    Isha: formatTime(prayerTimes.isha),
  };

  return {
    times,
    nextPrayer: buildNextPrayer(prayerTimes, coords, date, params),
    sunnah: {
      middleOfTheNight: formatTime(sunnahTimes.middleOfTheNight),
      lastThirdOfTheNight: formatTime(sunnahTimes.lastThirdOfTheNight),
    },
  };
};

/**
 * Calculate iqamah times based on adhan times plus configurable offsets.
 *
 * @param latitude   Device latitude
 * @param longitude  Device longitude
 * @param method     Adhan CalculationMethod key
 * @param madhab     Adhan Madhab value
 * @param offsets    Per-prayer offset overrides in minutes
 * @param elevation  Optional elevation in metres
 */
export const getIqamahTimes = (
  latitude: number,
  longitude: number,
  method: keyof typeof CalculationMethod = 'MuslimWorldLeague',
  madhab: Madhab = Madhab.Shafi,
  offsets: Partial<Record<PrayerName, number>> = {},
  elevation?: number
): IqamahTimes => {
  const coords =
    elevation !== undefined
      ? new Coordinates(latitude, longitude, elevation)
      : new Coordinates(latitude, longitude);

  const date = new Date();
  const params = buildParams(latitude, method, madhab);
  const prayerTimes = new PrayerTimes(coords, date, params);

  const merged = { ...DEFAULT_IQAMAH_OFFSETS, ...offsets };

  const iqamah = (adhanDate: Date, prayer: PrayerName): string =>
    formatTime(addMinutes(adhanDate, merged[prayer]));

  return {
    Fajr: iqamah(prayerTimes.fajr, 'Fajr'),
    Dhuhr: iqamah(prayerTimes.dhuhr, 'Dhuhr'),
    Asr: iqamah(prayerTimes.asr, 'Asr'),
    Maghrib: iqamah(prayerTimes.maghrib, 'Maghrib'),
    Isha: iqamah(prayerTimes.isha, 'Isha'),
  };
};

/**
 * Returns prayer times for 7 consecutive days starting from today (or a
 * given start date), useful for a weekly calendar view.
 *
 * @param latitude   Device latitude
 * @param longitude  Device longitude
 * @param method     Adhan CalculationMethod key
 * @param madhab     Adhan Madhab value
 * @param startDate  First day of the week (defaults to today)
 * @param elevation  Optional elevation in metres
 */
export const getPrayerTimesForWeek = (
  latitude: number,
  longitude: number,
  method: keyof typeof CalculationMethod = 'MuslimWorldLeague',
  madhab: Madhab = Madhab.Shafi,
  startDate: Date = new Date(),
  elevation?: number
): DayPrayerTimes[] => {
  const coords =
    elevation !== undefined
      ? new Coordinates(latitude, longitude, elevation)
      : new Coordinates(latitude, longitude);

  const params = buildParams(latitude, method, madhab);

  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(startDate);
    day.setDate(day.getDate() + i);
    // Normalise to midnight of that day
    day.setHours(0, 0, 0, 0);

    const prayerTimes = new PrayerTimes(coords, day, params);
    const sunnahTimes = new SunnahTimes(prayerTimes);

    const isoDate = DateTime.fromJSDate(day).toISODate() ?? day.toISOString().slice(0, 10);

    return {
      date: isoDate,
      times: {
        Fajr: formatTime(prayerTimes.fajr),
        Sunrise: formatTime(prayerTimes.sunrise),
        Dhuhr: formatTime(prayerTimes.dhuhr),
        Asr: formatTime(prayerTimes.asr),
        Maghrib: formatTime(prayerTimes.maghrib),
        Isha: formatTime(prayerTimes.isha),
      },
      sunnah: {
        middleOfTheNight: formatTime(sunnahTimes.middleOfTheNight),
        lastThirdOfTheNight: formatTime(sunnahTimes.lastThirdOfTheNight),
      },
    };
  });
};

// Re-export adhan primitives so callers don't need a second import
export { CalculationMethod, Madhab, HighLatitudeRule };

import {
  CalculationMethod,
  Coordinates,
  PrayerTimes,
  SunnahTimes,
  HighLatitudeRule,
} from 'adhan';
import { DateTime } from 'luxon';

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

export const getPrayerTimes = (
  latitude: number,
  longitude: number,
  method: keyof typeof CalculationMethod = 'MuslimWorldLeague'
): PrayerTimesResult => {
  const coords = new Coordinates(latitude, longitude);
  const date = new Date();
  const params = CalculationMethod[method]();
  params.madhab = 1; // Shafi'i by default, can be 2 for Hanafi
  params.highLatitudeRule = HighLatitudeRule.SeventhOfTheNight;

  const prayerTimes = new PrayerTimes(coords, date, params);
  const sunnahTimes = new SunnahTimes(prayerTimes);

  const formatTime = (date: Date) =>
    DateTime.fromJSDate(date).toFormat('HH:mm');

  const times: Record<PrayerName, string> = {
    Fajr: formatTime(prayerTimes.fajr),
    Sunrise: formatTime(prayerTimes.sunrise),
    Dhuhr: formatTime(prayerTimes.dhuhr),
    Asr: formatTime(prayerTimes.asr),
    Maghrib: formatTime(prayerTimes.maghrib),
    Isha: formatTime(prayerTimes.isha),
  };

  const next = prayerTimes.nextPrayer();
  const nextName = next === 'none' ? 'Fajr' : (next.charAt(0).toUpperCase() + next.slice(1)) as PrayerName;
  const nextDate = next === 'none' 
    ? new PrayerTimes(coords, new Date(date.getTime() + 24 * 60 * 60 * 1000), params).fajr 
    : prayerTimes.timeForPrayer(next)!;

  const nextDateTime = DateTime.fromJSDate(nextDate);
  const now = DateTime.now();
  const diff = nextDateTime.diff(now, ['hours', 'minutes']).toObject();
  
  const countdown = `${Math.floor(diff.hours || 0)}h ${Math.floor(diff.minutes || 0)}m`;

  return {
    times,
    nextPrayer: {
      name: nextName,
      time: formatTime(nextDate),
      countdown,
    },
    sunnah: {
      middleOfTheNight: formatTime(sunnahTimes.middleOfTheNight),
      lastThirdOfTheNight: formatTime(sunnahTimes.lastThirdOfTheNight),
    },
  };
};

import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Coordinates, CalculationMethod, PrayerTimes, SunnahTimes, Prayer, Qibla } from 'adhan';
import { DateTime } from 'luxon';

export interface PrayerTimeData {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  currentPrayer: string;
  nextPrayer: string;
  nextPrayerTime: string;
  qibla: number;
}

export function usePrayerTimes() {
  const [data, setData] = useState<PrayerTimeData | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  useEffect(() => {
    if (!location) return;

    const coords = new Coordinates(location.coords.latitude, location.coords.longitude);
    const date = new Date();
    
    // Default method for Russia often varies, but MWL or UOIF (France) are common.
    // For now, let's use Muslim World League as a good default for Europe/Russia.
    const params = CalculationMethod.MuslimWorldLeague();
    
    const prayerTimes = new PrayerTimes(coords, date, params);
    const sunnahTimes = new SunnahTimes(prayerTimes);
    const qiblaDirection = Qibla(coords);

    const formatTime = (date: Date) => DateTime.fromJSDate(date).toFormat('HH:mm');

    const current = prayerTimes.currentPrayer();
    const next = prayerTimes.nextPrayer();
    const nextTime = prayerTimes.timeForPrayer(next);

    setData({
      fajr: formatTime(prayerTimes.fajr),
      sunrise: formatTime(prayerTimes.sunrise),
      dhuhr: formatTime(prayerTimes.dhuhr),
      asr: formatTime(prayerTimes.asr),
      maghrib: formatTime(prayerTimes.maghrib),
      isha: formatTime(prayerTimes.isha),
      currentPrayer: current,
      nextPrayer: next,
      nextPrayerTime: nextTime ? formatTime(nextTime) : '',
      qibla: qiblaDirection,
    });
  }, [location]);

  return { data, location, errorMsg };
}

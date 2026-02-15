import { Coordinates, PrayerTimes, CalculationMethod, Madhab } from 'adhan';

export interface PrayerTimeResult {
    fajr: Date;
    sunrise: Date;
    dhuhr: Date;
    asr: Date;
    maghrib: Date;
    isha: Date;
}

export function getPrayerTimes(lat: number, lng: number, date: Date = new Date()): PrayerTimeResult {
    const coordinates = new Coordinates(lat, lng);
    const params = CalculationMethod.MuslimWorldLeague();
    params.madhab = Madhab.Hanafi;
    const prayerTimes = new PrayerTimes(coordinates, date, params);

    return {
        fajr: prayerTimes.fajr,
        sunrise: prayerTimes.sunrise,
        dhuhr: prayerTimes.dhuhr,
        asr: prayerTimes.asr,
        maghrib: prayerTimes.maghrib,
        isha: prayerTimes.isha,
    };
}

/**
 * Returns the next upcoming prayer.
 * If all prayers for today have passed, calculates tomorrow's fajr.
 */
export function getNextPrayer(
    times: PrayerTimeResult,
    lat?: number,
    lng?: number
): { name: string; time: Date } | null {
    const now = new Date();
    const prayers = [
        { name: 'fajr', time: times.fajr },
        { name: 'sunrise', time: times.sunrise },
        { name: 'dhuhr', time: times.dhuhr },
        { name: 'asr', time: times.asr },
        { name: 'maghrib', time: times.maghrib },
        { name: 'isha', time: times.isha },
    ];

    for (const prayer of prayers) {
        if (prayer.time > now) return prayer;
    }

    // All prayers passed — calculate TOMORROW'S fajr
    if (lat !== undefined && lng !== undefined) {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowTimes = getPrayerTimes(lat, lng, tomorrow);
        return { name: 'fajr', time: tomorrowTimes.fajr };
    }

    // Fallback: approx tomorrow fajr = today's fajr + 24h
    const tomorrowFajr = new Date(times.fajr.getTime() + 24 * 60 * 60 * 1000);
    return { name: 'fajr', time: tomorrowFajr };
}

export function getTimeRemaining(target: Date): string {
    const now = new Date();
    let diff = target.getTime() - now.getTime();
    if (diff < 0) diff += 24 * 60 * 60 * 1000;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function getQiblaDirection(lat: number, lng: number): number {
    const kaabaLat = 21.4225;
    const kaabaLng = 39.8262;

    const latRad = (lat * Math.PI) / 180;
    const lngRad = (lng * Math.PI) / 180;
    const kaabaLatRad = (kaabaLat * Math.PI) / 180;
    const kaabaLngRad = (kaabaLng * Math.PI) / 180;

    const dLng = kaabaLngRad - lngRad;
    const x = Math.sin(dLng);
    const y = Math.cos(latRad) * Math.tan(kaabaLatRad) - Math.sin(latRad) * Math.cos(dLng);

    let qibla = (Math.atan2(x, y) * 180) / Math.PI;
    if (qibla < 0) qibla += 360;
    return qibla;
}

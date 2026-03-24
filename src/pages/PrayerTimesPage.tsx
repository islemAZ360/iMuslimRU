// ═══════════════════════════════════════════════════════════════════════════
// Prayer Times Page - Muslim Russia
// ═══════════════════════════════════════════════════════════════════════════

import { useI18n } from '../lib/i18n'
import { useState, useEffect } from 'react'
import { Page, PageHeader, PageTitle, PageBody, Card, CardHeader, CardTitle, CardContent } from '@blinkdotnew/ui'
import { Clock, Bell, MapPin, RefreshCw, ChevronRight } from 'lucide-react'

interface PrayerTimes {
  fajr: string
  sunrise: string
  dhuhr: string
  asr: string
  maghrib: string
  isha: string
}

const russianCities = [
  { name: 'Moscow', nameRu: 'Москва', nameAr: 'موسكو', lat: 55.7558, lon: 37.6173, timezone: 3 },
  { name: 'Saint Petersburg', nameRu: 'Санкт-Петербург', nameAr: 'سان بطرسبورغ', lat: 59.9311, lon: 30.3609, timezone: 3 },
  { name: 'Kazan', nameRu: 'Казань', nameAr: 'قازان', lat: 55.8304, lon: 49.0661, timezone: 3 },
  { name: 'Dagestan', nameRu: 'Дагестан', nameAr: 'داغستان', lat: 42.9847, lon: 47.5497, timezone: 3 },
  { name: 'Chechnya', nameRu: 'Чечня', nameAr: 'الشيشان', lat: 43.4025, lon: 45.6509, timezone: 3 },
  { name: 'Tatarstan', nameRu: 'Татарстан', nameAr: 'تتارستان', lat: 55.1802, lon: 51.5427, timezone: 3 },
  { name: 'Ufa', nameRu: 'Уфа', nameAr: 'أوفا', lat: 54.7351, lon: 55.9927, timezone: 5 },
  { name: 'Novosibirsk', nameRu: 'Новосибирск', nameAr: 'نوفوسيبيرسك', lat: 55.0084, lon: 82.9357, timezone: 7 },
  { name: 'Yekaterinburg', nameRu: 'Екатеринбург', nameAr: 'يكاترينبرغ', lat: 56.8389, lon: 60.6057, timezone: 5 },
  { name: 'Krasnodar', nameRu: 'Краснодар', nameAr: 'كراسنودار', lat: 45.0448, lon: 38.9766, timezone: 3 },
]

const calculationMethods = [
  { id: 'mwl', name: 'Muslim World League', description: 'Standard calculation' },
  { id: 'isna', name: 'ISNA', description: 'North America' },
  { id: 'egypt', name: 'Egyptian', description: 'Egyptian General Authority' },
  { id: 'makkah', name: 'Umm Al-Qura', description: 'Makkah' },
]

function calculatePrayerTimes(lat: number, lon: number, date: Date, timezone: number) {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000)
  const declination = 23.45 * Math.sin((360 / 365) * (dayOfYear - 81) * Math.PI / 180)
  const equation = 9.87 * Math.sin(2 * ((360 / 365) * dayOfYear - 81) * Math.PI / 180) - 7.53 * Math.cos(((360 / 365) * dayOfYear - 81) * Math.PI / 180) - 1.5 * Math.sin(((360 / 365) * dayOfYear - 81) * Math.PI / 180)
  
  const noon = 12 - lon / 15 + equation + timezone - 3
  const fajrAngle = 18
  const ishaAngle = 17
  
  const toTime = (hours: number) => {
    const h = Math.floor(hours)
    const m = Math.floor((hours - h) * 60)
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
  }
  
  const sunDeclination = declination * Math.PI / 180
  const latRad = lat * Math.PI / 180
  
  const getTimeAtAngle = (angle: number) => {
    const cosH = (Math.cos((90 - angle) * Math.PI / 180) - Math.sin(sunDeclination) * Math.sin(latRad)) / (Math.cos(sunDeclination) * Math.cos(latRad))
    if (cosH > 1 || cosH < -1) return 0
    const H = Math.acos(cosH) * 180 / Math.PI
    return noon - H / 15
  }
  
  return {
    fajr: toTime(getTimeAtAngle(fajrAngle)),
    sunrise: toTime(getTimeAtAngle(90.833)),
    dhuhr: toTime(noon),
    asr: toTime(noon + 1.5),
    maghrib: toTime(24 - getTimeAtAngle(90.833)),
    isha: toTime(24 - getTimeAtAngle(ishaAngle))
  }
}

export default function PrayerTimesPage() {
  const { t, language } = useI18n()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedCity, setSelectedCity] = useState(russianCities[0])
  const [selectedMethod, setSelectedMethod] = useState('mwl')
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null)
  const [notifications, setNotifications] = useState(true)
  const [notifyBefore, setNotifyBefore] = useState(10)
  
  const isRTL = language === 'ar'

  useEffect(() => {
    const times = calculatePrayerTimes(selectedCity.lat, selectedCity.lon, currentDate, selectedCity.timezone)
    setPrayerTimes(times)
  }, [selectedCity, currentDate])

  const prayerData = [
    { key: 'fajr', icon: '🌅' },
    { key: 'sunrise', icon: '☀️' },
    { key: 'dhuhr', icon: '🌤️' },
    { key: 'asr', icon: '⛅' },
    { key: 'maghrib', icon: '🌇' },
    { key: 'isha', icon: '🌙' },
  ]

  // Get next prayer
  const getNextPrayer = () => {
    if (!prayerTimes) return null
    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    
    const prayers = [
      { name: 'fajr', time: prayerTimes.fajr },
      { name: 'dhuhr', time: prayerTimes.dhuhr },
      { name: 'asr', time: prayerTimes.asr },
      { name: 'maghrib', time: prayerTimes.maghrib },
      { name: 'isha', time: prayerTimes.isha },
    ]
    
    for (const prayer of prayers) {
      const [h, m] = prayer.time.split(':').map(Number)
      if (currentTime < h * 60 + m) {
        return prayer
      }
    }
    return prayers[0] // Tomorrow's fajr
  }

  const nextPrayer = getNextPrayer()

  return (
    <Page>
      <PageHeader>
        <PageTitle>{t.nav.prayerTimes}</PageTitle>
      </PageHeader>
      <PageBody className="p-4 md:p-6 space-y-6">
        {/* Next Prayer Card */}
        {nextPrayer && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-glow to-secondary p-6 text-white">
            <div className="absolute inset-0 bg-black/10" />
            <div className="relative z-10">
              <div className="text-sm opacity-80 mb-2">
                {language === 'ar' ? 'الصلاة القادمة' : language === 'ru' ? 'Следующий намаз' : 'Next Prayer'}
              </div>
              <div className="text-4xl font-bold mb-2">
                {t.prayer[nextPrayer.name as keyof typeof t.prayer]}
              </div>
              <div className="text-6xl font-bold">
                {prayerTimes?.[nextPrayer.name as keyof typeof prayerTimes]}
              </div>
            </div>
          </div>
        )}

        {/* City Selector */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="w-4 h-4" />
              {t.prayer.currentCity}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <select 
              value={selectedCity.name}
              onChange={(e) => setSelectedCity(russianCities.find(c => c.name === e.target.value) || russianCities[0])}
              className="w-full p-3 rounded-lg border bg-background"
            >
              {russianCities.map(city => (
                <option key={city.name} value={city.name}>
                  {language === 'ar' ? city.nameAr : language === 'ru' ? city.nameRu : city.name}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>

        {/* Prayer Times List */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="w-4 h-4" />
              {language === 'ar' ? 'أوقات الصلاة اليوم' : language === 'ru' ? 'Время намаза сегодня' : 'Today\'s Prayer Times'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {prayerData.map((item, index) => (
              <div 
                key={item.key}
                className={`flex items-center justify-between p-4 rounded-xl bg-muted/50 ${nextPrayer?.name === item.key ? 'ring-2 ring-primary bg-primary/5' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="font-medium">
                    {t.prayer[item.key as keyof typeof t.prayer]}
                  </span>
                </div>
                <span className="text-2xl font-bold text-primary">
                  {prayerTimes?.[item.key as keyof typeof prayerTimes]}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Date Navigation */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setCurrentDate(new Date(currentDate.getTime() - 86400000))}
            className="p-3 rounded-lg border hover:bg-muted"
          >
            <ChevronRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
          </button>
          <span className="font-medium">
            {currentDate.toLocaleDateString(language === 'ar' ? 'ar-SA' : language === 'ru' ? 'ru-RU' : 'en-US', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long' 
            })}
          </span>
          <button 
            onClick={() => setCurrentDate(new Date(currentDate.getTime() + 86400000))}
            className="p-3 rounded-lg border hover:bg-muted"
          >
            <ChevronRight className={`w-5 h-5 ${isRTL ? '' : 'rotate-180'}`} />
          </button>
        </div>

        {/* Calculation Method */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <RefreshCw className="w-4 h-4" />
              {t.prayer.calculationMethod}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {calculationMethods.map(method => (
                <label 
                  key={method.id}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${selectedMethod === method.id ? 'bg-primary/5 border-primary' : 'hover:bg-muted'}`}
                >
                  <div>
                    <div className="font-medium">{method.name}</div>
                    <div className="text-xs text-muted-foreground">{method.description}</div>
                  </div>
                  <input 
                    type="radio" 
                    name="method"
                    checked={selectedMethod === method.id}
                    onChange={() => setSelectedMethod(method.id)}
                    className="w-4 h-4"
                  />
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="w-4 h-4" />
              {t.prayer.notifications}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center justify-between">
              <span>{t.prayer.notifications}</span>
              <input 
                type="checkbox" 
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="w-5 h-5 rounded"
              />
            </label>
            {notifications && (
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  {t.prayer.notificationBefore}
                </label>
                <select 
                  value={notifyBefore}
                  onChange={(e) => setNotifyBefore(Number(e.target.value))}
                  className="w-full p-3 rounded-lg border bg-background"
                >
                  <option value={5}>5 {language === 'ar' ? 'دقائق' : language === 'ru' ? 'минут' : 'minutes'}</option>
                  <option value={10}>10 {language === 'ar' ? 'دقائق' : language === 'ru' ? 'минут' : 'minutes'}</option>
                  <option value={15}>15 {language === 'ar' ? 'دقائق' : language === 'ru' ? 'минут' : 'minutes'}</option>
                  <option value={30}>30 {language === 'ar' ? 'دقيقة' : language === 'ru' ? 'минут' : 'minutes'}</option>
                </select>
              </div>
            )}
          </CardContent>
        </Card>
      </PageBody>
    </Page>
  )
}
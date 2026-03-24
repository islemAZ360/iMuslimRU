// ═══════════════════════════════════════════════════════════════════════════
// Home Page - Muslim Russia
// ═══════════════════════════════════════════════════════════════════════════

import { useI18n } from '../lib/i18n'
import { useState, useEffect } from 'react'
import { Page, PageHeader, PageTitle, PageBody } from '@blinkdotnew/ui'
import { 
  Clock, BookOpen, Compass, Camera, Moon, 
  Calendar, Star, ArrowRight, Sparkles
} from 'lucide-react'

interface PrayerTimes {
  fajr: string
  sunrise: string
  dhuhr: string
  asr: string
  maghrib: string
  isha: string
}

// Russian cities for prayer times
const russianCities = [
  { name: 'Moscow', nameRu: 'Москва', nameAr: 'موسكو', lat: 55.7558, lon: 37.6173 },
  { name: 'Saint Petersburg', nameRu: 'Санкт-Петербург', nameAr: 'سان بطرسبورغ', lat: 59.9311, lon: 30.3609 },
  { name: 'Kazan', nameRu: 'Казань', nameAr: 'قازان', lat: 55.8304, lon: 49.0661 },
  { name: 'Dagestan', nameRu: 'Дагестан', nameAr: 'داغستان', lat: 42.9847, lon: 47.5497 },
  { name: 'Chechnya', nameRu: 'Чечня', nameAr: 'الشيشان', lat: 43.4025, lon: 45.6509 },
  { name: 'Tatarstan', nameRu: 'Татарстан', nameAr: 'تتارستان', lat: 55.1802, lon: 51.5427 },
  { name: 'Ufa', nameRu: 'Уфа', nameAr: 'أوفا', lat: 54.7351, lon: 55.9927 },
  { name: 'Novosibirsk', nameRu: 'Новосибирск', nameAr: 'نوفوسيبيرسك', lat: 55.0084, lon: 82.9357 },
]

// Calculate prayer times (simplified algorithm)
function calculatePrayerTimes(lat: number, lon: number, date: Date) {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000)
  const declination = 23.45 * Math.sin((360 / 365) * (dayOfYear - 81) * Math.PI / 180)
  const equation = 9.87 * Math.sin(2 * ((360 / 365) * dayOfYear - 81) * Math.PI / 180) - 7.53 * Math.cos(((360 / 365) * dayOfYear - 81) * Math.PI / 180) - 1.5 * Math.sin(((360 / 365) * dayOfYear - 81) * Math.PI / 180)
  
  const noon = 12 - lon / 15 + equation
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

export default function HomePage() {
  const { t, language } = useI18n()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null)
  const [selectedCity, setSelectedCity] = useState(russianCities[0])
  
  const isRTL = language === 'ar'

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    // Calculate prayer times for selected city
    const times = calculatePrayerTimes(selectedCity.lat, selectedCity.lon, new Date())
    setPrayerTimes(times)
  }, [selectedCity])

  const features = [
    { icon: Clock, title: t.nav.prayerTimes, desc: t.prayer.currentCity, href: '/prayer-times', color: 'from-emerald-500 to-teal-600' },
    { icon: BookOpen, title: t.nav.azkar, desc: language === 'ar' ? 'أذكار اليوم' : language === 'ru' ? 'Зикры дня' : 'Daily Azkar', href: '/azkar', color: 'from-amber-500 to-orange-600' },
    { icon: Compass, title: t.nav.qibla, desc: t.qibla.title, href: '/qibla', color: 'from-blue-500 to-indigo-600' },
    { icon: Camera, title: t.nav.halal, desc: t.halal.title, href: '/halal', color: 'from-rose-500 to-pink-600' },
    { icon: Moon, title: t.nav.ramadan, desc: t.ramadan.title, href: '/ramadan', color: 'from-violet-500 to-purple-600' },
    { icon: Calendar, title: t.nav.events, desc: t.events.title, href: '/events', color: 'from-cyan-500 to-sky-600' },
  ]

  const cityNames = {
    ar: selectedCity.nameAr,
    ru: selectedCity.nameRu,
    en: selectedCity.name
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(language === 'ar' ? 'ar-SA' : language === 'ru' ? 'ru-RU' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : language === 'ru' ? 'ru-RU' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <Page>
      <PageBody className="p-4 md:p-6 space-y-6">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-glow to-secondary p-6 text-white">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAwIEw0MCAzNiBMMzYgNzIgTDI4IDM2WiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L2c+PC9zdmc+')] opacity-30" />
          <div className="relative z-10">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">
                  {language === 'ar' ? 'المسلم في Russia' : language === 'ru' ? 'Мусульманин в России' : 'Muslim in Russia'}
                </h1>
                <p className="text-white/80 text-sm">{formatDate(currentTime)}</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-mono font-bold">{formatTime(currentTime)}</div>
                <div className="text-white/70 text-sm">
                  {language === 'ar' ? selectedCity.nameAr : language === 'ru' ? selectedCity.nameRu : selectedCity.name}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        {prayerTimes && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(prayerTimes).map(([key, value]) => (
              <div key={key} className="bg-card rounded-xl p-4 border shadow-sm">
                <div className="text-xs text-muted-foreground mb-1 capitalize">
                  {t.prayer[key as keyof typeof t.prayer] || key}
                </div>
                <div className="text-xl font-semibold text-primary">{value}</div>
              </div>
            ))}
          </div>
        )}

        {/* City Selector */}
        <div className="bg-card rounded-xl p-4 border shadow-sm">
          <label className="text-sm font-medium mb-2 block">{t.prayer.selectCity}</label>
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
        </div>

        {/* Features Grid */}
        <div>
          <h2 className="text-lg font-semibold mb-4">
            {language === 'ar' ? 'الخدمات' : language === 'ru' ? 'Услуги' : 'Services'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <a
                key={feature.href}
                href={feature.href}
                className={`group relative overflow-hidden rounded-xl p-5 bg-card border shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 animate-fade-in stagger-${index + 1}`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground">{feature.desc}</p>
                </div>
                <ArrowRight className={`absolute bottom-4 ${isRTL ? 'left-4 rotate-180' : 'right-4'} w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1`} />
              </a>
            ))}
          </div>
        </div>

        {/* Favorite Azkar Preview */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-xl p-5 border">
          <div className="flex items-center gap-3 mb-3">
            <Star className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold">{t.azkar.favorite}</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {language === 'ar' ? 'لا توجد أذكار مفضلة بعد' : language === 'ru' ? 'Пока нет избранных зикров' : 'No favorite azkar yet'}
          </p>
          <a href="/azkar" className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline">
            {language === 'ar' ? 'تصفح الأذكار' : language === 'ru' ? 'Просмотр зикров' : 'Browse Azkar'}
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Islamic Quote */}
        <div className="bg-card rounded-xl p-6 border text-center">
          <Sparkles className="w-8 h-8 text-secondary mx-auto mb-3" />
          <blockquote className="text-lg font-serif italic text-foreground mb-2">
            {language === 'ar' ? '"من طرق الخير أن تذكر أخاك بما يحب أن يسمع به"' : language === 'ru' ? '"Одним из видов добра является то, что ты говоришь своему брату то, что он любит слышать"' : '"One of the acts of goodness is to speak to your brother what he loves to hear"'}
          </blockquote>
          <cite className="text-sm text-muted-foreground">
            — {language === 'ar' ? 'رسول الله ﷺ' : language === 'ru' ? 'Посланник Аллаха ﷺ' : 'Prophet Muhammad ﷺ'}
          </cite>
        </div>
      </PageBody>
    </Page>
  )
}
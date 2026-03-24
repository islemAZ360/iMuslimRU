// ═══════════════════════════════════════════════════════════════════════════
// Qibla Direction Page - Muslim Russia
// ═══════════════════════════════════════════════════════════════════════════

import { useI18n } from '../lib/i18n'
import { useState, useEffect } from 'react'
import { Page, PageHeader, PageTitle, PageBody, Card, CardHeader, CardTitle, CardContent } from '@blinkdotnew/ui'
import { Compass, MapPin, Navigation, RefreshCw, Target } from 'lucide-react'

// Kaaba coordinates
const KAABA_LAT = 21.4225
const KAABA_LON = 39.8262

export default function QiblaPage() {
  const { t, language } = useI18n()
  const [qiblaDirection, setQiblaDirection] = useState(0)
  const [userLat, setUserLat] = useState<number | null>(null)
  const [userLon, setUserLon] = useState<number | null>(null)
  const [compassAngle, setCompassAngle] = useState(0)
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const isRTL = language === 'ar'

  useEffect(() => {
    // Get user location
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLat(position.coords.latitude)
          setUserLon(position.coords.longitude)
          setAccuracy(position.coords.accuracy)
          
          // Calculate Qibla direction
          const lat = position.coords.latitude * Math.PI / 180
          const lon = position.coords.longitude * Math.PI / 180
          const kaabaLat = KAABA_LAT * Math.PI / 180
          const kaabaLon = KAABA_LON * Math.PI / 180
  
          const dLon = kaabaLon - lon
          const y = Math.sin(dLon)
          const x = Math.cos(lat) * Math.tan(kaabaLat) - Math.sin(lat) * Math.cos(dLon)
          let bearing = Math.atan2(y, x) * 180 / Math.PI
          bearing = (bearing + 360) % 360
          
          setQiblaDirection(bearing)
          setLoading(false)
        },
        (err) => {
          setError(language === 'ar' ? 'تعذر الحصول على الموقع' : language === 'ru' ? 'Не удалось получить местоположение' : 'Could not get location')
          // Use Moscow as default
          setUserLat(55.7558)
          setUserLon(37.6173)
          setLoading(false)
        }
      )
    } else {
      setUserLat(55.7558)
      setUserLon(37.6173)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Listen for device orientation for compass
    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.alpha !== null) {
        setCompassAngle(event.alpha)
      }
    }
    
    if ('DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', handleOrientation)
    }
    
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation)
    }
  }, [])

  // Calculate relative direction for the compass needle
  const relativeDirection = (qiblaDirection - compassAngle + 360) % 360

  const getDirectionLabel = (angle: number) => {
    const directions = [
      { en: 'North', ru: 'Север', ar: 'شمال' },
      { en: 'NE', ru: 'С-В', ar: 'شمال شرق' },
      { en: 'East', ru: 'Восток', ar: 'شرق' },
      { en: 'SE', ru: 'Ю-В', ar: 'جنوب شرق' },
      { en: 'South', ru: 'Юг', ar: 'جنوب' },
      { en: 'SW', ru: 'Ю-З', ar: 'جنوب غرب' },
      { en: 'West', ru: 'Запад', ar: 'غرب' },
      { en: 'NW', ru: 'С-З', ar: 'شمال غرب' },
    ]
    const index = Math.round(angle / 45) % 8
    return directions[index]
  }

  return (
    <Page>
      <PageHeader>
        <PageTitle>{t.qibla.title}</PageTitle>
      </PageHeader>
      <PageBody className="p-4 md:p-6 space-y-6">
        {/* Compass Display */}
        <div className="relative">
          <div className="aspect-square max-w-md mx-auto relative">
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 border-4 border-primary/20" />
            
            {/* Compass face */}
            <div className="absolute inset-4 rounded-full bg-card border shadow-lg flex items-center justify-center">
              {/* Direction markers */}
              <div className="absolute inset-0">
                {['N', 'E', 'S', 'W'].map((dir, i) => (
                  <span 
                    key={dir}
                    className="absolute text-sm font-bold text-muted-foreground"
                    style={{
                      top: '10%',
                      left: '50%',
                      transform: `translateX(-50%) rotate(${i * 90}deg)`,
                    }}
                  >
                    {dir}
                  </span>
                ))}
              </div>
              
              {/* Qibla indicator */}
              <div 
                className="absolute w-full h-full flex items-center justify-center"
                style={{ transform: `rotate(${qiblaDirection}deg)` }}
              >
                <div className="relative">
                  {/* Kaaba icon pointing to Qibla */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg animate-pulse-gentle">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  {/* Direction arrow */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                    <div className="w-0 h-0 border-l-8 border-r-8 border-b-16 border-l-transparent border-r-transparent border-amber-500" />
                  </div>
                </div>
              </div>
              
              {/* Center dot */}
              <div className="absolute w-4 h-4 rounded-full bg-primary" />
            </div>
          </div>
          
          {/* Direction text */}
          <div className="text-center mt-6">
            <div className="text-5xl font-bold text-primary mb-2">
              {Math.round(qiblaDirection)}°
            </div>
            <div className="text-lg text-muted-foreground">
              {getDirectionLabel(qiblaDirection)[language as 'ar' | 'ru' | 'en']}
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <MapPin className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className="text-xs text-muted-foreground mb-1">{t.qibla.latitude}</div>
              <div className="font-semibold">{userLat?.toFixed(4) || '—'}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <MapPin className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className="text-xs text-muted-foreground mb-1">{t.qibla.longitude}</div>
              <div className="font-semibold">{userLon?.toFixed(4) || '—'}</div>
            </CardContent>
          </Card>
        </div>

        {/* Accuracy */}
        {accuracy !== null && (
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-primary" />
                <span>{t.qibla.accuracy}</span>
              </div>
              <span className="font-semibold">
                ±{Math.round(accuracy)}m
              </span>
            </CardContent>
          </Card>
        )}

        {/* Status */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-muted-foreground">{t.common.loading}</p>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {language === 'ar' ? 'كيفية الاستخدام' : language === 'ru' ? 'Как использовать' : 'How to Use'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className={`space-y-2 text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
              <li className="flex items-start gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs flex-shrink-0">1</span>
                <span>{language === 'ar' ? 'وجّه هاتفك بحيث يشير المؤشر الذهبي نحو الكعبة' : language === 'ru' ? 'Направьте телефон так, чтобы золотой индикатор указывал на Каабу' : 'Point your phone so the golden indicator points towards the Kaaba'}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs flex-shrink-0">2</span>
                <span>{language === 'ar' ? 'المسجد الحرام находится في اتجاه القبلة من موقعك' : language === 'ru' ? 'Мечеть аль-Харам находится в направлении киблы от вашего местоположения' : 'The Holy Mosque is in the Qibla direction from your location'}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs flex-shrink-0">3</span>
                <span>{language === 'ar' ? 'للحصول على أفضل النتائج، أمسك الهاتف بشكل مسطح' : language === 'ru' ? 'Для лучших результатов держите телефон ровно' : 'For best results, hold your phone flat'}</span>
              </li>
            </ol>
          </CardContent>
        </Card>
      </PageBody>
    </Page>
  )
}
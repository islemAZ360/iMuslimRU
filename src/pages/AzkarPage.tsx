// ═══════════════════════════════════════════════════════════════════════════
// Azkar Page - Muslim Russia
// ═══════════════════════════════════════════════════════════════════════════

import { useI18n } from '../lib/i18n'
import { useState } from 'react'
import { Page, PageHeader, PageTitle, PageBody, Card, CardHeader, CardTitle, CardContent, Tabs, TabsList, TabsTrigger, TabsContent } from '@blinkdotnew/ui'
import { Star, Heart, Plus, Minus, RefreshCw, BookOpen, Sun, Moon, MoonStar, CloudMoon, Sunrise } from 'lucide-react'

interface Zikr {
  id: string
  arabic: string
  transliteration: string
  translation: string
  count: number
  source?: string
}

// Azkar data
const morningAzkar: Zikr[] = [
  { id: '1', arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ', transliteration: 'Asbahna wa asbal-mulku lillahi', translation: 'We have entered the morning and the kingdom belongs to Allah', count: 1, source: 'Al-Bukhari' },
  { id: '2', arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا', transliteration: 'Allahumma bika asbahna wa bika amsayna', translation: 'O Allah, by You we enter the morning and by You we enter the evening', count: 1, source: 'Al-Bukhari' },
  { id: '3', arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ', transliteration: 'A\'udhu bi kalimatillah al-tammat', translation: 'I seek refuge in the perfect words of Allah', count: 3, source: 'Al-Bukhari' },
  { id: '4', arabic: 'اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ', transliteration: 'Allahumma a\'ini ala dhikrika wa shukrika wa husni ibadatika', translation: 'O Allah, help me to remember You, thank You, and worship You well', count: 1, source: 'Abu Dawud' },
  { id: '5', arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ', transliteration: 'Subhan Allah wa bi hamdihi adada khalqihi', translation: 'Glory be to Allah and praise Him as many as His creation', count: 100, source: 'Muslim' },
  { id: '6', arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ', transliteration: 'La ilaha illallah wahdahu la sharika lah', translation: 'There is no god but Allah alone, He has no partner', count: 100, source: 'Al-Bukhari' },
]

const eveningAzkar: Zikr[] = [
  { id: '1', arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ', transliteration: 'Amsayna wa amsa al-mulku lillahi', translation: 'We have entered the evening and the kingdom belongs to Allah', count: 1 },
  { id: '2', arabic: 'اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ نُصْبِحُ', transliteration: 'Allahumma bika amsayna wa bika nusbahu', translation: 'O Allah, by You we enter the evening and by You we enter the morning', count: 1 },
  { id: '3', arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ', transliteration: 'A\'udhu bi kalimatillah al-tammat min sharri ma khalaqa', translation: 'I seek refuge in the perfect words of Allah from the evil of what He created', count: 3 },
  { id: '4', arabic: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ', transliteration: 'Allahumma sali wa sallim ala nabiyyina Muhammad', translation: 'O Allah, send prayers and peace upon our Prophet Muhammad', count: 100 },
  { id: '5', arabic: 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيَّ الْقَيُّومَ', transliteration: 'Astaghfirullah al-\'azim alladi la ilaha illa huwa al-hayy al-qayyum', translation: 'I ask forgiveness from Allah, the Mighty, there is no god but He, the Living, the Eternal', count: 3 },
]

const afterPrayerAzkar: Zikr[] = [
  { id: '1', arabic: 'أَسْتَغْفِرُ اللَّهَ', transliteration: 'Astaghfirullah', translation: 'I seek forgiveness from Allah', count: 3 },
  { id: '2', arabic: 'اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ', transliteration: 'Allahumma anta al-salam wa minka al-salam', translation: 'O Allah, You are the Source of Peace and from You comes peace', count: 1 },
  { id: '3', arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ', transliteration: 'La ilaha illallah wahdahu la sharika lah al-mulku wa lah al-hamd', translation: 'There is no god but Allah alone, to Him belongs the kingdom and to Him belongs praise', count: 1 },
  { id: '4', arabic: 'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ وَتَبَارَكَ اسْمُكَ وَتَعَالَى جَدُّكَ', transliteration: 'Subhanaka Allahumma wa bi hamdika wa tabarakismuka wa ta\'ala jadduka', translation: 'Glory be to You O Allah, and praise, blessed is Your Name, exalted is Your Greatness', count: 1 },
]

const sleepAzkar: Zikr[] = [
  { id: '1', arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا', transliteration: 'Bismika Allahumma amutu wa ahy', translation: 'In Your name O Allah, I die and live', count: 1 },
  { id: '2', arabic: 'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ', transliteration: 'Allahumma qini \'adhabak yawm tab\'ath \'ibadaka', translation: 'O Allah, protect me from Your punishment on the Day You resurrect Your servants', count: 1 },
  { id: '3', arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَكَفَانَا وَآوَانَا', transliteration: 'Al-hamdu lillahi alladi at\'amana wa saqana wa kafana wa awana', translation: 'Praise be to Allah who fed us, gave us drink, sufficed us, and sheltered us', count: 1 },
  { id: '4', arabic: 'اللَّهُمَّ بِعِزَّتِكَ لَا يَنَامُ مَنْ نَامَ بِرِضَاكَ', transliteration: 'Allahumma bi \'izzatika la yanam man nama bi ridhaka', translation: 'O Allah, by Your glory, no one who sleeps in Your pleasure will sleep', count: 1 },
]

export default function AzkarPage() {
  const { t, language } = useI18n()
  const [selectedCategory, setSelectedCategory] = useState('morning')
  const [counters, setCounters] = useState<Record<string, number>>({})
  const [favorites, setFavorites] = useState<string[]>([])
  const [counter, setCounter] = useState(0)
  
  const isRTL = language === 'ar'

  const getAzkarByCategory = (category: string) => {
    switch (category) {
      case 'morning': return morningAzkar
      case 'evening': return eveningAzkar
      case 'afterPrayer': return afterPrayerAzkar
      case 'sleep': return sleepAzkar
      default: return morningAzkar
    }
  }

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    )
  }

  const resetCounter = () => setCounter(0)

  const categories = [
    { id: 'morning', icon: Sunrise, label: t.azkar.morning },
    { id: 'evening', icon: Moon, label: t.azkar.evening },
    { id: 'afterPrayer', icon: BookOpen, label: t.azkar.afterPrayer },
    { id: 'sleep', icon: CloudMoon, label: t.azkar.sleep },
  ]

  return (
    <Page>
      <PageHeader>
        <PageTitle>{t.nav.azkar}</PageTitle>
      </PageHeader>
      <PageBody className="p-4 md:p-6 space-y-6">
        {/* Counter */}
        <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl p-6 text-white text-center">
          <div className="text-sm opacity-80 mb-2">{t.azkar.counter}</div>
          <div className="text-6xl font-bold mb-4">{counter}</div>
          <div className="flex items-center justify-center gap-4">
            <button 
              onClick={() => setCounter(c => c + 1)}
              className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <Plus className="w-8 h-8" />
            </button>
            <button 
              onClick={resetCounter}
              className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="w-full grid grid-cols-4">
            {categories.map(cat => (
              <TabsTrigger key={cat.id} value={cat.id} className="flex flex-col gap-1 py-3">
                <cat.icon className="w-5 h-5" />
                <span className="text-xs">{cat.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          {categories.map(cat => (
            <TabsContent key={cat.id} value={cat.id} className="space-y-3 mt-4">
              {getAzkarByCategory(cat.id).map((zikr, index) => (
                <Card key={zikr.id} className={`overflow-hidden animate-fade-in stagger-${index + 1}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <p className="text-xl font-serif text-primary mb-2 leading-relaxed" dir="rtl">
                          {zikr.arabic}
                        </p>
                        <p className="text-sm text-muted-foreground italic mb-1">
                          {zikr.transliteration}
                        </p>
                        <p className="text-sm text-foreground">
                          {zikr.translation}
                        </p>
                      </div>
                      <button 
                        onClick={() => toggleFavorite(zikr.id)}
                        className={`p-2 rounded-full transition-colors ${favorites.includes(zikr.id) ? 'text-amber-500 bg-amber-50' : 'text-muted-foreground hover:bg-muted'}`}
                      >
                        <Heart className={`w-5 h-5 ${favorites.includes(zikr.id) ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {language === 'ar' ? 'العدد' : language === 'ru' ? 'Счёт' : 'Count'}:
                        </span>
                        <span className="font-bold text-primary">{zikr.count}</span>
                      </div>
                      {zikr.source && (
                        <span className="text-xs text-muted-foreground">
                          {language === 'ar' ? 'المصدر' : language === 'ru' ? 'Источник' : 'Source'}: {zikr.source}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          ))}
        </Tabs>

        {/* Favorites Section */}
        {favorites.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              {t.azkar.favorite}
            </h3>
            <div className="space-y-2">
              {favorites.map(favId => {
                const zikr = [...morningAzkar, ...eveningAzkar, ...afterPrayerAzkar, ...sleepAzkar].find(z => z.id === favId)
                if (!zikr) return null
                return (
                  <Card key={favId}>
                    <CardContent className="p-3">
                      <p className="text-sm font-serif" dir="rtl">{zikr.arabic}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}
      </PageBody>
    </Page>
  )
}
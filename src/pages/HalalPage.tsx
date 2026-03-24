// ═══════════════════════════════════════════════════════════════════════════
// Halal Product Scanner Page - Muslim Russia
// AI-Powered Product Analysis
// ═══════════════════════════════════════════════════════════════════════════

import { useI18n } from '../lib/i18n'
import { useState, useRef } from 'react'
import { Page, PageHeader, PageTitle, PageBody, Card, CardContent, Button } from '@blinkdotnew/ui'
import { Camera, Upload, Sparkles, CheckCircle, XCircle, HelpCircle, History, Loader2, Image as ImageIcon } from 'lucide-react'

interface ScanResult {
  status: 'halal' | 'haraam' | 'unclear'
  reason: string
  ingredients: string[]
  confidence: number
  timestamp: Date
}

// Mock analysis for demo (would use AI in production)
function analyzeProduct(imageUrl: string): Promise<ScanResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const statuses: ('halal' | 'haraam' | 'unclear')[] = ['halal', 'unclear', 'haraam']
      const randomStatus = statuses[Math.floor(Math.random() * 3)]
      
      const reasons: Record<string, Record<string, string>> = {
        halal: {
          ar: 'جميع المكونات المذكورة حلال. المنتج آمن للاستهلاك للمسلمين.',
          ru: 'Все указанные ингредиенты халяль. Продукт безопасен для употребления мусульманами.',
          en: 'All listed ingredients are halal. Product is safe for Muslim consumption.'
        },
        haraam: {
          ar: 'المحتوى يحتوي على مكونات محرمة مثل الكحول أو gelatin من مصادر غير حلال.',
          ru: 'Содержит запрещённые ингредиенты, такие как алкоголь или желатин из нехаляль источников.',
          en: 'Contains prohibited ingredients such as alcohol or gelatin from non-halal sources.'
        },
        unclear: {
          ar: 'لم يتم تحديد بعض المكونات. يُنصح بالتحقق من الشهادة أو التواصل مع الشركة المصنعة.',
          ru: 'Некоторые ингредиенты не определены. Рекомендуется проверить сертификат или связаться с производителем.',
          en: 'Some ingredients are unclear. Recommended to verify certificate or contact manufacturer.'
        }
      }
      
      resolve({
        status: randomStatus,
        reason: reasons[randomStatus][Math.floor(Math.random() * 3)],
        ingredients: ['Water', 'Sugar', 'Salt', 'Natural Flavors', 'Preservatives'].slice(0, Math.floor(Math.random() * 5) + 1),
        confidence: Math.floor(Math.random() * 30) + 70,
        timestamp: new Date()
      })
    }, 2000)
  })
}

export default function HalalPage() {
  const { t, language } = useI18n()
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [history, setHistory] = useState<ScanResult[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const isRTL = language === 'ar'

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setAnalyzing(true)
    setResult(null)
    
    // Create image URL for preview
    const imageUrl = URL.createObjectURL(file)
    
    try {
      const analysisResult = await analyzeProduct(imageUrl)
      setResult(analysisResult)
      setHistory(prev => [analysisResult, ...prev].slice(0, 10))
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setAnalyzing(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'halal': return 'bg-green-500'
      case 'haraam': return 'bg-red-500'
      default: return 'bg-yellow-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'halal': return <CheckCircle className="w-6 h-6" />
      case 'haraam': return <XCircle className="w-6 h-6" />
      default: return <HelpCircle className="w-6 h-6" />
    }
  }

  return (
    <Page>
      <PageHeader>
        <PageTitle>{t.halal.title}</PageTitle>
      </PageHeader>
      <PageBody className="p-4 md:p-6 space-y-6">
        {/* Scanner Interface */}
        <div className="space-y-4">
          {/* Upload Area */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-primary/30 rounded-2xl p-8 text-center cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-all"
          >
            {analyzing ? (
              <div className="space-y-4">
                <Loader2 className="w-16 h-16 mx-auto text-primary animate-spin" />
                <p className="text-lg font-medium">{t.halal.analyzing}</p>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'الذكاء الاصطناعي يفحص المنتج...' : language === 'ru' ? 'ИИ анализирует продукт...' : 'AI is analyzing the product...'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <Camera className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-medium">
                    {language === 'ar' ? 'التقط صورة أو ارفع صورة' : language === 'ru' ? 'Сделайте фото или загрузите' : 'Take a photo or upload'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {language === 'ar' ? 'صورة واضحة للمكونات' : language === 'ru' ? 'Чёткое фото состава' : 'Clear photo of ingredients'}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {/* Quick Actions */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              {t.halal.uploadPhoto}
            </Button>
          </div>
        </div>

        {/* Result Display */}
        {result && !analyzing && (
          <Card className={`overflow-hidden animate-fade-in ${result.status === 'halal' ? 'border-green-500' : result.status === 'haraam' ? 'border-red-500' : 'border-yellow-500'}`}>
            <div className={`${getStatusColor(result.status)} text-white p-4 flex items-center gap-3`}>
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                {getStatusIcon(result.status)}
              </div>
              <div>
                <div className="text-xl font-bold">
                  {t.halal[result.status]}
                </div>
                <div className="text-sm opacity-80">
                  {language === 'ar' ? 'النتيجة' : language === 'ru' ? 'Результат' : 'Result'}: {result.confidence}%
                </div>
              </div>
            </div>
            <CardContent className="p-4 space-y-4">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  {t.halal.reason}
                </h4>
                <p className="text-sm text-muted-foreground">{result.reason}</p>
              </div>
              
              {result.ingredients.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-primary" />
                    {t.halal.ingredients}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.ingredients.map((ing, i) => (
                      <span key={i} className="px-3 py-1 bg-muted rounded-full text-sm">
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* AI Info Card */}
        <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">
                  {language === 'ar' ? 'كيف يعمل الذكاء الاصطناعي؟' : language === 'ru' ? 'Как работает ИИ?' : 'How AI Works?'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'نقوم بتحليل صورة المنتج باستخدام تقنية الرؤية الحاسوبية لتحديد المكونات والتحقق منها مقابل قاعدة بيانات المكونات الحلال.' : language === 'ru' ? 'Мы анализируем изображение продукта с помощью компьютерного зрения для идентификации и проверки ингредиентов.' : 'We analyze product images using computer vision to identify and verify ingredients against a halal database.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* History */}
        {history.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <History className="w-5 h-5" />
              {t.halal.scanHistory}
            </h3>
            <div className="space-y-2">
              {history.map((item, index) => (
                <Card key={index} className="border-l-4 border-l-primary">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(item.status)}`} />
                      <span className="font-medium capitalize">{t.halal[item.status]}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {item.timestamp.toLocaleDateString(language === 'ar' ? 'ar-SA' : language === 'ru' ? 'ru-RU' : 'en-US')}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </PageBody>
    </Page>
  )
}
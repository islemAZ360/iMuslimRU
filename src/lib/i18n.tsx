// ═══════════════════════════════════════════════════════════════════════════
// Multi-language System for Muslim Russia
// Supported: Arabic (ar), Russian (ru), English (en)
// ═══════════════════════════════════════════════════════════════════════════

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Language = 'ar' | 'ru' | 'en'

interface Translations {
  // Navigation
  nav: {
    home: string
    prayerTimes: string
    azkar: string
    qibla: string
    halal: string
    ramadan: string
    events: string
    stats: string
    settings: string
  }
  // Prayer Times
  prayer: {
    fajr: string
    sunrise: string
    dhuhr: string
    asr: string
    maghrib: string
    isha: string
    currentCity: string
    selectCity: string
    calculationMethod: string
    notifications: string
    notificationBefore: string
    loading: string
    error: string
  }
  // Azkar
  azkar: {
    morning: string
    evening: string
    afterPrayer: string
    sleep: string
    wakeup: string
    ramadan: string
    tashbih: string
    favorite: string
    counter: string
    addToFavorites: string
    removeFromFavorites: string
  }
  // Qibla
  qibla: {
    title: string
    direction: string
    compass: string
    latitude: string
    longitude: string
    accuracy: string
  }
  // Halal
  halal: {
    title: string
    scanProduct: string
    takePhoto: string
    uploadPhoto: string
    analyzing: string
    halal: string
    haraam: string
    unclear: string
    reason: string
    ingredients: string
    scanHistory: string
  }
  // Ramadan
  ramadan: {
    title: string
    countdown: string
    daysRemaining: string
    suhoor: string
    iftar: string
    Taraweeh: string
    quran: string
    dua: string
    fastingTracker: string
  }
  // Events
  events: {
    title: string
    hijri: string
    gregorian: string
    upcoming: string
    past: string
    addEvent: string
  }
  // Stats
  stats: {
    title: string
    prayers: string
    fasting: string
    quran: string
    charity: string
    streak: string
    weekly: string
    monthly: string
    yearly: string
  }
  // Common
  common: {
    save: string
    cancel: string
    delete: string
    edit: string
    search: string
    loading: string
    error: string
    success: string
    retry: string
  }
  // Settings
  settings: {
    language: string
    theme: string
    notifications: string
    location: string
    calculationMethod: string
    about: string
    version: string
  }
}

const translations: Record<Language, Translations> = {
  ar: {
    nav: {
      home: 'الرئيسية',
      prayerTimes: 'أوقات الصلاة',
      azkar: 'الأذكار',
      qibla: 'القبلة',
      halal: 'الحلال',
      ramadan: 'رمضان',
      events: 'المناسبات',
      stats: 'الإحصائيات',
      settings: 'الإعدادات'
    },
    prayer: {
      fajr: 'الفجر',
      sunrise: 'الشروق',
      dhuhr: 'الظهر',
      asr: 'العصر',
      maghrib: 'المغرب',
      isha: 'العشاء',
      currentCity: 'المدينة الحالية',
      selectCity: 'اختر المدينة',
      calculationMethod: 'طريقة الحساب',
      notifications: 'الإشعارات',
      notificationBefore: 'إشعار قبل الصلاة بـ',
      loading: 'جاري تحميل أوقات الصلاة...',
      error: 'خطأ في تحميل أوقات الصلاة'
    },
    azkar: {
      morning: 'أذكار الصباح',
      evening: 'أذكار المساء',
      afterPrayer: 'أذكار بعد الصلاة',
      sleep: 'أذكار النوم',
      wakeup: 'أذكار الاستيقاظ',
      ramadan: 'أذكار رمضان',
      tashbih: 'تسبيح',
      favorite: 'المفضلة',
      counter: 'العداد',
      addToFavorites: 'إضافة للمفضلة',
      removeFromFavorites: 'إزالة من المفضلة'
    },
    qibla: {
      title: 'اتجاه القبلة',
      direction: 'الاتجاه',
      compass: 'البوصلة',
      latitude: 'خط العرض',
      longitude: 'خط الطول',
      accuracy: 'الدقة'
    },
    halal: {
      title: 'تحليل الحلال',
      scanProduct: 'فحص منتج',
      takePhoto: 'التقط صورة',
      uploadPhoto: 'ارفع صورة',
      analyzing: 'جاري التحليل...',
      halal: 'حلال',
      haraam: 'حرام',
      unclear: 'غير واضح',
      reason: 'السبب',
      ingredients: 'المكونات',
      scanHistory: 'سجل الفحوصات'
    },
    ramadan: {
      title: 'رمضان',
      countdown: 'العد التنازلي',
      daysRemaining: 'باقي',
      suhoor: 'السحور',
      iftar: 'الإفطار',
      Taraweeh: 'تراويح',
      quran: 'القرآن',
      dua: 'الدعاء',
      fastingTracker: 'صيامك'
    },
    events: {
      title: 'المناسبات الإسلامية',
      hijri: 'الهجري',
      gregorian: 'الميلادي',
      upcoming: 'القادمة',
      past: 'السابقة',
      addEvent: 'إضافة مناسبة'
    },
    stats: {
      title: 'إحصائياتك',
      prayers: 'الصلوات',
      fasting: 'الصيام',
      quran: 'القرآن',
      charity: 'الصدقة',
      streak: 'التتابع',
      weekly: 'أسبوعي',
      monthly: 'شهري',
      yearly: 'سنوي'
    },
    common: {
      save: 'حفظ',
      cancel: 'إلغاء',
      delete: 'حذف',
      edit: 'تعديل',
      search: 'بحث',
      loading: 'جاري التحميل...',
      error: 'خطأ',
      success: 'نجاح',
      retry: 'إعادة المحاولة'
    },
    settings: {
      language: 'اللغة',
      theme: 'المظهر',
      notifications: 'الإشعارات',
      location: 'الموقع',
      calculationMethod: 'طريقة الحساب',
      about: 'حول التطبيق',
      version: 'الإصدار'
    }
  },
  ru: {
    nav: {
      home: 'Главная',
      prayerTimes: 'Время намаза',
      azkar: 'Зикры',
      qibla: 'Кибла',
      halal: 'Халяль',
      ramadan: 'Рамадан',
      events: 'События',
      stats: 'Статистика',
      settings: 'Настройки'
    },
    prayer: {
      fajr: 'Фаджр',
      sunrise: 'Восход',
      dhuhr: 'Зухр',
      asr: 'Аср',
      maghrib: 'Магриб',
      isha: 'Иша',
      currentCity: 'Текущий город',
      selectCity: 'Выберите город',
      calculationMethod: 'Метод расчёта',
      notifications: 'Уведомления',
      notificationBefore: 'Уведомление за',
      loading: 'Загрузка времени намаза...',
      error: 'Ошибка загрузки времени намаза'
    },
    azkar: {
      morning: 'Утренние зикры',
      evening: 'Вечерние зикры',
      afterPrayer: 'После намаза',
      sleep: 'Зикры перед сном',
      wakeup: 'Зикры после пробуждения',
      ramadan: 'Зикры Рамадана',
      tashbih: 'Тасбих',
      favorite: 'Избранное',
      counter: 'Счётчик',
      addToFavorites: 'Добавить в избранное',
      removeFromFavorites: 'Удалить из избранного'
    },
    qibla: {
      title: 'Направление киблы',
      direction: 'Направление',
      compass: 'Компас',
      latitude: 'Широта',
      longitude: 'Долгота',
      accuracy: 'Точность'
    },
    halal: {
      title: 'Проверка халяль',
      scanProduct: 'Проверить продукт',
      takePhoto: 'Сделать фото',
      uploadPhoto: 'Загрузить фото',
      analyzing: 'Анализ...',
      halal: 'Халяль',
      haraam: 'Харам',
      unclear: 'Неясно',
      reason: 'Причина',
      ingredients: 'Состав',
      scanHistory: 'История проверок'
    },
    ramadan: {
      title: 'Рамадан',
      countdown: 'Обратный отсчёт',
      daysRemaining: 'Осталось',
      suhoor: 'Сухур',
      iftar: 'Ифтар',
      Taraweeh: 'Тарауих',
      quran: 'Коран',
      dua: 'Дуа',
      fastingTracker: 'Отслеживание поста'
    },
    events: {
      title: 'Исламские события',
      hijri: 'Хиджра',
      gregorian: 'Григорианский',
      upcoming: 'Предстоящие',
      past: 'Прошедшие',
      addEvent: 'Добавить событие'
    },
    stats: {
      title: 'Ваша статистика',
      prayers: 'Намазы',
      fasting: 'Пост',
      quran: 'Коран',
      charity: 'Пожертвования',
      streak: 'Серия',
      weekly: 'Неделя',
      monthly: 'Месяц',
      yearly: 'Год'
    },
    common: {
      save: 'Сохранить',
      cancel: 'Отмена',
      delete: 'Удалить',
      edit: 'Изменить',
      search: 'Поиск',
      loading: 'Загрузка...',
      error: 'Ошибка',
      success: 'Успешно',
      retry: 'Повторить'
    },
    settings: {
      language: 'Язык',
      theme: 'Тема',
      notifications: 'Уведомления',
      location: 'Местоположение',
      calculationMethod: 'Метод расчёта',
      about: 'О приложении',
      version: 'Версия'
    }
  },
  en: {
    nav: {
      home: 'Home',
      prayerTimes: 'Prayer Times',
      azkar: 'Azkar',
      qibla: 'Qibla',
      halal: 'Halal',
      ramadan: 'Ramadan',
      events: 'Events',
      stats: 'Statistics',
      settings: 'Settings'
    },
    prayer: {
      fajr: 'Fajr',
      sunrise: 'Sunrise',
      dhuhr: 'Dhuhr',
      asr: 'Asr',
      maghrib: 'Maghrib',
      isha: 'Isha',
      currentCity: 'Current City',
      selectCity: 'Select City',
      calculationMethod: 'Calculation Method',
      notifications: 'Notifications',
      notificationBefore: 'Notify before',
      loading: 'Loading prayer times...',
      error: 'Error loading prayer times'
    },
    azkar: {
      morning: 'Morning Azkar',
      evening: 'Evening Azkar',
      afterPrayer: 'After Prayer',
      sleep: 'Sleep',
      wakeup: 'Wakeup',
      ramadan: 'Ramadan Azkar',
      tashbih: 'Tashbih',
      favorite: 'Favorites',
      counter: 'Counter',
      addToFavorites: 'Add to favorites',
      removeFromFavorites: 'Remove from favorites'
    },
    qibla: {
      title: 'Qibla Direction',
      direction: 'Direction',
      compass: 'Compass',
      latitude: 'Latitude',
      longitude: 'Longitude',
      accuracy: 'Accuracy'
    },
    halal: {
      title: 'Halal Checker',
      scanProduct: 'Scan Product',
      takePhoto: 'Take Photo',
      uploadPhoto: 'Upload Photo',
      analyzing: 'Analyzing...',
      halal: 'Halal',
      haraam: 'Haraam',
      unclear: 'Unclear',
      reason: 'Reason',
      ingredients: 'Ingredients',
      scanHistory: 'Scan History'
    },
    ramadan: {
      title: 'Ramadan',
      countdown: 'Countdown',
      daysRemaining: 'Days left',
      suhoor: 'Suhoor',
      iftar: 'Iftar',
      Taraweeh: 'Taraweeh',
      quran: 'Quran',
      dua: 'Dua',
      fastingTracker: 'Fasting Tracker'
    },
    events: {
      title: 'Islamic Events',
      hijri: 'Hijri',
      gregorian: 'Gregorian',
      upcoming: 'Upcoming',
      past: 'Past',
      addEvent: 'Add Event'
    },
    stats: {
      title: 'Your Statistics',
      prayers: 'Prayers',
      fasting: 'Fasting',
      quran: 'Quran',
      charity: 'Charity',
      streak: 'Streak',
      weekly: 'Weekly',
      monthly: 'Monthly',
      yearly: 'Yearly'
    },
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      search: 'Search',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      retry: 'Retry'
    },
    settings: {
      language: 'Language',
      theme: 'Theme',
      notifications: 'Notifications',
      location: 'Location',
      calculationMethod: 'Calculation Method',
      about: 'About',
      version: 'Version'
    }
  }
}

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: Translations
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('muslim-russia-language')
    if (saved && ['ar', 'ru', 'en'].includes(saved)) {
      return saved as Language
    }
    // Default to Russian for Russia users
    return 'ru'
  })

  useEffect(() => {
    localStorage.setItem('muslim-russia-language', language)
    // Set document direction for Arabic
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = language
  }, [language])

  const t = translations[language]

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return context
}

export const languages: { code: Language; name: string; native: string; flag: string }[] = [
  { code: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦' },
  { code: 'ru', name: 'Russian', native: 'Русский', flag: '🇷🇺' },
  { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' }
]
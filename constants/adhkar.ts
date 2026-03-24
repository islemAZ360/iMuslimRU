export interface Adhkar {
  id: string;
  category: 'morning' | 'evening' | 'after_prayer' | 'sleep' | 'wake_up' | 'ramadan';
  text: string;
  translation_en: string;
  translation_ru: string;
  transliteration?: string;
  count: number;
}

export const ADHKAR_DATA: Adhkar[] = [
  {
    id: 'm1',
    category: 'morning',
    text: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إلاَّ اللهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    translation_en: 'We have reached the morning and at this very time unto Allah belongs all sovereignty, and all praise is for Allah. None has the right to be worshipped but Allah alone, without partner.',
    translation_ru: 'Мы дожили до утра, и этим утром владычество принадлежит Аллаху, и хвала Аллаху! Нет бога, кроме одного лишь Аллаха, у Которого нет сотоварища. Ему принадлежит владычество, Ему — хвала, и Он всё может.',
    count: 1,
  },
  {
    id: 'm2',
    category: 'morning',
    text: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ',
    translation_en: 'O Allah, by Your grace we have reached the morning, and by Your grace we reach the evening, by Your grace we live and by Your grace we die, and to You is the ultimate return.',
    translation_ru: 'О Аллах, благодаря Тебе мы дожили до утра и благодаря Тебе мы дожили до вечера, благодаря Тебе мы живём, благодаря Тебе умираем и к Тебе вернёмся.',
    count: 1,
  },
  {
    id: 'e1',
    category: 'evening',
    text: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إلاَّ اللهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    translation_en: 'We have reached the evening and at this very time unto Allah belongs all sovereignty, and all praise is for Allah. None has the right to be worshipped but Allah alone, without partner.',
    translation_ru: 'Мы дожили до вечера, и этим вечером владычество принадлежит Аллаху, и хвала Аллаху! Нет бога, кроме одного лишь Аллаха, у Которого нет сотоварища. Ему принадлежит владычество, Ему — хвала, и Он всё может.',
    count: 1,
  },
  {
    id: 'ap1',
    category: 'after_prayer',
    text: 'أَسْتَغْفِرُ اللهَ (ثلاثاً)',
    translation_en: 'I ask Allah for forgiveness (three times).',
    translation_ru: 'Прошу Аллаха о прощении (трижды).',
    count: 3,
  },
  {
    id: 'ap2',
    category: 'after_prayer',
    text: 'اللَّهُمَّ أَنْتَ السَّلامُ، وَمِنْكَ السَّلامُ، تَبَارَكْتَ يَا ذَا الْجَلالِ وَالإِكْرَامِ',
    translation_en: 'O Allah, You are Peace and from You comes peace. Blessed are You, O Owner of majesty and honor.',
    translation_ru: 'О Аллах, Ты — Мир и от Тебя — мир, благословен Ты, о Обладатель величия и щедрости!',
    count: 1,
  }
];

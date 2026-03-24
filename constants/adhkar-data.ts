/**
 * Comprehensive Local Adhkar Database
 * Authentic Islamic supplications with Arabic text, transliteration,
 * Russian/English translations, and hadith sources.
 * Used as primary/fallback data source when Supabase DB is empty.
 */

export interface LocalAdhkarCategory {
  id: string;
  nameRu: string;
  nameAr: string;
  nameEn: string;
  icon: string; // Ionicons name
  sortOrder: number;
}

export interface LocalAdhkar {
  id: string;
  categoryId: string;
  textAr: string;
  textRu: string;
  textEn: string;
  transliteration: string;
  source: string;
  targetCount: number;
  sortOrder: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORIES
// ─────────────────────────────────────────────────────────────────────────────
export const LOCAL_ADHKAR_CATEGORIES: LocalAdhkarCategory[] = [
  { id: 'morning',        nameRu: 'Утренние азкары',        nameAr: 'أذكار الصباح',          nameEn: 'Morning Adhkar',         icon: 'sunny-outline',             sortOrder: 1  },
  { id: 'evening',        nameRu: 'Вечерние азкары',        nameAr: 'أذكار المساء',          nameEn: 'Evening Adhkar',         icon: 'moon-outline',              sortOrder: 2  },
  { id: 'after_prayer',   nameRu: 'После намаза',           nameAr: 'أذكار بعد الصلاة',      nameEn: 'After Prayer',           icon: 'checkmark-circle-outline',  sortOrder: 3  },
  { id: 'sleep',          nameRu: 'Перед сном',             nameAr: 'أذكار النوم',           nameEn: 'Before Sleep',           icon: 'bed-outline',               sortOrder: 4  },
  { id: 'wakeup',         nameRu: 'При пробуждении',        nameAr: 'أذكار الاستيقاظ',      nameEn: 'Upon Waking',            icon: 'alarm-outline',             sortOrder: 5  },
  { id: 'tasbih',         nameRu: 'Тасбих',                 nameAr: 'التسبيح والتهليل',      nameEn: 'Tasbih & Tahlil',        icon: 'infinite-outline',          sortOrder: 6  },
  { id: 'quran_duas',     nameRu: 'Дуа из Корана',          nameAr: 'أدعية قرآنية',          nameEn: 'Quranic Supplications',  icon: 'book-outline',              sortOrder: 7  },
  { id: 'protection',     nameRu: 'Защита',                 nameAr: 'أذكار الحماية',         nameEn: 'Protection Adhkar',      icon: 'shield-checkmark-outline',  sortOrder: 8  },
  { id: 'travel',         nameRu: 'В пути',                 nameAr: 'أذكار السفر',           nameEn: 'Travel Adhkar',          icon: 'airplane-outline',          sortOrder: 9  },
  { id: 'food',           nameRu: 'Еда и питьё',            nameAr: 'أذكار الطعام',          nameEn: 'Food & Drink',           icon: 'restaurant-outline',        sortOrder: 10 },
  { id: 'entering_home',  nameRu: 'Вход в дом',             nameAr: 'أذكار دخول المنزل',    nameEn: 'Entering Home',          icon: 'home-outline',              sortOrder: 11 },
  { id: 'entering_mosque',nameRu: 'Вход в мечеть',          nameAr: 'أذكار المسجد',          nameEn: 'Mosque Adhkar',          icon: 'business-outline',          sortOrder: 12 },
  { id: 'stress',         nameRu: 'При тревоге',            nameAr: 'أذكار الكرب والهموم',  nameEn: 'Distress Adhkar',        icon: 'heart-outline',             sortOrder: 13 },
  { id: 'gratitude',      nameRu: 'Благодарность',          nameAr: 'أذكار الشكر والحمد',   nameEn: 'Gratitude Adhkar',       icon: 'star-outline',              sortOrder: 14 },
  { id: 'istighfar',      nameRu: 'Истигфар',               nameAr: 'الاستغفار والتوبة',     nameEn: 'Seeking Forgiveness',    icon: 'refresh-circle-outline',    sortOrder: 15 },
];

// ─────────────────────────────────────────────────────────────────────────────
// ADHKAR DATA
// ─────────────────────────────────────────────────────────────────────────────
export const LOCAL_ADHKAR: LocalAdhkar[] = [

  // ── 1. MORNING (أذكار الصباح) ──────────────────────────────────────────────
  {
    id: 'morning_1', categoryId: 'morning', sortOrder: 1, targetCount: 1,
    textAr: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    textRu: 'Мы вступили в утро и вступило в утро всё царство Аллаха. Хвала Аллаху. Нет божества, кроме одного лишь Аллаха, у Которого нет сотоварища. Ему принадлежит власть и Ему хвала, и Он над всякой вещью мощен.',
    textEn: 'We have reached the morning and all sovereignty belongs to Allah. Praise be to Allah. None has the right to be worshipped but Allah alone, He has no partner. His is the dominion, to Him belongs all praise, and He is over all things competent.',
    transliteration: 'Асбахна ва асбаха-ль-мульку лилляхи, валь-хамду лилляхи, ля иляха илляллаху вахдаху ля шарика лях, ляху-ль-мульку ва ляху-ль-хамду ва хува аля кулли шайин кадир.',
    source: 'Абу Дауд 5077, Аль-Мунзири',
  },
  {
    id: 'morning_2', categoryId: 'morning', sortOrder: 2, targetCount: 1,
    textAr: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ',
    textRu: 'О Аллах, с Твоей помощью мы вступаем в утро, с Твоей помощью вступаем в вечер, с Твоей помощью живём, с Твоей помощью умираем, и к Тебе воскресение.',
    textEn: 'O Allah, by You we reach the morning, and by You we reach the evening, by You we live and by You we die, and unto You is the resurrection.',
    transliteration: 'Аллахумма бика асбахна, ва бика амсайна, ва бика нахья, ва бика намуту, ва иляйка-н-нушур.',
    source: 'Ат-Тирмизи 3391, Абу Дауд 5068',
  },
  {
    id: 'morning_3', categoryId: 'morning', sortOrder: 3, targetCount: 3,
    textAr: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
    textRu: 'Во имя Аллаха, с именем Которого не причинит вреда ничто ни на земле, ни на небе, и Он — Слышащий, Знающий.',
    textEn: 'In the name of Allah, with Whose name nothing can cause harm on earth or in the heavens, and He is the All-Hearing, All-Knowing.',
    transliteration: 'Бисмилляхи-ллязи ля ядурру маа-смихи шайун фи-ль-арди ва ля фи-с-самаи ва хува-с-самиу-ль-алим.',
    source: 'Абу Дауд 5088, Ат-Тирмизи 3388',
  },
  {
    id: 'morning_4', categoryId: 'morning', sortOrder: 4, targetCount: 1,
    textAr: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي، فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
    textRu: 'О Аллах, Ты — мой Господь, нет божества, кроме Тебя. Ты создал меня, и я — Твой раб. Я буду верен Твоему завету и обещанию насколько смогу. Прибегаю к Тебе от зла того, что я сделал. Признаю пред Тобой Твои милости, дарованные мне, и признаю свой грех. Прости же меня, ибо нет того, кто прощает грехи, кроме Тебя.',
    textEn: 'O Allah, You are my Lord, there is no god but You. You created me and I am Your slave. I uphold Your covenant and promise as best I can. I seek refuge in You from the evil of what I have done. I acknowledge Your blessings upon me and confess my sins. So forgive me, for none forgives sins except You.',
    transliteration: 'Аллахумма анта рабби ля иляха илля анта, халяктани ва ана абдука, ва ана аля ахдика ва ваъдика масататту, аузу бика мин шарри ма санату, абуу ляка бинимматика алайя ва абуу бизамби, фагфир ли фаиннаху ля йагфиру-з-зунуба илля ант.',
    source: 'Аль-Бухари 6306',
  },
  {
    id: 'morning_5', categoryId: 'morning', sortOrder: 5, targetCount: 7,
    textAr: 'حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ',
    textRu: 'Достаточно мне Аллаха, нет божества, кроме Него, на Него я уповаю, и Он — Господь великого Трона.',
    textEn: 'Allah is sufficient for me; there is no god but Him. In Him I put my trust, and He is the Lord of the Mighty Throne.',
    transliteration: 'Хасбияллаху ля иляха илля хуа, алайхи таваккальту ва хуа раббу-ль-арши-ль-азым.',
    source: 'Абу Дауд 5081',
  },
  {
    id: 'morning_6', categoryId: 'morning', sortOrder: 6, targetCount: 100,
    textAr: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    textRu: 'Пречист Аллах и хвала Ему.',
    textEn: 'Glory be to Allah and praise be to Him.',
    transliteration: 'Субханаллахи ва бихамдих.',
    source: 'Аль-Бухари 6042, Муслим 2692',
  },
  {
    id: 'morning_7', categoryId: 'morning', sortOrder: 7, targetCount: 1,
    textAr: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ',
    textRu: 'О Аллах, даруй мне здоровье в теле, О Аллах, даруй мне здоровье в слухе, О Аллах, даруй мне здоровье в зрении. Нет божества, кроме Тебя.',
    textEn: 'O Allah, grant me health in my body. O Allah, grant me health in my hearing. O Allah, grant me health in my sight. There is no god but You.',
    transliteration: 'Аллахумма афини фи бадани, Аллахумма афини фи самии, Аллахумма афини фи басари, ля иляха илля ант.',
    source: 'Абу Дауд 5090, Аль-Бухари (аль-Адаб аль-Муфрад)',
  },
  {
    id: 'morning_8', categoryId: 'morning', sortOrder: 8, targetCount: 1,
    textAr: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ',
    textRu: 'О Аллах, поистине я прошу Тебя о прощении и благополучии в этом мире и в следующем.',
    textEn: 'O Allah, I ask You for pardon and well-being in this world and in the Hereafter.',
    transliteration: 'Аллахумма инни асалюка-ль-афва ва-ль-афията фи-д-дунья ва-ль-ахира.',
    source: 'Ибн Маджа 3871, Абу Дауд 5074',
  },
  {
    id: 'morning_9', categoryId: 'morning', sortOrder: 9, targetCount: 3,
    textAr: 'أَعُوذُ بِاللَّهِ السَّمِيعِ الْعَلِيمِ مِنَ الشَّيْطَانِ الرَّجِيمِ',
    textRu: 'Прибегаю к Аллаху Слышащему, Знающему от проклятого шайтана.',
    textEn: 'I seek refuge with Allah, the All-Hearing, All-Knowing, from the outcast Shaytan.',
    transliteration: 'Аузу биллахи-с-самии-ль-алими мина-ш-шайтани-р-раджим.',
    source: 'Абу Дауд 5082, Ат-Тирмизи 3392',
  },
  {
    id: 'morning_10', categoryId: 'morning', sortOrder: 10, targetCount: 1,
    textAr: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا وَرِزْقًا طَيِّبًا وَعَمَلًا مُتَقَبَّلًا',
    textRu: 'О Аллах, поистине я прошу Тебя о полезном знании, благом уделе и принятом деянии.',
    textEn: 'O Allah, I ask You for beneficial knowledge, good provision, and accepted deeds.',
    transliteration: 'Аллахумма инни асалюка ильман нафиан ва ризкан тайиббан ва амалян мутакаббалан.',
    source: 'Ибн Маджа 925',
  },
  {
    id: 'morning_11', categoryId: 'morning', sortOrder: 11, targetCount: 1,
    textAr: 'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا',
    textRu: 'Я доволен Аллахом как Господом, Исламом как религией и Мухаммадом (да благословит его Аллах и приветствует) как пророком.',
    textEn: 'I am pleased with Allah as my Lord, with Islam as my religion, and with Muhammad (peace be upon him) as my Prophet.',
    transliteration: 'Радыту биллахи раббан, ва биль-исляни динан, ва бимухаммадин салляллаху алайхи ва саллям набийян.',
    source: 'Абу Дауд 5072, Ат-Тирмизи 3389',
  },
  {
    id: 'morning_12', categoryId: 'morning', sortOrder: 12, targetCount: 10,
    textAr: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ',
    textRu: 'О Аллах, благослови и приветствуй нашего пророка Мухаммада.',
    textEn: 'O Allah, send blessings and peace upon our Prophet Muhammad.',
    transliteration: 'Аллахумма салли ва саллим аля набийина Мухаммад.',
    source: 'Ат-Тирмизи 3546',
  },
  {
    id: 'morning_13', categoryId: 'morning', sortOrder: 13, targetCount: 1,
    textAr: 'يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ',
    textRu: 'О Живой, о Вечный Хранитель, Твоей милостью взываю о помощи. Исправь все мои дела и не оставляй меня на попечение самого себя даже на миг.',
    textEn: 'O Ever-Living, O Self-Sustaining, by Your mercy I seek help. Rectify all my affairs and do not leave me to myself for the blink of an eye.',
    transliteration: 'Йа Хаййу йа Каййуму бирахматика астагис, аслих ли шани куллаху ва ля такилни иля нафси тарфата айн.',
    source: 'Аль-Хаким 1/545, Ан-Насаи (аль-Амаль аль-Йаум)',
  },
  {
    id: 'morning_14', categoryId: 'morning', sortOrder: 14, targetCount: 1,
    textAr: 'اللَّهُمَّ إِنَّا نَعُوذُ بِكَ مِنْ أَنْ نُشْرِكَ بِكَ شَيْئًا نَعْلَمُهُ، وَنَسْتَغْفِرُكَ لِمَا لَا نَعْلَمُهُ',
    textRu: 'О Аллах, мы прибегаем к Тебе от того, чтобы приобщить к Тебе что-либо сознательно, и просим Тебя о прощении того, о чём не ведаем.',
    textEn: 'O Allah, we seek refuge with You from knowingly associating partners with You, and we seek Your forgiveness for what we do not know.',
    transliteration: 'Аллахумма инна науузу бика мин ан нушрика бика шайан нааламуху, ва настагфирука лима ля нааламух.',
    source: 'Аль-Бухари (Аль-Адаб Аль-Муфрад) 716',
  },
  {
    id: 'morning_15', categoryId: 'morning', sortOrder: 15, targetCount: 1,
    textAr: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ خَيْرِ هَذَا الْيَوْمِ فَتْحَهُ وَنَصْرَهُ وَنُورَهُ وَبَرَكَتَهُ وَهُدَاهُ وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِيهِ وَشَرِّ مَا بَعْدَهُ',
    textRu: 'О Аллах, я прошу Тебя о благе этого дня: его открытии, победе, свете, благодати и водительстве, и прибегаю к Тебе от зла того, что в нём, и зла того, что после него.',
    textEn: 'O Allah, I ask You for the good of this day, its openings, victories, light, blessings and guidance, and I seek refuge in You from the evil in it and the evil of what comes after it.',
    transliteration: 'Аллахумма инни асалюка мин хайри хаза-ль-яуми фатхаху ва насраху ва нураху ва баракатаху ва худаху ва аузу бика мин шарри ма фихи ва шарри ма бадах.',
    source: 'Абу Дауд 5084',
  },

  // ── 2. EVENING (أذكار المساء) ─────────────────────────────────────────────
  {
    id: 'evening_1', categoryId: 'evening', sortOrder: 1, targetCount: 1,
    textAr: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ',
    textRu: 'Мы вступили в вечер и вступило в вечер всё царство Аллаха. Хвала Аллаху. Нет божества, кроме одного Аллаха, у Которого нет сотоварища.',
    textEn: 'We have reached the evening and so has the dominion of Allah. Praise be to Allah. There is no god but Allah alone, He has no partner.',
    transliteration: 'Амсайна ва амса-ль-мульку лилляхи, валь-хамду лилляхи, ля иляха илляллаху вахдаху ля шарика лях.',
    source: 'Абу Дауд 5077, Муслим',
  },
  {
    id: 'evening_2', categoryId: 'evening', sortOrder: 2, targetCount: 1,
    textAr: 'اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ',
    textRu: 'О Аллах, с Твоей помощью мы вступаем в вечер, с Твоей помощью вступаем в утро, с Твоей помощью живём, с Твоей помощью умираем, и к Тебе возвращение.',
    textEn: 'O Allah, by You we reach the evening, and by You we reach the morning, by You we live and by You we die, and unto You is the final return.',
    transliteration: 'Аллахумма бика амсайна ва бика асбахна ва бика нахья ва бика намуту ва иляйка-ль-масыр.',
    source: 'Ат-Тирмизи 3391',
  },
  {
    id: 'evening_3', categoryId: 'evening', sortOrder: 3, targetCount: 3,
    textAr: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
    textRu: 'Во имя Аллаха, с именем Которого не причинит вреда ничто ни на земле, ни на небе, и Он — Слышащий, Знающий.',
    textEn: 'In the name of Allah, with Whose name nothing can cause harm on earth or in the heavens, and He is the All-Hearing, All-Knowing.',
    transliteration: 'Бисмилляхи-ллязи ля ядурру маа-смихи шайун фи-ль-арди ва ля фи-с-самаи ва хува-с-самиу-ль-алим.',
    source: 'Абу Дауд 5088',
  },
  {
    id: 'evening_4', categoryId: 'evening', sortOrder: 4, targetCount: 1,
    textAr: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ',
    textRu: 'О Аллах, Ты — мой Господь, нет божества кроме Тебя. Ты создал меня, и я — Твой раб. Я буду верен Твоему завету и обещанию насколько смогу.',
    textEn: 'O Allah, You are my Lord, there is no god but You. You created me and I am Your slave. I uphold Your covenant and promise as best I can.',
    transliteration: 'Аллахумма анта рабби ля иляха илля анта, халяктани ва ана абдука, ва ана аля ахдика ва ваъдика масататту.',
    source: 'Аль-Бухари 6306',
  },
  {
    id: 'evening_5', categoryId: 'evening', sortOrder: 5, targetCount: 100,
    textAr: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    textRu: 'Пречист Аллах и хвала Ему.',
    textEn: 'Glory be to Allah and praise be to Him.',
    transliteration: 'Субханаллахи ва бихамдих.',
    source: 'Аль-Бухари 6042, Муслим 2692',
  },
  {
    id: 'evening_6', categoryId: 'evening', sortOrder: 6, targetCount: 7,
    textAr: 'حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ',
    textRu: 'Достаточно мне Аллаха, нет божества, кроме Него, на Него я уповаю, и Он — Господь великого Трона.',
    textEn: 'Allah is sufficient for me; there is no god but Him. In Him I put my trust, and He is the Lord of the Mighty Throne.',
    transliteration: 'Хасбияллаху ля иляха илля хуа, алайхи таваккальту ва хуа раббу-ль-арши-ль-азым.',
    source: 'Абу Дауд 5081',
  },
  {
    id: 'evening_7', categoryId: 'evening', sortOrder: 7, targetCount: 1,
    textAr: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ',
    textRu: 'О Аллах, даруй мне здоровье в теле, О Аллах, даруй мне здоровье в слухе, О Аллах, даруй мне здоровье в зрении. Нет божества кроме Тебя.',
    textEn: 'O Allah, grant me health in my body. O Allah, grant me health in my hearing. O Allah, grant me health in my sight. There is no god but You.',
    transliteration: 'Аллахумма афини фи бадани, Аллахумма афини фи самии, Аллахумма афини фи басари, ля иляха илля ант.',
    source: 'Абу Дауд 5090',
  },
  {
    id: 'evening_8', categoryId: 'evening', sortOrder: 8, targetCount: 1,
    textAr: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ',
    textRu: 'О Аллах, поистине я прошу Тебя о благополучии в этом мире и в следующем.',
    textEn: 'O Allah, I ask You for well-being in this world and in the Hereafter.',
    transliteration: 'Аллахумма инни асалюка-ль-афията фи-д-дунья ва-ль-ахира.',
    source: 'Ибн Маджа 3871',
  },
  {
    id: 'evening_9', categoryId: 'evening', sortOrder: 9, targetCount: 1,
    textAr: 'اللَّهُمَّ اغْفِرْ لِي ذَنْبِي كُلَّهُ، دِقَّهُ وَجِلَّهُ، وَأَوَّلَهُ وَآخِرَهُ، وَعَلَانِيَتَهُ وَسِرَّهُ',
    textRu: 'О Аллах, прости мне все мои грехи: малые и великие, первые и последние, явные и тайные.',
    textEn: 'O Allah, forgive me all my sins, small and great, first and last, open and secret.',
    transliteration: 'Аллахумма-гфир ли занби куллаху, диккаху ва джиллаху, ва аввалаху ва ахираху, ва аланийатаху ва сиррах.',
    source: 'Муслим 483',
  },
  {
    id: 'evening_10', categoryId: 'evening', sortOrder: 10, targetCount: 1,
    textAr: 'اللَّهُمَّ إِنِّي أَمْسَيْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ وَمَلَائِكَتَكَ وَجَمِيعَ خَلْقِكَ أَنَّكَ أَنْتَ اللَّهُ لَا إِلَهَ إِلَّا أَنْتَ وَحْدَكَ لَا شَرِيكَ لَكَ',
    textRu: 'О Аллах, я вступаю в вечер, призывая в свидетели Тебя, носителей Твоего Трона, Твоих ангелов и всё Твоё творение, что Ты — Аллах, нет божества кроме Тебя, одного, без сотоварищей.',
    textEn: 'O Allah, I reach the evening calling You to witness, and calling to witness the bearers of Your Throne, Your angels, and all Your creation, that You are Allah and there is no god but You alone without partner.',
    transliteration: 'Аллахумма инни амсайту ушхидука ва ушхиду хамалята аршика ва маляикатака ва джамиа халкика аннака анталлаху ля иляха илля анта вахдака ля шарика лак.',
    source: 'Абу Дауд 5069',
  },
  {
    id: 'evening_11', categoryId: 'evening', sortOrder: 11, targetCount: 3,
    textAr: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
    textRu: 'Прибегаю к совершенным словам Аллаха от зла того, что Он создал.',
    textEn: 'I seek refuge in the perfect words of Allah from the evil of what He has created.',
    transliteration: 'Аузу бикалиматиллахи-т-таммати мин шарри ма халяк.',
    source: 'Муслим 2709',
  },
  {
    id: 'evening_12', categoryId: 'evening', sortOrder: 12, targetCount: 1,
    textAr: 'اللَّهُمَّ مَا أَمْسَى بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ',
    textRu: 'О Аллах, всякая милость, которой я обладаю вечером или которой обладает кто-либо из Твоих созданий, — от Тебя одного, нет у Тебя сотоварища, Тебе хвала и Тебе благодарность.',
    textEn: 'O Allah, whatever blessing I have in the evening, or any of Your creation has, is from You alone, You have no partner. Yours is all praise and thanks.',
    transliteration: 'Аллахумма ма амса би мин нимматин ав би ахадин мин халкика фа минка вахдака ля шарика лак, фа ляка-ль-хамду ва ляка-ш-шукр.',
    source: 'Абу Дауд 5073, Ибн Хиббан',
  },
  {
    id: 'evening_13', categoryId: 'evening', sortOrder: 13, targetCount: 1,
    textAr: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا وَأَعُوذُ بِكَ مِنْ شَرِّ هَذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا',
    textRu: 'О Аллах, я прошу Тебя о благе этой ночи и благе того, что после неё, и прибегаю к Тебе от зла этой ночи и зла того, что после неё.',
    textEn: 'O Allah, I ask You for the good of this night and the good of what follows it, and I seek refuge in You from the evil of this night and the evil of what follows it.',
    transliteration: 'Аллахумма инни асалюка хайра хазихи-ль-ляйляти ва хайра ма бадаха ва аузу бика мин шарри хазихи-ль-ляйляти ва шарри ма бадаха.',
    source: 'Муслим 2723',
  },
  {
    id: 'evening_14', categoryId: 'evening', sortOrder: 14, targetCount: 1,
    textAr: 'يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ',
    textRu: 'О Живой, о Вечный Хранитель, Твоей милостью взываю о помощи. Исправь все мои дела и не оставляй меня на попечение самого себя даже на миг.',
    textEn: 'O Ever-Living, O Self-Sustaining, by Your mercy I seek help. Rectify all my affairs and do not leave me to myself for the blink of an eye.',
    transliteration: 'Йа Хаййу йа Каййуму бирахматика астагис, аслих ли шани куллаху ва ля такилни иля нафси тарфата айн.',
    source: 'Аль-Хаким 1/545',
  },
  {
    id: 'evening_15', categoryId: 'evening', sortOrder: 15, targetCount: 3,
    textAr: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ',
    textRu: 'О Аллах, благослови и приветствуй нашего пророка Мухаммада.',
    textEn: 'O Allah, send blessings and peace upon our Prophet Muhammad.',
    transliteration: 'Аллахумма салли ва саллим аля набийина Мухаммад.',
    source: 'Ат-Тирмизи 3546',
  },

  // ── 3. AFTER PRAYER (أذكار بعد الصلاة) ────────────────────────────────────
  {
    id: 'after_prayer_1', categoryId: 'after_prayer', sortOrder: 1, targetCount: 3,
    textAr: 'أَسْتَغْفِرُ اللَّهَ',
    textRu: 'Прошу прощения у Аллаха.',
    textEn: 'I seek forgiveness from Allah.',
    transliteration: 'Астагфируллах.',
    source: 'Муслим 591',
  },
  {
    id: 'after_prayer_2', categoryId: 'after_prayer', sortOrder: 2, targetCount: 1,
    textAr: 'اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ',
    textRu: 'О Аллах, Ты — Мир, от Тебя мир. Благословен Ты, о Обладатель величия и почёта.',
    textEn: 'O Allah, You are Peace and from You is peace. Blessed are You, O Possessor of majesty and honour.',
    transliteration: 'Аллахумма анта-с-саляму ва минка-с-саляму табаракта йа за-ль-джаляли ва-ль-икрам.',
    source: 'Муслим 591',
  },
  {
    id: 'after_prayer_3', categoryId: 'after_prayer', sortOrder: 3, targetCount: 33,
    textAr: 'سُبْحَانَ اللَّهِ',
    textRu: 'Пречист Аллах.',
    textEn: 'Glory be to Allah.',
    transliteration: 'Субханаллах.',
    source: 'Муслим 597',
  },
  {
    id: 'after_prayer_4', categoryId: 'after_prayer', sortOrder: 4, targetCount: 33,
    textAr: 'الْحَمْدُ لِلَّهِ',
    textRu: 'Хвала Аллаху.',
    textEn: 'Praise be to Allah.',
    transliteration: 'Альхамдулиллях.',
    source: 'Муслим 597',
  },
  {
    id: 'after_prayer_5', categoryId: 'after_prayer', sortOrder: 5, targetCount: 33,
    textAr: 'اللَّهُ أَكْبَرُ',
    textRu: 'Аллах велик.',
    textEn: 'Allah is the Greatest.',
    transliteration: 'Аллаху Акбар.',
    source: 'Муслим 597',
  },
  {
    id: 'after_prayer_6', categoryId: 'after_prayer', sortOrder: 6, targetCount: 1,
    textAr: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    textRu: 'Нет божества, кроме одного лишь Аллаха, у Которого нет сотоварища. Ему принадлежит власть и Ему хвала, и Он над всякой вещью мощен.',
    textEn: 'There is no god but Allah alone, He has no partner. His is the dominion and His is the praise, and He is over all things competent.',
    transliteration: 'Ля иляха илляллаху вахдаху ля шарика лях, ляху-ль-мульку ва ляху-ль-хамду ва хува аля кулли шайин кадир.',
    source: 'Муслим 597',
  },
  {
    id: 'after_prayer_7', categoryId: 'after_prayer', sortOrder: 7, targetCount: 1,
    textAr: 'اللَّهُمَّ لَا مَانِعَ لِمَا أَعْطَيْتَ وَلَا مُعْطِيَ لِمَا مَنَعْتَ وَلَا يَنْفَعُ ذَا الْجَدِّ مِنْكَ الْجَدُّ',
    textRu: 'О Аллах, никто не в силах удержать то, что Ты даруешь, и никто не в силах дать то, что Ты удерживаешь, и богатство не поможет богатому перед Тобой.',
    textEn: 'O Allah, none can withhold what You give and none can give what You withhold, and the fortune of the fortunate cannot avail against Your will.',
    transliteration: 'Аллахумма ля маниа лима атайта ва ля мутыйа лима манаъта ва ля янфау за-ль-джадди минка-ль-джадд.',
    source: 'Аль-Бухари 844, Муслим 593',
  },
  {
    id: 'after_prayer_8', categoryId: 'after_prayer', sortOrder: 8, targetCount: 1,
    textAr: 'اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ',
    textRu: 'О Аллах, помоги мне поминать Тебя, благодарить Тебя и хорошо поклоняться Тебе.',
    textEn: 'O Allah, help me to remember You, to thank You and to worship You in the best manner.',
    transliteration: 'Аллахумма аинни аля зикрика ва шукрика ва хусни ибадатик.',
    source: 'Абу Дауд 1522, Ан-Насаи',
  },
  {
    id: 'after_prayer_9', categoryId: 'after_prayer', sortOrder: 9, targetCount: 1,
    textAr: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ يُحْيِي وَيُمِيتُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    textRu: 'Нет божества, кроме одного лишь Аллаха, у Которого нет сотоварища. Ему принадлежит власть, и Ему хвала. Он дарует жизнь и умерщвляет, и Он над всякой вещью мощен.',
    textEn: 'There is no god but Allah alone, He has no partner. His is the dominion and His is the praise. He gives life and causes death, and He is over all things competent.',
    transliteration: 'Ля иляха илляллаху вахдаху ля шарика лях, ляху-ль-мульку ва ляху-ль-хамду йухйи ва йумиту ва хува аля кулли шайин кадир.',
    source: 'Ат-Тирмизи 3474',
  },
  {
    id: 'after_prayer_10', categoryId: 'after_prayer', sortOrder: 10, targetCount: 1,
    textAr: 'آيَةُ الْكُرْسِيِّ: اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ',
    textRu: 'Аят аль-Курси: Аллах — нет божества, кроме Него, Живого, Вечного. Не властны над Ним ни дремота, ни сон.',
    textEn: 'Ayat al-Kursi: Allah — there is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep.',
    transliteration: 'Аллаху ля иляха илля хуваль-хаййуль-каййум, ля тахузуху синатун ва ля наум...',
    source: 'Аль-Бухари 2311, Ан-Насаи',
  },

  // ── 4. SLEEP (أذكار النوم) ─────────────────────────────────────────────────
  {
    id: 'sleep_1', categoryId: 'sleep', sortOrder: 1, targetCount: 1,
    textAr: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
    textRu: 'С Твоим именем, о Аллах, я умираю и оживаю.',
    textEn: 'In Your name, O Allah, I die and I live.',
    transliteration: 'Бисмика Аллахумма аму-ту ва ахья.',
    source: 'Аль-Бухари 6312, Муслим 2711',
  },
  {
    id: 'sleep_2', categoryId: 'sleep', sortOrder: 2, targetCount: 1,
    textAr: 'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ',
    textRu: 'О Аллах, убереги меня от Твоего наказания в День, когда Ты воскресишь Своих рабов.',
    textEn: 'O Allah, protect me from Your punishment on the Day You resurrect Your servants.',
    transliteration: 'Аллахумма кыни азабака йаума табасу ибадак.',
    source: 'Абу Дауд 5045, Ат-Тирмизи 3398',
  },
  {
    id: 'sleep_3', categoryId: 'sleep', sortOrder: 3, targetCount: 33,
    textAr: 'سُبْحَانَ اللَّهِ',
    textRu: 'Пречист Аллах.',
    textEn: 'Glory be to Allah.',
    transliteration: 'Субханаллах.',
    source: 'Аль-Бухари 3113, Муслим 2727',
  },
  {
    id: 'sleep_4', categoryId: 'sleep', sortOrder: 4, targetCount: 33,
    textAr: 'الْحَمْدُ لِلَّهِ',
    textRu: 'Хвала Аллаху.',
    textEn: 'Praise be to Allah.',
    transliteration: 'Альхамдулиллях.',
    source: 'Аль-Бухари 3113, Муслим 2727',
  },
  {
    id: 'sleep_5', categoryId: 'sleep', sortOrder: 5, targetCount: 34,
    textAr: 'اللَّهُ أَكْبَرُ',
    textRu: 'Аллах велик.',
    textEn: 'Allah is the Greatest.',
    transliteration: 'Аллаху Акбар.',
    source: 'Аль-Бухари 3113, Муслим 2727',
  },
  {
    id: 'sleep_6', categoryId: 'sleep', sortOrder: 6, targetCount: 1,
    textAr: 'اللَّهُمَّ بِاسْمِكَ أَحْيَا وَبِاسْمِكَ أَمُوتُ',
    textRu: 'О Аллах, с Твоим именем я живу и с Твоим именем умираю.',
    textEn: 'O Allah, with Your name I live and with Your name I die.',
    transliteration: 'Аллахумма бисмика ахья ва бисмика амут.',
    source: 'Аль-Бухари 6324',
  },
  {
    id: 'sleep_7', categoryId: 'sleep', sortOrder: 7, targetCount: 1,
    textAr: 'قُلْ هُوَ اللَّهُ أَحَدٌ وَالْمُعَوِّذَتَانِ',
    textRu: 'Аль-Ихляс, Аль-Фаляк и Ан-Нас (читать, дуть в ладони, обтирать тело).',
    textEn: 'Al-Ikhlas, Al-Falaq and An-Nas (recite, blow into palms, wipe over body).',
    transliteration: 'Куль хуваллаху ахад... Куль аузу бираббиль-фалак... Куль аузу бираббин-нас...',
    source: 'Аль-Бухари 5017, Абу Дауд 5056',
  },
  {
    id: 'sleep_8', categoryId: 'sleep', sortOrder: 8, targetCount: 1,
    textAr: 'اللَّهُمَّ أَسْلَمْتُ نَفْسِي إِلَيْكَ وَفَوَّضْتُ أَمْرِي إِلَيْكَ وَأَلْجَأْتُ ظَهْرِي إِلَيْكَ رَغْبَةً وَرَهْبَةً إِلَيْكَ',
    textRu: 'О Аллах, я вверил себя Тебе, я возложил своё дело на Тебя, я прислонился спиной к Тебе, желая Тебя и страшась Тебя.',
    textEn: 'O Allah, I have submitted my soul to You, entrusted my affairs to You, and leaned my back on You, hoping in You and fearing You.',
    transliteration: 'Аллахумма асламту нафси иляйка ва фаввадту амри иляйка ва альджату захри иляйка рагбатан ва рахбатан иляйк.',
    source: 'Аль-Бухари 247, Муслим 2710',
  },

  // ── 5. WAKEUP (أذكار الاستيقاظ) ──────────────────────────────────────────
  {
    id: 'wakeup_1', categoryId: 'wakeup', sortOrder: 1, targetCount: 1,
    textAr: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
    textRu: 'Хвала Аллаху, Который оживил нас после того, как умертвил нас, и к Нему воскресение.',
    textEn: 'Praise be to Allah Who gave us life after causing us to die, and to Him is the resurrection.',
    transliteration: 'Альхамдулилляхи-ллязи ахяна бада ма аматана ва иляйхи-н-нушур.',
    source: 'Аль-Бухари 6312, Муслим 2711',
  },
  {
    id: 'wakeup_2', categoryId: 'wakeup', sortOrder: 2, targetCount: 1,
    textAr: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلَهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ',
    textRu: 'Нет божества, кроме одного лишь Аллаха. Хвала Аллаху, пречист Аллах, нет божества кроме Аллаха, Аллах Велик.',
    textEn: 'There is no god but Allah alone, He has no partner. Glory be to Allah, praise be to Allah, there is no god but Allah, and Allah is the Greatest.',
    transliteration: 'Ля иляха илляллаху вахдаху ля шарика лях, ляху-ль-мульку ва ляху-ль-хамду ва хува аля кулли шайин кадир, субханаллахи валь-хамдулилляхи ва ля иляха илляллаху валлаху акбар.',
    source: 'Аль-Бухари 1154',
  },
  {
    id: 'wakeup_3', categoryId: 'wakeup', sortOrder: 3, targetCount: 1,
    textAr: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ رَبِّ الْعَالَمِينَ',
    textRu: 'Мы вступили в утро, и вступило в утро всё царство Аллаха, Господа миров.',
    textEn: 'We have reached the morning and so has the kingdom of Allah, the Lord of the Worlds.',
    transliteration: 'Асбахна ва асбаха-ль-мульку лилляхи рабби-ль-алямин.',
    source: 'Аль-Адаб аль-Муфрад 1234',
  },
  {
    id: 'wakeup_4', categoryId: 'wakeup', sortOrder: 4, targetCount: 1,
    textAr: 'الْحَمْدُ لِلَّهِ الَّذِي عَافَانِي فِي جَسَدِي وَرَدَّ عَلَيَّ رُوحِي وَأَذِنَ لِي بِذِكْرِهِ',
    textRu: 'Хвала Аллаху, Который даровал мне здоровье в теле, вернул мне душу и позволил поминать Его.',
    textEn: 'Praise be to Allah Who gave me health in my body, returned my soul to me, and permitted me to remember Him.',
    transliteration: 'Альхамдулилляхи-ллязи афани фи джасади ва радда алайя рухи ва азина ли бизикрих.',
    source: 'Ат-Тирмизи 3401',
  },
  {
    id: 'wakeup_5', categoryId: 'wakeup', sortOrder: 5, targetCount: 1,
    textAr: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ هَذَا الْيَوْمِ وَخَيْرَ مَا فِيهِ',
    textRu: 'О Аллах, поистине я прошу Тебя о благе этого дня и благе того, что в нём.',
    textEn: 'O Allah, I ask You for the good of this day and the good of what is in it.',
    transliteration: 'Аллахумма инни асалюка хайра хаза-ль-яуми ва хайра ма фих.',
    source: 'Абу Дауд 5084',
  },

  // ── 6. TASBIH (التسبيح) ──────────────────────────────────────────────────
  {
    id: 'tasbih_1', categoryId: 'tasbih', sortOrder: 1, targetCount: 33,
    textAr: 'سُبْحَانَ اللَّهِ',
    textRu: 'Пречист Аллах.',
    textEn: 'Glory be to Allah.',
    transliteration: 'Субханаллах.',
    source: 'Муслим 597',
  },
  {
    id: 'tasbih_2', categoryId: 'tasbih', sortOrder: 2, targetCount: 33,
    textAr: 'الْحَمْدُ لِلَّهِ',
    textRu: 'Хвала Аллаху.',
    textEn: 'Praise be to Allah.',
    transliteration: 'Альхамдулиллях.',
    source: 'Муслим 597',
  },
  {
    id: 'tasbih_3', categoryId: 'tasbih', sortOrder: 3, targetCount: 34,
    textAr: 'اللَّهُ أَكْبَرُ',
    textRu: 'Аллах велик.',
    textEn: 'Allah is the Greatest.',
    transliteration: 'Аллаху Акбар.',
    source: 'Муслим 597',
  },
  {
    id: 'tasbih_4', categoryId: 'tasbih', sortOrder: 4, targetCount: 100,
    textAr: 'لَا إِلَهَ إِلَّا اللَّهُ',
    textRu: 'Нет божества, кроме Аллаха.',
    textEn: 'There is no god but Allah.',
    transliteration: 'Ля иляха илляллах.',
    source: 'Муслим 2691',
  },
  {
    id: 'tasbih_5', categoryId: 'tasbih', sortOrder: 5, targetCount: 100,
    textAr: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ',
    textRu: 'Пречист Аллах и хвала Ему. Пречист Аллах Великий.',
    textEn: 'Glory be to Allah and praise Him, glory be to Allah the Almighty.',
    transliteration: 'Субханаллахи ва бихамдихи субханаллахи-ль-азым.',
    source: 'Аль-Бухари 6682, Муслим 2694',
  },
  {
    id: 'tasbih_6', categoryId: 'tasbih', sortOrder: 6, targetCount: 10,
    textAr: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
    textRu: 'Нет силы и нет мощи ни у кого, кроме Аллаха.',
    textEn: 'There is no power and no strength except with Allah.',
    transliteration: 'Ля хавля ва ля куввата илля биллях.',
    source: 'Аль-Бухари 4205, Муслим 2704',
  },

  // ── 7. QURANIC DUAS (أدعية قرآنية) ───────────────────────────────────────
  {
    id: 'quran_duas_1', categoryId: 'quran_duas', sortOrder: 1, targetCount: 1,
    textAr: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
    textRu: 'Господь наш, даруй нам в этом мире благое и в будущей жизни благое и защити нас от мучений огня.',
    textEn: 'Our Lord, give us good in this world and good in the Hereafter, and save us from the torment of the Fire.',
    transliteration: 'Раббана атина фи-д-дунья хасанатан ва фи-ль-ахирати хасанатан ва кына азаба-н-нар.',
    source: 'Аль-Бакара 2:201',
  },
  {
    id: 'quran_duas_2', categoryId: 'quran_duas', sortOrder: 2, targetCount: 1,
    textAr: 'رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي وَاحْلُلْ عُقْدَةً مِنْ لِسَانِي يَفْقَهُوا قَوْلِي',
    textRu: 'Господи, раскрой мне грудь, облегчи мне дело и развяжи узел на моём языке, чтобы они поняли мою речь.',
    textEn: 'My Lord, expand my breast, make easy my task, and untie the knot from my tongue so that they may understand my speech.',
    transliteration: 'Рабби-шрах ли садри ва яссир ли амри вахлуль укдатан мин лисани йафкаху кавли.',
    source: 'Та-Ха 20:25-28',
  },
  {
    id: 'quran_duas_3', categoryId: 'quran_duas', sortOrder: 3, targetCount: 1,
    textAr: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِنْ لَدُنْكَ رَحْمَةً إِنَّكَ أَنْتَ الْوَهَّابُ',
    textRu: 'Господь наш, не дай нашим сердцам уклониться после того, как Ты наставил нас, и даруй нам милость от Тебя, воистину Ты — Дарующий.',
    textEn: 'Our Lord, do not let our hearts deviate after You have guided us, and grant us mercy from Yourself. Indeed, You are the Bestower.',
    transliteration: 'Раббана ля тузиг кулубана баада из хадайтана ва хаб лана мин ладунка рахматан иннака анта-ль-ваххаб.',
    source: 'Аль Имран 3:8',
  },
  {
    id: 'quran_duas_4', categoryId: 'quran_duas', sortOrder: 4, targetCount: 1,
    textAr: 'رَبِّ إِنِّي لِمَا أَنْزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ',
    textRu: 'Господи, поистине я нуждаюсь в любом благе, которое Ты ниспошлёшь мне.',
    textEn: 'My Lord, indeed I am in need of whatever good You would send down to me.',
    transliteration: 'Рабби инни лима анзальта иляйя мин хайрин факир.',
    source: 'Аль-Касас 28:24',
  },
  {
    id: 'quran_duas_5', categoryId: 'quran_duas', sortOrder: 5, targetCount: 1,
    textAr: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا',
    textRu: 'Господь наш, подари нам отраду глаз от наших супругов и потомства и сделай нас образцом для богобоязненных.',
    textEn: 'Our Lord, grant us from among our wives and offspring comfort to our eyes and make us an example for the righteous.',
    transliteration: 'Раббана хаб лана мин азваджина ва зуррийатина куррата аюнин ваджалана лиль-муттакына имама.',
    source: 'Аль-Фуркан 25:74',
  },
  {
    id: 'quran_duas_6', categoryId: 'quran_duas', sortOrder: 6, targetCount: 1,
    textAr: 'رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ وَعَلَى وَالِدَيَّ وَأَنْ أَعْمَلَ صَالِحًا تَرْضَاهُ',
    textRu: 'Господи, вдохнови меня благодарить Тебя за милость, которую Ты оказал мне и моим родителям, и совершать праведные деяния, которыми Ты доволен.',
    textEn: 'My Lord, enable me to be grateful for Your favor which You have bestowed upon me and upon my parents and to work righteousness of which You will approve.',
    transliteration: 'Рабби авзиний ан ашкура нимматакалляти анамта алайя ва аля валидайя ва ан амала салихан тардах.',
    source: 'Аль-Ахкаф 46:15',
  },
  {
    id: 'quran_duas_7', categoryId: 'quran_duas', sortOrder: 7, targetCount: 1,
    textAr: 'رَبَّنَا اغْفِرْ لَنَا ذُنُوبَنَا وَإِسْرَافَنَا فِي أَمْرِنَا وَثَبِّتْ أَقْدَامَنَا وَانْصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ',
    textRu: 'Господь наш, прости нам наши грехи и чрезмерность в наших делах, упрочь нашу поступь и помоги нам одолеть неверующих людей.',
    textEn: 'Our Lord, forgive us our sins and the excess of our deeds, make firm our feet, and give us victory over the disbelieving people.',
    transliteration: 'Раббана-гфир лана зунубана ва исрафана фи амрина ва саббит акдамана ва-нсурна аля-ль-кавми-ль-кафирин.',
    source: 'Аль Имран 3:147',
  },
  {
    id: 'quran_duas_8', categoryId: 'quran_duas', sortOrder: 8, targetCount: 1,
    textAr: 'رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ',
    textRu: 'Господи, прости меня, моих родителей и верующих в тот День, когда наступит расчёт.',
    textEn: 'Our Lord, forgive me and my parents and the believers on the Day when the account is established.',
    transliteration: 'Раббана-гфир ли ва ли валидайя ва лиль-муминина йаума йакуму-ль-хисаб.',
    source: 'Ибрахим 14:41',
  },

  // ── 8. PROTECTION (أذكار الحماية) ─────────────────────────────────────────
  {
    id: 'protection_1', categoryId: 'protection', sortOrder: 1, targetCount: 3,
    textAr: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
    textRu: 'Прибегаю к совершенным словам Аллаха от зла того, что Он создал.',
    textEn: 'I seek refuge in the perfect words of Allah from the evil of what He has created.',
    transliteration: 'Аузу бикалиматиллахи-т-таммати мин шарри ма халяк.',
    source: 'Муслим 2709',
  },
  {
    id: 'protection_2', categoryId: 'protection', sortOrder: 2, targetCount: 1,
    textAr: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ',
    textRu: 'Во имя Аллаха, с именем Которого не причинит вреда ничто ни на земле, ни на небе.',
    textEn: 'In the name of Allah, with Whose name nothing on earth or in heaven can cause harm.',
    transliteration: 'Бисмилляхи-ллязи ля ядурру маа-смихи шайун фи-ль-арди ва ля фи-с-сама.',
    source: 'Абу Дауд 5088',
  },
  {
    id: 'protection_3', categoryId: 'protection', sortOrder: 3, targetCount: 1,
    textAr: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَأَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ، وَأَعُوذُ بِكَ مِنَ الْجُبْنِ وَالْبُخْلِ، وَأَعُوذُ بِكَ مِنْ غَلَبَةِ الدَّيْنِ وَقَهْرِ الرِّجَالِ',
    textRu: 'О Аллах, я прибегаю к Тебе от тревоги и скорби, от немощи и лени, от трусости и скупости, и от бремени долга и людского принуждения.',
    textEn: 'O Allah, I seek refuge in You from worry and grief, from incapacity and laziness, from cowardice and miserliness, and from the burden of debt and the oppression of men.',
    transliteration: 'Аллахумма инни аузу бика мин-аль-хамми ва-ль-хазани, ва аузу бика мин-аль-аджзи ва-ль-касали, ва аузу бика мин-аль-джубни ва-ль-бухли, ва аузу бика мин галябати-д-дайни ва кахри-р-риджаль.',
    source: 'Аль-Бухари 2893',
  },
  {
    id: 'protection_4', categoryId: 'protection', sortOrder: 4, targetCount: 1,
    textAr: 'اللَّهُمَّ احْفَظْنِي مِنْ بَيْنِ يَدَيَّ وَمِنْ خَلْفِي وَعَنْ يَمِينِي وَعَنْ شِمَالِي وَمِنْ فَوْقِي وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي',
    textRu: 'О Аллах, храни меня спереди, сзади, справа, слева, и сверху, и прибегаю к Твоему величию, чтобы меня не поглотило снизу.',
    textEn: 'O Allah, guard me from my front, behind me, from my right, left and above, and I seek refuge in Your greatness from being swallowed from below.',
    transliteration: 'Аллахуммахфазни мин байни йадайя ва мин халфи ва ан йамини ва ан шимали ва мин фавки ва аузу биазаматика ан угтала мин тахти.',
    source: 'Абу Дауд 5074, Ибн Маджа 3871',
  },
  {
    id: 'protection_5', categoryId: 'protection', sortOrder: 5, targetCount: 1,
    textAr: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي',
    textRu: 'О Аллах, я прошу Тебя о прощении и благополучии в моей религии, мирской жизни, семье и имуществе.',
    textEn: 'O Allah, I ask You for forgiveness and well-being in my religion, worldly life, family, and wealth.',
    transliteration: 'Аллахумма инни асалюка-ль-афва ва-ль-афията фи дини ва дунйайя ва ахли ва мали.',
    source: 'Абу Дауд 5074',
  },
  {
    id: 'protection_6', categoryId: 'protection', sortOrder: 6, targetCount: 1,
    textAr: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ زَوَالِ نِعْمَتِكَ وَتَحَوُّلِ عَافِيَتِكَ وَفُجَاءَةِ نِقْمَتِكَ وَجَمِيعِ سَخَطِكَ',
    textRu: 'О Аллах, я прибегаю к Тебе от исчезновения Твоей милости, изменения Твоего благополучия, внезапности Твоего наказания и от всего, что вызывает Твой гнев.',
    textEn: 'O Allah, I seek refuge in You from the disappearance of Your blessings, the removal of Your protection, the sudden onset of Your punishment, and from all Your displeasure.',
    transliteration: 'Аллахумма инни аузу бика мин заваль нимматика ва тахаввули афийатика ва фуджаати никматика ва джамии сахатик.',
    source: 'Муслим 2739',
  },

  // ── 9. TRAVEL (أذكار السفر) ───────────────────────────────────────────────
  {
    id: 'travel_1', categoryId: 'travel', sortOrder: 1, targetCount: 1,
    textAr: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ',
    textRu: 'Пречист Тот, Кто подчинил нам это, тогда как мы не были в состоянии сделать это сами, и воистину, мы к нашему Господу непременно вернёмся.',
    textEn: 'Glory be to Him Who subjected this to us, for we could not have done it ourselves, and indeed to our Lord we will return.',
    transliteration: 'Субхана-ллязи саккара лана хаза ва ма кунна ляху мукрынина ва инна иля раббина лямункалибун.',
    source: 'Аз-Зухруф 43:13, Абу Дауд 2602',
  },
  {
    id: 'travel_2', categoryId: 'travel', sortOrder: 2, targetCount: 1,
    textAr: 'اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى، وَمِنَ الْعَمَلِ مَا تَرْضَى',
    textRu: 'О Аллах, мы просим Тебя в нашем путешествии благочестия и богобоязненности, и из дел — то, чем Ты доволен.',
    textEn: 'O Allah, we ask You during this journey for righteousness and piety, and deeds that please You.',
    transliteration: 'Аллахумма инна насалюка фи сафарина хаза-ль-бирра ва-т-такуа ва миналь-амали ма тарда.',
    source: 'Муслим 1342',
  },
  {
    id: 'travel_3', categoryId: 'travel', sortOrder: 3, targetCount: 3,
    textAr: 'اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا',
    textRu: 'Аллах Велик, Аллах Велик, Аллах Велик. Пречист Тот, Кто подчинил нам это.',
    textEn: 'Allah is the Greatest, Allah is the Greatest, Allah is the Greatest. Glory to Him Who subjected this to us.',
    transliteration: 'Аллаху Акбар, Аллаху Акбар, Аллаху Акбар, субхана-ллязи саккара лана хаза.',
    source: 'Муслим 1342',
  },
  {
    id: 'travel_4', categoryId: 'travel', sortOrder: 4, targetCount: 1,
    textAr: 'اللَّهُمَّ أَنْتَ الصَّاحِبُ فِي السَّفَرِ، وَالْخَلِيفَةُ فِي الْأَهْلِ',
    textRu: 'О Аллах, Ты — спутник в путешествии и хранитель семьи.',
    textEn: 'O Allah, You are the companion in travel, and the guardian of the family.',
    transliteration: 'Аллахумма анта-с-сахибу фи-с-сафари ва-ль-халифату фи-ль-ахль.',
    source: 'Муслим 1342',
  },
  {
    id: 'travel_5', categoryId: 'travel', sortOrder: 5, targetCount: 1,
    textAr: 'اللَّهُمَّ اطْوِ لَنَا الْأَرْضَ وَهَوِّنْ عَلَيْنَا السَّفَرَ',
    textRu: 'О Аллах, сократи для нас землю и облегчи нам путешествие.',
    textEn: 'O Allah, fold the earth for us and make the journey easy for us.',
    transliteration: 'Аллахуммату-ви лана-ль-арда ва хаввин алайна-с-сафар.',
    source: 'Аль-Хаким, Ат-Табарани',
  },

  // ── 10. FOOD (أذكار الطعام) ───────────────────────────────────────────────
  {
    id: 'food_1', categoryId: 'food', sortOrder: 1, targetCount: 1,
    textAr: 'بِسْمِ اللَّهِ',
    textRu: 'Во имя Аллаха.',
    textEn: 'In the name of Allah.',
    transliteration: 'Бисмиллях.',
    source: 'Аль-Бухари 5376, Муслим 2017',
  },
  {
    id: 'food_2', categoryId: 'food', sortOrder: 2, targetCount: 1,
    textAr: 'بِسْمِ اللَّهِ وَعَلَى بَرَكَةِ اللَّهِ',
    textRu: 'Во имя Аллаха и с благодатью Аллаха.',
    textEn: 'In the name of Allah and with the blessing of Allah.',
    transliteration: 'Бисмиллахи ва аля баракатиллах.',
    source: 'Абу Дауд 3767, Ибн Маджа 3264',
  },
  {
    id: 'food_3', categoryId: 'food', sortOrder: 3, targetCount: 1,
    textAr: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ',
    textRu: 'Хвала Аллаху, Который накормил меня этим и наделил меня им без какой-либо силы с моей стороны и мощи.',
    textEn: 'Praise be to Allah Who fed me this and provided it for me without any power or strength from my side.',
    transliteration: 'Альхамдулилляхи-ллязи атамани хаза ва разакыних мин гайри хавлин минни ва ля куввах.',
    source: 'Абу Дауд 4023, Ат-Тирмизи 3458',
  },
  {
    id: 'food_4', categoryId: 'food', sortOrder: 4, targetCount: 1,
    textAr: 'اللَّهُمَّ بَارِكْ لَنَا فِيهِ وَأَطْعِمْنَا خَيْرًا مِنْهُ',
    textRu: 'О Аллах, благослови нам это и накорми нас лучшим, чем это.',
    textEn: 'O Allah, bless it for us and feed us better than it.',
    transliteration: 'Аллахумма барик лана фихи ва атимна хайран минх.',
    source: 'Ат-Тирмизи 3455',
  },

  // ── 11. ENTERING HOME (أذكار دخول المنزل) ────────────────────────────────
  {
    id: 'entering_home_1', categoryId: 'entering_home', sortOrder: 1, targetCount: 1,
    textAr: 'بِسْمِ اللَّهِ وَلَجْنَا، وَبِسْمِ اللَّهِ خَرَجْنَا، وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا',
    textRu: 'Во имя Аллаха мы вошли, во имя Аллаха мы вышли, и на Аллаха, нашего Господа, мы уповаем.',
    textEn: 'In the name of Allah we enter, in the name of Allah we leave, and upon Allah our Lord we rely.',
    transliteration: 'Бисмилляхи валяджна, ва бисмилляхи харажна, ва аля Аллахи раббина таваккальна.',
    source: 'Абу Дауд 5096',
  },
  {
    id: 'entering_home_2', categoryId: 'entering_home', sortOrder: 2, targetCount: 1,
    textAr: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ الْمَوْلِجِ وَخَيْرَ الْمَخْرَجِ، بِسْمِ اللَّهِ وَلَجْنَا، وَبِسْمِ اللَّهِ خَرَجْنَا',
    textRu: 'О Аллах, я прошу Тебя о благе входа и благе выхода. Во имя Аллаха вошли мы и во имя Аллаха вышли мы.',
    textEn: "O Allah, I ask You for good in the entering and good in the leaving. In Allah's name we enter and in Allah's name we leave.",
    transliteration: 'Аллахумма инни асалюка хайра-ль-мауляджи ва хайра-ль-махраджи, бисмиллахи валяджна ва бисмилляхи харажна.',
    source: 'Абу Дауд 5096',
  },
  {
    id: 'entering_home_3', categoryId: 'entering_home', sortOrder: 3, targetCount: 1,
    textAr: 'السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ',
    textRu: 'Мир нам и праведным рабам Аллаха.',
    textEn: 'Peace be upon us and upon the righteous servants of Allah.',
    transliteration: 'Ас-саляму алайна ва аля ибадиллахи-с-салихин.',
    source: 'Аль-Бухари (Аль-Адаб аль-Муфрад)',
  },

  // ── 12. ENTERING MOSQUE (أذكار المسجد) ───────────────────────────────────
  {
    id: 'entering_mosque_1', categoryId: 'entering_mosque', sortOrder: 1, targetCount: 1,
    textAr: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
    textRu: 'О Аллах, открой для меня врата Твоей милости.',
    textEn: 'O Allah, open the gates of Your mercy for me.',
    transliteration: 'Аллахуммафтах ли абваба рахматик.',
    source: 'Муслим 713',
  },
  {
    id: 'entering_mosque_2', categoryId: 'entering_mosque', sortOrder: 2, targetCount: 1,
    textAr: 'بِسْمِ اللَّهِ وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِ اللَّهِ، اللَّهُمَّ اغْفِرْ لِي ذُنُوبِي وَافْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
    textRu: 'Во имя Аллаха, благословение и мир посланнику Аллаха. О Аллах, прости мои грехи и открой для меня врата Твоей милости.',
    textEn: 'In the name of Allah, peace and blessings be upon the Messenger of Allah. O Allah, forgive my sins and open the gates of Your mercy for me.',
    transliteration: 'Бисмилляхи вас-саляту вас-саляму аля расулилляхи, Аллахуммагфир ли зунуби вафтах ли абваба рахматик.',
    source: 'Ибн Маджа 771',
  },
  {
    id: 'entering_mosque_3', categoryId: 'entering_mosque', sortOrder: 3, targetCount: 1,
    textAr: 'اللَّهُمَّ اعْصِمْنِي مِنَ الشَّيْطَانِ الرَّجِيمِ',
    textRu: 'О Аллах, защити меня от проклятого шайтана.',
    textEn: 'O Allah, protect me from the accursed Shaytan.',
    transliteration: 'Аллахуммасымни мина-ш-шайтани-р-раджим.',
    source: 'Абу Дауд 465',
  },
  {
    id: 'entering_mosque_4', categoryId: 'entering_mosque', sortOrder: 4, targetCount: 1,
    textAr: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ',
    textRu: 'О Аллах, я прошу Тебя о Твоей щедрости.',
    textEn: 'O Allah, I ask You from Your bounty.',
    transliteration: 'Аллахумма инни асалюка мин фадлик.',
    source: 'Муслим 713',
  },

  // ── 13. STRESS / DISTRESS (أذكار الكرب) ───────────────────────────────────
  {
    id: 'stress_1', categoryId: 'stress', sortOrder: 1, targetCount: 1,
    textAr: 'لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ',
    textRu: 'Нет божества, кроме Тебя, пречист Ты, поистине я был из числа несправедливых.',
    textEn: 'There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.',
    transliteration: 'Ля иляха илля анта субханака инни кунту миназ-залимин.',
    source: 'Аль-Анбийа 21:87, Ат-Тирмизи 3505',
  },
  {
    id: 'stress_2', categoryId: 'stress', sortOrder: 2, targetCount: 1,
    textAr: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',
    textRu: 'Нам достаточно Аллаха, и как прекрасен Он как Попечитель.',
    textEn: 'Sufficient is Allah for us, and He is the best Disposer of affairs.',
    transliteration: 'Хасбуналлаху ва нималь-вакиль.',
    source: 'Аль-Бухари 4563, Аль Имран 3:173',
  },
  {
    id: 'stress_3', categoryId: 'stress', sortOrder: 3, targetCount: 1,
    textAr: 'اللَّهُمَّ إِنِّي عَبْدُكَ ابْنُ عَبْدِكَ ابْنُ أَمَتِكَ، نَاصِيَتِي بِيَدِكَ، مَاضٍ فِيَّ حُكْمُكَ، عَدْلٌ فِيَّ قَضَاؤُكَ',
    textRu: 'О Аллах, поистине я — Твой раб, сын Твоего раба, сын Твоей рабыни. Власть над моим чубом в Твоей руке. Непреложно Твоё предопределение в отношении меня. Справедлив Твой суд обо мне.',
    textEn: 'O Allah, I am Your slave, son of Your slave, son of Your female slave. My forelock is in Your hand. Your decree is what prevails over me. Your judgment about me is just.',
    transliteration: 'Аллахумма инни абдука ибну абдика ибну аматика, насийяти бийадика, мадин фийя хукмука, адлюн фийя кадаука.',
    source: 'Аль-Бухари (аль-Адаб аль-Муфрад) 704, Ахмад',
  },
  {
    id: 'stress_4', categoryId: 'stress', sortOrder: 4, targetCount: 1,
    textAr: 'اللَّهُمَّ رَحْمَتَكَ أَرْجُو فَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ وَأَصْلِحْ لِي شَأْنِي كُلَّهُ',
    textRu: 'О Аллах, я надеюсь на Твою милость, поэтому не оставляй меня на попечение самого себя даже на миг и исправь все мои дела.',
    textEn: 'O Allah, I hope for Your mercy, so do not leave me to myself for the blink of an eye, and rectify all my affairs.',
    transliteration: 'Аллахумма рахматака арджу фаля такилни иля нафси тарфата айн ва аслих ли шани куллах.',
    source: 'Абу Дауд 5090, Ахмад',
  },
  {
    id: 'stress_5', categoryId: 'stress', sortOrder: 5, targetCount: 1,
    textAr: 'اللَّهُ اللَّهُ رَبِّي لَا أُشْرِكُ بِهِ شَيْئًا',
    textRu: 'Аллах, Аллах — мой Господь. Я не поклоняюсь ни одному другому с Ним.',
    textEn: 'Allah, Allah is my Lord. I do not associate anything with Him.',
    transliteration: 'Аллах Аллах раббии ля ушрику бихи шайан.',
    source: 'Абу Дауд 1525',
  },

  // ── 14. GRATITUDE (أذكار الشكر) ──────────────────────────────────────────
  {
    id: 'gratitude_1', categoryId: 'gratitude', sortOrder: 1, targetCount: 1,
    textAr: 'الْحَمْدُ لِلَّهِ الَّذِي بِنِعْمَتِهِ تَتِمُّ الصَّالِحَاتُ',
    textRu: 'Хвала Аллаху, по милости Которого совершаются благие дела.',
    textEn: 'Praise be to Allah by Whose blessing good deeds are completed.',
    transliteration: 'Альхамдулилляхи-ллязи бинимматихи татиммус-салихат.',
    source: 'Ибн Маджа 3803',
  },
  {
    id: 'gratitude_2', categoryId: 'gratitude', sortOrder: 2, targetCount: 1,
    textAr: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
    textRu: 'Хвала Аллаху, Господу миров.',
    textEn: 'Praise be to Allah, the Lord of the Worlds.',
    transliteration: 'Альхамдулилляхи раббиль-алямин.',
    source: 'Аль-Фатиха 1:2',
  },
  {
    id: 'gratitude_3', categoryId: 'gratitude', sortOrder: 3, targetCount: 1,
    textAr: 'اللَّهُمَّ لَكَ الْحَمْدُ كُلُّهُ وَلَكَ الشُّكْرُ كُلُّهُ',
    textRu: 'О Аллах, Тебе вся хвала и Тебе вся благодарность.',
    textEn: 'O Allah, to You belongs all praise and all thanks.',
    transliteration: 'Аллахумма ляка-ль-хамду куллюху ва ляка-ш-шукру куллюх.',
    source: 'Аль-Хаким 1/499',
  },
  {
    id: 'gratitude_4', categoryId: 'gratitude', sortOrder: 4, targetCount: 1,
    textAr: 'اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ',
    textRu: 'О Аллах, всякая милость, которой я обладаю утром, — от Тебя одного, нет у Тебя сотоварища, Тебе хвала и Тебе благодарность.',
    textEn: 'O Allah, whatever blessing I have in the morning is from You alone, You have no partner. Yours is all praise and all thanks.',
    transliteration: 'Аллахумма ма асбаха би мин нимматин фа минка вахдака ля шарика лак, фа ляка-ль-хамду ва ляка-ш-шукр.',
    source: 'Абу Дауд 5073',
  },
  {
    id: 'gratitude_5', categoryId: 'gratitude', sortOrder: 5, targetCount: 1,
    textAr: 'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا أَنْتَ، أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ',
    textRu: 'Пречист Ты, о Аллах, и хвала Тебе. Свидетельствую, что нет божества кроме Тебя, прошу Тебя о прощении и каюсь Тебе.',
    textEn: 'Glory be to You, O Allah, and praise. I bear witness that there is no god but You. I seek Your forgiveness and I repent to You.',
    transliteration: 'Субханака-ллахумма ва бихамдика, ашхаду ан ля иляха илля анта, астагфирука ва атубу иляйк.',
    source: 'Ат-Тирмизи 3433, Ан-Насаи',
  },

  // ── 15. ISTIGHFAR (الاستغفار) ─────────────────────────────────────────────
  {
    id: 'istighfar_1', categoryId: 'istighfar', sortOrder: 1, targetCount: 100,
    textAr: 'أَسْتَغْفِرُ اللَّهَ',
    textRu: 'Прошу прощения у Аллаха.',
    textEn: 'I seek forgiveness from Allah.',
    transliteration: 'Астагфируллах.',
    source: 'Аль-Бухари 6307, Муслим 2702',
  },
  {
    id: 'istighfar_2', categoryId: 'istighfar', sortOrder: 2, targetCount: 3,
    textAr: 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ',
    textRu: 'Прошу прощения у Аллаха Великого, нет божества кроме Него, Живого, Вечного, и каюсь Ему.',
    textEn: 'I seek forgiveness from Allah the Almighty, besides Whom there is no god, the Ever-Living, the Sustainer, and I repent to Him.',
    transliteration: 'Астагфируллаха-ль-азыма-ллязи ля иляха илля хуваль-хаййу-ль-каййуму ва атубу иляйх.',
    source: 'Абу Дауд 1517, Ат-Тирмизи 3577',
  },
  {
    id: 'istighfar_3', categoryId: 'istighfar', sortOrder: 3, targetCount: 1,
    textAr: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي، فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
    textRu: 'Господи, Ты — мой Господь. Нет бога кроме Тебя. Ты создал меня и я — Твой раб. Я верен Твоему завету и обещанию, насколько могу. Прибегаю к Тебе от зла своих дел. Признаю Твои блага и свой грех. Прости же меня, ибо никто не прощает грехи кроме Тебя.',
    textEn: 'O Allah, You are my Lord, there is no god but You. You created me and I am Your slave. I am committed to Your covenant as best I can. I seek refuge in You from the evil I have done. I acknowledge Your blessings upon me and I confess my sins. Forgive me, for no one forgives sins but You.',
    transliteration: 'Аллахумма анта рабби ля иляха илля анта, халяктани ва ана абдука, ва ана аля ахдика ва ваъдика масататту, аузу бика мин шарри ма санату, абуу ляка бинимматика алайя ва абуу бизамби фагфир ли фаиннаху ля йагфиру-з-зунуба илля ант.',
    source: 'Аль-Бухари 6306 — Сайид уль-Истигфар (Господин Истигфара)',
  },
  {
    id: 'istighfar_4', categoryId: 'istighfar', sortOrder: 4, targetCount: 70,
    textAr: 'رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ',
    textRu: 'Господи, прости меня и прими моё покаяние, поистине Ты — Принимающий покаяние, Милосердный.',
    textEn: 'My Lord, forgive me and accept my repentance. Indeed, You are the Accepting of repentance, the Merciful.',
    transliteration: 'Раббигфир ли ва туб алайя иннака анта-т-тавваби-р-рахим.',
    source: 'Абу Дауд 1516, Ат-Тирмизи 3434',
  },
  {
    id: 'istighfar_5', categoryId: 'istighfar', sortOrder: 5, targetCount: 1,
    textAr: 'اللَّهُمَّ اغْفِرْ لِي مَا قَدَّمْتُ وَمَا أَخَّرْتُ وَمَا أَسْرَرْتُ وَمَا أَعْلَنْتُ وَمَا أَسْرَفْتُ وَمَا أَنْتَ أَعْلَمُ بِهِ مِنِّي',
    textRu: 'О Аллах, прости мне то, что я совершил прежде, и то, что совершу после, и то, что я скрыл, и то, что совершил открыто, и то, в чём я превысил меру, и то, о чём Ты знаешь лучше меня.',
    textEn: 'O Allah, forgive me for what I have done and what I will do, what I have hidden and what I have shown, what I have exceeded in, and what You know better than I do.',
    transliteration: 'Аллахуммагфир ли ма каддамту ва ма аккарту ва ма асрарту ва ма аланту ва ма асрафту ва ма анта алему бихи минни.',
    source: 'Муслим 771',
  },
  {
    id: 'istighfar_6', categoryId: 'istighfar', sortOrder: 6, targetCount: 1,
    textAr: 'اللَّهُمَّ إِنِّي ظَلَمْتُ نَفْسِي ظُلْمًا كَثِيرًا وَلَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ فَاغْفِرْ لِي مَغْفِرَةً مِنْ عِنْدِكَ وَارْحَمْنِي إِنَّكَ أَنْتَ الْغَفُورُ الرَّحِيمُ',
    textRu: 'О Аллах, я причинил себе много зла, и нет того, кто прощает грехи, кроме Тебя. Прости же меня прощением от Тебя и помилуй меня, поистине Ты — Прощающий, Милосердный.',
    textEn: 'O Allah, I have greatly wronged myself and none forgives sins but You. So grant me forgiveness from You and have mercy on me. Indeed, You are the Forgiving, the Merciful.',
    transliteration: 'Аллахумма инни залямту нафси зульман касиран ва ля йагфиру-з-зунуба илля анта фагфир ли магфиратан мин индика вархамни иннака анта-ль-гафуру-р-рахим.',
    source: 'Аль-Бухари 834, Муслим 2705',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Get all adhkar for a specific category */
export function getAdhkarByCategory(categoryId: string): LocalAdhkar[] {
  return LOCAL_ADHKAR.filter(a => a.categoryId === categoryId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/** Get category count map */
export function getCategoryCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  LOCAL_ADHKAR.forEach(a => {
    counts[a.categoryId] = (counts[a.categoryId] || 0) + 1;
  });
  return counts;
}

/** Get enriched categories with counts */
export function getEnrichedCategories() {
  const counts = getCategoryCounts();
  return LOCAL_ADHKAR_CATEGORIES.map(cat => ({
    ...cat,
    count: counts[cat.id] || 0,
  })).sort((a, b) => a.sortOrder - b.sortOrder);
}

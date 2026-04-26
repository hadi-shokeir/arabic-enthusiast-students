// ─── Arabic Enthusiast — Content Data ───────────────────────────────────────
window.AE = window.AE || {};

window.AE.DATA = {
  brand: "ARABIC ENTHUSIAST",
  tagline: "Learn Arabic with Passion & Precision",
  instructor: {
    name: "Hadi Shokeir",
    title: "Arabic Language Instructor",
    bio: "",
    credentials: [],
    avatar: null
  },

  courses: [
    {
      id: "arabic-foundations",
      level: "Beginner",
      type: "Classical",
      title: "Arabic Foundations",
      arabic: "أساسيات العربية",
      subtitle: "Script, sounds & first words",
      desc: "Master all 28 letters, their positional forms, and begin reading real Arabic words. The essential first step for every learner.",
      color: "#ffffff",
      topics: ["The Arabic alphabet", "Letter forms (isolated, initial, medial, final)", "Short & long vowels", "Sun & moon letters"],
      featured: true
    },
    {
      id: "levantine-dialect",
      level: "Beginner",
      type: "Levantine",
      title: "Levantine Arabic",
      arabic: "العامية الشامية",
      subtitle: "Conversational Arabic",
      desc: "Speak naturally with Levantine speakers. Learn conversational Arabic as it's truly spoken — not just in textbooks.",
      color: "#cccccc",
      topics: ["Everyday conversation", "Levantine pronunciation", "Common expressions", "Family & daily life"],
      featured: true
    },
    {
      id: "quranic-arabic",
      level: "Beginner",
      type: "Quranic",
      title: "Quranic Arabic",
      arabic: "العربية القرآنية",
      subtitle: "Read & understand the Quran",
      desc: "Learn to read and understand the language of the Quran directly. Structured around the most frequent Quranic vocabulary and grammar.",
      color: "#aaaaaa",
      topics: ["Quranic script & tajweed basics", "High-frequency vocabulary", "Verb patterns", "Surah-based study"],
      featured: true
    }
  ],

  lessons: {
    "arabic-foundations": [
      { id: "l1", title: "The Arabic Alphabet", arabic: "حروف الهجاء", duration: 40, type: "video+exercise", free: true },
      { id: "l2", title: "Letter Groups & Shapes", arabic: "أشكال الحروف", duration: 35, type: "video+exercise", free: true },
      { id: "l3", title: "Connecting Letters", arabic: "وصل الحروف", duration: 45, type: "video+quiz", free: false },
      { id: "l4", title: "Short Vowels (Harakat)", arabic: "الحركات القصيرة", duration: 40, type: "video+exercise", free: false },
      { id: "l5", title: "Long Vowels & Diphthongs", arabic: "المدود والحروف اللينة", duration: 38, type: "video+exercise", free: false },
      { id: "l6", title: "Sun & Moon Letters", arabic: "الشمسية والقمرية", duration: 42, type: "video+quiz", free: false },
    ]
  },

  alphabet: [
    { ar: 'ا', name: 'Alif', trans: 'ā', group: 'a', forms: { isolated: 'ا', initial: 'ا', medial: 'ـا', final: 'ـا' }, note: 'The first letter — a long vertical stroke. Represents a glottal stop or long A sound.', example: { word: 'أَب', meaning: 'Father', trans: 'ab' } },
    { ar: 'ب', name: 'Ba', trans: 'b', group: 'b', forms: { isolated: 'ب', initial: 'بـ', medial: 'ـبـ', final: 'ـب' }, note: 'One dot below. Sounds like English B.', example: { word: 'بَيْت', meaning: 'House', trans: 'bayt' } },
    { ar: 'ت', name: 'Ta', trans: 't', group: 'b', forms: { isolated: 'ت', initial: 'تـ', medial: 'ـتـ', final: 'ـت' }, note: 'Two dots above. Sounds like English T.', example: { word: 'تُفَّاح', meaning: 'Apple', trans: 'tuffāḥ' } },
    { ar: 'ث', name: 'Tha', trans: 'th', group: 'b', forms: { isolated: 'ث', initial: 'ثـ', medial: 'ـثـ', final: 'ـث' }, note: 'Three dots above. Like English "th" in "think".', example: { word: 'ثَلَاثَة', meaning: 'Three', trans: 'thalātha' } },
    { ar: 'ج', name: 'Jim', trans: 'j', group: 'j', forms: { isolated: 'ج', initial: 'جـ', medial: 'ـجـ', final: 'ـج' }, note: 'One dot below the bowl. Like English J (or G in some dialects).', example: { word: 'جَمِيل', meaning: 'Beautiful', trans: 'jamīl' } },
    { ar: 'ح', name: 'Ḥa', trans: 'ḥ', group: 'j', forms: { isolated: 'ح', initial: 'حـ', medial: 'ـحـ', final: 'ـح' }, note: 'No dots. A breathy H from deep in the throat — unique to Arabic.', example: { word: 'حَيَاة', meaning: 'Life', trans: 'ḥayāh' } },
    { ar: 'خ', name: 'Kha', trans: 'kh', group: 'j', forms: { isolated: 'خ', initial: 'خـ', medial: 'ـخـ', final: 'ـخ' }, note: 'One dot above. Like the Scottish "loch" or Spanish "j".', example: { word: 'خُبْز', meaning: 'Bread', trans: 'khubz' } },
    { ar: 'د', name: 'Dal', trans: 'd', group: 'd', forms: { isolated: 'د', initial: 'د', medial: 'ـد', final: 'ـد' }, note: 'Does not connect forward. Like English D.', example: { word: 'دَرْس', meaning: 'Lesson', trans: 'dars' } },
    { ar: 'ذ', name: 'Dhal', trans: 'dh', group: 'd', forms: { isolated: 'ذ', initial: 'ذ', medial: 'ـذ', final: 'ـذ' }, note: 'One dot above. Like English "th" in "this".', example: { word: 'ذَهَب', meaning: 'Gold', trans: 'dhahab' } },
    { ar: 'ر', name: 'Ra', trans: 'r', group: 'r', forms: { isolated: 'ر', initial: 'ر', medial: 'ـر', final: 'ـر' }, note: 'Does not connect forward. A rolled or flapped R.', example: { word: 'رَجُل', meaning: 'Man', trans: 'rajul' } },
    { ar: 'ز', name: 'Zay', trans: 'z', group: 'r', forms: { isolated: 'ز', initial: 'ز', medial: 'ـز', final: 'ـز' }, note: 'One dot above Ra. Like English Z.', example: { word: 'زَيْت', meaning: 'Oil', trans: 'zayt' } },
    { ar: 'س', name: 'Sin', trans: 's', group: 's', forms: { isolated: 'س', initial: 'سـ', medial: 'ـسـ', final: 'ـس' }, note: 'Three teeth below. Like English S.', example: { word: 'سَمَاء', meaning: 'Sky', trans: 'samāʾ' } },
    { ar: 'ش', name: 'Shin', trans: 'sh', group: 's', forms: { isolated: 'ش', initial: 'شـ', medial: 'ـشـ', final: 'ـش' }, note: 'Three dots above Sin. Like English "sh".', example: { word: 'شَمْس', meaning: 'Sun', trans: 'shams' } },
    { ar: 'ص', name: 'Ṣad', trans: 'ṣ', group: 'sad', forms: { isolated: 'ص', initial: 'صـ', medial: 'ـصـ', final: 'ـص' }, note: 'Emphatic S — tongue pressed to the roof. Heavier than regular S.', example: { word: 'صَبْر', meaning: 'Patience', trans: 'ṣabr' } },
    { ar: 'ض', name: 'Ḍad', trans: 'ḍ', group: 'sad', forms: { isolated: 'ض', initial: 'ضـ', medial: 'ـضـ', final: 'ـض' }, note: 'Emphatic D. Arabic is sometimes called "the language of the Ḍad".', example: { word: 'ضَوْء', meaning: 'Light', trans: 'ḍawʾ' } },
    { ar: 'ط', name: 'Ṭa', trans: 'ṭ', group: 'sad', forms: { isolated: 'ط', initial: 'طـ', medial: 'ـطـ', final: 'ـط' }, note: 'Emphatic T — pharyngealized, deeper than regular T.', example: { word: 'طَرِيق', meaning: 'Road', trans: 'ṭarīq' } },
    { ar: 'ظ', name: 'Ẓa', trans: 'ẓ', group: 'sad', forms: { isolated: 'ظ', initial: 'ظـ', medial: 'ـظـ', final: 'ـظ' }, note: 'Emphatic Dh. Often merged with ض in spoken Arabic.', example: { word: 'ظَلَام', meaning: 'Darkness', trans: 'ẓalām' } },
    { ar: 'ع', name: 'ʿAin', trans: 'ʿ', group: 'ain', forms: { isolated: 'ع', initial: 'عـ', medial: 'ـعـ', final: 'ـع' }, note: 'Unique to Arabic — a constriction deep in the throat. One of the defining Arabic sounds.', example: { word: 'عَرَبِي', meaning: 'Arabic', trans: 'ʿarabī' } },
    { ar: 'غ', name: 'Ghain', trans: 'gh', group: 'ain', forms: { isolated: 'غ', initial: 'غـ', medial: 'ـغـ', final: 'ـغ' }, note: 'Like a French R or a guttural G. Dot above ʿAin.', example: { word: 'غُرْفَة', meaning: 'Room', trans: 'ghurfa' } },
    { ar: 'ف', name: 'Fa', trans: 'f', group: 'f', forms: { isolated: 'ف', initial: 'فـ', medial: 'ـفـ', final: 'ـف' }, note: 'One dot above. Like English F.', example: { word: 'فَرَح', meaning: 'Joy', trans: 'faraḥ' } },
    { ar: 'ق', name: 'Qaf', trans: 'q', group: 'f', forms: { isolated: 'ق', initial: 'قـ', medial: 'ـقـ', final: 'ـق' }, note: 'Two dots above. A deep Q from the back of the throat — no English equivalent.', example: { word: 'قَلْب', meaning: 'Heart', trans: 'qalb' } },
    { ar: 'ك', name: 'Kaf', trans: 'k', group: 'k', forms: { isolated: 'ك', initial: 'كـ', medial: 'ـكـ', final: 'ـك' }, note: 'Like English K, but slightly softer.', example: { word: 'كِتَاب', meaning: 'Book', trans: 'kitāb' } },
    { ar: 'ل', name: 'Lam', trans: 'l', group: 'l', forms: { isolated: 'ل', initial: 'لـ', medial: 'ـلـ', final: 'ـل' }, note: 'Elegant descending curve. Like English L.', example: { word: 'لَيْل', meaning: 'Night', trans: 'layl' } },
    { ar: 'م', name: 'Mim', trans: 'm', group: 'm', forms: { isolated: 'م', initial: 'مـ', medial: 'ـمـ', final: 'ـم' }, note: 'A small round loop. Like English M.', example: { word: 'مَاء', meaning: 'Water', trans: 'māʾ' } },
    { ar: 'ن', name: 'Nun', trans: 'n', group: 'n', forms: { isolated: 'ن', initial: 'نـ', medial: 'ـنـ', final: 'ـن' }, note: 'One dot above. Like English N.', example: { word: 'نُور', meaning: 'Light', trans: 'nūr' } },
    { ar: 'ه', name: 'Ha', trans: 'h', group: 'h', forms: { isolated: 'ه', initial: 'هـ', medial: 'ـهـ', final: 'ـه' }, note: 'A breathy, soft H. Changes shape dramatically in different positions.', example: { word: 'هَوَاء', meaning: 'Air', trans: 'hawāʾ' } },
    { ar: 'و', name: 'Waw', trans: 'w', group: 'w', forms: { isolated: 'و', initial: 'و', medial: 'ـو', final: 'ـو' }, note: 'Does not connect forward. Like English W or long Ū vowel.', example: { word: 'وَرْد', meaning: 'Rose', trans: 'ward' } },
    { ar: 'ي', name: 'Ya', trans: 'y', group: 'y', forms: { isolated: 'ي', initial: 'يـ', medial: 'ـيـ', final: 'ـي' }, note: 'Two dots below. Like English Y or long Ī vowel.', example: { word: 'يَوْم', meaning: 'Day', trans: 'yawm' } },
  ],

  testimonials: [],

  pricing: []
};

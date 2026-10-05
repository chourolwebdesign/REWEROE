import type { Aspect, Lang } from "./rules";

/** Überschrift mit hervorgehobenem Mittelteil: [davor, betont, danach] */
type Emphasized = readonly [string, string, string];

export interface FeedbackTexts {
  name: string;
  dir: "ltr" | "rtl";
  languageLabel: string;
  h1: Emphasized;
  p1: string;
  facesLabel: string;
  pick: string;
  scale: readonly string[];
  hint: readonly string[];
  sending: string;
  h2: Emphasized;
  p2: string;
  aspectsLabel: string;
  aspects: Record<Aspect, string>;
  noteLabel: string;
  notePlaceholder: string;
  contactTitle: string;
  contactText: string;
  contactLabel: string;
  contactPlaceholder: string;
  contactNote: string;
  send: string;
  back: string;
  thanksGood: string;
  thanksBad: string;
  leadGood: string;
  leadBad: string;
  careTitle: string;
  careText: string;
  pitchGood: string;
  pitchBad: string;
  googleButton: string;
  googleFooter: string;
  newTab: string;
  privacy: string;
  privacyLink: string;
  errorInvalid: string;
  errorTooMany: string;
  errorFailed: string;
  retry: string;
}

/** Texte der Seite /feedback. Deutsch duzt (wie die Website); die anderen Sprachen folgen der QR-Vorlage. */
export const FEEDBACK_TEXTS: Record<Lang, FeedbackTexts> = {
  de: {
    name: "Deutsch",
    dir: "ltr",
    languageLabel: "Sprache",
    h1: ["Wie war dein ", "Einkauf", "?"],
    p1: "Ein Tipp genügt – anonym und in 10 Sekunden erledigt.",
    facesLabel: "Deine Bewertung",
    pick: "Tipp auf ein Gesicht.",
    scale: ["Sehr schlecht", "Schlecht", "In Ordnung", "Gut", "Ausgezeichnet"],
    hint: ["Das tut uns leid.", "Da war etwas nicht in Ordnung.", "Danke für deine Ehrlichkeit.", "Schön, das zu hören!", "Das freut uns sehr!"],
    sending: "Wird gesendet …",
    h2: ["Was können wir ", "besser", " machen?"],
    p2: "Mehrfachauswahl möglich – oder direkt weiter.",
    aspectsLabel: "Bereiche",
    aspects: { wartezeit: "Wartezeit", personal: "Personal", frische: "Frische", sauberkeit: "Sauberkeit", sortiment: "Sortiment", kasse: "Kasse", preis: "Preise", sonstiges: "Sonstiges" },
    noteLabel: "Kommentar (freiwillig)",
    notePlaceholder: "Was ist passiert?",
    contactTitle: "Dürfen wir das wiedergutmachen?",
    contactText: "Hinterlass E-Mail oder Telefonnummer – die Marktleitung meldet sich persönlich.",
    contactLabel: "E-Mail oder Telefon (freiwillig)",
    contactPlaceholder: "name@mail.de",
    contactNote: "Nur für die Antwort, nach 90 Tagen gelöscht.",
    send: "Absenden",
    back: "Zurück",
    thanksGood: "Herzlichen Dank!",
    thanksBad: "Danke für deine Offenheit.",
    leadGood: "Dein Feedback ist direkt bei unserem Team angekommen.",
    leadBad: "Deine Rückmeldung hilft uns wirklich weiter.",
    careTitle: "Wir kümmern uns darum",
    careText: "Deine Rückmeldung geht direkt an die Marktleitung. Hast du Kontaktdaten hinterlassen, melden wir uns bei dir.",
    pitchGood: "Teile deine Erfahrung auf Google – das dauert 30 Sekunden.",
    pitchBad: "Du kannst deine Erfahrung auch öffentlich auf Google teilen.",
    googleButton: "Auf Google bewerten",
    googleFooter: "Lieber gleich auf Google bewerten",
    newTab: "öffnet Google in einem neuen Tab",
    privacy: "Keine Cookies, keine Analyse-Dienste; deine IP-Adresse speichern wir nicht. Kontaktangaben löschen wir nach 90 Tagen, alles andere nach 12 Monaten.",
    privacyLink: "Datenschutz",
    errorInvalid: "Das hat nicht gepasst – bitte prüf deine Angaben.",
    errorTooMany: "Zu viele Rückmeldungen in kurzer Zeit. Bitte versuch es später noch einmal.",
    errorFailed: "Senden hat nicht geklappt – bitte prüf deine Verbindung.",
    retry: "Noch einmal senden",
  },
  tr: {
    name: "Türkçe",
    dir: "ltr",
    languageLabel: "Dil",
    h1: ["", "Alışverişiniz", " nasıldı?"],
    p1: "Tek dokunuş yeterli – anonim ve 10 saniyede biter.",
    facesLabel: "Değerlendirmeniz",
    pick: "Bir yüze dokunun.",
    scale: ["Çok kötü", "Kötü", "İdare eder", "İyi", "Mükemmel"],
    hint: ["Çok üzgünüz.", "Bir şeyler yolunda gitmemiş.", "Dürüstlüğünüz için teşekkürler.", "Bunu duymak güzel!", "Bu bizi çok mutlu etti!"],
    sending: "Gönderiliyor …",
    h2: ["Neyi ", "daha iyi", " yapabiliriz?"],
    p2: "Birden fazla seçebilir ya da doğrudan devam edebilirsiniz.",
    aspectsLabel: "Alanlar",
    aspects: { wartezeit: "Bekleme", personal: "Personel", frische: "Tazelik", sauberkeit: "Temizlik", sortiment: "Ürün çeşidi", kasse: "Kasa", preis: "Fiyatlar", sonstiges: "Diğer" },
    noteLabel: "Yorum (isteğe bağlı)",
    notePlaceholder: "Ne oldu?",
    contactTitle: "Telafi etmemize izin verir misiniz?",
    contactText: "E-posta veya telefon bırakın – mağaza müdürlüğü size bizzat dönsün.",
    contactLabel: "E-posta veya telefon (isteğe bağlı)",
    contactPlaceholder: "ad@mail.com",
    contactNote: "Yalnızca yanıt için kullanılır, 90 gün sonra silinir.",
    send: "Gönder",
    back: "Geri",
    thanksGood: "Çok teşekkürler!",
    thanksBad: "Açık sözlülüğünüz için teşekkürler.",
    leadGood: "Geri bildiriminiz doğrudan ekibimize ulaştı.",
    leadBad: "Geri bildiriminiz bize gerçekten yardımcı oluyor.",
    careTitle: "Bununla ilgileniyoruz",
    careText: "Geri bildiriminiz doğrudan mağaza müdürlüğüne iletiliyor. İletişim bilgisi bıraktıysanız size dönüş yapacağız.",
    pitchGood: "Deneyiminizi Google'da paylaşın – 30 saniye sürer.",
    pitchBad: "Deneyiminizi dilerseniz Google'da da paylaşabilirsiniz.",
    googleButton: "Google'da değerlendir",
    googleFooter: "Doğrudan Google'da değerlendirin",
    newTab: "Google yeni sekmede açılır",
    privacy: "Çerez yok, analiz hizmeti yok; IP adresinizi saklamıyoruz. İletişim bilgilerini 90 gün, diğer her şeyi 12 ay sonra sileriz.",
    privacyLink: "Gizlilik (Almanca)",
    errorInvalid: "Bir şeyler uymadı – lütfen bilgilerinizi kontrol edin.",
    errorTooMany: "Kısa sürede çok fazla geri bildirim. Lütfen daha sonra tekrar deneyin.",
    errorFailed: "Gönderilemedi – lütfen bağlantınızı kontrol edin.",
    retry: "Tekrar gönder",
  },
  ar: {
    name: "العربية",
    dir: "rtl",
    languageLabel: "اللغة",
    h1: ["كيف كانت ", "تجربة التسوق", "؟"],
    p1: "لمسة واحدة تكفي — دون ذكر الاسم وتنتهي خلال ١٠ ثوانٍ.",
    facesLabel: "تقييمك",
    pick: "اضغط على أحد الوجوه.",
    scale: ["سيئ جداً", "سيئ", "مقبول", "جيد", "ممتاز"],
    hint: ["نأسف بشدة.", "هناك شيء لم يكن على ما يرام.", "شكراً على صراحتك.", "يسعدنا سماع ذلك!", "هذا يسعدنا كثيراً!"],
    sending: "جارٍ الإرسال …",
    h2: ["ما الذي يمكننا ", "تحسينه", "؟"],
    p2: "يمكنك اختيار أكثر من خيار — أو المتابعة مباشرة.",
    aspectsLabel: "المجالات",
    aspects: { wartezeit: "الانتظار", personal: "الموظفون", frische: "الطازجية", sauberkeit: "النظافة", sortiment: "التشكيلة", kasse: "الصندوق", preis: "الأسعار", sonstiges: "أخرى" },
    noteLabel: "تعليق (اختياري)",
    notePlaceholder: "ماذا حدث؟",
    contactTitle: "هل تسمح لنا بتصحيح الأمر؟",
    contactText: "اترك بريداً إلكترونياً أو رقم هاتف — وستتواصل معك إدارة المتجر شخصياً.",
    contactLabel: "البريد الإلكتروني أو الهاتف (اختياري)",
    contactPlaceholder: "name@mail.com",
    contactNote: "يُستخدم للرد فقط ويُحذف بعد ٩٠ يوماً.",
    send: "إرسال",
    back: "رجوع",
    thanksGood: "شكراً جزيلاً!",
    thanksBad: "شكراً على صراحتك.",
    leadGood: "وصلت ملاحظاتك مباشرة إلى فريقنا.",
    leadBad: "ملاحظاتك تساعدنا فعلاً.",
    careTitle: "سنهتم بالأمر",
    careText: "تصل ملاحظاتك مباشرة إلى إدارة المتجر. إذا تركت بيانات اتصال فسنتواصل معك.",
    pitchGood: "شارك تجربتك على Google — يستغرق ذلك ٣٠ ثانية.",
    pitchBad: "يمكنك أيضاً مشاركة تجربتك علناً على Google.",
    googleButton: "قيّمنا على Google",
    googleFooter: "قيّمنا مباشرة على Google",
    newTab: "يفتح Google في علامة تبويب جديدة",
    privacy: "لا ملفات تعريف ارتباط ولا خدمات تحليل؛ لا نحفظ عنوان IP الخاص بك. نحذف بيانات الاتصال بعد ٩٠ يوماً وكل ما عدا ذلك بعد ١٢ شهراً.",
    privacyLink: "الخصوصية (بالألمانية)",
    errorInvalid: "هناك خطأ في البيانات — يرجى التحقق منها.",
    errorTooMany: "ملاحظات كثيرة في وقت قصير. يرجى المحاولة لاحقاً.",
    errorFailed: "تعذّر الإرسال — يرجى التحقق من الاتصال.",
    retry: "إعادة الإرسال",
  },
  ru: {
    name: "Русский",
    dir: "ltr",
    languageLabel: "Язык",
    h1: ["Как прошла ваша ", "покупка", "?"],
    p1: "Достаточно одного касания — анонимно, за 10 секунд.",
    facesLabel: "Ваша оценка",
    pick: "Нажмите на лицо.",
    scale: ["Очень плохо", "Плохо", "Нормально", "Хорошо", "Отлично"],
    hint: ["Нам очень жаль.", "Что-то пошло не так.", "Спасибо за честность.", "Приятно это слышать!", "Мы очень рады!"],
    sending: "Отправка …",
    h2: ["Что мы можем ", "улучшить", "?"],
    p2: "Можно выбрать несколько — или сразу продолжить.",
    aspectsLabel: "Области",
    aspects: { wartezeit: "Ожидание", personal: "Персонал", frische: "Свежесть", sauberkeit: "Чистота", sortiment: "Ассортимент", kasse: "Касса", preis: "Цены", sonstiges: "Другое" },
    noteLabel: "Комментарий (по желанию)",
    notePlaceholder: "Что произошло?",
    contactTitle: "Позвольте всё исправить",
    contactText: "Оставьте e-mail или телефон — руководство магазина свяжется с вами лично.",
    contactLabel: "E-mail или телефон (по желанию)",
    contactPlaceholder: "name@mail.com",
    contactNote: "Только для ответа, удаляется через 90 дней.",
    send: "Отправить",
    back: "Назад",
    thanksGood: "Большое спасибо!",
    thanksBad: "Спасибо за откровенность.",
    leadGood: "Ваш отзыв сразу попал к нашей команде.",
    leadBad: "Ваш отзыв действительно нам помогает.",
    careTitle: "Мы этим займёмся",
    careText: "Ваш отзыв поступает напрямую руководству магазина. Если вы оставили контакты, мы с вами свяжемся.",
    pitchGood: "Поделитесь опытом в Google — это займёт 30 секунд.",
    pitchBad: "Вы также можете публично поделиться опытом в Google.",
    googleButton: "Оценить в Google",
    googleFooter: "Оценить сразу в Google",
    newTab: "Google откроется в новой вкладке",
    privacy: "Без cookie и сервисов аналитики; ваш IP-адрес мы не сохраняем. Контакты удаляем через 90 дней, всё остальное — через 12 месяцев.",
    privacyLink: "Конфиденциальность (на немецком)",
    errorInvalid: "Что-то не так — проверьте, пожалуйста, данные.",
    errorTooMany: "Слишком много отзывов за короткое время. Попробуйте позже.",
    errorFailed: "Не удалось отправить — проверьте подключение.",
    retry: "Отправить снова",
  },
  en: {
    name: "English",
    dir: "ltr",
    languageLabel: "Language",
    h1: ["How was your ", "visit", "?"],
    p1: "One tap is enough – anonymous and done in 10 seconds.",
    facesLabel: "Your rating",
    pick: "Tap a face.",
    scale: ["Very poor", "Poor", "Okay", "Good", "Excellent"],
    hint: ["We are truly sorry.", "Something was not right.", "Thank you for your honesty.", "Great to hear!", "That makes our day!"],
    sending: "Sending …",
    h2: ["What could we do ", "better", "?"],
    p2: "Pick as many as you like – or just continue.",
    aspectsLabel: "Areas",
    aspects: { wartezeit: "Waiting", personal: "Staff", frische: "Freshness", sauberkeit: "Cleanliness", sortiment: "Range", kasse: "Checkout", preis: "Prices", sonstiges: "Other" },
    noteLabel: "Comment (optional)",
    notePlaceholder: "What happened?",
    contactTitle: "May we make it right?",
    contactText: "Leave an email or phone number – the store manager will get back to you personally.",
    contactLabel: "Email or phone (optional)",
    contactPlaceholder: "name@mail.com",
    contactNote: "Used only to reply, deleted after 90 days.",
    send: "Submit",
    back: "Back",
    thanksGood: "Thank you so much!",
    thanksBad: "Thank you for your candour.",
    leadGood: "Your feedback went straight to our team.",
    leadBad: "Your feedback genuinely helps us.",
    careTitle: "We are on it",
    careText: "Your feedback goes straight to the store management. If you left contact details, we will get back to you.",
    pitchGood: "Share your experience on Google – it takes 30 seconds.",
    pitchBad: "You are also welcome to share your experience publicly on Google.",
    googleButton: "Review us on Google",
    googleFooter: "Review us directly on Google",
    newTab: "opens Google in a new tab",
    privacy: "No cookies, no analytics; we do not store your IP address. We delete contact details after 90 days and everything else after 12 months.",
    privacyLink: "Privacy (in German)",
    errorInvalid: "Something did not fit – please check your entries.",
    errorTooMany: "Too much feedback in a short time. Please try again later.",
    errorFailed: "Sending failed – please check your connection.",
    retry: "Send again",
  },
};

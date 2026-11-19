export const locales = ["id", "en", "ar"] as const;
export type Lang = (typeof locales)[number];
export const defaultLang: Lang = "id";

export const isLang = (value: string): value is Lang =>
  (locales as readonly string[]).includes(value);

/** Bahasa dari parameter rute; nilai tak dikenal jatuh ke bahasa Indonesia. */
export const toLang = (value: string): Lang =>
  isLang(value) ? value : defaultLang;

export const dirOf = (lang: Lang) => (lang === "ar" ? "rtl" : "ltr");

/** Awali path internal dengan kode bahasa: href("en", "/berita") → "/en/berita". */
export const href = (lang: Lang, path: string) =>
  `/${lang}${path === "/" ? "" : path}`;

export const langNames: Record<Lang, string> = {
  id: "Indonesia",
  en: "English",
  ar: "العربية",
};

const dateLocale: Record<Lang, string> = {
  id: "id-ID",
  en: "en-GB",
  ar: "ar-u-nu-latn",
};

export function formatDate(iso: string, lang: Lang) {
  return new Intl.DateTimeFormat(dateLocale[lang], {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

const id = {
  tagline: "Diplomasi, kerja sama, dan kemanusiaan lintas negara",
  description:
    "Wahdah Global menghimpun kerja diplomasi, kerja sama internasional, program Peduli Ummat, dan jaringan perwakilan luar negeri dalam satu wadah.",
  nav: {
    home: "Home",
    about: "Tentang Kami",
    program: "Program",
    news: "Berita & Kegiatan",
    donate: "Donasi",
    accounts: "Rekening",
    contact: "Hubungi Kami",
    login: "Masuk",
    menu: "Menu",
    language: "Bahasa",
  },
  pillars: {
    diplomasi: "Diplomasi",
    kerjaSama: "Kerja Sama Internasional",
    peduliUmmat: "Peduli Ummat",
    dpln: "DPLN",
  },
  common: {
    readMore: "Selengkapnya",
    seeAll: "Lihat semua",
    sample: "Konten contoh",
    published: "Diterbitkan",
    gallery: "Galeri",
    loading: "Memuat…",
    donateNow: "Donasi Sekarang",
    sendMessage: "Kirim Pesan",
    notFilled: "Belum diisi",
    notFound: "Halaman tidak ditemukan.",
    backHome: "Kembali ke beranda",
  },
  categories: {
    Diplomasi: "Diplomasi",
    "Kerja Sama": "Kerja Sama",
    Kemanusiaan: "Kemanusiaan",
    DPLN: "DPLN",
    Kegiatan: "Kegiatan",
  },
  statuses: {
    Berjalan: "Berjalan",
    Selesai: "Selesai",
    Direncanakan: "Direncanakan",
  },
  home: {
    newsTitle: "Berita & Kegiatan",
    noNews: "Belum ada berita.",
    statsTitle: "Statistik Pencapaian",
  },
  footer: {
    stayConnected: "Tetap terhubung dengan kami.",
    whatsapp: "WhatsApp",
    email: "Email",
    address: "Alamat",
    phone: "Telepon",
    maps: "Lihat lokasi di Maps",
    social: "Sosial Media",
  },
  topic: {
    eyebrow: "Bidang kerja",
    focus: "Fokus kegiatan",
    related: "Kabar terkait",
    noNews: "Belum ada kabar untuk bidang ini.",
    partners: "Mitra kami",
  },
  programs: {
    indexTitle: "Program Kami",
    indexLead:
      "Berikut adalah bidang kerja dan program yang dijalankan Wahdah Global.",
    pillar: "Pilar",
    peduliUmmatPillar: "Pilar Peduli Ummat",
    peduliUmmatLead:
      "Pembangunan masjid, pengeboran sumur air bersih, tebar iftar, dan paket sembako bagi masyarakat yang membutuhkan, di dalam dan luar negeri.",
    list: "Daftar program",
    supportTitle: "Dukung program ini",
    supportBody:
      "Setiap donasi membantu program menjangkau lebih banyak penerima manfaat.",
  },
  news: {
    lead: "Kabar terbaru dari kegiatan diplomasi, kerja sama, kemanusiaan, dan perwakilan luar negeri.",
    all: "Semua",
    empty: "Belum ada berita pada kategori ini.",
  },
  dpln: {
    eyebrow: "Jaringan",
    lead: "Perwakilan lembaga di luar negeri: tempat warga dan diaspora Indonesia terhubung dengan kegiatan lembaga di negara masing-masing.",
    list: "Daftar perwakilan",
    news: "Kabar dari perwakilan",
  },
  donate: {
    lead: "Dukungan Anda menggerakkan program kemanusiaan dan kegiatan lembaga di berbagai negara.",
    howTitle: "Cara berdonasi",
    steps: [
      "Pilih program yang ingin Anda dukung, atau donasi umum.",
      "Transfer melalui salah satu saluran donasi resmi di bawah.",
      "Kirim konfirmasi agar donasi tercatat dan dilaporkan.",
    ],
    channelsTitle: "Saluran donasi resmi",
    warning:
      "Pastikan Anda hanya mentransfer ke rekening yang tercantum di halaman ini.",
    programsTitle: "Program yang dapat didukung",
  },
  accounts: {
    title: "Rekening Lengkap",
    lead: "Daftar rekening dan saluran donasi resmi lembaga.",
    how: "Lihat cara berdonasi",
  },
  contact: {
    lead: "Sampaikan pertanyaan, tawaran kerja sama, atau konfirmasi donasi Anda.",
  },
  about: {
    profileTitle: "Profil lembaga",
    profile: [
      "Profil singkat lembaga ditulis di sini: latar belakang berdirinya, lingkup kerja, dan hubungan dengan organisasi induk.",
      "Legalitas dan susunan pengurus dapat ditambahkan di bawahnya.",
    ],
    vision: "Visi",
    visionText: "Rumusan visi lembaga akan ditampilkan di sini.",
    mission: "Misi",
    missions: [
      "Menjalin hubungan dan dialog dengan lembaga serta komunitas di berbagai negara.",
      "Membangun kerja sama internasional di bidang pendidikan, sosial, dan kemanusiaan.",
      "Menyalurkan bantuan kemanusiaan secara amanah dan terlapor.",
      "Membina dan menghubungkan perwakilan lembaga di luar negeri.",
    ],
  },
};

export type Dict = typeof id;

const en: Dict = {
  tagline: "Diplomacy, cooperation, and humanitarian work across borders",
  description:
    "Wahdah Global brings together diplomacy, international cooperation, the Ummah Care programme, and a network of overseas chapters.",
  nav: {
    home: "Home",
    about: "About Us",
    program: "Programmes",
    news: "News & Activities",
    donate: "Donate",
    accounts: "Bank Accounts",
    contact: "Contact Us",
    login: "Sign in",
    menu: "Menu",
    language: "Language",
  },
  pillars: {
    diplomasi: "Diplomacy",
    kerjaSama: "International Cooperation",
    peduliUmmat: "Ummah Care",
    dpln: "Overseas Chapters (DPLN)",
  },
  common: {
    readMore: "Read more",
    seeAll: "See all",
    sample: "Sample content",
    published: "Published",
    gallery: "Gallery",
    loading: "Loading…",
    donateNow: "Donate Now",
    sendMessage: "Message Us",
    notFilled: "Not provided yet",
    notFound: "Page not found.",
    backHome: "Back to home",
  },
  categories: {
    Diplomasi: "Diplomacy",
    "Kerja Sama": "Cooperation",
    Kemanusiaan: "Humanitarian",
    DPLN: "DPLN",
    Kegiatan: "Activities",
  },
  statuses: {
    Berjalan: "Ongoing",
    Selesai: "Completed",
    Direncanakan: "Planned",
  },
  home: {
    newsTitle: "News & Activities",
    noNews: "No news yet.",
    statsTitle: "Achievements",
  },
  footer: {
    stayConnected: "Stay connected with us.",
    whatsapp: "WhatsApp",
    email: "Email",
    address: "Address",
    phone: "Phone",
    maps: "View location on Maps",
    social: "Social Media",
  },
  topic: {
    eyebrow: "Area of work",
    focus: "Focus areas",
    related: "Related news",
    noNews: "No news for this area yet.",
    partners: "Our partners",
  },
  programs: {
    indexTitle: "Our Programmes",
    indexLead:
      "These are the areas of work and programmes run by Wahdah Global.",
    pillar: "Pillar:",
    peduliUmmatPillar: "Ummah Care Pillar",
    peduliUmmatLead:
      "Mosque construction, clean-water wells, iftar meals and food packages for communities in need, at home and abroad.",
    list: "Programmes",
    supportTitle: "Support this programme",
    supportBody: "Every donation helps the programme reach more beneficiaries.",
  },
  news: {
    lead: "The latest from our diplomacy, cooperation, humanitarian work, and overseas chapters.",
    all: "All",
    empty: "No news in this category yet.",
  },
  dpln: {
    eyebrow: "Network",
    lead: "Our overseas chapters: where Indonesians and the diaspora connect with the organisation's activities in their own countries.",
    list: "Chapters",
    news: "News from the chapters",
  },
  donate: {
    lead: "Your support drives our humanitarian programmes and activities in many countries.",
    howTitle: "How to donate",
    steps: [
      "Choose a programme to support, or make a general donation.",
      "Transfer through one of the official donation channels below.",
      "Send a confirmation so your donation is recorded and reported.",
    ],
    channelsTitle: "Official donation channels",
    warning: "Please transfer only to the accounts listed on this page.",
    programsTitle: "Programmes you can support",
  },
  accounts: {
    title: "Bank Accounts",
    lead: "The organisation's official accounts and donation channels.",
    how: "See how to donate",
  },
  contact: {
    lead: "Send us your questions, partnership proposals, or donation confirmations.",
  },
  about: {
    profileTitle: "Organisation profile",
    profile: [
      "A short profile of the organisation goes here: its background, scope of work, and relationship with the parent organisation.",
      "Legal status and the board structure can be added below.",
    ],
    vision: "Vision",
    visionText: "The organisation's vision statement will be shown here.",
    mission: "Mission",
    missions: [
      "Build relationships and dialogue with institutions and communities in many countries.",
      "Develop international cooperation in education, social work, and humanitarian aid.",
      "Deliver humanitarian aid in a trustworthy and accountable way.",
      "Guide and connect the organisation's overseas chapters.",
    ],
  },
};

const ar: Dict = {
  tagline: "الدبلوماسية والتعاون والعمل الإنساني عبر الحدود",
  description:
    "تجمع «وحدة جلوبال» العمل الدبلوماسي والتعاون الدولي وبرامج رعاية الأمة وشبكة الفروع الخارجية في إطار واحد.",
  nav: {
    home: "الرئيسية",
    about: "من نحن",
    program: "البرامج",
    news: "الأخبار والأنشطة",
    donate: "التبرع",
    accounts: "الحسابات البنكية",
    contact: "اتصل بنا",
    login: "دخول",
    menu: "القائمة",
    language: "اللغة",
  },
  pillars: {
    diplomasi: "الدبلوماسية",
    kerjaSama: "التعاون الدولي",
    peduliUmmat: "رعاية الأمة",
    dpln: "الفروع الخارجية (DPLN)",
  },
  common: {
    readMore: "المزيد",
    seeAll: "عرض الكل",
    sample: "محتوى تجريبي",
    published: "نُشر في",
    gallery: "معرض الصور",
    loading: "جارٍ التحميل…",
    donateNow: "تبرع الآن",
    sendMessage: "راسلنا",
    notFilled: "لم يُضف بعد",
    notFound: "الصفحة غير موجودة.",
    backHome: "العودة إلى الرئيسية",
  },
  categories: {
    Diplomasi: "الدبلوماسية",
    "Kerja Sama": "التعاون",
    Kemanusiaan: "العمل الإنساني",
    DPLN: "الفروع الخارجية",
    Kegiatan: "الأنشطة",
  },
  statuses: {
    Berjalan: "جارٍ",
    Selesai: "مكتمل",
    Direncanakan: "مخطط له",
  },
  home: {
    newsTitle: "الأخبار والأنشطة",
    noNews: "لا توجد أخبار بعد.",
    statsTitle: "إحصاءات الإنجاز",
  },
  footer: {
    stayConnected: "ابقَ على تواصل معنا.",
    whatsapp: "واتساب",
    email: "البريد الإلكتروني",
    address: "العنوان",
    phone: "الهاتف",
    maps: "عرض الموقع على الخريطة",
    social: "وسائل التواصل",
  },
  topic: {
    eyebrow: "مجال العمل",
    focus: "محاور النشاط",
    related: "أخبار ذات صلة",
    noNews: "لا توجد أخبار لهذا المجال بعد.",
    partners: "شركاؤنا",
  },
  programs: {
    indexTitle: "برامجنا",
    indexLead: "هذه مجالات العمل والبرامج التي تنفذها «وحدة جلوبال».",
    pillar: "محور",
    peduliUmmatPillar: "محور رعاية الأمة",
    peduliUmmatLead:
      "بناء المساجد، وحفر آبار المياه النظيفة، وتوزيع وجبات الإفطار والسلال الغذائية للمحتاجين داخل البلاد وخارجها.",
    list: "قائمة البرامج",
    supportTitle: "ادعم هذا البرنامج",
    supportBody: "كل تبرع يساعد البرنامج على الوصول إلى مستفيدين أكثر.",
  },
  news: {
    lead: "آخر أخبار العمل الدبلوماسي والتعاون والعمل الإنساني والفروع الخارجية.",
    all: "الكل",
    empty: "لا توجد أخبار في هذا التصنيف بعد.",
  },
  dpln: {
    eyebrow: "الشبكة",
    lead: "فروع المؤسسة في الخارج: حيث يتواصل الإندونيسيون والجاليات مع أنشطة المؤسسة في بلدانهم.",
    list: "قائمة الفروع",
    news: "أخبار الفروع",
  },
  donate: {
    lead: "دعمكم يحرّك البرامج الإنسانية وأنشطة المؤسسة في بلدان عديدة.",
    howTitle: "طريقة التبرع",
    steps: [
      "اختر البرنامج الذي تريد دعمه، أو تبرع تبرعًا عامًا.",
      "حوّل المبلغ عبر إحدى قنوات التبرع الرسمية أدناه.",
      "أرسل تأكيدًا ليُسجَّل تبرعك ويُدرج في التقارير.",
    ],
    channelsTitle: "قنوات التبرع الرسمية",
    warning: "يُرجى التحويل إلى الحسابات المذكورة في هذه الصفحة فقط.",
    programsTitle: "برامج يمكنك دعمها",
  },
  accounts: {
    title: "الحسابات البنكية",
    lead: "الحسابات وقنوات التبرع الرسمية للمؤسسة.",
    how: "تعرّف على طريقة التبرع",
  },
  contact: {
    lead: "أرسل إلينا استفساراتك أو عروض التعاون أو تأكيد تبرعك.",
  },
  about: {
    profileTitle: "نبذة عن المؤسسة",
    profile: [
      "تُكتب هنا نبذة موجزة عن المؤسسة: خلفية تأسيسها ونطاق عملها وعلاقتها بالمنظمة الأم.",
      "يمكن إضافة الوضع القانوني وهيكل الإدارة أدناه.",
    ],
    vision: "الرؤية",
    visionText: "ستُعرض هنا صياغة رؤية المؤسسة.",
    mission: "الرسالة",
    missions: [
      "بناء العلاقات والحوار مع المؤسسات والمجتمعات في مختلف البلدان.",
      "تطوير التعاون الدولي في مجالات التعليم والعمل الاجتماعي والإنساني.",
      "إيصال المساعدات الإنسانية بأمانة وشفافية.",
      "رعاية فروع المؤسسة في الخارج وربطها ببعضها.",
    ],
  },
};

const dicts: Record<Lang, Dict> = { id, en, ar };

export const getDict = (lang: Lang) => dicts[lang];

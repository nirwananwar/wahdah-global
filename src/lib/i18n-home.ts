import type { Lang } from "./i18n";

/** Teks halaman Home (tiga bahasa). */
const en = {
  hero: {
    eyebrow: "Wahdah Islamiyah · Department of Foreign Affairs",
    title: "Connecting Nations. Building Partnerships. Serving Humanity.",
    lead: "Connecting people, institutions, and communities through international cooperation, humanitarian initiatives, and meaningful global partnerships.",
    discover: "Discover Our Work",
    partner: "Partner With Us",
  },
  about: {
    eyebrow: "About Wahdah Global",
    title: "The international face of Wahdah Islamiyah",
    cta: "About Us",
  },
  presence: {
    eyebrow: "Global Presence",
    title: "A network that reaches beyond borders",
    lead: "Our overseas chapters connect Indonesian communities abroad with the work of Wahdah Islamiyah.",
    countries: "Countries of partnership",
    representatives: "Overseas representatives",
    networks: "International partner institutions",
    chapters: "Overseas chapters",
    cta: "Explore the DPLN network",
  },
  areas: {
    eyebrow: "Our Areas of Work",
    title: "Four areas, one mission",
    learn: "Learn more",
    items: [
      {
        title: "Diplomacy & International Relations",
        body: "Building dialogue and good relations with institutions, leaders and communities in many countries.",
      },
      {
        title: "Global Cooperation & Partnership",
        body: "Turning good relations into real programmes with partner institutions abroad.",
      },
      {
        title: "Humanitarian Programs",
        body: "Clean water, mosque construction, food packages and iftar meals for communities in need.",
      },
      {
        title: "Da'wah & Education",
        body: "Supporting education, scholarships and the sending of preachers and teachers abroad.",
      },
    ],
  },
  impact: {
    eyebrow: "Our Impact",
    title: "Achievements",
    note: "Figures are maintained by our team and updated periodically.",
  },
  projects: {
    eyebrow: "Featured Humanitarian Projects",
    title: "Projects you can follow",
    all: "View all projects",
    view: "View project",
  },
  news: {
    eyebrow: "Latest News & Activities",
    title: "From our work around the world",
    all: "All news",
    emptyTitle: "News and activities will appear here",
    emptyBody: "We are preparing reports from our international activities. In the meantime, learn more about our work.",
    emptyCta: "About our work",
  },
  cta: {
    title: "Let's Build a Meaningful Partnership",
    body: "Join us in strengthening international cooperation and creating meaningful impact for communities.",
    partner: "Become Our Partner",
    contact: "Contact Us",
  },
  footer: {
    quick: "Quick links",
    programs: "Programs",
    contact: "Contact",
    social: "Follow us",
  },
};

export type HomeDict = typeof en;

const id: HomeDict = {
  hero: {
    eyebrow: "Wahdah Islamiyah · Departemen Urusan Luar Negeri",
    title: "Menghubungkan Bangsa. Membangun Kemitraan. Melayani Kemanusiaan.",
    lead: "Menghubungkan masyarakat, lembaga, dan komunitas melalui kerja sama internasional, inisiatif kemanusiaan, dan kemitraan global yang bermakna.",
    discover: "Kenali Kiprah Kami",
    partner: "Bermitra dengan Kami",
  },
  about: {
    eyebrow: "Tentang Wahdah Global",
    title: "Wajah internasional Wahdah Islamiyah",
    cta: "Tentang Kami",
  },
  presence: {
    eyebrow: "Jaringan Global",
    title: "Jaringan yang menjangkau lintas negara",
    lead: "Perwakilan luar negeri kami menghubungkan komunitas Indonesia di mancanegara dengan kiprah Wahdah Islamiyah.",
    countries: "Negara mitra",
    representatives: "Perwakilan luar negeri",
    networks: "Lembaga mitra internasional",
    chapters: "Perwakilan luar negeri",
    cta: "Jelajahi jaringan DPLN",
  },
  areas: {
    eyebrow: "Bidang Kerja",
    title: "Empat bidang, satu misi",
    learn: "Selengkapnya",
    items: [
      {
        title: "Diplomasi & Hubungan Internasional",
        body: "Membangun dialog dan hubungan baik dengan lembaga, tokoh, dan komunitas di berbagai negara.",
      },
      {
        title: "Kerja Sama & Kemitraan Global",
        body: "Mewujudkan hubungan baik menjadi program nyata bersama lembaga mitra di luar negeri.",
      },
      {
        title: "Program Kemanusiaan",
        body: "Air bersih, pembangunan masjid, paket sembako, dan iftar bagi masyarakat yang membutuhkan.",
      },
      {
        title: "Dakwah & Pendidikan",
        body: "Mendukung pendidikan, beasiswa, serta pengiriman dai dan pengajar ke luar negeri.",
      },
    ],
  },
  impact: {
    eyebrow: "Dampak Kami",
    title: "Capaian",
    note: "Angka dikelola oleh tim kami dan diperbarui secara berkala.",
  },
  projects: {
    eyebrow: "Proyek Kemanusiaan Pilihan",
    title: "Proyek yang dapat Anda ikuti",
    all: "Lihat semua proyek",
    view: "Lihat proyek",
  },
  news: {
    eyebrow: "Berita & Kegiatan Terbaru",
    title: "Dari kiprah kami di berbagai negara",
    all: "Semua berita",
    emptyTitle: "Berita dan kegiatan akan tampil di sini",
    emptyBody: "Kami sedang menyiapkan laporan kegiatan internasional. Sementara itu, kenali lebih jauh kiprah kami.",
    emptyCta: "Tentang kiprah kami",
  },
  cta: {
    title: "Mari Membangun Kemitraan yang Bermakna",
    body: "Bergabunglah bersama kami memperkuat kerja sama internasional dan menghadirkan dampak nyata bagi masyarakat.",
    partner: "Menjadi Mitra",
    contact: "Hubungi Kami",
  },
  footer: {
    quick: "Tautan",
    programs: "Program",
    contact: "Kontak",
    social: "Ikuti kami",
  },
};

const ar: HomeDict = {
  hero: {
    eyebrow: "جمعية الوحدة الإسلامية · إدارة الشؤون الخارجية",
    title: "نصل بين الشعوب. نبني الشراكات. نخدم الإنسانية.",
    lead: "نربط الأفراد والمؤسسات والمجتمعات عبر التعاون الدولي والمبادرات الإنسانية والشراكات العالمية الهادفة.",
    discover: "تعرّف على عملنا",
    partner: "كن شريكًا لنا",
  },
  about: {
    eyebrow: "عن وحدة جلوبال",
    title: "الواجهة الدولية لجمعية الوحدة الإسلامية",
    cta: "من نحن",
  },
  presence: {
    eyebrow: "الحضور الدولي",
    title: "شبكة تتجاوز الحدود",
    lead: "تربط فروعنا الخارجية الجاليات الإندونيسية في الخارج بعمل جمعية الوحدة الإسلامية.",
    countries: "الدول الشريكة",
    representatives: "الفروع الخارجية",
    networks: "المؤسسات الشريكة الدولية",
    chapters: "الفروع الخارجية",
    cta: "استكشف شبكة الفروع",
  },
  areas: {
    eyebrow: "مجالات عملنا",
    title: "أربعة مجالات ورسالة واحدة",
    learn: "المزيد",
    items: [
      {
        title: "الدبلوماسية والعلاقات الدولية",
        body: "بناء الحوار والعلاقات الطيبة مع المؤسسات والشخصيات والمجتمعات في مختلف البلدان.",
      },
      {
        title: "التعاون والشراكات الدولية",
        body: "تحويل العلاقات الطيبة إلى برامج فعلية مع المؤسسات الشريكة في الخارج.",
      },
      {
        title: "البرامج الإنسانية",
        body: "المياه النظيفة وبناء المساجد والسلال الغذائية ووجبات الإفطار للمحتاجين.",
      },
      {
        title: "الدعوة والتعليم",
        body: "دعم التعليم والمنح الدراسية وابتعاث الدعاة والمعلمين إلى الخارج.",
      },
    ],
  },
  impact: {
    eyebrow: "أثرنا",
    title: "الإنجازات",
    note: "يتولى فريقنا إعداد هذه الأرقام وتحديثها دوريًا.",
  },
  projects: {
    eyebrow: "مشاريع إنسانية مختارة",
    title: "مشاريع يمكنك متابعتها",
    all: "جميع المشاريع",
    view: "عرض المشروع",
  },
  news: {
    eyebrow: "آخر الأخبار والأنشطة",
    title: "من عملنا حول العالم",
    all: "جميع الأخبار",
    emptyTitle: "ستُعرض الأخبار والأنشطة هنا",
    emptyBody: "نُعدّ تقارير أنشطتنا الدولية. وفي الأثناء، تعرّف أكثر على عملنا.",
    emptyCta: "عن عملنا",
  },
  cta: {
    title: "لنبنِ معًا شراكة هادفة",
    body: "انضم إلينا في تعزيز التعاون الدولي وإحداث أثر حقيقي في المجتمعات.",
    partner: "كن شريكًا",
    contact: "اتصل بنا",
  },
  footer: {
    quick: "روابط سريعة",
    programs: "البرامج",
    contact: "التواصل",
    social: "تابعنا",
  },
};

const dicts: Record<Lang, HomeDict> = { id, en, ar };
export const getHome = (lang: Lang) => dicts[lang];

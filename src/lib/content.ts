/**
 * Lapisan data situs.
 *
 * Konten dibaca dari Supabase (hanya yang sudah terbit) dan di-cache dengan
 * tag "content"; panel admin menghapus cache itu setiap kali menyimpan.
 * Setiap teks punya kolom terjemahan opsional (`_en`, `_ar`); bila kosong,
 * versi Indonesia yang ditampilkan.
 */
import { cacheLife, cacheTag } from "next/cache";
import type { Lang } from "./i18n";
import { publicClient } from "./supabase";

export const postCategories = [
  "Diplomasi",
  "Kerja Sama",
  "Kemanusiaan",
  "DPLN",
  "Kegiatan",
] as const;
export type PostCategory = (typeof postCategories)[number];
export type ProgramStatus = "Berjalan" | "Selesai" | "Direncanakan";

export type Post = {
  slug: string;
  title: string;
  date: string; // ISO
  category: PostCategory;
  excerpt: string;
  body: string[];
  cover: string | null;
  gallery: string[];
  sample: boolean;
};

export type Program = {
  slug: string;
  title: string;
  region: string;
  status: ProgramStatus;
  summary: string;
  body: string[];
  cover: string | null;
  gallery: string[];
  sample: boolean;
  /** Biaya per unit, mis. "1 sumur ≈ USD 1.500". Kosong = tidak ditampilkan. */
  unitCost: string;
  /** Target & dana terkumpul (Rupiah). Target 0 = tanpa progres. */
  target: number;
  raised: number;
};

export type DplnChapter = {
  id: string;
  country: string;
  city: string;
  note: string;
  sample: boolean;
};
export type DonationChannel = {
  label: string;
  detail: string;
  image: string | null;
  sample: boolean;
  international: boolean;
};
export type DocumentKind = "Legalitas" | "Laporan";
export type OrgDocument = {
  kind: DocumentKind;
  title: string;
  note: string;
  file: string | null;
};
export type Partner = { name: string; country: string; website: string };
export type Slide = { title: string; path: string; image: string | null };
export type Stat = { label: string; value: string; sample: boolean };

type Row = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

/** Baris terbit dari satu tabel (semua bahasa). Kosong bila Supabase belum terhubung / gagal. */
async function rows(table: string, orderBy: string, ascending = true) {
  "use cache";
  cacheTag("content");
  cacheLife("minutes");
  const db = publicClient();
  if (!db) return [] as Row[];
  const { data, error } = await db
    .from(table)
    .select("*")
    .eq("published", true)
    .order(orderBy, { ascending });
  if (error) {
    console.error(`[content] ${table}: ${error.message}`);
    return [] as Row[];
  }
  return data as Row[];
}

/** Nilai kolom dalam bahasa yang diminta, jatuh ke bahasa Indonesia bila kosong. */
const tr = (row: Row, column: string, lang: Lang): string =>
  (lang !== "id" && row[`${column}_${lang}`]) || row[column] || "";

const paragraphs = (text: string) =>
  text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

export async function getPosts(lang: Lang, category?: PostCategory) {
  const posts: Post[] = (await rows("posts", "published_at", false)).map(
    (r) => ({
      slug: r.slug,
      title: tr(r, "title", lang),
      date: String(r.published_at).slice(0, 10),
      category: r.category,
      excerpt: tr(r, "excerpt", lang),
      body: paragraphs(tr(r, "body", lang)),
      cover: r.cover_url,
      gallery: r.gallery ?? [],
      sample: r.sample,
    }),
  );
  return category ? posts.filter((p) => p.category === category) : posts;
}

export async function getPost(lang: Lang, slug: string) {
  return (await getPosts(lang)).find((p) => p.slug === slug) ?? null;
}

export async function getPrograms(lang: Lang): Promise<Program[]> {
  return (await rows("programs", "sort_order")).map((r) => ({
    slug: r.slug,
    title: tr(r, "title", lang),
    region: tr(r, "region", lang),
    status: r.status,
    summary: tr(r, "summary", lang),
    body: paragraphs(tr(r, "body", lang)),
    cover: r.cover_url,
    gallery: r.gallery ?? [],
    sample: r.sample,
    unitCost: tr(r, "unit_cost", lang),
    target: Number(r.funding_target) || 0,
    raised: Number(r.funding_raised) || 0,
  }));
}

export async function getProgram(lang: Lang, slug: string) {
  return (await getPrograms(lang)).find((p) => p.slug === slug) ?? null;
}

export async function getDplnChapters(lang: Lang): Promise<DplnChapter[]> {
  return (await rows("dpln_chapters", "sort_order")).map((r) => ({
    id: r.id,
    country: tr(r, "country", lang),
    city: tr(r, "city", lang),
    note: tr(r, "note", lang),
    sample: r.sample,
  }));
}

export async function getDonationChannels(
  lang: Lang,
): Promise<DonationChannel[]> {
  return (await rows("donation_channels", "sort_order")).map((r) => ({
    label: tr(r, "label", lang),
    detail: tr(r, "detail", lang),
    image: r.image_url,
    sample: r.sample,
    international: Boolean(r.international),
  }));
}

/** Dokumen legalitas & laporan yang terbit. */
export async function getDocuments(lang: Lang): Promise<OrgDocument[]> {
  return (await rows("documents", "sort_order")).map((r) => ({
    kind: r.kind,
    title: tr(r, "title", lang),
    note: tr(r, "note", lang),
    file: r.file_url,
  }));
}

export async function getPartners(lang: Lang): Promise<Partner[]> {
  return (await rows("partners", "sort_order")).map((r) => ({
    name: tr(r, "name", lang),
    country: tr(r, "country", lang),
    website: r.website,
  }));
}

/** Banner carousel beranda; kosong berarti beranda memakai empat bidang kerja. */
export async function getSlides(lang: Lang): Promise<Slide[]> {
  return (await rows("slides", "sort_order")).map((r) => ({
    title: tr(r, "title", lang),
    path: r.link || "/program",
    image: r.image_url,
  }));
}

export async function getStats(lang: Lang): Promise<Stat[]> {
  return (await rows("stats", "sort_order")).map((r) => ({
    label: tr(r, "label", lang),
    value: r.value,
    sample: r.sample,
  }));
}

/* ---------- Teks tetap bidang kerja ---------- */

export type TopicSlug = "diplomasi" | "kerja-sama-internasional";
export type Topic = {
  title: string;
  summary: string;
  intro: string[];
  focus: { title: string; body: string }[];
  newsCategory: PostCategory;
};

const topics: Record<TopicSlug, Record<Lang, Omit<Topic, "newsCategory">>> = {
  diplomasi: {
    id: {
      title: "Diplomasi",
      summary:
        "Membangun dialog dan hubungan baik dengan lembaga, tokoh, dan komunitas di berbagai negara.",
      intro: [
        "Bidang diplomasi menjadi pintu depan lembaga dalam berhubungan dengan dunia internasional: menjalin komunikasi, menghadiri forum, dan menyampaikan pandangan lembaga secara santun dan terbuka.",
        "Melalui kunjungan kehormatan, audiensi dengan perwakilan negara sahabat, dan kehadiran di forum internasional, Wahdah Islamiyah memperkenalkan kiprah dakwah dan sosialnya kepada dunia, sekaligus membuka jalan bagi kerja sama yang bermanfaat bagi umat.",
      ],
      focus: [
        {
          title: "Kunjungan & audiensi",
          body: "Silaturahmi dengan kedutaan, lembaga pemerintah, dan organisasi mitra di dalam dan luar negeri.",
        },
        {
          title: "Forum internasional",
          body: "Partisipasi dalam konferensi, seminar, dan pertemuan lintas negara.",
        },
        {
          title: "Diplomasi publik",
          body: "Pernyataan sikap, publikasi, dan komunikasi kepada masyarakat internasional.",
        },
      ],
    },
    en: {
      title: "Diplomacy",
      summary:
        "Building dialogue and good relations with institutions, leaders, and communities in many countries.",
      intro: [
        "Diplomacy is the organisation's front door to the international community: maintaining communication, attending forums, and presenting the organisation's views courteously and openly.",
        "Through courtesy visits, meetings with representatives of friendly nations and participation in international forums, Wahdah Islamiyah introduces its da'wah and social work to the world, opening the way to cooperation that benefits the Ummah.",
      ],
      focus: [
        {
          title: "Visits & audiences",
          body: "Meetings with embassies, government bodies, and partner organisations at home and abroad.",
        },
        {
          title: "International forums",
          body: "Participation in conferences, seminars, and cross-border meetings.",
        },
        {
          title: "Public diplomacy",
          body: "Position statements, publications, and communication with the international public.",
        },
      ],
    },
    ar: {
      title: "الدبلوماسية",
      summary:
        "بناء الحوار والعلاقات الطيبة مع المؤسسات والشخصيات والمجتمعات في مختلف البلدان.",
      intro: [
        "الدبلوماسية هي واجهة المؤسسة في تعاملها مع العالم: التواصل، وحضور المنتديات، وعرض رؤية المؤسسة بأدب وانفتاح.",
        "من خلال زيارات المجاملة واللقاءات مع ممثلي الدول الصديقة والمشاركة في المنتديات الدولية، تعرّف جمعية الوحدة الإسلامية العالمَ بعملها الدعوي والاجتماعي، وتفتح الطريق لتعاون ينفع الأمة.",
      ],
      focus: [
        {
          title: "الزيارات واللقاءات",
          body: "لقاءات مع السفارات والجهات الحكومية والمنظمات الشريكة داخل البلاد وخارجها.",
        },
        {
          title: "المنتديات الدولية",
          body: "المشاركة في المؤتمرات والندوات واللقاءات العابرة للحدود.",
        },
        {
          title: "الدبلوماسية العامة",
          body: "بيانات المواقف والمطبوعات والتواصل مع الرأي العام الدولي.",
        },
      ],
    },
  },
  "kerja-sama-internasional": {
    id: {
      title: "Kerja Sama Internasional",
      summary:
        "Kemitraan dengan lembaga luar negeri di bidang pendidikan, sosial, dan kemanusiaan.",
      intro: [
        "Kerja sama internasional mewujudkan hubungan baik menjadi program nyata: nota kesepahaman, pertukaran, beasiswa, dan proyek bersama.",
        "Kerja sama dijalin dengan lembaga pendidikan, organisasi sosial, dan komunitas Muslim di berbagai negara, berlandaskan saling menghormati, keterbukaan, dan manfaat nyata bagi penerima.",
      ],
      focus: [
        {
          title: "Kemitraan lembaga",
          body: "Nota kesepahaman dan perjanjian kerja sama dengan organisasi dan institusi mitra.",
        },
        {
          title: "Pendidikan & beasiswa",
          body: "Pertukaran pelajar, pengiriman dai dan pengajar, serta fasilitasi beasiswa luar negeri.",
        },
        {
          title: "Proyek bersama",
          body: "Program sosial dan kemanusiaan yang dikerjakan bersama mitra internasional.",
        },
      ],
    },
    en: {
      title: "International Cooperation",
      summary:
        "Partnerships with overseas institutions in education, social work, and humanitarian aid.",
      intro: [
        "International cooperation turns good relations into real programmes: memoranda of understanding, exchanges, scholarships, and joint projects.",
        "We work with educational institutions, social organisations and Muslim communities in many countries, on the basis of mutual respect, transparency and real benefit for those we serve.",
      ],
      focus: [
        {
          title: "Institutional partnerships",
          body: "Memoranda of understanding and cooperation agreements with partner organisations and institutions.",
        },
        {
          title: "Education & scholarships",
          body: "Student exchanges, sending preachers and teachers, and facilitating overseas scholarships.",
        },
        {
          title: "Joint projects",
          body: "Social and humanitarian programmes carried out together with international partners.",
        },
      ],
    },
    ar: {
      title: "التعاون الدولي",
      summary:
        "شراكات مع مؤسسات خارجية في مجالات التعليم والعمل الاجتماعي والإنساني.",
      intro: [
        "يحوّل التعاون الدولي العلاقات الطيبة إلى برامج واقعية: مذكرات تفاهم، وتبادل، ومنح دراسية، ومشاريع مشتركة.",
        "نتعاون مع المؤسسات التعليمية والمنظمات الاجتماعية والمجتمعات المسلمة في مختلف البلدان، على أساس الاحترام المتبادل والشفافية والنفع الحقيقي للمستفيدين.",
      ],
      focus: [
        {
          title: "الشراكات المؤسسية",
          body: "مذكرات تفاهم واتفاقيات تعاون مع المنظمات والمؤسسات الشريكة.",
        },
        {
          title: "التعليم والمنح",
          body: "تبادل الطلاب، وإيفاد الدعاة والمعلمين، وتيسير المنح الدراسية في الخارج.",
        },
        {
          title: "المشاريع المشتركة",
          body: "برامج اجتماعية وإنسانية تُنفَّذ مع شركاء دوليين.",
        },
      ],
    },
  },
};

export function getTopic(lang: Lang, slug: TopicSlug): Topic {
  return {
    ...topics[slug][lang],
    newsCategory: slug === "diplomasi" ? "Diplomasi" : "Kerja Sama",
  };
}

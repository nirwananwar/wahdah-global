/**
 * Lapisan data situs.
 *
 * Konten dibaca dari Supabase (hanya yang sudah terbit) dan di-cache dengan
 * tag "content"; panel admin menghapus cache itu setiap kali menyimpan.
 * Setiap teks punya kolom terjemahan opsional (`_en`, `_ar`); bila kosong,
 * versi Indonesia yang ditampilkan.
 */
import { cacheLife, cacheTag } from "next/cache";
import { countryName } from "./countries";
import type { Lang } from "./i18n";
import { publicClient } from "./supabase";

/** Kode kategori berita (tabel post_categories; bisa ditambah admin). */
export type PostCategory = string;
export type ProgramStatus = "Berjalan" | "Selesai" | "Direncanakan";

export type Post = {
  slug: string;
  title: string;
  date: string; // ISO
  category: PostCategory;
  categoryName: string;
  excerpt: string;
  body: string[];
  cover: string | null;
  gallery: string[];
  sample: boolean;
};

export type Program = {
  id: string;
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
  code: string | null;
  country: string;
  city: string;
  area: string;
  note: string;
  status: string;
  activities: string[];
  gallery: string[];
  sample: boolean;
};
export type DonationChannel = {
  label: string;
  detail: string;
  image: string | null;
  sample: boolean;
  international: boolean;
};
export type DocumentKind = string;
export type OrgDocument = {
  kind: DocumentKind;
  title: string;
  note: string;
  file: string | null;
};
export type Partner = {
  name: string;
  country: string;
  code: string | null;
  website: string;
  logo: string | null;
  category: string;
  types: string[];
};
export type Slide = { title: string; path: string; image: string | null };
export type Stat = { label: string; value: string; sample: boolean };
export type Category = { slug: string; name: string };
export type Relation = {
  date: string;
  kind: string;
  title: string;
  summary: string;
  country: string;
  partner: string;
};
export type ProjectStatus = "Disetujui" | "Berjalan" | "Selesai" | "Diajukan";
export type Project = {
  slug: string;
  programId: string | null;
  category: string;
  title: string;
  location: string;
  country: string;
  status: ProjectStatus;
  summary: string;
  body: string[];
  target: number;
  raised: number;
  /** Tanggal verifikasi dana terakhir (ISO) atau null. */
  fundsAsOf: string | null;
  progress: number;
  progressAsOf: string | null;
  beneficiaries: number;
  cover: string | null;
  before: string[];
  during: string[];
  after: string[];
  report: string | null;
  started: string | null;
  completed: string | null;
};
export type ProjectUpdate = { date: string; progress: number; note: string; photos: string[] };

type Row = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

/** Baris terbit dari satu tabel (semua bahasa). Kosong bila Supabase belum terhubung / gagal. */
async function rows(
  table: string,
  orderBy: string,
  ascending = true,
  /** Kolom yang dibaca; wajib eksplisit untuk tabel berkolom internal. */
  columns = "*",
  publishedOnly = true,
) {
  "use cache";
  cacheTag("content");
  cacheLife("minutes");
  const db = publicClient();
  if (!db) return [] as Row[];
  let query = db.from(table).select(columns);
  if (publishedOnly) query = query.eq("published", true);
  const { data, error } = await query.order(orderBy, { ascending });
  if (error) {
    console.error(`[content] ${table}: ${error.message}`);
    return [] as Row[];
  }
  return data as unknown as Row[];
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
  const [list, categories] = await Promise.all([
    rows("posts", "published_at", false),
    getCategories(lang),
  ]);
  const posts: Post[] = list.map(
    (r) => ({
      slug: r.slug,
      title: tr(r, "title", lang),
      date: String(r.published_at).slice(0, 10),
      category: r.category,
      categoryName: categories.find((c) => c.slug === r.category)?.name ?? r.category,
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
    id: r.id,
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
    // Dana program tidak diisi manual lagi; dana tampil per proyek (terverifikasi).
    target: 0,
    raised: 0,
  }));
}

export async function getProgram(lang: Lang, slug: string) {
  return (await getPrograms(lang)).find((p) => p.slug === slug) ?? null;
}

const dplnColumns =
  "id, country, country_en, country_ar, city, city_en, city_ar, note, note_en, note_ar, country_code, area, area_en, area_ar, org_status, activities, activities_en, activities_ar, gallery, sort_order, sample";

export async function getDplnChapters(lang: Lang): Promise<DplnChapter[]> {
  return (await rows("dpln_chapters", "sort_order", true, dplnColumns)).map((r) => ({
    id: r.id,
    code: r.country_code,
    country: tr(r, "country", lang) || countryName(r.country_code, lang),
    city: tr(r, "city", lang),
    area: tr(r, "area", lang),
    note: tr(r, "note", lang),
    status: r.org_status,
    activities: paragraphs(tr(r, "activities", lang)),
    gallery: r.gallery ?? [],
    sample: r.sample,
  }));
}

export async function getDpln(lang: Lang, code: string) {
  return (
    (await getDplnChapters(lang)).find((c) => c.code?.toLowerCase() === code.toLowerCase()) ?? null
  );
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
  const columns =
    "name, name_en, name_ar, country, country_en, country_ar, country_code, website, logo_url, category, cooperation_types, sort_order";
  return (await rows("partners", "sort_order", true, columns)).map((r) => ({
    name: tr(r, "name", lang),
    country: countryName(r.country_code, lang) || tr(r, "country", lang),
    code: r.country_code,
    website: r.website,
    logo: r.logo_url,
    category: r.category,
    types: r.cooperation_types ?? [],
  }));
}

/** Riwayat diplomasi yang ditandai terbit (judul & ringkasan saja). */
export async function getRelations(lang: Lang): Promise<Relation[]> {
  const [list, partners] = await Promise.all([
    rows(
      "relations",
      "occurred_on",
      false,
      "id, occurred_on, kind, partner_id, country_code, title, title_en, title_ar, summary, summary_en, summary_ar",
    ),
    rows("partners", "name", true, "id, name, name_en, name_ar"),
  ]);
  return list.map((r) => ({
    date: r.occurred_on,
    kind: r.kind,
    title: tr(r, "title", lang),
    summary: tr(r, "summary", lang),
    country: countryName(r.country_code, lang),
    partner: tr(partners.find((p) => p.id === r.partner_id) ?? {}, "name", lang),
  }));
}

export async function getCategories(lang: Lang): Promise<Category[]> {
  return (await rows("post_categories", "sort_order", true, "*", false)).map((r) => ({
    slug: r.slug,
    name: tr(r, "name", lang),
  }));
}

const projectColumns =
  "id, slug, program_id, category, title, title_en, title_ar, location, location_en, location_ar, country_code, status, summary, summary_en, summary_ar, body, body_en, body_ar, budget_target, progress, progress_updated_at, beneficiaries, cover_url, photos_before, photos_during, photos_after, report_url, started_on, completed_on, sort_order";

/** Proyek terbit, dengan dana dari donasi TERVERIFIKASI saja. */
export async function getProjects(lang: Lang): Promise<(Project & { id: string })[]> {
  const [list, funding] = await Promise.all([
    rows("projects", "sort_order", true, projectColumns),
    rows("project_funding", "project_id", true, "project_id, raised, verified_at", false),
  ]);
  return list
    .filter((r) => r.status !== "Diajukan")
    .map((r) => {
      const f = funding.find((x) => x.project_id === r.id);
      return {
        id: r.id,
        slug: r.slug,
        programId: r.program_id,
        category: r.category,
        title: tr(r, "title", lang),
        location: tr(r, "location", lang),
        country: countryName(r.country_code, lang),
        status: r.status,
        summary: tr(r, "summary", lang),
        body: paragraphs(tr(r, "body", lang)),
        target: Number(r.budget_target) || 0,
        raised: Number(f?.raised) || 0,
        fundsAsOf: f?.verified_at ?? null,
        progress: Number(r.progress) || 0,
        progressAsOf: r.progress_updated_at,
        beneficiaries: Number(r.beneficiaries) || 0,
        cover: r.cover_url,
        before: r.photos_before ?? [],
        during: r.photos_during ?? [],
        after: r.photos_after ?? [],
        report: r.report_url,
        started: r.started_on,
        completed: r.completed_on,
      };
    });
}

export async function getProject(lang: Lang, slug: string) {
  return (await getProjects(lang)).find((p) => p.slug === slug) ?? null;
}

export async function getProjectUpdates(lang: Lang, projectId: string): Promise<ProjectUpdate[]> {
  return (await rows("project_updates", "reported_on", false, "project_id, reported_on, progress, note, note_en, note_ar, photos"))
    .filter((r) => r.project_id === projectId)
    .map((r) => ({
      date: r.reported_on,
      progress: r.progress,
      note: tr(r, "note", lang),
      photos: r.photos ?? [],
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
  const [list, live] = await Promise.all([
    rows("stats", "sort_order"),
    rows("live_stats", "source", true, "source, value", false),
  ]);
  return list.map((r) => {
    const auto = r.source && r.source !== "manual" ? live.find((x) => x.source === r.source) : null;
    return {
      label: tr(r, "label", lang),
      value: auto ? Number(auto.value).toLocaleString(lang === "ar" ? "ar-u-nu-latn" : "id-ID") : r.value,
      sample: r.sample,
    };
  });
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

/** Semua negara, nama dalam bahasa yang diminta, urut abjad. */
export async function getCountries(lang: Lang) {
  return (await rows("countries", "code", true, "code", false))
    .map((r) => ({ code: String(r.code), name: countryName(r.code, lang) }))
    .sort((a, b) => a.name.localeCompare(b.name, lang));
}

/** Kode ISO alfa-2 → kode numerik (dipakai peta DPLN). */
export async function getCountryNumerics() {
  const list = await rows("countries", "code", true, "code, numeric", false);
  return Object.fromEntries(list.map((r) => [String(r.code), String(r.numeric)]));
}

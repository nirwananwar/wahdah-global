import { postCategories } from "./content";

export type Field = {
  name: string;
  label: string;
  type:
    | "text"
    | "textarea"
    | "longtext"
    | "select"
    | "checkbox"
    | "number"
    | "date"
    | "image"
    | "file"
    | "gallery";
  options?: readonly string[];
  required?: boolean;
  help?: string;
  defaultChecked?: boolean;
  /** Punya kolom terjemahan `<name>_en` dan `<name>_ar`. */
  translatable?: boolean;
};

export type Resource = {
  table: string;
  label: string;
  singular: string;
  titleField: string;
  subtitleField?: string;
  orderBy: { column: string; ascending: boolean };
  hasSlug?: boolean;
  touch?: boolean;
  fields: Field[];
};

const published: Field = {
  name: "published",
  label: "Terbitkan (tampil di website)",
  type: "checkbox",
  defaultChecked: true,
};
const sample: Field = {
  name: "sample",
  label: 'Tandai sebagai "Konten contoh"',
  type: "checkbox",
};
const sortOrder: Field = {
  name: "sort_order",
  label: "Urutan",
  type: "number",
  help: "Angka kecil tampil lebih dulu.",
};
const slug: Field = {
  name: "slug",
  label: "Alamat (slug)",
  type: "text",
  help: "Kosongkan agar dibuat otomatis dari judul.",
};
const body: Field = {
  name: "body",
  label: "Isi",
  type: "longtext",
  translatable: true,
  help: "Pisahkan paragraf dengan satu baris kosong.",
};

export const resources: Record<string, Resource> = {
  banner: {
    table: "slides",
    label: "Banner Beranda",
    singular: "banner",
    titleField: "title",
    subtitleField: "link",
    orderBy: { column: "sort_order", ascending: true },
    fields: [
      {
        name: "title",
        label: "Judul / label",
        type: "text",
        translatable: true,
        required: true,
        help: "Tampil sebagai pita label di atas gambar.",
      },
      {
        name: "link",
        label: "Tautan saat diklik",
        type: "text",
        help: "Contoh: /peduli-ummat atau alamat lengkap https://…",
      },
      {
        name: "image_url",
        label: "Gambar banner (mendatar, disarankan 2:1)",
        type: "image",
      },
      sortOrder,
      published,
    ],
  },
  statistik: {
    table: "stats",
    label: "Statistik",
    singular: "statistik",
    titleField: "label",
    subtitleField: "value",
    orderBy: { column: "sort_order", ascending: true },
    fields: [
      { name: "label", label: "Nama capaian", type: "text", translatable: true, required: true },
      {
        name: "value",
        label: "Angka",
        type: "text",
        required: true,
        help: "Contoh: 598 atau 41.000",
      },
      sortOrder,
      published,
      sample,
    ],
  },
  berita: {
    table: "posts",
    label: "Berita & Kegiatan",
    singular: "berita",
    titleField: "title",
    subtitleField: "category",
    orderBy: { column: "published_at", ascending: false },
    hasSlug: true,
    touch: true,
    fields: [
      { name: "title", label: "Judul", type: "text", translatable: true, required: true },
      slug,
      {
        name: "category",
        label: "Kategori",
        type: "select",
        options: postCategories,
        required: true,
      },
      { name: "published_at", label: "Tanggal", type: "date" },
      { name: "excerpt", label: "Ringkasan", type: "textarea", translatable: true },
      body,
      { name: "cover_url", label: "Foto sampul", type: "image" },
      { name: "gallery", label: "Galeri foto", type: "gallery" },
      published,
      sample,
    ],
  },
  program: {
    table: "programs",
    label: "Program Peduli Ummat",
    singular: "program",
    titleField: "title",
    subtitleField: "status",
    orderBy: { column: "sort_order", ascending: true },
    hasSlug: true,
    touch: true,
    fields: [
      { name: "title", label: "Judul", type: "text", translatable: true, required: true },
      slug,
      { name: "region", label: "Wilayah", type: "text", translatable: true },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: ["Berjalan", "Direncanakan", "Selesai"],
        required: true,
      },
      { name: "summary", label: "Ringkasan", type: "textarea", translatable: true },
      body,
      {
        name: "unit_cost",
        label: "Biaya per unit",
        type: "text",
        translatable: true,
        help: "Contoh: 1 sumur ≈ Rp 25 juta (USD 1.500). Kosongkan bila tidak ada.",
      },
      {
        name: "funding_target",
        label: "Target dana (Rupiah)",
        type: "number",
        help: "Angka saja, tanpa titik. Isi 0 bila tidak ingin menampilkan progres.",
      },
      {
        name: "funding_raised",
        label: "Dana terkumpul (Rupiah)",
        type: "number",
        help: "Angka saja, tanpa titik.",
      },
      { name: "cover_url", label: "Foto sampul", type: "image" },
      { name: "gallery", label: "Galeri foto", type: "gallery" },
      sortOrder,
      published,
      sample,
    ],
  },
  dpln: {
    table: "dpln_chapters",
    label: "DPLN",
    singular: "perwakilan",
    titleField: "country",
    subtitleField: "city",
    orderBy: { column: "sort_order", ascending: true },
    fields: [
      { name: "country", label: "Negara", type: "text", translatable: true, required: true },
      { name: "city", label: "Kota", type: "text", translatable: true },
      { name: "note", label: "Keterangan", type: "textarea", translatable: true },
      sortOrder,
      published,
      sample,
    ],
  },
  rekening: {
    table: "donation_channels",
    label: "Rekening & QRIS",
    singular: "saluran donasi",
    titleField: "label",
    subtitleField: "detail",
    orderBy: { column: "sort_order", ascending: true },
    fields: [
      {
        name: "label",
        label: "Nama saluran",
        type: "text",
        translatable: true,
        required: true,
        help: "Contoh: nama bank, atau QRIS.",
      },
      {
        name: "detail",
        label: "Rincian",
        type: "textarea",
        translatable: true,
        help: "Nomor rekening dan atas nama.",
      },
      { name: "image_url", label: "Gambar (mis. QRIS)", type: "image" },
      {
        name: "international",
        label: "Untuk donatur luar negeri (SWIFT, PayPal, dll.)",
        type: "checkbox",
        help: "Ditampilkan di bagian \"Donasi dari luar negeri\". Untuk transfer bank, tulis di Rincian: nama bank, kode SWIFT, nomor rekening, atas nama, dan alamat bank.",
      },
      sortOrder,
      published,
      sample,
    ],
  },
  dokumen: {
    table: "documents",
    label: "Legalitas & Laporan",
    singular: "dokumen",
    titleField: "title",
    subtitleField: "kind",
    orderBy: { column: "sort_order", ascending: true },
    fields: [
      {
        name: "kind",
        label: "Jenis",
        type: "select",
        options: ["Legalitas", "Laporan"],
        required: true,
      },
      {
        name: "title",
        label: "Judul dokumen",
        type: "text",
        translatable: true,
        required: true,
        help: "Contoh: SK Kemenkumham, NPWP Lembaga, Laporan Tahunan 2025.",
      },
      {
        name: "note",
        label: "Keterangan / nomor",
        type: "text",
        translatable: true,
        help: "Contoh: No. AHU-0001234.AH.01.07.2020.",
      },
      {
        name: "file_url",
        label: "Berkas (PDF atau gambar)",
        type: "file",
        help: "Opsional. Bila diisi, pengunjung bisa mengunduhnya.",
      },
      sortOrder,
      published,
    ],
  },
  mitra: {
    table: "partners",
    label: "Mitra",
    singular: "mitra",
    titleField: "name",
    subtitleField: "country",
    orderBy: { column: "sort_order", ascending: true },
    fields: [
      { name: "name", label: "Nama lembaga", type: "text", translatable: true, required: true },
      { name: "country", label: "Negara", type: "text", translatable: true },
      { name: "website", label: "Situs web", type: "text" },
      { name: "logo_url", label: "Logo", type: "image" },
      sortOrder,
      published,
      sample,
    ],
  },
};

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

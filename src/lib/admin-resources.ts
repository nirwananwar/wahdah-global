import type { Role } from "./roles";

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
    | "gallery"
    /** Pilihan negara (kode ISO dari tabel countries). */
    | "country"
    /** Pilihan baris dari tabel lain (foreign key). */
    | "relation"
    /** Beberapa pilihan sekaligus (kolom text[]). */
    | "tags";
  options?: readonly string[];
  /** Untuk type "relation". */
  relation?: { table: string; label: string; orderBy?: string };
  required?: boolean;
  help?: string;
  defaultChecked?: boolean;
  /** Nilai awal pada formulir baru. "today" untuk tanggal hari ini. */
  defaultValue?: string | number;
  /** Punya kolom terjemahan `<name>_en` dan `<name>_ar`. */
  translatable?: boolean;
  /** Berkas disimpan di bucket privat (hanya staf). */
  private?: boolean;
  /** Tampil sebagai kolom di daftar. */
  list?: boolean;
};

export type Resource = {
  table: string;
  label: string;
  singular: string;
  group: string;
  /** Peran yang boleh mengelola modul ini (Super Admin selalu boleh). */
  roles: Role[];
  titleField: string;
  /** Kolom kunci baris; default `id`. */
  idField?: string;
  orderBy: { column: string; ascending: boolean };
  hasSlug?: boolean;
  touch?: boolean;
  fields: Field[];
  /** Field yang bisa dipakai menyaring daftar (select/country/relation). */
  filters?: string[];
  /** Kolom penanda status di daftar; default `published`. */
  badge?: string;
  /** Daftar terkait yang tampil di halaman ubah (mis. riwayat komunikasi mitra). */
  related?: { resource: string; fk: string; label: string }[];
  /** Penjelasan singkat di atas daftar. */
  intro?: string;
};

export const groups = [
  "Konten Website",
  "Hubungan Internasional",
  "Peduli Ummat",
  "Keuangan & Dokumen",
] as const;

const published: Field = {
  name: "published",
  label: "Terbitkan (tampil di website)",
  type: "checkbox",
  defaultChecked: true,
};
const publishedOff: Field = { ...published, defaultChecked: false };
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
const country: Field = { name: "country_code", label: "Negara", type: "country", list: true };
const partnerRef: Field = {
  name: "partner_id",
  label: "Mitra",
  type: "relation",
  relation: { table: "partners", label: "name", orderBy: "name" },
};
const projectRef: Field = {
  name: "project_id",
  label: "Proyek",
  type: "relation",
  relation: { table: "projects", label: "title", orderBy: "title" },
};

export const projectCategories = [
  "Masjid",
  "Sumur & Air Bersih",
  "Pangan",
  "Ifthar",
  "Pendidikan",
  "Lainnya",
] as const;
export const projectStatuses = ["Diajukan", "Disetujui", "Berjalan", "Selesai"] as const;
export const cooperationTypes = [
  "Kemanusiaan",
  "Pendidikan",
  "Dakwah",
  "Beasiswa",
  "Pengiriman Dai",
  "Pembangunan Masjid",
  "Air Bersih",
] as const;
export const inquiryStatuses = ["Baru", "Ditinjau", "Dihubungi", "Diskusi", "Selesai"] as const;
export const inquiryInterests = [
  "Kemanusiaan",
  "Pendidikan",
  "Dakwah",
  "Diplomasi",
  "Donasi",
  "Lainnya",
] as const;

export const statSources: Record<string, string> = {
  manual: "Manual (isi angka sendiri)",
  partner_countries: "Otomatis: jumlah negara mitra aktif",
  partners: "Otomatis: jumlah mitra aktif",
  dpln: "Otomatis: jumlah DPLN aktif yang terbit",
  programs: "Otomatis: jumlah program terbit",
  projects: "Otomatis: proyek berjalan & selesai",
  mosques: "Otomatis: masjid selesai dibangun",
  wells: "Otomatis: sumur selesai dibangun",
  beneficiaries: "Otomatis: total penerima manfaat proyek",
};

export const resources: Record<string, Resource> = {
  /* ---------------- Konten Website ---------------- */
  banner: {
    table: "slides",
    label: "Banner Beranda",
    singular: "banner",
    group: "Konten Website",
    roles: ["editor"],
    titleField: "title",
    orderBy: { column: "sort_order", ascending: true },
    intro:
      "Bila ada banner terbit, banner ini menggantikan empat slide bidang kerja di beranda.",
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
        list: true,
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
    group: "Konten Website",
    roles: ["editor"],
    titleField: "label",
    orderBy: { column: "sort_order", ascending: true },
    intro:
      "Setiap baris bisa diisi manual atau dihitung otomatis dari database. Pindahkan ke otomatis setelah data mitra dan proyek lengkap.",
    fields: [
      { name: "label", label: "Nama capaian", type: "text", translatable: true, required: true },
      {
        name: "source",
        label: "Sumber angka",
        type: "select",
        options: Object.keys(statSources),
        required: true,
        list: true,
        help: Object.entries(statSources)
          .map(([k, v]) => `${k}: ${v}`)
          .join(" · "),
      },
      {
        name: "value",
        label: "Angka (untuk sumber manual)",
        type: "text",
        list: true,
        help: "Contoh: 598 atau 2000+. Diabaikan bila sumbernya otomatis.",
      },
      sortOrder,
      published,
    ],
  },
  berita: {
    table: "posts",
    label: "Berita & Kegiatan",
    singular: "berita",
    group: "Konten Website",
    roles: ["editor", "duln_admin", "program_admin"],
    titleField: "title",
    badge: "status",
    filters: ["category", "status"],
    orderBy: { column: "published_at", ascending: false },
    hasSlug: true,
    touch: true,
    intro:
      "Semua staf penulis bisa membuat draf dan mengajukan tinjauan. Hanya Editor yang bisa menerbitkan.",
    fields: [
      { name: "title", label: "Judul", type: "text", translatable: true, required: true },
      slug,
      {
        name: "category",
        label: "Kategori",
        type: "relation",
        relation: { table: "post_categories", label: "name", orderBy: "sort_order" },
        required: true,
        list: true,
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: ["draft", "review", "published"],
        required: true,
        help: "draft = belum selesai · review = siap ditinjau Editor · published = tampil di website",
      },
      { name: "published_at", label: "Tanggal publikasi", type: "date", list: true },
      { name: "excerpt", label: "Ringkasan", type: "textarea", translatable: true },
      body,
      { name: "cover_url", label: "Foto sampul", type: "image" },
      { name: "gallery", label: "Galeri foto", type: "gallery" },
      sample,
    ],
  },
  kategori: {
    table: "post_categories",
    label: "Kategori Berita",
    singular: "kategori",
    group: "Konten Website",
    roles: ["editor"],
    titleField: "name",
    idField: "slug",
    badge: "-",
    orderBy: { column: "sort_order", ascending: true },
    fields: [
      {
        name: "slug",
        label: "Kode kategori",
        type: "text",
        required: true,
        list: true,
        help: "Singkat dan unik, mis. Pendidikan. Jangan diubah setelah dipakai.",
      },
      { name: "name", label: "Nama tampilan", type: "text", translatable: true, required: true },
      sortOrder,
    ],
  },

  /* ---------------- Hubungan Internasional ---------------- */
  relasi: {
    table: "relations",
    label: "Diplomasi & Relasi",
    singular: "catatan relasi",
    group: "Hubungan Internasional",
    roles: ["duln_admin"],
    titleField: "title",
    filters: ["kind", "country_code", "partner_id"],
    orderBy: { column: "occurred_on", ascending: false },
    touch: true,
    intro:
      "Riwayat kunjungan, audiensi, pertemuan, surat, dan MoU. Catatan yang ditandai terbit tampil di halaman Diplomasi.",
    fields: [
      { name: "occurred_on", label: "Tanggal", type: "date", list: true, required: true, defaultValue: "today" },
      {
        name: "kind",
        label: "Jenis",
        type: "select",
        options: ["Kunjungan", "Audiensi", "Pertemuan", "Forum", "Penandatanganan MoU", "Surat", "Telepon/Daring"],
        required: true,
        list: true,
      },
      { name: "title", label: "Judul", type: "text", translatable: true, required: true },
      partnerRef,
      country,
      { name: "summary", label: "Ringkasan", type: "textarea", translatable: true },
      {
        name: "follow_up",
        label: "Tindak lanjut (internal)",
        type: "textarea",
        help: "Tidak pernah tampil di website.",
      },
      { name: "follow_up_due", label: "Tenggat tindak lanjut", type: "date" },
      { name: "follow_up_done", label: "Tindak lanjut selesai", type: "checkbox" },
      { ...publishedOff, label: "Tampilkan di halaman Diplomasi (judul & ringkasan saja)" },
    ],
  },
  mitra: {
    table: "partners",
    label: "Mitra Internasional",
    singular: "mitra",
    group: "Hubungan Internasional",
    roles: ["duln_admin"],
    titleField: "name",
    filters: ["country_code", "relation_status", "category"],
    orderBy: { column: "name", ascending: true },
    touch: true,
    related: [
      { resource: "relasi", fk: "partner_id", label: "Riwayat komunikasi & kegiatan" },
      { resource: "dokumen", fk: "partner_id", label: "Dokumen (MoU, proposal, korespondensi)" },
    ],
    fields: [
      { name: "name", label: "Nama lembaga", type: "text", translatable: true, required: true },
      country,
      {
        name: "category",
        label: "Kategori",
        type: "select",
        options: ["NGO", "Yayasan", "Pemerintah", "Kedutaan", "Universitas", "Lembaga Pendidikan", "Organisasi Internasional", "Swasta", "Lainnya"],
        required: true,
        list: true,
      },
      {
        name: "relation_status",
        label: "Status hubungan",
        type: "select",
        options: ["Aktif", "Penjajakan", "Tidak aktif"],
        required: true,
        list: true,
      },
      { name: "cooperation_types", label: "Bentuk kerja sama", type: "tags", options: cooperationTypes },
      { name: "website", label: "Situs web", type: "text" },
      { name: "logo_url", label: "Logo", type: "image" },
      { name: "contact_name", label: "Nama kontak (internal)", type: "text" },
      { name: "contact_email", label: "Email kontak (internal)", type: "text" },
      { name: "contact_phone", label: "Telepon kontak (internal)", type: "text" },
      { name: "notes", label: "Catatan internal", type: "textarea" },
      {
        name: "country",
        label: "Nama negara (teks lama, opsional)",
        type: "text",
        translatable: true,
        help: "Kosongkan; nama negara diambil otomatis dari pilihan Negara.",
      },
      sortOrder,
      { ...publishedOff, label: "Tampilkan di website (nama, negara, logo, bentuk kerja sama)" },
    ],
  },
  dpln: {
    table: "dpln_chapters",
    label: "DPLN",
    singular: "perwakilan",
    group: "Hubungan Internasional",
    roles: ["duln_admin"],
    titleField: "country",
    filters: ["org_status"],
    orderBy: { column: "sort_order", ascending: true },
    touch: true,
    related: [{ resource: "dokumen", fk: "dpln_id", label: "Dokumen" }],
    fields: [
      country,
      { name: "country", label: "Nama negara (tampilan)", type: "text", translatable: true, required: true },
      { name: "city", label: "Kota", type: "text", translatable: true },
      { name: "area", label: "Wilayah aktivitas", type: "text", translatable: true },
      {
        name: "org_status",
        label: "Status kepengurusan",
        type: "select",
        options: ["Aktif", "Pembentukan", "Tidak aktif"],
        required: true,
        list: true,
      },
      { name: "note", label: "Keterangan singkat", type: "textarea", translatable: true },
      {
        name: "activities",
        label: "Program & kegiatan yang berjalan",
        type: "longtext",
        translatable: true,
        help: "Pisahkan paragraf dengan satu baris kosong.",
      },
      {
        name: "photo_url",
        label: "Foto dokumentasi utama",
        type: "image",
        help: "Tampil utuh (tidak dipotong) di profil negara, dengan judul & caption di bawahnya.",
      },
      { name: "photo_title", label: "Judul caption foto", type: "text", translatable: true },
      { name: "photo_caption", label: "Caption foto", type: "textarea", translatable: true },
      { name: "gallery", label: "Dokumentasi kegiatan", type: "gallery" },
      { name: "leader_name", label: "Penanggung jawab (internal)", type: "text" },
      { name: "contact_email", label: "Email (internal)", type: "text" },
      { name: "contact_phone", label: "Telepon (internal)", type: "text" },
      sortOrder,
      published,
    ],
  },
  pesan: {
    table: "inquiries",
    label: "Pesan Masuk",
    singular: "pesan",
    group: "Hubungan Internasional",
    roles: ["duln_admin"],
    titleField: "organization",
    badge: "status",
    filters: ["status", "interest", "country_code"],
    orderBy: { column: "created_at", ascending: false },
    touch: true,
    intro: "Pesan dari formulir kemitraan di halaman Hubungi Kami.",
    fields: [
      { name: "status", label: "Status", type: "select", options: inquiryStatuses, required: true },
      { name: "name", label: "Nama", type: "text", required: true, list: true },
      { name: "organization", label: "Lembaga", type: "text" },
      country,
      { name: "email", label: "Email", type: "text", required: true },
      { name: "phone", label: "Telepon", type: "text" },
      { name: "interest", label: "Minat kerja sama", type: "select", options: inquiryInterests, list: true },
      { name: "message", label: "Pesan", type: "longtext", required: true },
      { name: "internal_note", label: "Catatan internal", type: "textarea" },
    ],
  },

  /* ---------------- Peduli Ummat ---------------- */
  program: {
    table: "programs",
    label: "Program",
    singular: "program",
    group: "Peduli Ummat",
    roles: ["program_admin"],
    titleField: "title",
    orderBy: { column: "sort_order", ascending: true },
    hasSlug: true,
    touch: true,
    intro: "Jenis program (mis. Air Bersih, Masjid). Proyek per lokasi dikelola di menu Proyek.",
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
        list: true,
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
      { name: "cover_url", label: "Foto sampul", type: "image" },
      { name: "gallery", label: "Galeri foto", type: "gallery" },
      sortOrder,
      published,
    ],
  },
  proyek: {
    table: "projects",
    label: "Proyek",
    singular: "proyek",
    group: "Peduli Ummat",
    roles: ["program_admin"],
    titleField: "title",
    badge: "status",
    filters: ["category", "status", "program_id", "country_code"],
    orderBy: { column: "created_at", ascending: false },
    hasSlug: true,
    touch: true,
    intro:
      "Proyek per lokasi (mis. Pembangunan Masjid Al-Falah). Progres diambil dari laporan progres terbaru; dana dari donasi terverifikasi.",
    related: [
      { resource: "progres", fk: "project_id", label: "Laporan progres" },
      { resource: "donasi", fk: "project_id", label: "Donasi" },
      { resource: "dokumen", fk: "project_id", label: "Dokumen & laporan" },
    ],
    fields: [
      { name: "title", label: "Nama proyek", type: "text", translatable: true, required: true },
      slug,
      {
        name: "program_id",
        label: "Program",
        type: "relation",
        relation: { table: "programs", label: "title", orderBy: "sort_order" },
      },
      { name: "category", label: "Kategori", type: "select", options: projectCategories, required: true, list: true },
      {
        name: "status",
        label: "Status proyek",
        type: "select",
        options: projectStatuses,
        required: true,
        help: "Diajukan → Disetujui → Berjalan → Selesai",
      },
      { name: "location", label: "Lokasi (Kab/Kota, Provinsi)", type: "text", translatable: true, list: true },
      { ...country, defaultValue: "ID" },
      { name: "summary", label: "Ringkasan", type: "textarea", translatable: true },
      { ...body, label: "Deskripsi kebutuhan" },
      { name: "budget_target", label: "Target anggaran (Rupiah)", type: "number", help: "Angka saja, tanpa titik." },
      { name: "beneficiaries", label: "Jumlah penerima manfaat", type: "number" },
      { name: "started_on", label: "Tanggal mulai", type: "date" },
      { name: "completed_on", label: "Tanggal selesai", type: "date" },
      { name: "cover_url", label: "Foto utama", type: "image" },
      { name: "photos_before", label: "Foto sebelum", type: "gallery" },
      { name: "photos_during", label: "Foto selama pengerjaan", type: "gallery" },
      { name: "photos_after", label: "Foto sesudah", type: "gallery" },
      { name: "report_url", label: "Laporan pelaksanaan (PDF)", type: "file" },
      { name: "internal_note", label: "Catatan internal", type: "textarea" },
      sortOrder,
      { ...publishedOff, label: "Tampilkan di website" },
    ],
  },
  progres: {
    table: "project_updates",
    label: "Laporan Progres",
    singular: "laporan progres",
    group: "Peduli Ummat",
    roles: ["program_admin"],
    titleField: "reported_on",
    filters: ["project_id"],
    orderBy: { column: "reported_on", ascending: false },
    intro: "Setiap laporan memperbarui persentase progres proyek beserta tanggalnya.",
    fields: [
      { ...projectRef, required: true, list: true },
      { name: "reported_on", label: "Tanggal laporan", type: "date", required: true, defaultValue: "today" },
      { name: "progress", label: "Progres (%)", type: "number", required: true, list: true, help: "0–100" },
      { name: "note", label: "Uraian", type: "textarea", translatable: true },
      { name: "photos", label: "Foto", type: "gallery" },
      { ...published, label: "Tampilkan di halaman proyek" },
    ],
  },
  donasi: {
    table: "donations",
    label: "Donasi",
    singular: "catatan donasi",
    group: "Peduli Ummat",
    roles: ["finance_admin"],
    titleField: "donor_name",
    badge: "verified",
    filters: ["project_id", "currency"],
    orderBy: { column: "received_on", ascending: false },
    intro:
      "Hanya donasi yang sudah diverifikasi yang dihitung sebagai dana terkumpul di website. Verifikator dan waktunya dicatat otomatis.",
    fields: [
      { name: "received_on", label: "Tanggal diterima", type: "date", list: true, required: true, defaultValue: "today" },
      projectRef,
      { name: "donor_name", label: "Nama donatur (internal)", type: "text", help: "Boleh 'Hamba Allah'. Tidak pernah tampil di website." },
      { name: "amount", label: "Jumlah", type: "number", required: true },
      {
        name: "currency",
        label: "Mata uang",
        type: "select",
        options: ["IDR", "USD", "SAR", "QAR", "KWD", "AED", "MYR", "TRY", "EGP", "EUR"],
        required: true,
        list: true,
      },
      {
        name: "amount_idr",
        label: "Setara Rupiah",
        type: "number",
        required: true,
        list: true,
        help: "Sesuai mutasi rekening. Untuk IDR isi sama dengan Jumlah.",
      },
      { name: "channel", label: "Saluran (bank, QRIS, SWIFT…)", type: "text" },
      { name: "reference", label: "No. referensi / bukti transfer", type: "text" },
      { name: "proof_url", label: "Bukti transfer", type: "file", private: true },
      { name: "note", label: "Catatan", type: "textarea" },
      { name: "verified", label: "Sudah diverifikasi dengan mutasi rekening", type: "checkbox" },
    ],
  },

  /* ---------------- Keuangan & Dokumen ---------------- */
  rekening: {
    table: "donation_channels",
    label: "Rekening & QRIS",
    singular: "saluran donasi",
    group: "Keuangan & Dokumen",
    roles: ["finance_admin"],
    titleField: "label",
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
        help: 'Ditampilkan di bagian "Donasi dari luar negeri". Untuk transfer bank, tulis di Rincian: nama bank, kode SWIFT, nomor rekening, atas nama, dan alamat bank.',
      },
      sortOrder,
      published,
      sample,
    ],
  },
  dokumen: {
    table: "documents",
    label: "Dokumen & Laporan",
    singular: "dokumen",
    group: "Keuangan & Dokumen",
    roles: ["editor", "duln_admin", "program_admin", "finance_admin"],
    titleField: "title",
    filters: ["kind", "visibility", "partner_id", "project_id"],
    orderBy: { column: "created_at", ascending: false },
    intro:
      "Dokumen Publik tampil di halaman Tentang Kami. Dokumen Internal (MoU, korespondensi) disimpan di penyimpanan privat dan hanya bisa dibuka staf.",
    fields: [
      {
        name: "kind",
        label: "Jenis",
        type: "select",
        options: ["Legalitas", "Laporan", "MoU", "Proposal", "Korespondensi", "Lainnya"],
        required: true,
        list: true,
      },
      {
        name: "visibility",
        label: "Visibilitas",
        type: "select",
        options: ["Publik", "Internal"],
        required: true,
        list: true,
        help: "Internal: berkas disimpan privat dan tidak pernah tampil di website.",
      },
      {
        name: "title",
        label: "Judul dokumen",
        type: "text",
        translatable: true,
        required: true,
        help: "Contoh: SK Kemenkumham, NPWP Lembaga, Laporan Tahunan 2025, MoU dengan …",
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
        help: "Opsional untuk dokumen publik; bila diisi, pengunjung bisa mengunduhnya.",
      },
      partnerRef,
      projectRef,
      {
        name: "dpln_id",
        label: "DPLN",
        type: "relation",
        relation: { table: "dpln_chapters", label: "country", orderBy: "sort_order" },
      },
      sortOrder,
      published,
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

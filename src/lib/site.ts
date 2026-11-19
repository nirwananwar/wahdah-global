import type { Dict } from "./i18n";

/** Data lembaga yang sama di semua bahasa. TODO: isi dengan data resmi. */
export const site = {
  name: "Wahdah Global",
  email: "",
  phone: "",
  address: "",
  /** Nomor WhatsApp format internasional tanpa "+", mis. "62812xxxxxxx". */
  whatsapp: "",
  /** Tautan Google Maps lokasi kantor. */
  mapsUrl: "",
  /** Periode yang tampil di atas statistik pencapaian. */
  statsPeriod: "1448 H / 2026 M",
  socials: [] as { label: string; href: string }[],
};

export const programLinks = (t: Dict) => [
  { path: "/diplomasi", label: t.pillars.diplomasi },
  { path: "/peduli-ummat", label: t.pillars.peduliUmmat },
  { path: "/kerja-sama-internasional", label: t.pillars.kerjaSama },
  { path: "/dpln", label: t.pillars.dpln },
];

/**
 * Gambar latar slide bidang kerja di carousel beranda (tanpa gambar: tampil logo).
 * `overlay: false` untuk ilustrasi yang sudah berwarna merek, agar tidak digelapkan.
 */
export const pillarImages: Record<string, { src: string; overlay?: boolean }> = {
  "/diplomasi": { src: "/slides/diplomasi.jpg" },
  "/kerja-sama-internasional": { src: "/slides/kerja-sama-internasional.jpg" },
  "/peduli-ummat": { src: "/slides/peduli-ummat.jpg" },
  "/dpln": { src: "/slides/dpln-bendera.jpg" },
};

export const navItems = (t: Dict) => [
  { path: "/", label: t.nav.home },
  { path: "/tentang-kami", label: t.nav.about },
  { path: "/program", label: t.nav.program, children: programLinks(t) },
  { path: "/berita", label: t.nav.news },
  { path: "/donasi", label: t.nav.donate },
  { path: "/rekening", label: t.nav.accounts },
  { path: "/hubungi-kami", label: t.nav.contact },
];

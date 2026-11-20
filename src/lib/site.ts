import type { Dict, Lang } from "./i18n";
import type { PortalDict } from "./i18n-portal";

/** Data lembaga; alamat ditulis per bahasa. */
export const site = {
  name: "Wahdah Global",
  email: "dulndppwi@gmail.com",
  phone: "",
  address: {
    id: "Lantai 9, Gedung Nyi Ageng Serang, Jakarta Selatan",
    en: "9th Floor, Nyi Ageng Serang Building, South Jakarta, Indonesia",
    ar: "الطابق التاسع، مبنى نيي أغينغ سيرانغ، جاكرتا الجنوبية، إندونيسيا",
  } as Record<Lang, string>,
  /** Nomor WhatsApp format internasional tanpa "+", untuk tautan wa.me. */
  whatsapp: "6281241272121",
  /** Nomor WhatsApp seperti yang ditampilkan. */
  whatsappLabel: "+62 812-4127-2121",
  /** Tautan Google Maps lokasi kantor. */
  mapsUrl: "",
  /** Periode yang tampil di atas statistik pencapaian. */
  statsPeriod: "1448 H / 2026 M",
  socials: [] as { label: string; href: string }[],
};

export const navItems = (t: Dict, p: PortalDict) => [
  { path: "/", label: t.nav.home },
  { path: "/tentang-kami", label: t.nav.about },
  {
    path: "/diplomasi",
    label: p.nav.diplomacy,
    children: [
      { path: "/diplomasi", label: p.nav.diplomacyMain },
      { path: "/dpln", label: p.nav.dplnNetwork },
    ],
  },
  { path: "/kerja-sama-internasional", label: p.nav.cooperation },
  { path: "/peduli-ummat", label: p.nav.care },
  { path: "/berita", label: t.nav.news },
  { path: "/donasi", label: t.nav.donate },
  { path: "/hubungi-kami", label: t.nav.contact },
];

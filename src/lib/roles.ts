/** Peran staf. Pembatasan sebenarnya ditegakkan RLS di database (has_role). */
export const roles = [
  "super_admin",
  "editor",
  "duln_admin",
  "program_admin",
  "finance_admin",
] as const;
export type Role = (typeof roles)[number];

export const roleInfo: Record<Role, { name: string; desc: string }> = {
  super_admin: { name: "Super Admin", desc: "Semua modul dan pengaturan pengguna" },
  editor: { name: "Editor", desc: "Berita, banner, statistik; menerbitkan berita" },
  duln_admin: { name: "DULN Admin", desc: "Mitra, Diplomasi & Relasi, DPLN, pesan kemitraan" },
  program_admin: { name: "Program Admin", desc: "Program, proyek, progres, dokumentasi" },
  finance_admin: { name: "Finance Admin", desc: "Donasi, verifikasi dana, rekening" },
};

/** Benar bila salah satu peran milik user diizinkan (Super Admin selalu boleh). */
export const allowed = (mine: readonly Role[], permitted: readonly Role[]) =>
  mine.includes("super_admin") || permitted.some((r) => mine.includes(r));

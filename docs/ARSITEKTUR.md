# Arsitektur Teknis Wahdah Global

Dokumen hasil audit (Minggu 1). Tujuannya: memetakan rencana portal kelembagaan
ke kode dan database yang sudah ada, supaya tidak ada tabel atau fitur yang
dibuat dua kali.

Status: **diimplementasikan** (migrasi `0006_portal.sql`, 20 November 2026). Lihat bagian 7.

---

## 1. Teknologi yang terverifikasi

Diperiksa langsung dari source code dan project Supabase (20 November 2026).

| Komponen | Yang dipakai | Keputusan |
| --- | --- | --- |
| Framework | Next.js 16.4 (App Router, Cache Components), React 19.3, TypeScript | Dipertahankan |
| Tampilan | Tailwind CSS 4 | Dipertahankan |
| Database | PostgreSQL di Supabase (project `wahdah-global`, region Singapura) | Dipertahankan |
| Autentikasi | Supabase Auth (email + password), cookie sesi via `@supabase/ssr` | Dipertahankan, ditambah peran |
| Penyimpanan berkas | Supabase Storage, bucket publik `media` | Ditambah bucket privat |
| Hosting | Vercel (deploy otomatis dari `main`) | Dipertahankan |
| Kode sumber | GitHub `nirwananwar/wahdah-global` | Dipertahankan |
| Bahasa | Indonesia, Inggris, Arab (kolom `_en`, `_ar`; kosong = tampil versi Indonesia) | Dipertahankan |

Tidak ada migrasi teknologi. Semua kebutuhan rencana bisa dipenuhi dengan stack ini.

## 2. Kondisi saat ini

### Tabel database (schema `public`)

| Tabel | Isi | Baris |
| --- | --- | --- |
| `admins` | Daftar user yang boleh masuk panel admin | 1 |
| `posts` | Berita & kegiatan (kategori enum, galeri, terbit/tidak) | 4 (contoh, tidak terbit) |
| `programs` | Program Peduli Ummat (status, biaya per unit, target & terkumpul) | 4 |
| `dpln_chapters` | Perwakilan luar negeri (negara, kota, keterangan) | 5 |
| `partners` | Mitra (nama, negara, situs, logo) | 0 |
| `donation_channels` | Rekening & QRIS, termasuk penanda internasional | 2 (contoh, tidak terbit) |
| `documents` | Legalitas & laporan (berkas PDF/gambar) | 0 |
| `slides` | Banner beranda | 0 |
| `stats` | Angka statistik beranda (diisi manual) | 5 |

Semua tabel memakai RLS: publik hanya membaca baris `published = true`, dan
hanya user di `admins` yang bisa menulis. Migrasi ada di `supabase/migrations/0001`–`0005`.

### Panel admin (`/admin`)

Panel generik: setiap modul didefinisikan di `src/lib/admin-resources.ts`
(field, terjemahan, urutan), lalu halaman daftar dan formulir dibuat otomatis.
Modul saat ini: Banner Beranda, Statistik, Berita, Program Peduli Ummat, DPLN,
Rekening & QRIS, Legalitas & Laporan, Mitra.

Belum ada: halaman dashboard (saat ini `/admin` langsung ke Berita), peran
selain "admin", pencarian/filter, data internal (non-publik), formulir masuk dari publik.

## 3. Pemetaan rencana ke kondisi sekarang

| Modul rencana | Yang sudah ada | Yang perlu dibangun |
| --- | --- | --- |
| A. Dashboard admin | — | Halaman ringkasan; angka dihitung dari database |
| B. Database mitra | Tabel `partners` (nama, negara, situs, logo) | Kategori, kontak, status hubungan, bentuk kerja sama, riwayat komunikasi, dokumen, pencarian per negara, tanda publik/internal |
| C. Database DPLN | Tabel `dpln_chapters` (negara, kota, keterangan) | Penanggung jawab, kontak, status kepengurusan, program, dokumentasi, peta persebaran publik |
| D. Proyek kemanusiaan | `programs` dengan biaya & progres dana (manual) | Tabel proyek per lokasi, status Proposed→Completed, progres fisik, foto sebelum/selama/sesudah, laporan, catatan dana terverifikasi |
| E. Berita | CRUD, foto & galeri, tanggal terbit, terbit/tidak, 3 bahasa | Kategori yang bisa ditambah admin, alur draf → tinjau → terbit |
| F. Formulir kemitraan | — | Formulir publik, tabel pesan, status New → Closed, notifikasi |
| Hak akses | Satu peran (`admins`) | 5 peran dengan izin per modul |
| Dokumen & laporan | Tabel `documents` (publik) | Dokumen internal (MoU, korespondensi) di bucket privat, terhubung ke mitra/proyek/DPLN |

## 4. Rancangan database target

Prinsip: **perluas tabel yang ada, jangan buat ulang.** Nama tabel lama
dipertahankan agar kode yang berjalan tidak rusak.

| Entitas rencana | Tabel | Status |
| --- | --- | --- |
| users | `auth.users` (Supabase) + **`user_roles`** (baru) menggantikan `admins` | Ubah |
| countries | **`countries`**: kode ISO, nama id/en/ar, koordinat untuk peta | Baru |
| partners | `partners` + kolom: `country_code`, `category`, `contact_email`, `contact_phone`, `relation_status`, `cooperation_types[]`, `is_public` | Perluas |
| — | **`partner_interactions`**: tanggal, jenis (pertemuan/surat/telepon), ringkasan, tindak lanjut, tenggat, pencatat | Baru |
| dpln | `dpln_chapters` + kolom: `country_code`, `leader_name`, `contact`, `area`, `org_status`, `is_public` | Perluas |
| programs | `programs` tetap sebagai **jenis program** (Air Bersih, Masjid, Sembako, Ifthar) | Tetap |
| projects | **`projects`**: nama, `program_id`, lokasi (kab/kota, provinsi, negara), status, anggaran, progres fisik, foto, laporan | Baru |
| project_updates | **`project_updates`**: tanggal, progres %, uraian, foto, pembuat | Baru |
| donations | **`donations`**: tanggal terima, jumlah, mata uang, `project_id`, sumber/bukti, `verified_by`, `verified_at` | Baru |
| news | `posts` + kolom `status` (draf/tinjau/terbit) dan tabel **`post_categories`** | Perluas |
| documents | `documents` + kolom `visibility` (publik/internal) dan tautan opsional ke mitra/proyek/DPLN | Perluas |
| inquiries | **`inquiries`**: nama, lembaga, negara, email, jenis kerja sama, pesan, status, catatan internal | Baru |
| statistics | `stats` + view **`live_stats`** yang menghitung dari tabel lain | Perluas |

### Aturan angka dana (catatan penting dari rencana)

- Dana terkumpul di halaman publik = **jumlah `donations` yang sudah diverifikasi**
  Finance Admin, bukan angka yang diketik manual.
- Setiap angka dana dan progres ditampilkan dengan **tanggal pembaruan terakhir**.
- Donasi yang belum diverifikasi hanya terlihat di dashboard.
- Data pribadi donatur tidak pernah tampil di website publik.

## 5. Hak akses (RLS per peran)

Peran disimpan di `user_roles`; satu user boleh punya lebih dari satu peran.
Fungsi `has_role('…')` dipakai di setiap kebijakan RLS, jadi pembatasan
berlaku di database, bukan hanya di tampilan.

| Modul | Super Admin | Editor | DULN Admin | Program Admin | Finance Admin |
| --- | --- | --- | --- | --- | --- |
| Banner, statistik, profil | ✔ | ✔ | — | — | — |
| Berita: tulis draf | ✔ | ✔ | ✔ | ✔ | — |
| Berita: terbitkan | ✔ | ✔ | — | — | — |
| Mitra & riwayat komunikasi | ✔ | — | ✔ | — | — |
| DPLN | ✔ | — | ✔ | — | — |
| Pesan kemitraan | ✔ | — | ✔ | — | — |
| Proyek & pembaruan progres | ✔ | — | — | ✔ | lihat |
| Donasi & verifikasi | ✔ | — | — | lihat | ✔ |
| Rekening & QRIS | ✔ | — | — | — | ✔ |
| Dokumen (publik & internal) | ✔ | ✔ | ✔ | ✔ | ✔ |
| Pengguna & hak akses | ✔ | — | — | — | — |

## 6. Data publik vs internal

| Selalu internal | Bisa dipublikasikan (bila ditandai) |
| --- | --- |
| Kontak mitra, riwayat komunikasi, MoU & korespondensi | Nama, negara, logo, situs mitra |
| Kontak penanggung jawab DPLN | Negara & wilayah DPLN (untuk peta) |
| Pesan kemitraan | Proyek, progres, foto, laporan |
| Donasi per transaksi, data donatur | Total dana terverifikasi per proyek |

Berkas internal disimpan di bucket privat `internal` dan hanya bisa dibuka
lewat tautan bertanda waktu (signed URL) oleh peran yang berhak.

## 7. Status implementasi

Semua modul di bagian 3 sudah dibangun dalam satu tahap:

| Bagian | Lokasi |
| --- | --- |
| Peran & RLS (`user_roles`, `has_role`, `my_roles`, `admin_users`) | `supabase/migrations/0006_portal.sql`, `src/lib/roles.ts` |
| Dashboard admin (angka dari view `live_stats`) | `src/app/admin/page.tsx` |
| Pengguna & Hak Akses | `src/app/admin/pengguna/page.tsx` |
| Modul admin generik (cari, saring, relasi, negara, berkas privat, daftar terkait) | `src/lib/admin-resources.ts`, `src/app/admin/[resource]/` |
| Mitra, Diplomasi & Relasi, DPLN, Pesan Masuk | modul `mitra`, `relasi`, `dpln`, `pesan` |
| Proyek, Laporan Progres, Donasi terverifikasi | modul `proyek`, `progres`, `donasi`; view `project_funding` |
| Berita: kategori dari tabel, alur draf → tinjau → terbit | modul `berita`, `kategori` |
| Halaman publik: jejak diplomasi, mitra, proyek & detail, peta & profil DPLN, formulir kemitraan | `src/app/[lang]/…`, `src/components/portal.tsx`, `src/components/dpln-map.tsx` |

Catatan: kolom `programs.funding_target/raised` tidak dipakai lagi; dana kini
ditampilkan per proyek dari donasi terverifikasi.

## 8. Keputusan yang diambil

1. Nama pilar tetap **Peduli Ummat** (Ummah Care / رعاية الأمة).
2. Statistik beranda: tiap baris bisa **manual atau otomatis** (kolom `stats.source`).
3. Website tetap **tiga bahasa** (Indonesia, Inggris, Arab).
4. Pesan kemitraan masuk ke **dashboard** saja; email menyusul setelah ada domain resmi.
5. Dokumen internal bisa dikelola semua staf; berkasnya tetap di bucket privat.

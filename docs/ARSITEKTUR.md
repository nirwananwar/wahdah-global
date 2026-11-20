# Arsitektur Teknis Wahdah Global

Dokumen hasil audit (Minggu 1). Tujuannya: memetakan rencana portal kelembagaan
ke kode dan database yang sudah ada, supaya tidak ada tabel atau fitur yang
dibuat dua kali.

Status: **draf untuk disetujui**. Bagian 8 berisi keputusan yang masih terbuka.

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
| Dokumen internal | ✔ | — | sesuai modul | sesuai modul | sesuai modul |
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

## 7. Urutan pengerjaan (disesuaikan dengan kondisi sekarang)

Karena sebagian besar fondasi sudah ada, Minggu 2 dan sebagian Minggu 5 bisa dipersingkat.

1. **Minggu 1 — Audit & arsitektur** (dokumen ini).
2. **Minggu 2 — Fondasi admin:** peran & hak akses (`user_roles`), halaman Pengguna, Dashboard ringkasan, bucket privat, pencarian/filter di daftar admin.
3. **Minggu 3 — Hubungan internasional:** `countries`, perluasan `partners` & `dpln_chapters`, riwayat komunikasi, dokumen internal, formulir kemitraan + Pesan Masuk.
4. **Minggu 4 — Proyek kemanusiaan:** `projects`, `project_updates`, `donations` + verifikasi, halaman detail proyek.
5. **Minggu 5 — Integrasi publik:** statistik otomatis, halaman mitra, peta DPLN, daftar & detail proyek, alur draf berita.
6. **Minggu 6 — Pengujian & peluncuran:** uji akses per peran, keamanan RLS, tampilan HP, formulir, backup database, panduan admin.

Setiap tahap dikerjakan sebagai migrasi bernomor (`0006_…`), diuji di lokal
dengan data asli, lalu dikirim ke `main`.

## 8. Keputusan yang masih terbuka

1. **Nama pilar kemanusiaan.** Website saat ini memakai *Peduli Ummat* (dipilih
   sebelumnya); rencana memakai *Humanitarian Programs / Program Kemanusiaan*.
2. **Statistik beranda.** Angka saat ini diisi manual (mis. Negara Mitra 12),
   sedangkan database baru berisi 0 mitra dan 5 DPLN. Bila statistik dihitung
   otomatis, angka publik akan turun sampai data mitra/proyek diinput.
3. **Bahasa.** Rencana menyebut Indonesia + Inggris; website sudah mendukung
   Arab juga. Apakah Arab dipertahankan?
4. **Notifikasi pesan kemitraan.** Cukup di dashboard, atau juga dikirim ke
   email? Email butuh layanan pengirim (mis. Resend) dan domain resmi.
5. **Domain resmi.** Diperlukan untuk email notifikasi dan kesan profesional.

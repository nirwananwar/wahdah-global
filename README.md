# Wahdah Global

Situs Wahdah Global: halaman publik tiga bahasa (`id`, `en`, `ar`) dan panel admin di `/admin` untuk mengelola konten. Dibangun dengan Next.js 16 (App Router), Tailwind CSS, dan Supabase (database, auth, storage).

## Yang dibutuhkan

- Node.js 22 dan pnpm 11
- Satu project Supabase (punya sendiri)
- Akun Vercel untuk deploy

## 1. Clone dan install

```bash
git clone git@github.com:nirwananwar/wahdah-global.git
cd wahdah-global
pnpm install
```

## 2. Siapkan database Supabase

Buat project baru di [supabase.com](https://supabase.com), lalu jalankan file SQL berikut **secara berurutan** di SQL Editor:

1. `supabase/migrations/0001_init.sql`
2. `supabase/migrations/0002_gallery.sql`
3. `supabase/migrations/0003_slides_stats.sql`
4. `supabase/migrations/0004_translations.sql`
5. `supabase/seed.sql` (opsional, berisi konten contoh yang bisa dihapus dari panel admin)

Migrasi ini membuat tabel, aturan RLS, dan bucket storage publik bernama `media` untuk gambar.

Alternatif dengan Supabase CLI:

```bash
supabase link --project-ref <project-ref>
supabase db push
```

## 3. Environment variable

Buat file `.env.local` di root project (file ini tidak ikut ke git):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable key>
```

Kedua nilai ada di dashboard Supabase, bagian Project Settings → API. Kalau project memakai anon key lama, isi `NEXT_PUBLIC_SUPABASE_ANON_KEY` sebagai gantinya. Cukup isi salah satu: bila keduanya ada, `NEXT_PUBLIC_SUPABASE_ANON_KEY` yang dipakai.

## 4. Buat akun admin

Punya akun saja tidak cukup untuk masuk ke panel admin; user harus terdaftar di tabel `admins`.

1. Di dashboard Supabase buka Authentication → Users → Add user, isi email dan password.
2. Jalankan di SQL Editor:

```sql
insert into admins (user_id)
select id from auth.users where email = 'email-admin@contoh.com';
```

Login lewat `/admin/login` dengan email dan password tersebut.

## 5. Jalankan

```bash
pnpm dev
```

Buka [http://localhost:3000](http://localhost:3000). Perintah lain: `pnpm build`, `pnpm start`, `pnpm lint`.

## Deploy ke Vercel

1. Import repo ini di Vercel (atau jalankan `vercel` dari folder project).
2. Di Project Settings → General, pilih Node.js 22.x.
3. Tambahkan dua environment variable dari langkah 3 di Project Settings → Environment Variables **sebelum deploy pertama**. Halaman dibangun dari isi database, jadi deploy tanpa variabel ini akan tampil kosong sampai cache diperbarui atau di-deploy ulang.
4. Deploy.

## Struktur singkat

| Lokasi | Isi |
| --- | --- |
| `src/app/[lang]/` | Halaman publik per bahasa |
| `src/app/admin/` | Panel admin dan login |
| `src/components/` | Komponen UI |
| `src/lib/` | Klien Supabase, i18n, pengambilan konten, definisi resource admin |
| `src/proxy.ts` | Pengalihan bahasa dan proteksi rute |
| `supabase/` | Migrasi dan seed database |

## Catatan untuk pengembang

Project ini memakai Next.js 16, yang punya perubahan dari versi sebelumnya (misalnya `proxy.ts` menggantikan `middleware.ts`). Lihat `AGENTS.md` sebelum mengubah kode.

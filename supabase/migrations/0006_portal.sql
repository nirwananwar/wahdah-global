-- Portal kelembagaan: peran & hak akses, negara, mitra, relasi diplomatik,
-- DPLN, proyek kemanusiaan, donasi terverifikasi, kategori & alur berita,
-- pesan kemitraan, statistik otomatis, dan dokumen internal.

------------------------------------------------------------------------
-- 1. Peran
------------------------------------------------------------------------
create type app_role as enum ('super_admin', 'editor', 'duln_admin', 'program_admin', 'finance_admin');

create table user_roles (
  user_id uuid not null references auth.users (id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);
alter table user_roles enable row level security;
insert into user_roles (user_id, role) select user_id, 'super_admin' from admins;

-- Benar bila user memegang salah satu peran (super_admin selalu lolos).
create function has_role(variadic roles app_role[]) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from user_roles
    where user_id = auth.uid() and (role = any (roles) or role = 'super_admin')
  )
$$;

-- "Staf": punya peran apa pun. Dipakai panel admin & kebijakan storage.
create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from user_roles where user_id = auth.uid())
$$;

create function my_roles() returns app_role[]
language sql stable security definer set search_path = public as $$
  select coalesce(array_agg(role order by role), '{}') from user_roles where user_id = auth.uid()
$$;

create policy "own roles" on user_roles for select to authenticated using (user_id = auth.uid() or has_role('super_admin'));
create policy "super manage roles" on user_roles for all to authenticated
  using (has_role('super_admin')) with check (has_role('super_admin'));

-- Daftar pengguna untuk halaman Pengguna & Hak Akses (khusus Super Admin).
create function admin_users()
returns table (id uuid, email text, created_at timestamptz, last_sign_in_at timestamptz, confirmed boolean, roles app_role[])
language plpgsql stable security definer set search_path = public, auth as $$
begin
  if not has_role('super_admin') then raise exception 'Hanya Super Admin'; end if;
  return query
    select u.id, u.email::text, u.created_at, u.last_sign_in_at, u.email_confirmed_at is not null,
           coalesce((select array_agg(r.role order by r.role) from user_roles r where r.user_id = u.id), '{}')
    from auth.users u order by u.created_at;
end $$;
revoke execute on function admin_users() from anon;

drop table admins;

------------------------------------------------------------------------
-- 2. Negara (nama ditampilkan lewat Intl.DisplayNames dalam tiga bahasa)
------------------------------------------------------------------------
create table countries (
  code text primary key check (code ~ '^[A-Z]{2}$'),
  numeric text not null
);
alter table countries enable row level security;
create policy "public read" on countries for select to anon, authenticated using (true);
create policy "super write" on countries for all to authenticated using (has_role('super_admin')) with check (has_role('super_admin'));
insert into countries (code, numeric) values
('AD','020'),
('AE','784'),
('AF','004'),
('AG','028'),
('AI','660'),
('AL','008'),
('AM','051'),
('AO','024'),
('AQ','010'),
('AR','032'),
('AS','016'),
('AT','040'),
('AU','036'),
('AW','533'),
('AX','248'),
('AZ','031'),
('BA','070'),
('BB','052'),
('BD','050'),
('BE','056'),
('BF','854'),
('BG','100'),
('BH','048'),
('BI','108'),
('BJ','204'),
('BL','652'),
('BM','060'),
('BN','096'),
('BO','068'),
('BQ','535'),
('BR','076'),
('BS','044'),
('BT','064'),
('BV','074'),
('BW','072'),
('BY','112'),
('BZ','084'),
('CA','124'),
('CC','166'),
('CD','180'),
('CF','140'),
('CG','178'),
('CH','756'),
('CI','384'),
('CK','184'),
('CL','152'),
('CM','120'),
('CN','156'),
('CO','170'),
('CR','188'),
('CU','192'),
('CV','132'),
('CW','531'),
('CX','162'),
('CY','196'),
('CZ','203'),
('DE','276'),
('DJ','262'),
('DK','208'),
('DM','212'),
('DO','214'),
('DZ','012'),
('EC','218'),
('EE','233'),
('EG','818'),
('EH','732'),
('ER','232'),
('ES','724'),
('ET','231'),
('FI','246'),
('FJ','242'),
('FK','238'),
('FM','583'),
('FO','234'),
('FR','250'),
('GA','266'),
('GB','826'),
('GD','308'),
('GE','268'),
('GF','254'),
('GG','831'),
('GH','288'),
('GI','292'),
('GL','304'),
('GM','270'),
('GN','324'),
('GP','312'),
('GQ','226'),
('GR','300'),
('GS','239'),
('GT','320'),
('GU','316'),
('GW','624'),
('GY','328'),
('HK','344'),
('HM','334'),
('HN','340'),
('HR','191'),
('HT','332'),
('HU','348'),
('ID','360'),
('IE','372'),
('IM','833'),
('IN','356'),
('IO','086'),
('IQ','368'),
('IR','364'),
('IS','352'),
('IT','380'),
('JE','832'),
('JM','388'),
('JO','400'),
('JP','392'),
('KE','404'),
('KG','417'),
('KH','116'),
('KI','296'),
('KM','174'),
('KN','659'),
('KP','408'),
('KR','410'),
('KW','414'),
('KY','136'),
('KZ','398'),
('LA','418'),
('LB','422'),
('LC','662'),
('LI','438'),
('LK','144'),
('LR','430'),
('LS','426'),
('LT','440'),
('LU','442'),
('LV','428'),
('LY','434'),
('MA','504'),
('MC','492'),
('MD','498'),
('ME','499'),
('MF','663'),
('MG','450'),
('MH','584'),
('MK','807'),
('ML','466'),
('MM','104'),
('MN','496'),
('MO','446'),
('MP','580'),
('MQ','474'),
('MR','478'),
('MS','500'),
('MT','470'),
('MU','480'),
('MV','462'),
('MW','454'),
('MX','484'),
('MY','458'),
('MZ','508'),
('NA','516'),
('NC','540'),
('NE','562'),
('NF','574'),
('NG','566'),
('NI','558'),
('NL','528'),
('NO','578'),
('NP','524'),
('NR','520'),
('NU','570'),
('NZ','554'),
('OM','512'),
('PA','591'),
('PE','604'),
('PF','258'),
('PG','598'),
('PH','608'),
('PK','586'),
('PL','616'),
('PM','666'),
('PN','612'),
('PR','630'),
('PS','275'),
('PT','620'),
('PW','585'),
('PY','600'),
('QA','634'),
('RE','638'),
('RO','642'),
('RS','688'),
('RU','643'),
('RW','646'),
('SA','682'),
('SB','090'),
('SC','690'),
('SD','729'),
('SE','752'),
('SG','702'),
('SH','654'),
('SI','705'),
('SJ','744'),
('SK','703'),
('SL','694'),
('SM','674'),
('SN','686'),
('SO','706'),
('SR','740'),
('SS','728'),
('ST','678'),
('SV','222'),
('SX','534'),
('SY','760'),
('SZ','748'),
('TC','796'),
('TD','148'),
('TF','260'),
('TG','768'),
('TH','764'),
('TJ','762'),
('TK','772'),
('TL','626'),
('TM','795'),
('TN','788'),
('TO','776'),
('TR','792'),
('TT','780'),
('TV','798'),
('TW','158'),
('TZ','834'),
('UA','804'),
('UG','800'),
('UM','581'),
('US','840'),
('UY','858'),
('UZ','860'),
('VA','336'),
('VC','670'),
('VE','862'),
('VG','092'),
('VI','850'),
('VN','704'),
('VU','548'),
('WF','876'),
('WS','882'),
('XK','983'),
('YE','887'),
('YT','175'),
('ZA','710'),
('ZM','894'),
('ZW','716')
on conflict (code) do nothing;

------------------------------------------------------------------------
-- 3. Kebijakan tabel lama: ganti "admin all" dengan peran per modul.
--    Pembacaan publik hanya untuk anon (situs publik selalu tanpa sesi).
------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['posts','programs','dpln_chapters','partners','donation_channels','slides','stats','documents'] loop
    execute format('drop policy if exists "admin all" on %I', t);
    execute format('drop policy if exists "public read published" on %I', t);
    execute format('create policy "public read published" on %I for select to anon using (published)', t);
  end loop;
end $$;

create policy "editor manage" on slides for all to authenticated using (has_role('editor')) with check (has_role('editor'));
create policy "editor manage" on stats for all to authenticated using (has_role('editor')) with check (has_role('editor'));
create policy "program manage" on programs for all to authenticated using (has_role('program_admin')) with check (has_role('program_admin'));
create policy "staff read" on programs for select to authenticated using (is_admin());
create policy "finance manage" on donation_channels for all to authenticated using (has_role('finance_admin')) with check (has_role('finance_admin'));
create policy "duln manage" on dpln_chapters for all to authenticated using (has_role('duln_admin')) with check (has_role('duln_admin'));
create policy "duln manage" on partners for all to authenticated using (has_role('duln_admin')) with check (has_role('duln_admin'));
create policy "staff read" on partners for select to authenticated using (is_admin());

------------------------------------------------------------------------
-- 4. Mitra internasional
------------------------------------------------------------------------
alter table partners
  add column country_code text references countries (code),
  add column category text not null default 'NGO'
    check (category in ('NGO', 'Yayasan', 'Pemerintah', 'Kedutaan', 'Universitas', 'Lembaga Pendidikan', 'Organisasi Internasional', 'Swasta', 'Lainnya')),
  add column relation_status text not null default 'Penjajakan'
    check (relation_status in ('Aktif', 'Penjajakan', 'Tidak aktif')),
  add column cooperation_types text[] not null default '{}',
  add column contact_name text not null default '',
  add column contact_email text not null default '',
  add column contact_phone text not null default '',
  add column notes text not null default '',
  add column updated_at timestamptz not null default now();
alter table partners alter column published set default false;

------------------------------------------------------------------------
-- 5. Diplomasi & Relasi: riwayat kunjungan, pertemuan, surat, MoU
------------------------------------------------------------------------
create table relations (
  id uuid primary key default gen_random_uuid(),
  occurred_on date not null default current_date,
  kind text not null default 'Pertemuan'
    check (kind in ('Kunjungan', 'Audiensi', 'Pertemuan', 'Forum', 'Penandatanganan MoU', 'Surat', 'Telepon/Daring')),
  partner_id uuid references partners (id) on delete set null,
  country_code text references countries (code),
  title text not null,
  title_en text not null default '',
  title_ar text not null default '',
  summary text not null default '',
  summary_en text not null default '',
  summary_ar text not null default '',
  follow_up text not null default '',
  follow_up_due date,
  follow_up_done boolean not null default false,
  published boolean not null default false,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table relations enable row level security;
create policy "public read published" on relations for select to anon using (published);
create policy "duln manage" on relations for all to authenticated using (has_role('duln_admin')) with check (has_role('duln_admin'));

------------------------------------------------------------------------
-- 6. DPLN
------------------------------------------------------------------------
alter table dpln_chapters
  add column country_code text references countries (code),
  add column area text not null default '',
  add column area_en text not null default '',
  add column area_ar text not null default '',
  add column org_status text not null default 'Aktif' check (org_status in ('Aktif', 'Pembentukan', 'Tidak aktif')),
  add column activities text not null default '',
  add column activities_en text not null default '',
  add column activities_ar text not null default '',
  add column gallery text[] not null default '{}',
  add column leader_name text not null default '',
  add column contact_email text not null default '',
  add column contact_phone text not null default '',
  add column updated_at timestamptz not null default now();
update dpln_chapters set country_code = case country
  when 'Yaman' then 'YE' when 'Arab Saudi' then 'SA' when 'Malaysia' then 'MY'
  when 'Turki' then 'TR' when 'Mesir' then 'EG' end;

------------------------------------------------------------------------
-- 7. Proyek kemanusiaan, progres, donasi
------------------------------------------------------------------------
create table projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  program_id uuid references programs (id) on delete set null,
  category text not null default 'Lainnya'
    check (category in ('Masjid', 'Sumur & Air Bersih', 'Pangan', 'Ifthar', 'Pendidikan', 'Lainnya')),
  title text not null,
  title_en text not null default '',
  title_ar text not null default '',
  location text not null default '',
  location_en text not null default '',
  location_ar text not null default '',
  country_code text not null default 'ID' references countries (code),
  status text not null default 'Diajukan' check (status in ('Diajukan', 'Disetujui', 'Berjalan', 'Selesai')),
  summary text not null default '',
  summary_en text not null default '',
  summary_ar text not null default '',
  body text not null default '',
  body_en text not null default '',
  body_ar text not null default '',
  budget_target bigint not null default 0,
  progress int not null default 0 check (progress between 0 and 100),
  progress_updated_at timestamptz,
  beneficiaries int not null default 0,
  cover_url text,
  photos_before text[] not null default '{}',
  photos_during text[] not null default '{}',
  photos_after text[] not null default '{}',
  report_url text,
  started_on date,
  completed_on date,
  internal_note text not null default '',
  sort_order int not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table projects enable row level security;
create policy "public read published" on projects for select to anon using (published);
create policy "program manage" on projects for all to authenticated using (has_role('program_admin')) with check (has_role('program_admin'));
create policy "staff read" on projects for select to authenticated using (is_admin());

create table project_updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects (id) on delete cascade,
  reported_on date not null default current_date,
  progress int not null check (progress between 0 and 100),
  note text not null default '',
  note_en text not null default '',
  note_ar text not null default '',
  photos text[] not null default '{}',
  published boolean not null default true,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now()
);
alter table project_updates enable row level security;
create policy "public read published" on project_updates for select to anon
  using (published and exists (select 1 from projects p where p.id = project_id and p.published));
create policy "program manage" on project_updates for all to authenticated using (has_role('program_admin')) with check (has_role('program_admin'));
create policy "staff read" on project_updates for select to authenticated using (is_admin());

-- Progres proyek = laporan progres terbaru (beserta tanggalnya).
create function sync_project_progress() returns trigger
language plpgsql security definer set search_path = public as $$
declare pid uuid := coalesce(new.project_id, old.project_id);
begin
  update projects p set
    progress = coalesce((select u.progress from project_updates u where u.project_id = pid order by u.reported_on desc, u.created_at desc limit 1), p.progress),
    progress_updated_at = (select max(u.reported_on)::timestamptz from project_updates u where u.project_id = pid)
  where p.id = pid;
  return null;
end $$;
create trigger project_updates_sync after insert or update or delete on project_updates
  for each row execute function sync_project_progress();

create table donations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects (id) on delete set null,
  received_on date not null default current_date,
  amount numeric(16, 2) not null check (amount > 0),
  currency text not null default 'IDR' check (currency in ('IDR', 'USD', 'SAR', 'QAR', 'KWD', 'AED', 'MYR', 'TRY', 'EGP', 'EUR')),
  amount_idr bigint not null check (amount_idr > 0),
  donor_name text not null default '',
  channel text not null default '',
  reference text not null default '',
  proof_url text,
  note text not null default '',
  verified boolean not null default false,
  verified_by uuid references auth.users (id),
  verified_at timestamptz,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now()
);
alter table donations enable row level security;
create policy "finance manage" on donations for all to authenticated using (has_role('finance_admin')) with check (has_role('finance_admin'));
create policy "program read" on donations for select to authenticated using (has_role('program_admin'));

-- Verifikator & waktunya dicatat otomatis.
create function stamp_verification() returns trigger
language plpgsql as $$
begin
  if new.verified and (tg_op = 'INSERT' or not old.verified) then
    new.verified_by := auth.uid(); new.verified_at := now();
  elsif not new.verified then
    new.verified_by := null; new.verified_at := null;
  end if;
  return new;
end $$;
create trigger donations_verify before insert or update on donations
  for each row execute function stamp_verification();

-- Hanya total dana TERVERIFIKASI yang terlihat publik.
create view project_funding with (security_invoker = false) as
  select project_id, sum(amount_idr)::bigint as raised, max(verified_at) as verified_at
  from donations where verified and project_id is not null group by project_id;
grant select on project_funding to anon, authenticated;

------------------------------------------------------------------------
-- 8. Berita: kategori yang bisa ditambah dan alur draf → tinjau → terbit
------------------------------------------------------------------------
create table post_categories (
  slug text primary key,
  name text not null,
  name_en text not null default '',
  name_ar text not null default '',
  sort_order int not null default 0
);
alter table post_categories enable row level security;
create policy "public read" on post_categories for select to anon, authenticated using (true);
create policy "editor manage" on post_categories for all to authenticated using (has_role('editor')) with check (has_role('editor'));
insert into post_categories (slug, name, name_en, name_ar, sort_order) values
  ('Diplomasi', 'Diplomasi', 'Diplomacy', 'الدبلوماسية', 1),
  ('Kerja Sama', 'Kerja Sama', 'Cooperation', 'التعاون', 2),
  ('Kemanusiaan', 'Peduli Ummat', 'Ummah Care', 'رعاية الأمة', 3),
  ('DPLN', 'DPLN', 'Overseas Chapters', 'الفروع الخارجية', 4),
  ('Kegiatan', 'Kegiatan', 'Activities', 'الأنشطة', 5);

alter table posts alter column category type text using category::text;
alter table posts add constraint posts_category_fkey foreign key (category) references post_categories (slug) on update cascade;
drop type post_category;

alter table posts add column status text not null default 'draft' check (status in ('draft', 'review', 'published'));
update posts set status = case when published then 'published' else 'draft' end;
create function sync_post_published() returns trigger language plpgsql as $$
begin new.published := new.status = 'published'; return new; end $$;
create trigger posts_status before insert or update on posts for each row execute function sync_post_published();

-- Semua staf penulis boleh membuat draf; hanya Editor yang boleh menerbitkan.
create policy "writers read" on posts for select to authenticated using (has_role('editor', 'duln_admin', 'program_admin'));
create policy "writers insert" on posts for insert to authenticated
  with check (has_role('editor', 'duln_admin', 'program_admin') and (status <> 'published' or has_role('editor')));
create policy "writers update" on posts for update to authenticated
  using (has_role('editor', 'duln_admin', 'program_admin') and (status <> 'published' or has_role('editor')))
  with check (has_role('editor', 'duln_admin', 'program_admin') and (status <> 'published' or has_role('editor')));
create policy "editor delete" on posts for delete to authenticated using (has_role('editor'));

------------------------------------------------------------------------
-- 9. Pesan kemitraan dari formulir publik
------------------------------------------------------------------------
create table inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) between 2 and 120),
  organization text not null default '' check (length(organization) <= 200),
  country_code text references countries (code),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and length(email) <= 200),
  phone text not null default '' check (length(phone) <= 40),
  interest text not null default 'Lainnya'
    check (interest in ('Kemanusiaan', 'Pendidikan', 'Dakwah', 'Diplomasi', 'Donasi', 'Lainnya')),
  message text not null check (length(message) between 10 and 5000),
  lang text not null default 'id',
  status text not null default 'Baru' check (status in ('Baru', 'Ditinjau', 'Dihubungi', 'Diskusi', 'Selesai')),
  internal_note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table inquiries enable row level security;
create policy "public submit" on inquiries for insert to anon with check (status = 'Baru' and internal_note = '');
create policy "duln manage" on inquiries for all to authenticated using (has_role('duln_admin')) with check (has_role('duln_admin'));

------------------------------------------------------------------------
-- 10. Kolom internal tidak bisa dibaca publik (hak akses per kolom)
------------------------------------------------------------------------
revoke select on partners from anon;
grant select (id, name, name_en, name_ar, country, country_en, country_ar, country_code, website, logo_url, category,
  relation_status, cooperation_types, sort_order, published, sample) on partners to anon;
revoke select on dpln_chapters from anon;
grant select (id, country, country_en, country_ar, city, city_en, city_ar, note, note_en, note_ar, country_code,
  area, area_en, area_ar, org_status, activities, activities_en, activities_ar, gallery, sort_order, published, sample) on dpln_chapters to anon;
revoke select on relations from anon;
grant select (id, occurred_on, kind, partner_id, country_code, title, title_en, title_ar, summary, summary_en, summary_ar, published) on relations to anon;
revoke select on projects from anon;
grant select (id, slug, program_id, category, title, title_en, title_ar, location, location_en, location_ar, country_code, status,
  summary, summary_en, summary_ar, body, body_en, body_ar, budget_target, progress, progress_updated_at, beneficiaries,
  cover_url, photos_before, photos_during, photos_after, report_url, started_on, completed_on, sort_order, published) on projects to anon;
revoke select, update, delete on inquiries from anon;
revoke all on donations from anon;

------------------------------------------------------------------------
-- 11. Statistik: manual, atau dihitung otomatis dari database
------------------------------------------------------------------------
alter table stats add column source text not null default 'manual'
  check (source in ('manual', 'partner_countries', 'partners', 'dpln', 'programs', 'projects', 'mosques', 'wells', 'beneficiaries'));

create view live_stats with (security_invoker = false) as
  select 'partner_countries'::text as source, count(distinct country_code)::bigint as value from partners where relation_status = 'Aktif' and country_code is not null
  union all select 'partners', count(*) from partners where relation_status = 'Aktif'
  union all select 'dpln', count(*) from dpln_chapters where published and org_status = 'Aktif'
  union all select 'programs', count(*) from programs where published
  union all select 'projects', count(*) from projects where published and status in ('Berjalan', 'Selesai')
  union all select 'mosques', count(*) from projects where published and status = 'Selesai' and category = 'Masjid'
  union all select 'wells', count(*) from projects where published and status = 'Selesai' and category = 'Sumur & Air Bersih'
  union all select 'beneficiaries', coalesce(sum(beneficiaries), 0) from projects where published and status in ('Berjalan', 'Selesai');
grant select on live_stats to anon, authenticated;

------------------------------------------------------------------------
-- 12. Dokumen publik & internal, bucket privat
------------------------------------------------------------------------
alter table documents
  add column visibility text not null default 'Publik' check (visibility in ('Publik', 'Internal')),
  add column partner_id uuid references partners (id) on delete set null,
  add column project_id uuid references projects (id) on delete set null,
  add column dpln_id uuid references dpln_chapters (id) on delete set null,
  add column created_at timestamptz not null default now();
alter table documents drop constraint documents_kind_check;
alter table documents add constraint documents_kind_check
  check (kind in ('Legalitas', 'Laporan', 'MoU', 'Proposal', 'Korespondensi', 'Lainnya'));
drop policy "public read published" on documents;
create policy "public read published" on documents for select to anon using (published and visibility = 'Publik');
create policy "staff manage" on documents for all to authenticated using (is_admin()) with check (is_admin());

insert into storage.buckets (id, name, public) values ('internal', 'internal', false) on conflict (id) do nothing;
create policy "staff read internal" on storage.objects for select to authenticated using (bucket_id = 'internal' and public.is_admin());
create policy "staff upload internal" on storage.objects for insert to authenticated with check (bucket_id = 'internal' and public.is_admin());
create policy "staff update internal" on storage.objects for update to authenticated using (bucket_id = 'internal' and public.is_admin());
create policy "staff delete internal" on storage.objects for delete to authenticated using (bucket_id = 'internal' and public.is_admin());

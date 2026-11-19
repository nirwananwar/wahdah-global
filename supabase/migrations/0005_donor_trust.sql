-- Kebutuhan donatur (termasuk luar negeri): biaya & target dana program,
-- saluran donasi internasional, serta dokumen legalitas dan laporan.

-- Program: biaya per unit (teks, mis. "1 sumur ≈ USD 1.500") dan target dana (Rupiah).
alter table programs add column unit_cost text not null default '';
alter table programs add column unit_cost_en text not null default '';
alter table programs add column unit_cost_ar text not null default '';
alter table programs add column funding_target bigint not null default 0;
alter table programs add column funding_raised bigint not null default 0;

-- Saluran donasi untuk transfer dari luar negeri (SWIFT, PayPal, dll.).
alter table donation_channels add column international boolean not null default false;

-- Dokumen legalitas & laporan yang bisa diunduh pengunjung.
create table documents (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'Legalitas' check (kind in ('Legalitas', 'Laporan')),
  title text not null,
  title_en text not null default '',
  title_ar text not null default '',
  note text not null default '',
  note_en text not null default '',
  note_ar text not null default '',
  file_url text,
  sort_order int not null default 0,
  published boolean not null default true,
  sample boolean not null default false
);
alter table documents enable row level security;
create policy "public read published" on documents for select to anon, authenticated using (published);
create policy "admin all" on documents for all to authenticated using (is_admin()) with check (is_admin());

-- Foto dokumentasi utama per DPLN, dengan judul & caption (tiga bahasa).
alter table dpln_chapters
  add column photo_url text,
  add column photo_title text not null default '',
  add column photo_title_en text not null default '',
  add column photo_title_ar text not null default '',
  add column photo_caption text not null default '',
  add column photo_caption_en text not null default '',
  add column photo_caption_ar text not null default '';
-- Kolom publik (dpln_chapters memakai hak akses per kolom untuk anon).
grant select (photo_url, photo_title, photo_title_en, photo_title_ar,
  photo_caption, photo_caption_en, photo_caption_ar) on dpln_chapters to anon;

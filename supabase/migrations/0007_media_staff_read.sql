-- Staf perlu bisa membaca baris storage.objects di bucket `media` agar
-- penghapusan berkas lewat Storage API berfungsi (API membaca dulu, lalu menghapus).
create policy "staff read media" on storage.objects for select to authenticated
  using (bucket_id = 'media' and public.is_admin());

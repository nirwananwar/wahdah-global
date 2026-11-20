"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { resources, slugify } from "@/lib/admin-resources";
import { allowed, roles as roleList, type Role } from "@/lib/roles";
import { PRIVATE_PREFIX } from "@/lib/storage";
import { requireStaff, sessionClient } from "@/lib/supabase-server";
import { isSupabaseConfigured, supabaseKey, supabaseUrl } from "@/lib/supabase";

export async function login(formData: FormData) {
  if (!isSupabaseConfigured) redirect("/admin/login?error=db");
  const db = await sessionClient();
  const { error } = await db.auth.signInWithPassword({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (error) redirect("/admin/login?error=login");
  redirect("/admin");
}

export async function logout() {
  const db = await sessionClient();
  await db.auth.signOut();
  redirect("/admin/login");
}

export async function save(key: string, id: string, formData: FormData) {
  const resource = resources[key];
  if (!resource) redirect("/admin");
  const { db, roles } = await requireStaff(resource.roles);
  const idField = resource.idField ?? "id";
  const back = id === "baru" ? `/admin/${key}/baru` : `/admin/${key}/${encodeURIComponent(id)}`;
  const fail = (message: string): never => redirect(`${back}?error=${encodeURIComponent(message)}`);

  const row: Record<string, unknown> = {};
  for (const field of resource.fields) {
    const raw = formData.get(field.name);
    switch (field.type) {
      case "checkbox":
        row[field.name] = raw === "on";
        break;
      case "number":
        if (field.required && (raw == null || String(raw).trim() === "")) fail(`${field.label} wajib diisi.`);
        row[field.name] = Number(String(raw ?? "").replace(/[^\d.-]/g, "")) || 0;
        break;
      case "date":
        if (resource.table === "posts") {
          row[field.name] = raw ? `${String(raw)}T00:00:00Z` : new Date().toISOString();
        } else {
          row[field.name] = raw ? String(raw) : null;
        }
        break;
      case "tags":
        row[field.name] = formData
          .getAll(field.name)
          .map(String)
          .filter((v) => field.options?.includes(v));
        break;
      case "country":
      case "relation": {
        const v = String(raw ?? "").trim();
        if (field.required && !v) fail(`${field.label} wajib dipilih.`);
        row[field.name] = v || null;
        break;
      }
      case "image":
      case "file":
        if (raw instanceof File && raw.size > 0) {
          if (raw.size > 4 * 1024 * 1024) fail("Berkas lebih dari 4 MB.");
          const internal = field.private || formData.get("visibility") === "Internal";
          const ext = raw.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
          const path = `${resource.table}/${crypto.randomUUID()}.${ext}`;
          const bucket = internal ? "internal" : "media";
          const { error } = await db.storage
            .from(bucket)
            .upload(path, raw, { contentType: raw.type || undefined });
          if (error) fail(`Gagal mengunggah berkas: ${error.message}`);
          row[field.name] = internal
            ? `${PRIVATE_PREFIX}${path}`
            : db.storage.from("media").getPublicUrl(path).data.publicUrl;
        } else if (formData.get(`${field.name}__remove`) === "on") {
          row[field.name] = null;
        }
        break;
      case "gallery": {
        // Daftar URL hasil unggahan dari browser; hanya terima gambar di bucket kita.
        const prefix = `${supabaseUrl}/storage/v1/object/public/media/`;
        let list: unknown = [];
        try {
          list = JSON.parse(String(raw ?? "[]"));
        } catch {
          fail("Data galeri tidak valid.");
        }
        row[field.name] = Array.isArray(list)
          ? list.filter((u): u is string => typeof u === "string" && u.startsWith(prefix))
          : [];
        break;
      }
      default: {
        const text = String(raw ?? "").trim();
        if (field.required && !text) fail(`${field.label} wajib diisi.`);
        row[field.name] = text;
      }
    }
  }

  for (const field of resource.fields.filter((f) => f.translatable)) {
    for (const lang of ["en", "ar"]) {
      const column = `${field.name}_${lang}`;
      row[column] = String(formData.get(column) ?? "").trim();
    }
  }

  // Hanya Editor yang boleh menerbitkan berita; penulis lain otomatis "review".
  let note = "";
  if (resource.table === "posts" && row.status === "published" && !allowed(roles, ["editor"])) {
    row.status = "review";
    note = "Berita diajukan untuk ditinjau Editor.";
  }
  if (resource.table === "project_updates") {
    const p = Number(row.progress);
    if (p < 0 || p > 100) fail("Progres harus 0–100.");
  }

  if (resource.hasSlug) {
    row.slug = slugify(String(row.slug || row[resource.titleField]));
    if (!row.slug) fail("Alamat (slug) tidak valid.");
  }
  if (resource.touch) row.updated_at = new Date().toISOString();

  const query =
    id === "baru"
      ? db.from(resource.table).insert(row)
      : db.from(resource.table).update(row).eq(idField, id);
  const { error } = await query;
  if (error) {
    fail(
      error.code === "23505"
        ? "Data dengan kode/alamat yang sama sudah ada."
        : error.code === "42501"
          ? "Peran Anda tidak mengizinkan perubahan ini."
          : error.message,
    );
  }

  updateTag("content");
  redirect(`/admin/${key}?ok=1${note ? `&info=${encodeURIComponent(note)}` : ""}`);
}

export async function remove(key: string, id: string) {
  const resource = resources[key];
  if (!resource) redirect("/admin");
  const { db } = await requireStaff(resource.roles);
  const { error } = await db
    .from(resource.table)
    .delete()
    .eq(resource.idField ?? "id", id);
  if (error) {
    redirect(`/admin/${key}/${encodeURIComponent(id)}?error=${encodeURIComponent(error.message)}`);
  }
  updateTag("content");
  redirect(`/admin/${key}?ok=1`);
}

/* ---------------- Pengguna & Hak Akses (khusus Super Admin) ---------------- */

const userBack = (msg: string, kind: "ok" | "error" = "ok"): never =>
  redirect(`/admin/pengguna?${kind}=${encodeURIComponent(msg)}`);

/** Simpan peran satu user (hapus yang tidak dicentang, tambah yang baru). */
export async function setUserRoles(userId: string, formData: FormData) {
  const { db, user } = await requireStaff(["super_admin"]);
  const chosen = formData.getAll("roles").map(String).filter((r): r is Role =>
    (roleList as readonly string[]).includes(r),
  );
  if (userId === user.id && !chosen.includes("super_admin")) {
    userBack("Anda tidak bisa mencabut peran Super Admin milik sendiri.", "error");
  }
  const { error: delError } = await db.from("user_roles").delete().eq("user_id", userId);
  if (delError) userBack(delError.message, "error");
  if (chosen.length) {
    const { error } = await db
      .from("user_roles")
      .insert(chosen.map((role) => ({ user_id: userId, role })));
    if (error) userBack(error.message, "error");
  }
  userBack(chosen.length ? "Peran diperbarui." : "Akses pengguna dicabut.");
}

/** Daftarkan staf baru (email + kata sandi), lalu beri peran. */
export async function addUser(formData: FormData) {
  const { db } = await requireStaff(["super_admin"]);
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const chosen = formData.getAll("roles").map(String).filter((r): r is Role =>
    (roleList as readonly string[]).includes(r),
  );
  if (!email || password.length < 8) userBack("Isi email dan kata sandi minimal 8 karakter.", "error");
  if (!chosen.length) userBack("Pilih minimal satu peran.", "error");

  // Klien tanpa sesi: mendaftar tidak boleh mengganti sesi Super Admin yang sedang login.
  const anon = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await anon.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${siteUrl()}/admin/login` },
  });
  let userId = data.user?.id;
  if (error || !userId || !data.user?.identities?.length) {
    // Sudah terdaftar: cari di daftar user.
    const { data: list } = await db.rpc("admin_users");
    userId = (list as { id: string; email: string }[] | null)?.find((u) => u.email === email)?.id;
    if (!userId) userBack(error?.message ?? "Gagal mendaftarkan pengguna.", "error");
  }
  const { error: roleError } = await db
    .from("user_roles")
    .upsert(chosen.map((role) => ({ user_id: userId, role })));
  if (roleError) userBack(roleError.message, "error");
  userBack(
    `Pengguna ${email} ditambahkan. Bila baru mendaftar, ia perlu mengklik tautan konfirmasi di emailnya sebelum bisa masuk.`,
  );
}

function siteUrl() {
  return process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000";
}

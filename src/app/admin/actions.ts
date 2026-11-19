"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { resources, slugify } from "@/lib/admin-resources";
import { requireAdmin, sessionClient } from "@/lib/supabase-server";
import { isSupabaseConfigured, supabaseUrl } from "@/lib/supabase";

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
  const db = await requireAdmin();
  const fail = (message: string): never =>
    redirect(`/admin/${key}/${id}?error=${encodeURIComponent(message)}`);

  const row: Record<string, unknown> = {};
  for (const field of resource.fields) {
    const raw = formData.get(field.name);
    switch (field.type) {
      case "checkbox":
        row[field.name] = raw === "on";
        break;
      case "number":
        row[field.name] = Number(raw) || 0;
        break;
      case "date":
        row[field.name] = raw
          ? `${String(raw)}T00:00:00Z`
          : new Date().toISOString();
        break;
      case "image":
      case "file":
        if (raw instanceof File && raw.size > 0) {
          const ext = raw.name.split(".").pop()?.toLowerCase() || "jpg";
          const path = `${resource.table}/${crypto.randomUUID()}.${ext}`;
          const { error } = await db.storage
            .from("media")
            .upload(path, raw, { contentType: raw.type });
          if (error) fail(`Gagal mengunggah berkas: ${error.message}`);
          row[field.name] = db.storage.from("media").getPublicUrl(path).data
            .publicUrl;
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
          ? list.filter(
              (u): u is string => typeof u === "string" && u.startsWith(prefix),
            )
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

  if (resource.hasSlug) {
    row.slug = slugify(String(row.slug || row[resource.titleField]));
    if (!row.slug) fail("Alamat (slug) tidak valid.");
  }
  if (resource.touch) row.updated_at = new Date().toISOString();

  const query =
    id === "baru"
      ? db.from(resource.table).insert(row)
      : db.from(resource.table).update(row).eq("id", id);
  const { error } = await query;
  if (error) {
    fail(
      error.code === "23505"
        ? "Alamat (slug) sudah dipakai entri lain."
        : error.message,
    );
  }

  updateTag("content");
  redirect(`/admin/${key}?ok=1`);
}

export async function remove(key: string, id: string) {
  const resource = resources[key];
  if (!resource) redirect("/admin");
  const db = await requireAdmin();
  const { error } = await db.from(resource.table).delete().eq("id", id);
  if (error) {
    redirect(`/admin/${key}/${id}?error=${encodeURIComponent(error.message)}`);
  }
  updateTag("content");
  redirect(`/admin/${key}?ok=1`);
}

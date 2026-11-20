import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { allowed, type Role } from "./roles";
import { isSupabaseConfigured, supabaseKey, supabaseUrl } from "./supabase";

/** Klien dengan sesi pengguna (cookie) — untuk panel admin. */
export async function sessionClient() {
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Dipanggil dari Server Component: cookie diperbarui oleh proxy.ts.
        }
      },
    },
  });
}

/**
 * Pastikan pengunjung login DAN memegang peran staf; selain itu alihkan ke login.
 * Bila `permitted` diberikan, peran user harus termasuk di dalamnya.
 */
export async function requireStaff(permitted?: readonly Role[]) {
  if (!isSupabaseConfigured) redirect("/admin/login?error=db");
  // Halaman admin selalu per request: sesi Supabase memakai waktu saat ini,
  // yang tidak boleh terjadi saat Next.js mencoba prerender.
  await connection();
  const db = await sessionClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data } = await db.rpc("my_roles");
  const roles = (data ?? []) as Role[];
  if (!roles.length) redirect("/admin/login?error=akses");
  if (permitted && !allowed(roles, permitted)) redirect("/admin?error=akses");
  return { db, roles, user };
}

/** Kompatibilitas: cukup login sebagai staf. */
export async function requireAdmin() {
  return (await requireStaff()).db;
}

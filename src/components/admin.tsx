import Link from "next/link";
import type { ReactNode } from "react";
import { logout } from "@/app/admin/actions";
import { groups, resources } from "@/lib/admin-resources";
import { allowed, roleInfo, type Role } from "@/lib/roles";

const item = (active: boolean) =>
  `block rounded-lg px-3 py-2 text-sm font-semibold ${
    active ? "bg-brand-700 text-white" : "text-ink/80 hover:bg-brand-50 hover:text-brand-700"
  }`;

/** Kerangka panel admin: menu samping sesuai peran user, lalu isi halaman. */
export function AdminShell({
  active,
  roles,
  email,
  children,
}: {
  active: string;
  roles: readonly Role[];
  email?: string;
  children: ReactNode;
}) {
  const visible = Object.entries(resources).filter(([, r]) =>
    allowed(roles, r.roles),
  );
  return (
    <div className="grid gap-8 lg:grid-cols-[230px_1fr]">
      <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-2xl border border-line bg-white p-4">
          <p className="truncate text-sm font-semibold">{email}</p>
          <p className="mt-1 text-xs text-muted">
            {roles.map((r) => roleInfo[r].name).join(" · ")}
          </p>
          <form action={logout} className="mt-3">
            <button className="text-xs font-semibold text-brand-700 hover:underline">
              Keluar
            </button>
          </form>
        </div>
        <nav className="space-y-5">
          <Link href="/admin" className={item(active === "dashboard")}>
            Dashboard
          </Link>
          {groups.map((g) => {
            const list = visible.filter(([, r]) => r.group === g);
            if (!list.length) return null;
            return (
              <div key={g}>
                <p className="px-3 text-xs font-semibold uppercase tracking-widest text-muted">
                  {g}
                </p>
                <div className="mt-1.5 space-y-0.5">
                  {list.map(([key, r]) => (
                    <Link key={key} href={`/admin/${key}`} className={item(key === active)}>
                      {r.label}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
          {roles.includes("super_admin") && (
            <div>
              <p className="px-3 text-xs font-semibold uppercase tracking-widest text-muted">
                Pengaturan
              </p>
              <div className="mt-1.5">
                <Link href="/admin/pengguna" className={item(active === "pengguna")}>
                  Pengguna & Hak Akses
                </Link>
              </div>
            </div>
          )}
        </nav>
      </aside>
      <main className="min-w-0">{children}</main>
    </div>
  );
}

export function Notice({ kind = "ok", children }: { kind?: "ok" | "error"; children: ReactNode }) {
  return (
    <p
      className={`rounded-xl px-4 py-3 text-sm ${
        kind === "ok" ? "bg-brand-50 text-brand-700" : "bg-red-50 text-red-700"
      }`}
    >
      {children}
    </p>
  );
}

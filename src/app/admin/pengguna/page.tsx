import { AdminShell, Notice } from "@/components/admin";
import { roleInfo, roles as roleList, type Role } from "@/lib/roles";
import { requireStaff } from "@/lib/supabase-server";
import { addUser, setUserRoles } from "../actions";

type AdminUser = {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  confirmed: boolean;
  roles: Role[];
};

function RoleChecks({ current }: { current: Role[] }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {roleList.map((r) => (
        <label
          key={r}
          className="flex items-start gap-2 rounded-xl border border-line p-3 text-sm has-checked:border-brand-500 has-checked:bg-brand-50"
        >
          <input type="checkbox" name="roles" value={r} defaultChecked={current.includes(r)} className="mt-0.5 size-4 accent-brand-700" />
          <span>
            <span className="block font-semibold">{roleInfo[r].name}</span>
            <span className="text-xs text-muted">{roleInfo[r].desc}</span>
          </span>
        </label>
      ))}
    </div>
  );
}

export default async function Page({ searchParams }: PageProps<"/admin/pengguna">) {
  const { db, roles, user } = await requireStaff(["super_admin"]);
  const { ok, error } = await searchParams;
  const { data, error: loadError } = await db.rpc("admin_users");
  const users = (data ?? []) as AdminUser[];
  const fmt = (v: string | null) => (v ? new Date(v).toLocaleString("id-ID") : "belum pernah");

  return (
    <AdminShell active="pengguna" roles={roles} email={user.email}>
      <h2 className="font-display text-2xl">Pengguna & Hak Akses</h2>
      <p className="mt-1 max-w-3xl text-sm text-muted">
        Pengguna tanpa peran tidak bisa masuk panel admin. Hak akses ditegakkan di database,
        jadi pengguna hanya bisa membaca dan mengubah modul sesuai perannya.
      </p>
      <div className="mt-4 space-y-3">
        {typeof ok === "string" && <Notice>{ok}</Notice>}
        {typeof error === "string" && <Notice kind="error">{error}</Notice>}
        {loadError && <Notice kind="error">{loadError.message}</Notice>}
      </div>

      <div className="mt-6 space-y-4">
        {users.map((u) => (
          <form key={u.id} action={setUserRoles.bind(null, u.id)} className="rounded-2xl border border-line bg-white p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-semibold">
                {u.email} {u.id === user.id && <span className="text-xs text-muted">(Anda)</span>}
              </p>
              <p className="text-xs text-muted">
                {u.confirmed ? `Login terakhir: ${fmt(u.last_sign_in_at)}` : "Belum konfirmasi email"}
              </p>
            </div>
            <div className="mt-4">
              <RoleChecks current={u.roles} />
            </div>
            <button className="mt-4 rounded-full bg-brand-700 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-900">
              Simpan peran
            </button>
          </form>
        ))}
      </div>

      <form action={addUser} className="mt-10 max-w-2xl space-y-4 rounded-2xl border border-line bg-white p-5">
        <h3 className="font-display text-xl">Tambah pengguna</h3>
        <label className="block text-sm font-semibold">
          Email
          <input name="email" type="email" required className="mt-1 w-full rounded-xl border border-line px-4 py-2.5 font-normal" />
        </label>
        <label className="block text-sm font-semibold">
          Kata sandi awal (min. 8 karakter)
          <input name="password" type="text" minLength={8} required className="mt-1 w-full rounded-xl border border-line px-4 py-2.5 font-normal" />
          <span className="mt-1 block text-xs font-normal text-muted">
            Sampaikan kepada pengguna secara pribadi. Pengguna baru menerima email konfirmasi dan harus
            mengkliknya sebelum bisa masuk.
          </span>
        </label>
        <RoleChecks current={[]} />
        <button className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-brand-900 hover:bg-accent-dark hover:text-white">
          Tambah pengguna
        </button>
      </form>
    </AdminShell>
  );
}

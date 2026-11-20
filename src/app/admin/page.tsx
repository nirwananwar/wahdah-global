import Link from "next/link";
import { AdminShell, Notice } from "@/components/admin";
import { allowed } from "@/lib/roles";
import { requireStaff } from "@/lib/supabase-server";

const tiles: { source: string; label: string; href: string }[] = [
  { source: "partner_countries", label: "Negara mitra", href: "/admin/mitra?relation_status=Aktif" },
  { source: "partners", label: "Mitra aktif", href: "/admin/mitra?relation_status=Aktif" },
  { source: "dpln", label: "DPLN aktif", href: "/admin/dpln" },
  { source: "programs", label: "Program Peduli Ummat", href: "/admin/program" },
  { source: "projects", label: "Proyek berjalan & selesai", href: "/admin/proyek" },
  { source: "mosques", label: "Masjid selesai dibangun", href: "/admin/proyek?category=Masjid&status=Selesai" },
  { source: "wells", label: "Sumur selesai dibangun", href: "/admin/proyek?category=Sumur+%26+Air+Bersih&status=Selesai" },
  { source: "beneficiaries", label: "Penerima manfaat", href: "/admin/proyek" },
];

const card = "rounded-2xl border border-line bg-white p-5";
const fmtDate = (v: unknown) => (v ? new Date(String(v)).toLocaleDateString("id-ID") : "");

export default async function Page({ searchParams }: PageProps<"/admin">) {
  const { db, roles, user } = await requireStaff();
  const { error } = await searchParams;
  const can = (...r: Parameters<typeof allowed>[1]) => allowed(roles, r);

  const [live, news, inquiries, followUps, unverified, verified] = await Promise.all([
    db.from("live_stats").select("source, value"),
    can("editor", "duln_admin", "program_admin")
      ? db.from("posts").select("id, title, status, published_at").order("updated_at", { ascending: false }).limit(5)
      : null,
    can("duln_admin")
      ? db.from("inquiries").select("id, name, organization, interest, created_at", { count: "exact" }).eq("status", "Baru").order("created_at", { ascending: false }).limit(5)
      : null,
    can("duln_admin")
      ? db.from("relations").select("id, title, follow_up, follow_up_due").eq("follow_up_done", false).not("follow_up_due", "is", null).order("follow_up_due").limit(5)
      : null,
    can("finance_admin")
      ? db.from("donations").select("id", { count: "exact", head: true }).eq("verified", false)
      : null,
    can("finance_admin", "program_admin")
      ? db.from("donations").select("amount_idr").eq("verified", true).gte("received_on", `${new Date().getFullYear()}-01-01`)
      : null,
  ]);
  const value = (source: string) =>
    Number((live.data ?? []).find((r) => r.source === source)?.value ?? 0);
  const yearTotal = (verified?.data ?? []).reduce((sum, r) => sum + Number(r.amount_idr), 0);

  return (
    <AdminShell active="dashboard" roles={roles} email={user.email}>
      <h2 className="font-display text-2xl">Dashboard</h2>
      <p className="mt-1 text-sm text-muted">
        Angka dihitung langsung dari database (hanya data yang terbit atau berstatus aktif).
      </p>
      {error === "akses" && (
        <div className="mt-4">
          <Notice kind="error">Peran Anda tidak mengizinkan membuka halaman itu.</Notice>
        </div>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((t) => (
          <Link key={t.source} href={t.href} className={`${card} hover:border-brand-500`}>
            <p className="font-display text-3xl text-brand-700">{value(t.source).toLocaleString("id-ID")}</p>
            <p className="mt-1 text-sm text-muted">{t.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        {inquiries && (
          <section className={card}>
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display text-lg">
                Pesan kemitraan baru{" "}
                <span className="rounded-full bg-accent px-2 py-0.5 text-sm text-brand-900">{inquiries.count ?? 0}</span>
              </h3>
              <Link href="/admin/pesan?status=Baru" className="text-sm font-semibold text-brand-700 hover:underline">
                Lihat semua
              </Link>
            </div>
            <ul className="mt-3 divide-y divide-line text-sm">
              {(inquiries.data ?? []).map((m) => (
                <li key={m.id} className="py-2">
                  <Link href={`/admin/pesan/${m.id}`} className="flex justify-between gap-3 hover:text-brand-700">
                    <span className="truncate font-semibold">{m.organization || m.name}</span>
                    <span className="shrink-0 text-muted">{m.interest} · {fmtDate(m.created_at)}</span>
                  </Link>
                </li>
              ))}
              {!inquiries.data?.length && <li className="py-2 text-muted">Tidak ada pesan baru.</li>}
            </ul>
          </section>
        )}

        {followUps && (
          <section className={card}>
            <h3 className="font-display text-lg">Tindak lanjut relasi</h3>
            <ul className="mt-3 divide-y divide-line text-sm">
              {(followUps.data ?? []).map((r) => (
                <li key={r.id} className="py-2">
                  <Link href={`/admin/relasi/${r.id}`} className="flex justify-between gap-3 hover:text-brand-700">
                    <span className="truncate font-semibold">{r.title}</span>
                    <span className={`shrink-0 ${new Date(r.follow_up_due) < new Date() ? "font-semibold text-red-700" : "text-muted"}`}>
                      {fmtDate(r.follow_up_due)}
                    </span>
                  </Link>
                </li>
              ))}
              {!followUps.data?.length && <li className="py-2 text-muted">Tidak ada tindak lanjut tertunda.</li>}
            </ul>
          </section>
        )}

        {news && (
          <section className={card}>
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display text-lg">Berita terbaru</h3>
              <Link href="/admin/berita" className="text-sm font-semibold text-brand-700 hover:underline">
                Kelola
              </Link>
            </div>
            <ul className="mt-3 divide-y divide-line text-sm">
              {(news.data ?? []).map((p) => (
                <li key={p.id} className="py-2">
                  <Link href={`/admin/berita/${p.id}`} className="flex justify-between gap-3 hover:text-brand-700">
                    <span className="truncate font-semibold">{p.title}</span>
                    <span className="shrink-0 text-muted">
                      {{ draft: "Draf", review: "Tinjau", published: "Terbit" }[p.status as string]} · {fmtDate(p.published_at)}
                    </span>
                  </Link>
                </li>
              ))}
              {!news.data?.length && <li className="py-2 text-muted">Belum ada berita.</li>}
            </ul>
          </section>
        )}

        {(unverified || verified) && (
          <section className={card}>
            <h3 className="font-display text-lg">Donasi</h3>
            <dl className="mt-3 grid grid-cols-2 gap-4 text-sm">
              {verified && (
                <div>
                  <dt className="text-muted">Terverifikasi tahun ini</dt>
                  <dd className="font-display text-xl text-brand-700">Rp {yearTotal.toLocaleString("id-ID")}</dd>
                </div>
              )}
              {unverified && (
                <div>
                  <dt className="text-muted">Menunggu verifikasi</dt>
                  <dd className="font-display text-xl text-brand-700">
                    <Link href="/admin/donasi" className="hover:underline">{unverified.count ?? 0} catatan</Link>
                  </dd>
                </div>
              )}
            </dl>
          </section>
        )}
      </div>
    </AdminShell>
  );
}

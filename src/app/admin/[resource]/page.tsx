import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell, Notice } from "@/components/admin";
import { resources, type Field } from "@/lib/admin-resources";
import { countryName } from "@/lib/countries";
import { requireStaff } from "@/lib/supabase-server";
import { loadOptions } from "../options";

type Row = Record<string, unknown>;

const badgeText = (key: string, value: unknown) => {
  if (key === "published") return value ? "Terbit" : "Draf";
  if (key === "verified") return value ? "Terverifikasi" : "Belum diverifikasi";
  if (key === "status")
    return ({ draft: "Draf", review: "Tinjau", published: "Terbit" } as Record<string, string>)[
      String(value)
    ] ?? String(value ?? "");
  return String(value ?? "");
};
const badgeOn = (key: string, value: unknown) =>
  key === "published" || key === "verified"
    ? Boolean(value)
    : ["published", "Selesai", "Berjalan", "Aktif"].includes(String(value));

export default async function Page({
  params,
  searchParams,
}: PageProps<"/admin/[resource]">) {
  const { resource: key } = await params;
  const resource = resources[key];
  if (!resource) notFound();

  const { db, roles, user } = await requireStaff(resource.roles);
  const query = await searchParams;
  const q = typeof query.q === "string" ? query.q.trim() : "";
  const idField = resource.idField ?? "id";
  const filterFields = (resource.filters ?? [])
    .map((name) => resource.fields.find((f) => f.name === name))
    .filter((f): f is Field => Boolean(f));

  let request = db
    .from(resource.table)
    .select("*")
    .order(resource.orderBy.column, { ascending: resource.orderBy.ascending });
  if (q) request = request.ilike(resource.titleField, `%${q}%`);
  for (const f of filterFields) {
    const v = query[f.name];
    if (typeof v === "string" && v) request = request.eq(f.name, v);
  }
  const { data, error } = await request.limit(500);
  const rows = (data ?? []) as Row[];

  // Label untuk kolom relasi & negara.
  const relationFields = resource.fields.filter((f) => f.type === "relation");
  const options = await loadOptions(db, [...relationFields, ...filterFields]);
  const display = (f: Field, v: unknown) => {
    if (v == null || v === "") return "";
    if (f.type === "country") return countryName(String(v));
    if (f.type === "relation") return options[f.name]?.find((o) => o.value === String(v))?.label ?? "";
    if (f.type === "date") return String(v).slice(0, 10);
    if (f.type === "number") return Number(v).toLocaleString("id-ID");
    return String(v);
  };
  const columns = resource.fields.filter((f) => f.list && f.name !== resource.titleField);
  const badge = resource.badge ?? "published";
  const filtered = q || filterFields.some((f) => query[f.name]);

  return (
    <AdminShell active={key} roles={roles} email={user.email}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-2xl">{resource.label}</h2>
        {key !== "pesan" && (
          <Link
            href={`/admin/${key}/baru`}
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-brand-900 hover:bg-accent-dark hover:text-white"
          >
            + Tambah {resource.singular}
          </Link>
        )}
      </div>
      {resource.intro && <p className="mt-2 max-w-3xl text-sm text-muted">{resource.intro}</p>}

      <form className="mt-5 flex flex-wrap items-end gap-3">
        <label className="text-xs font-semibold text-muted">
          Cari
          <input
            name="q"
            defaultValue={q}
            placeholder="Kata kunci…"
            className="mt-1 block w-56 rounded-lg border border-line bg-white px-3 py-2 text-sm font-normal text-ink"
          />
        </label>
        {filterFields.map((f) => (
          <label key={f.name} className="text-xs font-semibold text-muted">
            {f.label}
            <select
              name={f.name}
              defaultValue={typeof query[f.name] === "string" ? String(query[f.name]) : ""}
              className="mt-1 block max-w-56 rounded-lg border border-line bg-white px-3 py-2 text-sm font-normal text-ink"
            >
              <option value="">Semua</option>
              {(f.type === "relation" || f.type === "country"
                ? options[f.name] ?? []
                : (f.options ?? []).map((o) => ({ value: o, label: o }))
              ).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        ))}
        <button className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-900">
          Terapkan
        </button>
        {filtered && (
          <Link href={`/admin/${key}`} className="py-2 text-sm font-semibold text-brand-700 hover:underline">
            Reset
          </Link>
        )}
      </form>

      <div className="mt-4 space-y-3">
        {query.ok && <Notice>Perubahan tersimpan.</Notice>}
        {typeof query.info === "string" && <Notice>{query.info}</Notice>}
        {query.error === "akses" && (
          <Notice kind="error">Peran Anda tidak mengizinkan tindakan itu.</Notice>
        )}
        {error && <Notice kind="error">Gagal memuat data: {error.message}</Notice>}
      </div>

      <p className="mt-4 text-xs text-muted">{rows.length} data</p>
      <ul className="mt-2 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
        {rows.map((row) => {
          const titleField = resource.fields.find((f) => f.name === resource.titleField);
          const title =
            (titleField ? display(titleField, row[resource.titleField]) : "") ||
            String(row.name ?? row.title ?? "") ||
            "(tanpa judul)";
          return (
            <li key={String(row[idField])}>
              <Link
                href={`/admin/${key}/${encodeURIComponent(String(row[idField]))}`}
                className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-brand-50"
              >
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{title}</span>
                  {columns.length > 0 && (
                    <span className="mt-0.5 block truncate text-sm text-muted">
                      {columns
                        .map((f) => display(f, row[f.name]))
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  )}
                </span>
                {badge !== "-" && (
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      badgeOn(badge, row[badge]) ? "bg-brand-100 text-brand-700" : "bg-line text-muted"
                    }`}
                  >
                    {badgeText(badge, row[badge])}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
        {!rows.length && !error && (
          <li className="px-5 py-8 text-center text-muted">
            {filtered ? "Tidak ada data yang cocok." : "Belum ada data."}
          </li>
        )}
      </ul>
    </AdminShell>
  );
}

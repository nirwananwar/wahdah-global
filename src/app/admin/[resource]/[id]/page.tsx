import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell, Notice } from "@/components/admin";
import { ConfirmButton } from "@/components/confirm-button";
import { GalleryInput } from "@/components/gallery-input";
import { resources, type Field } from "@/lib/admin-resources";
import { countryName } from "@/lib/countries";
import { allowed } from "@/lib/roles";
import { PRIVATE_PREFIX } from "@/lib/storage";
import { requireStaff } from "@/lib/supabase-server";
import { remove, save } from "../../actions";
import { loadOptions, type Option } from "../../options";

const translations = [
  { code: "en", label: "Inggris", dir: "ltr" },
  { code: "ar", label: "Arab", dir: "rtl" },
] as const;

const input =
  "mt-1 w-full rounded-xl border border-line bg-white px-4 py-2.5 font-normal outline-none focus:border-brand-500";

function FieldInput({
  field,
  value,
  folder,
  options,
  fileHref,
}: {
  field: Field;
  value: unknown;
  folder: string;
  options?: Option[];
  fileHref?: string;
}) {
  const text = value == null ? "" : String(value);

  if (field.type === "gallery") {
    return (
      <GalleryInput
        name={field.name}
        label={field.label}
        folder={folder}
        initial={Array.isArray(value) ? (value as string[]) : []}
      />
    );
  }

  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-3 text-sm font-semibold">
        <input
          type="checkbox"
          name={field.name}
          defaultChecked={value == null ? Boolean(field.defaultChecked) : Boolean(value)}
          className="size-4 accent-brand-700"
        />
        {field.label}
      </label>
    );
  }

  if (field.type === "tags") {
    const current = Array.isArray(value) ? (value as string[]) : [];
    return (
      <fieldset className="text-sm font-semibold">
        <legend>{field.label}</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {field.options?.map((o) => (
            <label
              key={o}
              className="flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 font-normal has-checked:border-brand-500 has-checked:bg-brand-50"
            >
              <input
                type="checkbox"
                name={field.name}
                value={o}
                defaultChecked={current.includes(o)}
                className="size-4 accent-brand-700"
              />
              {o}
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  let control;
  switch (field.type) {
    case "textarea":
    case "longtext":
      control = (
        <textarea
          name={field.name}
          defaultValue={text}
          rows={field.type === "longtext" ? 12 : 3}
          required={field.required}
          className={input}
        />
      );
      break;
    case "select":
      control = (
        <select name={field.name} defaultValue={text} className={input}>
          {field.options?.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      );
      break;
    case "country":
    case "relation":
      control = (
        <select name={field.name} defaultValue={text} required={field.required} className={input}>
          <option value="">— Pilih —</option>
          {options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
      break;
    case "image":
      control = (
        <>
          {text && (
            <span className="mt-2 flex items-center gap-4">
              <Image
                src={text}
                alt=""
                width={120}
                height={90}
                className="h-[90px] w-[120px] rounded-lg object-cover"
              />
              <span className="flex items-center gap-2 font-normal">
                <input type="checkbox" name={`${field.name}__remove`} className="size-4" />
                Hapus gambar
              </span>
            </span>
          )}
          <input
            type="file"
            name={field.name}
            accept="image/*"
            className="mt-2 block w-full text-sm font-normal"
          />
        </>
      );
      break;
    case "file":
      control = (
        <>
          {text && (
            <span className="mt-2 flex items-center gap-4 font-normal">
              <a href={fileHref ?? text} className="text-brand-700 underline" target="_blank">
                Lihat berkas saat ini
              </a>
              <span className="flex items-center gap-2">
                <input type="checkbox" name={`${field.name}__remove`} className="size-4" />
                Hapus berkas
              </span>
            </span>
          )}
          <input
            type="file"
            name={field.name}
            accept="application/pdf,image/*"
            className="mt-2 block w-full text-sm font-normal"
          />
        </>
      );
      break;
    default:
      control = (
        <input
          name={field.name}
          type={field.type === "text" ? "text" : field.type}
          defaultValue={field.type === "date" ? text.slice(0, 10) : text}
          required={field.required}
          className={input}
        />
      );
  }

  return (
    <label className="block text-sm font-semibold">
      {field.label}
      {field.required && <span className="text-red-600"> *</span>}
      {control}
      {field.help && <span className="mt-1 block text-xs font-normal text-muted">{field.help}</span>}
      {(field.type === "image" || field.type === "file") && (
        <span className="mt-1 block text-xs font-normal text-muted">Maksimal 4 MB.</span>
      )}
    </label>
  );
}

export default async function Page({ params, searchParams }: PageProps<"/admin/[resource]/[id]">) {
  const { resource: key, id: rawId } = await params;
  const id = decodeURIComponent(rawId);
  const resource = resources[key];
  if (!resource) notFound();

  const { db, roles, user } = await requireStaff(resource.roles);
  const query = await searchParams;
  const isNew = id === "baru";
  const idField = resource.idField ?? "id";

  let row: Record<string, unknown> = {};
  if (!isNew) {
    const { data } = await db.from(resource.table).select("*").eq(idField, id).maybeSingle();
    if (!data) notFound();
    row = data;
  } else {
    // Nilai awal: default field, lalu isian dari tautan (mis. ?partner_id=…).
    for (const f of resource.fields) {
      if (f.defaultValue !== undefined) row[f.name] = f.defaultValue;
      const v = query[f.name];
      if (typeof v === "string") row[f.name] = v;
    }
  }

  const options = await loadOptions(
    db,
    resource.fields.filter((f) => f.type === "relation" || f.type === "country"),
  );

  // Tautan sementara untuk berkas privat.
  const fileHrefs: Record<string, string> = {};
  for (const f of resource.fields.filter((f) => f.type === "file")) {
    const v = row[f.name];
    if (typeof v === "string" && v.startsWith(PRIVATE_PREFIX)) {
      const { data } = await db.storage
        .from("internal")
        .createSignedUrl(v.slice(PRIVATE_PREFIX.length), 600);
      if (data) fileHrefs[f.name] = data.signedUrl;
    }
  }

  // Daftar terkait (riwayat komunikasi, progres, donasi, dokumen…).
  const related = isNew
    ? []
    : await Promise.all(
        (resource.related ?? [])
          .filter((r) => allowed(roles, resources[r.resource].roles))
          .map(async (r) => {
            const target = resources[r.resource];
            const { data } = await db
              .from(target.table)
              .select("*")
              .eq(r.fk, id)
              .order(target.orderBy.column, { ascending: target.orderBy.ascending })
              .limit(50);
            return { ...r, target, rows: (data ?? []) as Record<string, unknown>[] };
          }),
      );

  const translatable = resource.fields.filter((f) => f.translatable);
  const extra = (() => {
    if (key === "donasi" && row.verified_at)
      return `Diverifikasi ${new Date(String(row.verified_at)).toLocaleString("id-ID")}`;
    if (key === "proyek" && !isNew)
      return `Progres ${row.progress ?? 0}%${
        row.progress_updated_at
          ? ` per ${new Date(String(row.progress_updated_at)).toLocaleDateString("id-ID")}`
          : ""
      } (dari laporan progres terbaru)`;
    if (key === "pesan" && row.created_at)
      return `Diterima ${new Date(String(row.created_at)).toLocaleString("id-ID")}${
        row.country_code ? ` · ${countryName(String(row.country_code))}` : ""
      }`;
    return "";
  })();

  return (
    <AdminShell active={key} roles={roles} email={user.email}>
      <Link href={`/admin/${key}`} className="text-sm font-semibold text-brand-700 hover:underline">
        ← {resource.label}
      </Link>
      <h2 className="mt-3 font-display text-2xl">
        {isNew ? `Tambah ${resource.singular}` : `Ubah ${resource.singular}`}
      </h2>
      {extra && <p className="mt-1 text-sm text-muted">{extra}</p>}

      <div className="mt-5 max-w-2xl space-y-3">
        {typeof query.error === "string" && <Notice kind="error">{query.error}</Notice>}
        {query.ok && <Notice>Perubahan tersimpan.</Notice>}
      </div>

      <form action={save.bind(null, key, isNew ? "baru" : id)} className="mt-6 max-w-2xl space-y-5">
        {resource.fields.map((field) => (
          <FieldInput
            key={field.name}
            field={field}
            value={row[field.name]}
            folder={resource.table}
            options={options[field.name]}
            fileHref={fileHrefs[field.name]}
          />
        ))}
        {translatable.length > 0 &&
          translations.map((tr) => (
            <details
              key={tr.code}
              open={translatable.some((f) => row[`${f.name}_${tr.code}`])}
              className="rounded-2xl border border-line bg-white p-5"
            >
              <summary className="cursor-pointer text-sm font-semibold">
                Terjemahan {tr.label} (opsional)
              </summary>
              <p className="mt-2 text-xs text-muted">
                Kosongkan untuk menampilkan versi Indonesia di halaman {tr.label}.
              </p>
              <div dir={tr.dir} className="mt-4 space-y-5">
                {translatable.map((field) => (
                  <FieldInput
                    key={field.name}
                    field={{ ...field, name: `${field.name}_${tr.code}`, required: false, help: undefined }}
                    value={row[`${field.name}_${tr.code}`]}
                    folder={resource.table}
                  />
                ))}
              </div>
            </details>
          ))}
        <button className="rounded-full bg-brand-700 px-7 py-3 text-sm font-semibold text-white hover:bg-brand-900">
          Simpan
        </button>
      </form>

      {related.map((r) => (
        <section key={r.resource} className="mt-12 max-w-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-display text-xl">{r.label}</h3>
            <Link
              href={`/admin/${r.resource}/baru?${r.fk}=${encodeURIComponent(id)}`}
              className="rounded-full border border-brand-700/40 px-4 py-1.5 text-sm font-semibold text-brand-700 hover:bg-brand-50"
            >
              + Tambah
            </Link>
          </div>
          <ul className="mt-3 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
            {r.rows.map((x) => (
              <li key={String(x.id)}>
                <Link
                  href={`/admin/${r.resource}/${x.id}`}
                  className="flex justify-between gap-4 px-4 py-3 text-sm hover:bg-brand-50"
                >
                  <span className="min-w-0 truncate font-semibold">
                    {String(x[r.target.titleField] ?? "") || String(x.title ?? x.kind ?? "")}
                  </span>
                  <span className="shrink-0 text-muted">
                    {[x.kind, x.progress != null ? `${x.progress}%` : "", x.amount_idr ? `Rp ${Number(x.amount_idr).toLocaleString("id-ID")}` : "", x.verified === false ? "belum diverifikasi" : "", String(x.occurred_on ?? x.reported_on ?? x.received_on ?? "").slice(0, 10)]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </Link>
              </li>
            ))}
            {!r.rows.length && <li className="px-4 py-5 text-center text-sm text-muted">Belum ada data.</li>}
          </ul>
        </section>
      ))}

      {!isNew && (
        <form action={remove.bind(null, key, id)} className="mt-12 max-w-2xl border-t border-line pt-6">
          <ConfirmButton
            message="Hapus entri ini secara permanen?"
            className="rounded-full border border-red-300 px-5 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50"
          >
            Hapus {resource.singular}
          </ConfirmButton>
        </form>
      )}
    </AdminShell>
  );
}

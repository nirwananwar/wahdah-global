import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin";
import { ConfirmButton } from "@/components/confirm-button";
import { GalleryInput } from "@/components/gallery-input";
import { resources, type Field } from "@/lib/admin-resources";
import { requireAdmin } from "@/lib/supabase-server";
import { remove, save } from "../../actions";

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
}: {
  field: Field;
  value: unknown;
  folder: string;
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
          defaultChecked={
            value == null ? Boolean(field.defaultChecked) : Boolean(value)
          }
          className="size-4 accent-brand-700"
        />
        {field.label}
      </label>
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
                <input
                  type="checkbox"
                  name={`${field.name}__remove`}
                  className="size-4"
                />
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
              <a href={text} className="text-brand-700 underline">
                Lihat berkas saat ini
              </a>
              <span className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name={`${field.name}__remove`}
                  className="size-4"
                />
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
      {control}
      {field.help && (
        <span className="mt-1 block text-xs font-normal text-muted">
          {field.help}
        </span>
      )}
      {(field.type === "image" || field.type === "file") && (
        <span className="mt-1 block text-xs font-normal text-muted">
          Maksimal 4 MB.
        </span>
      )}
    </label>
  );
}

export default async function Page({
  params,
  searchParams,
}: PageProps<"/admin/[resource]/[id]">) {
  const { resource: key, id } = await params;
  const resource = resources[key];
  if (!resource) notFound();

  const db = await requireAdmin();
  const { error } = await searchParams;
  const isNew = id === "baru";

  let row: Record<string, unknown> = {};
  if (!isNew) {
    const { data } = await db
      .from(resource.table)
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (!data) notFound();
    row = data;
  }

  const translatable = resource.fields.filter((f) => f.translatable);

  return (
    <AdminShell active={key}>
      <Link
        href={`/admin/${key}`}
        className="text-sm font-semibold text-brand-700 hover:underline"
      >
        ← {resource.label}
      </Link>
      <h2 className="mt-3 font-display text-2xl">
        {isNew ? `Tambah ${resource.singular}` : `Ubah ${resource.singular}`}
      </h2>

      {typeof error === "string" && (
        <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <form
        action={save.bind(null, key, id)}
        className="mt-6 max-w-2xl space-y-5"
      >
        {resource.fields.map((field) => (
          <FieldInput
            key={field.name}
            field={field}
            value={row[field.name]}
            folder={resource.table}
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
                Kosongkan untuk menampilkan versi Indonesia di halaman{" "}
                {tr.label}.
              </p>
              <div dir={tr.dir} className="mt-4 space-y-5">
                {translatable.map((field) => (
                  <FieldInput
                    key={field.name}
                    field={{
                      ...field,
                      name: `${field.name}_${tr.code}`,
                      required: false,
                      help: undefined,
                    }}
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

      {!isNew && (
        <form
          action={remove.bind(null, key, id)}
          className="mt-10 max-w-2xl border-t border-line pt-6"
        >
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

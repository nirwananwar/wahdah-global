import type { SupabaseClient } from "@supabase/supabase-js";
import type { Field } from "@/lib/admin-resources";
import { countryName } from "@/lib/countries";

export type Option = { value: string; label: string };

/** Pilihan untuk field relasi & negara, diambil dari database. */
export async function loadOptions(db: SupabaseClient, fields: Field[]) {
  const out: Record<string, Option[]> = {};
  let countries: Option[] | null = null;
  for (const f of fields) {
    if (out[f.name]) continue;
    if (f.type === "country") {
      if (!countries) {
        const { data } = await db.from("countries").select("code");
        countries = (data ?? [])
          .map((r) => ({ value: String(r.code), label: countryName(String(r.code)) }))
          .sort((a, b) => a.label.localeCompare(b.label, "id"));
      }
      out[f.name] = countries;
    } else if (f.type === "relation" && f.relation) {
      const { table, label, orderBy } = f.relation;
      const key = table === "post_categories" ? "slug" : "id";
      const { data } = await db
        .from(table)
        .select(`${key}, ${label}`)
        .order(orderBy ?? label, { ascending: true })
        .limit(1000);
      out[f.name] = ((data ?? []) as unknown as Record<string, unknown>[]).map((r) => ({
        value: String(r[key]),
        label: String(r[label] ?? ""),
      }));
    }
  }
  return out;
}

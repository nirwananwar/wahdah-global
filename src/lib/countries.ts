import type { Lang } from "./i18n";

const names = new Map<string, Intl.DisplayNames>();

/** Nama negara dari kode ISO dalam bahasa yang diminta (mis. QA → "Qatar"). */
export function countryName(code: string | null | undefined, lang: Lang = "id") {
  if (!code) return "";
  let dn = names.get(lang);
  if (!dn) {
    dn = new Intl.DisplayNames([lang], { type: "region" });
    names.set(lang, dn);
  }
  try {
    return dn.of(code) ?? code;
  } catch {
    return code;
  }
}

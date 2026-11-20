"use server";

import { redirect } from "next/navigation";
import { href, toLang } from "@/lib/i18n";
import { publicClient } from "@/lib/supabase";

const interests = ["Kemanusiaan", "Pendidikan", "Dakwah", "Diplomasi", "Donasi", "Lainnya"];

/** Simpan pesan kemitraan dari formulir publik (masuk ke menu Pesan Masuk). */
export async function submitInquiry(rawLang: string, formData: FormData) {
  const lang = toLang(rawLang);
  const done = (status: "sent" | "failed"): never =>
    redirect(`${href(lang, "/hubungi-kami")}?kirim=${status}#kemitraan`);
  const text = (name: string, max: number) => String(formData.get(name) ?? "").trim().slice(0, max);

  // Bot mengisi kolom tersembunyi; anggap terkirim tanpa menyimpan apa pun.
  if (text("website", 200)) done("sent");

  const row = {
    name: text("name", 120),
    organization: text("organization", 200),
    country_code: /^[A-Z]{2}$/.test(text("country_code", 2)) ? text("country_code", 2) : null,
    email: text("email", 200),
    phone: text("phone", 40),
    interest: interests.includes(text("interest", 40)) ? text("interest", 40) : "Lainnya",
    message: text("message", 5000),
    lang,
  };
  const db = publicClient();
  if (!db || row.name.length < 2 || row.message.length < 10 || !row.email.includes("@")) done("failed");
  const { error } = await db!.from("inquiries").insert(row);
  if (error) {
    console.error(`[inquiry] ${error.message}`);
    done("failed");
  }
  done("sent");
}

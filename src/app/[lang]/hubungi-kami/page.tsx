import type { Metadata } from "next";
import { InquiryForm } from "@/components/portal";
import { PageHero, Section } from "@/components/ui";
import { getCountries } from "@/lib/content";
import { getPortal } from "@/lib/i18n-portal";
import { Suspense } from "react";
import { getDict, toLang, type Lang } from "@/lib/i18n";
import { site } from "@/lib/site";

type Props = PageProps<"/[lang]/hubungi-kami">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: getDict(toLang((await params).lang)).nav.contact };
}

async function Form({ lang, searchParams }: { lang: Lang; searchParams: Props["searchParams"] }) {
  const { kirim } = await searchParams;
  const countries = await getCountries(lang);
  return (
    <InquiryForm
      lang={lang}
      countries={countries}
      status={kirim === "sent" || kirim === "failed" ? kirim : undefined}
    />
  );
}

export default async function Page({ params, searchParams }: Props) {
  const lang = toLang((await params).lang);
  const form = getPortal(lang).form;
  const t = getDict(lang);
  const rows = [
    { label: t.footer.address, value: site.address[lang], link: "" },
    { label: t.footer.email, value: site.email, link: `mailto:${site.email}` },
    { label: t.footer.phone, value: site.phone, link: `tel:${site.phone}` },
    {
      label: t.footer.whatsapp,
      value: site.whatsapp && site.whatsappLabel,
      link: `https://wa.me/${site.whatsapp}`,
    },
  ].filter((r) => r.value); // baris kosong tidak ditampilkan

  return (
    <>
      <PageHero title={t.nav.contact} lead={t.contact.lead} />
      <Section>
        <dl className="grid gap-4 sm:grid-cols-2">
          {rows.map((r) => (
            <div
              key={r.label}
              className="rounded-2xl border border-line bg-white p-6"
            >
              <dt className="text-sm font-semibold uppercase tracking-widest text-brand-700">
                {r.label}
              </dt>
              <dd className="mt-2 text-lg">
                {r.value ? (
                  r.link ? (
                    <a href={r.link} dir="ltr" className="hover:underline">
                      {r.value}
                    </a>
                  ) : (
                    r.value
                  )
                ) : (
                  <span className="text-muted">{t.common.notFilled}</span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </Section>
      <div id="kemitraan" className="scroll-mt-24 border-t border-line bg-white">
        <Section title={form.title}>
          <p className="-mt-4 mb-8 max-w-3xl text-ink/80">{form.lead}</p>
          <div className="max-w-3xl">
            <Suspense fallback={<p className="text-muted">{t.common.loading}</p>}>
              <Form lang={lang} searchParams={searchParams} />
            </Suspense>
          </div>
        </Section>
      </div>
    </>
  );
}

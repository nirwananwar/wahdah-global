import type { Metadata } from "next";
import { PageHero, Section } from "@/components/ui";
import { getDict, toLang } from "@/lib/i18n";
import { site } from "@/lib/site";

type Props = PageProps<"/[lang]/hubungi-kami">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: getDict(toLang((await params).lang)).nav.contact };
}

export default async function Page({ params }: Props) {
  const lang = toLang((await params).lang);
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
    </>
  );
}

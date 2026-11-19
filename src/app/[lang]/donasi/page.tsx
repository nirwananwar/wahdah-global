import type { Metadata } from "next";
import { Channels } from "@/components/channels";
import { PageHero, ProgramCard, Section } from "@/components/ui";
import { getDonationChannels, getPrograms } from "@/lib/content";
import { getDict, toLang } from "@/lib/i18n";
import { site } from "@/lib/site";

type Props = PageProps<"/[lang]/donasi">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: getDict(toLang((await params).lang)).nav.donate };
}

export default async function Page({ params }: Props) {
  const lang = toLang((await params).lang);
  const t = getDict(lang);
  const [channels, programs] = await Promise.all([
    getDonationChannels(lang),
    getPrograms(lang),
  ]);
  const open = programs.filter((p) => p.status !== "Selesai");
  const local = channels.filter((c) => !c.international);
  const abroad = channels.filter((c) => c.international);

  return (
    <>
      <PageHero title={t.nav.donate} lead={t.donate.lead} />

      <Section title={t.donate.howTitle}>
        <ol className="grid gap-4 md:grid-cols-3">
          {t.donate.steps.map((s, i) => (
            <li key={s} className="rounded-2xl border border-line bg-white p-6">
              <span className="font-display text-3xl text-brand-500">
                {i + 1}
              </span>
              <p className="mt-3">{s}</p>
            </li>
          ))}
        </ol>
      </Section>

      {local.length > 0 && (
        <div className="border-y border-line bg-white">
          <Section title={t.donate.channelsTitle}>
            <Channels channels={local} lang={lang} />
            <p className="mt-6 text-sm text-muted">{t.donate.warning}</p>
          </Section>
        </div>
      )}

      <Section title={t.donate.internationalTitle}>
        <p className="max-w-3xl text-lg text-ink/90">
          {t.donate.internationalLead}
        </p>
        {abroad.length > 0 && (
          <div className="mt-6">
            <Channels channels={abroad} lang={lang} />
          </div>
        )}
        <div className="mt-6 flex flex-col gap-5 rounded-2xl bg-brand-700 p-6 text-white sm:p-8 md:flex-row md:items-center md:justify-between">
          <p className="max-w-2xl text-brand-100">
            {t.donate.internationalAsk}
          </p>
          <div className="flex shrink-0 flex-wrap gap-3">
            {site.whatsapp && (
              <a
                href={`https://wa.me/${site.whatsapp}`}
                className="rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-brand-900 hover:bg-white"
              >
                {t.donate.whatsappCta}
              </a>
            )}
            {site.email && (
              <a
                href={`mailto:${site.email}?subject=International%20donation%20-%20Wahdah%20Global`}
                className="rounded-lg border border-white/50 px-5 py-2.5 text-sm font-bold text-white hover:bg-white hover:text-brand-900"
              >
                {t.donate.emailCta}
              </a>
            )}
          </div>
        </div>
      </Section>

      {open.length > 0 && (
        <Section title={t.donate.programsTitle}>
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {open.map((p) => (
              <ProgramCard key={p.slug} program={p} lang={lang} />
            ))}
          </div>
        </Section>
      )}
    </>
  );
}

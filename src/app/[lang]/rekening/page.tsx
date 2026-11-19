import type { Metadata } from "next";
import { Channels } from "@/components/channels";
import { ButtonLink, PageHero, Section } from "@/components/ui";
import { getDonationChannels } from "@/lib/content";
import { getDict, href, toLang } from "@/lib/i18n";

type Props = PageProps<"/[lang]/rekening">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: getDict(toLang((await params).lang)).accounts.title };
}

export default async function Page({ params }: Props) {
  const lang = toLang((await params).lang);
  const t = getDict(lang);
  const channels = await getDonationChannels(lang);
  return (
    <>
      <PageHero title={t.accounts.title} lead={t.accounts.lead} />
      <Section>
        <Channels
          channels={channels.filter((c) => !c.international)}
          lang={lang}
        />
        {channels.some((c) => c.international) && (
          <>
            <h2 className="mt-12 font-display text-2xl">
              {t.donate.internationalTitle}
            </h2>
            <div className="mt-4">
              <Channels
                channels={channels.filter((c) => c.international)}
                lang={lang}
              />
            </div>
          </>
        )}
        <p className="mt-6 text-sm text-muted">{t.donate.warning}</p>
        <div className="mt-8 rounded-2xl bg-brand-700 p-8">
          <ButtonLink href={href(lang, "/donasi")}>{t.accounts.how}</ButtonLink>
        </div>
      </Section>
    </>
  );
}

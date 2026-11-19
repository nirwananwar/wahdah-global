import type { Metadata } from "next";
import { PageHero, ProgramCard, Section } from "@/components/ui";
import { getPrograms } from "@/lib/content";
import { getDict, toLang } from "@/lib/i18n";

type Props = PageProps<"/[lang]/peduli-ummat">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: getDict(toLang((await params).lang)).pillars.peduliUmmat };
}

export default async function Page({ params }: Props) {
  const lang = toLang((await params).lang);
  const t = getDict(lang);
  const programs = await getPrograms(lang);
  return (
    <>
      <PageHero
        eyebrow={t.topic.eyebrow}
        title={t.pillars.peduliUmmat}
        lead={t.programs.peduliUmmatLead}
      />
      <Section title={t.programs.list}>
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {programs.map((p) => (
            <ProgramCard key={p.slug} program={p} lang={lang} />
          ))}
        </div>
      </Section>
    </>
  );
}

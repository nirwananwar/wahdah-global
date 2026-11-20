import type { Metadata } from "next";
import { PageHero, ProgramCard, Section } from "@/components/ui";
import { ProjectCard } from "@/components/portal";
import { getPrograms, getProjects } from "@/lib/content";
import { getPortal } from "@/lib/i18n-portal";
import { getDict, toLang } from "@/lib/i18n";

type Props = PageProps<"/[lang]/peduli-ummat">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: getDict(toLang((await params).lang)).pillars.peduliUmmat };
}

export default async function Page({ params }: Props) {
  const lang = toLang((await params).lang);
  const t = getDict(lang);
  const [programs, projects] = await Promise.all([getPrograms(lang), getProjects(lang)]);
  const pt = getPortal(lang).projects;
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
      {projects.length > 0 && (
        <div className="border-t border-line bg-white">
          <Section title={pt.title}>
            <p className="-mt-4 mb-8 max-w-3xl text-ink/80">{pt.lead}</p>
            <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {projects.map((p) => (
                <ProjectCard key={p.slug} project={p} lang={lang} />
              ))}
            </div>
            <p className="mt-8 text-xs text-muted">{pt.fundsNote}</p>
          </Section>
        </div>
      )}
    </>
  );
}

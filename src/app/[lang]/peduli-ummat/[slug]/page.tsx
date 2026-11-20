import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ButtonLink,
  Gallery,
  PageHero,
  SampleBadge,
  Tag,
  Funding,
} from "@/components/ui";
import { ProjectCard } from "@/components/portal";
import { getProgram, getPrograms, getProjects } from "@/lib/content";
import { getPortal } from "@/lib/i18n-portal";
import { getDict, href, locales, toLang } from "@/lib/i18n";

type Props = PageProps<"/[lang]/peduli-ummat/[slug]">;

export async function generateStaticParams() {
  const programs = await getPrograms("id");
  const slugs = programs.length ? programs.map((p) => p.slug) : ["-"];
  return locales.flatMap((lang) => slugs.map((slug) => ({ lang, slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const program = await getProgram(toLang(lang), slug);
  return program
    ? { title: program.title, description: program.summary }
    : {};
}

export default async function Page({ params }: Props) {
  const { lang: rawLang, slug } = await params;
  const lang = toLang(rawLang);
  const t = getDict(lang);
  const program = await getProgram(lang, slug);
  if (!program) notFound();
  const projects = (await getProjects(lang)).filter((p) => p.programId === program.id);
  const pt = getPortal(lang).projects;

  return (
    <>
      <PageHero
        eyebrow={t.pillars.peduliUmmat}
        title={program.title}
        lead={program.summary}
      />
      <article className="container-page max-w-3xl py-14">
        <div className="flex flex-wrap items-center gap-2">
          <Tag>{t.statuses[program.status]}</Tag>
          {program.region && <Tag>{program.region}</Tag>}
          {program.sample && <SampleBadge lang={lang} />}
        </div>
        {program.cover && (
          <div className="relative mt-8 aspect-video overflow-hidden rounded-2xl">
            <Image
              src={program.cover}
              alt=""
              fill
              priority
              sizes="(min-width: 768px) 768px, 100vw"
              className="object-cover"
            />
          </div>
        )}
        <div className="prose-body mt-8 text-lg leading-relaxed text-ink/90">
          {program.body.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <Funding program={program} lang={lang} />
        <Gallery images={program.gallery} lang={lang} />
        {projects.length > 0 && (
          <section className="mt-10 border-t border-line pt-8">
            <h2 className="font-display text-2xl">{pt.inProgram}</h2>
            <div className="mt-6 grid gap-x-6 gap-y-10 sm:grid-cols-2">
              {projects.map((p) => (
                <ProjectCard key={p.slug} project={p} lang={lang} />
              ))}
            </div>
          </section>
        )}
        <div className="mt-10 rounded-2xl bg-brand-700 p-8 text-white">
          <h2 className="font-display text-2xl">{t.programs.supportTitle}</h2>
          <p className="mt-2 text-brand-100">{t.programs.supportBody}</p>
          <div className="mt-5">
            <ButtonLink href={href(lang, "/donasi")}>{t.nav.donate}</ButtonLink>
          </div>
        </div>
      </article>
    </>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ProjectProgress } from "@/components/portal";
import { ButtonLink, Gallery, PageHero, Tag } from "@/components/ui";
import { getProject, getProjects, getProjectUpdates } from "@/lib/content";
import { formatDate, getDict, href, locales, toLang } from "@/lib/i18n";
import { getPortal, label } from "@/lib/i18n-portal";

type Props = PageProps<"/[lang]/peduli-ummat/proyek/[slug]">;

export async function generateStaticParams() {
  const projects = await getProjects("id");
  const slugs = projects.length ? projects.map((p) => p.slug) : ["-"];
  return locales.flatMap((lang) => slugs.map((slug) => ({ lang, slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const project = await getProject(toLang(lang), slug);
  return project ? { title: project.title, description: project.summary } : {};
}

export default async function Page({ params }: Props) {
  const { lang: rawLang, slug } = await params;
  const lang = toLang(rawLang);
  const t = getDict(lang);
  const pt = getPortal(lang).projects;
  const project = await getProject(lang, slug);
  if (!project) notFound();
  const updates = await getProjectUpdates(lang, project.id);

  const facts = [
    [pt.location, [project.location, project.country].filter(Boolean).join(", ")],
    [pt.beneficiaries, project.beneficiaries ? project.beneficiaries.toLocaleString(lang === "ar" ? "ar-u-nu-latn" : "id-ID") : ""],
    [pt.started, project.started ? formatDate(project.started, lang) : ""],
    [pt.completed, project.completed ? formatDate(project.completed, lang) : ""],
  ].filter(([, v]) => v);

  return (
    <>
      <PageHero eyebrow={t.pillars.peduliUmmat} title={project.title} lead={project.summary} />
      <article className="container-page grid gap-10 py-14 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <Tag>{label(pt.categories, project.category)}</Tag>
            <Tag>{label(pt.statuses, project.status)}</Tag>
          </div>
          {project.cover && (
            <div className="relative mt-6 aspect-video overflow-hidden rounded-2xl">
              <Image
                src={project.cover}
                alt=""
                fill
                priority
                sizes="(min-width: 1024px) 760px, 100vw"
                className="object-cover"
              />
            </div>
          )}
          <div className="prose-body mt-8 text-lg leading-relaxed text-ink/90">
            {project.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <Gallery images={project.before} lang={lang} title={pt.before} />
          <Gallery images={project.during} lang={lang} title={pt.during} />
          <Gallery images={project.after} lang={lang} title={pt.after} />

          {updates.length > 0 && (
            <section className="mt-10 border-t border-line pt-8">
              <h2 className="font-display text-2xl">{pt.updates}</h2>
              <ol className="mt-6 space-y-6 border-s-2 border-brand-100 ps-6">
                {updates.map((u, i) => (
                  <li key={`${u.date}-${i}`} className="relative">
                    <span className="absolute -start-[33px] top-1.5 size-4 rounded-full border-4 border-white bg-accent-dark" />
                    <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
                      {formatDate(u.date, lang)} · {u.progress}%
                    </p>
                    {u.note && <p className="mt-1 text-ink/85">{u.note}</p>}
                    {u.photos.length > 0 && (
                      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                        {u.photos.map((src) => (
                          <a key={src} href={src} target="_blank" rel="noreferrer" className="relative block aspect-4/3 overflow-hidden rounded-lg">
                            <Image src={src} alt="" fill sizes="160px" className="object-cover" />
                          </a>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-line bg-white p-6">
            <ProjectProgress project={project} lang={lang} />
            {facts.length > 0 && (
              <dl className="mt-6 space-y-3 border-t border-line pt-5 text-sm">
                {facts.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4">
                    <dt className="text-muted">{k}</dt>
                    <dd className="text-end font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>
            )}
            {project.report && (
              <a
                href={project.report}
                className="mt-6 block rounded-lg border border-brand-700/40 px-4 py-2.5 text-center text-sm font-semibold text-brand-700 hover:bg-brand-50"
              >
                {pt.report}
              </a>
            )}
            <p className="mt-5 text-xs text-muted">{pt.fundsNote}</p>
          </div>
          {project.status !== "Selesai" && (
            <div className="rounded-2xl bg-brand-700 p-6 text-white">
              <h2 className="font-display text-xl">{t.programs.supportTitle}</h2>
              <p className="mt-2 text-sm text-brand-100">{t.programs.supportBody}</p>
              <div className="mt-4">
                <ButtonLink href={href(lang, "/donasi")}>{t.nav.donate}</ButtonLink>
              </div>
            </div>
          )}
        </aside>
      </article>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Gallery, PageHero, PostCard, Section } from "@/components/ui";
import { getDpln, getDplnChapters, getPosts } from "@/lib/content";
import { getDict, href, locales, toLang } from "@/lib/i18n";
import { getPortal, label } from "@/lib/i18n-portal";

type Props = PageProps<"/[lang]/dpln/[code]">;

export async function generateStaticParams() {
  const chapters = await getDplnChapters("id");
  const codes = chapters.map((c) => c.code?.toLowerCase()).filter((c): c is string => Boolean(c));
  return locales.flatMap((lang) => (codes.length ? codes : ["-"]).map((code) => ({ lang, code })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, code } = await params;
  const chapter = await getDpln(toLang(lang), code);
  return chapter ? { title: `DPLN ${chapter.country}`, description: chapter.note } : {};
}

export default async function Page({ params }: Props) {
  const { lang: rawLang, code } = await params;
  const lang = toLang(rawLang);
  const t = getDict(lang);
  const pd = getPortal(lang).dpln;
  const chapter = await getDpln(lang, code);
  if (!chapter) notFound();
  const posts = (await getPosts(lang, "DPLN")).filter((p) =>
    `${p.title} ${p.excerpt}`.toLowerCase().includes(chapter.country.toLowerCase()),
  );

  return (
    <>
      <PageHero eyebrow={t.pillars.dpln} title={chapter.country} lead={chapter.note} />
      <article className="container-page max-w-3xl py-14">
        <Link href={href(lang, "/dpln")} className="text-sm font-semibold text-brand-700 hover:underline">
          ← {pd.back}
        </Link>
        <dl className="mt-6 grid gap-4 rounded-2xl border border-line bg-white p-6 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-widest text-muted">Status</dt>
            <dd className="mt-1 font-semibold">{label(pd.statuses, chapter.status)}</dd>
          </div>
          {chapter.city && (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-widest text-muted">{t.footer.address}</dt>
              <dd className="mt-1 font-semibold">{chapter.city}</dd>
            </div>
          )}
          {chapter.area && (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-widest text-muted">{pd.area}</dt>
              <dd className="mt-1 font-semibold">{chapter.area}</dd>
            </div>
          )}
        </dl>
        {chapter.activities.length > 0 && (
          <section className="mt-10">
            <h2 className="font-display text-2xl">{pd.activities}</h2>
            <div className="prose-body mt-4 text-lg leading-relaxed text-ink/90">
              {chapter.activities.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </section>
        )}
        <Gallery images={chapter.gallery} lang={lang} title={pd.gallery} />
      </article>
      {posts.length > 0 && (
        <div className="border-t border-line bg-white">
          <Section title={t.dpln.news}>
            <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {posts.slice(0, 4).map((p) => (
                <PostCard key={p.slug} post={p} lang={lang} />
              ))}
            </div>
          </Section>
        </div>
      )}
    </>
  );
}

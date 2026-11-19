import type { Metadata } from "next";
import { PageHero, PostCard, SampleBadge, Section } from "@/components/ui";
import { getDplnChapters, getPosts } from "@/lib/content";
import { getDict, href, toLang } from "@/lib/i18n";

type Props = PageProps<"/[lang]/dpln">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: getDict(toLang((await params).lang)).pillars.dpln };
}

export default async function Page({ params }: Props) {
  const lang = toLang((await params).lang);
  const t = getDict(lang);
  const [chapters, posts] = await Promise.all([
    getDplnChapters(lang),
    getPosts(lang, "DPLN"),
  ]);

  return (
    <>
      <PageHero
        eyebrow={t.dpln.eyebrow}
        title={t.pillars.dpln}
        lead={t.dpln.lead}
      />
      <Section title={t.dpln.list}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {chapters.map((c, i) => (
            <div
              key={`${c.country}-${i}`}
              id={`dpln-${c.id}`}
              className="scroll-mt-28 rounded-2xl border border-line bg-white p-6 target:ring-2 target:ring-accent"
            >
              {c.sample && <SampleBadge lang={lang} />}
              <h3 className="mt-3 font-display text-xl">{c.country}</h3>
              {c.city && <p className="mt-1 text-sm text-muted">{c.city}</p>}
              {c.note && <p className="mt-3 text-sm">{c.note}</p>}
            </div>
          ))}
        </div>
      </Section>
      {posts.length > 0 && (
        <div className="border-t border-line bg-white">
          <Section
            title={t.dpln.news}
            action={{
              href: `${href(lang, "/berita")}?kategori=DPLN`,
              label: t.common.seeAll,
            }}
          >
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

import type { Metadata } from "next";
import Link from "next/link";
import { DplnMap } from "@/components/dpln-map";
import { PageHero, PostCard, SampleBadge, Section } from "@/components/ui";
import { getCountryNumerics, getDplnChapters, getPosts } from "@/lib/content";
import { getPortal, label } from "@/lib/i18n-portal";
import { getDict, href, toLang } from "@/lib/i18n";

type Props = PageProps<"/[lang]/dpln">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: getDict(toLang((await params).lang)).pillars.dpln };
}

export default async function Page({ params }: Props) {
  const lang = toLang((await params).lang);
  const t = getDict(lang);
  const [chapters, posts, numerics] = await Promise.all([
    getDplnChapters(lang),
    getPosts(lang, "DPLN"),
    getCountryNumerics(),
  ]);
  const pd = getPortal(lang).dpln;

  return (
    <>
      <PageHero
        eyebrow={t.dpln.eyebrow}
        title={t.pillars.dpln}
        lead={t.dpln.lead}
      />
      <Section title={pd.mapTitle}>
        <DplnMap chapters={chapters} numerics={numerics} lang={lang} />
      </Section>
      <Section title={t.dpln.list}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {chapters.map((c, i) => (
            <Link
              key={`${c.country}-${i}`}
              id={`dpln-${c.id}`}
              href={c.code ? href(lang, `/dpln/${c.code.toLowerCase()}`) : href(lang, "/dpln")}
              className="group scroll-mt-28 rounded-2xl border border-line bg-white p-6 hover:border-brand-500 target:ring-2 target:ring-accent"
            >
              {c.sample && <SampleBadge lang={lang} />}
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">
                {label(pd.statuses, c.status)}
              </p>
              <h3 className="mt-2 flex items-center gap-3 font-display text-xl group-hover:text-brand-500">
                {c.code && (
                  // Bendera SVG (flag-icons, MIT); dekoratif karena nama negara sudah tertulis.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/flags/country/${c.code.toLowerCase()}.svg`}
                    alt=""
                    width={32}
                    height={24}
                    loading="lazy"
                    className="h-6 w-8 shrink-0 rounded-[3px] object-cover shadow-sm ring-1 ring-black/10"
                  />
                )}
                {c.country}
              </h3>
              {(c.city || c.area) && (
                <p className="mt-1 text-sm text-muted">{[c.city, c.area].filter(Boolean).join(" · ")}</p>
              )}
              {c.note && <p className="mt-3 text-sm">{c.note}</p>}
              <p className="mt-4 text-sm font-semibold text-brand-700">{pd.detail} →</p>
            </Link>
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

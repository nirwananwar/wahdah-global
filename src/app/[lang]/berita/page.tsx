import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageHero, PostCard, Section } from "@/components/ui";
import { getCategories, getPosts } from "@/lib/content";
import { getDict, href, toLang, type Lang } from "@/lib/i18n";

type Props = PageProps<"/[lang]/berita">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: getDict(toLang((await params).lang)).nav.news };
}

async function PostList({
  lang,
  searchParams,
}: {
  lang: Lang;
  searchParams: Props["searchParams"];
}) {
  const t = getDict(lang);
  const { kategori } = await searchParams;
  const categories = await getCategories(lang);
  const active = categories.find((c) => c.slug === kategori)?.slug;
  const posts = await getPosts(lang, active);
  const base = href(lang, "/berita");

  const chip = (isActive: boolean) =>
    `rounded-full border px-4 py-1.5 text-sm font-medium transition ${
      isActive
        ? "border-brand-700 bg-brand-700 text-white"
        : "border-line bg-white hover:border-brand-500"
    }`;

  return (
    <>
      <div className="mb-10 flex flex-wrap gap-2">
        <Link href={base} className={chip(!active)}>
          {t.news.all}
        </Link>
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`${base}?kategori=${encodeURIComponent(c.slug)}`}
            className={chip(active === c.slug)}
          >
            {c.name}
          </Link>
        ))}
      </div>
      {posts.length ? (
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {posts.map((p) => (
            <PostCard key={p.slug} post={p} lang={lang} />
          ))}
        </div>
      ) : (
        <p className="text-muted">{t.news.empty}</p>
      )}
    </>
  );
}

export default async function Page({ params, searchParams }: Props) {
  const lang = toLang((await params).lang);
  const t = getDict(lang);
  return (
    <>
      <PageHero title={t.nav.news} lead={t.news.lead} />
      <Section>
        <Suspense fallback={<p className="text-muted">{t.common.loading}</p>}>
          <PostList lang={lang} searchParams={searchParams} />
        </Suspense>
      </Section>
    </>
  );
}

import { PageHero, PostCard, Section } from "@/components/ui";
import {
  getPartners,
  getPosts,
  getTopic,
  type TopicSlug,
} from "@/lib/content";
import { getDict, href, type Lang } from "@/lib/i18n";

export async function TopicPage({
  lang,
  slug,
}: {
  lang: Lang;
  slug: TopicSlug;
}) {
  const t = getDict(lang);
  const topic = getTopic(lang, slug);
  const [posts, partners] = await Promise.all([
    getPosts(lang, topic.newsCategory),
    slug === "kerja-sama-internasional" ? getPartners(lang) : [],
  ]);

  return (
    <>
      <PageHero
        eyebrow={t.topic.eyebrow}
        title={topic.title}
        lead={topic.summary}
      />

      <Section>
        <div className="prose-body max-w-3xl text-lg leading-relaxed text-ink/90">
          {topic.intro.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </Section>

      <div className="border-y border-line bg-white">
        <Section title={t.topic.focus}>
          <div className="grid gap-4 md:grid-cols-3">
            {topic.focus.map((f, i) => (
              <div
                key={f.title}
                id={`fokus-${i + 1}`}
                className="scroll-mt-28 rounded-2xl bg-brand-50 p-6 target:ring-2 target:ring-accent"
              >
                <h3 className="font-display text-xl">{f.title}</h3>
                <p className="mt-2 text-sm text-muted">{f.body}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {partners.length > 0 && (
        <Section title={t.topic.partners}>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {partners.map((p) => (
              <li
                key={p.name}
                className="rounded-2xl border border-line bg-white p-5"
              >
                <p className="font-semibold">
                  {p.website ? (
                    <a href={p.website} className="hover:text-brand-500">
                      {p.name}
                    </a>
                  ) : (
                    p.name
                  )}
                </p>
                {p.country && (
                  <p className="mt-1 text-sm text-muted">{p.country}</p>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section
        title={t.topic.related}
        action={{ href: href(lang, "/berita"), label: t.common.seeAll }}
      >
        {posts.length ? (
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {posts.slice(0, 4).map((p) => (
              <PostCard key={p.slug} post={p} lang={lang} />
            ))}
          </div>
        ) : (
          <p className="text-muted">{t.topic.noNews}</p>
        )}
      </Section>
    </>
  );
}

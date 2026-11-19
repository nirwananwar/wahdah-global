import Image from "next/image";
import { Carousel } from "@/components/carousel";
import { PostCard, SampleBadge, Section } from "@/components/ui";
import {
  getDplnChapters,
  getPosts,
  getPrograms,
  getSlides,
  getStats,
  getTopic,
} from "@/lib/content";
import { getDict, href, toLang } from "@/lib/i18n";
import { pillarImages, programLinks, site } from "@/lib/site";

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const lang = toLang((await params).lang);
  const t = getDict(lang);
  const [banners, posts, programs, stats, chapters] = await Promise.all([
    getSlides(lang),
    getPosts(lang),
    getPrograms(lang),
    getStats(lang),
    getDplnChapters(lang),
  ]);

  // Pilihan yang muncul saat slide bidang kerja diklik.
  const focusOptions = (slug: "diplomasi" | "kerja-sama-internasional") =>
    getTopic(lang, slug).focus.map((f, i) => ({
      label: f.title,
      href: href(lang, `/${slug}#fokus-${i + 1}`),
    }));
  const pillarOptions: Record<string, { label: string; href: string }[]> = {
    "/diplomasi": focusOptions("diplomasi"),
    "/kerja-sama-internasional": focusOptions("kerja-sama-internasional"),
    "/peduli-ummat": programs.map((p) => ({
      label: p.title,
      href: href(lang, `/peduli-ummat/${p.slug}`),
    })),
    "/dpln": chapters.map((c) => ({
      label: c.country,
      href: href(lang, `/dpln#dpln-${c.id}`),
    })),
  };

  // Tanpa banner dari admin, carousel menampilkan empat bidang kerja.
  const slides = banners.length
    ? banners.map((b) => ({
        title: b.title,
        image: b.image,
        href: b.path.startsWith("/") ? href(lang, b.path) : b.path,
      }))
    : programLinks(t).map((p) => ({
        title: p.label,
        image: pillarImages[p.path] ?? null,
        href: href(lang, p.path),
        options: pillarOptions[p.path],
      }));

  // Foto untuk kolase statistik: sampul & galeri terbaru yang tersedia.
  const photos = [...posts, ...programs]
    .flatMap((item) => [item.cover, ...item.gallery])
    .filter((src): src is string => Boolean(src))
    .slice(0, 3);

  return (
    <>
      <h1 className="sr-only">{site.name}</h1>

      <section className="pt-10 sm:pt-12">
        <Carousel
          slides={slides}
          labels={{
            seeAll: t.common.seeAll,
            close: t.common.close,
            showOptions: t.common.showOptions,
          }}
        />
      </section>

      <Section
        title={t.home.newsTitle}
        action={{ href: href(lang, "/berita"), label: t.common.seeAll }}
        className="pt-20"
      >
        {posts.length ? (
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {posts.slice(0, 4).map((p) => (
              <PostCard key={p.slug} post={p} lang={lang} />
            ))}
          </div>
        ) : (
          <p className="text-muted">{t.home.noNews}</p>
        )}
      </Section>

      {stats.length > 0 && (
        <section className="container-page grid items-center gap-12 py-16 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="font-display text-xl text-muted">
              {t.home.statsTitle}
            </p>
            <p className="mt-1 flex flex-wrap items-center gap-3 font-display text-4xl sm:text-5xl">
              <span dir="ltr">{site.statsPeriod}</span>
              {stats.some((s) => s.sample) && <SampleBadge lang={lang} />}
            </p>
            <ul className="mt-8 space-y-4">
              {stats.map((s) => (
                <li
                  key={s.label}
                  className="flex items-center gap-4 rounded-xl bg-white px-5 py-4 shadow-sm"
                >
                  <span
                    aria-hidden
                    className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8L12 2z" />
                    </svg>
                  </span>
                  <span className="flex-1 font-display text-lg sm:text-xl">
                    {s.label}
                  </span>
                  <span className="font-display text-2xl text-brand-500 sm:text-3xl">
                    {s.value}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mx-auto aspect-square w-full max-w-md">
            <span className="absolute inset-[6%] rounded-full bg-accent/20" />
            <span className="absolute left-0 top-[8%] size-[24%] rounded-full bg-brand-500/25" />
            <span className="absolute bottom-[6%] left-[10%] size-[14%] rounded-full bg-brand-700" />
            {photos.length ? (
              <>
                <Photo src={photos[0]} className="right-0 top-0 w-[58%]" />
                {photos[1] && (
                  <Photo
                    src={photos[1]}
                    className="left-[4%] top-[30%] w-[52%]"
                  />
                )}
                {photos[2] && (
                  <Photo
                    src={photos[2]}
                    className="bottom-0 right-[6%] w-[60%]"
                  />
                )}
              </>
            ) : (
              <Image
                src="/logo.png"
                alt=""
                width={400}
                height={400}
                className="absolute inset-[18%] size-[64%]"
              />
            )}
          </div>
        </section>
      )}
    </>
  );
}

function Photo({ src, className }: { src: string; className: string }) {
  return (
    <span
      className={`absolute aspect-4/3 overflow-hidden rounded-xl shadow-lg ${className}`}
    >
      <Image
        src={src}
        alt=""
        fill
        sizes="(min-width: 1024px) 280px, 60vw"
        className="object-cover"
      />
    </span>
  );
}

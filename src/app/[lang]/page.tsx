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
        image: pillarImages[p.path]?.src ?? null,
        overlay: pillarImages[p.path]?.overlay,
        href: href(lang, p.path),
        options: pillarOptions[p.path],
      }));

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

      {stats.length > 0 && (
        <section className="container-page grid items-center gap-12 pt-20 pb-6 lg:grid-cols-[1.1fr_1fr]">
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
                  <StatIcon label={s.label} />
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

          <figure className="mx-auto w-full max-w-md px-3 sm:px-0">
            <div className="relative">
              <span className="absolute -inset-3 rounded-[2rem] bg-accent/20 sm:-inset-6" />
              <span className="absolute -top-6 -start-3 size-20 rounded-full bg-brand-500/25 sm:-top-8 sm:-start-8 sm:size-24" />
              <span className="absolute -bottom-5 -end-3 size-12 rounded-full bg-brand-700 sm:-bottom-6 sm:-end-4 sm:size-14" />
              <div className="relative aspect-4/5 overflow-hidden rounded-3xl shadow-xl">
                <Image
                  src="/home/pembangunan-masjid.jpg"
                  alt={t.home.statsImageAlt}
                  fill
                  sizes="(min-width: 1024px) 448px, 90vw"
                  className="object-cover object-[62%_50%]"
                />
                <span className="absolute inset-0 bg-linear-to-t from-brand-900/45 via-transparent to-transparent" />
              </div>
            </div>
            {/* Atribusi wajib lisensi CC BY-SA 4.0. */}
            <figcaption className="mt-10 text-center text-xs text-muted">
              Foto:{" "}
              <a
                href="https://commons.wikimedia.org/wiki/File:Poto_masjid_saat_pembangunan.jpg"
                className="underline hover:text-brand-700"
              >
                Masjid Paripurna Alfurqan
              </a>
              ,{" "}
              <a
                href="https://creativecommons.org/licenses/by-sa/4.0/"
                className="underline hover:text-brand-700"
              >
                CC BY-SA 4.0
              </a>
            </figcaption>
          </figure>
        </section>
      )}

      {/* Tanpa berita terbit, bagian ini disembunyikan. */}
      {posts.length > 0 && (
        <Section
          title={t.home.newsTitle}
          action={{ href: href(lang, "/berita"), label: t.common.seeAll }}
        >
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {posts.slice(0, 4).map((p) => (
              <PostCard key={p.slug} post={p} lang={lang} />
            ))}
          </div>
        </Section>
      )}
    </>
  );
}

/** Ikon yang mewakili tiap baris statistik, dikenali dari labelnya (tiga bahasa). */
function StatIcon({ label }: { label: string }) {
  const l = label.toLowerCase();
  const kind = /masjid|mosque|مسجد|مساجد/.test(l)
    ? "mosque"
    : /perwakilan|dpln|chapter|فروع|ممثل/.test(l)
      ? "chapter"
      : /negara|countr|دول|بلد/.test(l)
        ? "globe"
        : /penerima|benefic|مستفيد/.test(l)
          ? "people"
          : /program|peduli|ummah|care|رعاية|برامج/.test(l)
            ? "care"
            : "star";
  const paths: Record<string, React.ReactNode> = {
    // Bola dunia
    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
      </>
    ),
    // Masjid berkubah dengan menara
    mosque: (
      <>
        <path d="M3 21h18M5 21v-7h14v7" />
        <path d="M7 14a5 5 0 0 1 10 0" />
        <path d="M12 6v3M12 4.5h.01" />
        <path d="M10.5 21v-3a1.5 1.5 0 0 1 3 0v3" />
        <path d="M21 21V10M21 8.5h.01" />
      </>
    ),
    // Gedung perwakilan berbendera
    chapter: (
      <>
        <path d="M4 21h16M6 21V10h12v11M9 21v-4h6v4M9 13h.01M15 13h.01" />
        <path d="M12 10V3l5 2-5 2" />
      </>
    ),
    // Tangan memberi dengan hati
    care: (
      <>
        <path d="M12 9.5S9 7.6 9 5.5a1.7 1.7 0 0 1 3-1 1.7 1.7 0 0 1 3 1c0 2.1-3 4-3 4z" />
        <path d="M3 14h3l4.5 2.5H14a1.5 1.5 0 0 0 0-3h-2" />
        <path d="M15 15l4-1.5a1.4 1.4 0 0 1 1 2.6L13 20l-7-1.5V14" />
      </>
    ),
    // Sekelompok orang
    people: (
      <>
        <circle cx="9" cy="8" r="3.2" />
        <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M16 14.2c2.8.3 5 2.7 5 5.8" />
      </>
    ),
    star: (
      <path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6-4.5-4.2 6.1-.7z" />
    ),
  };
  return (
    <span
      aria-hidden
      className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-700 text-accent"
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {paths[kind]}
      </svg>
    </span>
  );
}

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { DplnMap } from "@/components/dpln-map";
import {
  getCountryNumerics,
  getDplnChapters,
  getPartners,
  getPosts,
  getProjects,
  getSlides,
  getStats,
  type Post,
  type Project,
} from "@/lib/content";
import { formatDate, getDict, href, toLang, type Lang } from "@/lib/i18n";
import { getHome } from "@/lib/i18n-home";
import { getPortal, label } from "@/lib/i18n-portal";
import { site } from "@/lib/site";

/* ---------- Unsur tampilan kecil yang dipakai berulang di Home ---------- */

function Eyebrow({
  children,
  light = false,
}: {
  children: ReactNode;
  light?: boolean;
}) {
  return (
    <p
      className={`flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] ${
        light ? "text-white/70" : "text-brand-500"
      }`}
    >
      <span aria-hidden className="h-px w-8 bg-accent-dark" />
      {children}
    </p>
  );
}

function Heading({
  children,
  light = false,
}: {
  children: ReactNode;
  light?: boolean;
}) {
  return (
    <h2
      className={`mt-4 max-w-2xl font-display text-3xl leading-tight sm:text-4xl ${
        light ? "text-white" : "text-ink"
      }`}
    >
      {children}
    </h2>
  );
}

function TextLink({
  href: to,
  children,
  light = false,
}: {
  href: string;
  children: ReactNode;
  light?: boolean;
}) {
  return (
    <Link
      href={to}
      className={`group inline-flex items-center gap-2 text-sm font-semibold ${
        light
          ? "text-white hover:text-accent"
          : "text-brand-700 hover:text-brand-500"
      }`}
    >
      {children}
      <span
        aria-hidden
        className="transition group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5"
      >
        →
      </span>
    </Link>
  );
}

const btn = {
  light:
    "inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-brand-900 transition hover:bg-accent",
  ghost:
    "inline-flex items-center justify-center rounded-lg border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10",
  navy: "inline-flex items-center justify-center rounded-lg bg-brand-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-900",
};

const num = (n: number, lang: Lang) =>
  n.toLocaleString(lang === "ar" ? "ar-u-nu-latn" : "id-ID");

/* ---------- Halaman ---------- */

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const lang = toLang((await params).lang);
  const t = getDict(lang);
  const h = getHome(lang);
  const portal = getPortal(lang);
  const [banners, posts, projects, stats, chapters, partners, numerics] =
    await Promise.all([
      getSlides(lang),
      getPosts(lang),
      getProjects(lang),
      getStats(lang),
      getDplnChapters(lang),
      getPartners(lang),
      getCountryNumerics(),
    ]);

  // Banner pertama dari admin (bila ada) menggantikan foto hero bawaan.
  const heroImage = banners.find((b) => b.image)?.image ?? "/home/hero.jpg";

  // Angka jaringan dari data nyata; yang masih nol tidak ditampilkan.
  const activeChapters = chapters.filter((c) => c.status === "Aktif");
  const partnerCountries = new Set(partners.map((p) => p.code).filter(Boolean))
    .size;
  const presence = [
    { value: partnerCountries, label: h.presence.countries },
    { value: activeChapters.length, label: h.presence.representatives },
    { value: partners.length, label: h.presence.networks },
  ].filter((s) => s.value > 0);

  // Proyek pilihan: yang berjalan lebih dulu, maksimal tiga.
  const featured = [...projects]
    .sort(
      (a, b) =>
        Number(b.status === "Berjalan") - Number(a.status === "Berjalan"),
    )
    .slice(0, 3);

  const areas = [
    { path: "/diplomasi", image: "/home/area-diplomacy.jpg" },
    { path: "/kerja-sama-internasional", image: "/home/area-cooperation.jpg" },
    { path: "/peduli-ummat", image: "/home/area-humanitarian.jpg" },
    {
      path: "/kerja-sama-internasional#fokus-2",
      image: "/home/area-dawah.jpg",
    },
  ].map((a, i) => ({ ...a, ...h.areas.items[i] }));

  return (
    <>
      <h1 className="sr-only">{site.name}</h1>

      {/* 1. HERO
          Layar lebar (≥1360px): foto di sisi awal dengan perbandingan 3:2 seperti aslinya
          (semua orang tampil utuh, tanpa lapisan gelap; hanya 10% tepinya memudar ke navy),
          teks di kolom sisi akhir di atas navy.
          Di bawahnya (laptop kecil, tablet, HP): foto utuh di atas, teks di bawah. */}
      <section className="relative isolate overflow-hidden bg-brand-900 min-[1360px]:flex min-[1360px]:min-h-[min(40vw,780px)]">
        <div className="relative aspect-16/10 w-full lg:max-[1359px]:aspect-auto lg:max-[1359px]:h-[min(62vh,560px)] min-[1360px]:aspect-auto min-[1360px]:w-[min(60vw,1170px)] min-[1360px]:shrink-0">
          <Image
            src={heroImage}
            alt=""
            fill
            priority
            sizes="(min-width: 1360px) 60vw, 100vw"
            className="object-cover object-[0%_35%]"
          />
          {/* Foto di atas teks: hanya tepi bawah memudar ke navy. */}
          <span
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-1/4 bg-linear-to-t from-brand-900 to-transparent min-[1360px]:hidden"
          />
          {/* Foto di samping teks: hanya 10% tepi akhir memudar ke navy. */}
          <span
            aria-hidden
            className="absolute inset-0 hidden bg-linear-to-r from-transparent from-90% to-brand-900 min-[1360px]:block rtl:bg-linear-to-l"
          />
        </div>
        <div className="mx-auto w-full max-w-[72rem] px-5 pb-16 pt-4 sm:pb-20 lg:pt-8 min-[1360px]:mx-0 min-[1360px]:flex min-[1360px]:max-w-none min-[1360px]:flex-1 min-[1360px]:items-center min-[1360px]:py-10 min-[1360px]:pe-16 min-[1360px]:ps-12">
          <div className="max-w-2xl min-[1360px]:max-w-[32rem]">
            <Eyebrow light>{h.hero.eyebrow}</Eyebrow>
            <p className="mt-6 font-display text-[2rem] leading-[1.12] text-white sm:text-5xl min-[1360px]:text-[2.75rem] 2xl:text-[3.1rem]">
              {h.hero.title}
            </p>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg min-[1360px]:text-base 2xl:text-lg">
              {h.hero.lead}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href="#bidang-kerja" className={btn.light}>
                {h.hero.discover}
              </a>
              <Link
                href={`${href(lang, "/hubungi-kami")}#kemitraan`}
                className={btn.ghost}
              >
                {h.hero.partner}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ABOUT */}
      <div className="bg-white">
        <section className="container-page grid items-center gap-12 py-20 lg:grid-cols-[1.05fr_1fr] lg:gap-20 lg:py-28">
          <div>
            <Eyebrow>{h.about.eyebrow}</Eyebrow>
            <Heading>{h.about.title}</Heading>
            <div className="mt-6 space-y-4 text-base leading-relaxed text-ink/80 sm:text-lg">
              {t.about.profile.slice(0, 2).map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <Link
              href={href(lang, "/tentang-kami")}
              className={`${btn.navy} mt-8`}
            >
              {h.about.cta}
            </Link>
          </div>
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="relative aspect-4/5 overflow-hidden rounded-2xl">
              <Image
                src="/home/about.jpg"
                alt=""
                fill
                sizes="(min-width: 1024px) 520px, 90vw"
                className="object-cover object-top"
              />
            </div>
          </div>
        </section>
      </div>

      {/* 3. GLOBAL PRESENCE */}
      {activeChapters.length > 0 && (
        <section className="bg-brand-900 text-white">
          <div className="container-page grid items-center gap-12 py-20 lg:grid-cols-[1fr_1.45fr] lg:py-24">
            <div>
              <Eyebrow light>{h.presence.eyebrow}</Eyebrow>
              <Heading light>{h.presence.title}</Heading>
              <p className="mt-5 max-w-md leading-relaxed text-white/75">
                {h.presence.lead}
              </p>
              <dl className="mt-10 flex flex-wrap gap-x-12 gap-y-6">
                {presence.map((s) => (
                  <div
                    key={s.label}
                    className="flex flex-col border-s border-white/20 ps-5"
                  >
                    <dt className="text-sm text-white/65">{s.label}</dt>
                    <dd className="order-first font-display text-4xl text-white">
                      {num(s.value, lang)}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-8 text-sm leading-relaxed text-white/70">
                <span className="font-semibold text-white">
                  {h.presence.chapters}:{" "}
                </span>
                {activeChapters.map((c) => c.country).join(" · ")}
              </p>
              <div className="mt-8">
                <TextLink href={href(lang, "/dpln")} light>
                  {h.presence.cta}
                </TextLink>
              </div>
            </div>
            <DplnMap
              chapters={activeChapters}
              numerics={numerics}
              lang={lang}
            />
          </div>
        </section>
      )}

      {/* 4. AREAS OF WORK */}
      <section id="bidang-kerja" className="scroll-mt-20 bg-sand">
        <div className="container-page py-20 lg:py-28">
          <Eyebrow>{h.areas.eyebrow}</Eyebrow>
          <Heading>{h.areas.title}</Heading>
          <div className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {areas.map((a, i) => (
              <Link
                key={a.title}
                href={href(lang, a.path)}
                className="group flex flex-col"
              >
                <div className="relative aspect-4/3 overflow-hidden rounded-xl bg-brand-900">
                  <Image
                    src={a.image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 270px, (min-width: 640px) 45vw, 92vw"
                    className="object-cover transition duration-500 group-hover:scale-[1.04]"
                  />
                </div>
                <p className="mt-5 font-display text-sm text-brand-500">
                  0{i + 1}
                </p>
                <h3 className="mt-1 font-display text-xl leading-snug text-ink group-hover:text-brand-700">
                  {a.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                  {a.body}
                </p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-700">
                  {h.areas.learn}
                  <span
                    aria-hidden
                    className="transition group-hover:translate-x-0.5 rtl:-scale-x-100"
                  >
                    →
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. OUR IMPACT */}
      {stats.length > 0 && (
        <div className="bg-white">
          <section className="container-page grid items-center gap-12 py-20 lg:grid-cols-[1fr_1.15fr] lg:gap-20 lg:py-28">
            <figure className="order-last lg:order-first">
              <div className="relative aspect-4/5 overflow-hidden rounded-2xl sm:aspect-4/3 lg:aspect-4/5">
                <Image
                  src="/home/pembangunan-masjid.jpg"
                  alt={t.home.statsImageAlt}
                  fill
                  sizes="(min-width: 1024px) 480px, 92vw"
                  className="object-cover object-[62%_50%]"
                />
              </div>
              {/* Atribusi wajib lisensi CC BY-SA 4.0. */}
              <figcaption className="mt-3 text-xs text-muted">
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
            <div>
              <Eyebrow>{h.impact.eyebrow}</Eyebrow>
              <Heading>
                {h.impact.title}{" "}
                <span className="text-brand-500" dir="ltr">
                  {site.statsPeriod}
                </span>
              </Heading>
              <dl className="mt-10 grid grid-cols-2 gap-x-8 sm:gap-x-12">
                {stats.map((s) => (
                  <div
                    key={s.label}
                    className="flex flex-col border-t border-line py-6"
                  >
                    <dt className="text-sm leading-snug text-muted">
                      {s.label}
                    </dt>
                    <dd
                      className="order-first font-display text-4xl text-brand-700 sm:text-5xl"
                      dir="ltr"
                    >
                      {s.value}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 text-xs text-muted">{h.impact.note}</p>
            </div>
          </section>
        </div>
      )}

      {/* 6. FEATURED PROJECTS */}
      {featured.length > 0 && (
        <section className="bg-sand">
          <div className="container-page py-20 lg:py-28">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <Eyebrow>{h.projects.eyebrow}</Eyebrow>
                <Heading>{h.projects.title}</Heading>
              </div>
              <TextLink href={href(lang, "/peduli-ummat")}>
                {h.projects.all}
              </TextLink>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {featured.map((p) => (
                <FeaturedProject
                  key={p.slug}
                  project={p}
                  lang={lang}
                  cta={h.projects.view}
                  portal={portal}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. LATEST NEWS */}
      <div className="bg-white">
        <section className="container-page py-20 lg:py-28">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Eyebrow>{h.news.eyebrow}</Eyebrow>
              <Heading>{h.news.title}</Heading>
            </div>
            {posts.length > 0 && (
              <TextLink href={href(lang, "/berita")}>{h.news.all}</TextLink>
            )}
          </div>
          {posts.length > 0 ? (
            <NewsLayout posts={posts.slice(0, 4)} lang={lang} />
          ) : (
            <div className="mt-12 grid items-center gap-6 rounded-2xl bg-sand px-6 py-12 sm:px-12 md:grid-cols-[auto_1fr_auto]">
              <span
                aria-hidden
                className="grid size-14 place-items-center rounded-full bg-white text-brand-700"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 5h13a2 2 0 0 1 2 2v12H6a2 2 0 0 1-2-2z" />
                  <path d="M19 9h1a1 1 0 0 1 1 1v8a1 1 0 0 1-2 0M8 9h7M8 13h7M8 17h4" />
                </svg>
              </span>
              <div>
                <p className="font-display text-xl text-ink">
                  {h.news.emptyTitle}
                </p>
                <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted">
                  {h.news.emptyBody}
                </p>
              </div>
              <TextLink href={href(lang, "/tentang-kami")}>
                {h.news.emptyCta}
              </TextLink>
            </div>
          )}
        </section>
      </div>

      {/* 8. PARTNERSHIP CTA */}
      <section className="relative isolate overflow-hidden bg-brand-700">
        <span
          aria-hidden
          className="absolute -end-32 -top-40 -z-10 size-[28rem] rounded-full bg-brand-500/25 blur-3xl"
        />
        <span
          aria-hidden
          className="absolute -bottom-48 -start-24 -z-10 size-[24rem] rounded-full bg-accent/10 blur-3xl"
        />
        <div className="container-page flex flex-col gap-8 py-20 lg:flex-row lg:items-center lg:justify-between lg:py-24">
          <div className="max-w-2xl">
            <p className="font-display text-3xl leading-tight text-white sm:text-4xl">
              {h.cta.title}
            </p>
            <p className="mt-4 text-base leading-relaxed text-white/75 sm:text-lg">
              {h.cta.body}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link
              href={`${href(lang, "/hubungi-kami")}#kemitraan`}
              className={btn.light}
            >
              {h.cta.partner}
            </Link>
            <Link href={href(lang, "/hubungi-kami")} className={btn.ghost}>
              {h.cta.contact}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

/* ---------- Kartu proyek pilihan ---------- */

function FeaturedProject({
  project: p,
  lang,
  cta,
  portal,
}: {
  project: Project;
  lang: Lang;
  cta: string;
  portal: ReturnType<typeof getPortal>;
}) {
  const t = portal.projects;
  return (
    <Link
      href={href(lang, `/peduli-ummat/proyek/${p.slug}`)}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white transition hover:-translate-y-0.5"
    >
      <div className="relative aspect-16/10 bg-brand-900">
        {p.cover ? (
          <Image
            src={p.cover}
            alt=""
            fill
            sizes="(min-width: 1024px) 370px, (min-width: 768px) 45vw, 92vw"
            className="object-cover"
          />
        ) : (
          <Image
            src="/logo.png"
            alt=""
            width={96}
            height={96}
            className="absolute inset-0 m-auto size-20 opacity-80"
          />
        )}
        <span className="absolute start-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-brand-900">
          {label(t.statuses, p.status)}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-500">
          {[label(t.categories, p.category), p.location]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <h3 className="mt-2 font-display text-xl leading-snug text-ink group-hover:text-brand-700">
          {p.title}
        </h3>
        {p.summary && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
            {p.summary}
          </p>
        )}
        <div className="flex-1" />
        <div className="mt-6">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-ink">{t.progress}</span>
            <span className="text-muted">{p.progress}%</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-brand-100">
            <div
              className="h-full rounded-full bg-brand-500"
              style={{ width: `${p.progress}%` }}
            />
          </div>
        </div>
        <span className="mt-5 text-sm font-semibold text-brand-700">
          {cta} →
        </span>
      </div>
    </Link>
  );
}

/* ---------- Berita: satu utama + pendukung ---------- */

function NewsLayout({ posts, lang }: { posts: Post[]; lang: Lang }) {
  const [main, ...rest] = posts;
  const meta = (p: Post) => `${p.categoryName} · ${formatDate(p.date, lang)}`;
  return (
    <div className="mt-12 grid gap-10 lg:grid-cols-[1.35fr_1fr] lg:gap-14">
      <Link href={href(lang, `/berita/${main.slug}`)} className="group block">
        <div className="relative aspect-16/10 overflow-hidden rounded-2xl bg-brand-900">
          {main.cover ? (
            <Image
              src={main.cover}
              alt=""
              fill
              sizes="(min-width: 1024px) 640px, 92vw"
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <Image
              src="/logo.png"
              alt=""
              width={120}
              height={120}
              className="absolute inset-0 m-auto size-24 opacity-80"
            />
          )}
        </div>
        <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-brand-500">
          {meta(main)}
        </p>
        <h3 className="mt-2 font-display text-2xl leading-snug text-ink group-hover:text-brand-700 sm:text-3xl">
          {main.title}
        </h3>
        {main.excerpt && (
          <p className="mt-3 line-clamp-3 leading-relaxed text-muted">
            {main.excerpt}
          </p>
        )}
      </Link>
      {rest.length > 0 && (
        <ul className="divide-y divide-line">
          {rest.map((p) => (
            <li key={p.slug}>
              <Link
                href={href(lang, `/berita/${p.slug}`)}
                className="group flex gap-5 py-5 first:pt-0"
              >
                <div className="relative aspect-4/3 w-32 shrink-0 overflow-hidden rounded-lg bg-brand-900 sm:w-40">
                  {p.cover ? (
                    <Image
                      src={p.cover}
                      alt=""
                      fill
                      sizes="160px"
                      className="object-cover"
                    />
                  ) : (
                    <Image
                      src="/logo.png"
                      alt=""
                      width={56}
                      height={56}
                      className="absolute inset-0 m-auto size-12 opacity-80"
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand-500">
                    {meta(p)}
                  </p>
                  <h3 className="mt-1.5 line-clamp-3 font-display text-lg leading-snug text-ink group-hover:text-brand-700">
                    {p.title}
                  </h3>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

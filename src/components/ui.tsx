import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Post, Program } from "@/lib/content";
import { formatDate, getDict, href, type Lang } from "@/lib/i18n";

/** Panah "lanjut" yang mengikuti arah baca (dibalik untuk bahasa Arab). */
export function Arrow({ back = false }: { back?: boolean }) {
  return (
    <span
      aria-hidden
      className={`inline-block ${back ? "rotate-180 rtl:rotate-0" : "rtl:rotate-180"}`}
    >
      →
    </span>
  );
}

export function PageHero({
  eyebrow,
  title,
  lead,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
}) {
  return (
    <section className="bg-brand-900 text-white">
      <div className="container-page py-16 sm:py-20">
        {eyebrow && (
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-3 max-w-3xl font-display text-4xl leading-tight sm:text-5xl">
          {title}
        </h1>
        {lead && (
          <p className="mt-5 max-w-2xl text-lg text-brand-100">{lead}</p>
        )}
      </div>
    </section>
  );
}

export function Section({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: { href: string; label: string };
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`container-page py-14 ${className}`}>
      {(title || action) && (
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          {title && <h2 className="font-display text-3xl">{title}</h2>}
          {action && (
            <Link
              href={action.href}
              className="text-sm font-semibold text-brand-700 hover:underline"
            >
              {action.label} <Arrow />
            </Link>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

export function SampleBadge({ lang }: { lang: Lang }) {
  return (
    <span className="rounded-full border border-accent-dark/50 bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent-dark">
      {getDict(lang).common.sample}
    </span>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
      {children}
    </span>
  );
}

export function Cover({ src, sizes }: { src: string | null; sizes: string }) {
  return (
    <span className="relative block aspect-4/3 overflow-hidden rounded-xl bg-linear-to-br from-brand-700 to-brand-900">
      {src ? (
        <Image
          src={src}
          alt=""
          fill
          sizes={sizes}
          className="object-cover transition duration-300 group-hover:scale-105"
        />
      ) : (
        <Image
          src="/logo.png"
          alt=""
          width={160}
          height={160}
          className="absolute inset-0 m-auto size-2/5 opacity-90"
        />
      )}
    </span>
  );
}

export const cardSizes = "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw";

export function PostCard({ post, lang }: { post: Post; lang: Lang }) {
  const t = getDict(lang);
  return (
    <Link
      href={href(lang, `/berita/${post.slug}`)}
      className="group flex flex-col"
    >
      <Cover src={post.cover} sizes={cardSizes} />
      <h3 className="mt-3 font-display text-lg leading-snug group-hover:text-brand-500">
        {post.title}
      </h3>
      <p className="mt-1 line-clamp-4 flex-1 text-sm text-ink/80">
        <span className="font-semibold">
          {t.common.published}: {formatDate(post.date, lang)}
        </span>{" "}
        {post.excerpt}
      </p>
      <span className="mt-4 flex flex-wrap items-center gap-2">
        <span className="rounded-sm bg-accent px-2.5 py-1 text-sm font-semibold text-brand-900">
          {post.categoryName}
        </span>
        {post.sample && <SampleBadge lang={lang} />}
      </span>
    </Link>
  );
}

export function ProgramCard({
  program,
  lang,
}: {
  program: Program;
  lang: Lang;
}) {
  const t = getDict(lang);
  return (
    <Link
      href={href(lang, `/peduli-ummat/${program.slug}`)}
      className="group flex flex-col"
    >
      <Cover src={program.cover} sizes={cardSizes} />
      <h3 className="mt-3 font-display text-lg leading-snug group-hover:text-brand-500">
        {program.title}
      </h3>
      {program.region && (
        <p className="mt-1 text-xs uppercase tracking-wide text-muted">
          {program.region}
        </p>
      )}
      <p className="mt-2 line-clamp-4 flex-1 text-sm text-ink/80">
        {program.summary}
      </p>
      <span className="mt-4 flex flex-wrap items-center gap-2">
        <span className="rounded-sm bg-accent px-2.5 py-1 text-sm font-semibold text-brand-900">
          {t.statuses[program.status]}
        </span>
        {program.sample && <SampleBadge lang={lang} />}
      </span>
      <Funding program={program} lang={lang} compact />
    </Link>
  );
}

export const rupiah = (n: number, lang: Lang) =>
  new Intl.NumberFormat(lang === "ar" ? "ar-u-nu-latn" : "id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

/** Biaya per unit dan progres dana program; tidak tampil bila belum diisi. */
export function Funding({
  program,
  lang,
  compact = false,
}: {
  program: Program;
  lang: Lang;
  compact?: boolean;
}) {
  const t = getDict(lang).programs;
  const { unitCost, target, raised } = program;
  if (!unitCost && !target) return null;
  const pct = target ? Math.min(100, Math.round((raised / target) * 100)) : 0;
  return (
    <div
      className={
        compact
          ? "mt-4 space-y-2"
          : "mt-8 space-y-3 rounded-2xl border border-line bg-white p-6"
      }
    >
      {unitCost && (
        <p className={compact ? "text-sm" : "text-base"}>
          <span className="font-semibold text-brand-700">{t.unitCost}:</span>{" "}
          {unitCost}
        </p>
      )}
      {target > 0 && (
        <div>
          <div
            className="h-2 overflow-hidden rounded-full bg-brand-100"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-brand-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p
            className={`mt-1.5 text-ink/80 ${compact ? "text-xs" : "text-sm"}`}
          >
            <span className="font-semibold text-ink">
              {t.raised} {rupiah(raised, lang)}
            </span>{" "}
            {t.target} {rupiah(target, lang)} · {pct}%
          </p>
        </div>
      )}
    </div>
  );
}

export function ButtonLink({
  href: target,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={target}
      className="inline-flex items-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-brand-900 transition hover:bg-white"
    >
      {children}
    </Link>
  );
}

export function Gallery({
  images,
  lang,
  title,
}: {
  images: string[];
  lang: Lang;
  title?: string;
}) {
  if (!images.length) return null;
  return (
    <section className="mt-10 border-t border-line pt-8">
      <h2 className="font-display text-2xl">{title ?? getDict(lang).common.gallery}</h2>
      <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((src, i) => (
          <li key={src}>
            <a
              href={src}
              target="_blank"
              rel="noreferrer"
              className="relative block aspect-4/3 overflow-hidden rounded-xl"
            >
              <Image
                src={src}
                alt={`${i + 1}`}
                fill
                sizes="(min-width: 640px) 250px, 50vw"
                className="object-cover transition hover:scale-105"
              />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

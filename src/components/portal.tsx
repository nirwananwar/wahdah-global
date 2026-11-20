import Image from "next/image";
import Link from "next/link";
import { submitInquiry } from "@/app/[lang]/hubungi-kami/actions";
import { Cover, cardSizes, rupiah } from "@/components/ui";
import type { Partner, Project, Relation } from "@/lib/content";
import { formatDate, href, type Lang } from "@/lib/i18n";
import { getPortal, label } from "@/lib/i18n-portal";

const pct = (raised: number, target: number) =>
  target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;

function Bar({ value, tone = "brand" }: { value: number; tone?: "brand" | "accent" }) {
  return (
    <div
      className="h-2 overflow-hidden rounded-full bg-brand-100"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`h-full rounded-full ${tone === "brand" ? "bg-brand-500" : "bg-accent-dark"}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

/** Progres pekerjaan & dana terverifikasi, masing-masing dengan tanggal pembaruan. */
export function ProjectProgress({
  project: p,
  lang,
  compact = false,
}: {
  project: Project;
  lang: Lang;
  compact?: boolean;
}) {
  const t = getPortal(lang).projects;
  const text = compact ? "text-xs" : "text-sm";
  return (
    <div className={compact ? "mt-3 space-y-3" : "space-y-5"}>
      <div>
        <div className={`mb-1.5 flex justify-between gap-2 ${text}`}>
          <span className="font-semibold">{t.progress}</span>
          <span>{p.progress}%</span>
        </div>
        <Bar value={p.progress} tone="accent" />
        {!compact && p.progressAsOf && (
          <p className="mt-1 text-xs text-muted">
            {t.asOf} {formatDate(p.progressAsOf, lang)}
          </p>
        )}
      </div>
      {p.target > 0 && (
        <div>
          <div className={`mb-1.5 flex justify-between gap-2 ${text}`}>
            <span className="font-semibold">{t.funds}</span>
            <span>{pct(p.raised, p.target)}%</span>
          </div>
          <Bar value={pct(p.raised, p.target)} />
          <p className={`mt-1 ${compact ? "text-xs" : "text-sm"} text-ink/80`}>
            <span className="font-semibold text-ink">{rupiah(p.raised, lang)}</span> {t.of}{" "}
            {rupiah(p.target, lang)}
            {!compact && p.fundsAsOf && (
              <span className="text-muted">
                {" "}
                · {t.asOf} {formatDate(p.fundsAsOf, lang)}
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}

export function ProjectCard({ project: p, lang }: { project: Project; lang: Lang }) {
  const t = getPortal(lang).projects;
  return (
    <Link href={href(lang, `/peduli-ummat/proyek/${p.slug}`)} className="group flex flex-col">
      <Cover src={p.cover} sizes={cardSizes} />
      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-brand-500">
        {label(t.categories, p.category)} · {label(t.statuses, p.status)}
      </p>
      <h3 className="mt-1 font-display text-lg leading-snug group-hover:text-brand-500">{p.title}</h3>
      {p.location && <p className="mt-1 text-sm text-muted">{p.location}</p>}
      <div className="flex-1" />
      <ProjectProgress project={p} lang={lang} compact />
    </Link>
  );
}

export function PartnerGrid({ partners, lang }: { partners: Partner[]; lang: Lang }) {
  const t = getPortal(lang).partners;
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {partners.map((p) => (
        <li key={p.name} className="flex gap-4 rounded-2xl border border-line bg-white p-5">
          {p.logo && (
            <Image
              src={p.logo}
              alt=""
              width={56}
              height={56}
              className="size-14 shrink-0 rounded-xl object-contain"
            />
          )}
          <div className="min-w-0">
            <p className="font-semibold">
              {p.website ? (
                <a href={p.website} className="hover:text-brand-500" rel="noreferrer" target="_blank">
                  {p.name}
                </a>
              ) : (
                p.name
              )}
            </p>
            <p className="mt-0.5 text-sm text-muted">
              {[p.country, label(t.categories, p.category)].filter(Boolean).join(" · ")}
            </p>
            {p.types.length > 0 && (
              <p className="mt-3 flex flex-wrap gap-1.5">
                {p.types.map((x) => (
                  <span key={x} className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
                    {label(t.types, x)}
                  </span>
                ))}
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

export function RelationList({ relations, lang }: { relations: Relation[]; lang: Lang }) {
  const t = getPortal(lang).relations;
  return (
    <ol className="relative space-y-6 border-s-2 border-brand-100 ps-6">
      {relations.map((r, i) => (
        <li key={`${r.date}-${i}`} className="relative">
          <span className="absolute -start-[33px] top-1.5 size-4 rounded-full border-4 border-white bg-brand-500" />
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
            {formatDate(r.date, lang)} · {label(t.kinds, r.kind)}
            {r.country && ` · ${r.country}`}
          </p>
          <h3 className="mt-1 font-display text-lg">{r.title}</h3>
          {r.partner && <p className="text-sm text-muted">{r.partner}</p>}
          {r.summary && <p className="mt-2 max-w-3xl text-ink/85">{r.summary}</p>}
        </li>
      ))}
    </ol>
  );
}

export function PartnershipCta({ lang }: { lang: Lang }) {
  const t = getPortal(lang).partners;
  return (
    <div className="flex flex-col gap-5 rounded-2xl bg-brand-700 p-6 text-white sm:p-8 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="font-display text-2xl">{t.ctaTitle}</h2>
        <p className="mt-2 max-w-2xl text-brand-100">{t.ctaBody}</p>
      </div>
      <Link
        href={`${href(lang, "/hubungi-kami")}#kemitraan`}
        className="shrink-0 rounded-lg bg-accent px-5 py-3 text-sm font-bold text-brand-900 hover:bg-white"
      >
        {t.ctaButton}
      </Link>
    </div>
  );
}

const field =
  "mt-1 w-full rounded-xl border border-line bg-white px-4 py-2.5 font-normal outline-none focus:border-brand-500";

export function InquiryForm({
  lang,
  countries,
  status,
}: {
  lang: Lang;
  countries: { code: string; name: string }[];
  status?: "sent" | "failed";
}) {
  const t = getPortal(lang).form;
  return (
    <form action={submitInquiry.bind(null, lang)} className="grid gap-5 sm:grid-cols-2">
      {status === "sent" && (
        <p className="rounded-xl bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-700 sm:col-span-2">{t.sent}</p>
      )}
      {status === "failed" && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 sm:col-span-2">{t.failed}</p>
      )}
      {/* Jebakan bot: kolom tersembunyi yang tidak diisi manusia. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <label className="text-sm font-semibold">
        {t.name} *
        <input name="name" required minLength={2} maxLength={120} className={field} />
      </label>
      <label className="text-sm font-semibold">
        {t.organization}
        <input name="organization" maxLength={200} className={field} />
      </label>
      <label className="text-sm font-semibold">
        {t.country}
        <select name="country_code" defaultValue="" className={field}>
          <option value="">{t.choose}</option>
          {countries.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm font-semibold">
        {t.interest}
        <select name="interest" defaultValue="Kemanusiaan" className={field}>
          {Object.entries(t.interests).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm font-semibold">
        {t.email} *
        <input name="email" type="email" required maxLength={200} dir="ltr" className={field} />
      </label>
      <label className="text-sm font-semibold">
        {t.phone}
        <input name="phone" type="tel" maxLength={40} dir="ltr" className={field} />
      </label>
      <label className="text-sm font-semibold sm:col-span-2">
        {t.message} *
        <textarea name="message" required minLength={10} maxLength={5000} rows={6} className={field} />
      </label>
      <div className="sm:col-span-2">
        <button className="rounded-lg bg-brand-700 px-6 py-3 text-sm font-bold text-white hover:bg-brand-900">
          {t.submit}
        </button>
      </div>
    </form>
  );
}

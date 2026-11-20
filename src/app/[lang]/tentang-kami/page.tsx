import type { Metadata } from "next";
import { PageHero, Section } from "@/components/ui";
import { getDocuments } from "@/lib/content";
import { getDict, toLang } from "@/lib/i18n";

type Props = PageProps<"/[lang]/tentang-kami">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: getDict(toLang((await params).lang)).nav.about };
}

// Teks profil, visi, dan misi ada di src/lib/i18n.ts.
export default async function Page({ params }: Props) {
  const lang = toLang((await params).lang);
  const t = getDict(lang);
  const docs = await getDocuments(lang);
  return (
    <>
      <PageHero title={t.nav.about} lead={t.description} />
      <Section title={t.about.profileTitle}>
        <div className="prose-body max-w-3xl text-lg leading-relaxed text-ink/90">
          {t.about.profile.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </Section>
      <div className="border-y border-line bg-white">
        <Section>
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <h2 className="font-display text-3xl">{t.about.vision}</h2>
              <p className="mt-4 text-lg text-ink/90">{t.about.visionText}</p>
            </div>
            <div>
              <h2 className="font-display text-3xl">{t.about.mission}</h2>
              <ol className="mt-4 space-y-3">
                {t.about.missions.map((m, i) => (
                  <li key={m} className="flex gap-3">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                      {i + 1}
                    </span>
                    {m}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Section>
      </div>
      {docs.length > 0 && (
        <Section title={t.about.legalTitle}>
          <p className="-mt-4 mb-8 max-w-3xl text-ink/80">
            {t.about.legalLead}
          </p>
          <ul className="grid gap-4 md:grid-cols-2">
            {docs.map((d, i) => (
              <li
                key={`${d.title}-${i}`}
                className="flex items-start gap-4 rounded-2xl border border-line bg-white p-5"
              >
                <span
                  aria-hidden
                  className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
                    <path d="M14 3v5h5M9 13h6M9 17h4" />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">
                    {(t.about.docKinds as Record<string, string>)[d.kind] ?? d.kind}
                  </p>
                  <p className="mt-1 font-display text-lg">{d.title}</p>
                  {d.note && (
                    <p className="mt-1 text-sm text-muted">{d.note}</p>
                  )}
                </div>
                {d.file && (
                  <a
                    href={d.file}
                    className="shrink-0 rounded-lg border border-brand-700/40 px-3 py-1.5 text-sm font-semibold text-brand-700 hover:bg-brand-50"
                  >
                    {t.about.download}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}
    </>
  );
}

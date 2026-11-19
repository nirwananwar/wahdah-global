import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui";
import { getDplnChapters, getPrograms, getTopic } from "@/lib/content";
import { getDict, href, toLang } from "@/lib/i18n";

type Props = PageProps<"/[lang]/program">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: getDict(toLang((await params).lang)).programs.indexTitle };
}

export default async function Page({ params }: Props) {
  const lang = toLang((await params).lang);
  const t = getDict(lang);
  const diplomasi = getTopic(lang, "diplomasi");
  const kerjaSama = getTopic(lang, "kerja-sama-internasional");
  const [programs, chapters] = await Promise.all([
    getPrograms(lang),
    getDplnChapters(lang),
  ]);

  const pillars = [
    {
      path: "/diplomasi",
      title: `${t.programs.pillar} ${diplomasi.title}`,
      body: diplomasi.intro[0],
      items: diplomasi.focus.map((f) => f.title),
    },
    {
      path: "/kerja-sama-internasional",
      title: `${t.programs.pillar} ${kerjaSama.title}`,
      body: kerjaSama.intro[0],
      items: kerjaSama.focus.map((f) => f.title),
    },
    {
      path: "/peduli-ummat",
      title: t.programs.peduliUmmatPillar,
      body: t.programs.peduliUmmatLead,
      items: programs.map((p) => p.title),
    },
    {
      path: "/dpln",
      title: t.pillars.dpln,
      body: t.dpln.lead,
      items: chapters.map((c) => c.country),
    },
  ];

  return (
    <>
      <PageHero title={t.programs.indexTitle} lead={t.programs.indexLead} />
      {pillars.map((pillar, i) => (
        <section
          key={pillar.path}
          className={i % 2 ? "border-y border-line bg-white" : ""}
        >
          <div className="container-page grid items-center gap-10 py-16 md:grid-cols-2">
            <div className={i % 2 ? "md:order-2" : ""}>
              {/* Ganti kotak ini dengan foto kegiatan pilar terkait. */}
              <div className="relative mx-auto aspect-4/3 max-w-md">
                <div className="absolute -start-6 -top-6 size-48 rounded-full bg-accent/25" />
                <div className="relative grid h-full place-items-center rounded-2xl bg-brand-700 font-display text-7xl text-white/25">
                  {String(i + 1).padStart(2, "0")}
                </div>
              </div>
            </div>
            <div>
              <h2 className="font-display text-3xl sm:text-4xl">
                {pillar.title}
              </h2>
              <p className="mt-4 text-ink/85">{pillar.body}</p>
              <ol className="mt-6 space-y-3">
                {pillar.items.map((item, n) => (
                  <li
                    key={`${item}-${n}`}
                    className="flex items-center gap-3 font-semibold"
                  >
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-100 text-sm text-brand-700">
                      {n + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ol>
              <Link
                href={href(lang, pillar.path)}
                className="mt-7 inline-block rounded-full bg-brand-700 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-900"
              >
                {t.common.readMore}
              </Link>
            </div>
          </div>
        </section>
      ))}
    </>
  );
}

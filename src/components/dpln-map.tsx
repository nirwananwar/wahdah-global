import { geoCentroid, geoEqualEarth, geoPath } from "d3-geo";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import Link from "next/link";
import { feature } from "topojson-client";
import world from "world-atlas/countries-110m.json";
import type { DplnChapter } from "@/lib/content";
import { href, type Lang } from "@/lib/i18n";

const W = 960;
const H = 470;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const topology = world as any;
const countries = (
  feature(topology, topology.objects.countries) as unknown as FeatureCollection<Geometry, { name: string }>
).features.filter((f) => f.id !== "010"); // tanpa Antartika
const projection = geoEqualEarth().fitSize([W, H], {
  type: "FeatureCollection",
  features: countries,
} as FeatureCollection);
const path = geoPath(projection);
const shapes = countries.map((f) => ({ id: String(f.id), d: path(f) ?? "", feature: f }));

/** Peta dunia; negara dengan DPLN terbit disorot dan bisa diklik. */
export function DplnMap({
  chapters,
  numerics,
  lang,
}: {
  chapters: DplnChapter[];
  /** Kode ISO alfa-2 → kode numerik (id peta). */
  numerics: Record<string, string>;
  lang: Lang;
}) {
  const marked = new Map(
    chapters
      .filter((c) => c.code && numerics[c.code])
      .map((c) => [numerics[c.code!], c] as const),
  );
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="DPLN">
      <rect width={W} height={H} rx="24" className="fill-brand-900" />
      {shapes.map((s) =>
        marked.has(s.id) ? null : (
          <path key={s.id} d={s.d} className="fill-brand-700 stroke-brand-900" strokeWidth={0.5} />
        ),
      )}
      {shapes
        .filter((s) => marked.has(s.id))
        .map((s) => {
          const c = marked.get(s.id)!;
          const [x, y] = projection(geoCentroid(s.feature as Feature)) ?? [0, 0];
          return (
            <Link key={s.id} href={href(lang, `/dpln/${c.code!.toLowerCase()}`)} className="group">
              <title>{c.country}</title>
              <path d={s.d} className="fill-accent/80 stroke-brand-900 transition group-hover:fill-accent" strokeWidth={0.5} />
              <circle cx={x} cy={y} r={9} className="fill-white/25" />
              <circle cx={x} cy={y} r={4.5} className="fill-white" />
            </Link>
          );
        })}
    </svg>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Arrow, Gallery, SampleBadge, Tag } from "@/components/ui";
import { getPost, getPosts } from "@/lib/content";
import { formatDate, getDict, href, locales, toLang } from "@/lib/i18n";

type Props = PageProps<"/[lang]/berita/[slug]">;

export async function generateStaticParams() {
  const posts = await getPosts("id");
  const slugs = posts.length ? posts.map((p) => p.slug) : ["-"];
  return locales.flatMap((lang) => slugs.map((slug) => ({ lang, slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const post = await getPost(toLang(lang), slug);
  return post ? { title: post.title, description: post.excerpt } : {};
}

export default async function Page({ params }: Props) {
  const { lang: rawLang, slug } = await params;
  const lang = toLang(rawLang);
  const t = getDict(lang);
  const post = await getPost(lang, slug);
  if (!post) notFound();

  return (
    <article className="container-page max-w-3xl py-14">
      <Link
        href={href(lang, "/berita")}
        className="text-sm font-semibold text-brand-700 hover:underline"
      >
        <Arrow back /> {t.nav.news}
      </Link>
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Tag>{post.categoryName}</Tag>
        {post.sample && <SampleBadge lang={lang} />}
        <time dateTime={post.date} className="text-sm text-muted">
          {formatDate(post.date, lang)}
        </time>
      </div>
      <h1 className="mt-4 font-display text-4xl leading-tight">{post.title}</h1>
      {post.excerpt && (
        <p className="mt-4 text-lg text-muted">{post.excerpt}</p>
      )}
      {post.cover && (
        <div className="relative mt-8 aspect-video overflow-hidden rounded-2xl">
          <Image
            src={post.cover}
            alt=""
            fill
            priority
            sizes="(min-width: 768px) 768px, 100vw"
            className="object-cover"
          />
        </div>
      )}
      <div className="prose-body mt-8 border-t border-line pt-8 text-lg leading-relaxed text-ink/90">
        {post.body.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
      <Gallery images={post.gallery} lang={lang} />
    </article>
  );
}

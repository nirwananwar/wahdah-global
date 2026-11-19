import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { LangSwitch } from "@/components/lang-switch";
import { getDict, href, type Lang } from "@/lib/i18n";
import { navItems, site } from "@/lib/site";

/**
 * Teks yang menebal saat induknya (`group/link`) disentuh kursor atau difokus.
 * Salinan tebal yang tak terlihat menyiapkan lebarnya, jadi menu tidak bergeser.
 */
function HoverBold({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-grid">
      <span className="col-start-1 row-start-1 group-hover/link:font-extrabold group-focus-visible/link:font-extrabold">
        {children}
      </span>
      <span aria-hidden className="invisible col-start-1 row-start-1 font-extrabold">
        {children}
      </span>
    </span>
  );
}

export function Header({ lang }: { lang: Lang }) {
  const t = getDict(lang);
  const nav = navItems(t);
  const switcher = (
    <Suspense>
      <LangSwitch lang={lang} label={t.nav.language} />
    </Suspense>
  );

  return (
    <header className="sticky top-0 z-40 border-b-2 border-brand-500 bg-white">
      <div className="container-page flex h-18 items-center justify-between gap-4">
        <Link href={href(lang, "/")} className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Image
            src="/logo.png"
            alt="Wahdah Islamiyah — Department of Foreign Affairs"
            width={52}
            height={52}
            priority
            className="size-11 shrink-0 sm:size-13"
          />
          <span className="font-display text-lg sm:text-xl">{site.name}</span>
        </Link>

        <nav className="hidden items-center gap-5 xl:flex">
          {nav.map((item) =>
            item.children ? (
              <div key={item.path} className="group relative">
                <Link
                  href={href(lang, item.path)}
                  className="group/link flex items-center gap-1 py-6 text-[15px] font-semibold text-brand-700 hover:text-brand-900"
                >
                  <HoverBold>{item.label}</HoverBold>
                  <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
                    <path
                      d="M1 3l4 4 4-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                  </svg>
                </Link>
                <div className="invisible absolute start-0 top-full w-64 rounded-2xl border border-line bg-white p-2 opacity-0 shadow-lg transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                  {item.children.map((child) => (
                    <Link
                      key={child.path}
                      href={href(lang, child.path)}
                      className="group/link block rounded-xl px-4 py-2.5 text-sm font-medium text-brand-700 hover:bg-brand-50 hover:text-brand-900"
                    >
                      <HoverBold>{child.label}</HoverBold>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                key={item.path}
                href={href(lang, item.path)}
                className="group/link text-[15px] font-semibold text-brand-700 hover:text-brand-900"
              >
                <HoverBold>{item.label}</HoverBold>
              </Link>
            ),
          )}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {switcher}
          <Link
            href="/admin"
            className="group/link hidden rounded-lg border border-brand-700/40 px-4 py-2 text-[15px] font-semibold text-brand-700 hover:border-brand-700 hover:bg-brand-50 hover:text-brand-900 xl:block"
          >
            <HoverBold>{t.nav.login}</HoverBold>
          </Link>
          <details className="relative xl:hidden">
            <summary className="grid size-10 cursor-pointer list-none place-items-center rounded-full border border-line [&::-webkit-details-marker]:hidden">
              <span className="sr-only">{t.nav.menu}</span>
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                aria-hidden
              >
                <path d="M2 5h14M2 9h14M2 13h14" />
              </svg>
            </summary>
            <nav className="absolute end-0 top-12 flex max-h-[75vh] w-72 flex-col overflow-y-auto rounded-2xl border border-line bg-white p-2 shadow-lg">
              {nav.map((item) => (
                <div key={item.path}>
                  <Link
                    href={href(lang, item.path)}
                    className="group/link block rounded-xl px-4 py-3 text-sm font-semibold text-brand-700 hover:bg-brand-50 hover:text-brand-900"
                  >
                    <HoverBold>{item.label}</HoverBold>
                  </Link>
                  {item.children?.map((child) => (
                    <Link
                      key={child.path}
                      href={href(lang, child.path)}
                      className="group/link block rounded-xl py-2.5 ps-8 pe-4 text-sm text-brand-700/75 hover:bg-brand-50 hover:text-brand-900"
                    >
                      <HoverBold>{child.label}</HoverBold>
                    </Link>
                  ))}
                </div>
              ))}
              <Link
                href="/admin"
                className="group/link mt-1 block rounded-xl border-t border-line px-4 py-3 text-sm font-semibold text-brand-700 hover:bg-brand-50 hover:text-brand-900"
              >
                <HoverBold>{t.nav.login}</HoverBold>
              </Link>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}

export function FloatingContact({ lang }: { lang: Lang }) {
  const target = site.whatsapp
    ? `https://wa.me/${site.whatsapp}`
    : href(lang, "/hubungi-kami");
  return (
    <Link
      href={target}
      className="fixed bottom-5 end-5 z-50 flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-bold text-brand-900 shadow-lg transition hover:bg-accent-dark hover:text-white"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M4 20l1.3-4.2A8 8 0 1 1 8.4 19L4 20z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
      {getDict(lang).common.sendMessage}
    </Link>
  );
}

export function DonateTab({ lang }: { lang: Lang }) {
  return (
    <Link
      href={href(lang, "/donasi")}
      className="fixed end-0 top-1/2 z-40 flex -translate-y-1/2 flex-col items-center gap-2 rounded-s-xl bg-accent px-2 py-4 text-xs font-bold tracking-wide text-brand-900 shadow-lg transition hover:bg-accent-dark hover:text-white sm:text-sm"
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
        aria-hidden
      >
        <path d="M12 9.5s-3-1.9-3-4a1.7 1.7 0 0 1 3-1 1.7 1.7 0 0 1 3 1c0 2.1-3 4-3 4z" />
        <path d="M3 14h3l4.5 2.5H14a1.5 1.5 0 0 0 0-3h-2" />
        <path d="M15 15l4-1.5a1.4 1.4 0 0 1 1 2.6L13 20l-7-1.5V14" />
      </svg>
      {/* Teks tegak: tab tetap ramping di tepi layar agar tidak menutupi isi. */}
      <span className="[writing-mode:vertical-rl]">
        {getDict(lang).common.donateNow}
      </span>
    </Link>
  );
}

export function Footer({ lang }: { lang: Lang }) {
  const t = getDict(lang);
  const links = [
    { path: "/tentang-kami", label: t.nav.about },
    { path: "/program", label: t.nav.program },
    { path: "/berita", label: t.nav.news },
    { path: "/donasi", label: t.nav.donate },
    { path: "/rekening", label: t.nav.accounts },
  ];
  const contact = [
    {
      label: t.footer.whatsapp,
      value: site.whatsapp && site.whatsappLabel,
      link: site.whatsapp && `https://wa.me/${site.whatsapp}`,
    },
    {
      label: t.footer.email,
      value: site.email,
      link: site.email && `mailto:${site.email}`,
    },
    { label: t.footer.address, value: site.address[lang], link: "" },
  ];

  return (
    <footer className="mt-auto bg-brand-700 text-white">
      <div className="container-page">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/25 py-10">
          <p className="font-display text-2xl sm:text-3xl">
            {t.footer.stayConnected}
          </p>
          <Link
            href={href(lang, "/hubungi-kami")}
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-brand-900 hover:bg-white"
          >
            {t.nav.contact}
          </Link>
        </div>

        <div className="grid gap-10 py-12 md:grid-cols-[1fr_1.4fr_1.2fr]">
          <ul className="space-y-5 font-display">
            {links.map((item) => (
              <li key={item.path}>
                <Link href={href(lang, item.path)} className="hover:text-accent">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <dl className="space-y-5">
            {contact.map((c) => (
              <div key={c.label}>
                <dt className="text-sm text-white/80">{c.label}</dt>
                <dd className="font-display text-lg">
                  {c.value ? (
                    c.link ? (
                      <a href={c.link} dir="ltr" className="hover:text-accent">
                        {c.value}
                      </a>
                    ) : (
                      c.value
                    )
                  ) : (
                    <span className="font-sans text-base font-normal text-white/60">
                      {t.common.notFilled}
                    </span>
                  )}
                </dd>
              </div>
            ))}
          </dl>

          <div>
            <Image
              src="/logo.png"
              alt=""
              width={96}
              height={96}
              className="size-24"
            />
            {site.mapsUrl && (
              <a
                href={site.mapsUrl}
                className="mt-5 inline-block rounded-lg bg-white px-4 py-2 text-sm font-semibold text-brand-700"
              >
                {t.footer.maps}
              </a>
            )}
            {site.socials.length > 0 && (
              <>
                <p className="mt-6 text-sm text-white/80">{t.footer.social}</p>
                <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-display">
                  {site.socials.map((social) => (
                    <li key={social.href}>
                      <a href={social.href} className="hover:text-accent">
                        {social.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>

        <p className="pb-8 font-display text-sm">© {site.name}</p>
      </div>
    </footer>
  );
}

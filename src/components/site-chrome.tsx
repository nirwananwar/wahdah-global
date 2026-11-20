import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { LangSwitch } from "@/components/lang-switch";
import { getDict, href, type Lang } from "@/lib/i18n";
import { getHome } from "@/lib/i18n-home";
import { getPortal } from "@/lib/i18n-portal";
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
  const nav = navItems(t, getPortal(lang));
  const switcher = (
    <Suspense>
      <LangSwitch lang={lang} label={t.nav.language} />
    </Suspense>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href={href(lang, "/")} className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Image
            src="/logo-duln.png"
            alt="Wahdah Islamiyah — Department of Foreign Affairs"
            width={52}
            height={52}
            priority
            className="size-10 shrink-0 sm:size-11"
          />
          <span className="whitespace-nowrap font-display text-lg">{site.name}</span>
        </Link>

        <nav className="hidden items-center gap-5 whitespace-nowrap xl:flex 2xl:gap-6">
          {nav.map((item) =>
            item.children ? (
              <div key={item.path} className="group relative">
                <Link
                  href={href(lang, item.path)}
                  className="group/link flex items-center gap-1 py-5 text-[14px] font-semibold text-brand-700 hover:text-brand-900 2xl:text-[15px]"
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
                <div className="invisible absolute -start-3 top-full w-60 translate-y-1 rounded-xl border border-line bg-white p-1.5 opacity-0 shadow-xl shadow-brand-900/10 transition group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  {item.children.map((child) => (
                    <Link
                      key={child.path}
                      href={href(lang, child.path)}
                      className="group/link block rounded-lg px-3.5 py-2.5 text-sm font-medium text-brand-700 hover:bg-brand-50 hover:text-brand-900"
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
                className="group/link text-[14px] font-semibold text-brand-700 hover:text-brand-900 2xl:text-[15px]"
              >
                <HoverBold>{item.label}</HoverBold>
              </Link>
            ),
          )}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {switcher}
          <details className="relative xl:hidden">
            <summary className="grid size-10 cursor-pointer list-none place-items-center rounded-lg border border-line text-brand-700 hover:bg-brand-50 [&::-webkit-details-marker]:hidden">
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
            <nav className="fixed inset-x-0 top-16 flex max-h-[calc(100dvh-4rem)] flex-col overflow-y-auto border-t border-line bg-white px-4 py-3 shadow-xl shadow-brand-900/10 sm:px-6">
              {nav.map((item) => (
                <div key={item.path}>
                  <Link
                    href={href(lang, item.path)}
                    className="group/link block rounded-lg px-3 py-3 text-[15px] font-semibold text-brand-700 hover:bg-brand-50 hover:text-brand-900"
                  >
                    <HoverBold>{item.label}</HoverBold>
                  </Link>
                  {item.children?.map((child) => (
                    <Link
                      key={child.path}
                      href={href(lang, child.path)}
                      className="group/link block rounded-lg py-2.5 ps-7 pe-3 text-sm text-brand-700/75 hover:bg-brand-50 hover:text-brand-900"
                    >
                      <HoverBold>{child.label}</HoverBold>
                    </Link>
                  ))}
                </div>
              ))}
              <Link
                href="/admin"
                className="group/link mt-2 block border-t border-line px-3 pb-1 pt-4 text-sm font-medium text-muted hover:text-brand-900"
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
  const text = getDict(lang).common.sendMessage;
  return (
    <Link
      href={target}
      aria-label={text}
      className="fixed bottom-4 end-4 z-50 flex size-12 items-center justify-center gap-2 rounded-full bg-brand-700 text-sm font-semibold text-white shadow-lg shadow-brand-900/20 transition hover:bg-brand-900 sm:bottom-5 sm:end-5 sm:size-auto sm:px-4 sm:py-2.5"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden className="text-accent">
        <path
          d="M4 20l1.3-4.2A8 8 0 1 1 8.4 19L4 20z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
      <span className="hidden sm:inline">{text}</span>
    </Link>
  );
}

export function DonateTab({ lang }: { lang: Lang }) {
  return (
    <Link
      href={href(lang, "/donasi")}
      // HP: tombol kecil di pojok kiri bawah. Layar lebar: tab tegak ramping di tepi kanan.
      className="fixed bottom-4 start-4 z-40 flex items-center gap-1.5 rounded-full bg-accent px-4 py-2.5 text-xs font-bold text-brand-900 shadow-lg shadow-brand-900/20 transition hover:bg-white sm:bottom-auto sm:start-auto sm:end-0 sm:top-1/2 sm:-translate-y-1/2 sm:flex-col sm:gap-2 sm:rounded-none sm:rounded-s-lg sm:px-1.5 sm:py-3 sm:text-[11px] sm:tracking-wide"
    >
      <svg
        width="18"
        height="18"
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
      <span className="sm:[writing-mode:vertical-rl]">
        {getDict(lang).common.donateNow}
      </span>
    </Link>
  );
}

export function Footer({ lang }: { lang: Lang }) {
  const t = getDict(lang);
  const h = getHome(lang);
  const nav = getPortal(lang).nav;
  const quick = [
    { path: "/tentang-kami", label: t.nav.about },
    { path: "/berita", label: t.nav.news },
    { path: "/donasi", label: t.nav.donate },
    { path: "/rekening", label: t.nav.accounts },
    { path: "/hubungi-kami", label: t.nav.contact },
  ];
  const programs = [
    { path: "/diplomasi", label: nav.diplomacyMain },
    { path: "/kerja-sama-internasional", label: t.pillars.kerjaSama },
    { path: "/peduli-ummat", label: nav.care },
    { path: "/dpln", label: nav.dplnNetwork },
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
  ].filter((c) => c.value);
  const heading = "text-xs font-semibold uppercase tracking-[0.18em] text-white/55";
  const linkCls = "text-sm text-white/85 transition hover:text-white";

  return (
    <footer className="mt-auto bg-brand-900 text-white">
      <div className="container-page grid gap-10 pb-10 pt-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.9fr_1.3fr] lg:gap-12">
        {/* Identitas lembaga: logo, nama, dan slogan. */}
        <div>
          <Link href={href(lang, "/")} className="inline-flex items-center gap-3 hover:opacity-90">
            <Image
              src="/logo-duln.png"
              alt=""
              width={56}
              height={56}
              className="size-14 shrink-0 rounded-full bg-white/10 p-0.5 ring-1 ring-white/15"
            />
            <span className="font-display text-xl">{site.name}</span>
          </Link>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/70">{t.tagline}</p>
          {site.mapsUrl && (
            <a href={site.mapsUrl} className="mt-5 inline-block text-sm font-semibold text-white hover:text-accent">
              {t.footer.maps} →
            </a>
          )}
          {site.socials.length > 0 && (
            <div className="mt-6">
              <p className={heading}>{h.footer.social}</p>
              <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                {site.socials.map((social) => (
                  <li key={social.href}>
                    <a href={social.href} className={linkCls}>
                      {social.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <nav aria-label={h.footer.quick}>
          <p className={heading}>{h.footer.quick}</p>
          <ul className="mt-4 space-y-3">
            {quick.map((item) => (
              <li key={item.path}>
                <Link href={href(lang, item.path)} className={linkCls}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={h.footer.programs}>
          <p className={heading}>{h.footer.programs}</p>
          <ul className="mt-4 space-y-3">
            {programs.map((item) => (
              <li key={item.path}>
                <Link href={href(lang, item.path)} className={linkCls}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className={heading}>{h.footer.contact}</p>
          <dl className="mt-4 space-y-4">
            {contact.map((c) => (
              <div key={c.label}>
                <dt className="text-xs text-white/55">{c.label}</dt>
                <dd className="mt-0.5 text-sm leading-relaxed text-white/90">
                  {c.link ? (
                    <a href={c.link} dir="ltr" className="hover:text-accent">
                      {c.value}
                    </a>
                  ) : (
                    c.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
      <div className="container-page flex flex-wrap items-center justify-between gap-3 border-t border-white/10 py-6 text-xs text-white/55">
        <p>
          © {site.name} · Wahdah Islamiyah
        </p>
        {/* Masuk panel admin (khusus staf). */}
        <Link href="/admin" className="hover:text-white">
          {t.nav.login}
        </Link>
      </div>
    </footer>
  );
}

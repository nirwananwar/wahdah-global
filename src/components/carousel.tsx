"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

export type CarouselOption = { label: string; href: string };

export type CarouselSlide = {
  title: string;
  href: string;
  image: string | null;
  /** Gradasi biru di atas gambar; matikan untuk ilustrasi berwarna merek. */
  overlay?: boolean;
  /** Bila ada, klik slide membuka daftar pilihan alih-alih langsung pindah halaman. */
  options?: CarouselOption[];
};

type Labels = { seeAll: string; close: string; showOptions: string };

export function Carousel({
  slides,
  labels,
}: {
  slides: CarouselSlide[];
  labels: Labels;
}) {
  const track = useRef<HTMLDivElement>(null);
  const settle = useRef<ReturnType<typeof setTimeout>>(undefined);
  const closeButton = useRef<HTMLButtonElement>(null);
  const count = slides.length;
  const loop = count > 1;
  // Agar selalu ada slide yang mengintip di kiri dan kanan, daftar slide
  // dirender tiga kali; pengguna selalu berada di salinan tengah.
  const items = loop ? [...slides, ...slides, ...slides] : slides;
  const [active, setActive] = useState(loop ? count : 0);
  const [paused, setPaused] = useState(false);
  // Slide (0..count-1) yang daftar pilihannya sedang terbuka.
  const [open, setOpen] = useState<number | null>(null);

  // Jarak tengah slide ke tengah jalur; dipakai untuk menggeser dan menandai
  // slide aktif, dan tetap benar pada tata letak kanan-ke-kiri.
  function offsetFromCenter(el: Element) {
    const box = track.current!.getBoundingClientRect();
    const rect = el.getBoundingClientRect();
    return rect.left + rect.width / 2 - (box.left + box.width / 2);
  }

  function go(index: number, behavior: ScrollBehavior = "smooth") {
    const el = track.current?.children[index];
    if (!el) return;
    track.current!.scrollBy({ left: offsetFromCenter(el), behavior });
  }

  function nearest() {
    let best = 0;
    let bestDistance = Infinity;
    Array.from(track.current!.children).forEach((child, i) => {
      const distance = Math.abs(offsetFromCenter(child));
      if (distance < bestDistance) {
        best = i;
        bestDistance = distance;
      }
    });
    return best;
  }

  function onScroll() {
    if (!track.current) return;
    setActive(nearest());
    if (!loop) return;
    // Setelah gulir berhenti, lompat diam-diam ke slide yang sama di salinan
    // tengah, sehingga putaran terasa tanpa ujung.
    clearTimeout(settle.current);
    settle.current = setTimeout(() => {
      const i = nearest();
      if (i < count || i >= 2 * count) go(count + (i % count), "instant");
    }, 150);
  }

  function toggle(index: number) {
    const slide = index % count;
    if (open === slide && index === active) {
      setOpen(null);
      return;
    }
    if (index !== active) go(index);
    setOpen(slide);
  }

  // Mulai dari slide pertama di salinan tengah.
  useLayoutEffect(() => {
    // Carousel tersembunyi (opacity-0) sampai posisinya di salinan tengah,
    // agar tidak terlihat melompat saat halaman baru dibuka.
    if (loop) go(count, "instant");
    if (track.current) track.current.style.opacity = "1";
    return () => clearTimeout(settle.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loop, count]);

  useEffect(() => {
    if (paused || open !== null || !loop) return;
    const timer = setInterval(() => go(active + 1), 5000);
    return () => clearInterval(timer);
    // `go` hanya membaca ref, jadi tidak perlu jadi dependensi.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, paused, open, loop]);

  // Pilihan terbuka: fokus ke tombol tutup, Esc untuk menutup.
  const shown = open !== null && active % count === open;
  useEffect(() => {
    if (!shown) return;
    closeButton.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shown]);

  return (
    <div
      className="@container"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* Ukuran memakai cqw (lebar area carousel), bukan vw yang ikut
          menghitung scrollbar, supaya slide benar-benar di tengah. */}
      <div
        ref={track}
        onScroll={onScroll}
        className={`no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto px-[7cqw] transition-opacity duration-300 sm:gap-8 lg:px-[28cqw] ${loop ? "opacity-0" : ""}`}
      >
        {items.map((slide, i) => {
          const copy = loop && (i < count || i >= 2 * count);
          const hasOptions = Boolean(slide.options);
          const isOpen = shown && i === active;
          return (
            <div
              key={`${slide.href}-${i}`}
              aria-hidden={copy || undefined}
              className="group relative aspect-2/1 w-[86cqw] shrink-0 snap-center overflow-hidden rounded-2xl bg-linear-to-br from-brand-700 to-brand-900 lg:w-[44cqw]"
            >
              {slide.image ? (
                <>
                  <Image
                    src={slide.image}
                    alt={copy ? "" : slide.title}
                    fill
                    priority={loop ? Math.abs(i - count) <= 1 || i === 2 * count - 1 : i === 0}
                    sizes="(min-width: 1024px) 44vw, 86vw"
                    className="object-cover object-[50%_35%]"
                  />
                  {/* Gradasi biru merek: menyatukan foto dengan slide lain dan
                      menjaga label tetap terbaca. */}
                  {slide.overlay !== false && (
                    <>
                      <span className="absolute inset-0 bg-brand-700/15 mix-blend-multiply" />
                      <span className="absolute inset-0 bg-linear-to-r from-brand-900/85 via-brand-900/15 via-45% to-transparent rtl:bg-linear-to-l" />
                      <span className="absolute inset-0 bg-linear-to-t from-brand-900/80 via-brand-900/10 via-40% to-transparent" />
                    </>
                  )}
                </>
              ) : (
                <>
                  <span className="absolute -end-10 -top-16 size-64 rounded-full bg-accent/15" />
                  <span className="absolute -bottom-20 end-24 size-48 rounded-full bg-brand-500/40" />
                  <Image
                    src="/logo.png"
                    alt=""
                    width={400}
                    height={400}
                    className="absolute end-[6%] top-1/2 w-[30%] -translate-y-1/2 opacity-90"
                  />
                </>
              )}

              {hasOptions ? (
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  aria-expanded={isOpen}
                  aria-label={`${slide.title}: ${labels.showOptions}`}
                  tabIndex={copy ? -1 : undefined}
                  className="absolute inset-0 cursor-pointer focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-accent"
                />
              ) : (
                <Link
                  href={slide.href}
                  aria-label={slide.title}
                  tabIndex={copy ? -1 : undefined}
                  className="absolute inset-0"
                />
              )}

              <span
                className={`pointer-events-none absolute bottom-[12%] start-0 flex items-center gap-2 rounded-e-full bg-accent px-5 py-2 font-display text-sm uppercase tracking-wide text-brand-900 shadow transition group-hover:pe-6 sm:text-lg ${
                  isOpen ? "opacity-0" : ""
                }`}
              >
                {slide.title}
                {hasOptions && (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                    className="shrink-0"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                )}
              </span>

              {isOpen && (
                <div className="absolute inset-0 z-10 flex flex-col bg-brand-900/90 p-3 text-white backdrop-blur-sm sm:p-6 lg:p-8">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-display text-sm uppercase tracking-wide text-accent sm:text-xl">
                      {slide.title}
                    </p>
                    <button
                      ref={closeButton}
                      type="button"
                      onClick={() => setOpen(null)}
                      aria-label={labels.close}
                      className="-m-1 rounded-full p-1 text-white/80 hover:bg-white/10 hover:text-white"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        aria-hidden
                      >
                        <path d="M6 6l12 12M18 6L6 18" />
                      </svg>
                    </button>
                  </div>
                  <ul className="no-scrollbar mt-1.5 grid min-h-0 grid-cols-2 content-start gap-1 overflow-y-auto sm:mt-4 sm:gap-2.5">
                    {slide.options!.map((o) => (
                      <li key={o.href}>
                        <Link
                          href={o.href}
                          className="block truncate rounded-full bg-white/10 px-3 py-1 text-xs font-semibold ring-1 ring-white/20 transition hover:bg-accent hover:text-brand-900 hover:ring-accent sm:px-4 sm:py-2.5 sm:text-base"
                        >
                          {o.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={slide.href}
                    className="mt-auto inline-flex items-center gap-1 self-start pt-2 text-xs font-semibold text-accent hover:underline sm:text-sm"
                  >
                    {labels.seeAll}
                    <span aria-hidden className="rtl:-scale-x-100">
                      →
                    </span>
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {loop && (
        <div className="container-page mt-5 flex justify-center gap-2">
          {slides.map((slide, i) => (
            <button
              key={`${slide.href}-${i}`}
              onClick={() => {
                setOpen(null);
                go(count + i);
              }}
              aria-label={slide.title}
              aria-current={i === active % count}
              className={`h-2 rounded-full transition-all ${
                i === active % count ? "w-6 bg-brand-500" : "w-2 bg-ink/60"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

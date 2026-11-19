"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type CarouselSlide = {
  title: string;
  href: string;
  image: string | null;
};

export function Carousel({ slides }: { slides: CarouselSlide[] }) {
  const track = useRef<HTMLDivElement>(null);
  const settle = useRef<ReturnType<typeof setTimeout>>(undefined);
  const count = slides.length;
  const loop = count > 1;
  // Agar selalu ada slide yang mengintip di kiri dan kanan, daftar slide
  // dirender tiga kali; pengguna selalu berada di salinan tengah.
  const items = loop ? [...slides, ...slides, ...slides] : slides;
  const [active, setActive] = useState(loop ? count : 0);
  const [paused, setPaused] = useState(false);

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

  // Mulai dari slide pertama di salinan tengah.
  useEffect(() => {
    if (loop) go(count, "instant");
    return () => clearTimeout(settle.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loop, count]);

  useEffect(() => {
    if (paused || !loop) return;
    const timer = setInterval(() => go(active + 1), 5000);
    return () => clearInterval(timer);
    // `go` hanya membaca ref, jadi tidak perlu jadi dependensi.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, paused, loop]);

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
        className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto px-[7cqw] sm:gap-8 lg:px-[28cqw]"
      >
        {items.map((slide, i) => {
          const copy = loop && (i < count || i >= 2 * count);
          return (
            <Link
              key={`${slide.href}-${i}`}
              href={slide.href}
              aria-hidden={copy || undefined}
              tabIndex={copy ? -1 : undefined}
              className="relative aspect-2/1 w-[86cqw] shrink-0 snap-center overflow-hidden rounded-2xl bg-linear-to-br from-brand-700 to-brand-900 lg:w-[44cqw]"
            >
              {slide.image ? (
                <Image
                  src={slide.image}
                  alt={copy ? "" : slide.title}
                  fill
                  priority={i === 0}
                  sizes="(min-width: 1024px) 44vw, 86vw"
                  className="object-cover"
                />
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
              <span className="absolute bottom-[12%] start-0 rounded-e-full bg-accent px-5 py-2 font-display text-sm uppercase tracking-wide text-brand-900 shadow sm:text-lg">
                {slide.title}
              </span>
            </Link>
          );
        })}
      </div>
      {loop && (
        <div className="container-page mt-5 flex justify-center gap-2">
          {slides.map((slide, i) => (
            <button
              key={`${slide.href}-${i}`}
              onClick={() => go(count + i)}
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

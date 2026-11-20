import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { site } from "@/lib/site";
import { fontClasses } from "../fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: `Admin · ${site.name}`,
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="id" className={`${fontClasses} h-full antialiased`}>
      <body className="min-h-full font-sans">
        <header className="border-b-2 border-brand-500 bg-white">
          <div className="container-page flex h-16 items-center justify-between">
            <Link href="/admin" className="flex items-center gap-3">
              <Image src="/logo-duln.png" alt="" width={40} height={40} />
              <span className="font-display text-lg">{site.name} · Admin</span>
            </Link>
            <Link
              href="/id"
              className="text-sm font-semibold text-brand-700 hover:underline"
            >
              Lihat website →
            </Link>
          </div>
        </header>
        <div className="container-page py-10">
          <Suspense fallback={<p className="text-muted">Memuat…</p>}>
            {children}
          </Suspense>
        </div>
      </body>
    </html>
  );
}

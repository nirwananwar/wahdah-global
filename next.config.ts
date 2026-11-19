import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  experimental: { serverActions: { bodySizeLimit: "4mb" } },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  partialPrefetching: true,
  // "Program Kemanusiaan" berganti nama menjadi "Peduli Ummat"; tautan lama
  // tetap berfungsi.
  redirects: async () => [
    {
      source: "/:lang(id|en|ar)/program-kemanusiaan/:path*",
      destination: "/:lang/peduli-ummat/:path*",
      permanent: true,
    },
    {
      source: "/program-kemanusiaan/:path*",
      destination: "/id/peduli-ummat/:path*",
      permanent: true,
    },
  ],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

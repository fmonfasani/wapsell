const createNextIntlPlugin = require("next-intl/plugin");

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Standalone output ships a self-contained server.js + only the deps Next
  // actually used, which keeps the runtime Docker image around 150 MB instead
  // of 1+ GB. Required by the multi-stage Dockerfile.
  output: "standalone",

  // ===== PERFORMANCE OPTIMIZATIONS =====

  // Webpack configuration for optimal code splitting
  webpack: (config, { isServer }) => {
    return config;
  },

  // Image optimization for next/image components
  images: {
    formats: ["image/avif", "image/webp"],
    // Cache optimized images for 31536000s (1 year)
    minimumCacheTTL: 31536000,
  },

  // Experimental optimizations (Next.js 14.2+)
  experimental: {
    // Enable optimized package imports
    optimizePackageImports: [
      "@radix-ui/react-dialog",
      "@radix-ui/react-select",
      "lodash-es",
    ],
  },

  // Headers for caching strategy
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },

  // ===== COMPRESSION & MINIFICATION =====
  compress: true,
  swcMinify: true, // Use SWC minifier (default, explicit for clarity)

  // ===== PRODUCTION SETTINGS =====
  productionBrowserSourceMaps: false, // Reduce build size in production

  // ===== BUILD OPTIMIZATION =====
  poweredByHeader: false, // Remove X-Powered-By header
};

module.exports = withNextIntl(nextConfig);

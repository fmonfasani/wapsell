const createNextIntlPlugin = require("next-intl/plugin");

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Standalone output ships a self-contained server.js + only the deps Next
  // actually used, which keeps the runtime Docker image around 150 MB instead
  // of 1+ GB. Required by the multi-stage Dockerfile.
  output: "standalone",
};

module.exports = withNextIntl(nextConfig);

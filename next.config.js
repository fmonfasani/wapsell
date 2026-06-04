const createNextIntlPlugin = require("next-intl/plugin");

// `i18n/request.ts` is the default location next-intl looks in for the
// server-side config; passing the path explicitly makes the wiring obvious.
const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = withNextIntl(nextConfig);

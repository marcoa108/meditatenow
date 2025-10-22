import createNextIntlPlugin from 'next-intl/plugin';

// Provide the path to the i18n configuration
const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: { allowedOrigins: ['*'] },
  },
};

export default withNextIntl(nextConfig);

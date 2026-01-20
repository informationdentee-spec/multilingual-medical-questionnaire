const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./lib/i18n/config.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Vercel環境でPuppeteerとChromiumを正しく動作させるため
  serverExternalPackages: ['puppeteer-core', '@sparticuz/chromium'],
  // Chromiumバイナリを含めるための設定
  experimental: {
    outputFileTracingIncludes: {
      '/api/pdf/**': [
        './node_modules/@sparticuz/chromium/**',
        './node_modules/@sparticuz/chromium/bin/**',
      ],
    },
  },
  // Webpack設定でChromiumバイナリを除外しないようにする
  webpack: (config, { isServer }) => {
    if (isServer) {
      // サーバーサイドのビルドでChromiumバイナリを除外しない
      config.externals = config.externals || [];
      // @sparticuz/chromiumは外部パッケージとして扱うが、バイナリは含める
    }
    return config;
  },
}

module.exports = withNextIntl(nextConfig)

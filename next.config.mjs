/**
 * Statyczny eksport pod GitHub Pages.
 * NEXT_PUBLIC_BASE_PATH ustawia workflow GitHub Actions (np. "/akademia-tradingu").
 * Lokalnie (npm run dev) zmienna jest pusta, więc aplikacja działa pod adresem "/".
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;

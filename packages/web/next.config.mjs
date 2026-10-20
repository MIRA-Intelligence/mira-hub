// @ts-check
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const basePath = process.env.MIRAHUB_BASE_PATH ?? '/mira-hub';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: basePath === '/' ? '' : basePath,
  assetPrefix: basePath === '/' ? undefined : `${basePath}/`,
  outputFileTracingRoot: path.resolve(__dirname, '..', '..'),
  env: {
    MIRAHUB_BASE_PATH: basePath,
    MIRAHUB_BASE_URL: process.env.MIRAHUB_BASE_URL ?? 'https://mira-intelligence.github.io',
  },
};

export default nextConfig;

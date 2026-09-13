/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['node:sqlite', 'pdf-parse', 'mammoth', 'bcryptjs'],
  experimental: {},
};

export default nextConfig;

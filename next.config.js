/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Falls du Environment Variables aus .env brauchst
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  // Optimierungen
  swcMinify: true,
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Desactivar Turbopack, usar webpack
  experimental: {
    turbo: {
      rules: {},
    },
  },
};

module.exports = nextConfig;
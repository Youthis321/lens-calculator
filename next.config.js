/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // Nonaktif saat dev
});

const nextConfig = {
  // config lainmu
};

module.exports = withPWA(nextConfig);

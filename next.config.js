/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  env: {
    WEBUI_ENDPOINT: process.env.WEBUI_ENDPOINT,
  },
};

module.exports = nextConfig;

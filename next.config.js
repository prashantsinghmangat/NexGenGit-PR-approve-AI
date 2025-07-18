/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    GITHUB_APP_ID: process.env.GITHUB_APP_ID,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    GITHUB_PRIVATE_KEY: process.env.GITHUB_PRIVATE_KEY.replace(/\\n/g, '\n'),
    WEBHOOK_SECRET: process.env.WEBHOOK_SECRET,
    TOGETHER_API_KEY: process.env.TOGETHER_API_KEY,
  },
};

module.exports = nextConfig; 
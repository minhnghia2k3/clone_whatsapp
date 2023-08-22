/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_ZEGO_APP_ID: 655141585,
    NEXT_PUBLIC_ZEGO_SERVER_ID: 'fe1e4746ff50842f4edeca3b237b7c14'
  },
  images: {
    domains: ['localhost'],
  },
};

module.exports = nextConfig;

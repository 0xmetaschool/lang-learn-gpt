/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'microphone=self',
          },
        ],
      },
    ];
  },
  images: {
    domains: ['metaschool.so'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'metaschool.so',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;

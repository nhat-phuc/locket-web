import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  devIndicators: false,
  async headers() {
    return [
      {
        source: '/files/:file*.mobileconfig',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/x-apple-aspen-config',
          },
          {
            key: 'Content-Disposition',
            value: 'attachment; filename="locket-vip.mobileconfig"',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

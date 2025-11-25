/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    styledComponents: true,
  },
  async rewrites() {
    return [
      {
        source: '/@:username',
        destination: '/users/:username',
      },
      {
        source: '/@:username/certificate',
        destination: '/users/:username/certificate',
      },
    ]
  },
};

export default nextConfig;

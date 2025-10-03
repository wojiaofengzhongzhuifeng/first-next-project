/** @type {import('next').NextConfig} */
const nextConfig = {
  // 生产环境配置
  basePath: process.env.NODE_ENV === 'production' ? '' : '',
  assetPrefix: process.env.NODE_ENV === 'production' 
    ? process.env.NEXT_PUBLIC_BASE_URL 
    : '',
    
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
      '@mono-repo': require('path').resolve(__dirname, '../../packages'),
    };
    
    return config;
  },
}

module.exports = nextConfig

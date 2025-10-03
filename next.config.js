/** @type {import('next').NextConfig} */
const nextConfig = {
  // 多应用配置
  experimental: {
    appDir: false, // 使用 pages router
  },
  
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'apps/hello-world/src'),
      '@count-number': require('path').resolve(__dirname, 'apps/count-number/src'),
      '@mono-repo': require('path').resolve(__dirname, 'packages'),
    };
    
    return config;
  },
}

module.exports = nextConfig

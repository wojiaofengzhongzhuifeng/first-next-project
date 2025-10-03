# Monorepo 部署指南

## 🎯 目标
将 monorepo 中的 `apps/count-number` 应用部署到 `http://hellojagtest.lol/` 域名，实现从 `localhost:3002/count-number` 到生产环境的映射。

## 📋 当前项目分析

### 项目结构
```
first-website/
├── apps/
│   ├── count-number/          # 目标应用 (端口 3002)
│   ├── home/                  # 其他应用
│   └── about-us/              # 其他应用
├── packages/
│   ├── ui/                    # 共享UI组件
│   └── utils/                 # 共享工具
└── pnpm-workspace.yaml        # Monorepo配置
```

### 当前配置
- **开发环境**: `localhost:3002/count-number`
- **构建工具**: Next.js + Turbo
- **包管理**: pnpm workspace
- **部署平台**: Vercel (已配置)

## 🚀 部署方案

### 方案一：单应用部署 (推荐)
将 `count-number` 作为独立应用部署到根域名

#### 1. 修改 Next.js 配置
```javascript
// apps/count-number/next.config.js
const nextConfig = {
  // ... 现有配置
  
  // 添加 basePath 支持
  basePath: process.env.NODE_ENV === 'production' ? '' : '',
  
  // 移除开发环境的 rewrites，生产环境不需要
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:3000/:path*',
        },
      ]
    }
    return []
  },
}
```

#### 2. 更新 Vercel 配置
```json
// apps/count-number/vercel.json
{
  "version": 2,
  "name": "count-number-app",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase-service-role-key",
    "UPSTASH_REDIS_REST_URL": "@upstash-redis-url",
    "UPSTASH_REDIS_REST_TOKEN": "@upstash-redis-token",
    "NEXTAUTH_URL": "@nextauth-url",
    "NEXTAUTH_SECRET": "@nextauth-secret"
  },
  "functions": {
    "pages/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "regions": ["hkg1", "sin1"],
  "framework": "nextjs",
  "installCommand": "pnpm install",
  "buildCommand": "cd apps/count-number && pnpm build"
}
```

#### 3. 创建根目录部署配置
```json
// vercel.json (根目录)
{
  "version": 2,
  "buildCommand": "pnpm build:count-number",
  "outputDirectory": "apps/count-number/.next",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "functions": {
    "apps/count-number/pages/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/apps/count-number/pages/$1"
    }
  ]
}
```

### 方案二：子路径部署
保持 `count-number` 路径，部署到 `http://hellojagtest.lol/count-number`

#### 1. 修改 Next.js 配置
```javascript
// apps/count-number/next.config.js
const nextConfig = {
  // ... 现有配置
  
  // 设置 basePath
  basePath: '/count-number',
  
  // 更新 assetPrefix
  assetPrefix: process.env.NODE_ENV === 'production' 
    ? 'http://hellojagtest.lol/count-number' 
    : '',
}
```

#### 2. 更新环境变量
```bash
# 生产环境
NEXTAUTH_URL=http://hellojagtest.lol/count-number
```

## 🔧 实施步骤

### ✅ 已完成的配置
<task_progress>
- [x] 分析当前项目结构
- [x] 选择部署方案 (单应用部署到根域名)
- [x] 更新 Next.js 配置
- [x] 更新 Vercel 配置
- [x] 配置环境变量示例
- [x] 测试本地构建
- [ ] 部署到 Vercel
- [ ] 配置域名
- [ ] 验证部署结果
</task_progress>

### 📋 部署步骤

#### 步骤 1: Vercel 项目设置
1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "New Project"
3. 导入你的 GitHub 仓库 `wojiaofengzhongzhuifeng/first-next-project`
4. 选择根目录作为项目根目录

#### 步骤 2: 配置构建设置
在 Vercel 项目设置中：
- **Build Command**: `pnpm build:count-number`
- **Output Directory**: `apps/count-number/.next`
- **Install Command**: `pnpm install`
- **Framework**: Next.js

#### 步骤 3: 设置环境变量
在 Vercel 项目设置中添加以下环境变量：

```bash
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Upstash Redis配置
UPSTASH_REDIS_REST_URL=your_upstash_redis_rest_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_rest_token

# Next.js配置
NEXTAUTH_URL=https://hellojagtest.lol
NEXTAUTH_SECRET=your_nextauth_secret

# 生产环境基础URL
NEXT_PUBLIC_BASE_URL=https://hellojagtest.lol
```

#### 步骤 4: 配置自定义域名
1. 在 Vercel 项目设置中点击 "Domains"
2. 添加域名 `hellojagtest.lol`
3. 按照提示配置 DNS 记录：
   ```
   类型: CNAME
   名称: @
   值: cname.vercel-dns.com
   ```

#### 步骤 5: 部署应用
1. 点击 "Deploy" 开始部署
2. 等待部署完成
3. 访问 `https://hellojagtest.lol` 验证部署

## 🎯 部署结果

### 访问地址映射
- **本地开发**: `http://localhost:3002/count-number`
- **生产环境**: `https://hellojagtest.lol/`

### 功能验证清单
- [ ] 用户注册/登录功能
- [ ] 计数器增减功能
- [ ] 任务管理功能
- [ ] 主题切换功能
- [ ] 实时数据同步
- [ ] API 响应正常

## 🔍 故障排除

### 常见问题及解决方案

1. **构建失败**
   ```bash
   # 检查本地构建
   pnpm build:count-number
   ```

2. **环境变量问题**
   - 确保所有必需的环境变量都已设置
   - 检查变量名称是否正确

3. **域名解析问题**
   - 检查 DNS 配置是否正确
   - 等待 DNS 传播完成（可能需要几分钟到几小时）

4. **API 路由问题**
   - 检查 Vercel Functions 日志
   - 验证环境变量配置

## 📊 监控建议

### Vercel Analytics
- 启用 Vercel Analytics 监控访问量
- 查看 Web Vitals 性能指标
- 监控错误日志

### 外部服务监控
- Supabase Dashboard 监控数据库
- Upstash Console 监控 Redis 性能

## 🚀 后续优化

1. **性能优化**
   - 启用 ISR (Incremental Static Regeneration)
   - 优化图片和静态资源
   - 配置 CDN 缓存策略

2. **安全加固**
   - 启用 Vercel 的安全头部
   - 配置 CSP (Content Security Policy)
   - 设置速率限制

3. **扩展功能**
   - 添加更多应用子路径
   - 实现多租户架构
   - 集成 CI/CD 流水线

<replace_in_file>
<path>apps/count-number/next.config.js</path>
<diff>
------- SEARCH
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
      '@mono-repo': require('path').resolve(__dirname, '../../packages'),
    };
    
    // 处理 TypeScript 文件
    config.module.rules.push({
      test: /\.tsx?$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: [
            ['@babel/preset-env', { targets: { node: 'current' } }],
            '@babel/preset-react',
            '@babel/preset-typescript'
          ],
          plugins: [
            '@babel/plugin-transform-runtime'
          ]
        }
      }
    });
    
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/:path*',
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
}
=======
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
    
    // 处理 TypeScript 文件
    config.module.rules.push({
      test: /\.tsx?$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: [
            ['@babel/preset-env', { targets: { node: 'current' } }],
            '@babel/preset-react',
            '@babel/preset-typescript'
          ],
          plugins: [
            '@babel/plugin-transform-runtime'
          ]
        }
      }
    });
    
    return config;
  },
  
  async rewrites() {
    // 仅在开发环境重写 API
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:3000/:path*',
        },
      ]
    }
    return []
  },
  
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
}
+++++++ REPLACE
</diff>
</replace_in_file>

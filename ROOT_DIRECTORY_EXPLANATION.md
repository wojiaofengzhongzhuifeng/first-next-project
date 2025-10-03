# 🎯 将 count-number 作为网页根目录的实现详解

## 📍 核心配置位置

### 1. 根目录 `vercel.json` - 最关键的配置

```json
{
  "version": 2,
  "buildCommand": "cd apps/count-number && pnpm build",
  "outputDirectory": "apps/count-number/.next",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/apps/count-number/pages/$1"
    }
  ]
}
```

**这个配置的作用：**
- 🏗️ **构建指定**：只构建 `apps/count-number` 应用
- 📁 **输出指定**：构建结果输出到 `apps/count-number/.next`
- 🔄 **路由重写**：将所有根路径请求重写到 count-number 应用

### 2. Next.js 配置中的 `basePath`

```javascript
// apps/count-number/next.config.js
const nextConfig = {
  // 生产环境配置
  basePath: process.env.NODE_ENV === 'production' ? '' : '',
  assetPrefix: process.env.NODE_ENV === 'production' 
    ? process.env.NEXT_PUBLIC_BASE_URL 
    : '',
}
```

**这个配置的作用：**
- 🌐 **生产环境**：`basePath: ''` - 表示应用部署在根路径
- 🔧 **开发环境**：保持默认，支持 `/count-number` 路径

## 🔄 路由映射机制

### 本地开发环境
```
访问: http://localhost:3002/count-number
↓
Next.js 路由: /pages/count-number/index.tsx
```

### 生产环境 (Vercel)
```
访问: https://hellojagtest.lol/
↓
Vercel rewrites: /(.*) → /apps/count-number/pages/$1
↓
Next.js 路由: /apps/count-number/pages/index.tsx (重定向到 count-number 页面)
```

## 🎯 页面访问映射

### 当前页面结构
```
apps/count-number/src/pages/
├── _app.tsx                 # 应用入口
├── _document.tsx           # 文档结构
├── api/                    # API 路由
│   ├── auth/
│   ├── counters/
│   └── tasks/
└── count-number/           # 主要页面
    └── index.tsx          # count-number 应用主页面
```

### 访问路径对应关系

| 环境 | 访问地址 | 实际页面 |
|------|----------|----------|
| 本地开发 | `http://localhost:3002/count-number` | `/pages/count-number/index.tsx` |
| 生产环境 | `https://hellojagtest.lol/` | `/pages/count-number/index.tsx` (通过重写) |

## 🔧 实现原理详解

### 1. Vercel 部署流程
1. **构建阶段**：执行 `cd apps/count-number && pnpm build`
2. **部署阶段**：将 `apps/count-number/.next` 部署为应用
3. **路由阶段**：通过 rewrites 将所有请求重定向到 count-number 应用

### 2. 路由重写机制
```json
"rewrites": [
  {
    "source": "/(.*)",
    "destination": "/apps/count-number/pages/$1"
  }
]
```

**重写规则解释：**
- `"/(.*)"` - 匹配所有路径
- `"/apps/count-number/pages/$1"` - 重写到 count-number 应用的页面
- `$1` - 捕获的路径参数

### 3. 具体重写示例
```
/ → /apps/count-number/pages/index
/api/counters → /apps/count-number/pages/api/counters
/about → /apps/count-number/pages/about (如果存在)
```

## 🎨 为什么这样设计？

### 优势
1. **简洁的 URL**：用户直接访问域名即可
2. **保持开发体验**：本地开发仍使用 `/count-number` 路径
3. **灵活部署**：可以轻松切换到其他应用
4. **Monorepo 兼容**：不影响其他应用的结构

### 对比其他方案

#### 方案一：当前方案（推荐）
```
生产环境: https://hellojagtest.lol/
开发环境: http://localhost:3002/count-number
```

#### 方案二：子路径方案
```
生产环境: https://hellojagtest.lol/count-number
开发环境: http://localhost:3002/count-number
```

#### 方案三：独立域名方案
```
生产环境: https://count-number.hellojagtest.lol/
开发环境: http://localhost:3002/count-number
```

## 🚀 部署验证

### 验证步骤
1. **本地测试**：`pnpm build:count-number` 确保构建成功
2. **部署测试**：使用 `./deploy.sh` 或手动部署
3. **功能测试**：验证所有页面和 API 正常工作

### 预期结果
- ✅ `https://hellojagtest.lol/` → 显示 count-number 应用
- ✅ `https://hellojagtest.lol/api/counters` → API 正常响应
- ✅ 所有功能正常工作

## 📝 总结

**将 count-number 作为网页根目录的核心实现：**

1. **根目录 `vercel.json`** - 通过 rewrites 重写所有路由
2. **Next.js 配置** - 设置生产环境 `basePath: ''`
3. **构建配置** - 指定构建 count-number 应用
4. **环境变量** - 配置生产环境 URL

这样配置后，用户访问 `https://hellojagtest.lol/` 就能直接看到你的 count-number 应用了！

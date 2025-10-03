# 全链路MVP部署指南

## 📋 部署前准备

### 1. 创建Supabase项目
1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 创建新项目
3. 记录以下信息：
   - Project URL
   - Anon Key
   - Service Role Key

### 2. 设置数据库
1. 在Supabase项目中，打开SQL编辑器
2. 执行 `supabase/migrations/001_initial_schema.sql` 中的SQL语句
3. 验证表结构是否正确创建

### 3. 创建Upstash Redis数据库
1. 访问 [Upstash Console](https://console.upstash.com/)
2. 创建Redis数据库
3. 记录以下信息：
   - REST URL
   - REST Token

### 4. 配置环境变量
复制 `.env.local.example` 为 `.env.local` 并填入实际值：

```bash
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Upstash Redis配置
UPSTASH_REDIS_REST_URL=your_upstash_redis_rest_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_rest_token

# Next.js配置
NEXTAUTH_URL=http://localhost:3002
NEXTAUTH_SECRET=your_nextauth_secret
```

## 🚀 本地开发

### 1. 安装依赖
```bash
pnpm install
```

### 2. 启动开发服务器
```bash
pnpm dev:count-number
```

### 3. 访问应用
打开浏览器访问 `http://localhost:3002`

## 🌐 Vercel部署

### 1. 连接GitHub仓库
1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "New Project"
3. 导入GitHub仓库

### 2. 配置环境变量
在Vercel项目设置中添加环境变量：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `NEXTAUTH_URL` (设置为你的域名)
- `NEXTAUTH_SECRET` (生成随机字符串)

### 3. 部署设置
- Build Command: `pnpm build`
- Install Command: `pnpm install`
- Output Directory: `.next`
- Framework: Next.js

### 4. 部署
点击 "Deploy" 开始部署

## 🔧 功能特性

### ✅ 已实现功能
- 🔐 用户认证系统（注册/登录/登出）
- 📊 计数器管理（创建/更新/删除）
- 📋 任务管理（创建/更新/删除/标记完成）
- ⚙️ 用户偏好设置（主题/语言）
- ⚡ Redis缓存优化
- 🔄 实时数据同步
- 🛡️ 速率限制保护
- 📱 响应式设计

### 🔄 数据流架构
```
用户界面 → Zustand Store → API路由 → Supabase数据库
                ↓
            Redis缓存 ←→ Upstash Redis
```

## 🧪 测试指南

### 1. 功能测试
1. 用户注册/登录流程
2. 计数器增减操作
3. 任务创建和管理
4. 主题切换功能
5. 实时数据更新

### 2. 性能测试
1. 缓存命中率检查
2. API响应时间测试
3. 并发用户测试

### 3. 安全测试
1. 认证授权验证
2. 速率限制测试
3. 数据隔离测试

## 📊 监控和维护

### 1. Supabase监控
- 查看数据库性能
- 监控API调用
- 检查用户活跃度

### 2. Upstash监控
- Redis内存使用情况
- 缓存命中率
- 连接数监控

### 3. Vercel监控
- 应用性能指标
- 错误日志
- 访问统计

## 🔒 安全最佳实践

1. **环境变量安全**：确保敏感信息不泄露到客户端
2. **数据库权限**：使用RLS策略确保数据隔离
3. **速率限制**：防止API滥用
4. **输入验证**：在API层进行数据验证
5. **HTTPS强制**：生产环境必须使用HTTPS

## 🚨 故障排除

### 常见问题

1. **认证失败**
   - 检查Supabase配置
   - 验证环境变量
   - 查看浏览器控制台错误

2. **数据库连接错误**
   - 检查Supabase服务状态
   - 验证Service Role Key
   - 检查RLS策略配置

3. **Redis连接失败**
   - 验证Upstash配置
   - 检查网络连接
   - 查看Redis服务状态

4. **部署失败**
   - 检查构建日志
   - 验证环境变量
   - 检查依赖版本兼容性

## 📈 扩展建议

1. **功能扩展**
   - 添加文件上传功能
   - 实现团队协作
   - 添加数据导出功能

2. **性能优化**
   - 实现CDN加速
   - 添加更多缓存层
   - 优化数据库查询

3. **监控增强**
   - 集成错误追踪服务
   - 添加性能监控
   - 实现日志聚合

## 📞 技术支持

如果遇到问题，请检查：
1. 项目文档和代码注释
2. 各服务平台的官方文档
3. GitHub Issues
4. 社区论坛和Discord

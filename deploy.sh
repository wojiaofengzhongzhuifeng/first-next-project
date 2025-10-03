#!/bin/bash

# Monorepo 部署脚本
# 用于将 count-number 应用部署到 Vercel

echo "🚀 开始部署 count-number 应用到 Vercel..."

# 检查是否安装了 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI 未安装，请先安装："
    echo "npm i -g vercel"
    exit 1
fi

# 检查是否已登录 Vercel
echo "📋 检查 Vercel 登录状态..."
if ! vercel whoami &> /dev/null; then
    echo "🔐 请先登录 Vercel："
    vercel login
fi

# 构建项目
echo "🔨 构建项目..."
pnpm build:count-number

if [ $? -ne 0 ]; then
    echo "❌ 构建失败，请检查错误信息"
    exit 1
fi

echo "✅ 构建成功"

# 部署到 Vercel
echo "🌐 部署到 Vercel..."
vercel --prod

echo "🎉 部署完成！"
echo ""
echo "📋 下一步操作："
echo "1. 在 Vercel Dashboard 中配置环境变量"
echo "2. 添加自定义域名 hellojagtest.lol"
echo "3. 配置 DNS 记录"
echo ""
echo "📖 详细步骤请参考 MONOREPO_DEPLOYMENT_GUIDE.md"

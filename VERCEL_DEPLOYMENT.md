# Vercel 部署指南

## 🚀 部署步骤

### 1. 准备工作

确保你的项目已经推送到 GitHub 仓库。

### 2. 在 Vercel 中导入项目

1. 访问 [Vercel](https://vercel.com)
2. 点击 "New Project"
3. 选择你的 GitHub 仓库
4. 点击 "Import"

### 3. 配置环境变量

在 Vercel 项目设置中添加以下环境变量：

```
NEXT_PUBLIC_SUPABASE_URL=你的Supabase项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Supabase匿名密钥
```

**获取 Supabase 环境变量：**

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 Settings > API
4. 复制以下信息：
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Project API keys > anon public → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. 部署

1. 确认配置无误后，点击 "Deploy"
2. 等待构建完成（通常需要 2-3 分钟）

### 5. 配置 Supabase 认证重定向

部署成功后，需要在 Supabase 中配置认证重定向 URL：

1. 在 Supabase Dashboard 中进入 Authentication > URL Configuration
2. 添加以下 URL 到 Site URL 和 Redirect URLs：
   ```
   https://你的vercel域名.vercel.app
   https://你的vercel域名.vercel.app/auth/callback
   ```

### 6. 自定义域名（可选）

1. 在 Vercel 项目设置中进入 "Domains"
2. 添加你的自定义域名
3. 按照指示配置 DNS 记录
4. 更新 Supabase 中的 URL 配置

## 🔧 常见问题排查

### 问题 1: 构建失败 - 环境变量错误

**错误信息：**
```
Error: either NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY env variables or supabaseUrl and supabaseKey are required!
```

**解决方案：**
1. 检查 Vercel 项目设置中的环境变量是否正确添加
2. 确保环境变量名称完全匹配
3. 重新部署项目

### 问题 2: 认证不工作

**可能原因：**
- Supabase 重定向 URL 配置错误
- 环境变量错误

**解决方案：**
1. 检查 Supabase Authentication > URL Configuration
2. 确保重定向 URL 包含你的 Vercel 域名
3. 检查环境变量是否正确

### 问题 3: 数据库连接失败

**解决方案：**
1. 确保 Supabase 项目正在运行
2. 检查 API 密钥是否有效
3. 确认数据库表结构已正确创建（参考 SETUP.md）

## ✅ 部署后检查清单

- [ ] 网站可以正常访问
- [ ] 主页正常显示
- [ ] 文章列表页面工作正常
- [ ] 用户注册/登录功能可用
- [ ] 文章创建功能正常
- [ ] 文章详情页面可以访问

## 🔄 自动部署

Vercel 会自动：
- 监听 GitHub 仓库的推送
- 在每次推送到主分支时自动部署
- 为拉取请求创建预览部署

## 📊 性能监控

部署后可以在 Vercel Dashboard 中查看：
- 部署状态
- 访问分析
- 性能指标
- 错误日志

## 🛡️ 安全建议

1. **环境变量安全**
   - 定期轮换 API 密钥
   - 确保敏感信息不会出现在客户端代码中

2. **域名安全**
   - 只在 Supabase 中配置可信的重定向 URL
   - 使用 HTTPS（Vercel 自动提供）

3. **数据库安全**
   - 确保 RLS（行级安全）策略正确配置
   - 定期备份数据库

## 📞 支持

如果遇到问题：
1. 查看 Vercel 部署日志
2. 检查 Supabase 仪表板中的日志
3. 参考 [Vercel 文档](https://vercel.com/docs)
4. 参考 [Supabase 文档](https://supabase.com/docs) 
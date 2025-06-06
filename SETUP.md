# 技术博客设置指南

## 环境配置

### 1. 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com) 并创建新项目
2. 记录以下信息：
   - Project URL
   - Public anon key

### 2. 环境变量设置

创建 `.env.local` 文件：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. 数据库结构

在 Supabase SQL 编辑器中执行以下 SQL：

```sql
-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建用户配置表
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (id)
);

-- 创建文章表
CREATE TABLE public.posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    slug TEXT NOT NULL UNIQUE,
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    published BOOLEAN DEFAULT FALSE,
    tags TEXT[],
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引提高查询性能
CREATE INDEX idx_posts_published ON public.posts(published);
CREATE INDEX idx_posts_author_id ON public.posts(author_id);
CREATE INDEX idx_posts_created_at ON public.posts(created_at);
CREATE INDEX idx_posts_slug ON public.posts(slug);
CREATE INDEX idx_posts_tags ON public.posts USING GIN(tags);

-- 设置 RLS (Row Level Security) 策略
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Profiles 策略
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Posts 策略
CREATE POLICY "Published posts are viewable by everyone." ON public.posts
    FOR SELECT USING (published = true);

CREATE POLICY "Users can view their own posts." ON public.posts
    FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "Users can insert their own posts." ON public.posts
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own posts." ON public.posts
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own posts." ON public.posts
    FOR DELETE USING (auth.uid() = author_id);

-- 创建触发器自动更新 updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_posts_updated_at
    BEFORE UPDATE ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 创建用户注册时自动创建 profile 的触发器
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
```

### 4. 用户认证设置

在 Supabase 控制台的 Authentication > Settings 中：

1. 启用邮箱认证
2. 配置重定向 URL：`http://localhost:3000/auth/callback`
3. (可选) 配置其他第三方登录提供商

### 5. 存储设置 (可选)

如果需要上传图片：

1. 在 Supabase Storage 中创建 bucket：`blog-images`
2. 设置公共访问策略

## 运行项目

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 项目功能

### ✅ 已实现功能

- 用户认证（注册/登录/登出）
- Markdown 文章编辑器
- 文章列表展示
- 文章详情页面
- 分类和标签系统
- 响应式设计
- 代码语法高亮

### 🚧 待开发功能

- 搜索功能
- 评论系统
- 文章编辑功能
- 用户个人资料页面
- 图片上传
- SEO 优化
- 深色模式
- RSS 订阅
- 文章收藏
- 阅读统计

## 技术栈

- **前端**: Next.js 15, React 19, TypeScript
- **样式**: Tailwind CSS 4
- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth
- **编辑器**: @uiw/react-md-editor
- **代码高亮**: react-syntax-highlighter

## 部署

### Vercel 部署

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 设置环境变量
4. 部署

### 注意事项

- 确保 Supabase 的重定向 URL 包含生产环境域名
- 生产环境中使用 HTTPS
- 定期备份数据库

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！ 
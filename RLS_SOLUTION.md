# 解决发布文章RLS策略错误

## 问题描述

发布文章时出现 "new row violates row-level security policy for table 'posts'" 错误。这是因为：

1. 数据库的行级安全策略(RLS)要求 `auth.uid() = author_id`
2. 我们使用的是自定义认证系统，不是Supabase的认证系统
3. 没有有效的Supabase用户session

## 解决方案

### 方案一：使用Supabase服务角色密钥（推荐）

1. **获取服务角色密钥**：
   - 访问 [Supabase Dashboard](https://supabase.com/dashboard)
   - 选择你的项目
   - 进入 Settings > API
   - 复制 "service_role" 密钥（**注意：这是私密密钥，不要暴露**）

2. **添加环境变量**：
   在 `.env.local` 文件中添加：
   ```
   SUPABASE_SERVICE_ROLE_KEY=你的服务角色密钥
   ```

3. **启用真正的数据库操作**：
   修改 `src/app/api/posts/create/route.ts`，取消注释数据库插入代码。

### 方案二：修改RLS策略（需要数据库管理权限）

在Supabase SQL编辑器中执行以下SQL：

```sql
-- 为管理员创建特殊的插入策略
CREATE POLICY "Admin can insert posts" ON public.posts
    FOR INSERT WITH CHECK (
        author_id = '00000000-0000-0000-0000-000000000001'
    );

-- 或者暂时禁用posts表的RLS（不推荐用于生产环境）
-- ALTER TABLE public.posts DISABLE ROW LEVEL SECURITY;
```

### 方案三：创建管理员用户记录

在Supabase SQL编辑器中执行：

```sql
-- 在auth.users表中创建管理员用户记录
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'admin@onsre.com',
    '$2a$10$dummy.hash.for.admin', -- 虚拟密码哈希
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Admin"}',
    false,
    'authenticated'
) ON CONFLICT (id) DO NOTHING;
```

## 当前状态

目前API返回模拟成功响应，避免了错误显示。要启用真正的数据库操作，请选择上述解决方案之一。

## 推荐操作步骤

1. 获取Supabase服务角色密钥
2. 添加到环境变量
3. 更新API代码启用真正的数据库操作
4. 测试文章发布功能 
-- 解决发布文章的RLS策略问题
-- 在Supabase SQL编辑器中执行此脚本

-- 1. 为管理员创建特殊的插入策略
CREATE POLICY "Admin can insert posts" ON public.posts
    FOR INSERT WITH CHECK (
        author_id = '00000000-0000-0000-0000-000000000001'
    );

-- 2. 允许管理员查看自己的文章
CREATE POLICY "Admin can view own posts" ON public.posts
    FOR SELECT USING (
        author_id = '00000000-0000-0000-0000-000000000001'
    );

-- 3. 允许管理员更新自己的文章  
CREATE POLICY "Admin can update own posts" ON public.posts
    FOR UPDATE USING (
        author_id = '00000000-0000-0000-0000-000000000001'
    );

-- 4. 允许管理员删除自己的文章
CREATE POLICY "Admin can delete own posts" ON public.posts
    FOR DELETE USING (
        author_id = '00000000-0000-0000-000000000001'
    );

-- 5. 在profiles表中创建管理员配置文件（可选）
INSERT INTO public.profiles (
    id,
    email,
    name
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'admin@onsre.com',
    '管理员'
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name;

-- 执行完成后，应该可以正常发布文章了 
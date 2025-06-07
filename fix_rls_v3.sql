-- 解决发布文章的RLS策略问题 - 简化版本
-- 在Supabase SQL编辑器中执行此脚本

-- 使用有效的UUID格式：a0000000-b000-4000-8000-000000000001

-- 1. 为管理员创建特殊的插入策略
CREATE POLICY "Admin can insert posts" ON public.posts
    FOR INSERT WITH CHECK (
        author_id = 'a0000000-b000-4000-8000-000000000001'::UUID
    );

-- 2. 允许管理员查看自己的文章
CREATE POLICY "Admin can view own posts" ON public.posts
    FOR SELECT USING (
        author_id = 'a0000000-b000-4000-8000-000000000001'::UUID
    );

-- 3. 允许管理员更新自己的文章  
CREATE POLICY "Admin can update own posts" ON public.posts
    FOR UPDATE USING (
        author_id = 'a0000000-b000-4000-8000-000000000001'::UUID
    );

-- 4. 允许管理员删除自己的文章
CREATE POLICY "Admin can delete own posts" ON public.posts
    FOR DELETE USING (
        author_id = 'a0000000-b000-4000-8000-000000000001'::UUID
    );

-- 注意：暂时跳过创建profiles记录，因为需要先在auth.users表中创建对应的用户
-- 执行完成后，应该可以正常发布文章了 
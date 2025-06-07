-- 清理并重新创建RLS策略
-- 在Supabase SQL编辑器中执行此脚本

-- 1. 删除可能已经存在的策略（如果存在）
DROP POLICY IF EXISTS "Admin can insert posts" ON public.posts;
DROP POLICY IF EXISTS "Admin can view own posts" ON public.posts;
DROP POLICY IF EXISTS "Admin can update own posts" ON public.posts;
DROP POLICY IF EXISTS "Admin can delete own posts" ON public.posts;

-- 2. 删除posts表的author_id外键约束（如果存在）
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_author_id_fkey;
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS fk_posts_author;

-- 3. 重新创建管理员专用的RLS策略
CREATE POLICY "Admin can insert posts" ON public.posts
    FOR INSERT WITH CHECK (
        author_id = 'a0000000-b000-4000-8000-000000000001'::UUID
    );

CREATE POLICY "Admin can view own posts" ON public.posts
    FOR SELECT USING (
        author_id = 'a0000000-b000-4000-8000-000000000001'::UUID
    );

CREATE POLICY "Admin can update own posts" ON public.posts
    FOR UPDATE USING (
        author_id = 'a0000000-b000-4000-8000-000000000001'::UUID
    );

CREATE POLICY "Admin can delete own posts" ON public.posts
    FOR DELETE USING (
        author_id = 'a0000000-b000-4000-8000-000000000001'::UUID
    );

-- 完成！现在应该可以正常发布文章了 
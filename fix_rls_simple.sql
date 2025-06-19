-- 最简单的解决方案：删除外键约束
-- 在Supabase SQL编辑器中执行此脚本

-- 1. 删除posts表的author_id外键约束
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_author_id_fkey;

-- 2. 删除可能存在的其他外键约束
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS fk_posts_author;

-- 3. 创建管理员专用的RLS策略
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

-- 临时禁用RLS以解决发布问题
-- 在Supabase SQL编辑器中执行

-- 禁用posts表的RLS
ALTER TABLE public.posts DISABLE ROW LEVEL SECURITY;

-- 如果需要重新启用，使用以下命令：
-- ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY; 
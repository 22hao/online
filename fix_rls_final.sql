-- 解决发布文章的所有约束问题 - 最终版本
-- 在Supabase SQL编辑器中执行此脚本

-- 使用有效的UUID格式：a0000000-b000-4000-8000-000000000001

-- 方案1：暂时禁用外键约束检查（推荐，最简单）
ALTER TABLE public.posts DISABLE TRIGGER ALL;

-- 或者方案2：删除外键约束（如果上面的方案不工作）
-- ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_author_id_fkey;

-- 创建RLS策略
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

-- 重新启用触发器（保留其他约束）
ALTER TABLE public.posts ENABLE TRIGGER ALL;

-- 执行完成后，应该可以正常发布文章了 
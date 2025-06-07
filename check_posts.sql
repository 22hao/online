-- 检查数据库中的文章数据
-- 在Supabase SQL编辑器中执行此脚本

-- 1. 查看所有文章（包括草稿）
SELECT 
    id,
    title,
    slug,
    author_id,
    published,
    created_at,
    LENGTH(content) as content_length
FROM public.posts 
ORDER BY created_at DESC;

-- 2. 查看已发布的文章
SELECT 
    id,
    title,
    slug,
    published,
    created_at
FROM public.posts 
WHERE published = true
ORDER BY created_at DESC;

-- 3. 查看草稿文章
SELECT 
    id,
    title,
    slug,
    published,
    created_at
FROM public.posts 
WHERE published = false
ORDER BY created_at DESC;

-- 4. 统计信息
SELECT 
    COUNT(*) as total_posts,
    COUNT(CASE WHEN published = true THEN 1 END) as published_posts,
    COUNT(CASE WHEN published = false THEN 1 END) as draft_posts
FROM public.posts; 
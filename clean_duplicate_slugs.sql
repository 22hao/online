-- 清理重复的slug记录
-- 在Supabase SQL编辑器中执行此脚本

-- 1. 查看当前重复的slug
SELECT slug, COUNT(*) as count 
FROM public.posts 
GROUP BY slug 
HAVING COUNT(*) > 1;

-- 2. 删除重复的记录，保留最新的
DELETE FROM public.posts 
WHERE id NOT IN (
    SELECT DISTINCT ON (slug) id 
    FROM public.posts 
    ORDER BY slug, created_at DESC
);

-- 3. 如果需要删除所有测试数据，可以使用以下命令（谨慎使用）
-- DELETE FROM public.posts WHERE slug LIKE 'test%';

-- 完成！现在可以尝试重新发布文章了 
import { createSupabaseAdmin } from './supabase-server';

export async function getArticlesByCategoryAndSub(category: string, subcategory: string) {
  const supabase = createSupabaseAdmin();
  let query = supabase.from('posts').select('*').eq('category', category).eq('published', true);
  if (subcategory) {
    query = query.eq('subcategory', subcategory);
  }
  const { data } = await query.order('created_at', { ascending: false });
  return data || [];
}

export async function getArticlesByCategoryWithPagination(
  category: string, 
  page: number = 1, 
  pageSize: number = 9
) {
  const supabase = createSupabaseAdmin();
  
  // 计算偏移量
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  // 获取文章列表
  const { data: articles, error } = await supabase
    .from('posts')
    .select('*')
    .eq('category', category)
    .eq('published', true)
    .order('created_at', { ascending: false })
    .range(from, to);
  
  // 获取总数
  const { count: totalCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('category', category)
    .eq('published', true);
  
  if (error) {
    console.error('Error fetching articles:', error);
    return { articles: [], totalCount: 0 };
  }
  
  return {
    articles: articles || [],
    totalCount: totalCount || 0
  };
} 
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
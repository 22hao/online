import { createSupabaseServer } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const categoryName = searchParams.get('category')
  const supabase = await createSupabaseServer()
  // 查一级分类 id
  const { data: categories } = await supabase.from('categories').select('id').eq('name', categoryName)
  if (!categories?.length) return NextResponse.json({ subcategories: [] })
  const category_id = categories[0].id
  // 查二级分类
  const { data: subcategories } = await supabase.from('subcategories').select('*').eq('category_id', category_id)
  return NextResponse.json({ subcategories })
} 
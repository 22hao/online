import { createSupabaseServer } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createSupabaseServer()
    
    const { data: subcategories, error } = await supabase
      .from('subcategories')
      .select('*')
      .order('category_id', { ascending: true })
      .order('label', { ascending: true })

    if (error) {
      console.error('获取二级分类列表失败:', error)
      return NextResponse.json({ error: '获取二级分类列表失败' }, { status: 500 })
    }

    return NextResponse.json({ subcategories: subcategories || [] })
  } catch (error) {
    console.error('获取二级分类列表失败:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
} 
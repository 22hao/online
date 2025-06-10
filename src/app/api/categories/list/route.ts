import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'

// 获取所有分类列表（不需要管理员权限，写文章时使用）
export async function GET() {
  try {
    const supabase = await createSupabaseServer()
    
    // 获取所有分类
    const { data: categories, error } = await supabase
      .from('categories')
      .select('name, description')
      .order('name')

    if (error) {
      console.error('获取分类列表失败:', error)
      return NextResponse.json({ error: '获取分类列表失败' }, { status: 500 })
    }

    return NextResponse.json({ categories: categories || [] })
  } catch (error) {
    console.error('获取分类列表失败:', error)
    return NextResponse.json({ error: '获取分类列表失败' }, { status: 500 })
  }
} 
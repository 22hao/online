import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'

// 获取所有分类列表（不需要管理员权限，写文章时使用）
export async function GET() {
  try {
    const supabase = await createSupabaseServer()
    
    // 尝试最简单的查询：只查name，限制5条，不排序
    const { data: categories, error } = await supabase
      .from('categories')
      .select('name')
      .limit(5)

    if (error) {
      console.error('获取分类列表失败:', error)
      // 如果查询失败，返回硬编码数据作为备选
      const mockCategories = [
        { name: '前端' }, { name: '后端' }, { name: '云原生' },
        { name: '大数据' }, { name: '运维' }, { name: '安全' }
      ]
      return NextResponse.json({ categories: mockCategories })
    }

    return NextResponse.json({ categories: categories || [] })
  } catch (error) {
    console.error('获取分类列表失败:', error)
    return NextResponse.json({ error: '获取分类列表失败' }, { status: 500 })
  }
} 
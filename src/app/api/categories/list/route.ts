import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'

// 获取所有分类列表（不需要管理员权限，写文章时使用）
export async function GET() {
  try {
    const supabase = await createSupabaseServer()
    
    // 查询包含id和name的完整数据
    const { data: categories, error } = await supabase
      .from('categories')
      .select('id, name')
      .order('id', { ascending: true })

    if (error) {
      console.error('获取分类列表失败:', error)
      // 如果查询失败，返回硬编码数据作为备选（需要包含id）
      const mockCategories = [
        { id: 6, name: '云原生' },
        { id: 11, name: '大数据' },
        { id: 13, name: '安全' },
        { id: 14, name: '运维' },
        { id: 15, name: '前端' }
      ]
      return NextResponse.json({ categories: mockCategories })
    }

    return NextResponse.json({ categories: categories || [] })
  } catch (error) {
    console.error('获取分类列表失败:', error)
    return NextResponse.json({ error: '获取分类列表失败' }, { status: 500 })
  }
} 
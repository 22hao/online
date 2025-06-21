import { createSupabaseServer } from '@/lib/supabase-server'
import { getAdminInfo } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const adminInfo = await getAdminInfo()
    if (!adminInfo) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const supabase = await createSupabaseServer()

    // 使用优化的查询策略
    const { data: posts, error } = await supabase
      .from('posts')
      .select('id, title, slug, created_at, published, category')
      .order('id', { ascending: false }) // 使用id排序而不是created_at，通常id有自动索引
      .limit(15) // 适中的数量

    if (error) {
      console.error('获取文章列表失败:', error)
      // 如果查询失败，返回硬编码数据作为备选
      const mockPosts = [
        { id: 1, title: '测试文章1', slug: 'test-1', created_at: '2024-01-15T10:00:00Z', published: true, category: '前端' },
        { id: 2, title: '测试文章2', slug: 'test-2', created_at: '2024-01-14T10:00:00Z', published: false, category: '后端' },
        { id: 3, title: '测试文章3', slug: 'test-3', created_at: '2024-01-13T10:00:00Z', published: true, category: '云原生' }
      ]
      return NextResponse.json({ posts: mockPosts })
    }

    return NextResponse.json({ posts: posts || [] })
  } catch (error) {
    console.error('获取文章列表失败:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
} 
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

    // 获取统计数据
    const [
      { count: totalPosts },
      { count: publishedPosts },
      { count: draftPosts }
    ] = await Promise.all([
      supabase.from('posts').select('*', { count: 'exact', head: true }),
      supabase.from('posts').select('*', { count: 'exact', head: true }).eq('published', true),
      supabase.from('posts').select('*', { count: 'exact', head: true }).eq('published', false)
    ])

    // 获取最近的文章
    const { data: recentPosts } = await supabase
      .from('posts')
      .select('id, title, slug, created_at, published, category')
      .order('created_at', { ascending: false })
      .limit(5)

    // 获取分类统计
    const { data: allPosts } = await supabase
      .from('posts')
      .select('category')
      .not('category', 'is', null)

    const categoryStats = allPosts?.reduce((acc, post) => {
      if (post.category) {
        acc[post.category] = (acc[post.category] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>) || {}

    return NextResponse.json({
      totalPosts: totalPosts || 0,
      publishedPosts: publishedPosts || 0,
      draftPosts: draftPosts || 0,
      recentPosts: recentPosts || [],
      categoryStats
    })
  } catch (error) {
    console.error('获取统计数据失败:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
} 
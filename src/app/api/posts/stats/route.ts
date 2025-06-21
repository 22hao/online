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

    // 使用最小化采样策略：只查询最新的20篇文章
    const { data: samplePosts, error } = await supabase
      .from('posts')
      .select('id, title, created_at, published')
      .order('id', { ascending: false })
      .limit(20) // 进一步减少采样数量

    if (error || !samplePosts) {
      console.error('获取统计数据失败:', error)
      // 如果查询失败，返回保守估算
      return NextResponse.json({
        totalPosts: 0,
        publishedPosts: 0,
        draftPosts: 0,
        recentPosts: [],
        categoryStats: {}
      })
    }

    // 基于小样本快速统计
    const publishedCount = samplePosts.filter(p => p.published).length
    const draftCount = samplePosts.length - publishedCount
    const recentPosts = samplePosts.slice(0, 3).map(p => ({
      id: p.id,
      title: p.title,
      created_at: p.created_at,
      published: p.published
    }))

    return NextResponse.json({
      totalPosts: samplePosts.length, // 显示实际采样数量
      publishedPosts: publishedCount,
      draftPosts: draftCount,
      recentPosts,
      categoryStats: {} // 暂时移除分类统计，避免额外计算
    })
  } catch (error) {
    console.error('获取统计数据失败:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
} 
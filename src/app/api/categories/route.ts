import { NextResponse } from 'next/server'
import { getAdminInfo } from '@/lib/auth'
import { createSupabaseServer } from '@/lib/supabase-server'

// 获取所有分类
export async function GET() {
  try {
    const adminInfo = await getAdminInfo()
    if (!adminInfo) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const supabase = await createSupabaseServer()
    
    // 从数据库获取真实的分类数据（不包含slug字段）
    const { data: categories, error } = await supabase
      .from('categories')
      .select('id, name, description')
      .order('id', { ascending: true })

    if (error) {
      console.error('获取分类失败:', error)
      return NextResponse.json({ error: '获取分类失败' }, { status: 500 })
    }

    // 获取所有文章的分类统计
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('category, published')

    if (postsError) {
      console.error('获取文章统计失败:', postsError)
      return NextResponse.json({ error: '获取文章统计失败' }, { status: 500 })
    }

    // 统计每个分类的文章数量
    const result = (categories || []).reduce((acc, category) => {
      acc[category.name] = { total: 0, published: 0 }
      return acc
    }, {} as Record<string, { total: number; published: number }>)

    // 计算真实的文章统计
    if (posts) {
      posts.forEach(post => {
        if (post.category && result[post.category]) {
          result[post.category].total += 1
          if (post.published) {
            result[post.category].published += 1
          }
        }
      })
    }

    return NextResponse.json({ categories: result, allCategories: categories || [] })
  } catch (error) {
    console.error('获取分类失败:', error)
    return NextResponse.json({ error: '获取分类失败' }, { status: 500 })
  }
} 
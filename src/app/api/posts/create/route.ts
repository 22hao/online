import { createSupabaseAdmin } from '@/lib/supabase-server'
import { getAdminInfo } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // 验证管理员身份
    const adminInfo = await getAdminInfo()
    if (!adminInfo) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, content, excerpt, category, tags, published, slug } = body

    // 验证必填字段
    if (!title || !content) {
      return NextResponse.json(
        { error: '标题和内容不能为空' },
        { status: 400 }
      )
    }

    const supabase = await createSupabaseAdmin()
    
    // 使用固定的管理员UUID
    const adminId = 'a0000000-b000-4000-8000-000000000001'

    const { data, error } = await supabase
      .from('posts')
      .insert({
        title,
        content,
        excerpt: excerpt || content.substring(0, 200),
        category: category || null,
        tags: tags || null,
        author_id: adminId,
        published: published || false,
        slug,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
} 
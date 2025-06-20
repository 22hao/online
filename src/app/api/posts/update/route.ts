import { createSupabaseAdmin } from '@/lib/supabase-server'
import { getAdminInfo } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function PUT(request: Request) {
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
    const { id, title, content, excerpt, category, subcategory, tags, published } = body

    // 验证必填字段
    if (!id || !title || !content) {
      return NextResponse.json(
        { error: 'ID、标题和内容不能为空' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseAdmin()
    
    // 使用固定的管理员UUID
    const adminId = 'a0000000-b000-4000-8000-000000000001'

    const { data, error } = await supabase
      .from('posts')
      .update({
        title,
        content,
        excerpt: excerpt || content.substring(0, 200),
        category: category || null,
        subcategory: subcategory || null,
        tags: tags || null,
        published: published || false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('author_id', adminId) // 确保只能更新管理员的文章
      .select()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: '文章不存在或无权限修改' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: data[0] })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
} 
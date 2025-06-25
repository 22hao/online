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
    const { title, content, excerpt, category, subcategory, tags, published, slug } = body

    // 验证必填字段
    if (!title || !content) {
      return NextResponse.json(
        { error: '标题和内容不能为空' },
        { status: 400 }
      )
    }

    console.log('创建文章，接收到的数据:', { title, category, subcategory, published, slug })

    const supabase = await createSupabaseAdmin()
    
    // 使用固定的管理员UUID
    const adminId = 'a0000000-b000-4000-8000-000000000001'

    // 检查slug是否重复，如果重复则添加时间戳
    let finalSlug = slug
    const { data: existingPost } = await supabase
      .from('posts')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existingPost) {
      const timestamp = Date.now().toString(36)
      finalSlug = `${slug}-${timestamp}`
      console.log(`Slug重复，生成新的slug: ${finalSlug}`)
    }

    const { data, error } = await supabase
      .from('posts')
      .insert({
        title,
        content,
        excerpt: excerpt || content.substring(0, 200),
        category: category || null,
        subcategory: subcategory || null,
        tags: tags || null,
        author_id: adminId,
        published: published || false,
        slug: finalSlug,
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

    console.log('文章创建成功:', data)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

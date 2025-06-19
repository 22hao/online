import { createSupabaseAdmin } from '@/lib/supabase-server'
import { getAdminInfo } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function DELETE(request: Request) {
  try {
    // 验证管理员身份
    const adminInfo = await getAdminInfo()
    if (!adminInfo) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    // 验证必填字段
    if (!id) {
      return NextResponse.json(
        { error: '文章ID不能为空' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseAdmin()
    
    // 使用固定的管理员UUID
    const adminId = 'a0000000-b000-4000-8000-000000000001'

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)
      .eq('author_id', adminId) // 确保只能删除管理员的文章

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: '文章已删除' })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
} 
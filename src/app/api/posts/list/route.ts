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

    // 获取所有文章
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('获取文章列表失败:', error)
      return NextResponse.json({ error: '获取文章列表失败' }, { status: 500 })
    }

    return NextResponse.json({ posts: posts || [] })
  } catch (error) {
    console.error('获取文章列表失败:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
} 
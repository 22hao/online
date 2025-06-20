import { createSupabaseServer } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createSupabaseServer()
    
    const { data: subcategory, error } = await supabase
      .from('subcategories')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('获取二级分类失败:', error)
      return NextResponse.json({ error: '获取二级分类失败' }, { status: 500 })
    }

    if (!subcategory) {
      return NextResponse.json({ error: '二级分类不存在' }, { status: 404 })
    }

    return NextResponse.json({ subcategory })
  } catch (error) {
    console.error('获取二级分类失败:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
} 
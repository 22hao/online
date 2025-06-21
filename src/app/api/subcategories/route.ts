import { createSupabaseServer } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    
    if (!category) {
      return NextResponse.json({ error: '缺少category参数' }, { status: 400 })
    }

    const supabase = await createSupabaseServer()
    
    // 先查询分类ID
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', category)
      .single()

    if (categoryError || !categoryData) {
      console.error('查找分类失败:', categoryError)
      return NextResponse.json({ error: '分类不存在' }, { status: 404 })
    }

    // 查询该分类下的二级分类
    const { data: subcategories, error } = await supabase
      .from('subcategories')
      .select('*')
      .eq('category_id', categoryData.id)
      .order('label', { ascending: true })

    if (error) {
      console.error('获取二级分类失败:', error)
      return NextResponse.json({ error: '获取二级分类失败' }, { status: 500 })
    }

    return NextResponse.json({ subcategories: subcategories || [] })
  } catch (error) {
    console.error('获取二级分类失败:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { category_id, key, label } = body

    if (!category_id || !key || !label) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    const supabase = await createSupabaseServer()

    // 检查是否已存在相同的key或label
    const { data: existing, error: checkError } = await supabase
      .from('subcategories')
      .select('id')
      .eq('category_id', category_id)
      .or(`key.eq.${key},label.eq.${label}`)

    if (checkError) {
      console.error('检查重复失败:', checkError)
      return NextResponse.json({ error: '检查重复失败' }, { status: 500 })
    }

    if (existing && existing.length > 0) {
      return NextResponse.json({ error: '该分类下已存在相同的Key或名称' }, { status: 400 })
    }

    // 创建新的二级分类
    const { data, error } = await supabase
      .from('subcategories')
      .insert({ category_id, key, label })
      .select()
      .single()

    if (error) {
      console.error('创建二级分类失败:', error)
      return NextResponse.json({ error: '创建二级分类失败' }, { status: 500 })
    }

    return NextResponse.json({ subcategory: data }, { status: 201 })
  } catch (error) {
    console.error('创建二级分类失败:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, key, label } = body

    if (!id || !key || !label) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    const supabase = await createSupabaseServer()

    // 更新二级分类
    const { data, error } = await supabase
      .from('subcategories')
      .update({ key, label })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('更新二级分类失败:', error)
      return NextResponse.json({ error: '更新二级分类失败' }, { status: 500 })
    }

    return NextResponse.json({ subcategory: data })
  } catch (error) {
    console.error('更新二级分类失败:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: '缺少id参数' }, { status: 400 })
    }

    const supabase = await createSupabaseServer()

    // 检查是否有文章使用此二级分类
    const { data: posts, error: checkError } = await supabase
      .from('posts')
      .select('id')
      .eq('subcategory', id)
      .limit(1)

    if (checkError) {
      console.error('检查文章引用失败:', checkError)
      return NextResponse.json({ error: '检查文章引用失败' }, { status: 500 })
    }

    if (posts && posts.length > 0) {
      return NextResponse.json({ error: '无法删除：仍有文章使用此二级分类' }, { status: 400 })
    }

    // 删除二级分类
    const { error } = await supabase
      .from('subcategories')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('删除二级分类失败:', error)
      return NextResponse.json({ error: '删除二级分类失败' }, { status: 500 })
    }

    return NextResponse.json({ message: '删除成功' })
  } catch (error) {
    console.error('删除二级分类失败:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
} 
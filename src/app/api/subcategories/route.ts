import { createSupabaseServer } from '@/lib/supabase-server'
import { getAdminInfo } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const categoryName = searchParams.get('category')
    
    console.log('API: 请求二级分类，分类名称:', categoryName)
    
    if (!categoryName) {
      return NextResponse.json({ error: '缺少分类参数' }, { status: 400 })
    }
    
    const supabase = await createSupabaseServer()
    
    // 查一级分类 id
    const { data: categories, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('name', categoryName)
    
    console.log('API: 查找分类结果:', categories, categoryError)
    
    if (categoryError) {
      console.error('API: 查找分类出错:', categoryError)
      return NextResponse.json({ error: '查找分类失败' }, { status: 500 })
    }
    
    if (!categories?.length) {
      console.log('API: 未找到分类:', categoryName)
      return NextResponse.json({ subcategories: [] })
    }
    
    const category_id = categories[0].id
    console.log('API: 分类ID:', category_id)
    
    // 查二级分类
    const { data: subcategories, error: subcategoryError } = await supabase
      .from('subcategories')
      .select('*')
      .eq('category_id', category_id)
    
    console.log('API: 二级分类查询结果:', subcategories, subcategoryError)
    
    if (subcategoryError) {
      console.error('API: 查找二级分类出错:', subcategoryError)
      return NextResponse.json({ error: '查找二级分类失败' }, { status: 500 })
    }
    
    return NextResponse.json({ subcategories: subcategories || [] })
  } catch (error) {
    console.error('API: 处理请求出错:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}

// 创建新二级分类
export async function POST(request: Request) {
  try {
    const adminInfo = await getAdminInfo()
    if (!adminInfo) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { category_id, key, label } = await request.json()
    
    if (!category_id || !key || !label) {
      return NextResponse.json({ error: '所有字段均为必填' }, { status: 400 })
    }

    const supabase = await createSupabaseServer()
    
    // 检查二级分类是否已存在
    const { data: existingSubcategory } = await supabase
      .from('subcategories')
      .select('id')
      .eq('category_id', category_id)
      .eq('key', key.trim())
      .single()

    if (existingSubcategory) {
      return NextResponse.json({ error: '该分类下已存在相同的二级分类key' }, { status: 400 })
    }

    // 创建新二级分类
    const { data, error } = await supabase
      .from('subcategories')
      .insert({
        category_id: Number(category_id),
        key: key.trim(),
        label: label.trim()
      })
      .select()

    if (error) {
      console.error('创建二级分类失败:', error)
      return NextResponse.json({ error: '创建二级分类失败: ' + error.message }, { status: 500 })
    }

    console.log('二级分类创建成功:', data)
    return NextResponse.json({ success: true, data, message: '二级分类创建成功' })
  } catch (error) {
    console.error('创建二级分类失败:', error)
    return NextResponse.json({ error: '创建二级分类失败' }, { status: 500 })
  }
}

// 更新二级分类
export async function PUT(request: Request) {
  try {
    const adminInfo = await getAdminInfo()
    if (!adminInfo) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { id, category_id, key, label } = await request.json()
    
    if (!id || !category_id || !key || !label) {
      return NextResponse.json({ error: '所有字段均为必填' }, { status: 400 })
    }

    const supabase = await createSupabaseServer()
    
    // 检查是否存在相同key的其他二级分类
    const { data: existingSubcategory } = await supabase
      .from('subcategories')
      .select('id')
      .eq('category_id', category_id)
      .eq('key', key.trim())
      .neq('id', id)
      .single()

    if (existingSubcategory) {
      return NextResponse.json({ error: '该分类下已存在相同的二级分类key' }, { status: 400 })
    }

    // 更新二级分类
    const { data, error } = await supabase
      .from('subcategories')
      .update({
        category_id: Number(category_id),
        key: key.trim(),
        label: label.trim()
      })
      .eq('id', id)
      .select()

    if (error) {
      console.error('更新二级分类失败:', error)
      return NextResponse.json({ error: '更新二级分类失败: ' + error.message }, { status: 500 })
    }

    console.log('二级分类更新成功:', data)
    return NextResponse.json({ success: true, data, message: '二级分类更新成功' })
  } catch (error) {
    console.error('更新二级分类失败:', error)
    return NextResponse.json({ error: '更新二级分类失败' }, { status: 500 })
  }
}

// 删除二级分类
export async function DELETE(request: Request) {
  try {
    const adminInfo = await getAdminInfo()
    if (!adminInfo) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: '缺少二级分类ID' }, { status: 400 })
    }

    const supabase = await createSupabaseServer()
    
    // 检查是否有文章使用了这个二级分类
    const { data: posts } = await supabase
      .from('posts')
      .select('id')
      .eq('subcategory', id)
      .limit(1)

    if (posts && posts.length > 0) {
      return NextResponse.json({ error: '无法删除：还有文章使用了此二级分类' }, { status: 400 })
    }

    // 删除二级分类
    const { error } = await supabase
      .from('subcategories')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('删除二级分类失败:', error)
      return NextResponse.json({ error: '删除二级分类失败: ' + error.message }, { status: 500 })
    }

    console.log('二级分类删除成功:', id)
    return NextResponse.json({ success: true, message: '二级分类删除成功' })
  } catch (error) {
    console.error('删除二级分类失败:', error)
    return NextResponse.json({ error: '删除二级分类失败' }, { status: 500 })
  }
} 
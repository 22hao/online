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

    // 临时返回硬编码数据，测试性能
    const mockCategories = [
      { id: 1, name: '前端', slug: 'frontend', description: '前端技术' },
      { id: 2, name: '后端', slug: 'backend', description: '后端技术' },
      { id: 3, name: '云原生', slug: 'cloudnative', description: '云原生技术' },
      { id: 4, name: '大数据', slug: 'bigdata', description: '大数据技术' },
      { id: 5, name: '运维', slug: 'ops', description: '运维技术' },
      { id: 6, name: '安全', slug: 'security', description: '安全技术' }
    ]

    const result = mockCategories.reduce((acc, category) => {
      acc[category.name] = { total: 0, published: 0 }
      return acc
    }, {} as Record<string, { total: number; published: number }>)

    return NextResponse.json({ categories: result, allCategories: mockCategories })
  } catch (error) {
    console.error('获取分类失败:', error)
    return NextResponse.json({ error: '获取分类失败' }, { status: 500 })
  }
}

// 创建新分类
export async function POST(request: Request) {
  try {
    const adminInfo = await getAdminInfo()
    if (!adminInfo) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { name, description } = await request.json()
    
    if (!name || !name.trim()) {
      return NextResponse.json({ error: '分类名称不能为空' }, { status: 400 })
    }

    const supabase = await createSupabaseServer()
    
    // 检查分类是否已存在
    const { data: existingCategory } = await supabase
      .from('categories')
      .select('id')
      .eq('name', name.trim())
      .single()

    if (existingCategory) {
      return NextResponse.json({ error: '分类名称已存在' }, { status: 400 })
    }

    // 创建新分类
    const { error } = await supabase
      .from('categories')
      .insert({
        name: name.trim(),
        description: description?.trim() || null
      })

    if (error) {
      console.error('创建分类失败:', error)
      return NextResponse.json({ error: '创建分类失败' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: '分类创建成功' })
  } catch (error) {
    console.error('创建分类失败:', error)
    return NextResponse.json({ error: '创建分类失败' }, { status: 500 })
  }
}

// 更新分类名称
export async function PUT(request: Request) {
  try {
    const adminInfo = await getAdminInfo()
    if (!adminInfo) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { oldName, newName } = await request.json()
    
    if (!oldName || !newName || !newName.trim()) {
      return NextResponse.json({ error: '分类名称不能为空' }, { status: 400 })
    }

    const supabase = await createSupabaseServer()
    
    // 更新分类表中的分类名称
    const { error: categoryError } = await supabase
      .from('categories')
      .update({ name: newName.trim() })
      .eq('name', oldName)

    if (categoryError) {
      console.error('更新分类表失败:', categoryError)
      return NextResponse.json({ error: '更新分类失败' }, { status: 500 })
    }
    
    // 更新所有使用此分类的文章
    const { error: postsError } = await supabase
      .from('posts')
      .update({ category: newName.trim() })
      .eq('category', oldName)

    if (postsError) {
      console.error('更新文章分类失败:', postsError)
      return NextResponse.json({ error: '更新分类失败' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: '分类更新成功' })
  } catch (error) {
    console.error('更新分类失败:', error)
    return NextResponse.json({ error: '更新分类失败' }, { status: 500 })
  }
}

// 删除分类
export async function DELETE(request: Request) {
  try {
    const adminInfo = await getAdminInfo()
    if (!adminInfo) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const categoryName = searchParams.get('name')
    
    if (!categoryName) {
      return NextResponse.json({ error: '分类名称不能为空' }, { status: 400 })
    }

    const supabase = await createSupabaseServer()
    
    // 检查是否有文章使用此分类
    const { data: posts } = await supabase
      .from('posts')
      .select('id')
      .eq('category', categoryName)

    if (posts && posts.length > 0) {
      return NextResponse.json({ 
        error: `无法删除分类"${categoryName}"，还有 ${posts.length} 篇文章使用此分类` 
      }, { status: 400 })
    }

    // 从分类表中删除
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('name', categoryName)

    if (error) {
      console.error('删除分类失败:', error)
      return NextResponse.json({ error: '删除分类失败' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: '分类删除成功' })
  } catch (error) {
    console.error('删除分类失败:', error)
    return NextResponse.json({ error: '删除分类失败' }, { status: 500 })
  }
} 
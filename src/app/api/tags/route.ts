import { NextResponse } from 'next/server'
import { getAdminInfo } from '@/lib/auth'
import { createSupabaseServer } from '@/lib/supabase-server'

// 获取所有标签
export async function GET() {
  try {
    const adminInfo = await getAdminInfo()
    if (!adminInfo) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const supabase = await createSupabaseServer()
    
    // 获取所有文章的标签信息
    const { data: posts } = await supabase
      .from('posts')
      .select('tags, published')

    // 统计标签数据
    const tagStats = posts?.reduce((acc, post) => {
      if (post.tags && Array.isArray(post.tags)) {
        post.tags.forEach((tag: string) => {
          if (!acc[tag]) {
            acc[tag] = { total: 0, published: 0 }
          }
          acc[tag].total += 1
          if (post.published) {
            acc[tag].published += 1
          }
        })
      }
      return acc
    }, {} as Record<string, { total: number; published: number }>) || {}

    return NextResponse.json({ tags: tagStats })
  } catch (error) {
    console.error('获取标签失败:', error)
    return NextResponse.json({ error: '获取标签失败' }, { status: 500 })
  }
}

// 更新标签名称
export async function PUT(request: Request) {
  try {
    const adminInfo = await getAdminInfo()
    if (!adminInfo) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { oldName, newName } = await request.json()
    
    if (!oldName || !newName || !newName.trim()) {
      return NextResponse.json({ error: '标签名称不能为空' }, { status: 400 })
    }

    const supabase = await createSupabaseServer()
    
    // 获取所有包含此标签的文章
    const { data: posts, error: fetchError } = await supabase
      .from('posts')
      .select('id, tags')
      .contains('tags', [oldName])

    if (fetchError) {
      console.error('获取文章失败:', fetchError)
      return NextResponse.json({ error: '获取文章失败' }, { status: 500 })
    }

    if (posts && posts.length > 0) {
      // 批量更新文章标签
      const updatePromises = posts.map(post => {
        const updatedTags = post.tags?.map((tag: string) => 
          tag === oldName ? newName.trim() : tag
        ) || []
        
        return supabase
          .from('posts')
          .update({ tags: updatedTags })
          .eq('id', post.id)
      })

      const results = await Promise.all(updatePromises)
      const hasError = results.some(result => result.error)
      
      if (hasError) {
        console.error('更新标签失败')
        return NextResponse.json({ error: '更新标签失败' }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true, message: '标签更新成功' })
  } catch (error) {
    console.error('更新标签失败:', error)
    return NextResponse.json({ error: '更新标签失败' }, { status: 500 })
  }
}

// 删除标签
export async function DELETE(request: Request) {
  try {
    const adminInfo = await getAdminInfo()
    if (!adminInfo) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const tagName = searchParams.get('name')
    
    if (!tagName) {
      return NextResponse.json({ error: '标签名称不能为空' }, { status: 400 })
    }

    const supabase = await createSupabaseServer()
    
    // 获取所有包含此标签的文章
    const { data: posts, error: fetchError } = await supabase
      .from('posts')
      .select('id, tags')
      .contains('tags', [tagName])

    if (fetchError) {
      console.error('获取文章失败:', fetchError)
      return NextResponse.json({ error: '获取文章失败' }, { status: 500 })
    }

    if (posts && posts.length > 0) {
      // 从所有文章中删除此标签
      const updatePromises = posts.map(post => {
        const updatedTags = post.tags?.filter((tag: string) => tag !== tagName) || []
        
        return supabase
          .from('posts')
          .update({ tags: updatedTags })
          .eq('id', post.id)
      })

      const results = await Promise.all(updatePromises)
      const hasError = results.some(result => result.error)
      
      if (hasError) {
        console.error('删除标签失败')
        return NextResponse.json({ error: '删除标签失败' }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true, 
        message: `标签删除成功，已从 ${posts.length} 篇文章中移除` 
      })
    }

    return NextResponse.json({ success: true, message: '标签删除成功' })
  } catch (error) {
    console.error('删除标签失败:', error)
    return NextResponse.json({ error: '删除标签失败' }, { status: 500 })
  }
} 
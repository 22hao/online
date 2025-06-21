import { createSupabaseServer } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createSupabaseServer()
    
    // 优化查询：只选择必要字段，限制数量，简化排序
    const { data: subcategories, error } = await supabase
      .from('subcategories')
      .select('id, category_id, key, label')
      .limit(50)
      .order('id', { ascending: true })

    if (error) {
      console.error('获取二级分类列表失败:', error)
      // 如果查询失败，返回硬编码数据作为备选
      const mockSubcategories = [
        { id: 1, category_id: 6, key: 'docker', label: 'Docker' },
        { id: 2, category_id: 6, key: 'kubernetes', label: 'Kubernetes' },
        { id: 3, category_id: 6, key: 'istio', label: 'Istio' },
        { id: 4, category_id: 11, key: 'spark', label: 'Spark' },
        { id: 5, category_id: 11, key: 'hadoop', label: 'Hadoop' },
        { id: 6, category_id: 11, key: 'kafka', label: 'Kafka' },
        { id: 7, category_id: 14, key: 'linux', label: '基础' },
        { id: 8, category_id: 14, key: 'monitor', label: '监控' },
        { id: 9, category_id: 14, key: 'network', label: '网络' }
      ]
      return NextResponse.json({ subcategories: mockSubcategories })
    }

    return NextResponse.json({ subcategories: subcategories || [] })
  } catch (error) {
    console.error('获取二级分类列表失败:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
} 
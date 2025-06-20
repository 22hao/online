'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'

interface Category {
  id: number
  name: string
}

interface Subcategory {
  id: number
  category_id: number
  key: string
  label: string
}

function slugify(str: string) {
  return str
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u4e00-\u9fa5-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function EditSubcategory({ params }: { params: { id: string } }) {
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategory, setSubcategory] = useState<Subcategory | null>(null)
  const [categoryId, setCategoryId] = useState('')
  const [label, setLabel] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  // 获取分类列表和二级分类详情
  useEffect(() => {
    async function fetchData() {
      try {
        // 并行获取分类列表和二级分类详情
        const [categoriesResponse, subcategoryResponse] = await Promise.all([
          fetch('/api/categories'),
          fetch(`/api/subcategories/${params.id}`)
        ])

        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json()
          setCategories(categoriesData.allCategories || [])
        }

        if (subcategoryResponse.ok) {
          const subcategoryData = await subcategoryResponse.json()
          setSubcategory(subcategoryData.subcategory)
          setCategoryId(subcategoryData.subcategory.category_id.toString())
          setLabel(subcategoryData.subcategory.label)
        } else {
          setError('获取二级分类详情失败')
        }
      } catch (error) {
        console.error('获取数据失败:', error)
        setError('获取数据失败')
      } finally {
        setFetchLoading(false)
      }
    }
    fetchData()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!categoryId || !label.trim()) {
      setError('请填写完整的信息')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const key = slugify(label)
      
      const response = await fetch('/api/subcategories', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: params.id,
          category_id: Number(categoryId),
          key,
          label: label.trim()
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('二级分类更新成功！')
        console.log('二级分类更新成功:', data)
        
        // 延迟跳转，让用户看到成功信息
        setTimeout(() => {
          router.push('/admin/subcategories')
        }, 1500)
      } else {
        setError(data.error || '更新失败')
      }
    } catch (error) {
      console.error('更新二级分类失败:', error)
      setError('更新失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <AdminLayout>
        <div className="max-w-md mx-auto p-8 bg-white rounded shadow">
          <div className="text-center">加载中...</div>
        </div>
      </AdminLayout>
    )
  }

  if (!subcategory) {
    return (
      <AdminLayout>
        <div className="max-w-md mx-auto p-8 bg-white rounded shadow">
          <div className="text-center text-red-600">二级分类不存在</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-md mx-auto p-8 bg-white rounded shadow">
        <h2 className="text-xl font-bold mb-4">编辑二级分类</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              选择一级分类
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            >
              <option value="">请选择一级分类</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              二级分类名称
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
              placeholder="如：日志系统、监控系统等"
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            {label && (
              <p className="text-sm text-gray-500 mt-1">
                Key值: {slugify(label)}
              </p>
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '更新中...' : '保存'}
            </button>
            
            <button
              type="button"
              onClick={() => router.push('/admin/subcategories')}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              disabled={loading}
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
} 
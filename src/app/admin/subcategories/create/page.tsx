'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'

interface Category {
  id: number
  name: string
}

function slugify(str: string) {
  return str
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')            // 空格转-
    .replace(/[^\w\u4e00-\u9fa5-]+/g, '') // 移除特殊字符，保留中文
    .replace(/--+/g, '-')            // 多个-合并
    .replace(/^-+|-+$/g, '');        // 去除首尾-
}

export default function CreateSubcategory() {
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryId, setCategoryId] = useState('')
  const [label, setLabel] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  // 获取分类列表
  useEffect(() => {
    async function fetchCategories() {
      try {
        const categoriesResponse = await fetch('/api/categories')
        if (categoriesResponse.ok) {
          const data = await categoriesResponse.json()
          setCategories(data.allCategories || [])
        } else {
          setError('获取分类列表失败')
        }
      } catch (error) {
        console.error('获取分类列表失败:', error)
        setError('获取分类列表失败')
      }
    }
    fetchCategories()
  }, [])

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
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category_id: Number(categoryId),
          key,
          label: label.trim()
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('二级分类创建成功！')
        console.log('二级分类创建成功:', data)
        
        // 延迟跳转，让用户看到成功信息
        setTimeout(() => {
          router.push('/admin/subcategories')
        }, 1500)
      } else {
        setError(data.error || '创建失败')
      }
    } catch (error) {
      console.error('创建二级分类失败:', error)
      setError('创建失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-md mx-auto p-8 bg-white rounded shadow">
        <h2 className="text-xl font-bold mb-4">新增二级分类</h2>
        
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
              {loading ? '创建中...' : '保存'}
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
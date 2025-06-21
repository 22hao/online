'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import Link from 'next/link'

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

export default function AdminSubcategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null)

  // 优化数据获取：并行获取，避免循环调用
  const fetchData = async () => {
    try {
      setLoading(true)
      
      // 并行获取分类和二级分类数据
      const [categoriesResponse, subcategoriesResponse] = await Promise.all([
        fetch('/api/categories/list'),
        fetch('/api/subcategories/list')
      ])

      // 处理分类数据
      if (categoriesResponse.ok) {
        const data = await categoriesResponse.json()
        setCategories(data.categories || [])
      }

      // 处理二级分类数据
      if (subcategoriesResponse.ok) {
        const subcategoriesData = await subcategoriesResponse.json()
        setSubcategories(subcategoriesData.subcategories || [])
      } else {
        console.error('获取二级分类失败')
        setError('获取二级分类失败')
      }
    } catch (error) {
      console.error('获取数据失败:', error)
      setError('获取数据失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // 删除二级分类
  const handleDelete = async (id: number, label: string) => {
    if (!confirm(`确定要删除二级分类"${label}"吗？`)) {
      return
    }

    setDeleteLoading(id)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/subcategories?id=${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('二级分类删除成功！')
        // 重新获取数据
        fetchData()
        // 3秒后清除成功信息
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.error || '删除失败')
      }
    } catch (error) {
      console.error('删除二级分类失败:', error)
      setError('删除失败，请重试')
    } finally {
      setDeleteLoading(null)
    }
  }

  const getCategoryName = (categoryId: number) => {
    if (!Array.isArray(categories)) {
      return '未知分类'
    }
    
    const category = categories.find(c => c.id === categoryId)
    return category?.name || '未知分类'
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-8">
          <div className="text-lg">加载中...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">二级分类管理</h1>
          <p className="text-gray-600 mt-1">管理所有一级分类下的二级分类</p>
        </div>

        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        <div className="mb-4">
          <Link 
            href="/admin/subcategories/create" 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            新增二级分类
          </Link>
        </div>

        <div className="bg-white rounded-lg overflow-hidden shadow">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  所属一级分类
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Key
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  名称
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subcategories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    暂无二级分类数据
                  </td>
                </tr>
              ) : (
                subcategories.map(sub => (
                  <tr key={sub.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getCategoryName(sub.category_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sub.key}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sub.label}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-3">
                        <Link 
                          href={`/admin/subcategories/edit/${sub.id}`} 
                          className="text-blue-600 hover:text-blue-900"
                        >
                          编辑
                        </Link>
                        <button
                          onClick={() => handleDelete(sub.id, sub.label)}
                          disabled={deleteLoading === sub.id}
                          className={`text-red-600 hover:text-red-900 ${deleteLoading === sub.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {deleteLoading === sub.id ? '删除中...' : '删除'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
} 
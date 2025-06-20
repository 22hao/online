'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import CategoryManager from '@/components/admin/CategoryManager'

interface CategoryStats {
  total: number
  published: number
}

export default function AdminCategories() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [categoryStats, setCategoryStats] = useState<Record<string, CategoryStats>>({})
  const [totalCategories, setTotalCategories] = useState(0)
  const [totalPosts, setTotalPosts] = useState(0)

  useEffect(() => {
    async function checkAuthAndFetchData() {
      try {
        // 检查管理员权限
        const authResponse = await fetch('/api/auth/admin-check')
        if (!authResponse.ok) {
          router.push('/admin/login')
          return
        }

        // 获取分类数据
        const categoriesResponse = await fetch('/api/categories')
        if (categoriesResponse.ok) {
          const data = await categoriesResponse.json()
          setCategoryStats(data.categories || {})
          setTotalCategories(data.allCategories?.length || 0)
          
          // 计算总文章数
          const total = Object.values(data.categories || {}).reduce((sum: number, cat: any) => sum + cat.total, 0)
          setTotalPosts(total)
        } else {
          setError('获取分类数据失败')
        }
      } catch (error) {
        console.error('获取数据失败:', error)
        setError('获取数据失败')
      } finally {
        setLoading(false)
      }
    }

    checkAuthAndFetchData()
  }, [router])

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-8">
          <div className="text-lg">加载中...</div>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center py-8">
          <div className="text-red-600">{error}</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">分类管理</h1>
          <p className="text-gray-600 mt-1">管理文章分类和统计信息</p>
        </div>

        {/* 分类统计概览 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">📂</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">使用中的分类</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Object.keys(categoryStats).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">📋</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总分类数</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalCategories}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">📝</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总文章数</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalPosts}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 分类管理器 */}
        <CategoryManager initialCategories={categoryStats} />
      </div>
    </AdminLayout>
  )
} 
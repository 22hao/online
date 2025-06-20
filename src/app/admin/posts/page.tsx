'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import PostsManager from '@/components/admin/PostsManager'

interface Post {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  category?: string
  subcategory?: string
  tags?: string[]
  published: boolean
  created_at: string
  updated_at: string
}

export default function AdminPosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        
        // 检查管理员权限
        const authResponse = await fetch('/api/auth/admin-check')
        if (!authResponse.ok) {
          router.push('/admin/login')
          return
        }

        // 获取文章列表
        const postsResponse = await fetch('/api/posts/list')
        if (postsResponse.ok) {
          const data = await postsResponse.json()
          setPosts(data.posts || [])
        } else {
          setError('获取文章列表失败')
        }
      } catch (error) {
        console.error('获取数据失败:', error)
        setError('获取数据失败')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">加载中...</div>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">{error}</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">文章管理</h1>
          <p className="text-gray-600 mt-1">管理你的所有文章内容</p>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded">
                <span className="text-lg">📝</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">总文章</p>
                <p className="text-lg font-semibold">{posts.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded">
                <span className="text-lg">✅</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">已发布</p>
                <p className="text-lg font-semibold">
                  {posts.filter(p => p.published).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded">
                <span className="text-lg">📄</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">草稿</p>
                <p className="text-lg font-semibold">
                  {posts.filter(p => !p.published).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 文章管理器 */}
        <PostsManager posts={posts} />
      </div>
    </AdminLayout>
  )
} 
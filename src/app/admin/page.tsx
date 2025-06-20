'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import Link from 'next/link'

interface Post {
  id: string
  title: string
  slug: string
  created_at: string
  published: boolean
  category?: string
}

interface StatsData {
  totalPosts: number
  publishedPosts: number
  draftPosts: number
  recentPosts: Post[]
  categoryStats: Record<string, number>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatsData>({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    recentPosts: [],
    categoryStats: {}
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true)
        
        // 检查管理员权限 - 通过API调用
        const authResponse = await fetch('/api/auth/admin-check')
        if (!authResponse.ok) {
          router.push('/admin/login')
          return
        }

        // 获取统计数据
        const [postsResponse] = await Promise.all([
          fetch('/api/posts/stats')
        ])

        if (postsResponse.ok) {
          const data = await postsResponse.json()
          setStats(data)
        } else {
          setError('获取统计数据失败')
        }
      } catch (error) {
        console.error('获取面板数据失败:', error)
        setError('获取数据失败')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [router])

  const quickActions = [
    {
      title: '写文章',
      description: '创建新的技术文章',
      href: '/posts/create',
      icon: '✍️',
      color: 'bg-blue-500'
    },
    {
      title: '文章管理',
      description: '管理所有文章',
      href: '/admin/posts',
      icon: '📝',
      color: 'bg-green-500'
    },
    {
      title: '分类管理',
      description: '管理文章分类',
      href: '/admin/categories',
      icon: '📂',
      color: 'bg-purple-500'
    },
    {
      title: '二级分类管理',
      description: '管理二级分类',
      href: '/admin/subcategories',
      icon: '📑',
      color: 'bg-indigo-500'
    },
    {
      title: '标签管理',
      description: '管理文章标签',
      href: '/admin/tags',
      icon: '🏷️',
      color: 'bg-orange-500'
    }
  ]

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
      <div className="space-y-8">
        {/* 欢迎信息 */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900">管理面板</h1>
          <p className="text-lg text-gray-600 mt-3">欢迎回来！管理你的 SRE 技术博客</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <span className="text-3xl">📝</span>
              </div>
              <div className="ml-5">
                <p className="text-base font-medium text-gray-600">总文章数</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalPosts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <span className="text-3xl">✅</span>
              </div>
              <div className="ml-5">
                <p className="text-base font-medium text-gray-600">已发布</p>
                <p className="text-3xl font-bold text-gray-900">{stats.publishedPosts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <span className="text-3xl">📄</span>
              </div>
              <div className="ml-5">
                <p className="text-base font-medium text-gray-600">草稿</p>
                <p className="text-3xl font-bold text-gray-900">{stats.draftPosts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <span className="text-3xl">📂</span>
              </div>
              <div className="ml-5">
                <p className="text-base font-medium text-gray-600">分类数量</p>
                <p className="text-3xl font-bold text-gray-900">{Object.keys(stats.categoryStats).length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 快捷操作 */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">快捷操作</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="text-center">
                  <div className={`inline-flex p-4 ${action.color} rounded-lg text-white mb-4`}>
                    <span className="text-2xl">{action.icon}</span>
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">{action.title}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* 最近文章和分类统计 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 最近文章 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">最近文章</h2>
              <Link href="/admin/posts" className="text-blue-600 hover:text-blue-800 text-base font-medium">
                查看全部 →
              </Link>
            </div>
            <div className="space-y-3">
              {stats.recentPosts && stats.recentPosts.length > 0 ? (
                stats.recentPosts.map((post) => (
                  <div key={post.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex-1">
                      <Link href={`/posts/${post.slug}`} className="block">
                        <h3 className="font-semibold text-lg text-gray-900 truncate hover:text-blue-600 transition-colors cursor-pointer">{post.title}</h3>
                        <p className="text-base text-gray-500">
                          {new Date(post.created_at).toLocaleDateString('zh-CN')}
                        </p>
                      </Link>
                    </div>
                    <span className={`px-3 py-2 text-sm font-medium rounded-full ${
                      post.published 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {post.published ? '已发布' : '草稿'}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-6 text-base">暂无文章</p>
              )}
            </div>
          </div>

          {/* 分类统计 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">分类统计</h2>
              <Link href="/admin/categories" className="text-blue-600 hover:text-blue-800 text-base font-medium">
                管理分类 →
              </Link>
            </div>
            <div className="space-y-4">
              {Object.entries(stats.categoryStats).length > 0 ? (
                Object.entries(stats.categoryStats)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-base font-medium text-gray-900">{category}</span>
                      <span className="text-lg font-bold text-gray-600">{count} 篇</span>
                    </div>
                  ))
              ) : (
                <p className="text-gray-500 text-center py-6 text-base">暂无分类统计</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
} 
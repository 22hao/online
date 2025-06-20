'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import TagManager from '@/components/admin/TagManager'

interface TagStats {
  total: number
  published: number
}

export default function AdminTags() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tagStats, setTagStats] = useState<Record<string, TagStats>>({})

  // 常用的 SRE 标签推荐
  const recommendedTags = [
    'Kubernetes',
    'Docker',
    'Prometheus',
    'Grafana',
    'Ansible',
    'Terraform',
    'Jenkins',
    'GitLab CI',
    'AWS',
    'Azure',
    'GCP',
    'Linux',
    'Shell',
    'Python',
    'Go',
    'Nginx',
    'MySQL',
    'Redis',
    'ELK',
    'Jaeger',
    '故障排查',
    '性能调优',
    '高可用',
    '负载均衡',
    '微服务',
    '服务网格',
    'Istio',
    'Envoy'
  ]

  useEffect(() => {
    async function checkAuthAndFetchData() {
      try {
        // 检查管理员权限
        const authResponse = await fetch('/api/auth/admin-check')
        if (!authResponse.ok) {
          router.push('/admin/login')
          return
        }

        // 获取标签数据
        const tagsResponse = await fetch('/api/tags')
        if (tagsResponse.ok) {
          const data = await tagsResponse.json()
          setTagStats(data.tags || {})
        } else {
          setError('获取标签数据失败')
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

  // 获取标签使用频率排序
  const sortedTags = Object.entries(tagStats)
    .sort(([,a], [,b]) => b.total - a.total)

  // 获取最受欢迎的标签（前10个）
  const popularTags = sortedTags.slice(0, 10)

  // 计算统计数据
  const totalTagUsage = Object.values(tagStats).reduce((sum, tag) => sum + tag.total, 0)
  const totalPosts = Object.values(tagStats).reduce((sum, tag) => sum + Math.min(tag.total, 1), 0) // 估算文章数

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">标签管理</h1>
          <p className="text-gray-600 mt-1">管理文章标签和查看使用统计</p>
        </div>

        {/* 标签统计概览 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <span className="text-2xl">🏷️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">使用中的标签</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Object.keys(tagStats).length}
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
                <p className="text-sm font-medium text-gray-600">推荐标签</p>
                <p className="text-2xl font-bold text-gray-900">
                  {recommendedTags.length}
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
                <p className="text-sm font-medium text-gray-600">标签使用总次数</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalTagUsage}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">⭐</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">平均每篇文章</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalPosts > 0 ? 
                    Math.round(totalTagUsage / totalPosts * 10) / 10 
                    : 0} 
                  <span className="text-sm text-gray-500 ml-1">个标签</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 标签管理器 */}
        <TagManager initialTags={tagStats} />
      </div>
    </AdminLayout>
  )
} 
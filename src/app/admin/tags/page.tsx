import { createSupabaseServer } from '@/lib/supabase-server'
import { getAdminInfo } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import TagManager from '@/components/admin/TagManager'

export default async function AdminTags() {
  // 检查管理员权限
  const adminInfo = await getAdminInfo()
  if (!adminInfo) {
    redirect('/admin/login')
  }

  const supabase = await createSupabaseServer()

  // 获取所有文章的标签信息
  const { data: allPosts } = await supabase
    .from('posts')
    .select('tags, published')

  // 统计标签数据
  const tagStats = allPosts?.reduce((acc, post) => {
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

  // 获取标签使用频率排序
  const sortedTags = Object.entries(tagStats)
    .sort(([,a], [,b]) => b.total - a.total)

  // 获取最受欢迎的标签（前10个）
  const popularTags = sortedTags.slice(0, 10)

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
                  {Object.values(tagStats).reduce((sum, tag) => sum + tag.total, 0)}
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
                  {allPosts && allPosts.length > 0 ? 
                    Math.round(Object.values(tagStats).reduce((sum, tag) => sum + tag.total, 0) / allPosts.length * 10) / 10 
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
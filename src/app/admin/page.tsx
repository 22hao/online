import { createSupabaseServer } from '@/lib/supabase-server'
import { getAdminInfo } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import Link from 'next/link'

export default async function AdminDashboard() {
  // 检查管理员权限
  const adminInfo = await getAdminInfo()
  if (!adminInfo) {
    redirect('/admin/login')
  }

  const supabase = await createSupabaseServer()

  // 获取统计数据
  const [
    { count: totalPosts },
    { count: publishedPosts },
    { count: draftPosts }
  ] = await Promise.all([
    supabase.from('posts').select('*', { count: 'exact', head: true }),
    supabase.from('posts').select('*', { count: 'exact', head: true }).eq('published', true),
    supabase.from('posts').select('*', { count: 'exact', head: true }).eq('published', false)
  ])

  // 获取最近的文章
  const { data: recentPosts } = await supabase
    .from('posts')
    .select('id, title, slug, created_at, published')
    .order('created_at', { ascending: false })
    .limit(5)

  // 获取分类统计
  const { data: allPosts } = await supabase
    .from('posts')
    .select('category')
    .not('category', 'is', null)

  const categoryStats = allPosts?.reduce((acc, post) => {
    if (post.category) {
      acc[post.category] = (acc[post.category] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>) || {}

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
      title: '标签管理',
      description: '管理文章标签',
      href: '/admin/tags',
      icon: '🏷️',
      color: 'bg-orange-500'
    }
  ]

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* 欢迎信息 */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900">管理面板</h1>
          <p className="text-lg text-gray-600 mt-3">欢迎回来，{adminInfo.name}！管理你的 SRE 技术博客</p>
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
                <p className="text-3xl font-bold text-gray-900">{totalPosts || 0}</p>
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
                <p className="text-3xl font-bold text-gray-900">{publishedPosts || 0}</p>
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
                <p className="text-3xl font-bold text-gray-900">{draftPosts || 0}</p>
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
                <p className="text-3xl font-bold text-gray-900">{Object.keys(categoryStats).length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 快捷操作 */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">快捷操作</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center">
                  <div className={`p-4 ${action.color} rounded-lg text-white`}>
                    <span className="text-2xl">{action.icon}</span>
                  </div>
                  <div className="ml-5">
                    <h3 className="font-semibold text-lg text-gray-900">{action.title}</h3>
                    <p className="text-base text-gray-600">{action.description}</p>
                  </div>
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
              {recentPosts && recentPosts.length > 0 ? (
                recentPosts.map((post) => (
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
            <div className="space-y-3">
              {Object.keys(categoryStats).length > 0 ? (
                Object.entries(categoryStats)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                      <span className="font-semibold text-lg text-gray-900">{category}</span>
                      <span className="text-base text-gray-500 font-medium">{count} 篇文章</span>
                    </div>
                  ))
              ) : (
                <p className="text-gray-500 text-center py-6 text-base">暂无分类数据</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
} 
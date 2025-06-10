import { createSupabaseServer } from '@/lib/supabase-server'
import { getAdminInfo } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import CategoryManager from '@/components/admin/CategoryManager'

export default async function AdminCategories() {
  // 检查管理员权限
  const adminInfo = await getAdminInfo()
  if (!adminInfo) {
    redirect('/admin/login')
  }

  const supabase = await createSupabaseServer()

  // 获取所有分类
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  // 获取所有文章的分类信息来统计使用情况
  const { data: allPosts } = await supabase
    .from('posts')
    .select('category, published')

  // 统计分类使用数据
  const categoryStats = allPosts?.reduce((acc, post) => {
    if (post.category) {
      if (!acc[post.category]) {
        acc[post.category] = { total: 0, published: 0 }
      }
      acc[post.category].total += 1
      if (post.published) {
        acc[post.category].published += 1
      }
    }
    return acc
  }, {} as Record<string, { total: number; published: number }>) || {}

  // 合并分类信息和使用统计
  const allCategoryStats = categories?.reduce((acc, category) => {
    acc[category.name] = categoryStats[category.name] || { total: 0, published: 0 }
    return acc
  }, {} as Record<string, { total: number; published: number }>) || {}

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
                  {categories?.length || 0}
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
                  {Object.values(categoryStats).reduce((sum, cat) => sum + cat.total, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 分类管理器 */}
        <CategoryManager initialCategories={allCategoryStats} />
      </div>
    </AdminLayout>
  )
} 
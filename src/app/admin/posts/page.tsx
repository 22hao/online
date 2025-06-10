import { createSupabaseServer } from '@/lib/supabase-server'
import { getAdminInfo } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import PostsManager from '@/components/admin/PostsManager'
import Link from 'next/link'

export default async function AdminPosts() {
  // 检查管理员权限
  const adminInfo = await getAdminInfo()
  if (!adminInfo) {
    redirect('/admin/login')
  }

  const supabase = await createSupabaseServer()

  // 获取所有文章
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Posts query error:', error)
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
                <p className="text-lg font-semibold">{posts?.length || 0}</p>
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
                  {posts?.filter(p => p.published).length || 0}
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
                  {posts?.filter(p => !p.published).length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 文章管理器 */}
        <PostsManager posts={posts || []} />
      </div>
    </AdminLayout>
  )
} 
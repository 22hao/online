import { createSupabaseAdmin } from '@/lib/supabase-server'
import { getAdminInfo } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import EditPostForm from '@/components/EditPostForm'

interface EditPostPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  // 检查管理员权限
  const adminInfo = await getAdminInfo()
  if (!adminInfo) {
    redirect('/admin/login')
  }

  const { slug } = await params
  const supabase = createSupabaseAdmin()
  
  // 获取要编辑的文章
  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !post) {
    console.error('Post query error:', error)
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="w-full max-w-4xl mx-auto py-16 px-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ✏️ 编辑文章
            </h1>
            <p className="text-gray-600">修改你的技术见解和开发经验</p>
          </div>

          <EditPostForm initialData={post} />
        </div>
      </div>
    </div>
  )
} 
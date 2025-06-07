import { isAdminAuthenticated } from '@/lib/auth'
import { redirect } from 'next/navigation'
import CreatePostForm from '@/components/CreatePostForm'

export default async function CreatePost() {
  // 检查管理员是否已登录
  const isAuthenticated = await isAdminAuthenticated()
  if (!isAuthenticated) {
    redirect('/admin/login')
  }

  return (
    <div className="w-full max-w-5xl mx-auto py-16 px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">✍️ 创建文章</h1>
        <p className="text-gray-600">分享你的技术见解和开发经验</p>
      </div>

      <CreatePostForm />
    </div>
  )
}
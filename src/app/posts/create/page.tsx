import { isAdminAuthenticated } from '@/lib/auth'
import { redirect } from 'next/navigation'
import CreatePostForm from '@/components/CreatePostForm'

export default async function CreatePost() {
  // 检查管理员是否已登录
  const isAuthenticated = await isAdminAuthenticated()
  if (!isAuthenticated) {
    redirect('/admin/login')
  }

  return <CreatePostForm />
}
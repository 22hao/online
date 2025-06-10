import { getAdminInfo } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import SettingsForm from '@/components/admin/SettingsForm'

export default async function AdminSettings() {
  // 检查管理员权限
  const adminInfo = await getAdminInfo()
  if (!adminInfo) {
    redirect('/admin/login')
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">站点设置</h1>
          <p className="text-gray-600 mt-1">管理站点的基本信息和配置</p>
        </div>

        <SettingsForm />
      </div>
    </AdminLayout>
  )
} 
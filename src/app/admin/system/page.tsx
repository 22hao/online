import { getAdminInfo } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import SystemMonitor from '@/components/admin/SystemMonitor'

export default async function AdminSystem() {
  const adminInfo = await getAdminInfo()
  if (!adminInfo) {
    redirect('/admin/login')
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">系统监控</h1>
          <p className="text-gray-600 mt-1">系统运行状态、日志和性能监控</p>
        </div>
        
        <SystemMonitor />
      </div>
    </AdminLayout>
  )
} 
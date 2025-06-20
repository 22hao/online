'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import SystemMonitor from '@/components/admin/SystemMonitor'

export default function AdminSystem() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      try {
        // 检查管理员权限
        const authResponse = await fetch('/api/auth/admin-check')
        if (!authResponse.ok) {
          router.push('/admin/login')
          return
        }
      } catch (error) {
        console.error('权限检查失败:', error)
        router.push('/admin/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
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
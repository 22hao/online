'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()

  const navItems = [
    {
      href: '/admin',
      label: '管理面板',
      icon: '📊',
      exact: true
    },
    {
      href: '/admin/posts',
      label: '文章管理',
      icon: '📝'
    },
    {
      href: '/admin/categories',
      label: '分类管理',
      icon: '📂'
    },
    {
      href: '/admin/tags',
      label: '标签管理',
      icon: '🏷️'
    },
    {
      href: '/posts/create',
      label: '写文章',
      icon: '✍️'
    },
    {
      href: '/admin/settings',
      label: '站点设置',
      icon: '⚙️'
    },
    {
      href: '/admin/system',
      label: '系统监控',
      icon: '📊'
    }
  ]

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) {
      return pathname === item.href
    }
    return pathname.startsWith(item.href)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* 侧边栏 */}
        <div className="w-64 bg-white shadow-lg">
          <nav>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-4 px-6 py-4 text-base font-medium transition-colors ${
                  isActive(item)
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* 主内容区域 */}
        <div className="flex-1 overflow-hidden">
          <div className="p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
} 
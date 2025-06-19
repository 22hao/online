import { getAdminInfo } from '@/lib/auth'
import Link from 'next/link'

export default async function Navbar() {
  const adminInfo = await getAdminInfo()

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold">On Sre</span>
            </Link>
            <div className="ml-16 flex space-x-6 items-center">
              <Link href="/" className="text-gray-700 hover:text-gray-900 font-medium">
                首页
              </Link>
              <Link href="/ops" className="text-gray-700 hover:text-gray-900 font-medium">
                运维
              </Link>
              <Link href="/bigdata" className="text-gray-700 hover:text-gray-900 font-medium">
                大数据
              </Link>
              <Link href="/frontend" className="text-gray-700 hover:text-gray-900 font-medium">
                前端
              </Link>
              <Link href="/posts?category=安全" className="text-gray-700 hover:text-gray-900 font-medium">
                安全
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            {adminInfo ? (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/admin" 
                  className="text-gray-700 hover:text-gray-900 font-medium"
                >
                  管理员
                </Link>
                <form action="/api/auth/admin-logout" method="post">
                  <button type="submit" className="text-gray-700 hover:text-gray-900">
                    退出
                  </button>
                </form>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  )
}
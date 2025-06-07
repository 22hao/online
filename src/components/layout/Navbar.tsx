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
            <div className="ml-6 flex space-x-4 items-center">
              <Link href="/posts" className="text-gray-700 hover:text-gray-900">
                文章列表
              </Link>
              {adminInfo && (
                <Link href="/posts/create" className="text-gray-700 hover:text-gray-900">
                  写文章
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center">
            {adminInfo ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">管理员</span>
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
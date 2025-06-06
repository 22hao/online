import { createSupabaseServer } from '@/lib/supabase-server'
import Link from 'next/link'

export default async function Navbar() {
  const supabase = await createSupabaseServer()
  const { data: { session } } = await supabase.auth.getSession()

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold">我的博客</span>
            </Link>
            <div className="ml-6 flex space-x-4 items-center">
              <Link href="/posts" className="text-gray-700 hover:text-gray-900">
                文章列表
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            {session ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">{session.user.email}</span>
                <form action="/auth/signout" method="post">
                  <button type="submit" className="text-gray-700 hover:text-gray-900">
                    退出
                  </button>
                </form>
              </div>
            ) : (
              <Link href="/auth/signin" className="text-gray-700 hover:text-gray-900">
                登录
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
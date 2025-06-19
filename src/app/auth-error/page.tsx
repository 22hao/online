import Link from 'next/link'

export default function AuthError({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; error_description?: string }>
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="max-w-md mx-auto">
          {/* 认证错误图标 */}
          <div className="mx-auto h-32 w-32 bg-gradient-to-r from-red-500 to-orange-600 rounded-full flex items-center justify-center mb-8">
            <svg className="h-16 w-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          
          {/* 标题和描述 */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">认证失败</h1>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">登录过程中出现错误</h2>
          <p className="text-gray-600 mb-8">
            抱歉，在处理您的登录请求时遇到了问题。请重试或联系管理员。
          </p>
          
          {/* 操作按钮 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signin"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              重新登录
            </Link>
            
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              返回首页
            </Link>
          </div>
          
          {/* 帮助信息 */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">遇到问题？</h3>
            <ul className="text-xs text-blue-700 space-y-1 text-left">
              <li>• 确保您的网络连接正常</li>
              <li>• 清除浏览器缓存后重试</li>
              <li>• 检查是否启用了第三方 Cookie</li>
              <li>• 联系管理员获取帮助</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 
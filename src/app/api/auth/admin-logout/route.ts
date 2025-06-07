import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const requestUrl = new URL(request.url)
  
  try {
    // 创建响应并清除管理员登录 cookie
    const response = NextResponse.redirect(`${requestUrl.origin}/`, {
      status: 301,
    })

    // 清除管理员登录 cookie
    response.cookies.set('admin-session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // 立即过期
      path: '/'
    })

    console.log('管理员退出登录成功')
    return response
  } catch (error) {
    console.error('Admin logout error:', error)
    return NextResponse.redirect(`${requestUrl.origin}/`, {
      status: 301,
    })
  }
} 
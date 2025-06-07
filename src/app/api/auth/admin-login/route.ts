import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// 管理员账号配置（你可以修改这些）
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@onsre.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123456'

export async function POST(request: Request) {
  const requestUrl = new URL(request.url)
  const formData = await request.formData()
  const email = String(formData.get('email'))
  const password = String(formData.get('password'))
  
  try {
    // 验证是否为管理员账号
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return NextResponse.redirect(
        `${requestUrl.origin}/admin/login?error=${encodeURIComponent('管理员账号或密码错误')}`,
        {
          status: 301,
        }
      )
    }

    // 创建响应并设置管理员登录状态 cookie
    const response = NextResponse.redirect(`${requestUrl.origin}/posts/create`, {
      status: 301,
    })

    // 设置管理员登录 cookie（24小时有效）
    const cookieStore = await cookies()
    const adminToken = Buffer.from(`${ADMIN_EMAIL}:${Date.now()}`).toString('base64')
    
    response.cookies.set('admin-session', adminToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24小时
      path: '/'
    })

    console.log('管理员登录成功')
    return response
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.redirect(
      `${requestUrl.origin}/admin/login?error=${encodeURIComponent('系统错误，请稍后重试')}`,
      {
        status: 301,
      }
    )
  }
} 
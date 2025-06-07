import { cookies } from 'next/headers'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@onsre.com'

export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const adminSession = cookieStore.get('admin-session')
    
    if (!adminSession) {
      return false
    }

    // 解码并验证 token
    const decoded = Buffer.from(adminSession.value, 'base64').toString()
    const [email, timestamp] = decoded.split(':')
    
    // 检查是否为管理员邮箱
    if (email !== ADMIN_EMAIL) {
      return false
    }

    // 检查 token 是否过期（24小时）
    const now = Date.now()
    const tokenTime = parseInt(timestamp)
    const maxAge = 24 * 60 * 60 * 1000 // 24小时（毫秒）
    
    if (now - tokenTime > maxAge) {
      return false
    }

    return true
  } catch (error) {
    console.error('Admin auth check error:', error)
    return false
  }
}

export async function getAdminInfo() {
  const isAuthenticated = await isAdminAuthenticated()
  if (!isAuthenticated) {
    return null
  }

  return {
    email: ADMIN_EMAIL,
    name: '管理员',
    role: 'admin'
  }
} 
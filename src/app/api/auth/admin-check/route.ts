import { getAdminInfo } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const adminInfo = await getAdminInfo()
    
    if (!adminInfo) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    return NextResponse.json({ 
      success: true, 
      admin: adminInfo 
    })
  } catch (error) {
    console.error('管理员权限检查失败:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
} 
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 简单的内存存储请求频率限制（生产环境建议使用Redis）
const requestCounts = new Map<string, { count: number; resetTime: number }>()

function rateLimit(ip: string, limit: number = 100, windowMs: number = 15 * 60 * 1000) {
  const now = Date.now()
  const key = `rate_limit_${ip}`
  
  const record = requestCounts.get(key)
  
  if (!record || now > record.resetTime) {
    requestCounts.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (record.count >= limit) {
    return false
  }
  
  record.count++
  return true
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // 获取客户端IP
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
  
  // 对管理员API进行更严格的频率限制
  if (request.nextUrl.pathname.startsWith('/api/admin') || 
      request.nextUrl.pathname.startsWith('/admin/login')) {
    if (!rateLimit(ip, 20)) { // 管理员API每15分钟限制20次请求
      return new NextResponse('Rate limit exceeded', { status: 429 })
    }
  }
  
  // 对其他API进行一般频率限制
  if (request.nextUrl.pathname.startsWith('/api/')) {
    if (!rateLimit(ip, 100)) { // 一般API每15分钟限制100次请求
      return new NextResponse('Rate limit exceeded', { status: 429 })
    }
  }
  
  // 添加安全头
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // CSP 安全策略
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
  )
  
  return response
}

export const config = {
  matcher: [
    '/api/:path*',
    '/admin/:path*'
  ]
} 
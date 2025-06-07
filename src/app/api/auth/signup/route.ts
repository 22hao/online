import { createSupabaseServer } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const requestUrl = new URL(request.url)
  const formData = await request.formData()
  const email = String(formData.get('email'))
  const password = String(formData.get('password'))
  
  try {
    const supabase = await createSupabaseServer()

    // 开发环境下可以跳过邮件验证
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${requestUrl.origin}/auth/callback`,
        // 开发环境下跳过邮件验证
        ...(isDevelopment && { data: { skip_confirmation: true } })
      },
    })

    if (error) {
      console.error('Signup error:', error)
      
      // 提供更友好的错误信息
      let errorMessage = error.message
      
      if (error.message.includes('confirmation') || error.message.includes('email')) {
        errorMessage = 'Error sending confirmation email'
      } else if (error.message.includes('already registered')) {
        errorMessage = '该邮箱已注册，请直接登录'
      } else if (error.message.includes('password')) {
        errorMessage = '密码格式不正确，请使用至少6位字符'
      }
      
      return NextResponse.redirect(
        `${requestUrl.origin}/auth/signup?error=${encodeURIComponent(errorMessage)}`,
        {
          status: 301,
        }
      )
    }

    // 如果是开发环境且用户直接创建成功，直接跳转到首页
    if (isDevelopment && data.user && !data.user.email_confirmed_at) {
      return NextResponse.redirect(`${requestUrl.origin}/`, {
        status: 301,
      })
    }

    return NextResponse.redirect(
      `${requestUrl.origin}/auth/signin?message=${encodeURIComponent('注册成功！请检查邮箱完成验证')}`,
      {
        status: 301,
      }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.redirect(
      `${requestUrl.origin}/auth/signup?error=${encodeURIComponent('注册失败，请稍后重试')}`,
      {
        status: 301,
      }
    )
  }
}
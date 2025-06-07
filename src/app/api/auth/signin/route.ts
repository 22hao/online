import { createSupabaseServer } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const requestUrl = new URL(request.url)
  const formData = await request.formData()
  const email = String(formData.get('email'))
  const password = String(formData.get('password'))
  
  try {
    const supabase = await createSupabaseServer()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.redirect(
        `${requestUrl.origin}/auth/signin?error=${encodeURIComponent(error.message)}`,
        {
          status: 301,
        }
      )
    }

    return NextResponse.redirect(`${requestUrl.origin}/`, {
      status: 301,
    })
  } catch (error) {
    console.error('Signin error:', error)
    return NextResponse.redirect(
      `${requestUrl.origin}/auth/signin?error=${encodeURIComponent('登录失败，请稍后重试')}`,
      {
        status: 301,
      }
    )
  }
} 
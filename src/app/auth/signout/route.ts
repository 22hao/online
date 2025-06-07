import { createSupabaseServer } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const requestUrl = new URL(request.url)
  
  try {
    const supabase = await createSupabaseServer()
    await supabase.auth.signOut()
    
    return NextResponse.redirect(`${requestUrl.origin}/`, {
      status: 301,
    })
  } catch (error) {
    console.error('Signout error:', error)
    return NextResponse.redirect(`${requestUrl.origin}/`, {
      status: 301,
    })
  }
} 
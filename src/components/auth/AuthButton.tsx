'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

export default function AuthButton() {
  const router = useRouter()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={handleSignIn}
        className="px-4 py-2 text-white bg-black rounded-md hover:bg-gray-800"
      >
        登录
      </button>
      <button
        onClick={handleSignOut}
        className="px-4 py-2 text-gray-900 border border-gray-300 rounded-md hover:bg-gray-100"
      >
        退出
      </button>
    </div>
  )
}
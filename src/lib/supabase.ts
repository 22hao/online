import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// 客户端组件使用
export const createSupabaseBrowser = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// 兼容旧的导出（向后兼容）
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      posts: {
        Row: {
          id: string
          title: string
          content: string
          author_id: string
          created_at: string
          updated_at: string
          published: boolean
          slug: string
          excerpt?: string
          tags?: string[]
          category?: string
        }
        Insert: {
          title: string
          content: string
          author_id: string
          published?: boolean
          slug: string
          excerpt?: string
          tags?: string[]
          category?: string
        }
        Update: {
          title?: string
          content?: string
          published?: boolean
          slug?: string
          excerpt?: string
          tags?: string[]
          category?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          name?: string
          avatar_url?: string
          bio?: string
          created_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string
          avatar_url?: string
          bio?: string
        }
        Update: {
          name?: string
          avatar_url?: string
          bio?: string
        }
      }
    }
  }
}

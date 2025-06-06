export type Profile = {
  id: string
  username: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export type Post = {
  id: string
  title: string
  content: string
  author_id: string
  published: boolean
  created_at: string
  updated_at: string
  author?: Profile
  tags?: Tag[]
}

export type Tag = {
  id: string
  name: string
  description: string | null
  created_at: string
}

export type PostTag = {
  post_id: string
  tag_id: string
}
import { createSupabaseServer } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

function slugify(str: string) {
  return str
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')            // 空格转-
    .replace(/[^\w\u4e00-\u9fa5-]+/g, '') // 移除特殊字符，保留中文
    .replace(/--+/g, '-')            // 多个-合并
    .replace(/^-+|-+$/g, '');        // 去除首尾-
}

// 顶层导出 Server Action
export async function handleCreate(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServer()
  const category_id = Number(formData.get('category_id'))
  const label = formData.get('label')?.toString().trim()
  if (!category_id || !label) {
    throw new Error('所有字段均为必填')
  }
  const key = slugify(label)
  await supabase.from('subcategories').insert([{ category_id, key, label }])
  redirect('/admin/subcategories')
}

export default async function CreateSubcategory() {
  const supabase = await createSupabaseServer()
  const { data: categoriesRaw } = await supabase.from('categories').select('*')
  const categories = categoriesRaw || []

  return (
    <form action={handleCreate} className="max-w-md mx-auto p-8 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">新增二级分类</h2>
      <select name="category_id" required className="mb-4 w-full border p-2 rounded">
        <option value="">选择一级分类</option>
        {categories.map(cat => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>
      <input name="label" required placeholder="二级分类名称（如 日志系统）" className="mb-4 w-full border p-2 rounded" />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">保存</button>
    </form>
  )
} 
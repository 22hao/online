import { createSupabaseServer } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

function slugify(str: string) {
  return str
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u4e00-\u9fa5-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// 顶层 Server Action
async function handleEdit(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServer()
  const id = formData.get('id')
  const category_id = Number(formData.get('category_id'))
  const label = formData.get('label')?.toString().trim()
  if (!id || !category_id || !label) {
    throw new Error('所有字段均为必填')
  }
  const key = slugify(label)
  await supabase.from('subcategories').update({ category_id, key, label }).eq('id', id)
  redirect('/admin/subcategories')
}

export default async function EditSubcategory({ params }: { params: { id: string } }) {
  const supabase = await createSupabaseServer()
  const { data: subcategory } = await supabase.from('subcategories').select('*').eq('id', params.id).single()
  const { data: categoriesRaw } = await supabase.from('categories').select('*')
  const categories = categoriesRaw || []

  return (
    <form action={handleEdit} className="max-w-md mx-auto p-8 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">编辑二级分类</h2>
      <input type="hidden" name="id" value={subcategory.id} />
      <select name="category_id" defaultValue={subcategory.category_id} required className="mb-4 w-full border p-2 rounded">
        <option value="">选择一级分类</option>
        {categories.map(cat => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>
      <input name="label" defaultValue={subcategory.label} required placeholder="二级分类名称（如 日志系统）" className="mb-4 w-full border p-2 rounded" />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">保存</button>
    </form>
  )
} 
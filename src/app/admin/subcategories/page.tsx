import { createSupabaseServer } from '@/lib/supabase-server'
import { getAdminInfo } from '@/lib/auth'
import AdminLayout from '@/components/admin/AdminLayout'
import Link from 'next/link'
import { redirect } from 'next/navigation'

async function handleDelete(formData: FormData) {
  'use server'
  const id = formData.get('id')
  const supabase = await createSupabaseServer()
  await supabase.from('subcategories').delete().eq('id', id)
  redirect('/admin/subcategories')
}

export default async function AdminSubcategories() {
  const adminInfo = await getAdminInfo()
  if (!adminInfo) redirect('/admin/login')
  const supabase = await createSupabaseServer()
  const { data: categoriesRaw } = await supabase.from('categories').select('*')
  const categories = categoriesRaw || []
  const { data: subcategories } = await supabase.from('subcategories').select('*')

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">二级分类管理</h1>
          <p className="text-gray-600 mt-1">管理所有一级分类下的二级分类</p>
        </div>
        <div className="mb-4">
          <Link href="/admin/subcategories/create" className="bg-blue-600 text-white px-4 py-2 rounded">新增二级分类</Link>
        </div>
        <table className="min-w-full bg-white rounded-lg overflow-hidden">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">所属一级分类</th>
              <th className="px-4 py-2 text-left">Key</th>
              <th className="px-4 py-2 text-left">名称</th>
              <th className="px-4 py-2 text-left">操作</th>
            </tr>
          </thead>
          <tbody>
            {subcategories?.map(sub => (
              <tr key={sub.id} className="border-t">
                <td className="px-4 py-2 text-left">{categories.find(c => c.id === sub.category_id)?.name}</td>
                <td className="px-4 py-2 text-left">{sub.key}</td>
                <td className="px-4 py-2 text-left">{sub.label}</td>
                <td className="px-4 py-2 text-left flex gap-2">
                  <Link href={`/admin/subcategories/edit/${sub.id}`} className="text-blue-600 mr-2">编辑</Link>
                  <form action={handleDelete} method="post">
                    <input type="hidden" name="id" value={sub.id} />
                    <button type="submit" className="text-red-600">删除</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
} 
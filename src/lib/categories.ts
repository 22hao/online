import { createSupabaseServer } from './supabase-server'

export async function getSubcategoriesByCategory(categoryName: string) {
  try {
    const supabase = await createSupabaseServer()
    
    // 查一级分类 id
    const { data: categories, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('name', categoryName)
    
    if (categoryError) {
      console.error('Error fetching category:', categoryError)
      return []
    }
    
    if (!categories?.length) {
      return []
    }
    
    const category_id = categories[0].id
    
    // 查二级分类
    const { data: subcategories, error: subcategoryError } = await supabase
      .from('subcategories')
      .select('*')
      .eq('category_id', category_id)
    
    if (subcategoryError) {
      console.error('Error fetching subcategories:', subcategoryError)
      return []
    }
    
    return subcategories || []
  } catch (error) {
    console.error('Error in getSubcategoriesByCategory:', error)
    return []
  }
}

export async function getAllCategories() {
  try {
    const supabase = await createSupabaseServer()
    
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')
    
    if (error) {
      console.error('Error fetching categories:', error)
      return []
    }
    
    return categories || []
  } catch (error) {
    console.error('Error in getAllCategories:', error)
    return []
  }
} 
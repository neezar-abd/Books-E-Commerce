import { supabase } from './supabase';

export interface Category {
    id: string;
    name: string;
    slug: string;
    level: number;
    parent_id: string | null;
    category_id: string | null;
    image_1: string | null;
    image_2: string | null;
    image_3: string | null;
    image_4: string | null;
    created_at: string;
}

/**
 * Get all main categories (level 0)
 */
export async function getMainCategories(): Promise<Category[]> {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('level', 0)
        .order('name');

    if (error) {
        console.error('Error fetching main categories:', error);
        throw error;
    }

    return data || [];
}

/**
 * Get subcategories for a specific parent category
 */
export async function getSubcategories(parentId: string): Promise<Category[]> {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('parent_id', parentId)
        .order('name');

    if (error) {
        console.error('Error fetching subcategories:', error);
        throw error;
    }

    return data || [];
}

/**
 * Get category by slug
 */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error) {
        console.error('Error fetching category by slug:', error);
        return null;
    }

    return data;
}

/**
 * Get category by ID
 */
export async function getCategoryById(id: string): Promise<Category | null> {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching category by ID:', error);
        return null;
    }

    return data;
}

/**
 * Get full category tree for a specific category (all parents)
 */
export async function getCategoryBreadcrumb(categoryId: string): Promise<Category[]> {
    const breadcrumb: Category[] = [];
    let currentCategory = await getCategoryById(categoryId);

    while (currentCategory) {
        breadcrumb.unshift(currentCategory);
        if (currentCategory.parent_id) {
            currentCategory = await getCategoryById(currentCategory.parent_id);
        } else {
            break;
        }
    }

    return breadcrumb;
}

/**
 * Get all descendant category IDs (for filtering products)
 */
export async function getCategoryDescendantIds(categoryId: string): Promise<string[]> {
    const ids: string[] = [categoryId];

    // Get direct children
    const children = await getSubcategories(categoryId);

    // Recursively get children of children
    for (const child of children) {
        const childIds = await getCategoryDescendantIds(child.id);
        ids.push(...childIds);
    }

    return ids;
}

/**
 * Get complete category tree (all levels)
 */
export async function getCategoryTree(): Promise<Category[]> {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('level')
        .order('name');

    if (error) {
        console.error('Error fetching category tree:', error);
        throw error;
    }

    return data || [];
}

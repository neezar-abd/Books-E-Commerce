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
 * Get all main categories (distinct main_category values)
 */
export async function getMainCategories(): Promise<Category[]> {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('id, category_data_id, main_category, slug, image1, created_at')
            .eq('is_active', true)
            .order('main_category');

        if (error) {
            console.warn('Categories table might not exist or is empty:', error.message);
            return [];
        }

        if (!data || data.length === 0) {
            return [];
        }

        // Get unique main categories
        const mainCategoriesMap = new Map();
        data.forEach((item: any) => {
            if (!mainCategoriesMap.has(item.main_category)) {
                mainCategoriesMap.set(item.main_category, {
                    id: item.id,
                    name: item.main_category,
                    slug: item.slug,
                    level: 0,
                    parent_id: null,
                    category_id: item.category_data_id?.toString() || null,
                    image_1: item.image1,
                    image_2: null,
                    image_3: null,
                    image_4: null,
                    created_at: item.created_at
                });
            }
        });

        return Array.from(mainCategoriesMap.values());
    } catch (err) {
        console.warn('Failed to fetch main categories:', err);
        return [];
    }
}

/**
 * Get subcategories for a specific main category
 * This returns sub1 values for a given main_category
 */
export async function getSubcategories(mainCategory: string): Promise<Category[]> {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('id, category_data_id, main_category, sub1, slug, image1, created_at')
            .eq('main_category', mainCategory)
            .eq('is_active', true)
            .not('sub1', 'is', null)
            .order('sub1');

        if (error) {
            console.warn('Failed to fetch subcategories:', error.message);
            return [];
        }

        if (!data || data.length === 0) {
            return [];
        }

        // Get unique sub1 values
        const subcategoriesMap = new Map();
        data.forEach((item: any) => {
            if (item.sub1 && !subcategoriesMap.has(item.sub1)) {
                subcategoriesMap.set(item.sub1, {
                    id: item.id,
                    name: item.sub1,
                    slug: item.slug,
                    level: 1,
                    parent_id: mainCategory,
                    category_id: item.category_data_id?.toString() || null,
                    image_1: item.image1,
                    image_2: null,
                    image_3: null,
                    image_4: null,
                    created_at: item.created_at
                });
            }
        });

        return Array.from(subcategoriesMap.values());
    } catch (err) {
        console.warn('Error in getSubcategories:', err);
        return [];
    }
}

/**
 * Get level 2 subcategories (sub2) for a given main_category and sub1
 */
export async function getSubcategories2(mainCategory: string, sub1: string): Promise<Category[]> {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('id, category_data_id, main_category, sub1, sub2, slug, image1, created_at')
            .eq('main_category', mainCategory)
            .eq('sub1', sub1)
            .eq('is_active', true)
            .not('sub2', 'is', null)
            .order('sub2');

        if (error) {
            console.warn('Failed to fetch sub2 categories:', error.message);
            return [];
        }

        if (!data || data.length === 0) {
            return [];
        }

        // Get unique sub2 values
        const subcategoriesMap = new Map();
        data.forEach((item: any) => {
            if (item.sub2 && !subcategoriesMap.has(item.sub2)) {
                subcategoriesMap.set(item.sub2, {
                    id: item.id,
                    name: item.sub2,
                    slug: item.slug,
                    level: 2,
                    parent_id: sub1,
                    category_id: item.category_data_id?.toString() || null,
                    image_1: item.image1,
                    image_2: null,
                    image_3: null,
                    image_4: null,
                    created_at: item.created_at
                });
            }
        });

        return Array.from(subcategoriesMap.values());
    } catch (err) {
        console.warn('Error in getSubcategories2:', err);
        return [];
    }
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
 * Get category by category_data_id
 */
export async function getCategoryByDataId(categoryDataId: number): Promise<any | null> {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('category_data_id', categoryDataId)
            .eq('is_active', true)
            .single();

        if (error) {
            console.warn('Error fetching category by data ID:', error.message);
            return null;
        }

        return data;
    } catch (err) {
        console.warn('Error in getCategoryByDataId:', err);
        return null;
    }
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
 * Get complete category tree (all levels)
 */
export async function getCategoryTree(): Promise<Category[]> {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('main_category')
        .order('sub1')
        .order('sub2');

    if (error) {
        console.error('Error fetching category tree:', error);
        throw error;
    }

    return data || [];
}

import { supabase } from './supabase';

// ============================================
// Types
// ============================================

export interface ProductVariant {
    id: string;
    product_id: string;
    variant_type: string; // 'color', 'size', 'material', etc
    variant_value: string; // 'Red', 'XL', 'Cotton', etc
    display_order: number;
    price_adjustment: number;
    stock: number;
    sku: string | null;
    image_url: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface VariantCombination {
    id: string;
    product_id: string;
    combination: Array<{ type: string; value: string }>;
    price: number;
    stock: number;
    sku: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateVariantInput {
    product_id: string;
    variant_type: string;
    variant_value: string;
    display_order?: number;
    price_adjustment?: number;
    stock?: number;
    sku?: string;
    image_url?: string;
}

export interface CreateCombinationInput {
    product_id: string;
    combination: Array<{ type: string; value: string }>;
    price: number;
    stock: number;
    sku?: string;
}

// ============================================
// Product Variants Functions
// ============================================

/**
 * Get all variants for a product
 */
export async function getProductVariants(productId: string): Promise<ProductVariant[]> {
    const { data, error } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productId)
        .eq('is_active', true)
        .order('variant_type', { ascending: true })
        .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
}

/**
 * Get variants grouped by type
 */
export async function getProductVariantsByType(productId: string): Promise<Record<string, ProductVariant[]>> {
    const variants = await getProductVariants(productId);

    return variants.reduce((acc, variant) => {
        if (!acc[variant.variant_type]) {
            acc[variant.variant_type] = [];
        }
        acc[variant.variant_type].push(variant);
        return acc;
    }, {} as Record<string, ProductVariant[]>);
}

/**
 * Create a new variant
 */
export async function createVariant(input: CreateVariantInput): Promise<ProductVariant> {
    const { data, error } = await supabase
        .from('product_variants')
        .insert({
            ...input,
            display_order: input.display_order ?? 0,
            price_adjustment: input.price_adjustment ?? 0,
            stock: input.stock ?? 0,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Create multiple variants at once
 */
export async function createVariants(inputs: CreateVariantInput[]): Promise<ProductVariant[]> {
    const { data, error } = await supabase
        .from('product_variants')
        .insert(inputs.map(input => ({
            ...input,
            display_order: input.display_order ?? 0,
            price_adjustment: input.price_adjustment ?? 0,
            stock: input.stock ?? 0,
        })))
        .select();

    if (error) throw error;
    return data;
}

/**
 * Update a variant
 */
export async function updateVariant(
    id: string,
    updates: Partial<Omit<ProductVariant, 'id' | 'product_id' | 'created_at'>>
): Promise<ProductVariant> {
    const { data, error } = await supabase
        .from('product_variants')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Delete a variant
 */
export async function deleteVariant(id: string): Promise<void> {
    const { error } = await supabase
        .from('product_variants')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

/**
 * Delete all variants of a specific type for a product
 */
export async function deleteVariantType(productId: string, variantType: string): Promise<void> {
    const { error } = await supabase
        .from('product_variants')
        .delete()
        .eq('product_id', productId)
        .eq('variant_type', variantType);

    if (error) throw error;
}

// ============================================
// Variant Combinations Functions
// ============================================

/**
 * Get all combinations for a product
 */
export async function getProductCombinations(productId: string): Promise<VariantCombination[]> {
    const { data, error } = await supabase
        .from('product_variant_combinations')
        .select('*')
        .eq('product_id', productId)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
}

/**
 * Create a new combination
 */
export async function createCombination(input: CreateCombinationInput): Promise<VariantCombination> {
    const { data, error } = await supabase
        .from('product_variant_combinations')
        .insert(input)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Create multiple combinations at once
 */
export async function createCombinations(inputs: CreateCombinationInput[]): Promise<VariantCombination[]> {
    const { data, error } = await supabase
        .from('product_variant_combinations')
        .insert(inputs)
        .select();

    if (error) throw error;
    return data;
}

/**
 * Update a combination
 */
export async function updateCombination(
    id: string,
    updates: Partial<Omit<VariantCombination, 'id' | 'product_id' | 'created_at'>>
): Promise<VariantCombination> {
    const { data, error } = await supabase
        .from('product_variant_combinations')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Delete a combination
 */
export async function deleteCombination(id: string): Promise<void> {
    const { error } = await supabase
        .from('product_variant_combinations')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

/**
 * Delete all combinations for a product
 */
export async function deleteAllCombinations(productId: string): Promise<void> {
    const { error } = await supabase
        .from('product_variant_combinations')
        .delete()
        .eq('product_id', productId);

    if (error) throw error;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Generate all possible combinations from variant types
 * Example: {color: ['Red', 'Blue'], size: ['S', 'M']} => 
 * [
 *   [{type: 'color', value: 'Red'}, {type: 'size', value: 'S'}],
 *   [{type: 'color', value: 'Red'}, {type: 'size', value: 'M'}],
 *   ...
 * ]
 */
export function generateCombinations(
    variantsByType: Record<string, ProductVariant[]>
): Array<{ type: string; value: string }[]> {
    const types = Object.keys(variantsByType);

    if (types.length === 0) return [];
    if (types.length === 1) {
        const type = types[0];
        return variantsByType[type].map(v => [{ type, value: v.variant_value }]);
    }

    // Recursive combination generation
    function combine(
        typeIndex: number,
        current: Array<{ type: string; value: string }>
    ): Array<{ type: string; value: string }[]> {
        if (typeIndex === types.length) {
            return [current];
        }

        const type = types[typeIndex];
        const values = variantsByType[type];
        const results: Array<{ type: string; value: string }[]> = [];

        for (const variant of values) {
            const newCurrent = [...current, { type, value: variant.variant_value }];
            results.push(...combine(typeIndex + 1, newCurrent));
        }

        return results;
    }

    return combine(0, []);
}

/**
 * Get total stock across all combinations for a product
 */
export async function getTotalCombinationStock(productId: string): Promise<number> {
    const combinations = await getProductCombinations(productId);
    return combinations.reduce((total, combo) => total + combo.stock, 0);
}

/**
 * Check if a product has variants
 */
export async function hasVariants(productId: string): Promise<boolean> {
    const variants = await getProductVariants(productId);
    return variants.length > 0;
}

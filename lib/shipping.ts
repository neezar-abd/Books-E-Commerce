import { supabase } from './supabase';

// ============================================
// Types
// ============================================

export interface ShippingOption {
    id: string;
    product_id: string;
    courier_name: string; // 'JNE', 'J&T', 'SiCepat', etc
    service_type: string | null; // 'Regular', 'Express', 'Next Day'
    base_price: number;
    per_kg_price: number | null;
    min_weight: number | null; // in grams
    max_weight: number | null; // in grams
    estimated_days: string | null; // '1-2 hari', '3-5 hari'
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateShippingInput {
    product_id: string;
    courier_name: string;
    service_type?: string;
    base_price: number;
    per_kg_price?: number;
    min_weight?: number;
    max_weight?: number;
    estimated_days?: string;
}

export interface ShippingCalculation {
    courier: string;
    service: string;
    price: number;
    estimated_days: string;
}

// Common Indonesian couriers
export const COURIERS = {
    JNE: 'JNE',
    JNT: 'J&T Express',
    SICEPAT: 'SiCepat',
    ANTERAJA: 'AnterAja',
    GRAB: 'Grab Express',
    GOSEND: 'GoSend',
    TIKI: 'TIKI',
    POS: 'POS Indonesia',
    NINJA: 'Ninja Xpress',
    SPX: 'SPX Express',
    LION: 'Lion Parcel',
    IDL: 'ID Express',
    SAP: 'SAP Express',
} as const;

export const SERVICE_TYPES = {
    REGULAR: 'Regular',
    EXPRESS: 'Express',
    NEXT_DAY: 'Next Day',
    SAME_DAY: 'Same Day',
    INSTANT: 'Instant',
    CARGO: 'Cargo',
} as const;

// ============================================
// Shipping Options Functions
// ============================================

/**
 * Get all shipping options for a product
 */
export async function getProductShipping(productId: string): Promise<ShippingOption[]> {
    const { data, error } = await supabase
        .from('shipping_options')
        .select('*')
        .eq('product_id', productId)
        .eq('is_active', true)
        .order('courier_name', { ascending: true })
        .order('service_type', { ascending: true });

    if (error) throw error;
    return data || [];
}

/**
 * Create a new shipping option
 */
export async function createShipping(input: CreateShippingInput): Promise<ShippingOption> {
    const { data, error } = await supabase
        .from('shipping_options')
        .insert(input)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Create multiple shipping options at once
 */
export async function createMultipleShipping(inputs: CreateShippingInput[]): Promise<ShippingOption[]> {
    const { data, error } = await supabase
        .from('shipping_options')
        .insert(inputs)
        .select();

    if (error) throw error;
    return data;
}

/**
 * Update a shipping option
 */
export async function updateShipping(
    id: string,
    updates: Partial<Omit<ShippingOption, 'id' | 'product_id' | 'created_at'>>
): Promise<ShippingOption> {
    const { data, error } = await supabase
        .from('shipping_options')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Delete a shipping option
 */
export async function deleteShipping(id: string): Promise<void> {
    const { error } = await supabase
        .from('shipping_options')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

/**
 * Delete all shipping options for a product
 */
export async function deleteAllShipping(productId: string): Promise<void> {
    const { error } = await supabase
        .from('shipping_options')
        .delete()
        .eq('product_id', productId);

    if (error) throw error;
}

// ============================================
// Shipping Calculation Functions
// ============================================

/**
 * Calculate shipping cost for a product based on weight
 */
export async function calculateShipping(
    productId: string,
    weightGrams: number,
    destination?: string // For future API integration
): Promise<ShippingCalculation[]> {
    const options = await getProductShipping(productId);

    return options
        .filter(option => {
            // Filter by weight constraints if specified
            if (option.min_weight && weightGrams < option.min_weight) return false;
            if (option.max_weight && weightGrams > option.max_weight) return false;
            return true;
        })
        .map(option => {
            // Calculate price
            let price = option.base_price;

            if (option.per_kg_price) {
                const kg = weightGrams / 1000;
                price += option.per_kg_price * kg;
            }

            return {
                courier: option.courier_name,
                service: option.service_type || 'Regular',
                price: Math.round(price),
                estimated_days: option.estimated_days || '3-5 hari',
            };
        })
        .sort((a, b) => a.price - b.price); // Sort by price ascending
}

/**
 * Get cheapest shipping option
 */
export async function getCheapestShipping(
    productId: string,
    weightGrams: number
): Promise<ShippingCalculation | null> {
    const calculations = await calculateShipping(productId, weightGrams);
    return calculations.length > 0 ? calculations[0] : null;
}

/**
 * Get fastest shipping option (based on estimated days)
 */
export async function getFastestShipping(
    productId: string,
    weightGrams: number
): Promise<ShippingCalculation | null> {
    const calculations = await calculateShipping(productId, weightGrams);

    if (calculations.length === 0) return null;

    // Sort by estimated days (extract number from string like "1-2 hari")
    const sorted = calculations.sort((a, b) => {
        const daysA = parseInt(a.estimated_days.split('-')[0]);
        const daysB = parseInt(b.estimated_days.split('-')[0]);
        return daysA - daysB;
    });

    return sorted[0];
}

// ============================================
// Preset Shipping Templates
// ============================================

/**
 * Create standard shipping options for a product
 * Useful for quick setup with common Indonesian couriers
 */
export async function createStandardShipping(
    productId: string,
    baseWeight: number = 1000 // default 1kg
): Promise<ShippingOption[]> {
    const basePrice = baseWeight <= 1000 ? 15000 : 20000; // Base price in IDR

    const standardOptions: CreateShippingInput[] = [
        {
            product_id: productId,
            courier_name: COURIERS.JNE,
            service_type: SERVICE_TYPES.REGULAR,
            base_price: basePrice,
            per_kg_price: 5000,
            estimated_days: '3-5 hari',
        },
        {
            product_id: productId,
            courier_name: COURIERS.JNT,
            service_type: SERVICE_TYPES.EXPRESS,
            base_price: basePrice + 5000,
            per_kg_price: 7000,
            estimated_days: '2-3 hari',
        },
        {
            product_id: productId,
            courier_name: COURIERS.SICEPAT,
            service_type: SERVICE_TYPES.REGULAR,
            base_price: basePrice - 2000,
            per_kg_price: 4500,
            estimated_days: '3-4 hari',
        },
        {
            product_id: productId,
            courier_name: COURIERS.GRAB,
            service_type: SERVICE_TYPES.SAME_DAY,
            base_price: basePrice + 15000,
            max_weight: 5000, // Max 5kg for same day
            estimated_days: '0-1 hari',
        },
    ];

    return createMultipleShipping(standardOptions);
}

/**
 * Check if product has shipping configured
 */
export async function hasShipping(productId: string): Promise<boolean> {
    const options = await getProductShipping(productId);
    return options.length > 0;
}

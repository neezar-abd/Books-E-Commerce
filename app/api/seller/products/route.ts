import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key to bypass RLS for server-side operations
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            title,
            category_id,
            description,
            price,
            stock,
            images,
            image,
            video_url,
            brand,
            condition,
            weight_grams,
            length_cm,
            width_cm,
            height_cm,
            min_purchase,
            max_purchase,
            origin_country,
            warranty_type,
            warranty_period,
            sku,
            gtin,
            user_id, // We'll pass this from client
        } = body;

        // Validate required fields
        if (!title || !category_id || !description || !user_id) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Get user's store using admin client
        const { data: store, error: storeError } = await supabaseAdmin
            .from('stores')
            .select('id')
            .eq('owner_id', user_id)
            .single();

        if (storeError || !store) {
            console.error('Store error:', storeError);
            return NextResponse.json(
                { error: 'Store not found. Please create a store first.', details: storeError?.message },
                { status: 404 }
            );
        }

        // Validate and truncate fields to prevent varchar overflow
        // NOTE: For production, upload images to storage (Supabase Storage/Cloudinary) first
        // then save the URL here. Base64 images are too long for varchar columns.

        // Use placeholder for images temporarily
        const imageUrl = image && image.startsWith('data:')
            ? 'https://via.placeholder.com/400x400?text=Product+Image' // Placeholder for base64
            : image?.substring(0, 500) || null;

        const imageUrls = images && images.length > 0
            ? images.map((img: string) =>
                img.startsWith('data:')
                    ? 'https://via.placeholder.com/400x400?text=Product+Image'
                    : img.substring(0, 500)
            )
            : [imageUrl];

        const cleanedData = {
            title: title.substring(0, 255),
            category_id,
            description,
            price,
            stock,
            original_price: price,
            images: imageUrls,
            image: imageUrl,
            video_url: video_url ? video_url.substring(0, 500) : null,
            brand: brand ? brand.substring(0, 100) : null,
            condition: condition || 'new',
            weight_grams,
            length_cm,
            width_cm,
            height_cm,
            min_purchase: min_purchase || 1,
            max_purchase,
            origin_country: origin_country ? origin_country.substring(0, 100) : null,
            warranty_type: warranty_type ? warranty_type.substring(0, 100) : null,
            warranty_period: warranty_period ? warranty_period.substring(0, 50) : null,
            sku: sku ? sku.substring(0, 100) : null,
            gtin: gtin ? gtin.substring(0, 50) : null,
            store_id: store.id,
            is_active: true,
            total_sold: 0,
        };

        // Insert product using admin client (bypasses RLS)
        const { data: product, error: insertError } = await supabaseAdmin
            .from('products')
            .insert(cleanedData)
            .select()
            .single();

        if (insertError) {
            console.error('Error inserting product:', insertError);
            console.error('Insert error details:', JSON.stringify(insertError, null, 2));
            return NextResponse.json(
                {
                    error: 'Failed to create product',
                    details: insertError.message,
                    code: insertError.code,
                    hint: insertError.hint
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            product
        });

    } catch (error: any) {
        console.error('Error in POST /api/seller/products:', error);
        console.error('Full error:', JSON.stringify(error, null, 2));
        return NextResponse.json(
            {
                error: 'Internal server error',
                details: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}

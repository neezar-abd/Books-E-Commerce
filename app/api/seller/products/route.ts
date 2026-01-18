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

// Helper function to upload base64 image to Supabase Storage
async function uploadBase64Image(base64Image: string, folder: string = 'products'): Promise<string> {
    try {
        const matches = base64Image.match(/^data:image\/([a-zA-Z]*);base64,(.*)$/);
        if (!matches || matches.length !== 3) {
            throw new Error('Invalid base64 image format');
        }

        const fileType = matches[1];
        const base64Data = matches[2];

        // Convert base64 to buffer
        const buffer = Buffer.from(base64Data, 'base64');

        // Generate unique filename
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileType}`;
        const filePath = `${folder}/${fileName}`;

        // Upload to Supabase Storage
        const { data, error } = await supabaseAdmin.storage
            .from('product-images')
            .upload(filePath, buffer, {
                contentType: `image/${fileType}`,
                cacheControl: '3600',
                upsert: false,
            });

        if (error) throw error;

        // Get public URL
        const { data: urlData } = supabaseAdmin.storage
            .from('product-images')
            .getPublicUrl(filePath);

        return urlData.publicUrl;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
}

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
        // Upload images to Supabase Storage
        let uploadedImageUrl: string | null = null;
        let uploadedImageUrls: string[] = [];

        try {
            // Upload main image if it's base64
            if (image && image.startsWith('data:')) {
                console.log('Uploading main image to storage...');
                uploadedImageUrl = await uploadBase64Image(image, 'products');
                console.log('Main image uploaded:', uploadedImageUrl);
            } else {
                uploadedImageUrl = image?.substring(0, 500) || null;
            }

            // Upload all images if they're base64
            if (images && images.length > 0) {
                console.log('Uploading', images.length, 'images to storage...');
                const uploadPromises = images.map(async (img: string) => {
                    if (img.startsWith('data:')) {
                        return await uploadBase64Image(img, 'products');
                    }
                    return img.substring(0, 500);
                });
                uploadedImageUrls = await Promise.all(uploadPromises);
                console.log('All images uploaded:', uploadedImageUrls.length);
            } else {
                uploadedImageUrls = uploadedImageUrl ? [uploadedImageUrl] : [];
            }
        } catch (uploadError: any) {
            console.error('Image upload error:', uploadError);
            return NextResponse.json(
                { error: 'Failed to upload images', details: uploadError.message },
                { status: 500 }
            );
        }

        const cleanedData = {
            title: title.substring(0, 255),
            category_id,
            description,
            price,
            stock,
            original_price: price,
            images: uploadedImageUrls,
            image: uploadedImageUrl,
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

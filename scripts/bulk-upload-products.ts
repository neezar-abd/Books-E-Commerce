import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Supabase Config
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Error: Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

interface CSVRow {
    'link prod': string;
    'gambar prod': string;
    'produk': string;
    'harga asli': string;
    'Rate Prod': string;
    'Kota': string;
    'nama toko': string;
    'brand': string;
    'posting': string;
    'Sold 30 hari ': string;
    [key: string]: string;
}

interface Product {
    title: string;
    description: string;
    price: number;
    original_price?: number;
    brand?: string;
    image: string;
    rating: number;
    stock: number;
    total_sold: number;
    is_active: boolean;
    slug: string;
}

// Generate slug dari title
function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 100);
}

// Parse harga dari format "4,000" atau "4.000"
function parsePrice(priceStr: string): number {
    const cleaned = priceStr.replace(/[^0-9]/g, '');
    return parseInt(cleaned) || 0;
}

// Parse rating dari format "4.8"
function parseRating(ratingStr: string): number {
    const rating = parseFloat(ratingStr) || 0;
    return Math.min(5, Math.max(0, rating));
}

// Parse sold dari format " 1,234 " atau "1234"
function parseSold(soldStr: string): number {
    const cleaned = soldStr.trim().replace(/[^0-9]/g, '');
    return parseInt(cleaned) || 0;
}

async function deleteAllProducts() {
    console.log('🗑️  Deleting all existing products...');

    const { error } = await supabase
        .from('products')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all (fake condition)

    if (error) {
        console.error('❌ Error deleting products:', error);
        throw error;
    }

    console.log('✅ All products deleted successfully!');
}

async function uploadProducts(filePath: string) {
    console.log('📁 Reading CSV file:', filePath);

    // Read CSV file
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    // Parse CSV
    const parseResult = Papa.parse<CSVRow>(fileContent, {
        header: true,
        skipEmptyLines: true,
    });

    const rows = parseResult.data;
    console.log(`📊 Found ${rows.length} rows in CSV`);

    // Transform CSV rows to products
    const products: Product[] = rows.map((row) => {
        const title = row['produk'] || 'Unnamed Product';
        const price = parsePrice(row['harga asli'] || '0');
        const rating = parseRating(row['Rate Prod'] || '0');
        const sold = parseSold(row['Sold 30 hari '] || '0');

        return {
            title: title.substring(0, 255), // Limit title length
            description: `${title}\n\nToko: ${row['nama toko'] || 'Unknown'}\nLokasi: ${row['Kota'] || 'Unknown'}\nPosting: ${row['posting'] || 'Unknown'}`,
            price,
            original_price: price, // Same as price (no discount data in CSV)
            brand: row['brand'] || undefined,
            image: row['gambar prod'] || '',
            rating,
            stock: sold > 0 ? 100 : 0, // Estimate stock based on sold
            total_sold: sold,
            is_active: true,
            slug: generateSlug(title),
        };
    });

    console.log(`\n🔄 Uploading ${products.length} products to database...`);

    // Upload in batches of 100
    const batchSize = 100;
    let uploaded = 0;
    let failed = 0;

    for (let i = 0; i < products.length; i += batchSize) {
        const batch = products.slice(i, i + batchSize);

        const { data, error } = await supabase
            .from('products')
            .insert(batch)
            .select();

        if (error) {
            console.error(`❌ Error uploading batch ${i / batchSize + 1}:`, error);
            failed += batch.length;
        } else {
            uploaded += batch.length;
            console.log(`✅ Batch ${i / batchSize + 1}: Uploaded ${batch.length} products (Total: ${uploaded}/${products.length})`);
        }
    }

    console.log('\n📊 Upload Summary:');
    console.log(`✅ Successfully uploaded: ${uploaded} products`);
    console.log(`❌ Failed: ${failed} products`);
}

async function main() {
    try {
        console.log('🚀 Starting bulk product upload...\n');

        // Step 1: Delete all existing products
        await deleteAllProducts();

        // Step 2: Upload new products from CSV
        const csvPath = path.join(process.cwd(), 'produk-elektronik-test.csv');
        await uploadProducts(csvPath);

        console.log('\n✅ Bulk upload completed successfully!');
    } catch (error) {
        console.error('\n❌ Fatal error:', error);
        process.exit(1);
    }
}

main();

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function syncCategories() {
    console.log('🔄 Syncing categories from JSON to database...\n');

    try {
        // Call the API endpoint to sync
        const response = await fetch(`${supabaseUrl.replace('/v1', '')}/api/sync-categories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'sync' })
        });

        // Since we can't call the API directly, let's use the sync logic here
        const kategoriData = require('../data-kategori-jadi.json');

        console.log(`📦 Found ${kategoriData.length} categories in JSON\n`);

        // Deduplicate by category_data_id
        const uniqueCategories = Array.from(
            new Map(
                kategoriData.map(item => [item['id kategori'], item])
            ).values()
        );

        console.log(`✨ ${uniqueCategories.length} unique categories to sync\n`);

        let successCount = 0;
        let errorCount = 0;
        const errors = [];

        // Insert in batches of 50
        const batchSize = 50;
        for (let i = 0; i < uniqueCategories.length; i += batchSize) {
            const batch = uniqueCategories.slice(i, i + batchSize);

            const records = batch.map(item => {
                const slugParts = [
                    item.kategori,
                    item['kategori-1'],
                    item['kategori-2'],
                    item['kategori-3'],
                ]
                    .filter((part) => part && part !== '-')
                    .map((part) =>
                        part
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, '-')
                            .replace(/^-|-$/g, '')
                    );

                const slug = slugParts.join('-');
                const name = slugParts.join(' > ');

                return {
                    category_data_id: item['id kategori'],
                    name: name,
                    slug: slug,
                    main_category: item.kategori,
                    sub1: item['kategori-1'] || null,
                    sub2: item['kategori-2'] === '-' ? null : item['kategori-2'],
                    sub3: item['kategori-3'] === '-' ? null : item['kategori-3'],
                    sub4: item['kategori-4'] === '-' ? null : item['kategori-4'],
                    image1: item['gbr-1'] || null,
                    image2: item['gbr-2'] || null,
                    image3: item['gbr-3'] || null,
                    image4: item['4'] || null,
                    image: item['gbr-1'] || null,
                    is_active: true,
                    position: item['id kategori'],
                };
            });

            const { error } = await supabase
                .from('categories')
                .upsert(records, {
                    onConflict: 'category_data_id',
                    ignoreDuplicates: false
                });

            if (error) {
                console.error(`❌ Batch ${Math.floor(i / batchSize) + 1} error:`, error.message);
                errorCount += batch.length;
                errors.push({ batch: Math.floor(i / batchSize) + 1, error: error.message });
            } else {
                successCount += batch.length;
                console.log(`✅ Batch ${Math.floor(i / batchSize) + 1}: ${batch.length} categories synced (${successCount}/${uniqueCategories.length})`);
            }
        }

        console.log('\n📊 Sync Summary:');
        console.log(`   Total: ${uniqueCategories.length}`);
        console.log(`   Success: ${successCount}`);
        console.log(`   Errors: ${errorCount}`);

        if (errors.length > 0) {
            console.log('\n❌ Errors:');
            errors.forEach(e => console.log(`   Batch ${e.batch}: ${e.error}`));
        }

        console.log('\n✅ Category sync completed!\n');

    } catch (error) {
        console.error('\n❌ Sync failed:', error.message);
        process.exit(1);
    }
}

syncCategories();

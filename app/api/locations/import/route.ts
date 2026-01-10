import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper functions
function createSlug(text: string): string {
    return text
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/\(/g, '')
        .replace(/\)/g, '')
        .replace(/\//g, '-')
        .replace(/,/g, '')
        .trim();
}

function extractShortName(provinceName: string): string | null {
    const match = provinceName.match(/\(([^)]+)\)/);
    return match ? match[1] : null;
}

function determineZone(provinceName: string): string {
    const name = provinceName.toLowerCase();

    if (name.includes('aceh') || name.includes('sumatera') || name.includes('riau') ||
        name.includes('jambi') || name.includes('bengkulu') || name.includes('bangka') ||
        name.includes('lampung')) {
        return 'Sumatra';
    }

    if (name.includes('jawa') || name.includes('jakarta') || name.includes('yogyakarta') ||
        name.includes('banten')) {
        return 'Java';
    }

    if (name.includes('kalimantan')) return 'Kalimantan';
    if (name.includes('sulawesi') || name.includes('gorontalo')) return 'Sulawesi';
    if (name.includes('bali') || name.includes('nusa tenggara')) return 'Bali & Nusa Tenggara';
    if (name.includes('maluku')) return 'Maluku';
    if (name.includes('papua')) return 'Papua';

    return 'Other';
}

export async function POST(request: NextRequest) {
    try {
        console.log('Starting location import...');

        // 1. Read JSON file
        const jsonPath = path.join(process.cwd(), 'Daftar_Kabupaten_Kota_Indonesia-lengkap.json');
        const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

        // 2. Parse provinces
        const provinceNames = new Set<string>();
        const provinces: any[] = [];

        rawData.forEach((item: any) => {
            if (item && item.Propinsi && !item.Column2 &&
                item.Propinsi !== 'Kota/kabupaten' &&
                !provinceNames.has(item.Propinsi)) {

                const name = item.Propinsi.trim();
                provinces.push({
                    name: name,
                    short_name: extractShortName(name),
                    slug: createSlug(name),
                    zone: determineZone(name)
                });
                provinceNames.add(name);
            }
        });

        console.log(`Found ${provinces.length} provinces`);

        // 3. Insert provinces
        const { data: insertedProvinces, error: provinceError } = await supabase
            .from('provinces')
            .upsert(provinces, {
                onConflict: 'slug',
                ignoreDuplicates: false
            })
            .select();

        if (provinceError) {
            throw new Error(`Failed to insert provinces: ${provinceError.message}`);
        }

        // 4. Create province lookup map
        const provinceMap = new Map<string, string>();
        insertedProvinces?.forEach((p: any) => {
            provinceMap.set(p.name, p.id);
            const shortName = extractShortName(p.name);
            if (shortName) {
                provinceMap.set(shortName, p.id);
            }
        });

        // 5. Parse cities
        const cities: any[] = [];
        const cityNames = new Set<string>();

        rawData.forEach((item: any) => {
            if (item && item.Propinsi && item.Column2) {
                const cityName = item.Propinsi.trim();
                const provinceName = item.Column2.trim();
                const provinceId = provinceMap.get(provinceName);

                if (!provinceId) {
                    console.warn(`Province not found for city: ${cityName} (${provinceName})`);
                    return;
                }

                let type = 'Kabupaten';
                let cleanName = cityName;

                if (cityName.toLowerCase().includes('kota ')) {
                    type = 'Kota';
                    cleanName = cityName.replace(/Kota /i, '').trim();
                } else if (cityName.toLowerCase().includes('kabupaten ')) {
                    cleanName = cityName.replace(/Kabupaten /i, '').trim();
                }

                const cityKey = `${provinceId}-${cleanName}`;
                if (!cityNames.has(cityKey)) {
                    cities.push({
                        province_id: provinceId,
                        name: cleanName,
                        type: type,
                        slug: createSlug(cleanName)
                    });
                    cityNames.add(cityKey);
                }
            }
        });

        console.log(`Found ${cities.length} cities`);

        // 6. Insert cities in batches
        const batchSize = 100;
        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < cities.length; i += batchSize) {
            const batch = cities.slice(i, i + batchSize);

            const { data, error } = await supabase
                .from('cities')
                .upsert(batch, {
                    onConflict: 'province_id,name',
                    ignoreDuplicates: false
                })
                .select();

            if (error) {
                console.error(`Error inserting batch:`, error.message);
                errorCount += batch.length;
            } else {
                successCount += data.length;
            }
        }

        return NextResponse.json({
            success: true,
            stats: {
                provinces: insertedProvinces?.length || 0,
                cities: successCount,
                errors: errorCount
            }
        });

    } catch (error: any) {
        console.error('Import error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

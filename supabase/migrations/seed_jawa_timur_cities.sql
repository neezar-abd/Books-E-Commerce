-- =============================================
-- Seed Complete East Java Cities/Regencies Data
-- Total: 38 cities/regencies in Jawa Timur
-- =============================================

-- First, ensure Jawa Timur province exists
INSERT INTO provinces (name, short_name, slug, zone)
VALUES ('Jawa Timur (JATIM)', 'JATIM', 'jawa-timur', 'Java')
ON CONFLICT (slug) DO NOTHING;

-- Get Jawa Timur province ID
DO $$
DECLARE
    jatim_id UUID;
BEGIN
    SELECT id INTO jatim_id FROM provinces WHERE slug = 'jawa-timur';
    
    IF jatim_id IS NOT NULL THEN
        -- Insert all 9 cities (Kota) in Jawa Timur
        INSERT INTO cities (province_id, name, type, slug, postal_code_prefix) VALUES
        (jatim_id, 'Kota Surabaya', 'Kota', 'kota-surabaya', '60'),
        (jatim_id, 'Kota Malang', 'Kota', 'kota-malang', '65'),
        (jatim_id, 'Kota Kediri', 'Kota', 'kota-kediri', '64'),
        (jatim_id, 'Kota Blitar', 'Kota', 'kota-blitar', '66'),
        (jatim_id, 'Kota Mojokerto', 'Kota', 'kota-mojokerto', '61'),
        (jatim_id, 'Kota Madiun', 'Kota', 'kota-madiun', '63'),
        (jatim_id, 'Kota Pasuruan', 'Kota', 'kota-pasuruan', '67'),
        (jatim_id, 'Kota Probolinggo', 'Kota', 'kota-probolinggo', '67'),
        (jatim_id, 'Kota Batu', 'Kota', 'kota-batu', '65')
        ON CONFLICT (province_id, name) DO NOTHING;

        -- Insert all 29 regencies (Kabupaten) in Jawa Timur
        INSERT INTO cities (province_id, name, type, slug, postal_code_prefix) VALUES
        (jatim_id, 'Kabupaten Bangkalan', 'Kabupaten', 'kabupaten-bangkalan', '69'),
        (jatim_id, 'Kabupaten Banyuwangi', 'Kabupaten', 'kabupaten-banyuwangi', '68'),
        (jatim_id, 'Kabupaten Blitar', 'Kabupaten', 'kabupaten-blitar', '66'),
        (jatim_id, 'Kabupaten Bojonegoro', 'Kabupaten', 'kabupaten-bojonegoro', '62'),
        (jatim_id, 'Kabupaten Bondowoso', 'Kabupaten', 'kabupaten-bondowoso', '68'),
        (jatim_id, 'Kabupaten Gresik', 'Kabupaten', 'kabupaten-gresik', '61'),
        (jatim_id, 'Kabupaten Jember', 'Kabupaten', 'kabupaten-jember', '68'),
        (jatim_id, 'Kabupaten Jombang', 'Kabupaten', 'kabupaten-jombang', '61'),
        (jatim_id, 'Kabupaten Kediri', 'Kabupaten', 'kabupaten-kediri', '64'),
        (jatim_id, 'Kabupaten Lamongan', 'Kabupaten', 'kabupaten-lamongan', '62'),
        (jatim_id, 'Kabupaten Lumajang', 'Kabupaten', 'kabupaten-lumajang', '67'),
        (jatim_id, 'Kabupaten Madiun', 'Kabupaten', 'kabupaten-madiun', '63'),
        (jatim_id, 'Kabupaten Magetan', 'Kabupaten', 'kabupaten-magetan', '63'),
        (jatim_id, 'Kabupaten Malang', 'Kabupaten', 'kabupaten-malang', '65'),
        (jatim_id, 'Kabupaten Mojokerto', 'Kabupaten', 'kabupaten-mojokerto', '61'),
        (jatim_id, 'Kabupaten Nganjuk', 'Kabupaten', 'kabupaten-nganjuk', '64'),
        (jatim_id, 'Kabupaten Ngawi', 'Kabupaten', 'kabupaten-ngawi', '63'),
        (jatim_id, 'Kabupaten Pacitan', 'Kabupaten', 'kabupaten-pacitan', '63'),
        (jatim_id, 'Kabupaten Pamekasan', 'Kabupaten', 'kabupaten-pamekasan', '69'),
        (jatim_id, 'Kabupaten Pasuruan', 'Kabupaten', 'kabupaten-pasuruan', '67'),
        (jatim_id, 'Kabupaten Ponorogo', 'Kabupaten', 'kabupaten-ponorogo', '63'),
        (jatim_id, 'Kabupaten Probolinggo', 'Kabupaten', 'kabupaten-probolinggo', '67'),
        (jatim_id, 'Kabupaten Sampang', 'Kabupaten', 'kabupaten-sampang', '69'),
        (jatim_id, 'Kabupaten Sidoarjo', 'Kabupaten', 'kabupaten-sidoarjo', '61'),
        (jatim_id, 'Kabupaten Situbondo', 'Kabupaten', 'kabupaten-situbondo', '68'),
        (jatim_id, 'Kabupaten Sumenep', 'Kabupaten', 'kabupaten-sumenep', '69'),
        (jatim_id, 'Kabupaten Trenggalek', 'Kabupaten', 'kabupaten-trenggalek', '66'),
        (jatim_id, 'Kabupaten Tuban', 'Kabupaten', 'kabupaten-tuban', '62'),
        (jatim_id, 'Kabupaten Tulungagung', 'Kabupaten', 'kabupaten-tulungagung', '66')
        ON CONFLICT (province_id, name) DO NOTHING;
    END IF;
END $$;

-- Verify data
SELECT 
    p.name as province,
    COUNT(c.id) as total_cities,
    SUM(CASE WHEN c.type = 'Kota' THEN 1 ELSE 0 END) as kota_count,
    SUM(CASE WHEN c.type = 'Kabupaten' THEN 1 ELSE 0 END) as kabupaten_count
FROM provinces p 
LEFT JOIN cities c ON p.id = c.province_id
WHERE p.slug = 'jawa-timur'
GROUP BY p.name;

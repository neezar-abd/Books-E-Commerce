-- =============================================
-- INDONESIA PROVINCES AND CITIES
-- Data wilayah Indonesia untuk dropdown
-- =============================================

-- =============================================
-- PROVINCES (34 Provinsi)
-- =============================================
INSERT INTO provinces (id, name) VALUES
  (11, 'Aceh'),
  (12, 'Sumatera Utara'),
  (13, 'Sumatera Barat'),
  (14, 'Riau'),
  (15, 'Jambi'),
  (16, 'Sumatera Selatan'),
  (17, 'Bengkulu'),
  (18, 'Lampung'),
  (19, 'Kepulauan Bangka Belitung'),
  (21, 'Kepulauan Riau'),
  (31, 'DKI Jakarta'),
  (32, 'Jawa Barat'),
  (33, 'Jawa Tengah'),
  (34, 'DI Yogyakarta'),
  (35, 'Jawa Timur'),
  (36, 'Banten'),
  (51, 'Bali'),
  (52, 'Nusa Tenggara Barat'),
  (53, 'Nusa Tenggara Timur'),
  (61, 'Kalimantan Barat'),
  (62, 'Kalimantan Tengah'),
  (63, 'Kalimantan Selatan'),
  (64, 'Kalimantan Timur'),
  (65, 'Kalimantan Utara'),
  (71, 'Sulawesi Utara'),
  (72, 'Sulawesi Tengah'),
  (73, 'Sulawesi Selatan'),
  (74, 'Sulawesi Tenggara'),
  (75, 'Gorontalo'),
  (76, 'Sulawesi Barat'),
  (81, 'Maluku'),
  (82, 'Maluku Utara'),
  (91, 'Papua'),
  (92, 'Papua Barat')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- CITIES (Major cities per province)
-- =============================================

-- Aceh (11)
INSERT INTO cities (id, province_id, name) VALUES
  (1101, 11, 'Kabupaten Aceh Besar'),
  (1102, 11, 'Kabupaten Aceh Utara'),
  (1103, 11, 'Kota Banda Aceh'),
  (1104, 11, 'Kota Lhokseumawe'),
  (1105, 11, 'Kota Langsa')
ON CONFLICT (id) DO NOTHING;

-- Sumatera Utara (12)
INSERT INTO cities (id, province_id, name) VALUES
  (1201, 12, 'Kota Medan'),
  (1202, 12, 'Kabupaten Deli Serdang'),
  (1203, 12, 'Kota Binjai'),
  (1204, 12, 'Kota Pematang Siantar'),
  (1205, 12, 'Kota Tebing Tinggi'),
  (1206, 12, 'Kabupaten Langkat'),
  (1207, 12, 'Kabupaten Simalungun')
ON CONFLICT (id) DO NOTHING;

-- Sumatera Barat (13)
INSERT INTO cities (id, province_id, name) VALUES
  (1301, 13, 'Kota Padang'),
  (1302, 13, 'Kota Bukittinggi'),
  (1303, 13, 'Kota Payakumbuh'),
  (1304, 13, 'Kabupaten Agam'),
  (1305, 13, 'Kabupaten Padang Pariaman')
ON CONFLICT (id) DO NOTHING;

-- Riau (14)
INSERT INTO cities (id, province_id, name) VALUES
  (1401, 14, 'Kota Pekanbaru'),
  (1402, 14, 'Kota Dumai'),
  (1403, 14, 'Kabupaten Kampar'),
  (1404, 14, 'Kabupaten Bengkalis'),
  (1405, 14, 'Kabupaten Indragiri Hilir')
ON CONFLICT (id) DO NOTHING;

-- Jambi (15)
INSERT INTO cities (id, province_id, name) VALUES
  (1501, 15, 'Kota Jambi'),
  (1502, 15, 'Kabupaten Muaro Jambi'),
  (1503, 15, 'Kabupaten Batanghari')
ON CONFLICT (id) DO NOTHING;

-- Sumatera Selatan (16)
INSERT INTO cities (id, province_id, name) VALUES
  (1601, 16, 'Kota Palembang'),
  (1602, 16, 'Kota Prabumulih'),
  (1603, 16, 'Kota Lubuklinggau'),
  (1604, 16, 'Kabupaten Ogan Ilir'),
  (1605, 16, 'Kabupaten Banyuasin')
ON CONFLICT (id) DO NOTHING;

-- Bengkulu (17)
INSERT INTO cities (id, province_id, name) VALUES
  (1701, 17, 'Kota Bengkulu'),
  (1702, 17, 'Kabupaten Bengkulu Tengah'),
  (1703, 17, 'Kabupaten Rejang Lebong')
ON CONFLICT (id) DO NOTHING;

-- Lampung (18)
INSERT INTO cities (id, province_id, name) VALUES
  (1801, 18, 'Kota Bandar Lampung'),
  (1802, 18, 'Kota Metro'),
  (1803, 18, 'Kabupaten Lampung Selatan'),
  (1804, 18, 'Kabupaten Lampung Tengah'),
  (1805, 18, 'Kabupaten Lampung Utara')
ON CONFLICT (id) DO NOTHING;

-- Kepulauan Bangka Belitung (19)
INSERT INTO cities (id, province_id, name) VALUES
  (1901, 19, 'Kota Pangkal Pinang'),
  (1902, 19, 'Kabupaten Bangka'),
  (1903, 19, 'Kabupaten Belitung')
ON CONFLICT (id) DO NOTHING;

-- Kepulauan Riau (21)
INSERT INTO cities (id, province_id, name) VALUES
  (2101, 21, 'Kota Batam'),
  (2102, 21, 'Kota Tanjung Pinang'),
  (2103, 21, 'Kabupaten Bintan'),
  (2104, 21, 'Kabupaten Karimun')
ON CONFLICT (id) DO NOTHING;

-- DKI Jakarta (31)
INSERT INTO cities (id, province_id, name) VALUES
  (3101, 31, 'Jakarta Pusat'),
  (3102, 31, 'Jakarta Utara'),
  (3103, 31, 'Jakarta Barat'),
  (3104, 31, 'Jakarta Selatan'),
  (3105, 31, 'Jakarta Timur'),
  (3106, 31, 'Kepulauan Seribu')
ON CONFLICT (id) DO NOTHING;

-- Jawa Barat (32)
INSERT INTO cities (id, province_id, name) VALUES
  (3201, 32, 'Kota Bandung'),
  (3202, 32, 'Kota Bogor'),
  (3203, 32, 'Kota Bekasi'),
  (3204, 32, 'Kota Depok'),
  (3205, 32, 'Kota Cimahi'),
  (3206, 32, 'Kota Sukabumi'),
  (3207, 32, 'Kota Cirebon'),
  (3208, 32, 'Kota Tasikmalaya'),
  (3209, 32, 'Kabupaten Bandung'),
  (3210, 32, 'Kabupaten Bogor'),
  (3211, 32, 'Kabupaten Bekasi'),
  (3212, 32, 'Kabupaten Karawang'),
  (3213, 32, 'Kabupaten Subang'),
  (3214, 32, 'Kabupaten Garut')
ON CONFLICT (id) DO NOTHING;

-- Jawa Tengah (33)
INSERT INTO cities (id, province_id, name) VALUES
  (3301, 33, 'Kota Semarang'),
  (3302, 33, 'Kota Surakarta'),
  (3303, 33, 'Kota Salatiga'),
  (3304, 33, 'Kota Magelang'),
  (3305, 33, 'Kota Pekalongan'),
  (3306, 33, 'Kota Tegal'),
  (3307, 33, 'Kabupaten Semarang'),
  (3308, 33, 'Kabupaten Klaten'),
  (3309, 33, 'Kabupaten Boyolali'),
  (3310, 33, 'Kabupaten Kudus'),
  (3311, 33, 'Kabupaten Jepara')
ON CONFLICT (id) DO NOTHING;

-- DI Yogyakarta (34)
INSERT INTO cities (id, province_id, name) VALUES
  (3401, 34, 'Kota Yogyakarta'),
  (3402, 34, 'Kabupaten Sleman'),
  (3403, 34, 'Kabupaten Bantul'),
  (3404, 34, 'Kabupaten Gunungkidul'),
  (3405, 34, 'Kabupaten Kulon Progo')
ON CONFLICT (id) DO NOTHING;

-- Jawa Timur (35)
INSERT INTO cities (id, province_id, name) VALUES
  (3501, 35, 'Kota Surabaya'),
  (3502, 35, 'Kota Malang'),
  (3503, 35, 'Kota Kediri'),
  (3504, 35, 'Kota Madiun'),
  (3505, 35, 'Kota Mojokerto'),
  (3506, 35, 'Kota Pasuruan'),
  (3507, 35, 'Kota Probolinggo'),
  (3508, 35, 'Kota Blitar'),
  (3509, 35, 'Kota Batu'),
  (3510, 35, 'Kabupaten Sidoarjo'),
  (3511, 35, 'Kabupaten Gresik'),
  (3512, 35, 'Kabupaten Jombang'),
  (3513, 35, 'Kabupaten Lamongan')
ON CONFLICT (id) DO NOTHING;

-- Banten (36)
INSERT INTO cities (id, province_id, name) VALUES
  (3601, 36, 'Kota Tangerang'),
  (3602, 36, 'Kota Tangerang Selatan'),
  (3603, 36, 'Kota Serang'),
  (3604, 36, 'Kota Cilegon'),
  (3605, 36, 'Kabupaten Tangerang'),
  (3606, 36, 'Kabupaten Serang')
ON CONFLICT (id) DO NOTHING;

-- Bali (51)
INSERT INTO cities (id, province_id, name) VALUES
  (5101, 51, 'Kota Denpasar'),
  (5102, 51, 'Kabupaten Badung'),
  (5103, 51, 'Kabupaten Gianyar'),
  (5104, 51, 'Kabupaten Tabanan'),
  (5105, 51, 'Kabupaten Buleleng'),
  (5106, 51, 'Kabupaten Karangasem')
ON CONFLICT (id) DO NOTHING;

-- Nusa Tenggara Barat (52)
INSERT INTO cities (id, province_id, name) VALUES
  (5201, 52, 'Kota Mataram'),
  (5202, 52, 'Kabupaten Lombok Barat'),
  (5203, 52, 'Kabupaten Lombok Tengah'),
  (5204, 52, 'Kabupaten Lombok Timur'),
  (5205, 52, 'Kota Bima')
ON CONFLICT (id) DO NOTHING;

-- Nusa Tenggara Timur (53)
INSERT INTO cities (id, province_id, name) VALUES
  (5301, 53, 'Kota Kupang'),
  (5302, 53, 'Kabupaten Kupang'),
  (5303, 53, 'Kabupaten Ende'),
  (5304, 53, 'Kabupaten Flores Timur')
ON CONFLICT (id) DO NOTHING;

-- Kalimantan Barat (61)
INSERT INTO cities (id, province_id, name) VALUES
  (6101, 61, 'Kota Pontianak'),
  (6102, 61, 'Kota Singkawang'),
  (6103, 61, 'Kabupaten Kubu Raya'),
  (6104, 61, 'Kabupaten Sambas')
ON CONFLICT (id) DO NOTHING;

-- Kalimantan Tengah (62)
INSERT INTO cities (id, province_id, name) VALUES
  (6201, 62, 'Kota Palangka Raya'),
  (6202, 62, 'Kabupaten Kotawaringin Timur'),
  (6203, 62, 'Kabupaten Kotawaringin Barat')
ON CONFLICT (id) DO NOTHING;

-- Kalimantan Selatan (63)
INSERT INTO cities (id, province_id, name) VALUES
  (6301, 63, 'Kota Banjarmasin'),
  (6302, 63, 'Kota Banjarbaru'),
  (6303, 63, 'Kabupaten Banjar'),
  (6304, 63, 'Kabupaten Tanah Laut')
ON CONFLICT (id) DO NOTHING;

-- Kalimantan Timur (64)
INSERT INTO cities (id, province_id, name) VALUES
  (6401, 64, 'Kota Balikpapan'),
  (6402, 64, 'Kota Samarinda'),
  (6403, 64, 'Kota Bontang'),
  (6404, 64, 'Kabupaten Kutai Kartanegara')
ON CONFLICT (id) DO NOTHING;

-- Kalimantan Utara (65)
INSERT INTO cities (id, province_id, name) VALUES
  (6501, 65, 'Kota Tarakan'),
  (6502, 65, 'Kabupaten Bulungan'),
  (6503, 65, 'Kabupaten Malinau')
ON CONFLICT (id) DO NOTHING;

-- Sulawesi Utara (71)
INSERT INTO cities (id, province_id, name) VALUES
  (7101, 71, 'Kota Manado'),
  (7102, 71, 'Kota Bitung'),
  (7103, 71, 'Kota Tomohon'),
  (7104, 71, 'Kabupaten Minahasa')
ON CONFLICT (id) DO NOTHING;

-- Sulawesi Tengah (72)
INSERT INTO cities (id, province_id, name) VALUES
  (7201, 72, 'Kota Palu'),
  (7202, 72, 'Kabupaten Donggala'),
  (7203, 72, 'Kabupaten Parigi Moutong')
ON CONFLICT (id) DO NOTHING;

-- Sulawesi Selatan (73)
INSERT INTO cities (id, province_id, name) VALUES
  (7301, 73, 'Kota Makassar'),
  (7302, 73, 'Kota Parepare'),
  (7303, 73, 'Kota Palopo'),
  (7304, 73, 'Kabupaten Gowa'),
  (7305, 73, 'Kabupaten Maros'),
  (7306, 73, 'Kabupaten Bone')
ON CONFLICT (id) DO NOTHING;

-- Sulawesi Tenggara (74)
INSERT INTO cities (id, province_id, name) VALUES
  (7401, 74, 'Kota Kendari'),
  (7402, 74, 'Kota Baubau'),
  (7403, 74, 'Kabupaten Kolaka')
ON CONFLICT (id) DO NOTHING;

-- Gorontalo (75)
INSERT INTO cities (id, province_id, name) VALUES
  (7501, 75, 'Kota Gorontalo'),
  (7502, 75, 'Kabupaten Gorontalo'),
  (7503, 75, 'Kabupaten Bone Bolango')
ON CONFLICT (id) DO NOTHING;

-- Sulawesi Barat (76)
INSERT INTO cities (id, province_id, name) VALUES
  (7601, 76, 'Kabupaten Mamuju'),
  (7602, 76, 'Kabupaten Polewali Mandar'),
  (7603, 76, 'Kabupaten Majene')
ON CONFLICT (id) DO NOTHING;

-- Maluku (81)
INSERT INTO cities (id, province_id, name) VALUES
  (8101, 81, 'Kota Ambon'),
  (8102, 81, 'Kota Tual'),
  (8103, 81, 'Kabupaten Maluku Tengah')
ON CONFLICT (id) DO NOTHING;

-- Maluku Utara (82)
INSERT INTO cities (id, province_id, name) VALUES
  (8201, 82, 'Kota Ternate'),
  (8202, 82, 'Kota Tidore Kepulauan'),
  (8203, 82, 'Kabupaten Halmahera Utara')
ON CONFLICT (id) DO NOTHING;

-- Papua (91)
INSERT INTO cities (id, province_id, name) VALUES
  (9101, 91, 'Kota Jayapura'),
  (9102, 91, 'Kabupaten Jayapura'),
  (9103, 91, 'Kabupaten Merauke'),
  (9104, 91, 'Kabupaten Mimika')
ON CONFLICT (id) DO NOTHING;

-- Papua Barat (92)
INSERT INTO cities (id, province_id, name) VALUES
  (9201, 92, 'Kota Sorong'),
  (9202, 92, 'Kabupaten Sorong'),
  (9203, 92, 'Kabupaten Manokwari')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- DONE! Indonesia regions data inserted
-- =============================================

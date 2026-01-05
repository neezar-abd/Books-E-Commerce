import kategoriData from '@/data-kategori-jadi.json';

interface KategoriItem {
  kategori: string;
  'kategori-1'?: string;
  'kategori-2'?: string;
  'kategori-3'?: string;
  'kategori-4'?: string;
  'id kategori': number;
  'gbr-1'?: string;
  'gbr-2'?: string;
  'gbr-3'?: string;
  '4'?: string;
}

/**
 * Get all unique main categories
 */
export function getAllCategories() {
  const uniqueCategories = Array.from(
    new Set(
      (kategoriData as KategoriItem[]).map((item) => item.kategori)
    )
  );

  return uniqueCategories.map((cat) => {
    const item = (kategoriData as KategoriItem[]).find(
      (i) => i.kategori === cat
    );
    return {
      name: cat,
      image: item?.['gbr-1'] || '',
    };
  });
}

/**
 * Get subcategories for a specific category (level 1)
 */
export function getSubcategoriesLevel1(kategori: string) {
  const subcategories = Array.from(
    new Set(
      (kategoriData as KategoriItem[])
        .filter((item) => item.kategori === kategori && item['kategori-1'])
        .map((item) => item['kategori-1'])
    )
  );

  return subcategories.map((subcat) => {
    const item = (kategoriData as KategoriItem[]).find(
      (i) => i.kategori === kategori && i['kategori-1'] === subcat
    );
    return {
      name: subcat!,
      image: item?.['gbr-1'] || '',
      kategori: kategori,
    };
  }).filter((s) => s.name);
}

/**
 * Get subcategories for a specific category and subcategory (level 2)
 */
export function getSubcategoriesLevel2(kategori: string, subkategori1: string) {
  const subcategories = Array.from(
    new Set(
      (kategoriData as KategoriItem[])
        .filter(
          (item) =>
            item.kategori === kategori &&
            item['kategori-1'] === subkategori1 &&
            item['kategori-2'] &&
            item['kategori-2'] !== '-'
        )
        .map((item) => item['kategori-2'])
    )
  );

  return subcategories.map((subcat) => {
    const item = (kategoriData as KategoriItem[]).find(
      (i) =>
        i.kategori === kategori &&
        i['kategori-1'] === subkategori1 &&
        i['kategori-2'] === subcat
    );
    return {
      name: subcat!,
      image: item?.['gbr-1'] || '',
      kategori: kategori,
      subkategori1: subkategori1,
    };
  }).filter((s) => s.name);
}

/**
 * Get subcategories for a specific category and subcategory (level 3)
 */
export function getSubcategoriesLevel3(
  kategori: string,
  subkategori1: string,
  subkategori2: string
) {
  const subcategories = Array.from(
    new Set(
      (kategoriData as KategoriItem[])
        .filter(
          (item) =>
            item.kategori === kategori &&
            item['kategori-1'] === subkategori1 &&
            item['kategori-2'] === subkategori2 &&
            item['kategori-3'] &&
            item['kategori-3'] !== '-'
        )
        .map((item) => item['kategori-3'])
    )
  );

  return subcategories.map((subcat) => {
    const item = (kategoriData as KategoriItem[]).find(
      (i) =>
        i.kategori === kategori &&
        i['kategori-1'] === subkategori1 &&
        i['kategori-2'] === subkategori2 &&
        i['kategori-3'] === subcat
    );
    return {
      name: subcat!,
      image: item?.['gbr-1'] || '',
      kategori: kategori,
      subkategori1: subkategori1,
      subkategori2: subkategori2,
    };
  }).filter((s) => s.name);
}

/**
 * Get category item by category ID
 */
export function getCategoryById(categoryId: number) {
  return (kategoriData as KategoriItem[]).find(
    (item) => item['id kategori'] === categoryId
  );
}

/**
 * Search categories by keyword
 */
export function searchCategories(keyword: string) {
  const lowerKeyword = keyword.toLowerCase();
  return (kategoriData as KategoriItem[]).filter((item) => {
    return (
      item.kategori.toLowerCase().includes(lowerKeyword) ||
      item['kategori-1']?.toLowerCase().includes(lowerKeyword) ||
      item['kategori-2']?.toLowerCase().includes(lowerKeyword) ||
      item['kategori-3']?.toLowerCase().includes(lowerKeyword)
    );
  });
}

/**
 * Get category hierarchy as breadcrumb
 */
export function getCategoryHierarchy(categoryId: number) {
  const item = getCategoryById(categoryId);
  if (!item) return [];

  const hierarchy = [item.kategori];
  if (item['kategori-1']) hierarchy.push(item['kategori-1']);
  if (item['kategori-2'] && item['kategori-2'] !== '-')
    hierarchy.push(item['kategori-2']);
  if (item['kategori-3'] && item['kategori-3'] !== '-')
    hierarchy.push(item['kategori-3']);
  if (item['kategori-4'] && item['kategori-4'] !== '-')
    hierarchy.push(item['kategori-4']);

  return hierarchy;
}

'use client';

import { useState, useEffect } from 'react';
import { getMainCategories, getSubcategories, getSubcategories2 } from '@/lib/categories';

interface Category {
    id: string;
    name: string;
    slug: string;
    level: number;
    parent_id: string | null;
}

interface CategorySelectorProps {
    value: string;
    onChange: (categoryId: string) => void;
    onCategoryDataChange?: (mainCategory: string, sub1?: string, sub2?: string) => void;
    // Initial values for restoring state
    initialMainCategory?: string;
    initialSub1?: string;
    initialSub2?: string;
}

export default function CategorySelector({
    value,
    onChange,
    onCategoryDataChange,
    initialMainCategory = '',
    initialSub1 = '',
    initialSub2 = ''
}: CategorySelectorProps) {
    const [mainCategories, setMainCategories] = useState<Category[]>([]);
    const [level1Categories, setLevel1Categories] = useState<Category[]>([]);
    const [level2Categories, setLevel2Categories] = useState<Category[]>([]);

    const [selectedMain, setSelectedMain] = useState(initialMainCategory);
    const [selectedLevel1, setSelectedLevel1] = useState(initialSub1);
    const [selectedLevel2, setSelectedLevel2] = useState(initialSub2);

    const [loading, setLoading] = useState(true);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        loadMainCategories();
    }, []);

    // Restore subcategories when component mounts with initial values
    useEffect(() => {
        if (!initialized && mainCategories.length > 0 && initialMainCategory) {
            restoreCategories();
        }
    }, [mainCategories, initialized, initialMainCategory]);

    const restoreCategories = async () => {
        try {
            // Restore level 1 categories if main category exists
            if (initialMainCategory) {
                const subs1 = await getSubcategories(initialMainCategory);
                setLevel1Categories(subs1);

                // Restore level 2 categories if sub1 exists
                if (initialSub1) {
                    const subs2 = await getSubcategories2(initialMainCategory, initialSub1);
                    setLevel2Categories(subs2);
                }
            }
            setInitialized(true);
        } catch (error) {
            console.warn('Error restoring categories:', error);
            setInitialized(true);
        }
    };

    const loadMainCategories = async () => {
        try {
            const cats = await getMainCategories();
            setMainCategories(cats);
        } catch (error) {
            // Silently handle - getMainCategories already logs warnings
            setMainCategories([]);
        } finally {
            setLoading(false);
        }
    };

    const handleMainChange = async (mainCategoryName: string) => {
        setSelectedMain(mainCategoryName);
        setSelectedLevel1('');
        setSelectedLevel2('');
        setLevel1Categories([]);
        setLevel2Categories([]);

        if (!mainCategoryName) {
            onChange('');
            onCategoryDataChange?.('');
            return;
        }

        // Find the selected main category to get its ID
        const mainCat = mainCategories.find(c => c.name === mainCategoryName);
        if (mainCat) {
            onChange(mainCat.id);
            onCategoryDataChange?.(mainCategoryName);
        }

        // Load level 1 subcategories
        try {
            const subs = await getSubcategories(mainCategoryName);
            setLevel1Categories(subs);

            // If no subcategories, this is the final selection
            if (subs.length === 0 && mainCat) {
                onChange(mainCat.id);
            }
        } catch (error) {
            console.warn('Error loading level 1 categories:', error);
        }
    };

    const handleLevel1Change = async (sub1Name: string) => {
        setSelectedLevel1(sub1Name);
        setSelectedLevel2('');
        setLevel2Categories([]);

        if (!sub1Name) {
            // Go back to main category selection
            const mainCat = mainCategories.find(c => c.name === selectedMain);
            if (mainCat) {
                onChange(mainCat.id);
                onCategoryDataChange?.(selectedMain);
            }
            return;
        }

        // Find the selected level 1 category to get its ID
        const level1Cat = level1Categories.find(c => c.name === sub1Name);
        if (level1Cat) {
            onChange(level1Cat.id);
            onCategoryDataChange?.(selectedMain, sub1Name);
        }

        // Load level 2 subcategories
        try {
            const subs = await getSubcategories2(selectedMain, sub1Name);
            setLevel2Categories(subs);

            // If no subcategories, this is the final selection
            if (subs.length === 0 && level1Cat) {
                onChange(level1Cat.id);
            }
        } catch (error) {
            console.warn('Error loading level 2 categories:', error);
        }
    };

    const handleLevel2Change = (sub2Name: string) => {
        setSelectedLevel2(sub2Name);

        if (!sub2Name) {
            // Go back to level 1 selection
            const level1Cat = level1Categories.find(c => c.name === selectedLevel1);
            if (level1Cat) {
                onChange(level1Cat.id);
                onCategoryDataChange?.(selectedMain, selectedLevel1);
            }
            return;
        }

        const level2Cat = level2Categories.find(c => c.name === sub2Name);
        if (level2Cat) {
            onChange(level2Cat.id);
            onCategoryDataChange?.(selectedMain, selectedLevel1, sub2Name);
        }
    };

    if (loading) {
        return (
            <div className="space-y-3">
                <div className="h-12 bg-gray-100 dark:bg-navy-700 rounded-lg animate-pulse" />
            </div>
        );
    }

    if (mainCategories.length === 0) {
        return (
            <div className="space-y-3">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                        Belum ada data kategori. Admin perlu menambahkan data kategori terlebih dahulu.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Main Category */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Kategori Utama <span className="text-red-500">*</span>
                </label>
                <select
                    value={selectedMain}
                    onChange={(e) => handleMainChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg dark:bg-navy-700 dark:border-navy-600 dark:text-white"
                    required
                >
                    <option value="">Pilih Kategori Utama</option>
                    {mainCategories.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                            {cat.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Level 1 Subcategories */}
            {level1Categories.length > 0 && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Sub Kategori Level 1
                    </label>
                    <select
                        value={selectedLevel1}
                        onChange={(e) => handleLevel1Change(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg dark:bg-navy-700 dark:border-navy-600 dark:text-white"
                    >
                        <option value="">Pilih Sub Kategori (Opsional)</option>
                        {level1Categories.map((cat) => (
                            <option key={cat.id} value={cat.name}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Level 2 Subcategories */}
            {level2Categories.length > 0 && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Sub Kategori Level 2
                    </label>
                    <select
                        value={selectedLevel2}
                        onChange={(e) => handleLevel2Change(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg dark:bg-navy-700 dark:border-navy-600 dark:text-white"
                    >
                        <option value="">Pilih Sub Kategori (Opsional)</option>
                        {level2Categories.map((cat) => (
                            <option key={cat.id} value={cat.name}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Helper text */}
            <p className="text-xs text-gray-500">
                Pilih kategori yang paling spesifik untuk produk Anda. Sub kategori akan muncul setelah memilih kategori utama.
            </p>
        </div>
    );
}

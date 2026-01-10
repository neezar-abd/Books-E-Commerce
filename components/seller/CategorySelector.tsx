'use client';

import { useState, useEffect } from 'react';
import { getMainCategories, getSubcategories } from '@/lib/categories';

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
}

export default function CategorySelector({ value, onChange }: CategorySelectorProps) {
    const [mainCategories, setMainCategories] = useState<Category[]>([]);
    const [level1Categories, setLevel1Categories] = useState<Category[]>([]);
    const [level2Categories, setLevel2Categories] = useState<Category[]>([]);

    const [selectedMain, setSelectedMain] = useState('');
    const [selectedLevel1, setSelectedLevel1] = useState('');
    const [selectedLevel2, setSelectedLevel2] = useState('');

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMainCategories();
    }, []);

    const loadMainCategories = async () => {
        try {
            const cats = await getMainCategories();
            setMainCategories(cats);
        } catch (error) {
            console.error('Error loading main categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMainChange = async (mainId: string) => {
        setSelectedMain(mainId);
        setSelectedLevel1('');
        setSelectedLevel2('');
        setLevel1Categories([]);
        setLevel2Categories([]);

        if (!mainId) {
            onChange('');
            return;
        }

        // Load level 1 subcategories
        try {
            const subs = await getSubcategories(mainId);
            setLevel1Categories(subs);

            // If no subcategories, select this as final
            if (subs.length === 0) {
                onChange(mainId);
            }
        } catch (error) {
            console.error('Error loading level 1 categories:', error);
        }
    };

    const handleLevel1Change = async (level1Id: string) => {
        setSelectedLevel1(level1Id);
        setSelectedLevel2('');
        setLevel2Categories([]);

        if (!level1Id) {
            onChange(selectedMain);
            return;
        }

        // Load level 2 subcategories
        try {
            const subs = await getSubcategories(level1Id);
            setLevel2Categories(subs);

            // If no subcategories, select this as final
            if (subs.length === 0) {
                onChange(level1Id);
            }
        } catch (error) {
            console.error('Error loading level 2 categories:', error);
        }
    };

    const handleLevel2Change = (level2Id: string) => {
        setSelectedLevel2(level2Id);
        onChange(level2Id || selectedLevel1);
    };

    if (loading) {
        return (
            <div className="space-y-3">
                <div className="h-12 bg-gray-100 dark:bg-navy-700 rounded-lg animate-pulse" />
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
                        <option key={cat.id} value={cat.id}>
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
                            <option key={cat.id} value={cat.id}>
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
                            <option key={cat.id} value={cat.id}>
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

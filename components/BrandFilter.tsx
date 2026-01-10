'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Brand {
    id: string;
    name: string;
    slug: string;
    category_name: string;
    subcategory_name: string;
}

interface BrandFilterProps {
    category?: string;
    subcategory?: string;
    onFilterChange: (brandSlug: string | null) => void;
    selectedBrand?: string | null;
    className?: string;
}

const BrandFilter: React.FC<BrandFilterProps> = ({
    category,
    subcategory,
    onFilterChange,
    selectedBrand,
    className = ''
}) => {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(false);
    const [showAll, setShowAll] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchBrands();
    }, []); // Fetch once on mount, no dependencies needed

    const fetchBrands = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            // Don't filter by category - show ALL brands
            params.append('limit', '500'); // Increased limit for all brands

            console.log('🔍 BrandFilter - Fetching ALL brands:', {
                url: `/api/brands?${params.toString()}`
            });

            const response = await fetch(`/api/brands?${params.toString()}`);
            if (!response.ok) throw new Error('Failed to fetch brands');

            const data = await response.json();
            console.log('✅ BrandFilter - Received brands:', {
                count: data.length,
                sampleBrands: data.slice(0, 5).map((b: Brand) => ({
                    name: b.name,
                    category: b.category_name
                }))
            });
            setBrands(data);
        } catch (error) {
            console.error('Error fetching brands:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredBrands = searchQuery
        ? brands.filter(brand =>
            brand.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : brands;

    const displayedBrands = showAll ? filteredBrands : filteredBrands.slice(0, 15);
    const hasMore = filteredBrands.length > 15;

    return (
        <div className={`border-b pb-4 ${className}`}>
            <h3 className="text-sm font-medium mb-3">Brand</h3>

            {loading ? (
                <div className="text-xs text-gray-500">Loading brands...</div>
            ) : brands.length === 0 ? (
                <div className="text-xs text-gray-500">No brands available</div>
            ) : (
                <>
                    {/* Search Input */}
                    {brands.length > 15 && (
                        <input
                            type="text"
                            placeholder="Cari brand..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-3 py-2 text-sm border rounded-lg mb-3 focus:outline-none focus:border-primary"
                        />
                    )}

                    {/* Brand List */}
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {/* "Semua Brand" option */}
                        <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                            <input
                                type="radio"
                                name="brand"
                                checked={!selectedBrand}
                                onChange={() => onFilterChange(null)}
                                className="w-4 h-4 text-primary"
                            />
                            <span className="text-sm">Semua Brand</span>
                        </label>

                        {displayedBrands.map((brand) => (
                            <label
                                key={brand.id}
                                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                            >
                                <input
                                    type="radio"
                                    name="brand"
                                    checked={selectedBrand === brand.slug}
                                    onChange={() => onFilterChange(brand.slug)}
                                    className="w-4 h-4 text-primary"
                                />
                                <span className="text-sm">{brand.name}</span>
                            </label>
                        ))}
                    </div>

                    {/* Show More/Less Toggle */}
                    {hasMore && !searchQuery && (
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className="w-full mt-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center justify-between transition-colors"
                        >
                            <span>{showAll ? 'Lebih Sedikit' : 'Lainnya'}</span>
                            <ChevronDown
                                className={`w-4 h-4 transition-transform ${showAll ? 'rotate-180' : ''}`}
                            />
                        </button>
                    )}

                    {searchQuery && filteredBrands.length === 0 && (
                        <div className="text-xs text-gray-500 mt-2">Brand tidak ditemukan</div>
                    )}
                </>
            )}
        </div>
    );
};

export default BrandFilter;

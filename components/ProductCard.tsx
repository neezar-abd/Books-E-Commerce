'use client';

import React from 'react';
import { Star, MapPin, Truck, Store } from 'lucide-react';
import Link from 'next/link';
import { formatRupiah } from '@/lib/utils';

interface ProductCardProps {
    product: {
        id: string;
        title: string;
        image: string;
        price: number | string;
        original_price?: number | string;
        discount?: number;
        rating?: number;
        stock?: number;
        store_id?: string;
        stores?: {
            name: string;
            slug: string;
            city: string;
            is_verified: boolean;
        };
    };
    index?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
    // Generate consistent random values based on product id
    const idCode = product.id?.toString().charCodeAt?.(0) || 0;
    const soldCount = (idCode * 127 + 500) % 9000 + 100;
    const deliveryDays = (index % 3) + 2;

    // Use store city if available, otherwise fallback
    const city = product.stores?.city || ['Jakarta', 'Bandung', 'Surabaya', 'Yogyakarta'][index % 4];

    const formatSold = (num: number) => {
        if (num >= 1000) return `${(num / 1000).toFixed(1)}RB+`;
        return `${num}`;
    };

    return (
        <Link href={`/product/${product.id}`} className="group block h-full">
            <div className="bg-white overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col">
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <img
                        src={product.image || '/images/placeholder-product.png'}
                        alt={product.title}
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/400x400/E5E7EB/6B7280?text=No+Image';
                        }}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Discount Badge */}
                    {product.discount && (
                        <div className="absolute top-2 left-2 z-10">
                            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5">
                                -{product.discount}%
                            </span>
                        </div>
                    )}

                    {/* Promo Badge */}
                    <div className="absolute top-2 right-2 z-10">
                        <span className="bg-secondary text-primary text-[9px] font-bold px-1.5 py-0.5">
                            PROMO
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-3 flex flex-col flex-1">
                    {/* Title */}
                    <h3 className="text-sm text-primary font-medium leading-tight mb-2 line-clamp-2 min-h-[40px] group-hover:text-secondary transition-colors">
                        {product.title}
                    </h3>

                    {/* Price */}
                    <div className="mb-2">
                        <span className="text-secondary font-bold text-base">
                            {formatRupiah(Number(product.price))}
                        </span>
                        {product.original_price && (
                            <span className="text-gray-400 text-xs line-through ml-2">
                                {formatRupiah(Number(product.original_price))}
                            </span>
                        )}
                    </div>

                    {/* Rating & Sold */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <div className="flex items-center gap-0.5">
                            <Star size={12} fill="#F5BE30" className="text-secondary" />
                            <span>{product.rating || '4.9'}</span>
                        </div>
                        <span className="text-gray-300">|</span>
                        <span>{formatSold(soldCount)} Terjual</span>
                    </div>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Store Info (if available) */}
                    {product.stores && (
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mb-2 pb-2 border-b border-gray-100">
                            <Store size={10} />
                            <span className="truncate font-medium">{product.stores.name}</span>
                            {product.stores.is_verified && (
                                <span className="text-[8px] bg-blue-100 text-blue-600 px-1">✓</span>
                            )}
                        </div>
                    )}

                    {/* Delivery & City */}
                    <div className="flex flex-col gap-1 text-[11px] text-gray-400 mt-auto">
                        <div className="flex items-center gap-1">
                            <Truck size={10} />
                            <span>{deliveryDays}-{deliveryDays + 2} Hari</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <MapPin size={10} />
                            <span className="truncate">{city}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;

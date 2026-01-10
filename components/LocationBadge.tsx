'use client';

import { MapPin } from 'lucide-react';

interface LocationBadgeProps {
    province: string;
    city?: string;
    showDistance?: boolean;
    distance?: string;
    variant?: 'default' | 'compact' | 'detailed';
    className?: string;
}

export default function LocationBadge({
    province,
    city,
    showDistance = false,
    distance,
    variant = 'default',
    className = '',
}: LocationBadgeProps) {
    if (variant === 'compact') {
        return (
            <div className={`inline-flex items-center gap-1 text-xs text-gray-600 ${className}`}>
                <MapPin className="w-3 h-3" />
                <span>{city || province}</span>
            </div>
        );
    }

    if (variant === 'detailed') {
        return (
            <div className={`flex items-start gap-2 ${className}`}>
                <div className="rounded-full bg-orange-50 p-2">
                    <MapPin className="w-5 h-5 text-orange-500" />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                        {city ? `${city}, ${province}` : province}
                    </p>
                    {showDistance && distance && (
                        <p className="text-xs text-gray-500 mt-1">
                            📍 {distance} dari lokasi Anda
                        </p>
                    )}
                </div>
            </div>
        );
    }

    // Default variant
    return (
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-700 text-sm ${className}`}>
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="font-medium">
                {city ? `${city}, ${province}` : province}
            </span>
            {showDistance && distance && (
                <span className="text-xs text-gray-500 ml-2">
                    • {distance}
                </span>
            )}
        </div>
    );
}

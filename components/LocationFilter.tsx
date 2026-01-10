'use client';

import { useState, useEffect } from 'react';
import { MapPin, X, ChevronDown } from 'lucide-react';

interface Province {
    id: string;
    name: string;
    slug: string;
}

interface City {
    id: string;
    name: string;
    type: string;
    slug: string;
}

interface LocationFilterProps {
    onFilterChange: (provinceId: string | null, cityId: string | null) => void;
    initialProvinceId?: string;
    initialCityId?: string;
    className?: string;
}

export default function LocationFilter({
    onFilterChange,
    initialProvinceId,
    initialCityId,
    className = '',
}: LocationFilterProps) {
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [selectedProvinceId, setSelectedProvinceId] = useState<string | null>(initialProvinceId || null);
    const [selectedCityId, setSelectedCityId] = useState<string | null>(initialCityId || null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [loading, setLoading] = useState(false);

    // Fetch provinces on mount
    useEffect(() => {
        fetchProvinces();
    }, []);

    // Fetch cities when province changes
    useEffect(() => {
        if (selectedProvinceId) {
            fetchCities(selectedProvinceId);
        } else {
            setCities([]);
            setSelectedCityId(null);
        }
    }, [selectedProvinceId]);

    const fetchProvinces = async () => {
        try {
            const response = await fetch('/api/locations/provinces');
            const data = await response.json();
            if (data.success) {
                setProvinces(data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch provinces:', error);
        }
    };

    const fetchCities = async (provinceId: string) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/locations/cities?province_id=${provinceId}`);
            const data = await response.json();
            if (data.success) {
                setCities(data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch cities:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProvinceChange = (provinceId: string) => {
        setSelectedProvinceId(provinceId || null);
        setSelectedCityId(null);
        onFilterChange(provinceId || null, null);
    };

    const handleCityChange = (cityId: string) => {
        setSelectedCityId(cityId || null);
        onFilterChange(selectedProvinceId, cityId || null);
    };

    const clearFilter = () => {
        setSelectedProvinceId(null);
        setSelectedCityId(null);
        onFilterChange(null, null);
    };

    const selectedProvince = provinces.find(p => p.id === selectedProvinceId);
    const selectedCity = cities.find(c => c.id === selectedCityId);

    return (
        <div className={`bg-white border border-gray-200 ${className}`}>
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-900">Lokasi</span>
                    {(selectedProvince || selectedCity) && (
                        <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">
                            1
                        </span>
                    )}
                </div>
                <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Content */}
            {isExpanded && (
                <div className="px-4 py-3 border-t border-gray-200 space-y-3">
                    {/* Province Dropdown */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Provinsi
                        </label>
                        <select
                            value={selectedProvinceId || ''}
                            onChange={(e) => handleProvinceChange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 bg-white text-sm
                       focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                            <option value="">Semua Provinsi</option>
                            {provinces.map((province) => (
                                <option key={province.id} value={province.id}>
                                    {province.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* City Dropdown */}
                    {selectedProvinceId && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Kota/Kabupaten
                            </label>
                            <select
                                value={selectedCityId || ''}
                                onChange={(e) => handleCityChange(e.target.value)}
                                disabled={loading}
                                className="w-full px-3 py-2 border border-gray-300 bg-white text-sm
                         focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent
                         disabled:bg-gray-100"
                            >
                                <option value="">Semua Kota/Kabupaten</option>
                                {cities.map((city) => (
                                    <option key={city.id} value={city.id}>
                                        {city.type} {city.name}
                                    </option>
                                ))}
                            </select>
                            {cities.length > 0 && (
                                <p className="mt-1 text-xs text-gray-500">
                                    {cities.length} pilihan tersedia
                                </p>
                            )}
                        </div>
                    )}

                    {/* Active Filter Display */}
                    {(selectedProvince || selectedCity) && (
                        <div className="pt-2 border-t border-gray-200">
                            <p className="text-xs text-gray-600 mb-2">Filter aktif:</p>
                            <div className="flex flex-wrap gap-2">
                                {selectedCity ? (
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-50 text-orange-700 text-sm rounded-full">
                                        <MapPin className="w-3 h-3" />
                                        <span>{selectedCity.type} {selectedCity.name}</span>
                                        <button
                                            onClick={clearFilter}
                                            className="hover:bg-orange-100 rounded-full p-0.5"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ) : selectedProvince && (
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-50 text-orange-700 text-sm rounded-full">
                                        <MapPin className="w-3 h-3" />
                                        <span>{selectedProvince.name}</span>
                                        <button
                                            onClick={clearFilter}
                                            className="hover:bg-orange-100 rounded-full p-0.5"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Clear All Button */}
                    {(selectedProvince || selectedCity) && (
                        <button
                            onClick={clearFilter}
                            className="w-full text-sm text-orange-600 hover:text-orange-700 font-medium py-2"
                        >
                            Reset Filter
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

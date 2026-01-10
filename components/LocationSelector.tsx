'use client';

import { useEffect, useState } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';

interface Province {
    id: string;
    name: string;
    short_name: string | null;
    slug: string;
    zone: string;
}

interface City {
    id: string;
    name: string;
    type: string;
    slug: string;
    province?: {
        id: string;
        name: string;
        slug: string;
    };
}

interface LocationValue {
    provinceId: string;
    provinceName: string;
    cityId: string;
    cityName: string;
}

interface LocationSelectorProps {
    value?: LocationValue;
    onChange: (location: LocationValue) => void;
    required?: boolean;
    provinceLabel?: string;
    cityLabel?: string;
    provincePlaceholder?: string;
    cityPlaceholder?: string;
}

export default function LocationSelector({
    value,
    onChange,
    required = false,
    provinceLabel = 'Provinsi',
    cityLabel = 'Kota/Kabupaten',
    provincePlaceholder = 'Pilih provinsi',
    cityPlaceholder = 'Pilih kota/kabupaten',
}: LocationSelectorProps) {
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [selectedProvinceId, setSelectedProvinceId] = useState<string>(value?.provinceId || '');
    const [selectedCityId, setSelectedCityId] = useState<string>(value?.cityId || '');
    const [loadingProvinces, setLoadingProvinces] = useState(true);
    const [loadingCities, setLoadingCities] = useState(false);

    // Load provinces on mount
    useEffect(() => {
        fetchProvinces();
    }, []);

    // Load cities when province changes
    useEffect(() => {
        if (selectedProvinceId) {
            fetchCities(selectedProvinceId);
        } else {
            setCities([]);
            setSelectedCityId('');
        }
    }, [selectedProvinceId]);

    const fetchProvinces = async () => {
        try {
            setLoadingProvinces(true);
            const response = await fetch('/api/locations/provinces');
            const data = await response.json();

            if (data.success) {
                setProvinces(data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch provinces:', error);
        } finally {
            setLoadingProvinces(false);
        }
    };

    const fetchCities = async (provinceId: string) => {
        try {
            setLoadingCities(true);
            const response = await fetch(`/api/locations/cities?province_id=${provinceId}`);
            const data = await response.json();

            if (data.success) {
                setCities(data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch cities:', error);
        } finally {
            setLoadingCities(false);
        }
    };

    const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newProvinceId = e.target.value;
        const province = provinces.find(p => p.id === newProvinceId);

        setSelectedProvinceId(newProvinceId);
        setSelectedCityId(''); // Reset city when province changes

        if (province) {
            // Trigger onChange with empty city
            onChange({
                provinceId: province.id,
                provinceName: province.name,
                cityId: '',
                cityName: '',
            });
        }
    };

    const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCityId = e.target.value;
        const city = cities.find(c => c.id === newCityId);
        const province = provinces.find(p => p.id === selectedProvinceId);

        setSelectedCityId(newCityId);

        if (city && province) {
            onChange({
                provinceId: province.id,
                provinceName: province.name,
                cityId: city.id,
                cityName: city.name,
            });
        }
    };

    return (
        <div className="space-y-4">
            {/* Province Selector */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="inline w-4 h-4 mr-1" />
                    {provinceLabel}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <div className="relative">
                    <select
                        value={selectedProvinceId}
                        onChange={handleProvinceChange}
                        required={required}
                        disabled={loadingProvinces}
                        className="w-full px-4 py-3 pr-10 border border-gray-300 bg-white text-gray-900 
                     focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent
                     disabled:bg-gray-100 disabled:cursor-not-allowed appearance-none"
                    >
                        <option value="">{loadingProvinces ? 'Loading...' : provincePlaceholder}</option>
                        {provinces.map((province) => (
                            <option key={province.id} value={province.id}>
                                {province.name}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
            </div>

            {/* City Selector */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {cityLabel}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <div className="relative">
                    <select
                        value={selectedCityId}
                        onChange={handleCityChange}
                        required={required}
                        disabled={!selectedProvinceId || loadingCities}
                        className="w-full px-4 py-3 pr-10 border border-gray-300 bg-white text-gray-900 
                     focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent
                     disabled:bg-gray-100 disabled:cursor-not-allowed appearance-none"
                    >
                        <option value="">
                            {!selectedProvinceId
                                ? 'Pilih provinsi dulu'
                                : loadingCities
                                    ? 'Loading...'
                                    : cityPlaceholder}
                        </option>
                        {cities.map((city) => (
                            <option key={city.id} value={city.id}>
                                {city.type} {city.name}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
                {cities.length > 0 && (
                    <p className="mt-1 text-xs text-gray-500">
                        {cities.length} kota/kabupaten tersedia
                    </p>
                )}
            </div>
        </div>
    );
}

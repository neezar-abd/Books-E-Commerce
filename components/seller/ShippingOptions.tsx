'use client';

import { useState } from 'react';
import { MdAdd, MdDelete, MdLocalShipping } from 'react-icons/md';
import { COURIERS, SERVICE_TYPES } from '@/lib/shipping';

interface ShippingOption {
    id: string;
    courier_name: string;
    service_type: string;
    base_price: number;
    per_kg_price?: number;
    estimated_days: string;
}

interface ShippingOptionsProps {
    productWeight?: number; // in grams
    onChange?: (options: ShippingOption[]) => void;
}

export default function ShippingOptions({ productWeight = 0, onChange }: ShippingOptionsProps) {
    const [options, setOptions] = useState<ShippingOption[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newOption, setNewOption] = useState<Partial<ShippingOption>>({
        courier_name: '',
        service_type: '',
        base_price: 0,
        per_kg_price: 0,
        estimated_days: '3-5 hari'
    });

    const addOption = () => {
        if (!newOption.courier_name || !newOption.service_type || !newOption.base_price) {
            alert('Mohon isi courier, service type, dan harga dasar');
            return;
        }

        const option: ShippingOption = {
            id: `ship-${Date.now()}`,
            courier_name: newOption.courier_name,
            service_type: newOption.service_type,
            base_price: newOption.base_price || 0,
            per_kg_price: newOption.per_kg_price,
            estimated_days: newOption.estimated_days || '3-5 hari'
        };

        const updated = [...options, option];
        setOptions(updated);
        onChange?.(updated);

        // Reset form
        setNewOption({
            courier_name: '',
            service_type: '',
            base_price: 0,
            per_kg_price: 0,
            estimated_days: '3-5 hari'
        });
        setShowAddForm(false);
    };

    const removeOption = (id: string) => {
        const updated = options.filter(o => o.id !== id);
        setOptions(updated);
        onChange?.(updated);
    };

    const addPreset = (courier: string, service: string, basePrice: number, perKgPrice: number, days: string) => {
        const option: ShippingOption = {
            id: `ship-${Date.now()}`,
            courier_name: courier,
            service_type: service,
            base_price: basePrice,
            per_kg_price: perKgPrice,
            estimated_days: days
        };

        const updated = [...options, option];
        setOptions(updated);
        onChange?.(updated);
    };

    const calculatePrice = (option: ShippingOption) => {
        let price = option.base_price;
        if (option.per_kg_price && productWeight > 0) {
            const kg = productWeight / 1000;
            price += option.per_kg_price * kg;
        }
        return Math.round(price);
    };

    return (
        <div className="space-y-6">
            {/* Quick Presets */}
            <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Preset Cepat</h3>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => addPreset('JNE', 'Regular', 12000, 5000, '3-5 hari')}
                        className="px-3 py-2 text-sm border border-gray-300 dark:border-navy-600 rounded-lg hover:bg-gray-50 dark:hover:bg-navy-800 text-left"
                    >
                        <div className="font-medium">JNE Regular</div>
                        <div className="text-xs text-gray-500">Rp 12.000 + Rp 5.000/kg</div>
                    </button>
                    <button
                        onClick={() => addPreset('J&T Express', 'Regular', 11000, 4500, '3-4 hari')}
                        className="px-3 py-2 text-sm border border-gray-300 dark:border-navy-600 rounded-lg hover:bg-gray-50 dark:hover:bg-navy-800 text-left"
                    >
                        <div className="font-medium">J&T Regular</div>
                        <div className="text-xs text-gray-500">Rp 11.000 + Rp 4.500/kg</div>
                    </button>
                    <button
                        onClick={() => addPreset('SiCepat', 'Regular', 10000, 4000, '3-5 hari')}
                        className="px-3 py-2 text-sm border border-gray-300 dark:border-navy-600 rounded-lg hover:bg-gray-50 dark:hover:bg-navy-800 text-left"
                    >
                        <div className="font-medium">SiCepat Regular</div>
                        <div className="text-xs text-gray-500">Rp 10.000 + Rp 4.000/kg</div>
                    </button>
                    <button
                        onClick={() => addPreset('Grab Express', 'Same Day', 25000, 0, '0-1 hari')}
                        className="px-3 py-2 text-sm border border-gray-300 dark:border-navy-600 rounded-lg hover:bg-gray-50 dark:hover:bg-navy-800 text-left"
                    >
                        <div className="font-medium">Grab Same Day</div>
                        <div className="text-xs text-gray-500">Rp 25.000 (flat)</div>
                    </button>
                </div>
            </div>

            {/* Custom Add */}
            <div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-navy-600 rounded-lg hover:border-brand-500 transition-colors flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400"
                >
                    <MdAdd /> Tambah Ongkir Custom
                </button>

                {showAddForm && (
                    <div className="mt-4 p-4 border border-gray-200 dark:border-navy-700 rounded-lg space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Kurir</label>
                                <select
                                    value={newOption.courier_name}
                                    onChange={(e) => setNewOption({ ...newOption, courier_name: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-navy-700 dark:border-navy-600"
                                >
                                    <option value="">Pilih Kurir</option>
                                    {Object.entries(COURIERS).map(([key, name]) => (
                                        <option key={key} value={name}>{name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Jenis Layanan</label>
                                <select
                                    value={newOption.service_type}
                                    onChange={(e) => setNewOption({ ...newOption, service_type: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-navy-700 dark:border-navy-600"
                                >
                                    <option value="">Pilih Layanan</option>
                                    {Object.entries(SERVICE_TYPES).map(([key, name]) => (
                                        <option key={key} value={name}>{name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Harga Dasar (Rp)</label>
                                <input
                                    type="number"
                                    value={newOption.base_price}
                                    onChange={(e) => setNewOption({ ...newOption, base_price: parseInt(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-navy-700 dark:border-navy-600"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Harga per Kg (Rp) <span className="text-gray-400">(Opsional)</span></label>
                                <input
                                    type="number"
                                    value={newOption.per_kg_price}
                                    onChange={(e) => setNewOption({ ...newOption, per_kg_price: parseInt(e.target.value) || undefined })}
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-navy-700 dark:border-navy-600"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Estimasi Pengiriman</label>
                            <input
                                type="text"
                                value={newOption.estimated_days}
                                onChange={(e) => setNewOption({ ...newOption, estimated_days: e.target.value })}
                                placeholder="Contoh: 3-5 hari, 1-2 hari"
                                className="w-full px-3 py-2 border rounded-lg dark:bg-navy-700 dark:border-navy-600"
                            />
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={addOption}
                                className="flex-1 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600"
                            >
                                Tambah
                            </button>
                            <button
                                onClick={() => setShowAddForm(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 dark:bg-navy-700 dark:text-white"
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Options List */}
            {options.length > 0 && (
                <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Opsi Pengiriman ({options.length})
                    </h3>
                    <div className="space-y-2">
                        {options.map(option => (
                            <div
                                key={option.id}
                                className="flex items-center justify-between p-4 border border-gray-200 dark:border-navy-700 rounded-lg"
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <MdLocalShipping className="w-6 h-6 text-gray-400" />
                                    <div className="flex-1">
                                        <div className="font-medium text-navy-700 dark:text-white">
                                            {option.courier_name} - {option.service_type}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {option.estimated_days}
                                            {productWeight > 0 && (
                                                <span className="ml-2">• Est. Rp {calculatePrice(option).toLocaleString('id-ID')}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-medium">
                                            Rp {option.base_price.toLocaleString('id-ID')}
                                            {option.per_kg_price && <span className="text-gray-500"> + Rp {option.per_kg_price.toLocaleString('id-ID')}/kg</span>}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeOption(option.id)}
                                    className="ml-4 text-red-500 hover:text-red-600"
                                >
                                    <MdDelete className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {options.length === 0 && !showAddForm && (
                <div className="text-center py-8 text-gray-400">
                    Belum ada opsi pengiriman. Tambah menggunakan preset atau custom.
                </div>
            )}
        </div>
    );
}

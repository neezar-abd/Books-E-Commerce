'use client';

import { useState } from 'react';
import { MdAdd, MdDelete, MdEdit } from 'react-icons/md';

interface VariantType {
    id: string;
    name: string; // 'Warna', 'Ukuran', etc
    values: VariantValue[];
}

interface VariantValue {
    id: string;
    value: string; // 'Merah', 'XL', etc
    image?: string;
}

interface VariantCombination {
    id: string;
    combination: Record<string, string>; // { Warna: 'Merah', Ukuran: 'XL' }
    price: number;
    stock: number;
    sku: string;
}

interface VariantsManagerProps {
    onCombinationsChange?: (combinations: VariantCombination[]) => void;
}

export default function VariantsManager({ onCombinationsChange }: VariantsManagerProps) {
    const [variantTypes, setVariantTypes] = useState<VariantType[]>([]);
    const [combinations, setCombinations] = useState<VariantCombination[]>([]);
    const [showAddType, setShowAddType] = useState(false);
    const [newTypeName, setNewTypeName] = useState('');
    const [editingType, setEditingType] = useState<string | null>(null);
    const [newValueInput, setNewValueInput] = useState<Record<string, string>>({});

    // Add new variant type
    const addVariantType = () => {
        if (!newTypeName.trim()) return;

        const newType: VariantType = {
            id: `type-${Date.now()}`,
            name: newTypeName.trim(),
            values: []
        };

        setVariantTypes([...variantTypes, newType]);
        setNewTypeName('');
        setShowAddType(false);
    };

    // Add value to variant type
    const addVariantValue = (typeId: string) => {
        const inputValue = newValueInput[typeId]?.trim();
        if (!inputValue) return;

        setVariantTypes(prev => prev.map(type => {
            if (type.id === typeId) {
                return {
                    ...type,
                    values: [
                        ...type.values,
                        {
                            id: `val-${Date.now()}`,
                            value: inputValue
                        }
                    ]
                };
            }
            return type;
        }));

        setNewValueInput({ ...newValueInput, [typeId]: '' });
        generateCombinations();
    };

    // Remove variant type
    const removeVariantType = (typeId: string) => {
        setVariantTypes(prev => prev.filter(t => t.id !== typeId));
        setCombinations([]);
    };

    // Remove variant value
    const removeVariantValue = (typeId: string, valueId: string) => {
        setVariantTypes(prev => prev.map(type => {
            if (type.id === typeId) {
                return {
                    ...type,
                    values: type.values.filter(v => v.id !== valueId)
                };
            }
            return type;
        }));
        generateCombinations();
    };

    // Generate all combinations
    const generateCombinations = () => {
        if (variantTypes.length === 0 || variantTypes.some(t => t.values.length === 0)) {
            setCombinations([]);
            return;
        }

        // Cartesian product
        const generate = (types: VariantType[], index: number = 0, current: Record<string, string> = {}): VariantCombination[] => {
            if (index === types.length) {
                return [{
                    id: `combo-${Date.now()}-${Math.random()}`,
                    combination: current,
                    price: 0,
                    stock: 0,
                    sku: ''
                }];
            }

            const type = types[index];
            const results: VariantCombination[] = [];

            for (const value of type.values) {
                const newCurrent = { ...current, [type.name]: value.value };
                results.push(...generate(types, index + 1, newCurrent));
            }

            return results;
        };

        const newCombinations = generate(variantTypes);

        // Preserve existing prices/stocks if combination exists
        const updated = newCombinations.map(newCombo => {
            const existing = combinations.find(c =>
                JSON.stringify(c.combination) === JSON.stringify(newCombo.combination)
            );
            return existing || newCombo;
        });

        setCombinations(updated);
        onCombinationsChange?.(updated);
    };

    // Update combination data
    const updateCombination = (id: string, field: 'price' | 'stock' | 'sku', value: any) => {
        setCombinations(prev => prev.map(c =>
            c.id === id ? { ...c, [field]: value } : c
        ));
    };

    // Bulk update price
    const bulkUpdatePrice = (price: number) => {
        setCombinations(prev => prev.map(c => ({ ...c, price })));
    };

    // Bulk update stock
    const bulkUpdateStock = (stock: number) => {
        setCombinations(prev => prev.map(c => ({ ...c, stock })));
    };

    return (
        <div className="space-y-6">
            {/* Variant Types Section */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-navy-700 dark:text-white">Jenis Varian</h3>
                    <button
                        onClick={() => setShowAddType(true)}
                        className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 flex items-center gap-2 text-sm"
                    >
                        <MdAdd /> Tambah Jenis Varian
                    </button>
                </div>

                {/* Add Type Modal */}
                {showAddType && (
                    <div className="mb-4 p-4 border border-brand-500 rounded-lg bg-brand-50 dark:bg-brand-900/20">
                        <label className="block text-sm font-medium mb-2">Nama Varian (Contoh: Warna, Ukuran, Bahan)</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newTypeName}
                                onChange={(e) => setNewTypeName(e.target.value)}
                                placeholder="Masukkan nama varian"
                                className="flex-1 px-3 py-2 border rounded-lg dark:bg-navy-700 dark:border-navy-600"
                                onKeyPress={(e) => e.key === 'Enter' && addVariantType()}
                            />
                            <button
                                onClick={addVariantType}
                                className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600"
                            >
                                Tambah
                            </button>
                            <button
                                onClick={() => setShowAddType(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                )}

                {/* Variant Types List */}
                <div className="space-y-4">
                    {variantTypes.map(type => (
                        <div key={type.id} className="border border-gray-200 dark:border-navy-700 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium text-navy-700 dark:text-white">{type.name}</h4>
                                <button
                                    onClick={() => removeVariantType(type.id)}
                                    className="text-red-500 hover:text-red-600"
                                >
                                    <MdDelete />
                                </button>
                            </div>

                            {/* Values */}
                            <div className="flex flex-wrap gap-2 mb-3">
                                {type.values.map(value => (
                                    <div
                                        key={value.id}
                                        className="px-3 py-1.5 bg-gray-100 dark:bg-navy-700 rounded-full flex items-center gap-2 text-sm"
                                    >
                                        <span>{value.value}</span>
                                        <button
                                            onClick={() => removeVariantValue(type.id, value.id)}
                                            className="text-red-500 hover:text-red-600"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Add Value Input */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newValueInput[type.id] || ''}
                                    onChange={(e) => setNewValueInput({ ...newValueInput, [type.id]: e.target.value })}
                                    placeholder={`Tambah ${type.name.toLowerCase()} baru`}
                                    className="flex-1 px-3 py-2 text-sm border rounded-lg dark:bg-navy-700 dark:border-navy-600"
                                    onKeyPress={(e) => e.key === 'Enter' && addVariantValue(type.id)}
                                />
                                <button
                                    onClick={() => addVariantValue(type.id)}
                                    className="px-4 py-2 bg-gray-200 dark:bg-navy-700 text-gray-700 dark:text-white rounded-lg hover:bg-gray-300 text-sm"
                                >
                                    + Tambah
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {variantTypes.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                        Belum ada varian. Klik "Tambah Jenis Varian" untuk memulai.
                    </div>
                )}
            </div>

            {/* Combinations Table */}
            {combinations.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-navy-700 dark:text-white">
                            Kombinasi Varian ({combinations.length})
                        </h3>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    const price = prompt('Masukkan harga untuk semua kombinasi:');
                                    if (price) bulkUpdatePrice(parseInt(price));
                                }}
                                className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-navy-700 rounded-lg hover:bg-gray-300"
                            >
                                Set Harga Semua
                            </button>
                            <button
                                onClick={() => {
                                    const stock = prompt('Masukkan stok untuk semua kombinasi:');
                                    if (stock) bulkUpdateStock(parseInt(stock));
                                }}
                                className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-navy-700 rounded-lg hover:bg-gray-300"
                            >
                                Set Stok Semua
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border border-gray-200 dark:border-navy-700 rounded-lg">
                            <thead className="bg-gray-50 dark:bg-navy-800">
                                <tr>
                                    {variantTypes.map(type => (
                                        <th key={type.id} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            {type.name}
                                        </th>
                                    ))}
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stok</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-navy-700">
                                {combinations.map(combo => (
                                    <tr key={combo.id} className="hover:bg-gray-50 dark:hover:bg-navy-800">
                                        {variantTypes.map(type => (
                                            <td key={type.id} className="px-4 py-3 text-sm">
                                                {combo.combination[type.name]}
                                            </td>
                                        ))}
                                        <td className="px-4 py-3">
                                            <div className="relative">
                                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">Rp</span>
                                                <input
                                                    type="number"
                                                    value={combo.price || ''}
                                                    onChange={(e) => updateCombination(combo.id, 'price', parseInt(e.target.value) || 0)}
                                                    className="w-28 pl-8 pr-2 py-1.5 text-sm border rounded dark:bg-navy-700 dark:border-navy-600"
                                                />
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="number"
                                                value={combo.stock || ''}
                                                onChange={(e) => updateCombination(combo.id, 'stock', parseInt(e.target.value) || 0)}
                                                className="w-20 px-2 py-1.5 text-sm border rounded dark:bg-navy-700 dark:border-navy-600"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="text"
                                                value={combo.sku || ''}
                                                onChange={(e) => updateCombination(combo.id, 'sku', e.target.value)}
                                                placeholder="Auto"
                                                className="w-32 px-2 py-1.5 text-sm border rounded dark:bg-navy-700 dark:border-navy-600"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

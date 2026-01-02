'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/horizon/card';
import { supabase } from '@/lib/supabase';
import {
  getBannedKeywords,
  addBannedKeyword,
  removeBannedKeyword
} from '@/lib/moderation';
import { motion } from 'framer-motion';
import {
  MdPercent,
  MdWarning,
  MdAdd,
  MdDelete,
  MdSave,
  MdCheckCircle,
  MdError
} from 'react-icons/md';

interface Category {
  id: string;
  name: string;
}

interface BannedKeyword {
  id: string;
  keyword: string;
  severity: 'warning' | 'block' | 'report';
}

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [adminId, setAdminId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Commission settings
  const [globalCommission, setGlobalCommission] = useState<number>(5);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryCommissions, setCategoryCommissions] = useState<Record<string, number>>({});

  // Banned keywords
  const [bannedKeywords, setBannedKeywords] = useState<BannedKeyword[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [newSeverity, setNewSeverity] = useState<'warning' | 'block' | 'report'>('warning');

  useEffect(() => {
    loadData();
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setAdminId(user.id);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      // Load categories
      const { data: cats } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');
      setCategories(cats || []);

      // Load commission settings
      const { data: commissions } = await supabase
        .from('commission_settings')
        .select('*');

      if (commissions) {
        const global = commissions.find(c => c.is_global);
        if (global) setGlobalCommission(global.commission_rate);

        const catComms: Record<string, number> = {};
        commissions.filter(c => c.category_id).forEach(c => {
          catComms[c.category_id!] = c.commission_rate;
        });
        setCategoryCommissions(catComms);
      }

      // Load banned keywords
      const keywords = await getBannedKeywords();
      setBannedKeywords(keywords);

    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveGlobalCommission = async () => {
    try {
      const { data: existing } = await supabase
        .from('commission_settings')
        .select('id')
        .eq('is_global', true)
        .single();

      if (existing) {
        await supabase
          .from('commission_settings')
          .update({ commission_rate: globalCommission })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('commission_settings')
          .insert({ is_global: true, commission_rate: globalCommission });
      }

      setMessage({ type: 'success', text: 'Global commission saved!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const saveCategoryCommission = async (categoryId: string, rate: number) => {
    try {
      const { data: existing } = await supabase
        .from('commission_settings')
        .select('id')
        .eq('category_id', categoryId)
        .single();

      if (existing) {
        await supabase
          .from('commission_settings')
          .update({ commission_rate: rate })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('commission_settings')
          .insert({ category_id: categoryId, commission_rate: rate, is_global: false });
      }

      setCategoryCommissions(prev => ({ ...prev, [categoryId]: rate }));
      setMessage({ type: 'success', text: 'Category commission saved!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const handleAddKeyword = async () => {
    if (!newKeyword.trim() || !adminId) return;

    try {
      await addBannedKeyword(newKeyword, newSeverity, adminId);
      setNewKeyword('');
      loadData();
      setMessage({ type: 'success', text: 'Keyword added!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const handleRemoveKeyword = async (keywordId: string) => {
    if (!adminId) return;

    try {
      await removeBannedKeyword(keywordId, adminId);
      loadData();
      setMessage({ type: 'success', text: 'Keyword removed!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const getSeverityBadge = (severity: string) => {
    const styles: Record<string, string> = {
      warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200',
      block: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200',
      report: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200'
    };
    const labels: Record<string, string> = {
      warning: 'Peringatan',
      block: 'Blokir',
      report: 'Laporan'
    };
    return (
      <span className={`px-2 py-0.5 text-xs rounded-full ${styles[severity]}`}>
        {labels[severity]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}
        >
          {message.type === 'success' ? <MdCheckCircle size={20} /> : <MdError size={20} />}
          {message.text}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Commission Settings */}
        <Card extra="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <MdPercent className="text-green-600 dark:text-green-300" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-navy-700 dark:text-white">Pengaturan Komisi</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Atur persentase komisi platform</p>
            </div>
          </div>

          {/* Global Commission */}
          <div className="mb-6 p-4 bg-lightPrimary dark:bg-navy-700 rounded-lg">
            <label className="block text-sm font-medium text-navy-700 dark:text-white mb-2">
              Komisi Global (%)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={globalCommission}
                onChange={(e) => setGlobalCommission(parseFloat(e.target.value))}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg dark:bg-navy-800 dark:border-navy-600 dark:text-white"
              />
              <button
                onClick={saveGlobalCommission}
                className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 flex items-center gap-2"
              >
                <MdSave size={16} />
                Simpan
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Komisi default untuk semua kategori
            </p>
          </div>

          {/* Per-Category Commission */}
          <div>
            <h3 className="text-sm font-medium text-navy-700 dark:text-white mb-3">Komisi Per Kategori</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {categories.map(category => (
                <div key={category.id} className="flex items-center gap-3">
                  <span className="flex-1 text-sm text-gray-600 dark:text-gray-400">{category.name}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={categoryCommissions[category.id] || globalCommission}
                      onChange={(e) => setCategoryCommissions(prev => ({
                        ...prev,
                        [category.id]: parseFloat(e.target.value)
                      }))}
                      className="w-20 px-2 py-1 text-sm border border-gray-300 rounded dark:bg-navy-800 dark:border-navy-600 dark:text-white"
                    />
                    <span className="text-sm text-gray-500">%</span>
                    <button
                      onClick={() => saveCategoryCommission(
                        category.id,
                        categoryCommissions[category.id] || globalCommission
                      )}
                      className="p-1 text-brand-500 hover:bg-brand-100 dark:hover:bg-nav

y-700 rounded"
                      title="Simpan"
                    >
                      <MdSave size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Banned Keywords */}
        <Card extra="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
              <MdWarning className="text-red-600 dark:text-red-300" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-navy-700 dark:text-white">Kata Kunci Terlarang</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Kata kunci yang otomatis ditandai</p>
            </div>
          </div>

          {/* Add New Keyword */}
          <div className="mb-6 p-4 bg-lightPrimary dark:bg-navy-700 rounded-lg">
            <label className="block text-sm font-medium text-navy-700 dark:text-white mb-2">
              Tambah Kata Kunci Baru
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="Masukkan kata kunci..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg dark:bg-navy-800 dark:border-navy-600 dark:text-white"
              />
              <select
                value={newSeverity}
                onChange={(e) => setNewSeverity(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm dark:bg-navy-800 dark:border-navy-600 dark:text-white"
              >
                <option value="warning">⚠️ Peringatan</option>
                <option value="report">📝 Laporan</option>
                <option value="block">🚫 Blokir</option>
              </select>
              <button
                onClick={handleAddKeyword}
                disabled={!newKeyword.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                <MdAdd size={16} />
                Tambah
              </button>
            </div>
          </div>

          {/* Keywords List */}
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {bannedKeywords.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">Belum ada kata kunci terlarang</p>
            ) : (
              bannedKeywords.map(kw => (
                <div
                  key={kw.id}
                  className="flex items-center justify-between p-3 bg-lightPrimary dark:bg-navy-700 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-navy-700 dark:text-white">{kw.keyword}</span>
                    {getSeverityBadge(kw.severity)}
                  </div>
                  <button
                    onClick={() => handleRemoveKeyword(kw.id)}
                    className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                    title="Hapus"
                  >
                    <MdDelete size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

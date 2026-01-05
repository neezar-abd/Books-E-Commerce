'use client';

import { useState } from 'react';
import { Play, Database, FileJson, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function SyncCategoriesPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [counts, setCounts] = useState<any>(null);

  const handleSync = async () => {
    if (!confirm('Yakin ingin sync semua kategori dari JSON ke database?\n\nIni akan memakan waktu beberapa menit.')) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/sync-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync' }),
      });

      const data = await response.json();
      setResult(data);
      
      // Refresh counts after sync
      await fetchCounts();
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCounts = async () => {
    try {
      const response = await fetch('/api/sync-categories?action=count', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'count' }),
      });
      const data = await response.json();
      setCounts(data.counts);
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  };

  useState(() => {
    fetchCounts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-gray-800">
              Sync Kategori JSON ke Database
            </h1>
          </div>

          <div className="space-y-6">
            {/* Current Counts */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileJson className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">Data JSON</h3>
                </div>
                <p className="text-3xl font-bold text-blue-600">
                  {counts?.json || '-'}
                </p>
                <p className="text-sm text-blue-700">kategori</p>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-green-900">Database</h3>
                </div>
                <p className="text-3xl font-bold text-green-600">
                  {counts?.database || '-'}
                </p>
                <p className="text-sm text-green-700">kategori</p>
              </div>
            </div>

            {/* Sync Button */}
            <div className="border-t pt-6">
              <button
                onClick={handleSync}
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-all flex items-center justify-center gap-3 text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Syncing... Tunggu beberapa menit
                  </>
                ) : (
                  <>
                    <Play className="w-6 h-6" />
                    Mulai Sync Kategori
                  </>
                )}
              </button>
              <p className="text-sm text-gray-500 mt-2 text-center">
                Proses ini akan import semua {counts?.json || 13000}+ kategori dari JSON ke database
              </p>
            </div>

            {/* Result */}
            {result && (
              <div
                className={`border-t pt-6 ${
                  result.success ? 'bg-green-50' : 'bg-red-50'
                } rounded-lg p-6`}
              >
                <div className="flex items-start gap-3">
                  {result.success ? (
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <h3
                      className={`font-bold text-lg mb-2 ${
                        result.success ? 'text-green-900' : 'text-red-900'
                      }`}
                    >
                      {result.success ? 'Sync Berhasil!' : 'Sync Gagal'}
                    </h3>
                    
                    {result.stats && (
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-700">
                          <strong>Total:</strong> {result.stats.total} kategori
                        </p>
                        <p className="text-green-700">
                          <strong>Berhasil:</strong> {result.stats.success} kategori
                        </p>
                        {result.stats.errors > 0 && (
                          <p className="text-red-700">
                            <strong>Error:</strong> {result.stats.errors} kategori
                          </p>
                        )}
                      </div>
                    )}

                    {result.error && (
                      <p className="text-red-700 mt-2">{result.error}</p>
                    )}

                    {result.stats?.errorDetails?.length > 0 && (
                      <details className="mt-3">
                        <summary className="cursor-pointer text-red-700 font-medium">
                          Lihat Error Details
                        </summary>
                        <pre className="mt-2 p-3 bg-red-100 rounded text-xs overflow-auto max-h-60">
                          {JSON.stringify(result.stats.errorDetails, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-800 mb-3">Langkah-langkah:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                <li>Pastikan sudah jalankan migration SQL di Supabase Dashboard terlebih dahulu</li>
                <li>Klik tombol "Mulai Sync Kategori" di atas</li>
                <li>Tunggu proses selesai (bisa 2-5 menit untuk 13000+ data)</li>
                <li>Setelah selesai, kategori akan tersedia di database</li>
                <li>Halaman kategori akan otomatis membaca dari database</li>
              </ol>
            </div>

            {/* SQL Migration Note */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Penting!</h3>
              <p className="text-sm text-yellow-800">
                Sebelum sync, jalankan file SQL ini di Supabase Dashboard → SQL Editor:
              </p>
              <code className="block mt-2 p-2 bg-yellow-100 rounded text-xs">
                supabase/update-categories-hierarchy.sql
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

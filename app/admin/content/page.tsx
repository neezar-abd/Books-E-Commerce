'use client';

import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Save, Image as ImageIcon, Type, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminContent() {
  const [activeTab, setActiveTab] = useState('hero');
  const [isSaving, setIsSaving] = useState(false);

  // Hero Section
  const [heroData, setHeroData] = useState({
    title: 'Discover Your Next Great Read',
    subtitle: 'Explore thousands of books across all genres',
    image: '/images/hero-bg.jpg',
    cta_text: 'Shop Now',
    cta_link: '/products',
  });

  // Flash Sale
  const [flashSaleData, setFlashSaleData] = useState({
    enabled: true,
    title: 'Flash Sale',
    discount: '50',
    end_date: '2025-12-31',
  });

  // Deals Section
  const [dealsData, setDealsData] = useState({
    title: 'Special Deals',
    description: 'Limited time offers on selected books',
  });

  const handleSave = async (section: string) => {
    setIsSaving(true);
    try {
      // Simulate API call - In real app, save to database
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert(`${section} content saved successfully!`);
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Failed to save content');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'hero', label: 'Hero Section', icon: ImageIcon },
    { id: 'flash-sale', label: 'Flash Sale', icon: Tag },
    { id: 'deals', label: 'Deals', icon: Type },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-600 mt-2">
            Manage website content and promotional sections
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex border-b border-gray-100 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon size={20} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="p-6">
            {/* Hero Section */}
            {activeTab === 'hero' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hero Title
                  </label>
                  <input
                    type="text"
                    value={heroData.title}
                    onChange={(e) =>
                      setHeroData({ ...heroData, title: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hero Subtitle
                  </label>
                  <input
                    type="text"
                    value={heroData.subtitle}
                    onChange={(e) =>
                      setHeroData({ ...heroData, subtitle: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Background Image URL
                  </label>
                  <input
                    type="text"
                    value={heroData.image}
                    onChange={(e) =>
                      setHeroData({ ...heroData, image: e.target.value })
                    }
                    placeholder="https://..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CTA Button Text
                    </label>
                    <input
                      type="text"
                      value={heroData.cta_text}
                      onChange={(e) =>
                        setHeroData({ ...heroData, cta_text: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CTA Link
                    </label>
                    <input
                      type="text"
                      value={heroData.cta_link}
                      onChange={(e) =>
                        setHeroData({ ...heroData, cta_link: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleSave('Hero Section')}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Save size={20} />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </motion.div>
            )}

            {/* Flash Sale */}
            {activeTab === 'flash-sale' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={flashSaleData.enabled}
                      onChange={(e) =>
                        setFlashSaleData({
                          ...flashSaleData,
                          enabled: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Enable Flash Sale
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Flash Sale Title
                  </label>
                  <input
                    type="text"
                    value={flashSaleData.title}
                    onChange={(e) =>
                      setFlashSaleData({ ...flashSaleData, title: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Percentage
                  </label>
                  <input
                    type="number"
                    value={flashSaleData.discount}
                    onChange={(e) =>
                      setFlashSaleData({
                        ...flashSaleData,
                        discount: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={flashSaleData.end_date}
                    onChange={(e) =>
                      setFlashSaleData({
                        ...flashSaleData,
                        end_date: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={() => handleSave('Flash Sale')}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Save size={20} />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </motion.div>
            )}

            {/* Deals Section */}
            {activeTab === 'deals' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deals Title
                  </label>
                  <input
                    type="text"
                    value={dealsData.title}
                    onChange={(e) =>
                      setDealsData({ ...dealsData, title: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={dealsData.description}
                    onChange={(e) =>
                      setDealsData({ ...dealsData, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={() => handleSave('Deals Section')}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Save size={20} />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Changes made here will be reflected on the main
            website. Make sure to review your changes before saving.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}

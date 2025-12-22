'use client';

import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Save, Settings as SettingsIcon, Mail, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    site_name: 'Lumina Books',
    site_tagline: 'Your Premier Online Bookstore',
    contact_email: 'info@luminabooks.com',
    contact_phone: '+62 812-3456-7890',
    address: 'Jakarta, Indonesia',
  });

  // Shipping Settings
  const [shippingSettings, setShippingSettings] = useState({
    free_shipping_threshold: '500000',
    flat_rate_shipping: '15000',
    estimated_delivery: '3-5 working days',
  });

  // Payment Settings
  const [paymentSettings, setPaymentSettings] = useState({
    cod_enabled: true,
    bank_transfer_enabled: true,
    ewallet_enabled: true,
  });

  const handleSave = async (section: string) => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert(`${section} settings saved successfully!`);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'shipping', label: 'Shipping', icon: Globe },
    { id: 'payment', label: 'Payment', icon: Mail },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your store settings and configurations
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
            {/* General Settings */}
            {activeTab === 'general' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site Name
                  </label>
                  <input
                    type="text"
                    value={generalSettings.site_name}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        site_name: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site Tagline
                  </label>
                  <input
                    type="text"
                    value={generalSettings.site_tagline}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        site_tagline: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={generalSettings.contact_email}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          contact_email: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={generalSettings.contact_phone}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          contact_phone: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    value={generalSettings.address}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        address: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={() => handleSave('General')}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Save size={20} />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </motion.div>
            )}

            {/* Shipping Settings */}
            {activeTab === 'shipping' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Free Shipping Threshold (IDR)
                  </label>
                  <input
                    type="number"
                    value={shippingSettings.free_shipping_threshold}
                    onChange={(e) =>
                      setShippingSettings({
                        ...shippingSettings,
                        free_shipping_threshold: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Orders above this amount get free shipping
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Flat Rate Shipping (IDR)
                  </label>
                  <input
                    type="number"
                    value={shippingSettings.flat_rate_shipping}
                    onChange={(e) =>
                      setShippingSettings({
                        ...shippingSettings,
                        flat_rate_shipping: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Delivery Time
                  </label>
                  <input
                    type="text"
                    value={shippingSettings.estimated_delivery}
                    onChange={(e) =>
                      setShippingSettings({
                        ...shippingSettings,
                        estimated_delivery: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={() => handleSave('Shipping')}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Save size={20} />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </motion.div>
            )}

            {/* Payment Settings */}
            {activeTab === 'payment' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={paymentSettings.cod_enabled}
                      onChange={(e) =>
                        setPaymentSettings({
                          ...paymentSettings,
                          cod_enabled: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Cash on Delivery (COD)
                      </span>
                      <p className="text-xs text-gray-500">
                        Allow customers to pay when they receive the order
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={paymentSettings.bank_transfer_enabled}
                      onChange={(e) =>
                        setPaymentSettings({
                          ...paymentSettings,
                          bank_transfer_enabled: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Bank Transfer
                      </span>
                      <p className="text-xs text-gray-500">
                        Direct bank transfer payment method
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={paymentSettings.ewallet_enabled}
                      onChange={(e) =>
                        setPaymentSettings({
                          ...paymentSettings,
                          ewallet_enabled: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        E-Wallet (GoPay, OVO, Dana)
                      </span>
                      <p className="text-xs text-gray-500">
                        Digital wallet payment options
                      </p>
                    </div>
                  </label>
                </div>

                <button
                  onClick={() => handleSave('Payment')}
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
      </div>
    </AdminLayout>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Widget from '@/components/horizon/widget/Widget';
import Card from '@/components/horizon/card';
import { getAllUsers, updateUserRole } from '@/lib/admin';
import { MdSearch, MdPeople, MdAdminPanelSettings, MdFileDownload, MdPerson } from 'react-icons/md';
import { motion } from 'framer-motion';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm]);

  const loadUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
    if (!confirm(`Change role to ${newRole}?`)) return;

    try {
      await updateUserRole(userId, newRole);
      alert('Role updated!');
      loadUsers();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to update role');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleExport = async () => {
    // TODO: Fix export implementation
    console.log('Export users');
  };

  const adminCount = users.filter(u => u.role === 'admin').length;
  const userCount = users.filter(u => !u.role || u.role === 'user').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Stats */}
      <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2">
        <Widget icon={<MdPeople className="h-6 w-6" />} title="Total Users" subtitle={users.length} />
        <Widget icon={<MdAdminPanelSettings className="h-6 w-6" />} title="Superadmins" subtitle={adminCount} />
      </div>

      {/* Filters + Actions */}
      <Card extra="mt-5 p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users by name or phone..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg dark:bg-navy-700 dark:border-navy-600 dark:text-white"
            />
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <MdFileDownload /> Export Excel
          </button>
        </div>
        <div className="mt-4 text-sm text-brand-500 dark:text-brand-400">
          Total: {filteredUsers.length} users
        </div>
      </Card>

      {/* Users Grid */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredUsers.map((user) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card extra="p-6">
              {/* User Avatar */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.full_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold">
                      {user.full_name?.charAt(0).toUpperCase() || 'N'}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-navy-700 dark:text-white">
                      {user.full_name || 'N/A'}
                    </h3>
                    <span
                      className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'admin'
                        ? 'bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-navy-700 dark:text-gray-300'
                        }`}
                    >
                      {user.role || 'user'}
                    </span>
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div className="space-y-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <MdPerson className="h-4 w-4" />
                  <span>Joined: {formatDate(user.created_at)}</span>
                </div>
              </div>

              {/* Role Change */}
              <div className="pt-4 border-t border-gray-200 dark:border-navy-700">
                <label className="block text-sm font-medium text-navy-700 dark:text-white mb-2">
                  User Role
                </label>
                <select
                  value={user.role || 'user'}
                  onChange={(e) => handleRoleChange(user.id, e.target.value as 'user' | 'admin')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-navy-700 dark:border-navy-600 dark:text-white text-sm"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </Card>
          </motion.div>
        ))}

        {filteredUsers.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            No users found
          </div>
        )}
      </div>
    </div>
  );
}

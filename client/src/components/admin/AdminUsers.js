import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Spinner from '../ui/Spinner';
import toast from 'react-hot-toast';

const ROLE_STYLE = {
  admin: 'bg-purple-100 text-purple-700',
  delivery: 'bg-blue-100 text-blue-700',
  user: 'bg-green-100 text-green-700',
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [editing, setEditing] = useState(null);

  useEffect(() => { fetchUsers(); }, [roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/users', { params: { role: roleFilter || undefined } });
      setUsers(data);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  const updateUser = async (id, updates) => {
    try {
      await api.put(`/admin/users/${id}`, updates);
      toast.success('User updated');
      setEditing(null);
      fetchUsers();
    } catch { toast.error('Failed to update user'); }
  };

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">Users & Customers</h1>
          <p className="text-sm text-gray-500">{users.length} total users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-3">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 Search by name or email..." className="input flex-1" />
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="input w-auto">
          <option value="">All Roles</option>
          <option value="user">Customers</option>
          <option value="delivery">Delivery</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Role summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { role: 'user', label: 'Customers', icon: '👤' },
          { role: 'delivery', label: 'Delivery', icon: '🚚' },
          { role: 'admin', label: 'Admins', icon: '🔑' },
        ].map(({ role, label, icon }) => (
          <div key={role} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
            <div className="text-2xl mb-1">{icon}</div>
            <div className="text-xl font-bold">{users.filter((u) => u.role === role).length}</div>
            <div className="text-xs text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                {['User', 'Email', 'Role', 'Diet', 'Status', 'Joined', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No users found</td></tr>
              ) : filtered.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {u.name[0].toUpperCase()}
                      </div>
                      <span className="font-medium">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-500">{u.email}</td>
                  <td className="px-5 py-4">
                    {editing === u._id ? (
                      <select defaultValue={u.role} id={`role-${u._id}`} className="input py-1 text-xs w-28">
                        <option value="user">user</option>
                        <option value="delivery">delivery</option>
                        <option value="admin">admin</option>
                      </select>
                    ) : (
                      <span className={`badge capitalize ${ROLE_STYLE[u.role]}`}>{u.role}</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-gray-500 capitalize">{u.preferences?.diet || 'none'}</td>
                  <td className="px-5 py-4">
                    <span className={`badge ${u.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {u.isActive !== false ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-4">
                    {editing === u._id ? (
                      <div className="flex gap-2">
                        <button onClick={() => {
                          const role = document.getElementById(`role-${u._id}`).value;
                          updateUser(u._id, { role, isActive: u.isActive !== false });
                        }} className="text-xs bg-green-50 text-green-600 px-3 py-1.5 rounded-lg hover:bg-green-100 font-medium">Save</button>
                        <button onClick={() => setEditing(null)} className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-200 font-medium">Cancel</button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button onClick={() => setEditing(u._id)} className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 font-medium">Edit Role</button>
                        <button onClick={() => updateUser(u._id, { role: u.role, isActive: !(u.isActive !== false) })}
                          className={`text-xs px-3 py-1.5 rounded-lg font-medium ${u.isActive !== false ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                          {u.isActive !== false ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

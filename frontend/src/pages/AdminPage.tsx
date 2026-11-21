import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../services/api';
import { AdminStats, User } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  Shield,
  Users,
  Database,
  RefreshCw,
  Trash2,
  CheckCircle2,
  XCircle,
  Activity,
  Layers,
  Search,
  Key,
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { success, error, warning } = useToast();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshingCache, setRefreshingCache] = useState<boolean>(false);
  const [userSearch, setUserSearch] = useState<string>('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!isAdmin) {
      warning('Access restricted. Admin authorization required.');
      navigate('/dashboard');
      return;
    }

    loadAdminData();
  }, [user, isAdmin, navigate]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsData, usersData] = await Promise.all([
        adminApi.getStats(),
        adminApi.getUsers(1, 25, userSearch),
      ]);
      setStats(statsData);
      setUsersList(usersData.users);
    } catch (err: any) {
      error(err.message || 'Failed to load administrator data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshCache = async () => {
    try {
      setRefreshingCache(true);
      const message = await adminApi.refreshCache();
      success(message || 'Country cache updated from external provider.');
      loadAdminData();
    } catch (err: any) {
      error(err.message || 'Failed to refresh cache');
    } finally {
      setRefreshingCache(false);
    }
  };

  const handleClearCache = async () => {
    if (!window.confirm('Clear all cached country records from MongoDB? Next request will re-fetch.')) {
      return;
    }
    try {
      const msg = await adminApi.clearCache();
      success(msg || 'Cache cleared.');
      loadAdminData();
    } catch (err: any) {
      error(err.message);
    }
  };

  const handleToggleUserRole = async (targetUser: User) => {
    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    try {
      await adminApi.updateUser(targetUser.id || (targetUser as any)._id, { role: newRole });
      success(`Updated ${targetUser.username}'s role to ${newRole}.`);
      loadAdminData();
    } catch (err: any) {
      error(err.message);
    }
  };

  const handleToggleUserStatus = async (targetUser: User) => {
    const newStatus = !targetUser.isActive;
    try {
      await adminApi.updateUser(targetUser.id || (targetUser as any)._id, { isActive: newStatus });
      success(`Account ${targetUser.username} set to ${newStatus ? 'Active' : 'Deactivated'}.`);
      loadAdminData();
    } catch (err: any) {
      error(err.message);
    }
  };

  const handleDeleteUser = async (targetUser: User) => {
    if (targetUser.email === 'admin@opendata.com') {
      warning('Primary administrator account cannot be deleted.');
      return;
    }
    if (!window.confirm(`Permanently delete account for ${targetUser.username}?`)) {
      return;
    }
    try {
      await adminApi.deleteUser(targetUser.id || (targetUser as any)._id);
      success(`User ${targetUser.username} deleted.`);
      loadAdminData();
    } catch (err: any) {
      error(err.message);
    }
  };

  if (!isAdmin) return null;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <span className="badge badge-amber">System Administration</span>
          </div>
          <h1 className="page-title">Administrator Governance Console</h1>
          <p className="page-subtitle">
            System telemetry, user management, and MongoDB caching maintenance.
          </p>
        </div>
      </div>

      {loading && !stats ? (
        <LoadingSpinner message="Loading telemetry & cache metadata..." />
      ) : (
        <>
          {/* Telemetry Stats Grid */}
          {stats && (
            <div className="grid-4" style={{ marginBottom: '2rem' }}>
              <div className="stat-card">
                <div className="stat-icon stat-icon-indigo">
                  <Users size={24} />
                </div>
                <div>
                  <div className="stat-value">{stats.users.total}</div>
                  <div className="stat-label">Registered Accounts</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon stat-icon-cyan">
                  <Activity size={24} />
                </div>
                <div>
                  <div className="stat-value">{stats.searches.total}</div>
                  <div className="stat-label">Total Searches Logged</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon stat-icon-emerald">
                  <Database size={24} />
                </div>
                <div>
                  <div className="stat-value">{stats.cache.activeRecords}</div>
                  <div className="stat-label">Cached Countries (MongoDB)</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon stat-icon-amber">
                  <Shield size={24} />
                </div>
                <div>
                  <div className="stat-value">{stats.users.admins}</div>
                  <div className="stat-label">System Administrators</div>
                </div>
              </div>
            </div>
          )}

          {/* Cache Operations Panel */}
          {stats && (
            <div className="card" style={{ padding: '1.75rem', marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div className="stat-icon stat-icon-emerald" style={{ width: '40px', height: '40px' }}>
                    <Database size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>MongoDB Cache Management</h3>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                      Reduces external API latencies and guarantees offline resilience
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={handleRefreshCache}
                    disabled={refreshingCache}
                    className="btn btn-primary btn-sm"
                  >
                    <RefreshCw size={14} className={refreshingCache ? 'spinner' : ''} />
                    {refreshingCache ? 'Refreshing...' : 'Force Refresh Cache'}
                  </button>
                  <button onClick={handleClearCache} className="btn btn-secondary btn-sm">
                    <Trash2 size={14} /> Clear Cache
                  </button>
                </div>
              </div>

              <div className="grid-3" style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cache TTL Expiry:</span>
                  <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>
                    {stats.cache.ttlMinutes} Minutes
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Last Cache Sync:</span>
                  <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>
                    {stats.cache.lastCachedAt ? new Date(stats.cache.lastCachedAt).toLocaleString() : 'Never'}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cache Health:</span>
                  <div style={{ fontWeight: 600, color: 'var(--accent-emerald)', fontSize: '0.95rem' }}>
                    Active &bull; {stats.cache.activeRecords} Live Records
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* User Management Table */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Users size={22} color="var(--primary-light)" />
                <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>User Accounts Governance</h3>
              </div>

              <div style={{ position: 'relative', width: '260px' }}>
                <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Filter users..."
                  value={userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') loadAdminData();
                  }}
                  className="input"
                  style={{ paddingLeft: '2.25rem', padding: '0.45rem 0.75rem 0.45rem 2.25rem', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email Address</th>
                    <th>Role</th>
                    <th>Account Status</th>
                    <th>Registered</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((u) => {
                    const id = u.id || (u as any)._id;
                    return (
                      <tr key={id}>
                        <td>
                          <strong style={{ color: '#fff' }}>{u.username}</strong>
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                        <td>
                          <span
                            className={`badge ${u.role === 'admin' ? 'badge-amber' : 'badge-primary'}`}
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleToggleUserRole(u)}
                            title="Click to toggle user/admin role"
                          >
                            {u.role}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${u.isActive ? 'badge-emerald' : 'badge-rose'}`}
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleToggleUserStatus(u)}
                            title="Click to toggle active/deactivated"
                          >
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                            <button
                              onClick={() => handleToggleUserRole(u)}
                              className="btn btn-secondary btn-icon btn-sm"
                              title="Toggle User/Admin Role"
                            >
                              <Key size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u)}
                              className="btn btn-danger btn-icon btn-sm"
                              title="Delete Account"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

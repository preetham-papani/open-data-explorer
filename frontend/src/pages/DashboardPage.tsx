import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { savedApi, historyApi } from '../services/api';
import { SavedItem, SearchHistoryItem } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  Compass,
  CloudSun,
  Coins,
  Bookmark,
  History,
  TrendingUp,
  User,
  ArrowRight,
  Clock,
  Layers,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [historyItems, setHistoryItems] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        const [saved, history] = await Promise.all([
          savedApi.getSaved(),
          historyApi.getHistory(undefined, 10),
        ]);
        setSavedItems(saved);
        setHistoryItems(history);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, navigate]);

  if (!user) return null;

  // Calculate search distribution
  const countrySearches = historyItems.filter((i) => i.type === 'country').length;
  const weatherSearches = historyItems.filter((i) => i.type === 'weather').length;
  const currencySearches = historyItems.filter((i) => i.type === 'currency').length;

  const chartData = [
    { name: 'Countries', value: countrySearches || 1, color: '#6366f1' },
    { name: 'Weather', value: weatherSearches || 1, color: '#06b6d4' },
    { name: 'Currencies', value: currencySearches || 1, color: '#10b981' },
  ];

  return (
    <div>
      {/* Header Banner */}
      <div
        className="card"
        style={{
          padding: '2rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(16, 22, 35, 0.95), rgba(30, 41, 59, 0.9))',
          border: '1px solid var(--border-glow)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span className={`badge ${user.role === 'admin' ? 'badge-amber' : 'badge-primary'}`}>
                {user.role.toUpperCase()}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Active Session</span>
            </div>
            <h1 style={{ fontSize: '1.85rem', color: '#fff', fontWeight: 700 }}>
              Welcome back, {user.username}!
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Your personal Open Data Explorer central command center and saved queries.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/countries" className="btn btn-primary btn-sm">
              <Compass size={15} /> Explore Data
            </Link>
            <Link to="/saved" className="btn btn-secondary btn-sm">
              <Bookmark size={15} /> Favourites ({savedItems.length})
            </Link>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Aggregating user telemetry & search history..." />
      ) : (
        <>
          {/* Quick Stats Grid */}
          <div className="grid-4" style={{ marginBottom: '2rem' }}>
            <div className="stat-card">
              <div className="stat-icon stat-icon-indigo">
                <History size={24} />
              </div>
              <div>
                <div className="stat-value">{historyItems.length}</div>
                <div className="stat-label">Total Recent Searches</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-cyan">
                <Bookmark size={24} />
              </div>
              <div>
                <div className="stat-value">{savedItems.length}</div>
                <div className="stat-label">Saved Favourites</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-emerald">
                <Compass size={24} />
              </div>
              <div>
                <div className="stat-value">
                  {savedItems.filter((i) => i.itemType === 'country').length}
                </div>
                <div className="stat-label">Saved Countries</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-amber">
                <CloudSun size={24} />
              </div>
              <div>
                <div className="stat-value">
                  {savedItems.filter((i) => i.itemType === 'weather').length}
                </div>
                <div className="stat-label">Saved Cities</div>
              </div>
            </div>
          </div>

          {/* Activity Breakdown & Saved Items */}
          <div className="grid-2" style={{ gap: '2rem', marginBottom: '2.5rem' }}>
            {/* Chart Card */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '1.25rem' }}>
                Search Activity Breakdown
              </h3>
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--bg-tertiary)',
                        borderColor: 'var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        color: '#fff',
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Searches List */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.15rem', color: '#fff' }}>Recent Search History</h3>
                <Link to="/history" style={{ fontSize: '0.85rem', color: 'var(--primary-light)', fontWeight: 600 }}>
                  View All &rarr;
                </Link>
              </div>

              {historyItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                  No recent searches logged yet. Start exploring countries or weather!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {historyItems.slice(0, 5).map((item) => (
                    <div
                      key={item._id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <span
                          className={`badge ${
                            item.type === 'country'
                              ? 'badge-primary'
                              : item.type === 'weather'
                              ? 'badge-cyan'
                              : 'badge-emerald'
                          }`}
                        >
                          {item.type}
                        </span>
                        <strong style={{ color: '#fff', fontSize: '0.9rem' }}>{item.query}</strong>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { historyApi } from '../services/api';
import { SearchHistoryItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { History, Trash2, Clock, Search, ShieldAlert } from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<string>('all');

  const fetchHistory = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      setLoading(true);
      const data = await historyApi.getHistory(filterType === 'all' ? undefined : filterType);
      setHistory(data);
    } catch (err: any) {
      error(err.message || 'Failed to retrieve search history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user, filterType]);

  const handleDeleteItem = async (id: string) => {
    try {
      await historyApi.deleteHistory(id);
      setHistory((prev) => prev.filter((item) => item._id !== id));
      success('History entry removed.');
    } catch (err: any) {
      error(err.message);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to permanently clear your entire search history?')) {
      return;
    }
    try {
      await historyApi.clearAll();
      setHistory([]);
      success('Your search history has been cleared.');
    } catch (err: any) {
      error(err.message);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Search History & Telemetry</h1>
          <p className="page-subtitle">
            Audit your past search queries across Countries, Weather, and Currencies.
          </p>
        </div>

        {history.length > 0 && (
          <button onClick={handleClearAll} className="btn btn-danger btn-sm">
            <Trash2 size={15} /> Clear All History
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {[
          { id: 'all', label: 'All History' },
          { id: 'country', label: 'Countries' },
          { id: 'weather', label: 'Weather Cities' },
          { id: 'currency', label: 'Currency Calculations' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`btn btn-sm ${filterType === tab.id ? 'btn-primary' : 'btn-secondary'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner message="Loading search records..." />
      ) : history.length === 0 ? (
        <EmptyState
          title="No search history found"
          description="Your search queries across countries and weather will automatically appear here."
          actionText="Search Countries"
          onAction={() => navigate('/countries')}
          icon={<History size={28} />}
        />
      ) : (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Search Query</th>
                  <th>Metadata / Details</th>
                  <th>Recorded At</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item._id}>
                    <td>
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
                    </td>
                    <td>
                      <strong style={{ color: '#fff' }}>{item.query}</strong>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {item.metadata ? JSON.stringify(item.metadata).slice(0, 60) : '—'}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {new Date(item.createdAt).toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleDeleteItem(item._id)}
                        className="btn btn-danger btn-icon btn-sm"
                        title="Delete log"
                      >
                        <Trash2 size={13} />
                      </button>
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
};

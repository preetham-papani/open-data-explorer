import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { savedApi } from '../services/api';
import { SavedItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import {
  Bookmark,
  Trash2,
  Compass,
  CloudSun,
  Coins,
  ExternalLink,
} from 'lucide-react';

export const SavedItemsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<string>('all');

  const fetchSaved = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      setLoading(true);
      const data = await savedApi.getSaved(filterType === 'all' ? undefined : filterType);
      setItems(data);
    } catch (err: any) {
      error(err.message || 'Failed to fetch favourites');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, [user, filterType]);

  const handleDelete = async (id: string, title: string) => {
    try {
      await savedApi.deleteSaved(id);
      setItems((prev) => prev.filter((item) => item._id !== id));
      success(`'${title}' removed from your favourites.`);
    } catch (err: any) {
      error(err.message || 'Failed to delete saved item');
    }
  };

  const handleItemClick = (item: SavedItem) => {
    if (item.itemType === 'country') {
      navigate(`/compare?first=${item.itemId}`);
    } else if (item.itemType === 'weather') {
      navigate('/weather');
    } else if (item.itemType === 'currency') {
      navigate('/currency');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Saved Favourites</h1>
          <p className="page-subtitle">
            Manage your bookmarked countries, pinned weather cities, and tracked foreign currency pairs.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {[
          { id: 'all', label: 'All Items' },
          { id: 'country', label: 'Countries' },
          { id: 'weather', label: 'Weather Cities' },
          { id: 'currency', label: 'Currency Pairs' },
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
        <LoadingSpinner message="Loading your favourites..." />
      ) : items.length === 0 ? (
        <EmptyState
          title="No saved items yet"
          description="Explore countries, weather, or currencies and click 'Save' or the bookmark icon to keep them here!"
          actionText="Explore Countries"
          onAction={() => navigate('/countries')}
          icon={<Bookmark size={28} />}
        />
      ) : (
        <div className="grid-cards">
          {items.map((item) => (
            <div key={item._id} className="card card-interactive" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                <span
                  className={`badge ${
                    item.itemType === 'country'
                      ? 'badge-primary'
                      : item.itemType === 'weather'
                      ? 'badge-cyan'
                      : 'badge-emerald'
                  }`}
                >
                  {item.itemType}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item._id, item.title);
                  }}
                  className="btn btn-danger btn-icon btn-sm"
                  title="Remove from favourites"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.35rem' }}>{item.title}</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', flex: 1 }}>
                {item.subtitle}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>Saved on {new Date(item.createdAt).toLocaleDateString()}</span>
                <button
                  onClick={() => handleItemClick(item)}
                  className="btn btn-outline btn-sm"
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                >
                  <ExternalLink size={12} /> View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

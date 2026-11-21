import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { countryApi, savedApi } from '../services/api';
import { Country } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import {
  Search,
  Filter,
  ArrowUpDown,
  Bookmark,
  Scale,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
  Users,
  MapPin,
  Coins,
  Globe,
} from 'lucide-react';

export const CountriesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error, warning } = useToast();

  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [region, setRegion] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Selected Country for Modal Details
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

  const fetchCountries = useCallback(async () => {
    try {
      setLoading(true);
      const res = await countryApi.getCountries({
        page,
        limit: 12,
        search,
        region,
        sortBy,
        sortOrder,
      });

      setCountries(res.countries);
      if (res.meta) {
        setTotalPages(res.meta.totalPages || 1);
        setTotalCount(res.meta.total || 0);
      }
    } catch (err: any) {
      error(err.message || 'Failed to load countries');
    } finally {
      setLoading(false);
    }
  }, [page, search, region, sortBy, sortOrder, error]);

  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCountries();
  };

  const handleSaveCountry = async (country: Country, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      warning('Please log in to save countries to your favourites!');
      navigate('/login');
      return;
    }

    try {
      await savedApi.saveItem({
        itemType: 'country',
        itemId: country.cca3,
        title: country.name,
        subtitle: `${country.region} • Capital: ${country.capital?.join(', ') || 'N/A'}`,
        data: {
          cca2: country.cca2,
          cca3: country.cca3,
          population: country.population,
          flag: country.flag,
          flagPng: country.flags.png,
        },
      });
      success(`${country.name} saved to your favourites!`);
    } catch (err: any) {
      error(err.message || 'Failed to save country');
    }
  };

  const handleCompareClick = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/compare?first=${code}`);
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Country Data Explorer</h1>
          <p className="page-subtitle">
            Search, filter, and inspect demographic and geographic data for {totalCount > 0 ? `${totalCount} countries` : 'global nations'} stored in MongoDB cache.
          </p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.25rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search Box */}
          <div style={{ flex: '1 1 260px', position: 'relative' }}>
            <Search
              size={18}
              style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              placeholder="Search by name, capital, or code (e.g. India, IN, Tokyo)..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="input"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          {/* Region Filter */}
          <div style={{ flex: '0 1 180px' }}>
            <select
              value={region}
              onChange={(e) => {
                setRegion(e.target.value);
                setPage(1);
              }}
              className="select"
            >
              <option value="">All Regions</option>
              <option value="Africa">Africa</option>
              <option value="Americas">Americas</option>
              <option value="Asia">Asia</option>
              <option value="Europe">Europe</option>
              <option value="Oceania">Oceania</option>
              <option value="Polar">Polar / Antarctic</option>
            </select>
          </div>

          {/* Sort Selector */}
          <div style={{ flex: '0 1 200px' }}>
            <select
              value={`${sortBy}_${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('_');
                setSortBy(sb);
                setSortOrder(so as 'asc' | 'desc');
                setPage(1);
              }}
              className="select"
            >
              <option value="name_asc">Name (A &rarr; Z)</option>
              <option value="name_desc">Name (Z &rarr; A)</option>
              <option value="population_desc">Population (Highest First)</option>
              <option value="population_asc">Population (Lowest First)</option>
              <option value="area_desc">Land Area (Largest First)</option>
            </select>
          </div>

          {/* Submit / Reset Buttons */}
          <button type="submit" className="btn btn-primary">
            <Search size={16} /> Search
          </button>
          {(search || region) && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setRegion('');
                setPage(1);
              }}
              className="btn btn-secondary"
            >
              Reset
            </button>
          )}
        </form>
      </div>

      {/* Main Countries Grid */}
      {loading ? (
        <LoadingSpinner message="Querying country database & cache..." />
      ) : countries.length === 0 ? (
        <EmptyState
          title="No countries matched your query"
          description="Try clearing your search terms or selecting 'All Regions'."
          actionText="Clear Filters"
          onAction={() => {
            setSearch('');
            setRegion('');
            setPage(1);
          }}
        />
      ) : (
        <>
          <div className="grid-cards">
            {countries.map((c) => (
              <div
                key={c.cca3}
                className="card card-interactive"
                onClick={() => setSelectedCountry(c)}
                style={{ display: 'flex', flexDirection: 'column' }}
              >
                {/* Flag Header */}
                <div
                  style={{
                    height: '140px',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    marginBottom: '1rem',
                    background: 'var(--bg-tertiary)',
                    position: 'relative',
                  }}
                >
                  <img
                    src={c.flags.png || c.flags.svg}
                    alt={c.flags.alt || `Flag of ${c.name}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    loading="lazy"
                    onError={(e) => {
                      // Fallback if flag fails
                      (e.target as HTMLImageElement).src = `https://flagcdn.com/w320/${c.cca2.toLowerCase()}.png`;
                    }}
                  />
                  <span
                    className="badge badge-primary"
                    style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', backdropFilter: 'blur(8px)' }}
                  >
                    {c.cca3}
                  </span>
                </div>

                {/* Country Name */}
                <div style={{ marginBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.2rem' }}>{c.name}</h3>
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                    {c.officialName && c.officialName !== c.name ? c.officialName : c.region}
                  </div>
                </div>

                {/* Quick Info Grid */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={15} color="var(--primary-light)" />
                    <span><strong>Capital:</strong> {c.capital?.join(', ') || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Globe size={15} color="var(--accent-cyan)" />
                    <span><strong>Region:</strong> {c.region} ({c.subregion || 'General'})</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={15} color="var(--accent-emerald)" />
                    <span><strong>Population:</strong> {c.population.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Coins size={15} color="var(--accent-amber)" />
                    <span>
                      <strong>Currency:</strong>{' '}
                      {Object.keys(c.currencies || {}).length > 0
                        ? Object.keys(c.currencies).join(', ')
                        : 'None'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem' }}>
                  <button
                    onClick={(e) => handleSaveCountry(c, e)}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1 }}
                    title="Bookmark Country"
                  >
                    <Bookmark size={14} /> Save
                  </button>
                  <button
                    onClick={(e) => handleCompareClick(c.cca2, e)}
                    className="btn btn-outline btn-sm"
                    style={{ flex: 1 }}
                    title="Compare with another country"
                  >
                    <Scale size={14} /> Compare
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '0.75rem',
                marginTop: '2.5rem',
              }}
            >
              <button
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="btn btn-secondary btn-sm"
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Page <strong style={{ color: '#fff' }}>{page}</strong> of{' '}
                <strong style={{ color: '#fff' }}>{totalPages}</strong> ({totalCount} total)
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                className="btn btn-secondary btn-sm"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Country Detail Modal */}
      {selectedCountry && (
        <div className="modal-backdrop" onClick={() => setSelectedCountry(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedCountry(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              <X size={22} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
              <img
                src={selectedCountry.flags.png}
                alt={selectedCountry.name}
                style={{ width: '80px', height: '52px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
              />
              <div>
                <h2 style={{ fontSize: '1.5rem', color: '#fff' }}>{selectedCountry.name}</h2>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {selectedCountry.officialName}
                </div>
              </div>
            </div>

            <div className="grid-2" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="card" style={{ padding: '1rem' }}>
                <span className="stat-label">Capital City</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff' }}>
                  {selectedCountry.capital?.join(', ') || 'N/A'}
                </div>
              </div>
              <div className="card" style={{ padding: '1rem' }}>
                <span className="stat-label">Population</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--accent-emerald)' }}>
                  {selectedCountry.population.toLocaleString()}
                </div>
              </div>
              <div className="card" style={{ padding: '1rem' }}>
                <span className="stat-label">Region & Subregion</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff' }}>
                  {selectedCountry.region} - {selectedCountry.subregion || 'N/A'}
                </div>
              </div>
              <div className="card" style={{ padding: '1rem' }}>
                <span className="stat-label">Total Land Area</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                  {selectedCountry.area ? `${selectedCountry.area.toLocaleString()} sq km` : 'N/A'}
                </div>
              </div>
            </div>

            {/* Extended Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              <div>
                <strong style={{ color: '#fff' }}>Currencies:</strong>{' '}
                {Object.entries(selectedCountry.currencies || {})
                  .map(([code, cur]) => `${cur.name} (${code} - ${cur.symbol})`)
                  .join('; ') || 'None'}
              </div>
              <div>
                <strong style={{ color: '#fff' }}>Languages:</strong>{' '}
                {Object.values(selectedCountry.languages || {}).join(', ') || 'None specified'}
              </div>
              <div>
                <strong style={{ color: '#fff' }}>Bordering Nations:</strong>{' '}
                {selectedCountry.borders && selectedCountry.borders.length > 0 ? (
                  <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.25rem' }}>
                    {selectedCountry.borders.map((b) => (
                      <span key={b} className="badge badge-primary">
                        {b}
                      </span>
                    ))}
                  </div>
                ) : (
                  'No terrestrial borders (Island or enclave)'
                )}
              </div>
              <div>
                <strong style={{ color: '#fff' }}>Timezones:</strong>{' '}
                {selectedCountry.timezones?.join(', ') || 'UTC'}
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={(e) => handleSaveCountry(selectedCountry, e)}
                className="btn btn-secondary btn-sm"
              >
                <Bookmark size={15} /> Save to Favourites
              </button>
              <button
                onClick={(e) => handleCompareClick(selectedCountry.cca2, e)}
                className="btn btn-primary btn-sm"
              >
                <Scale size={15} /> Compare Nation
              </button>
              {selectedCountry.maps?.googleMaps && (
                <a
                  href={selectedCountry.maps.googleMaps}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline btn-sm"
                >
                  <ExternalLink size={15} /> View on Map
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

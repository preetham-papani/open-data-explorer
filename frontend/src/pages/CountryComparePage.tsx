import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { countryApi } from '../services/api';
import { CountryComparison } from '../types';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  Scale,
  ArrowLeftRight,
  Users,
  Maximize2,
  Globe,
  Coins,
  MapPin,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export const CountryComparePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { error } = useToast();

  const [code1, setCode1] = useState<string>(searchParams.get('first') || 'IN');
  const [code2, setCode2] = useState<string>(searchParams.get('second') || 'US');
  const [comparison, setComparison] = useState<CountryComparison | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const runComparison = async (c1: string, c2: string) => {
    if (!c1.trim() || !c2.trim()) return;
    try {
      setLoading(true);
      const data = await countryApi.compare(c1, c2);
      setComparison(data);
      setSearchParams({ first: c1, second: c2 });
    } catch (err: any) {
      error(err.message || 'Comparison failed');
      setComparison(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (code1 && code2) {
      runComparison(code1, code2);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runComparison(code1, code2);
  };

  const handleSwap = () => {
    const temp = code1;
    setCode1(code2);
    setCode2(temp);
    runComparison(code2, temp);
  };

  // Prepare chart data
  const chartData = comparison
    ? [
        {
          name: 'Population (Millions)',
          [comparison.country1.name]: Number((comparison.country1.population / 1_000_000).toFixed(1)),
          [comparison.country2.name]: Number((comparison.country2.population / 1_000_000).toFixed(1)),
        },
        {
          name: 'Area (10,000 sq km)',
          [comparison.country1.name]: Number((comparison.country1.area / 10_000).toFixed(1)),
          [comparison.country2.name]: Number((comparison.country2.area / 10_000).toFixed(1)),
        },
      ]
    : [];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Country Side-by-Side Comparator</h1>
          <p className="page-subtitle">
            Compare demographic metrics, landmass, geographic proximity, and monetary systems between any two world nations.
          </p>
        </div>
      </div>

      {/* Selector Form Card */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label className="form-label">First Country Code (CCA2 / CCA3 / Name)</label>
            <input
              type="text"
              className="input"
              value={code1}
              onChange={(e) => setCode1(e.target.value.toUpperCase())}
              placeholder="e.g. IN, IND, India"
              required
            />
          </div>

          <button
            type="button"
            onClick={handleSwap}
            className="btn btn-secondary"
            style={{ alignSelf: 'flex-end', marginBottom: '0.2rem' }}
            title="Swap countries"
          >
            <ArrowLeftRight size={18} />
          </button>

          <div style={{ flex: '1 1 200px' }}>
            <label className="form-label">Second Country Code (CCA2 / CCA3 / Name)</label>
            <input
              type="text"
              className="input"
              value={code2}
              onChange={(e) => setCode2(e.target.value.toUpperCase())}
              placeholder="e.g. US, USA, United States"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ alignSelf: 'flex-end', marginBottom: '0.2rem', minWidth: '140px' }}
          >
            <Scale size={18} /> Compare
          </button>
        </form>
      </div>

      {loading && <LoadingSpinner message="Calculating comparative metrics & ratios..." />}

      {comparison && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Side by side country cards */}
          <div className="grid-2">
            {/* Country 1 Card */}
            <div className="card" style={{ borderTop: '4px solid var(--primary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                <img
                  src={comparison.country1.flags.png}
                  alt={comparison.country1.name}
                  style={{ width: '64px', height: '42px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                />
                <div>
                  <h2 style={{ fontSize: '1.4rem', color: '#fff' }}>{comparison.country1.name}</h2>
                  <span className="badge badge-primary">{comparison.country1.cca3}</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Capital City</span>
                  <strong style={{ color: '#fff' }}>{comparison.country1.capital?.join(', ') || 'N/A'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Region / Subregion</span>
                  <strong style={{ color: '#fff' }}>{comparison.country1.region} ({comparison.country1.subregion || 'N/A'})</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Population</span>
                  <strong style={{ color: 'var(--accent-emerald)', fontSize: '1.05rem' }}>
                    {comparison.country1.population.toLocaleString()}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Land Area</span>
                  <strong style={{ color: 'var(--accent-cyan)' }}>
                    {comparison.country1.area ? `${comparison.country1.area.toLocaleString()} sq km` : 'N/A'}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Currencies</span>
                  <strong style={{ color: '#fff' }}>
                    {Object.keys(comparison.country1.currencies || {}).join(', ') || 'None'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Country 2 Card */}
            <div className="card" style={{ borderTop: '4px solid var(--accent-cyan)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                <img
                  src={comparison.country2.flags.png}
                  alt={comparison.country2.name}
                  style={{ width: '64px', height: '42px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                />
                <div>
                  <h2 style={{ fontSize: '1.4rem', color: '#fff' }}>{comparison.country2.name}</h2>
                  <span className="badge badge-cyan">{comparison.country2.cca3}</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Capital City</span>
                  <strong style={{ color: '#fff' }}>{comparison.country2.capital?.join(', ') || 'N/A'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Region / Subregion</span>
                  <strong style={{ color: '#fff' }}>{comparison.country2.region} ({comparison.country2.subregion || 'N/A'})</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Population</span>
                  <strong style={{ color: 'var(--accent-emerald)', fontSize: '1.05rem' }}>
                    {comparison.country2.population.toLocaleString()}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Land Area</span>
                  <strong style={{ color: 'var(--accent-cyan)' }}>
                    {comparison.country2.area ? `${comparison.country2.area.toLocaleString()} sq km` : 'N/A'}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Currencies</span>
                  <strong style={{ color: '#fff' }}>
                    {Object.keys(comparison.country2.currencies || {}).join(', ') || 'None'}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Comparative Metrics Analysis Summary */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '1.25rem' }}>
              Comparative Analytics Summary
            </h3>
            <div className="grid-3" style={{ gap: '1.25rem' }}>
              {/* Metric 1 */}
              <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-light)', marginBottom: '0.4rem' }}>
                  <Users size={16} />
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Demographic Delta</span>
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  <strong style={{ color: '#fff' }}>{comparison.metrics.population.higher}</strong> has the larger population by{' '}
                  <strong style={{ color: 'var(--accent-emerald)' }}>
                    {comparison.metrics.population.difference.toLocaleString()}
                  </strong>{' '}
                  people ({comparison.metrics.population.ratio}x multiplier).
                </div>
              </div>

              {/* Metric 2 */}
              <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-cyan)', marginBottom: '0.4rem' }}>
                  <Maximize2 size={16} />
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Geographic Area</span>
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  <strong style={{ color: '#fff' }}>{comparison.metrics.area.larger}</strong> is larger in total landmass by{' '}
                  <strong style={{ color: 'var(--accent-cyan)' }}>
                    {comparison.metrics.area.difference.toLocaleString()} sq km
                  </strong>.
                </div>
              </div>

              {/* Metric 3 */}
              <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-amber)', marginBottom: '0.4rem' }}>
                  <Globe size={16} />
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Proximity & Currency</span>
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {comparison.metrics.geographic.sameRegion ? (
                      <CheckCircle2 size={14} color="var(--accent-emerald)" />
                    ) : (
                      <XCircle size={14} color="var(--accent-rose)" />
                    )}
                    <span>{comparison.metrics.geographic.sameRegion ? 'Same Continent' : 'Different Continents'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {comparison.metrics.geographic.shareBorder ? (
                      <CheckCircle2 size={14} color="var(--accent-emerald)" />
                    ) : (
                      <XCircle size={14} color="var(--text-muted)" />
                    )}
                    <span>{comparison.metrics.geographic.shareBorder ? 'Shares Land Border' : 'No Shared Border'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recharts Visualization */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '1.5rem' }}>
              Comparative Data Visualization
            </h3>
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <XAxis dataKey="name" stroke="var(--text-muted)" />
                  <YAxis stroke="var(--text-muted)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-tertiary)',
                      borderColor: 'var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      color: '#fff',
                    }}
                  />
                  <Legend />
                  <Bar dataKey={comparison.country1.name} fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey={comparison.country2.name} fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

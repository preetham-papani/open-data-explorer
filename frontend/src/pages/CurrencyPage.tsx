import React, { useState, useEffect } from 'react';
import { currencyApi, savedApi } from '../services/api';
import {
  CurrencyConversionResult,
  CurrencyHistoryRecord,
} from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  Coins,
  ArrowRightLeft,
  TrendingUp,
  History,
  Bookmark,
  CheckCircle,
  Clock,
  ArrowUpRight,
} from 'lucide-react';

export const CurrencyPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error, warning } = useToast();

  const [currencies, setCurrencies] = useState<Record<string, string>>({});
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('INR');
  const [amount, setAmount] = useState<number>(100);
  const [conversionResult, setConversionResult] = useState<CurrencyConversionResult | null>(null);
  const [converting, setConverting] = useState<boolean>(false);

  // Top Rates Table
  const [baseCurrency, setBaseCurrency] = useState<string>('USD');
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [loadingRates, setLoadingRates] = useState<boolean>(true);

  // User past conversion history
  const [userHistory, setUserHistory] = useState<CurrencyHistoryRecord[]>([]);

  // Load supported currencies
  useEffect(() => {
    currencyApi
      .getCurrencies()
      .then((data) => {
        setCurrencies(data);
      })
      .catch((err) => error(err.message));
  }, []);

  // Fetch exchange rates for base
  const fetchRates = async (base: string) => {
    try {
      setLoadingRates(true);
      const res = await currencyApi.getRates(base);
      setExchangeRates(res.rates || {});
    } catch (err: any) {
      error(err.message || 'Failed to load exchange rates');
    } finally {
      setLoadingRates(false);
    }
  };

  useEffect(() => {
    fetchRates(baseCurrency);
  }, [baseCurrency]);

  // Load history if logged in
  const loadHistory = async () => {
    if (!user) return;
    try {
      const history = await currencyApi.getHistory();
      setUserHistory(history);
    } catch {}
  };

  useEffect(() => {
    loadHistory();
  }, [user]);

  // Handle Conversion
  const handleConvert = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (amount <= 0) {
      warning('Please enter a positive amount to convert.');
      return;
    }

    try {
      setConverting(true);
      const res = await currencyApi.convert(fromCurrency, toCurrency, amount);
      setConversionResult(res);
      loadHistory();
    } catch (err: any) {
      error(err.message || 'Currency conversion failed.');
    } finally {
      setConverting(false);
    }
  };

  // Convert on initial mount
  useEffect(() => {
    handleConvert();
  }, []);

  const handleSwap = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const handleSavePair = async () => {
    if (!user) {
      warning('Please log in to bookmark currency pairs!');
      return;
    }
    if (!conversionResult) return;

    try {
      await savedApi.saveItem({
        itemType: 'currency',
        itemId: `${fromCurrency}_${toCurrency}`,
        title: `${fromCurrency} to ${toCurrency} Exchange Rate`,
        subtitle: `1 ${fromCurrency} = ${conversionResult.rate.toFixed(4)} ${toCurrency}`,
        data: {
          from: fromCurrency,
          to: toCurrency,
          rate: conversionResult.rate,
        },
      });
      success(`Saved ${fromCurrency} &rarr; ${toCurrency} to your favourites!`);
    } catch (err: any) {
      error(err.message);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Currency Data Explorer</h1>
          <p className="page-subtitle">
            Live foreign exchange rates and financial conversion engine powered by the European Central Bank (Frankfurter API).
          </p>
        </div>
      </div>

      <div className="grid-2" style={{ gap: '2rem', alignItems: 'flex-start' }}>
        {/* Converter Card */}
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.5rem' }}>
            <div className="stat-icon stat-icon-emerald" style={{ width: '40px', height: '40px' }}>
              <Coins size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', color: '#fff' }}>Currency Converter</h2>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Real-time verified exchange calculations</p>
            </div>
          </div>

          <form onSubmit={handleConvert}>
            <div className="form-group">
              <label className="form-label">Amount</label>
              <input
                type="number"
                min="0.01"
                step="any"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="input"
                style={{ fontSize: '1.2rem', fontWeight: 600 }}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
              <div style={{ flex: 1 }}>
                <label className="form-label">From Currency</label>
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                  className="select"
                >
                  {Object.entries(currencies).map(([code, name]) => (
                    <option key={code} value={code}>
                      {code} &mdash; {name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleSwap}
                className="btn btn-secondary btn-icon"
                style={{ marginBottom: '2px' }}
                title="Swap currencies"
              >
                <ArrowRightLeft size={18} />
              </button>

              <div style={{ flex: 1 }}>
                <label className="form-label">To Currency</label>
                <select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                  className="select"
                >
                  {Object.entries(currencies).map(([code, name]) => (
                    <option key={code} value={code}>
                      {code} &mdash; {name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={converting}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem' }}
            >
              {converting ? 'Calculating...' : 'Convert Amount'}
            </button>
          </form>

          {/* Conversion Result Display */}
          {conversionResult && (
            <div
              style={{
                marginTop: '1.75rem',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
              }}
            >
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                {conversionResult.amount} {fromCurrency} =
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-emerald)', lineHeight: 1.2 }}>
                {conversionResult.result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} {toCurrency}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>1 {fromCurrency} = {conversionResult.rate.toFixed(4)} {toCurrency}</span>
                <span>Reference: {conversionResult.date}</span>
              </div>

              <button
                onClick={handleSavePair}
                className="btn btn-outline btn-sm"
                style={{ marginTop: '0.85rem', width: '100%' }}
              >
                <Bookmark size={14} /> Bookmark Exchange Pair
              </button>
            </div>
          )}
        </div>

        {/* Live Top Exchange Rates Table */}
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div className="stat-icon stat-icon-cyan" style={{ width: '40px', height: '40px' }}>
                <TrendingUp size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>Live Market Rates</h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Top foreign exchange benchmarks</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Base:</span>
              <select
                value={baseCurrency}
                onChange={(e) => setBaseCurrency(e.target.value)}
                className="select"
                style={{ width: '110px', padding: '0.4rem 0.65rem', fontSize: '0.85rem' }}
              >
                {['USD', 'EUR', 'INR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF'].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loadingRates ? (
            <LoadingSpinner message="Querying live rates..." />
          ) : (
            <div className="table-container" style={{ maxHeight: '380px' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Currency Code</th>
                    <th>Full Name</th>
                    <th style={{ textAlign: 'right' }}>Rate (1 {baseCurrency})</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(exchangeRates).slice(0, 15).map(([code, rate]) => (
                    <tr key={code}>
                      <td>
                        <span className="badge badge-primary">{code}</span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {currencies[code] || code}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: '#fff' }}>
                        {rate.toFixed(4)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* User Conversion History */}
      {user && userHistory.length > 0 && (
        <div className="card" style={{ marginTop: '2.5rem', padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={18} color="var(--primary-light)" /> Your Recent Conversions
          </h3>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Amount Converted</th>
                  <th>Calculated Output</th>
                  <th>Exchange Multiplier</th>
                </tr>
              </thead>
              <tbody>
                {userHistory.map((h) => (
                  <tr key={h._id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {new Date(h.createdAt).toLocaleString()}
                    </td>
                    <td>
                      <strong style={{ color: '#fff' }}>{h.amount}</strong> {h.fromCurrency}
                    </td>
                    <td>
                      <strong style={{ color: 'var(--accent-emerald)' }}>{h.result.toFixed(2)}</strong> {h.toCurrency}
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      1 {h.fromCurrency} = {h.rate.toFixed(4)} {h.toCurrency}
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

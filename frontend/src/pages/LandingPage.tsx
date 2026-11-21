import React from 'react';
import { Link } from 'react-router-dom';
import {
  Globe2,
  Compass,
  CloudSun,
  Coins,
  Scale,
  ShieldCheck,
  Zap,
  ArrowRight,
  Database,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div>
      {/* Hero Section */}
      <section
        style={{
          textAlign: 'center',
          padding: '4rem 1rem 3rem 1rem',
          maxWidth: '900px',
          margin: '0 auto',
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <span className="badge badge-primary">
            <Sparkles size={12} /> Full-Stack Web Development Mini Project
          </span>
          <span className="badge badge-emerald">Live Public APIs</span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.25rem, 5vw, 3.75rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            marginBottom: '1.5rem',
            background: 'linear-gradient(135deg, #ffffff 30%, #94a3b8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Explore the World Through Real-Time Open Data
        </h1>

        <p
          style={{
            fontSize: '1.15rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            marginBottom: '2.5rem',
            maxWidth: '720px',
            margin: '0 auto 2.5rem auto',
          }}
        >
          A unified, production-style web platform aggregating public demographic, atmospheric, and financial data with Node.js, Express, MongoDB Atlas, and React TypeScript.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/countries" className="btn btn-primary" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
            <Compass size={18} />
            <span>Start Exploring Countries</span>
            <ArrowRight size={16} />
          </Link>
          <Link to="/weather" className="btn btn-secondary" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
            <CloudSun size={18} />
            <span>Check Live Weather</span>
          </Link>
          {!user && (
            <Link to="/login" className="btn btn-outline" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
              <span>Try Demo Account</span>
            </Link>
          )}
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section style={{ margin: '3.5rem 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
            Integrated Open Data Modules
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Seamlessly query, filter, visualize, compare, and bookmark global data streams.
          </p>
        </div>

        <div className="grid-cards">
          {/* Card 1: Country Explorer */}
          <Link to="/countries" className="card card-interactive">
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <Compass size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.5rem' }}>
              Country Data Explorer
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
              Search 250+ countries, filter by continent, sort by population, and inspect currencies, capitals, and flags with MongoDB caching.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--primary-light)', fontSize: '0.85rem', fontWeight: 600 }}>
              <span>Explore Countries</span>
              <ArrowRight size={14} />
            </div>
          </Link>

          {/* Card 2: Weather Forecast */}
          <Link to="/weather" className="card card-interactive">
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(6, 182, 212, 0.15)',
                color: 'var(--accent-cyan)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <CloudSun size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.5rem' }}>
              Live Weather Intelligence
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
              Real-time atmospheric conditions via Open-Meteo with humidity, wind speed, WMO codes, and interactive 7-day temperature trends.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-cyan)', fontSize: '0.85rem', fontWeight: 600 }}>
              <span>View Forecasts</span>
              <ArrowRight size={14} />
            </div>
          </Link>

          {/* Card 3: Currency Converter */}
          <Link to="/currency" className="card card-interactive">
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--accent-emerald)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <Coins size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.5rem' }}>
              Currency Exchange Engine
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
              Live foreign exchange rates powered by the European Central Bank (Frankfurter API) with instant conversion and personal transaction history.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-emerald)', fontSize: '0.85rem', fontWeight: 600 }}>
              <span>Convert Currencies</span>
              <ArrowRight size={14} />
            </div>
          </Link>

          {/* Card 4: Country Comparison */}
          <Link to="/compare" className="card card-interactive">
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(245, 158, 11, 0.15)',
                color: 'var(--accent-amber)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <Scale size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.5rem' }}>
              Side-by-Side Comparison
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
              Compare any two nations side-by-side with calculated population ratios, land area differences, shared borders, and comparative charts.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-amber)', fontSize: '0.85rem', fontWeight: 600 }}>
              <span>Compare Nations</span>
              <ArrowRight size={14} />
            </div>
          </Link>
        </div>
      </section>

      {/* Tech Stack Banner */}
      <section className="card" style={{ padding: '2rem', margin: '3rem 0' }}>
        <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '1rem', textAlign: 'center' }}>
          Production Architecture & Syllabus Highlights
        </h3>
        <div className="grid-4" style={{ textAlign: 'center' }}>
          <div>
            <div style={{ color: 'var(--primary-light)', fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>
              Frontend Framework
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              React 18 + TypeScript + Vite + Recharts + React Router 6
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--accent-cyan)', fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>
              REST API Server
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Node.js + Express + TypeScript + Modular Controllers & Services
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--accent-emerald)', fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>
              Database & Sessions
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              MongoDB Atlas + Mongoose Schemas + connect-mongo Sessions
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--accent-amber)', fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>
              Security & Cache
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              bcryptjs Hashing + Cookie Security + MongoDB TTL Expiry
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '5rem 1rem',
      }}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'rgba(99, 102, 241, 0.15)',
          color: 'var(--primary-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <Compass size={36} />
      </div>
      <h1 style={{ fontSize: '3.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>
        404
      </h1>
      <h2 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '0.75rem' }}>
        Page Not Found
      </h2>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', marginBottom: '2rem', lineHeight: 1.5 }}>
        The data explorer route you are looking for doesn't exist, has been moved, or is temporarily unavailable.
      </p>
      <Link to="/" className="btn btn-primary">
        <Home size={16} /> Return to Home
      </Link>
    </div>
  );
};

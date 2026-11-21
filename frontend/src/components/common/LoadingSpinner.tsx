import React from 'react';

export const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Loading live data...' }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 1rem',
        gap: '1rem',
      }}
    >
      <div className="spinner" style={{ width: '2.5rem', height: '2.5rem', borderWidth: '3px', borderTopColor: 'var(--primary)' }} />
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{message}</p>
    </div>
  );
};

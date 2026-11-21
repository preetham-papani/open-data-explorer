import React from 'react';
import { Link } from 'react-router-dom';
import { Globe2, Server, Database, Code, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          {/* Brand Col */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
              <div className="brand-icon" style={{ width: '30px', height: '30px' }}>
                <Globe2 size={18} />
              </div>
              <span style={{ fontWeight: 700, fontSize: '1.15rem', color: '#fff' }}>
                OPEN DATA EXPLORER
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '340px' }}>
              A full-stack web application integrating real-time public REST APIs, Node.js, Express, MongoDB Atlas, and React TypeScript for dynamic data exploration and comparative analysis.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <span className="badge badge-primary">React 18</span>
              <span className="badge badge-cyan">Node.js</span>
              <span className="badge badge-emerald">MongoDB</span>
              <span className="badge badge-amber">TypeScript</span>
            </div>
          </div>

          {/* Nav Col 1 */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Exploration Modules
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
              <Link to="/countries" style={{ color: 'var(--text-secondary)' }}>Country Explorer</Link>
              <Link to="/compare" style={{ color: 'var(--text-secondary)' }}>Side-by-Side Comparison</Link>
              <Link to="/weather" style={{ color: 'var(--text-secondary)' }}>Live Weather Forecast</Link>
              <Link to="/currency" style={{ color: 'var(--text-secondary)' }}>Currency Exchange</Link>
            </div>
          </div>

          {/* Nav Col 2 */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Public APIs Used
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
              <a href="https://restcountries.com" target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)' }}>REST Countries</a>
              <a href="https://open-meteo.com" target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)' }}>Open-Meteo Weather</a>
              <a href="https://www.frankfurter.app" target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)' }}>Frankfurter Exchange</a>
              <a href="https://flagcdn.com" target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)' }}>FlagCDN Visuals</a>
            </div>
          </div>

          {/* Project Details */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              College Mini Project
            </h4>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div><strong style={{ color: '#fff' }}>Subject:</strong> Full Stack Web Development</div>
              <div><strong style={{ color: '#fff' }}>Architecture:</strong> RESTful MVC + Mongoose</div>
              <div><strong style={{ color: '#fff' }}>Auth:</strong> Express Sessions + bcrypt</div>
              <div><strong style={{ color: '#fff' }}>Cache:</strong> MongoDB TTL Cache</div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div>
            &copy; {new Date().getFullYear()} Open Data Explorer &mdash; Full Stack Development Mini Project.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>Built with</span>
            <Heart size={14} color="#f43f5e" fill="#f43f5e" />
            <span>for academic evaluation & demonstration</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

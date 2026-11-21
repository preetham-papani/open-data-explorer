import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { CountriesPage } from './pages/CountriesPage';
import { CountryComparePage } from './pages/CountryComparePage';
import { WeatherPage } from './pages/WeatherPage';
import { CurrencyPage } from './pages/CurrencyPage';
import { DashboardPage } from './pages/DashboardPage';
import { SavedItemsPage } from './pages/SavedItemsPage';
import { HistoryPage } from './pages/HistoryPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminPage } from './pages/AdminPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <div className="app-container">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/countries" element={<CountriesPage />} />
                <Route path="/compare" element={<CountryComparePage />} />
                <Route path="/weather" element={<WeatherPage />} />
                <Route path="/currency" element={<CurrencyPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/saved" element={<SavedItemsPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;

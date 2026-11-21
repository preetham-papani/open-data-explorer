import React, { useState, useEffect } from 'react';
import { weatherApi, savedApi } from '../services/api';
import { WeatherData } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  Search,
  CloudSun,
  Droplets,
  Wind,
  Gauge,
  Sun,
  Moon,
  Bookmark,
  Calendar,
  Compass,
  CloudRain,
  Snowflake,
  CloudLightning,
  Cloud,
  MapPin,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const WeatherPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error, warning } = useToast();

  const [cityInput, setCityInput] = useState<string>('Hyderabad');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [recentCities] = useState<string[]>([
    'Hyderabad',
    'London',
    'Tokyo',
    'New York',
    'Paris',
    'Dubai',
  ]);

  const fetchWeather = async (cityName: string) => {
    if (!cityName.trim()) return;
    try {
      setLoading(true);
      const data = await weatherApi.getForecast(cityName);
      setWeatherData(data);
    } catch (err: any) {
      error(err.message || `Could not find weather data for '${cityName}'.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather('Hyderabad');
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWeather(cityInput);
  };

  const handleSaveCity = async () => {
    if (!user) {
      warning('Please log in to bookmark cities in your favourites.');
      return;
    }
    if (!weatherData) return;

    try {
      await savedApi.saveItem({
        itemType: 'weather',
        itemId: weatherData.location.name,
        title: `${weatherData.location.name}, ${weatherData.location.country}`,
        subtitle: `${weatherData.current.temperature}°C • ${weatherData.current.condition}`,
        data: {
          temp: weatherData.current.temperature,
          condition: weatherData.current.condition,
          humidity: weatherData.current.humidity,
          country: weatherData.location.country,
        },
      });
      success(`${weatherData.location.name} saved to favourites!`);
    } catch (err: any) {
      error(err.message || 'Failed to save city');
    }
  };

  // Helper icon renderer
  const renderWeatherIcon = (condition: string, size = 28) => {
    const c = condition.toLowerCase();
    if (c.includes('rain') || c.includes('drizzle')) return <CloudRain size={size} color="var(--accent-cyan)" />;
    if (c.includes('snow')) return <Snowflake size={size} color="#93c5fd" />;
    if (c.includes('thunder') || c.includes('lightning')) return <CloudLightning size={size} color="var(--accent-amber)" />;
    if (c.includes('clear') || c.includes('sun')) return <Sun size={size} color="var(--accent-amber)" />;
    return <Cloud size={size} color="var(--primary-light)" />;
  };

  // 24 hour chart data
  const hourlyChartData = weatherData?.hourly?.map((h) => ({
    time: new Date(h.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    temperature: h.temperature,
    humidity: h.humidity,
  })) || [];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Weather Data Explorer</h1>
          <p className="page-subtitle">
            Live atmospheric metrics, temperature forecasts, humidity, and barometric trends powered by Open-Meteo public APIs.
          </p>
        </div>
      </div>

      {/* City Search Bar */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 300px', position: 'relative' }}>
            <Search
              size={18}
              style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              className="input"
              style={{ paddingLeft: '2.5rem' }}
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              placeholder="Search any global city (e.g. Mumbai, Berlin, Sydney, Cairo)..."
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ minWidth: '130px' }}>
            <CloudSun size={18} /> Get Weather
          </button>
        </form>

        {/* Quick Suggestion Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Popular:</span>
          {recentCities.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => {
                setCityInput(city);
                fetchWeather(city);
              }}
              className="badge badge-primary"
              style={{ cursor: 'pointer', border: '1px solid var(--border-color)', background: 'transparent' }}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {loading && <LoadingSpinner message="Fetching live meteorological data..." />}

      {weatherData && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Main Current Weather Card */}
          <div
            className="card"
            style={{
              padding: '2rem',
              background: 'linear-gradient(135deg, rgba(16, 22, 35, 0.95), rgba(30, 41, 59, 0.85))',
              border: '1px solid var(--border-glow)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <MapPin size={20} color="var(--primary-light)" />
                  <h2 style={{ fontSize: '1.75rem', color: '#fff', fontWeight: 700 }}>
                    {weatherData.location.name}
                  </h2>
                  <span className="badge badge-cyan">{weatherData.location.country}</span>
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Lat: {weatherData.location.latitude.toFixed(2)}°, Lon: {weatherData.location.longitude.toFixed(2)}° • Timezone: {weatherData.location.timezone}
                </div>
              </div>

              <button onClick={handleSaveCity} className="btn btn-secondary btn-sm">
                <Bookmark size={15} /> Save City
              </button>
            </div>

            {/* Current Metrics Overview */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ width: '68px', height: '68px', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {renderWeatherIcon(weatherData.current.condition, 40)}
                </div>
                <div>
                  <div style={{ fontSize: '3.25rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                    {Math.round(weatherData.current.temperature)}°C
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
                    Feels like {Math.round(weatherData.current.apparentTemperature)}°C &bull; {weatherData.current.description}
                  </div>
                </div>
              </div>

              {/* Sub metrics grid */}
              <div className="grid-3" style={{ gap: '1rem', flex: '1 1 350px' }}>
                <div className="stat-card" style={{ padding: '0.85rem' }}>
                  <Droplets size={22} color="var(--accent-cyan)" />
                  <div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>
                      {weatherData.current.humidity}%
                    </div>
                    <div className="stat-label">Humidity</div>
                  </div>
                </div>

                <div className="stat-card" style={{ padding: '0.85rem' }}>
                  <Wind size={22} color="var(--accent-emerald)" />
                  <div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>
                      {weatherData.current.windSpeed} km/h
                    </div>
                    <div className="stat-label">Wind Speed</div>
                  </div>
                </div>

                <div className="stat-card" style={{ padding: '0.85rem' }}>
                  <Gauge size={22} color="var(--accent-amber)" />
                  <div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>
                      {weatherData.current.pressure} hPa
                    </div>
                    <div className="stat-label">Pressure</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 24-Hour Temperature & Humidity Chart */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '1.25rem' }}>
              Next 24-Hour Temperature Trend (°C)
            </h3>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyChartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={12} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-tertiary)',
                      borderColor: 'var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      color: '#fff',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="temperature"
                    name="Temperature (°C)"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#tempGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 7-Day Daily Forecast Cards */}
          <div>
            <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} color="var(--primary-light)" /> 7-Day Atmospheric Forecast
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
              {weatherData.daily.map((day, idx) => (
                <div
                  key={day.date}
                  className="card"
                  style={{
                    textAlign: 'center',
                    padding: '1.25rem 0.85rem',
                    background: idx === 0 ? 'var(--bg-tertiary)' : 'var(--bg-card)',
                    border: idx === 0 ? '1px solid var(--border-glow)' : '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', color: idx === 0 ? 'var(--primary-light)' : '#fff', marginBottom: '0.2rem' }}>
                    {idx === 0 ? 'Today' : day.dayName.split(',')[0]}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                    {day.date}
                  </div>

                  <div style={{ margin: '0.75rem 0' }}>
                    {renderWeatherIcon(day.condition, 30)}
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.65rem', height: '2.4em', overflow: 'hidden' }}>
                    {day.condition}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                    <strong style={{ color: '#fff' }}>{Math.round(day.tempMax)}°</strong>
                    <span style={{ color: 'var(--text-muted)' }}>{Math.round(day.tempMin)}°</span>
                  </div>

                  {day.precipitationSum > 0 && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', marginTop: '0.4rem' }}>
                      💧 {day.precipitationSum} mm
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

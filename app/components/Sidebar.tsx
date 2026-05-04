'use client';
import { Map, Navigation, Route, User, Star, LogOut, Bus, Bell, Search, Globe, X } from 'lucide-react';
import { useState } from 'react';
import useStore, { BUS_STOPS } from '../store/useStore';
import { translations } from '../store/translations';

export default function Sidebar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLangOpen, setIsLangOpen] = useState(false);
  const currentView = useStore((state: any) => state.currentView);
  const setView = useStore((state: any) => state.setView);
  const user = useStore((state: any) => state.user);
  const logout = useStore((state: any) => state.logout);
  const savedRoutes = useStore((state: any) => state.savedRoutes || []);
  const setSelectedStop = useStore((state: any) => state.setSelectedStop);
  const language = useStore((state: any) => state.language);
  const setLanguage = useStore((state: any) => state.setLanguage);

  const t = translations[language] || translations.al;

  const MENU = [
    { id: 'map', label: t.map, icon: Map },
    { id: 'tracker', label: t.live_buses, icon: Bus },
    { id: 'planner', label: t.planner, icon: Route },
    { id: 'favorites', label: t.saved, icon: Star },
    { id: 'profile', label: t.profile, icon: User },
  ];

  const filteredStops = BUS_STOPS.filter(stop =>
    stop.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 10);

  const languages = [
    { id: 'al', flag: '🇦🇱', name: 'Shqip' },
    { id: 'en', flag: '🇺🇸', name: 'English' },
    { id: 'it', flag: '🇮🇹', name: 'Italiano' },
  ];

  const handleViewChange = (id: string) => {
    setView(id);
    if (window.innerWidth <= 900) {
      useStore.getState().setSidebarOpen(false);
    }
  };

  const handleStopSelect = (stop: any) => {
    setSelectedStop(stop);
    setSearchQuery('');
    setView('map');
    if (window.innerWidth <= 900) {
      useStore.getState().setSidebarOpen(false);
    }
  };

  const isSidebarOpen = useStore((state: any) => state.isSidebarOpen);

  return (
    <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
      {/* Brand */}
      <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid var(--border)', position: 'relative' }}>
        <button 
          onClick={() => useStore.getState().setSidebarOpen(false)}
          className="mobile-close-btn"
          style={{
            position: 'absolute', top: '24px', right: '16px',
            width: '32px', height: '32px', borderRadius: '8px',
            display: 'none', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.05)', color: '#fff',
            border: '1px solid var(--border)'
          }}
        >
          <X size={18} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/AlbRouteLogo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', lineHeight: '1', color: '#fff' }}>AlbRoute</h2>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Tirana Transit</p>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ marginTop: '20px', position: 'relative' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 36px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--border)',
                fontSize: '13px',
                color: '#fff',
                outline: 'none',
                transition: 'var(--transition)',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
          </div>

          {/* Search Results */}
          {searchQuery && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
              background: 'rgba(15,23,42,0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              maxHeight: '250px',
              overflowY: 'auto',
              zIndex: 100,
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            }}>
              {filteredStops.length > 0 ? (
                filteredStops.map((stop: any) => (
                  <button
                    key={stop.id}
                    onClick={() => handleStopSelect(stop)}
                    style={{
                      width: '100%', padding: '10px 14px',
                      display: 'flex', flexDirection: 'column', gap: '2px',
                      background: 'transparent', border: 'none',
                      textAlign: 'left', cursor: 'pointer',
                      transition: 'var(--transition)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>{stop.name}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.stations}</span>
                  </button>
                ))
              ) : (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                  {language === 'al' ? 'Asnjë stacion nuk u gjet' : 'No station found'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        {MENU.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => handleViewChange(id)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
              padding: '11px 14px', borderRadius: '10px', marginBottom: '2px',
              fontSize: '14px', fontWeight: '500', cursor: 'pointer',
              transition: 'var(--transition)',
              background: currentView === id ? 'rgba(59,130,246,0.12)' : 'transparent',
              color: currentView === id ? 'var(--primary)' : 'var(--text-muted)',
              border: 'none',
            }}>
            <Icon size={18} />
            <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
          </button>
        ))}
      </nav>

      {/* Language Selector Custom Dropdown */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
        <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.language}</p>
        <div style={{ position: 'relative' }}>
          <div
            onClick={() => setIsLangOpen(!isLangOpen)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border)',
              color: '#fff',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'var(--transition)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
                src={`https://flagcdn.com/w40/${language === 'al' ? 'al' : language === 'en' ? 'us' : 'it'}.png`}
                alt={language}
                style={{ width: '20px', height: '14px', borderRadius: '2px', objectFit: 'cover' }}
              />
              <span>{language === 'al' ? 'Shqip' : language === 'en' ? 'English' : 'Italiano'}</span>
            </div>
            <Globe size={14} style={{ color: 'var(--text-muted)' }} />
          </div>

          {isLangOpen && (
            <div style={{
              position: 'absolute', bottom: 'calc(100% + 8px)', left: 0, right: 0,
              background: 'rgba(15,23,42,0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              zIndex: 200,
              overflow: 'hidden',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            }}>
              {languages.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => {
                    setLanguage(lang.id);
                    setIsLangOpen(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: 'transparent',
                    border: 'none',
                    color: '#fff',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                    borderBottom: '1px solid rgba(255,255,255,0.05)'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <img
                    src={`https://flagcdn.com/w40/${lang.id === 'al' ? 'al' : lang.id === 'en' ? 'us' : 'it'}.png`}
                    alt={lang.name}
                    style={{ width: '20px', height: '14px', borderRadius: '2px', objectFit: 'cover' }}
                  />
                  <span style={{ fontSize: '13px' }}>{lang.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* User Footer */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: '#fff', flexShrink: 0 }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <p style={{ fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</p>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</p>
          </div>
          <button onClick={logout} title="Dil" style={{ color: 'var(--text-muted)', padding: '4px', borderRadius: '6px', transition: 'var(--transition)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--danger)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}

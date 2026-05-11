'use client';
import { Map, Navigation, Route, User, Star, LogOut, Bus, Search, Globe, X, ChevronRight, Ticket } from 'lucide-react';
import { useState, Fragment } from 'react';
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
  const isSidebarOpen = useStore((state: any) => state.isSidebarOpen);

  const t = translations[language] || translations.al;

  const MENU = [
    { id: 'map', label: t.map, icon: Map },
    { id: 'tracker', label: t.live_buses, icon: Bus },
    { id: 'packages', label: t.packages, icon: Ticket },
    { id: 'favorites', label: t.saved, icon: Star },
    { id: 'planner', label: t.planner, icon: Route },
    { id: 'profile', label: t.profile, icon: User },
  ];

  const filteredStops = BUS_STOPS.filter(stop =>
    stop.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 10);

  const languages = [
    { id: 'al', flag: 'al', name: 'Shqip' },
    { id: 'en', flag: 'us', name: 'English' },
    { id: 'it', flag: 'it', name: 'Italiano' },
  ];

  const handleViewChange = (id: string) => {
    setView(id);
    if (typeof window !== 'undefined' && window.innerWidth <= 900) {
      useStore.getState().setSidebarOpen(false);
    }
  };

  const handleStopSelect = (stop: any) => {
    setSelectedStop(stop);
    setSearchQuery('');
    setView('map');
    if (typeof window !== 'undefined' && window.innerWidth <= 900) {
      useStore.getState().setSidebarOpen(false);
    }
  };

  return (
    <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>

      {/* ── Header ── */}
      <div className="s-header">
        <div className="s-brand">
          <div className="s-logo">
            <img src="/logo.png" alt="Urban Logo" />
          </div>
          <div className="s-brand-text">
            <span className="s-brand-name">Urbani Im</span>
            <div className="s-brand-sub">
              <span className="s-dot" />
              <span>Tirana Live</span>
            </div>
          </div>
        </div>
        <button
          className="s-close-btn"
          onClick={() => useStore.getState().setSidebarOpen(false)}
          aria-label={t.close}
        >
          <X size={16} />
        </button>
      </div>

      {/* ── Search ── */}
      <div className="s-search">
        <div className="s-search-box">
          <Search size={14} className="s-search-icon" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="s-clear" onClick={() => setSearchQuery('')}>
              <X size={12} />
            </button>
          )}
        </div>

        {searchQuery && filteredStops.length > 0 && (

          <div className="s-results">
            {filteredStops.length > 0 ? (
              filteredStops.map((stop: any) => (
                <button
                  key={stop.id}
                  className="s-result-item"
                  onClick={() => handleStopSelect(stop)}
                >
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" className="s-result-icon">
  <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
</svg>


                  <div className="s-result-info">
                    <span className="s-result-name">{stop.name}</span>
                    <span className="s-result-sub">{t.stations}</span>
                  </div>
                  <ChevronRight size={13} className="s-result-arrow" />
                </button>
              ))
            ) : (
              <div className="s-no-results">
                {language === 'al' ? 'Asnjë stacion nuk u gjet' : language === 'en' ? 'No station found' : 'Nessuna stazione trovata'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Nav ── */}
      <div className="s-nav-label">{language === 'al' ? 'Menu' : language === 'en' ? 'Menu' : 'Menu'}</div>
      <nav className="s-nav">
        {MENU.map(({ id, label, icon: Icon }, idx) => (
          <Fragment key={id}>
            {id === 'profile' && <div className="s-divider" />}
            <button
              onClick={() => handleViewChange(id)}
              className={`s-nav-item ${currentView === id ? 'active' : ''}`}
            >
              <div className="s-icon-wrap">
                <Icon size={16} />
              </div>
              <span className="s-item-label">{label}</span>
            </button>
          </Fragment>
        ))}
      </nav>

      {/* ── Footer ── */}
      <div className="s-footer">

        {/* Language */}
        <div className="s-lang-wrap">
          <button
            className="s-lang-trigger"
            onClick={() => setIsLangOpen(!isLangOpen)}
          >
            <img
              src={`https://flagcdn.com/w40/${language === 'al' ? 'al' : language === 'en' ? 'us' : 'it'}.png`}
              alt={language}
            />
            <span>{language === 'al' ? 'Shqip' : language === 'en' ? 'English' : 'Italiano'}</span>
            <Globe size={13} className="s-globe" />
          </button>

          {isLangOpen && (
            <div className="s-lang-dropdown">
              {languages.map((lang) => (
                <button
                  key={lang.id}
                  className={`s-lang-option ${language === lang.id ? 'selected' : ''}`}
                  onClick={() => { setLanguage(lang.id); setIsLangOpen(false); }}
                >
                  <img src={`https://flagcdn.com/w40/${lang.flag}.png`} alt={lang.name} />
                  <span>{lang.name}</span>
                  {language === lang.id && <div className="s-lang-check" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User */}
        <div className="s-user">
          <div className="s-avatar">
            {user?.name?.charAt(0).toUpperCase() || 'A'}
            <div className="s-online" />
          </div>
          <div className="s-user-info">
            <span className="s-username">{user?.name || 'Admin'}</span>
            <span className="s-useremail">{user?.email || 'admin@busal.al'}</span>
          </div>
          <button className="s-logout-btn" onClick={logout} title={t.logout}>
            <LogOut size={15} />
          </button>
        </div>

      </div>

      <style jsx>{`
        /* Header */
        .s-header {
          padding: 18px 16px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .s-brand { display: flex; align-items: center; gap: 10px; }
        .s-logo {
          width: 34px; height: 34px;
          border-radius: 10px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          padding: 2px;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
        }
        .s-logo img { width: 100%; height: 100%; object-fit: cover; border-radius: 8px; }
        .s-brand-name { display: block; font-size: 15px; font-weight: 700; color: #fff; }
        .s-brand-sub { display: flex; align-items: center; gap: 5px; margin-top: 1px; }
        .s-dot { width: 5px; height: 5px; background: #10b981; border-radius: 50%; }
        .s-brand-sub span { font-size: 10px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        .s-close-btn {
          background: none; border: none; color: #475569; cursor: pointer;
          padding: 5px; border-radius: 8px; display: none; align-items: center;
        }
        @media (max-width: 900px) { .s-close-btn { display: flex; } }

        /* Search */
        .s-search { padding: 12px 12px 8px; position: relative; }
        .s-search-box {
          display: flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px;
          padding: 8px 10px;
        }
        .s-search-box:focus-within { border-color: var(--primary); background: rgba(255,255,255,0.06); }
        .s-search-icon { color: #475569; flex-shrink: 0; }
        .s-search-box input {
          flex: 1; background: none; border: none; outline: none;
          color: #fff; font-size: 13px;
        }
        .s-search-box input::placeholder { color: #475569; }
        .s-clear { background: none; border: none; color: #475569; cursor: pointer; }

        .s-results {
          position: absolute; top: calc(100% - 4px); left: 12px; right: 12px;
          background: #1e293b; border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px; box-shadow: 0 12px 30px rgba(0,0,0,0.4);
          z-index: 100; max-height: 260px; overflow-y: auto;
        }
        .s-result-item {
          width: 100%; padding: 10px 12px; display: flex; align-items: center; gap: 10px;
          background: none; border: none; border-bottom: 1px solid rgba(255,255,255,0.03);
          cursor: pointer; text-align: left; transition: 0.15s;
        }
        .s-result-item:hover { background: rgba(255,255,255,0.04); }
        .s-result-icon { color: var(--primary); opacity: 0.7; }
        .s-result-info { flex: 1; display: flex; flex-direction: column; }
        .s-result-name { color: #fff; font-size: 12px; font-weight: 600; }
        .s-result-sub { color: #475569; font-size: 11px; }
        .s-result-arrow { color: #334155; }
        .s-no-results { padding: 12px; color: #475569; font-size: 12px; text-align: center; }

        /* Nav */
        .s-nav-label {
          padding: 6px 16px 4px;
          font-size: 10px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 1px;
          color: #334155;
        }
        .s-nav { flex: 1; padding: 4px 8px; overflow-y: auto; }
        .s-nav-item {
          width: 100%; display: flex; align-items: center; gap: 10px;
          padding: 10px 10px; border-radius: 10px; margin-bottom: 2px;
          background: none; border: none; color: #64748b;
          cursor: pointer; transition: all 0.15s; text-align: left;
        }
        .s-nav-item:hover { color: #cbd5e1; background: rgba(255,255,255,0.04); }
        .s-nav-item.active { color: #fff; background: rgba(59,130,246,0.12); }
        .s-nav-item.active .s-icon-wrap { background: rgba(59,130,246,0.2); color: var(--primary); }
        .s-icon-wrap {
          width: 28px; height: 28px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.04);
          flex-shrink: 0;
        }
        .s-item-label { font-size: 13px; font-weight: 600; }
        .s-divider { height: 1px; background: rgba(255,255,255,0.05); margin: 6px 4px; }

        /* Footer */
        .s-footer {
          padding: 14px 12px;
          border-top: 1px solid rgba(255,255,255,0.06);
          display: flex; flex-direction: column; gap: 10px;
        }

        /* Language */
        .s-lang-wrap { position: relative; }
        .s-lang-trigger {
          width: 100%; display: flex; align-items: center; gap: 8px;
          padding: 8px 10px; border-radius: 10px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          color: #94a3b8; cursor: pointer; transition: 0.15s;
        }
        .s-lang-trigger:hover { background: rgba(255,255,255,0.05); }
        .s-lang-trigger img { width: 17px; height: 12px; border-radius: 2px; object-fit: cover; }
        .s-lang-trigger span { flex: 1; font-size: 12px; font-weight: 600; text-align: left; }
        .s-globe { color: #475569; }

        .s-lang-dropdown {
          position: absolute; bottom: calc(100% + 6px); left: 0; right: 0;
          background: #1e293b; border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px; box-shadow: 0 8px 20px rgba(0,0,0,0.5);
          overflow: hidden;
        }
        .s-lang-option {
          width: 100%; padding: 10px 12px; display: flex; align-items: center; gap: 10px;
          background: none; border: none; color: #94a3b8; cursor: pointer; transition: 0.15s;
        }
        .s-lang-option:hover { background: rgba(255,255,255,0.05); color: #fff; }
        .s-lang-option.selected { color: #fff; }
        .s-lang-option img { width: 17px; height: 12px; border-radius: 2px; object-fit: cover; }
        .s-lang-option span { flex: 1; font-size: 12px; font-weight: 600; }
        .s-lang-check { width: 6px; height: 6px; background: var(--primary); border-radius: 50%; }

        /* User */
        .s-user {
          display: flex; align-items: center; gap: 10px;
          padding: 10px; border-radius: 12px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
        }
        .s-avatar {
          width: 32px; height: 32px; border-radius: 9px;
          background: var(--primary);
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 13px; font-weight: 700;
          position: relative; flex-shrink: 0;
        }
        .s-online {
          position: absolute; bottom: -2px; right: -2px;
          width: 8px; height: 8px;
          background: #10b981; border: 2px solid #0f172a; border-radius: 50%;
        }
        .s-user-info { flex: 1; min-width: 0; }
        .s-username { display: block; color: #fff; font-size: 12px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .s-useremail { display: block; color: #475569; font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .s-logout-btn {
          background: none; border: none; color: #475569; cursor: pointer;
          padding: 5px; border-radius: 7px; display: flex; align-items: center; transition: 0.15s;
        }
        .s-logout-btn:hover { color: #ef4444; background: rgba(239,68,68,0.1); }
      `}</style>
    </aside>
  );
}
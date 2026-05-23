'use client';
import { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import useStore from '../../store/useStore';
import { IonIcon } from '@ionic/react';
import {
  arrowBackOutline,
  saveOutline,
  personOutline,
  locationOutline,
  homeOutline,
  briefcaseOutline,
  shieldCheckmarkOutline,
  checkmarkCircleOutline,
  lockClosedOutline,
  mailOutline,
  trashOutline,
  alertOutline,
  closeOutline,
  cameraOutline,
  callOutline,
  restaurantOutline,
  schoolOutline,
  businessOutline,
  bagHandleOutline,
  leafOutline,
  navigateOutline
} from 'ionicons/icons';
import { translations } from '../../store/translations';
import { useEffect, useRef } from 'react';

const COUNTRY_CODES = [
  { code: '+355', flag: '🇦🇱', name: 'Albania' },
  { code: '+383', flag: '🇽🇰', name: 'Kosovo' },
  { code: '+389', flag: '🇲🇰', name: 'North Macedonia' },
  { code: '+382', flag: '🇲🇪', name: 'Montenegro' },
  { code: '+30', flag: '🇬🇷', name: 'Greece' },
  { code: '+39', flag: '🇮🇹', name: 'Italy' },
  { code: '+49', flag: '🇩🇪', name: 'Germany' },
  { code: '+44', flag: '🇬🇧', name: 'UK' },
  { code: '+1', flag: '🇺🇸', name: 'USA' },
  // Add more if needed, but these are common
];

function PhoneInput({ country, setCountry, phone, setPhone, t }: { country: any; setCountry: (c: any) => void; phone: string; setPhone: (v: string) => void; t: any }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = COUNTRY_CODES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.includes(search)
  );

  return (
    <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
      <div style={{ position: 'relative' }} ref={dropdownRef}>
        <button type="button" onClick={() => setOpen(!open)} style={{
          height: '46px', background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.1)',
          borderRadius: '12px', color: '#fff', padding: '0 12px', display: 'flex', alignItems: 'center', gap: '8px',
          cursor: 'pointer', transition: 'all 0.2s'
        }}>
          <span style={{ fontSize: '18px' }}>{country.flag}</span>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>{country.code}</span>
        </button>

        {open && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 100,
            background: '#1a1d24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
            width: '220px', padding: '8px', boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
            backdropFilter: 'blur(20px)'
          }}>
            <input
              autoFocus placeholder="Kërko..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
                padding: '8px 10px', color: '#fff', fontSize: '12px', outline: 'none', marginBottom: '8px'
              }}
            />
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {filtered.map(c => (
                <button key={c.code} type="button" onClick={() => { setCountry(c); setOpen(false); setSearch(''); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '8px',
                    borderRadius: '6px', background: country.code === c.code ? 'rgba(255,255,255,0.1)' : 'transparent',
                    border: 'none', color: '#fff', cursor: 'pointer', textAlign: 'left'
                  }}>
                  <span style={{ fontSize: '16px' }}>{c.flag}</span>
                  <span style={{ flex: 1, fontSize: '12px' }}>{c.name}</span>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{c.code}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <input 
        style={{
          flex: 1, height: '46px', background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.1)',
          borderRadius: '12px', padding: '0 16px', color: '#fff', fontSize: '14px', outline: 'none'
        }} 
        type="tel" placeholder="6X XXX XXXX" value={phone} onChange={e => setPhone(e.target.value)} 
      />
    </div>
  );
}

export default function EditProfileView() {
  const user = useStore((state: any) => state.user);
  const staffUser = useStore((state: any) => state.staffUser);
  const updateProfile = useStore((state: any) => state.updateProfile);
  const setView = useStore((state: any) => state.setView);
  const addNotification = useStore((state: any) => state.addNotification);
  const language = useStore((state: any) => state.language);
  const t = translations[language] || translations.al;
  const logout = useStore((state: any) => state.logout);

  const activeUser = staffUser || user;
  const isStaff = !!staffUser;

  const [activeModal, setActiveModal] = useState<'delete' | null>(null);

  const handleDeleteAccount = () => {
    setActiveModal(null);
    logout();
    addNotification(t.edit_account_deleted, 'success');
  };

  const [isSaving, setIsSaving] = useState(false);


  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [phoneOnly, setPhoneOnly] = useState('');

  const [form, setForm] = useState({
    name: activeUser?.name || '',
    email: activeUser?.email || '',
    home: user?.savedLocations?.home || '',
    work: user?.savedLocations?.work || '',
    avatar: activeUser?.avatar || '',
    phone: activeUser?.phone || ''
  });

  // Saved locations suggestions state
  const [homeSuggestions, setHomeSuggestions] = useState<any[]>([]);
  const [showHomeSuggestions, setShowHomeSuggestions] = useState(false);
  const [isSearchingHome, setIsSearchingHome] = useState(false);
  const [isTypingHome, setIsTypingHome] = useState(false);

  const [workSuggestions, setWorkSuggestions] = useState<any[]>([]);
  const [showWorkSuggestions, setShowWorkSuggestions] = useState(false);
  const [isSearchingWork, setIsSearchingWork] = useState(false);
  const [isTypingWork, setIsTypingWork] = useState(false);

  const homeRef = useRef<HTMLDivElement>(null);
  const workRef = useRef<HTMLDivElement>(null);

  // Parse location suggestion details
  const parseAddressName = (item: any) => {
    const parts = item.display_name.split(',');
    const title = parts[0].trim();
    const subtitle = parts.slice(1, 4).map((p: string) => p.trim()).join(', ');
    return { title, subtitle, full: item.display_name };
  };

  const getPlaceIcon = (item: any) => {
    const cls = item.class;
    const type = item.type;
    if (cls === 'amenity') {
      if (type === 'restaurant' || type === 'cafe' || type === 'bar' || type === 'pub' || type === 'fast_food') {
        return { icon: restaurantOutline, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' };
      }
      if (type === 'school' || type === 'university' || type === 'college') {
        return { icon: schoolOutline, color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.1)' };
      }
      if (type === 'hospital' || type === 'clinic' || type === 'pharmacy') {
        return { icon: businessOutline, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' };
      }
    }
    if (cls === 'shop' || type === 'mall') {
      return { icon: bagHandleOutline, color: '#a855f7', bg: 'rgba(168, 85, 247, 0.1)' };
    }
    if (cls === 'tourism') {
      return { icon: businessOutline, color: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)' };
    }
    if (cls === 'leisure' && (type === 'park' || type === 'garden')) {
      return { icon: leafOutline, color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)' };
    }
    return { icon: locationOutline, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
  };

  const getCurrentPosition = async (options: any = {}) => {
    const fallbackToBrowser = async () => {
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        return new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, options);
        });
      }
      throw new Error('Geolocation not supported');
    };

    if (Capacitor.isNativePlatform()) {
      try {
        try {
          await Geolocation.requestPermissions();
        } catch (permissionError) {
          console.warn('Geolocation permission request failed:', permissionError);
        }
        return await Geolocation.getCurrentPosition(options);
      } catch (nativeError) {
        console.warn('Native geolocation failed, falling back to browser', nativeError);
        return await fallbackToBrowser();
      }
    }

    return await fallbackToBrowser();
  };

  const handleUseCurrentLocation = async (type: 'home' | 'work') => {
    if (type === 'home') setIsSearchingHome(true);
    else setIsSearchingWork(true);

    try {
      const position = await getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
      const { latitude, longitude } = position.coords;
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`, {
          headers: { 'User-Agent': 'UrbaniIm/1.0' }
        });
        const data = await res.json();
        if (data && data.display_name) {
          const parts = data.display_name.split(',');
          const title = parts[0].trim();
          const subtitle = parts.slice(1, 4).map((p: string) => p.trim()).join(', ');
          const addressText = title + (subtitle ? ', ' + subtitle : '');

          setForm(prev => ({ ...prev, [type]: addressText }));
        } else {
          alert(language === 'al' ? 'Nuk u gjet asnjë adresë për këtë vendndodhje.' : 'No address found for this location.');
        }
      } catch (err) {
        console.error('Error reverse geocoding current location:', err);
        alert(language === 'al' ? 'Gabim gjatë marrjes së adresës.' : 'Error fetching address for current location.');
      }
    } catch (error) {
      console.error('Geolocation error:', error);
      alert(language === 'al' ? 'U refuzua leja ose dështoi marrja e vendndodhjes.' : 'Permission denied or failed to retrieve location.');
    } finally {
      setIsSearchingHome(false);
      setIsSearchingWork(false);
      setShowHomeSuggestions(false);
      setShowWorkSuggestions(false);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (homeRef.current && !homeRef.current.contains(event.target as Node)) {
        setShowHomeSuggestions(false);
      }
      if (workRef.current && !workRef.current.contains(event.target as Node)) {
        setShowWorkSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Home Autocomplete Debounce Query (Nominatim OpenStreetMap search)
  useEffect(() => {
    if (!isTypingHome || form.home.length < 3) {
      setHomeSuggestions([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      setIsSearchingHome(true);
      try {
        // Appending ', Tirana' makes Nominatim prioritize POIs like shops, restaurants, businesses, etc.
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(form.home + ', Tirana')}&format=json&limit=10&addressdetails=1&countrycodes=al`, {
          headers: { 'User-Agent': 'UrbaniIm/1.0' }
        });
        const data = await res.json();
        if (data && Array.isArray(data)) {
          setHomeSuggestions(data);
          setShowHomeSuggestions(true);
        }
      } catch (err) {
        console.error('Autocomplete fetch error:', err);
      } finally {
        setIsSearchingHome(false);
      }
    }, 350);

    return () => clearTimeout(delayDebounce);
  }, [form.home, isTypingHome]);

  // Work Autocomplete Debounce Query (Nominatim OpenStreetMap search)
  useEffect(() => {
    if (!isTypingWork || form.work.length < 3) {
      setWorkSuggestions([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      setIsSearchingWork(true);
      try {
        // Appending ', Tirana' makes Nominatim prioritize POIs like shops, restaurants, businesses, etc.
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(form.work + ', Tirana')}&format=json&limit=10&addressdetails=1&countrycodes=al`, {
          headers: { 'User-Agent': 'UrbaniIm/1.0' }
        });
        const data = await res.json();
        if (data && Array.isArray(data)) {
          setWorkSuggestions(data);
          setShowWorkSuggestions(true);
        }
      } catch (err) {
        console.error('Autocomplete fetch error:', err);
      } finally {
        setIsSearchingWork(false);
      }
    }, 350);

    return () => clearTimeout(delayDebounce);
  }, [form.work]);

  // Efekti për të ndarë prefix-in nga numri kur ngarkohet useri
  useEffect(() => {
    if (activeUser?.phone) {
      const parts = activeUser.phone.split(' ');
      if (parts.length >= 2) {
        const prefix = parts[0];
        const num = parts.slice(1).join(' ');
        const country = COUNTRY_CODES.find(c => c.code === prefix);
        if (country) {
          setSelectedCountry(country);
          setPhoneOnly(num);
        } else {
          setPhoneOnly(activeUser.phone);
        }
      } else {
        setPhoneOnly(activeUser.phone);
      }
    }
  }, [activeUser]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, avatar: reader.result as string });
        addNotification(language === 'al' ? 'Fotoja u ngarkua! Mos harroni të ruani ndryshimet.' : 'Photo uploaded! Don\'t forget to save changes.', 'info');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!activeUser?.id && !activeUser?._id) {
      addNotification(t.edit_error_user_id, 'error');
      return;
    }

    setIsSaving(true);
    
    try {
      if (!isStaff) {
        const fullPhone = `${selectedCountry.code} ${phoneOnly}`;
        const response = await fetch('/api/user/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: activeUser.id || activeUser._id,
            name: form.name,
            email: form.email,
            phone: fullPhone,
            savedLocations: { home: form.home, work: form.work },
            avatar: form.avatar
          })
        });

        const result = await response.json();

        if (response.ok) {
          updateProfile({ 
            name: form.name, 
            email: form.email,
            phone: `${selectedCountry.code} ${phoneOnly}`,
            savedLocations: { home: form.home, work: form.work },
            avatar: form.avatar
          });
          addNotification(t.edit_changes_saved, 'success');
          setView('profile');
        } else {
          addNotification(result.error || 'Gabim gjatë ruajtjes.', 'error');
        }
      } else {
        // Staff persistence can be added here if needed
        addNotification(t.edit_changes_saved_local, 'info');
        setView('profile');
      }
    } catch (error) {
      console.error('Save error:', error);
      addNotification(t.edit_conn_error, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.03)',
    border: '0.5px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    padding: '12px 16px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s',
    marginTop: '6px'
  };

  const labelStyle = {
    fontSize: '11px',
    fontWeight: '700',
    color: 'rgba(255,255,255,0.25)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginLeft: '4px'
  };

  return (
    <>
      <div className="page-content">
        
        {/* ── Header ── */}
        <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={() => setView('profile')}
            style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff'
            }}
          >
            <IonIcon icon={arrowBackOutline} style={{ fontSize: 18 }} />
          </button>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', margin: 0 }}>{t.edit_credentials}</h1>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', margin: '2px 0 0 0' }}>{t.edit_update_details}</p>
          </div>
        </div>

        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          marginBottom: '32px', textAlign: 'center'
        }}>
          <div 
            style={{
              width: '84px', height: '84px', borderRadius: '28px',
              background: '#111318',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '32px', fontWeight: '600', color: '#fff',
              boxShadow: '0 12px 32px rgba(0,0,0,0.4), inset 0 2px 0 rgba(255,255,255,0.03)',
              marginBottom: '16px',
              position: 'relative',
              cursor: 'pointer',
              overflow: 'visible'
            }}
            onClick={() => document.getElementById('photo-upload')?.click()}
          >
            {form.avatar ? (
              <img src={form.avatar} style={{ width: '100%', height: '100%', borderRadius: '28px', objectFit: 'cover' }} alt="Profile" />
            ) : (
              activeUser?.name?.charAt(0) || 'U'
            )}
            
            <div style={{
              position: 'absolute', bottom: '-4px', right: '-4px',
              width: '28px', height: '28px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              zIndex: 2
            }}>
              <IonIcon icon={cameraOutline} style={{ fontSize: 14, color: '#fff' }} />
            </div>
            <input 
              type="file" 
              id="photo-upload" 
              style={{ display: 'none' }} 
              accept="image/*"
              onChange={handlePhotoUpload}
            />
          </div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#fff' }}>{activeUser?.name || 'Përdorues'}</h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>{activeUser?.email || 'Nuk ka email të regjistruar'}</p>
        </div>

        <style jsx>{`
          /* Minimalist styles */
        `}</style>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '24px',
          alignItems: 'start'
        }}>
          
          {/* Left Column: Personal Info */}
          <div style={{
            background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.07)',
            padding: '24px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '20px'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IonIcon icon={personOutline} style={{ fontSize: 16, color: '#475569' }} /> {t.edit_personal_info}
            </h3>
            
            <div>
              <label style={labelStyle}>{t.edit_full_name}</label>
              <input 
                style={inputStyle} 
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})}
              />
            </div>

            <div>
              <label style={labelStyle}>Email</label>
              <div style={{ position: 'relative' }}>
                <input 
                  style={{ ...inputStyle, paddingLeft: '40px' }} 
                  value={form.email} 
                  onChange={e => setForm({...form, email: e.target.value})}
                />
                <IonIcon icon={mailOutline} style={{ position: 'absolute', left: '14px', top: '22px', fontSize: 14, color: 'rgba(255,255,255,0.2)' }} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>{language === 'al' ? 'Numri i Telefonit' : 'Phone Number'}</label>
              <PhoneInput 
                country={selectedCountry} 
                setCountry={setSelectedCountry} 
                phone={phoneOnly} 
                setPhone={setPhoneOnly} 
                t={t} 
              />
            </div>

            {/* Security Info (Inside Left Col) */}
            <div style={{
              marginTop: '10px', padding: '16px', borderRadius: '16px',
              background: 'rgba(59,130,246,0.03)', border: '0.5px solid rgba(59,130,246,0.1)',
              display: 'flex', gap: '12px', alignItems: 'center'
            }}>
              <IonIcon icon={lockClosedOutline} style={{ fontSize: 14, color: '#475569' }} />
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', margin: 0, lineHeight: 1.5 }}>
                {t.security_notice}
              </p>
            </div>


          </div>

          {/* Right Column: Locations & Action */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {!isStaff && (
              <div style={{
                background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.07)',
                padding: '24px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '20px'
              }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IonIcon icon={locationOutline} style={{ fontSize: 16, color: '#10b981' }} /> {t.saved_places}
                </h3>

                <div ref={homeRef} style={{ position: 'relative' }}>
                  <label style={labelStyle}>{t.home}</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      style={{ ...inputStyle, paddingLeft: '40px', paddingRight: '40px' }} 
                      value={form.home} 
                      onChange={e => {
                        setForm({...form, home: e.target.value});
                        setIsTypingHome(true);
                        setShowHomeSuggestions(true);
                      }}
                      onFocus={() => setShowHomeSuggestions(true)}
                      placeholder={t.edit_add_address}
                    />
                    <IonIcon icon={homeOutline} style={{ position: 'absolute', left: '14px', top: '22px', fontSize: 14, color: 'rgba(255,255,255,0.2)' }} />
                    
                    {isSearchingHome && (
                      <div style={{ position: 'absolute', right: '14px', top: '22px', display: 'flex', alignItems: 'center' }}>
                        <div style={{ width: '12px', height: '12px', border: '1.5px solid rgba(255,255,255,0.1)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                      </div>
                    )}
                  </div>

                  {showHomeSuggestions && (
                    <div style={{
                      position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000, marginTop: '6px',
                      background: '#1a1d24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
                      boxShadow: '0 12px 40px rgba(0,0,0,0.6)', maxHeight: '220px', overflowY: 'auto', padding: '6px',
                      backdropFilter: 'blur(20px)'
                    }}>
                      {/* Current Location Option */}
                      <button
                        type="button"
                        onClick={() => handleUseCurrentLocation('home')}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                          padding: '12px 12px 14px 12px', borderRadius: '0px',
                          background: 'none', border: 'none',
                          borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#3b82f6',
                          cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', marginBottom: '8px'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                      >
                        <div style={{
                          width: '24px', height: '24px', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <div style={{
                            width: '14px', height: '14px', borderRadius: '50%',
                            border: '2px solid #3b82f6', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', flexShrink: 0
                          }}>
                            <div style={{
                              width: '6px', height: '6px', borderRadius: '50%',
                              background: '#3b82f6'
                            }} />
                          </div>
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: '700' }}>
                          {language === 'al' ? 'Përdor vendndodhjen aktuale' : 'Use current location'}
                        </span>
                      </button>
                      {homeSuggestions.map((item, idx) => {
                        const parsed = parseAddressName(item);
                        const placeIcon = getPlaceIcon(item);
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setForm({ ...form, home: parsed.title + (parsed.subtitle ? ', ' + parsed.subtitle : '') });
                              setIsTypingHome(false);
                              setShowHomeSuggestions(false);
                            }}
                            style={{
                              width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px',
                              borderRadius: '8px', background: 'transparent', border: 'none', color: '#fff',
                              cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s'
                            }}
                            className="suggestion-item"
                          >
                            <div style={{
                              width: '24px', height: '24px', display: 'flex',
                              alignItems: 'center', justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              <IonIcon icon={placeIcon.icon} style={{ fontSize: 16, color: placeIcon.color }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                              <span style={{ fontSize: '13px', fontWeight: '600', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{parsed.title}</span>
                              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{parsed.subtitle}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div ref={workRef} style={{ position: 'relative' }}>
                  <label style={labelStyle}>{t.work}</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      style={{ ...inputStyle, paddingLeft: '40px', paddingRight: '40px' }} 
                      value={form.work} 
                      onChange={e => {
                        setForm({...form, work: e.target.value});
                        setIsTypingWork(true);
                        setShowWorkSuggestions(true);
                      }}
                      onFocus={() => setShowWorkSuggestions(true)}
                      placeholder={t.edit_add_address}
                    />
                    <IonIcon icon={briefcaseOutline} style={{ position: 'absolute', left: '14px', top: '22px', fontSize: 14, color: 'rgba(255,255,255,0.2)' }} />
                    
                    {isSearchingWork && (
                      <div style={{ position: 'absolute', right: '14px', top: '22px', display: 'flex', alignItems: 'center' }}>
                        <div style={{ width: '12px', height: '12px', border: '1.5px solid rgba(255,255,255,0.1)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                      </div>
                    )}
                  </div>

                  {showWorkSuggestions && (
                    <div style={{
                      position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000, marginTop: '6px',
                      background: '#1a1d24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
                      boxShadow: '0 12px 40px rgba(0,0,0,0.6)', maxHeight: '220px', overflowY: 'auto', padding: '6px',
                      backdropFilter: 'blur(20px)'
                    }}>
                      {/* Current Location Option */}
                      <button
                        type="button"
                        onClick={() => handleUseCurrentLocation('work')}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                          padding: '12px 12px 14px 12px', borderRadius: '0px',
                          background: 'none', border: 'none',
                          borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#3b82f6',
                          cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', marginBottom: '8px'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                      >
                        <div style={{
                          width: '24px', height: '24px', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <div style={{
                            width: '14px', height: '14px', borderRadius: '50%',
                            border: '2px solid #3b82f6', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', flexShrink: 0
                          }}>
                            <div style={{
                              width: '6px', height: '6px', borderRadius: '50%',
                              background: '#3b82f6'
                            }} />
                          </div>
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: '700' }}>
                          {language === 'al' ? 'Përdor vendndodhjen aktuale' : 'Use current location'}
                        </span>
                      </button>
                      {workSuggestions.map((item, idx) => {
                        const parsed = parseAddressName(item);
                        const placeIcon = getPlaceIcon(item);
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setForm({ ...form, work: parsed.title + (parsed.subtitle ? ', ' + parsed.subtitle : '') });
                              setIsTypingWork(false);
                              setShowWorkSuggestions(false);
                            }}
                            style={{
                              width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px',
                              borderRadius: '8px', background: 'transparent', border: 'none', color: '#fff',
                              cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s'
                            }}
                            className="suggestion-item"
                          >
                            <div style={{
                              width: '24px', height: '24px', display: 'flex',
                              alignItems: 'center', justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              <IonIcon icon={placeIcon.icon} style={{ fontSize: 16, color: placeIcon.color }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                              <span style={{ fontSize: '13px', fontWeight: '600', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{parsed.title}</span>
                              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{parsed.subtitle}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Save Button Container */}
            <div style={{
              background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.07)',
              padding: '20px', borderRadius: '24px', marginTop: isStaff ? '0' : 'auto'
            }}>
              <button 
                onClick={handleSave} 
                disabled={isSaving}
                style={{
                  width: '100%', padding: '14px', borderRadius: '14px',
                  background: isSaving ? 'rgba(255,255,255,0.05)' : '#fff',
                  color: isSaving ? 'rgba(255,255,255,0.2)' : '#000',
                  border: 'none', fontWeight: '700', fontSize: '14px',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  transition: 'all 0.2s',
                  boxShadow: isSaving ? 'none' : '0 8px 24px rgba(255,255,255,0.15)'
                }}
              >
                {isSaving ? (
                  <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                ) : (
                  <><IonIcon icon={saveOutline} style={{ fontSize: 16 }} /> {t.edit_save_changes}</>
                )}
              </button>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: '12px', padding: '0 10px' }}>
                {t.edit_changes_applied_immediate}
              </p>
            </div>

            {/* Delete Account */}
            <button 
              onClick={() => setActiveModal('delete')}
              style={{
                width: '100%', padding: '14px', borderRadius: '14px',
                background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)',
                color: '#ef4444', fontWeight: '600', fontSize: '14px', marginTop: '12px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                transition: 'all 0.2s'
              }}
            >
              <IonIcon icon={trashOutline} style={{ fontSize: 16 }} /> {t.edit_delete_account}
            </button>
          </div>
        </div>

        {/* MODAL */}
        {activeModal === 'delete' && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
            zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px', animation: 'fadeIn 0.2s ease'
          }}>
            <div style={{
              background: '#1a1d24', borderRadius: '16px', width: '100%', maxWidth: '300px',
              padding: '24px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#fff' }}>
                {t.edit_delete_account}
              </h3>
              <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.5' }}>
                {t.edit_delete_confirm}
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setActiveModal(null)} style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>
                  {t.edit_cancel}
                </button>
                <button onClick={handleDeleteAccount} style={{ flex: 1, padding: '12px', background: '#ef4444', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>
                  {t.edit_delete}
                </button>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .suggestion-item:hover {
            background: rgba(255,255,255,0.06) !important;
          }
        `}</style>
      </div>
    </>
  );
}

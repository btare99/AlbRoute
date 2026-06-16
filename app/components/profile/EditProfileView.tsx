'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import useStore from '../../store/useStore';
import { IonIcon } from '@/app/components/common/IonIcon';
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
  navigateOutline,
  busOutline,
  chevronForwardOutline,
  eyeOutline,
  eyeOffOutline
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
        <motion.button
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={() => setOpen(!open)}
          style={{
            height: '46px', background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.1)',
            borderRadius: '12px', color: '#fff', padding: '0 12px', display: 'flex', alignItems: 'center', gap: '8px',
            cursor: 'pointer', transition: 'all 0.2s'
          }}
          className="phone-country-btn"
        >
          <span style={{ fontSize: '18px' }}>{country.flag}</span>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>{country.code}</span>
        </motion.button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 100,
                background: '#1a1d24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
                width: '220px', padding: '8px', boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
                backdropFilter: 'blur(20px)'
              }}
            >
              <input
                autoFocus placeholder="Kërko..."
                value={search} onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
                  padding: '8px 10px', color: '#fff', fontSize: '12px', outline: 'none', marginBottom: '8px'
                }}
                className="profile-search-input"
              />
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {filtered.map(c => (
                  <button key={c.code} type="button" onClick={() => { setCountry(c); setOpen(false); setSearch(''); }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '8px',
                      borderRadius: '6px', background: country.code === c.code ? 'rgba(255,255,255,0.1)' : 'transparent',
                      border: 'none', color: '#fff', cursor: 'pointer', textAlign: 'left'
                    }}
                    className="dropdown-item"
                  >
                    <span style={{ fontSize: '16px' }}>{c.flag}</span>
                    <span style={{ flex: 1, fontSize: '12px' }}>{c.name}</span>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{c.code}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <input
        className="profile-input"
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

  useEffect(() => {
    if (useStore.getState().guestMode) {
      setView('profile');
    }
  }, [setView]);

  const currentCoverIndex = useStore((state: any) => state.currentCoverIndex);

  const activeUser = staffUser || user;
  const isStaff = !!staffUser;

  const isAl = language === 'al';
  const isIt = language === 'it';

  const [isSaving, setIsSaving] = useState(false);
  const [currentSubView, setCurrentSubView] = useState<'menu' | 'credentials' | 'locations' | 'password'>('menu');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      addNotification(isAl ? 'Të gjitha fushat janë të detyrueshme.' : isIt ? 'Tutti i campi sono obbligatori.' : 'All fields are required.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      addNotification(t.edit_passwords_dont_match || 'New passwords do not match.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      addNotification(t.edit_password_too_short || 'Password must be at least 6 characters.', 'error');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: activeUser.id || activeUser._id,
          currentPassword,
          newPassword
        })
      });
      const result = await response.json();
      if (response.ok) {
        addNotification(t.edit_password_updated || 'Password updated successfully!', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setCurrentSubView('menu');
      } else {
        addNotification(result.error || 'Gabim gjatë ndryshimit të fjalëkalimit.', 'error');
      }
    } catch (error) {
      console.error('Password update error:', error);
      addNotification(t.edit_conn_error || 'Gabim lidhjeje.', 'error');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

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
      const position = await getCurrentPosition({ enableHighAccuracy: true, timeout: 20000 });
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
          alert(t.no_address_found);
        }
      } catch (err) {
        console.error('Error reverse geocoding current location:', err);
        alert(t.error_fetching_address);
      }
    } catch (error) {
      console.error('Geolocation error:', error);
      alert(t.location_permission_error);
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
        addNotification(t.photo_upload_success, 'info');
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
          }, true);
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{ height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)', position: 'relative' }}
    >

      {/* Curved Gradient Header (Cover) */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        style={{
          position: 'relative',
          height: 'calc(170px + env(safe-area-inset-top, 0px))',
          overflow: 'visible',
          boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
          zIndex: 10,
          background: '#0a0f1d'
        }}
      >
        {/* Slideshow background images */}
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num, i) => (
          <div
            key={num}
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(135deg, rgba(245, 158, 11, 0.8) 0%, rgba(234, 88, 12, 0.85) 100%), url("/tirana_cover_${num}.png") center/cover no-repeat`,
              opacity: currentCoverIndex === i ? 1 : 0,
              transition: 'opacity 1.5s ease-in-out',
              zIndex: 0
            }}
          />
        ))}
        {/* Navigation header with Back button */}
        <div style={{
          position: 'absolute', top: 'calc(12px + env(safe-area-inset-top, 0px))', left: '20px', right: '20px',
          display: 'flex', alignItems: 'center', zIndex: 5
        }}>
          {/* Back Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => currentSubView === 'menu' ? setView('profile') : setCurrentSubView('menu')}
            style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff',
              outline: 'none'
            }}
          >
            <IonIcon icon={arrowBackOutline} style={{ fontSize: 18 }} />
          </motion.button>

          {/* Centered Title */}
          <div style={{
            position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none'
          }}>
            <span style={{
              color: '#fff', fontSize: '18px', fontWeight: '800',
              letterSpacing: '0.02em', textShadow: '0 2px 4px rgba(0,0,0,0.15)'
            }}>
              {currentSubView === 'menu' ? (isAl ? "Të dhënat e mia" : isIt ? "I miei dati" : "My Data") :
               currentSubView === 'credentials' ? (isAl ? "Ndrysho Kredencialet" : isIt ? "Modifica Credenziali" : "Edit Credentials") :
               currentSubView === 'locations' ? (isAl ? "Lokacionet e Mia" : isIt ? "I miei luoghi" : "Saved Locations") :
               (isAl ? "Ndrysho Fjalëkalimin" : isIt ? "Cambia Password" : "Change Password")}
            </span>
          </div>
        </div>

        {/* Organic Wave Bottom Divider */}
        <svg viewBox="0 0 1440 220" preserveAspectRatio="none" style={{ position: 'absolute', bottom: -1, left: 0, width: '100%', height: '45px', zIndex: 2 }}>
          <path fill="var(--bg-dark)" d="M0,160 C 180,160 180,210 360,210 C 540,210 540,110 720,110 C 900,110 900,210 1080,210 C 1260,210 1260,160 1440,160 L 1440,220 L 0,220 Z"></path>
        </svg>

        {/* Overlapping Floating Avatar wrapper (for Photo Upload / Change) */}
        <motion.div
          initial={{ scale: 0, opacity: 0, x: '-50%' }}
          animate={{ scale: 1, opacity: 1, x: '-50%' }}
          whileHover={{ scale: 1.05, x: '-50%' }}
          transition={{ type: 'spring', stiffness: 150, damping: 12, delay: 0.15 }}
          style={{
            position: 'absolute',
            bottom: '-45px', // overlaps the wave
            left: '50%',
            display: 'flex',
            justifyContent: 'center',
            zIndex: 11,
            cursor: 'pointer'
          }}
          onClick={() => document.getElementById('photo-upload')?.click()}
          onMouseEnter={(e) => {
            const overlay = e.currentTarget.querySelector('.avatar-hover-overlay') as HTMLElement;
            if (overlay) overlay.style.opacity = '1';
          }}
          onMouseLeave={(e) => {
            const overlay = e.currentTarget.querySelector('.avatar-hover-overlay') as HTMLElement;
            if (overlay) overlay.style.opacity = '0';
          }}
        >
          {/* Circular Container with Background Color Border */}
          <div style={{
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            border: '4px solid var(--bg-dark)',
            background: '#111318',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            fontWeight: '700',
            color: '#fff',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.6), 0 8px 25px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255,255,255,0.08)'
          }}>
            {form.avatar ? (
              <img src={form.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Profile" />
            ) : (
              activeUser?.name?.charAt(0) || 'U'
            )}

            {/* Dark glass hover overlay */}
            <div
              className="avatar-hover-overlay"
              style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: 0,
                transition: 'opacity 0.2s ease',
                zIndex: 1
              }}
            >
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {isAl ? "Ndrysho" : "Change"}
              </span>
            </div>
          </div>

          {/* Camera icon badge */}
          <div style={{
            position: 'absolute', bottom: '0px', right: '0px',
            width: '28px', height: '28px', borderRadius: '50%',
            background: '#ea580c',
            border: '2px solid var(--bg-dark)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: 2,
            color: '#fff'
          }}>
            <IonIcon icon={cameraOutline} style={{ fontSize: 13 }} />
          </div>

          <input
            type="file"
            id="photo-upload"
            style={{ display: 'none' }}
            accept="image/*"
            onChange={handlePhotoUpload}
          />
        </motion.div>
      </motion.div>

      {/* Content scroll area */}
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: 'calc(80px + max(24px, calc(16px + env(safe-area-inset-bottom, 12px))))', marginTop: '60px' }}>

        {/* User name & email labels (moved below overlapping avatar) */}
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 120, damping: 15, delay: 0.25 }}
          style={{ textAlign: 'center', marginBottom: '16px' }}
        >
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#fff' }}>{activeUser?.name || 'Përdorues'}</h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>{activeUser?.email || 'Nuk ka email të regjistruar'}</p>
        </motion.div>

        <div style={{
          width: '100%',
          maxWidth: '600px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {currentSubView === 'menu' && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 100, damping: 16 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                width: '100%'
              }}
            >
              {[
                {
                  icon: personOutline,
                  label: isAl ? "Të dhënat Personale" : isIt ? "Dati Personali" : "Personal Credentials",
                  sub: isAl ? "Ndrysho emrin, email-in dhe numrin e telefonit" : isIt ? "Modifica nome, email e numero di telefono" : "Change name, email, and phone number",
                  action: () => setCurrentSubView('credentials')
                },
                ...(!isStaff ? [{
                  icon: locationOutline,
                  label: isAl ? "Lokacionet e Mia" : isIt ? "I miei luoghi" : "Saved Locations",
                  sub: isAl ? "Shtëpia, puna dhe vende të tjera të shpeshta" : isIt ? "Casa, lavoro e altri luoghi frequenti" : "Home, work, and other frequent places",
                  action: () => setCurrentSubView('locations')
                }] : []),
                {
                  icon: lockClosedOutline,
                  label: isAl ? "Ndrysho Fjalëkalimin" : isIt ? "Cambia Password" : "Change Password",
                  sub: isAl ? "Përditëso fjalëkalimin e llogarisë tuaj" : isIt ? "Aggiorna la password del tuo account" : "Update your account password",
                  action: () => setCurrentSubView('password')
                },
                {
                  icon: trashOutline,
                  label: isAl ? "Fshi Llogarinë" : isIt ? "Elimina Account" : "Delete Account",
                  sub: isAl ? "Fshirja e përhershme e llogarisë tuaj" : isIt ? "Eliminazione permanente del tuo account" : "Permanently delete your account",
                  action: () => setView('delete_account'),
                  isDestructive: true
                }
              ].map((item, idx, arr) => (
                <button
                  key={idx}
                  onClick={item.action}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '16px',
                    background: 'rgba(255,255,255,0.03)',
                    backdropFilter: 'blur(40px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '20px',
                    padding: '18px 20px', cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    outline: 'none',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.borderColor = item.isDestructive ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  }}
                >
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '12px',
                    background: item.isDestructive ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.04)',
                    border: item.isDestructive ? '1px solid rgba(239,68,68,0.15)' : '1px solid rgba(255,255,255,0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: item.isDestructive ? '#ef4444' : '#ea580c',
                    flexShrink: 0
                  }}>
                    <IonIcon icon={item.icon} style={{ fontSize: '20px' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: '15px', fontWeight: '700', color: item.isDestructive ? '#ef4444' : '#fff' }}>{item.label}</span>
                    <span style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.sub}
                    </span>
                  </div>
                  <IonIcon icon={chevronForwardOutline} style={{ fontSize: '16px', color: item.isDestructive ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.2)' }} />
                </button>
              ))}
            </motion.div>
          )}

          {currentSubView === 'credentials' && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 100, damping: 16 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}
            >
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(40px) saturate(180%)',
                WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                border: '0.5px solid rgba(255,255,255,0.09)',
                padding: '24px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '20px'
              }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IonIcon icon={personOutline} style={{ fontSize: 16, color: '#ea580c' }} /> {t.edit_personal_info}
                </h3>

                <div>
                  <label style={labelStyle}>{t.edit_full_name}</label>
                  <input
                    className="profile-input"
                    style={inputStyle}
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Email</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      className="profile-input"
                      style={{ ...inputStyle, paddingLeft: '40px' }}
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                    />
                    <div className="input-icon-container" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', marginTop: '3px', transition: 'color 0.2s' }}>
                      <IonIcon icon={mailOutline} style={{ fontSize: 16 }} />
                    </div>
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>{t.phone_number}</label>
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

              {/* Save Button Card */}
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(40px) saturate(180%)',
                WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                border: '0.5px solid rgba(255,255,255,0.09)',
                padding: '20px', borderRadius: '24px'
              }}>
                <motion.button
                  whileTap={isSaving ? {} : { scale: 0.98 }}
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
                </motion.button>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: '12px', padding: '0 10px' }}>
                  {t.edit_changes_applied_immediate}
                </p>
              </div>
            </motion.div>
          )}

          {currentSubView === 'locations' && !isStaff && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 100, damping: 16 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}
            >
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(40px) saturate(180%)',
                WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                border: '0.5px solid rgba(255,255,255,0.09)',
                padding: '24px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '20px'
              }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IonIcon icon={locationOutline} style={{ fontSize: 16, color: '#10b981' }} /> {t.saved_places}
                </h3>

                <div ref={homeRef} style={{ position: 'relative' }}>
                  <label style={labelStyle}>{t.home}</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      className="profile-input"
                      style={{ ...inputStyle, paddingLeft: '40px', paddingRight: '40px' }}
                      value={form.home}
                      onChange={e => {
                        setForm({ ...form, home: e.target.value });
                        setIsTypingHome(true);
                        setShowHomeSuggestions(true);
                      }}
                      onFocus={() => setShowHomeSuggestions(true)}
                      placeholder={t.edit_add_address}
                    />
                    <div className="input-icon-container" style={{ position: 'absolute', left: '14px', top: '22px', display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.2)', transition: 'color 0.2s' }}>
                      <IonIcon icon={homeOutline} style={{ fontSize: 14 }} />
                    </div>

                    {isSearchingHome && (
                      <div style={{ position: 'absolute', right: '14px', top: '22px', display: 'flex', alignItems: 'center' }}>
                        <div style={{ width: '12px', height: '12px', border: '1.5px solid rgba(255,255,255,0.1)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                      </div>
                    )}
                  </div>

                  <AnimatePresence>
                    {showHomeSuggestions && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000, marginTop: '6px',
                          background: '#1a1d24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
                          boxShadow: '0 12px 40px rgba(0,0,0,0.6)', maxHeight: '220px', overflowY: 'auto', padding: '6px',
                          backdropFilter: 'blur(20px)'
                        }}
                      >
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
                            {t.use_current_location}
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
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div ref={workRef} style={{ position: 'relative' }}>
                  <label style={labelStyle}>{t.work}</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      className="profile-input"
                      style={{ ...inputStyle, paddingLeft: '40px', paddingRight: '40px' }}
                      value={form.work}
                      onChange={e => {
                        setForm({ ...form, work: e.target.value });
                        setIsTypingWork(true);
                        setShowWorkSuggestions(true);
                      }}
                      onFocus={() => setShowWorkSuggestions(true)}
                      placeholder={t.edit_add_address}
                    />
                    <div className="input-icon-container" style={{ position: 'absolute', left: '14px', top: '22px', display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.2)', transition: 'color 0.2s' }}>
                      <IonIcon icon={briefcaseOutline} style={{ fontSize: 14 }} />
                    </div>

                    {isSearchingWork && (
                      <div style={{ position: 'absolute', right: '14px', top: '22px', display: 'flex', alignItems: 'center' }}>
                        <div style={{ width: '12px', height: '12px', border: '1.5px solid rgba(255,255,255,0.1)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                      </div>
                    )}
                  </div>

                  <AnimatePresence>
                    {showWorkSuggestions && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000, marginTop: '6px',
                          background: '#1a1d24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
                          boxShadow: '0 12px 40px rgba(0,0,0,0.6)', maxHeight: '220px', overflowY: 'auto', padding: '6px',
                          backdropFilter: 'blur(20px)'
                        }}
                      >
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
                            {t.use_current_location}
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
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Save Button Card */}
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(40px) saturate(180%)',
                WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                border: '0.5px solid rgba(255,255,255,0.09)',
                padding: '20px', borderRadius: '24px'
              }}>
                <motion.button
                  whileTap={isSaving ? {} : { scale: 0.98 }}
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
                </motion.button>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: '12px', padding: '0 10px' }}>
                  {t.edit_changes_applied_immediate}
                </p>
              </div>
            </motion.div>
          )}

          {currentSubView === 'password' && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 100, damping: 16 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}
            >
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(40px) saturate(180%)',
                WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                border: '0.5px solid rgba(255,255,255,0.09)',
                padding: '24px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '20px'
              }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IonIcon icon={lockClosedOutline} style={{ fontSize: 16, color: '#ea580c' }} /> {t.edit_change_password}
                </h3>

                {/* Current Password */}
                <div>
                  <label style={labelStyle}>{t.edit_current_password}</label>
                  <div style={{ position: 'relative', marginTop: '6px' }}>
                    <input
                      type={showCurrentPass ? 'text' : 'password'}
                      className="profile-input"
                      style={{ ...inputStyle, marginTop: 0, paddingRight: '46px' }}
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      style={{
                        position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer',
                        display: 'flex', alignItems: 'center'
                      }}
                    >
                      <IonIcon icon={showCurrentPass ? eyeOffOutline : eyeOutline} style={{ fontSize: 18 }} />
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label style={labelStyle}>{t.edit_new_password}</label>
                  <div style={{ position: 'relative', marginTop: '6px' }}>
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      className="profile-input"
                      style={{ ...inputStyle, marginTop: 0, paddingRight: '46px' }}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      style={{
                        position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer',
                        display: 'flex', alignItems: 'center'
                      }}
                    >
                      <IonIcon icon={showNewPass ? eyeOffOutline : eyeOutline} style={{ fontSize: 18 }} />
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label style={labelStyle}>{t.edit_confirm_new_password}</label>
                  <div style={{ position: 'relative', marginTop: '6px' }}>
                    <input
                      type={showConfirmPass ? 'text' : 'password'}
                      className="profile-input"
                      style={{ ...inputStyle, marginTop: 0, paddingRight: '46px' }}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      style={{
                        position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer',
                        display: 'flex', alignItems: 'center'
                      }}
                    >
                      <IonIcon icon={showConfirmPass ? eyeOffOutline : eyeOutline} style={{ fontSize: 18 }} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Save Password Button Container */}
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(40px) saturate(180%)',
                WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                border: '0.5px solid rgba(255,255,255,0.09)',
                padding: '20px', borderRadius: '24px'
              }}>
                <motion.button
                  whileTap={isUpdatingPassword ? {} : { scale: 0.98 }}
                  onClick={handleUpdatePassword}
                  disabled={isUpdatingPassword}
                  style={{
                    width: '100%', padding: '14px', borderRadius: '14px',
                    background: isUpdatingPassword ? 'rgba(255,255,255,0.05)' : '#fff',
                    color: isUpdatingPassword ? 'rgba(255,255,255,0.2)' : '#000',
                    border: 'none', fontWeight: '700', fontSize: '14px',
                    cursor: isUpdatingPassword ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    transition: 'all 0.2s',
                    boxShadow: isUpdatingPassword ? 'none' : '0 8px 24px rgba(255,255,255,0.15)'
                  }}
                >
                  {isUpdatingPassword ? (
                    <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  ) : (
                    <><IonIcon icon={saveOutline} style={{ fontSize: 16 }} /> {t.edit_save_changes}</>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>

        <style jsx>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .suggestion-item:hover {
            background: rgba(255,255,255,0.06) !important;
          }
          .profile-input {
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
          }
          .profile-input:focus {
            border-color: #ea580c !important;
            box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.15) !important;
            background: rgba(255,255,255,0.05) !important;
          }
          .profile-input:focus + .input-icon-container {
            color: #ea580c !important;
          }
          .phone-country-btn {
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
          }
          .phone-country-btn:hover {
            border-color: rgba(255,255,255,0.2) !important;
            background: rgba(255,255,255,0.06) !important;
          }
          .phone-country-btn:focus {
            border-color: #ea580c !important;
            box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.15) !important;
          }
          .profile-search-input:focus {
            border-color: #ea580c !important;
            box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.15) !important;
            background: rgba(255,255,255,0.08) !important;
          }
          .dropdown-item:hover {
            background: rgba(255,255,255,0.05) !important;
          }
          .delete-account-btn:hover {
            background: rgba(239, 68, 68, 0.1) !important;
            border-color: rgba(239, 68, 68, 0.3) !important;
          }
        `}</style>
      </div>
    </motion.div>
  );
}

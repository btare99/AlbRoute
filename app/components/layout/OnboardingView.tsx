'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../../store/useStore';

interface OnboardingViewProps {
  onComplete: () => void;
  language: 'al' | 'en' | 'it';
}

const translations = {
  al: {
    skip: 'Kalo',
    next: 'Vazhdo',
    finish: 'Fillo Tani',
    slides: [
      {
        tag: 'Mirë se vini',
        title: 'Autobusi\ntek dora juaj.',
        description: 'Urbani Im është udhëzuesi zyrtar i transportit publik të Tiranës. Gjurmoni linjat, planifikoni rrugët dhe udhëtoni pa stres.',
        accent: '#3b82f6',
        accentDim: '#1e3a5f',
        feature: null,
      },
      {
        tag: 'Harta Live',
        title: 'Shihni\nautobusët tani.',
        description: 'GPS i instaluar në çdo autobus dërgon pozicionin në kohë reale. Ju e dini saktësisht kur mbërrin autobusi — pa supozime.',
        accent: '#10b981',
        accentDim: '#064e35',
        feature: {
          label: 'Si funksionon:',
          steps: ['Hapni hartën', 'Zgjidhni linjën tuaj', 'Shikoni autobusin live'],
        },
      },
      {
        tag: 'Planifikues',
        title: 'Vendos destinacionin,\nne gjejmë rrugën.',
        description: 'Shkruani ku doni të shkoni. Algoritmi sugjeron kombinimin më të mirë të linjave me kohën e saktë të mbërritjes.',
        accent: '#8b5cf6',
        accentDim: '#3b1f6e',
        feature: {
          label: 'Si funksionon:',
          steps: ['Shkruani destinacionin', 'Zgjidhni rrugën', 'Filloni udhëtimin'],
        },
      },
      {
        tag: 'Të preferuarat',
        title: 'Ruani\nlinjat tuaja.',
        description: 'Shtypni zemrën pranë çdo linje për ta ruajtur. Aktivizoni njoftimet dhe merrni sinjalizim kur autobusi po afrohet.',
        accent: '#f43f5e',
        accentDim: '#6b0f24',
        feature: {
          label: 'Interakto me kartat më poshtë:',
          steps: ['Klikoni zemrat për t\'i shtuar në favorite', 'Aktivizoni notifikimet e afërsisë'],
        },
      },
      {
        tag: 'Bileta Digjitale',
        title: 'Blini biletën\nnë aplikacion.',
        description: 'Bileta dhe abonetë direkt në telefon. Gjeneroni kodin QR dhe hipni në autobus pa bileta fizike.',
        accent: '#f59e0b',
        accentDim: '#6b3f05',
        feature: {
          label: 'Pranon pagesa me:',
          steps: ['Kartë krediti / debiti', 'Banka online e shpejtë', 'Kupon & Zbritje studentore'],
        },
      },
    ],
  },
  en: {
    skip: 'Skip',
    next: 'Next',
    finish: 'Get Started',
    slides: [
      {
        tag: 'Welcome',
        title: 'Your bus,\nat your fingertips.',
        description: 'Urbani Im is the official public transport guide for Tirana. Track lines, plan routes, and travel without stress.',
        accent: '#3b82f6',
        accentDim: '#1e3a5f',
        feature: null,
      },
      {
        tag: 'Live Map',
        title: 'See buses\nmoving right now.',
        description: 'GPS installed on every bus sends real-time position data. You know exactly when your bus arrives — no guessing.',
        accent: '#10b981',
        accentDim: '#064e35',
        feature: {
          label: 'How it works:',
          steps: ['Open the map', 'Choose your line', 'Watch the bus live'],
        },
      },
      {
        tag: 'Trip Planner',
        title: 'Set destination,\nwe find the way.',
        description: 'Type where you want to go. Our algorithm suggests the best combination of lines with exact arrival times.',
        accent: '#8b5cf6',
        accentDim: '#3b1f6e',
        feature: {
          label: 'How it works:',
          steps: ['Enter destination', 'Pick a route', 'Start your trip'],
        },
      },
      {
        tag: 'Favourites',
        title: 'Save your\ndaily lines.',
        description: 'Tap the heart next to any line to save it. Enable notifications and get an alert when your bus is nearby.',
        accent: '#f43f5e',
        accentDim: '#6b0f24',
        feature: {
          label: 'Interact with the cards below:',
          steps: ['Click hearts to toggle favorites', 'Enable proximity push notifications'],
        },
      },
      {
        tag: 'Digital Tickets',
        title: 'Buy your ticket\nin the app.',
        description: 'Tickets and passes straight from your phone. Generate a QR code and board the bus — no physical ticket needed.',
        accent: '#f59e0b',
        accentDim: '#6b3f05',
        feature: {
          label: 'Accepts payments via:',
          steps: ['Credit / debit cards', 'Instant mobile banking', 'Student vouchers & discounts'],
        },
      },
    ],
  },
  it: {
    skip: 'Salta',
    next: 'Avanti',
    finish: 'Inizia',
    slides: [
      {
        tag: 'Benvenuto',
        title: 'Il tuo bus,\nsempre a portata.',
        description: 'Urbani Im è la guida ufficiale del trasporto pubblico di Tirana. Monitora le linee, pianifica i percorsi e viaggia senza stress.',
        accent: '#3b82f6',
        accentDim: '#1e3a5f',
        feature: null,
      },
      {
        tag: 'Mappa Live',
        title: 'Vedi i bus in\nmovimento adesso.',
        description: 'Il GPS installato su ogni autobus invia la posizione in tempo reale. Sai esattamente quando arriva il tuo bus.',
        accent: '#10b981',
        accentDim: '#064e35',
        feature: {
          label: 'Come funziona:',
          steps: ['Apri la mappa', 'Scegli la linea', 'Guarda il bus live'],
        },
      },
      {
        tag: 'Pianificatore',
        title: 'Inserisci la meta,\nci pensiamo noi.',
        description: 'Scrivi dove vuoi andare. Il nostro algoritmo suggerisce la combinazione migliore di linee con orari di arrivo precisi.',
        accent: '#8b5cf6',
        accentDim: '#3b1f6e',
        feature: {
          label: 'Come funziona:',
          steps: ['Inserisci la destinazione', 'Scegli il percorso', 'Inizia il viaggio'],
        },
      },
      {
        tag: 'Preferiti',
        title: 'Salva le tue\nlinee abituali.',
        description: 'Tocca il cuore accanto a qualsiasi linea per salvarla. Attiva le notifiche e ricevi un avviso quando il bus è vicino.',
        accent: '#f43f5e',
        accentDim: '#6b0f24',
        feature: {
          label: 'Interagisci con le schede sotto:',
          steps: ['Clicca i cuori per salvare la linea', 'Attiva le notifiche di prossimità'],
        },
      },
      {
        tag: 'Biglietti Digitali',
        title: 'Acquista il biglietto\nnell\'app.',
        description: 'Biglietti e abbonamenti direttamente dal telefono. Genera un QR code e sali sull\'autobus senza biglietto fisico.',
        accent: '#f59e0b',
        accentDim: '#6b3f05',
        feature: {
          label: 'Accetta pagamenti con:',
          steps: ['Carta di credito / debito', 'Banca online istantanea', 'Voucher & Sconti studenti'],
        },
      },
    ],
  },
};

// ── Interactive SVG Illustrations with CSS Keyframes ────────────────────────

const IllustrationWelcome = ({ accent }: { accent: string }) => (
  <div className="illustration-wrapper">
    <svg viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      {/* Grid background for depth */}
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
        </pattern>
        <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.25" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
      </defs>
      
      <rect width="280" height="200" fill="url(#grid)" />
      
      {/* Radar waves behind the bus */}
      <circle cx="140" cy="115" r="75" fill="url(#radarGlow)" />
      <circle cx="140" cy="115" r="50" className="radar-circle rc1" stroke={accent} strokeWidth="1.5" />
      <circle cx="140" cy="115" r="70" className="radar-circle rc2" stroke={accent} strokeWidth="1" />
      <circle cx="140" cy="115" r="90" className="radar-circle rc3" stroke={accent} strokeWidth="0.5" />

      {/* City skyline silhouette */}
      <rect x="25" y="130" width="24" height="40" rx="2" fill={accent} opacity="0.08" />
      <rect x="55" y="110" width="20" height="60" rx="2" fill={accent} opacity="0.12" />
      <rect x="80" y="120" width="25" height="50" rx="2" fill={accent} opacity="0.08" />
      <rect x="175" y="115" width="22" height="55" rx="2" fill={accent} opacity="0.12" />
      <rect x="202" y="128" width="28" height="42" rx="2" fill={accent} opacity="0.08" />
      <rect x="235" y="105" width="20" height="65" rx="2" fill={accent} opacity="0.15" />

      {/* Road */}
      <rect x="0" y="165" width="280" height="25" rx="0" fill={accent} opacity="0.06" />
      <line x1="0" y1="165" x2="280" y2="165" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
      <rect x="40" y="176" width="25" height="3" rx="1.5" fill={accent} opacity="0.25" />
      <rect x="100" y="176" width="25" height="3" rx="1.5" fill={accent} opacity="0.25" />
      <rect x="160" y="176" width="25" height="3" rx="1.5" fill={accent} opacity="0.25" />
      <rect x="220" y="176" width="25" height="3" rx="1.5" fill={accent} opacity="0.25" />

      {/* Bus Group (Bouncing anim) */}
      <g className="bus-body-group">
        {/* Shadow under the bus */}
        <ellipse cx="140" cy="164" rx="55" ry="5" fill="#030712" opacity="0.6" />
        
        {/* Main chassis */}
        <rect x="80" y="80" width="120" height="74" rx="16" fill={accent} opacity="0.95" />
        <rect x="80" y="80" width="120" height="74" rx="16" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none" />
        
        {/* Windshield & Windows */}
        <rect x="90" y="92" width="28" height="20" rx="4" fill="#0f172a" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <rect x="126" y="92" width="28" height="20" rx="4" fill="#0f172a" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <rect x="162" y="92" width="28" height="20" rx="4" fill="#0f172a" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        
        {/* Passenger silhouettes */}
        <circle cx="104" cy="104" r="5" fill="rgba(255,255,255,0.15)" />
        <path d="M96 112 C96 109, 112 109, 112 112" fill="rgba(255,255,255,0.15)" />
        <circle cx="140" cy="104" r="5" fill="rgba(255,255,255,0.15)" />
        <path d="M132 112 C132 109, 148 109, 148 112" fill="rgba(255,255,255,0.15)" />

        {/* Dynamic headlight glows */}
        <path d="M80 134 L62 144 L68 124 Z" fill="rgba(255,255,255,0.18)" className="beam-glow" />
        <rect x="75" y="126" width="8" height="12" rx="3" fill="#ffffff" className="headlight" />
        <circle cx="79" cy="132" r="3" fill="#ffedd5" />

        {/* Door line */}
        <rect x="146" y="116" width="22" height="38" rx="2" fill="#0f172a" opacity="0.3" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

        {/* Route panel */}
        <rect x="86" y="84" width="26" height="12" rx="3" fill="#030712" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
        <text x="99" y="93" textAnchor="middle" fill={accent} fontSize="8" fontWeight="800" letterSpacing="0.5">L15</text>
      </g>

      {/* Rotating Wheels (outside group to not inherit translation pivot changes easily, placed statically but timed) */}
      <g className="bus-wheels-group">
        <g style={{ transformOrigin: '108px 158px' }} className="wheel-spin">
          <circle cx="108" cy="158" r="13" fill="#0b0f19" stroke={accent} strokeWidth="3" />
          <circle cx="108" cy="158" r="6" fill="#374151" />
          <line x1="108" y1="145" x2="108" y2="171" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
          <line x1="95" y1="158" x2="121" y2="158" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
        </g>
        <g style={{ transformOrigin: '172px 158px' }} className="wheel-spin">
          <circle cx="172" cy="158" r="13" fill="#0b0f19" stroke={accent} strokeWidth="3" />
          <circle cx="172" cy="158" r="6" fill="#374151" />
          <line x1="172" y1="145" x2="172" y2="171" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
          <line x1="159" y1="158" x2="185" y2="158" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
        </g>
      </g>
    </svg>
  </div>
);

const IllustrationMap = ({ accent }: { accent: string }) => (
  <div className="illustration-wrapper">
    <svg viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      {/* Map frame background */}
      <rect x="10" y="10" width="260" height="180" rx="20" fill="rgba(255, 255, 255, 0.01)" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1.5" />
      
      {/* Simplified roads grid */}
      <path d="M10 50 H270 M10 130 H270 M70 10 V190 M210 10 V190" stroke="rgba(255,255,255,0.03)" strokeWidth="1.5" />
      <path d="M10 90 Q140 120 270 90" stroke="rgba(255,255,255,0.02)" strokeWidth="3" fill="none" />

      {/* Main Bus Route Path */}
      <path d="M40 150 C 70 130, 90 70, 140 60 C 190 50, 210 120, 240 110" stroke={accent} strokeWidth="4" strokeLinecap="round" opacity="0.6" fill="none" />
      <path d="M40 150 C 70 130, 90 70, 140 60 C 190 50, 210 120, 240 110" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="5 5" opacity="0.8" fill="none" />

      {/* Bus Stop circles */}
      <circle cx="40" cy="150" r="7" fill={accent} opacity="0.3" />
      <circle cx="40" cy="150" r="4" fill="#fff" stroke={accent} strokeWidth="1.5" />
      
      <circle cx="140" cy="60" r="7" fill={accent} opacity="0.3" />
      <circle cx="140" cy="60" r="4" fill="#fff" stroke={accent} strokeWidth="1.5" />

      {/* Destination Pin */}
      <g style={{ transform: 'translate(240px, 110px)' }}>
        <circle cx="0" cy="0" r="16" fill={accent} opacity="0.15" className="radar-circle rc1" />
        <path d="M0 -22 C-8 -22 -14 -16 -14 -8 C-14 4 0 20 0 20 C0 20 14 4 14 -8 C14 -16 8 -22 0 -22Z" fill={accent} className="destination-pin" />
        <circle cx="0" cy="-10" r="4.5" fill="#ffffff" />
      </g>

      {/* Live moving Bus Indicator along route path */}
      <g className="map-bus-glide">
        {/* Animated pulse rings */}
        <circle cx="0" cy="0" r="14" fill={accent} opacity="0.2" className="bus-ripple-pulse" />
        <circle cx="0" cy="0" r="8" fill="#ffffff" />
        <circle cx="0" cy="0" r="6" fill={accent} />
        {/* Arrow pointer */}
        <polygon points="0,-4 3,3 -3,3" fill="#ffffff" transform="rotate(75)" />
      </g>

      {/* Dynamic Info Overlay */}
      <foreignObject x="24" y="24" width="100" height="42">
        <div style={{
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(8px)',
          borderRadius: '10px',
          padding: '4px 8px',
          fontSize: '9px',
          color: '#fff',
          fontFamily: 'sans-serif'
        }}>
          <span style={{ color: accent, fontWeight: 'bold', display: 'block' }}>GPS AKTIV</span>
          <span style={{ opacity: 0.6 }}>Linja: Unaza L1</span>
        </div>
      </foreignObject>
    </svg>
  </div>
);

const IllustrationRoute = ({ accent }: { accent: string }) => (
  <div className="illustration-wrapper">
    <svg viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      {/* Route Card Frame */}
      <rect x="20" y="20" width="240" height="160" rx="20" fill="rgba(255, 255, 255, 0.01)" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1.5" />
      
      {/* From Node (Station A) */}
      <g transform="translate(60, 60)">
        <circle cx="0" cy="0" r="16" fill={`${accent}22`} />
        <circle cx="0" cy="0" r="9" fill={accent} />
        <text x="0" y="3.5" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="900">A</text>
        <rect x="26" y="-12" width="100" height="10" rx="3" fill="rgba(255,255,255,0.1)" />
        <rect x="26" y="2" width="70" height="6" rx="2" fill="rgba(255,255,255,0.05)" />
      </g>

      {/* Route line connecting A and B */}
      <line x1="60" y1="76" x2="60" y2="134" stroke={accent} strokeWidth="3" strokeDasharray="120" className="route-draw-line" />
      
      {/* Intermediate stop dot */}
      <circle cx="60" cy="102" r="5" fill="#ffffff" stroke={accent} strokeWidth="2.5" />

      {/* Traveling glowing photon */}
      <circle cx="60" cy="60" r="4" fill="#ffffff" className="route-photon" />

      {/* To Node (Station B) */}
      <g transform="translate(60, 140)">
        <circle cx="0" cy="0" r="16" fill={`${accent}22`} />
        <circle cx="0" cy="0" r="9" fill={accent} />
        <text x="0" y="3.5" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="900">B</text>
        <rect x="26" y="-12" width="100" height="10" rx="3" fill="rgba(255,255,255,0.1)" />
        <rect x="26" y="2" width="60" height="6" rx="2" fill="rgba(255,255,255,0.05)" />
      </g>

      {/* ETA overlay panel */}
      <g className="eta-badge-scale" transform="translate(202, 100)">
        <rect x="-35" y="-25" width="70" height="50" rx="14" fill="#0b0f19" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />
        <text x="0" y="-10" textAnchor="middle" fill={accent} fontSize="8" fontWeight="700" letterSpacing="1">KOHA</text>
        <text x="0" y="10" textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="900">8 Min</text>
        <text x="0" y="20" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="6">Shpejtë</text>
      </g>
    </svg>
  </div>
);

const IllustrationFavorites = ({ accent }: { accent: string }) => {
  const [favs, setFavs] = useState([true, false, true]);
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([]);

  const handleHeartClick = (index: number, e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.width / 2;
    const y = rect.height / 2;

    const newFavs = [...favs];
    newFavs[index] = !newFavs[index];
    setFavs(newFavs);

    if (newFavs[index]) {
      // Spawn floating hearts
      const id = Date.now() + Math.random();
      setHearts(prev => [...prev, { id, x, y }]);
      setTimeout(() => {
        setHearts(prev => prev.filter(h => h.id !== id));
      }, 1000);
    }
  };

  return (
    <div className="illustration-wrapper">
      <svg viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        {[
          { y: 18, label: 'L1 · Unaza', dist: '150m larg' },
          { y: 76, label: 'L2 · Tirana e Re', dist: '340m larg' },
          { y: 134, label: 'L12 · Kombinat', dist: '50m larg' }
        ].map((item, idx) => (
          <g key={idx} transform={`translate(15, ${item.y})`}>
            {/* List Row Background */}
            <rect x="0" y="0" width="250" height="48" rx="14" 
              fill={favs[idx] ? 'rgba(244, 63, 94, 0.06)' : 'rgba(255, 255, 255, 0.02)'} 
              stroke={favs[idx] ? 'rgba(244, 63, 94, 0.25)' : 'rgba(255, 255, 255, 0.05)'} 
              strokeWidth="1.2"
              style={{ transition: 'all 0.3s ease' }}
            />
            
            {/* Line avatar */}
            <circle cx="30" cy="24" r="11" fill={accent} opacity={favs[idx] ? 0.75 : 0.2} style={{ transition: 'all 0.3s ease' }} />
            <text x="30" y="27.5" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="900" opacity={favs[idx] ? 1 : 0.6}>
              {idx === 0 ? 'U' : idx === 1 ? 'T' : 'K'}
            </text>

            {/* Line Label */}
            <text x="54" y="22" fill="#ffffff" fontSize="11" fontWeight="700">{item.label}</text>
            <text x="54" y="34" fill={favs[idx] ? accent : 'rgba(255,255,255,0.4)'} fontSize="8" fontWeight="500">{item.dist}</text>

            {/* Interactive Heart Button */}
            <g transform="translate(222, 24)" className="fav-heart" onClick={(e) => handleHeartClick(idx, e)} style={{ cursor: 'pointer' }}>
              <circle cx="0" cy="0" r="15" fill="transparent" />
              <text x="0" y="5" textAnchor="middle" fontSize="16" 
                fill={favs[idx] ? '#f43f5e' : 'rgba(255, 255, 255, 0.15)'}
                style={{
                  transition: 'fill 0.3s ease, transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  transform: favs[idx] ? 'scale(1.2)' : 'scale(1)'
                }}
              >
                ♥
              </text>
              {/* Bell notification indicator when saved */}
              {favs[idx] && (
                <circle cx="8" cy="-8" r="3.5" fill="#f43f5e" />
              )}
            </g>
          </g>
        ))}

        {/* Floating Heart Particles */}
        {hearts.map((h) => (
          <g key={h.id} transform={`translate(${h.x}, ${h.y})`}>
            <text x="0" y="0" textAnchor="middle" fill="#f43f5e" fontSize="12" className="floating-mini-heart" style={{ '--dx': `${(Math.random() - 0.5) * 40}px` } as React.CSSProperties}>
              ♥
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

const IllustrationTicket = ({ accent }: { accent: string }) => (
  <div className="illustration-wrapper">
    <svg viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      {/* Ticket card rotating slightly */}
      <g transform="rotate(-3 140 100)" className="ticket-group">
        {/* Ticket Outer glow */}
        <rect x="35" y="35" width="210" height="130" rx="20" fill="rgba(255, 255, 255, 0.01)" />
        <rect x="35" y="35" width="210" height="130" rx="20" fill={`${accent}11`} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        <rect x="35" y="35" width="210" height="130" rx="20" stroke={accent} strokeWidth="1.5" strokeOpacity="0.4" fill="none" className="ticket-border-glow" />

        {/* Notches */}
        <circle cx="35" cy="100" r="10" fill="#040813" />
        <circle cx="245" cy="100" r="10" fill="#040813" />

        {/* Dividers */}
        <line x1="48" y1="100" x2="232" y2="100" stroke={accent} strokeWidth="1.5" strokeDasharray="6 6" opacity="0.3" />

        {/* Card Shine Mask */}
        <g style={{ clipPath: 'inset(35px 35px 35px 35px round 20px)' }}>
          <rect x="-80" y="0" width="40" height="200" fill="rgba(255,255,255,0.08)" className="card-shine-bar" />
        </g>

        {/* QR Code Container */}
        <rect x="105" y="44" width="70" height="70" rx="10" fill="rgba(255, 255, 255, 0.03)" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1.2" />
        
        {/* Mini QR structure */}
        {[0, 1, 2, 3, 4, 5, 6].map(r => [0, 1, 2, 3, 4, 5, 6].map(c => {
          const on = (r < 2 && c < 2) || (r < 2 && c > 4) || (r > 4 && c < 2) || ((r + c) % 2 === 0 && r > 1 && r < 5 && c > 1 && c < 5);
          return on ? <rect key={`${r}-${c}`} x={113 + c * 8} y={52 + r * 8} width="6" height="6" rx="1" fill={accent} opacity="0.75" /> : null;
        }))}

        {/* Laser scanner sweeping line */}
        <line x1="107" y1="46" x2="173" y2="46" stroke={accent} strokeWidth="2.5" className="ticket-laser-line" />
        
        {/* Passenger details */}
        <rect x="52" y="116" width="75" height="8" rx="2.5" fill="rgba(255,255,255,0.12)" />
        <rect x="52" y="129" width="45" height="5" rx="2" fill="rgba(255,255,255,0.05)" />

        {/* Ticket Status Indicator */}
        <g transform="translate(180, 114)">
          <rect x="0" y="0" width="48" height="20" rx="6" fill={`${accent}22`} stroke={`${accent}44`} strokeWidth="1" />
          <text x="24" y="13" textAnchor="middle" fill={accent} fontSize="8" fontWeight="800">AKTIVE</text>
        </g>
      </g>
    </svg>
  </div>
);

const illustrations = [IllustrationWelcome, IllustrationMap, IllustrationRoute, IllustrationFavorites, IllustrationTicket];

export default function OnboardingView({ onComplete, language: propLanguage }: OnboardingViewProps) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [isExiting, setIsExiting] = useState(false);
  
  const handleExit = () => {
    setIsExiting(true);
    setTimeout(() => {
      onComplete();
    }, 750);
  };
  
  // Default language of onboarding is English ('en')
  const language = 'en';
  const setLanguage = useStore((state: any) => state.setLanguage);

  const t = translations[language as 'al' | 'en' | 'it'] || translations.al;
  const slides = t.slides;
  const slide = slides[current];
  const Illustration = illustrations[current];
  const isLast = current === slides.length - 1;

  const handleNext = () => {
    if (isLast) {
      handleExit();
      return;
    }
    setDirection('next');
    setCurrent(prev => prev + 1);
  };

  const handleDot = (i: number) => {
    if (i === current) return;
    setDirection(i > current ? 'next' : 'prev');
    setCurrent(i);
  };

  // Safe area heights support
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#03060f',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
      overflow: 'hidden',
      zIndex: 99999,
      userSelect: 'none',
      WebkitUserSelect: 'none',
      opacity: isExiting ? 0 : 1,
      transform: isExiting ? 'scale(0.96)' : 'scale(1)',
      transition: 'opacity 0.75s cubic-bezier(0.25, 1, 0.5, 1), transform 0.75s cubic-bezier(0.25, 1, 0.5, 1)',
    }}>
      {/* Background Dots Grid overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        pointerEvents: 'none',
        zIndex: 1,
      }} />

      {/* Floating Dynamic Ambient Glow (shifting colors based on slide accent) */}
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 2,
        transition: 'all 0.8s ease',
      }}>
        {/* Core Top Glow */}
        <div style={{
          position: 'absolute',
          top: '-15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '90vw',
          height: '70vh',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${slide.accent}24 0%, transparent 65%)`,
          filter: 'blur(50px)',
          transition: 'all 0.8s cubic-bezier(0.25, 1, 0.5, 1)',
        }} />
        {/* Secondary Bottom Glow */}
        <div style={{
          position: 'absolute',
          bottom: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '70vw',
          height: '50vh',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${slide.accentDim}1c 0%, transparent 60%)`,
          filter: 'blur(70px)',
          transition: 'all 0.8s cubic-bezier(0.25, 1, 0.5, 1)',
        }} />
      </div>

      {/* Header Panel */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        padding: 'max(20px, env(safe-area-inset-top, 20px)) 24px 0',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
      }}>
        {/* Skip button (top right of center) */}
        {!isLast && (
          <button
            onClick={handleExit}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.45)',
              fontSize: 14,
              fontWeight: 600,
              padding: '6px 0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
          >
            {t.skip}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: 10, height: 10, marginLeft: 4, display: 'inline-block' }}>
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Swipeable Main Slide Container using Framer Motion */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 5,
      }}>
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={current}
            custom={direction}
            variants={{
              enter: (dir) => ({
                x: dir === 'next' ? '80px' : '-80px',
                opacity: 0,
                scale: 0.96,
              }),
              center: {
                x: 0,
                opacity: 1,
                scale: 1,
              },
              exit: (dir) => ({
                x: dir === 'next' ? '-80px' : '80px',
                opacity: 0,
                scale: 0.96,
              }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.4}
            onDragEnd={(e, { offset, velocity }) => {
              const swipeThreshold = 50;
              if (offset.x < -swipeThreshold) {
                // Swipe Left -> next
                if (current < slides.length - 1) {
                  setDirection('next');
                  setCurrent(prev => prev + 1);
                }
              } else if (offset.x > swipeThreshold) {
                // Swipe Right -> prev
                if (current > 0) {
                  setDirection('prev');
                  setCurrent(prev => prev - 1);
                }
              }
            }}
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'grab',
            }}
          >
            {/* Illustration Frame */}
            <div style={{
              width: '100%',
              maxWidth: 320,
              height: 200,
              marginBottom: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Illustration accent={slide.accent} />
            </div>

            {/* Tag Pill */}
            <div style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: slide.accent,
              background: `${slide.accent}12`,
              border: `1px solid ${slide.accent}25`,
              padding: '4px 10px',
              borderRadius: 12,
              marginBottom: 16,
              transition: 'all 0.5s ease',
            }}>
              {slide.tag}
            </div>

            {/* Slide Title */}
            <div style={{
              fontSize: 32,
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              textAlign: 'center',
              marginBottom: 14,
              whiteSpace: 'pre-line',
              padding: '0 24px',
            }}>
              {slide.title}
            </div>

            {/* Slide Description */}
            <div style={{
              fontSize: 14,
              lineHeight: 1.6,
              color: 'rgba(255, 255, 255, 0.45)',
              textAlign: 'center',
              maxWidth: 310,
              padding: '0 16px',
              marginBottom: slide.feature ? 20 : 0,
            }}>
              {slide.description}
            </div>

            {/* Interactive Feature Box */}
            {slide.feature && (
              <div style={{
                width: 'calc(100% - 48px)',
                maxWidth: 320,
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: 18,
                padding: '14px 16px',
                marginTop: 6,
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              }}>
                <div style={{
                  fontSize: 9,
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: slide.accent,
                  opacity: 0.8,
                  marginBottom: 8,
                }}>
                  {slide.feature.label}
                </div>
                {(slide.feature as any).steps.map((step: string, i: number) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: i < (slide.feature as any).steps.length - 1 ? 6 : 0,
                  }}>
                    <div style={{
                      width: 18,
                      height: 18,
                      borderRadius: 6,
                      background: `${slide.accent}1c`,
                      border: `1px solid ${slide.accent}30`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 9,
                      fontWeight: 800,
                      color: slide.accent,
                      flexShrink: 0,
                    }}>
                      {i + 1}
                    </div>
                    <span style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.65)', fontWeight: 500 }}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Navigation Bar */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        padding: '0 24px calc(max(24px, env(safe-area-inset-bottom, 24px)) + 8px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 20,
      }}>
        {/* Interactive Driving Bus Route Indicators */}
        <div style={{
          position: 'relative',
          width: 220,
          height: 30,
          display: 'flex',
          alignItems: 'center',
          userSelect: 'none',
        }}>
          {/* Main Road Track (Sleek line, no dots) */}
          <div style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: 3,
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: 1.5,
          }} />

          {/* Visited Road Progress (Active Track) */}
          <div style={{
            position: 'absolute',
            left: 0,
            width: `${current * (100 / (slides.length - 1))}%`,
            height: 3,
            background: `linear-gradient(90deg, ${slide.accentDim}, ${slide.accent})`,
            borderRadius: 1.5,
            transition: 'width 0.6s cubic-bezier(0.25, 1, 0.5, 1), background 0.6s ease',
          }} />

          {/* Invisible Interactive Click Zones for Navigating */}
          {slides.map((_: any, i: number) => {
            return (
              <button
                key={i}
                onClick={() => handleDot(i)}
                style={{
                  position: 'absolute',
                  left: `${i * (100 / (slides.length - 1))}%`,
                  transform: 'translateX(-50%)',
                  width: 36, // Large touch area
                  height: 36,
                  borderRadius: '50%',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  padding: 0,
                  zIndex: 3,
                }}
                aria-label={`Go to slide ${i + 1}`}
              />
            );
          })}

          {/* Smoothly Driving Bus Indicator (Larger, more premium details) */}
          <div style={{
            position: 'absolute',
            left: isExiting ? '125%' : `${current * (100 / (slides.length - 1))}%`,
            transform: 'translate(-50%, -10px)',
            zIndex: 4,
            transition: isExiting
              ? 'left 0.75s cubic-bezier(0.4, 0, 0.2, 1)'
              : 'left 0.6s cubic-bezier(0.25, 1, 0.5, 1)',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{
              width: 32,
              height: 22,
              filter: `drop-shadow(0 0 8px ${slide.accent})`,
              transition: 'all 0.4s ease',
            }}>
              {/* Bus Chassis (Gradient Chassis fill) */}
              <rect x="1" y="2" width="34" height="17" rx="5" fill={slide.accent} style={{ transition: 'fill 0.5s ease' }} />
              <rect x="1" y="2" width="34" height="17" rx="5" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="0.8" fill="none" />
              
              {/* Windows (curved sleek glass) */}
              <rect x="4" y="5" width="7" height="6" rx="2" fill="#060c18" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
              <rect x="13" y="5" width="7" height="6" rx="2" fill="#060c18" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
              <rect x="22" y="5" width="10" height="6" rx="2" fill="#060c18" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
              
              {/* Headlight Beam */}
              <circle cx="34" cy="13" r="1.5" fill="#fff" />
              <polygon points="34,13 42,10 42,16" fill="rgba(255,255,255,0.15)" opacity="0.5" />

              {/* Front Grill detail */}
              <rect x="33" y="15" width="2" height="3" rx="0.5" fill="rgba(255,255,255,0.3)" />

              {/* Wheels */}
              <circle cx="9" cy="19.5" r="3.5" fill="#060c18" stroke="#ffffff" strokeWidth="1" />
              <circle cx="9" cy="19.5" r="1.5" fill={slide.accent} style={{ transition: 'fill 0.5s ease' }} />
              
              <circle cx="27" cy="19.5" r="3.5" fill="#060c18" stroke="#ffffff" strokeWidth="1" />
              <circle cx="27" cy="19.5" r="1.5" fill={slide.accent} style={{ transition: 'fill 0.5s ease' }} />
            </svg>
          </div>
        </div>

        {/* CTA Next/Finish Button */}
        <button
          onClick={handleNext}
          style={{
            width: '100%',
            maxWidth: 320,
            padding: '16px 0',
            border: 'none',
            borderRadius: 16,
            background: slide.accent,
            color: '#ffffff',
            fontSize: 15,
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: `0 8px 30px ${slide.accent}33`,
            transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
            position: 'relative',
            overflow: 'hidden',
          }}
          onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
          onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
          onTouchStart={e => (e.currentTarget.style.transform = 'scale(0.97)')}
          onTouchEnd={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          {isLast ? t.finish : t.next}
        </button>
      </div>

      {/* Global CSS Styles for complex SVG keyframe animations */}
      <style jsx global>{`
        /* Illustration 1 - Welcome/Bus */
        .bus-body-group {
          animation: bounceChassis 3s ease-in-out infinite;
          transform-origin: center;
        }
        @keyframes bounceChassis {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .wheel-spin {
          animation: rotateWheel 2s linear infinite;
        }
        @keyframes rotateWheel {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .radar-circle {
          transform-origin: 140px 115px;
          opacity: 0;
        }
        .rc1 { animation: radarWave 4s cubic-bezier(0.1, 0.8, 0.3, 1) infinite; }
        .rc2 { animation: radarWave 4s cubic-bezier(0.1, 0.8, 0.3, 1) infinite 1.3s; }
        .rc3 { animation: radarWave 4s cubic-bezier(0.1, 0.8, 0.3, 1) infinite 2.6s; }
        @keyframes radarWave {
          0% { transform: scale(0.6); opacity: 0.8; stroke-width: 2; }
          50% { opacity: 0.4; }
          100% { transform: scale(1.3); opacity: 0; stroke-width: 0.5; }
        }
        .beam-glow {
          animation: pulseBeam 1.5s ease-in-out infinite alternate;
        }
        @keyframes pulseBeam {
          0% { opacity: 0.08; }
          100% { opacity: 0.35; }
        }
        .headlight {
          animation: glowHeadlight 1.5s ease-in-out infinite alternate;
        }
        @keyframes glowHeadlight {
          0% { filter: drop-shadow(0 0 1px rgba(255,255,255,0.4)); }
          100% { filter: drop-shadow(0 0 6px rgba(255,255,255,1)); }
        }

        /* Illustration 2 - Live Map */
        .map-bus-glide {
          offset-path: path("M40 150 C 70 130, 90 70, 140 60 C 190 50, 210 120, 240 110");
          animation: busPathGlide 8s linear infinite;
          offset-rotate: auto;
          position: absolute;
        }
        @keyframes busPathGlide {
          0% { offset-distance: 0%; }
          50% { offset-distance: 100%; }
          100% { offset-distance: 100%; }
        }
        .bus-ripple-pulse {
          animation: ringRipple 2s ease-out infinite;
          transform-origin: center;
        }
        @keyframes ringRipple {
          0% { transform: scale(0.8); opacity: 0.6; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        .destination-pin {
          animation: hoverPin 2s ease-in-out infinite alternate;
          transform-origin: 0px 20px;
        }
        @keyframes hoverPin {
          0% { transform: translateY(0); }
          100% { transform: translateY(-5px); }
        }

        /* Illustration 3 - Route Planner */
        .route-draw-line {
          animation: drawLineAnim 4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        @keyframes drawLineAnim {
          0% { stroke-dashoffset: 120; }
          40% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: 0; }
        }
        .route-photon {
          animation: travelPhoton 4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        @keyframes travelPhoton {
          0% { cy: 60; opacity: 0; }
          5% { opacity: 1; }
          35% { opacity: 1; }
          40%, 100% { cy: 140; opacity: 0; }
        }
        .eta-badge-scale {
          animation: pulseBadge 3s ease-in-out infinite alternate;
          transform-origin: 202px 100px;
        }
        @keyframes pulseBadge {
          0% { transform: scale(0.96) translate(202px, 100px); }
          100% { transform: scale(1.02) translate(202px, 100px); }
        }

        /* Illustration 4 - Favorites */
        .floating-mini-heart {
          animation: floatHeartAnim 1s ease-out forwards;
          transform-origin: center;
          position: absolute;
          pointer-events: none;
        }
        @keyframes floatHeartAnim {
          0% { transform: translate(0, 0) scale(0.7); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translate(var(--dx), -40px) scale(1.3); opacity: 0; }
        }
        .fav-heart:active text {
          transform: scale(1.5) !important;
        }

        /* Illustration 5 - Digital Ticket */
        .ticket-group {
          animation: floatTicket 4s ease-in-out infinite alternate;
          transform-origin: 140px 100px;
        }
        @keyframes floatTicket {
          0% { transform: rotate(-3deg) translateY(0px); }
          100% { transform: rotate(-3deg) translateY(-5px); }
        }
        .ticket-border-glow {
          animation: glowBorder 2s ease-in-out infinite alternate;
        }
        @keyframes glowBorder {
          0% { stroke-opacity: 0.2; }
          100% { stroke-opacity: 0.6; }
        }
        .ticket-laser-line {
          animation: laserSweepAnim 4s ease-in-out infinite alternate;
        }
        @keyframes laserSweepAnim {
          0% { transform: translateY(0); }
          100% { transform: translateY(66px); }
        }
        .card-shine-bar {
          animation: cardShineSweep 5s ease-in-out infinite;
        }
        @keyframes cardShineSweep {
          0% { transform: translateX(-150px) skewX(-25deg); }
          30%, 100% { transform: translateX(250px) skewX(-25deg); }
        }
      `}</style>
    </div>
  );
}
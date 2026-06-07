'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IonIcon } from '@/app/components/common/IonIcon';
import { 
  menuOutline, closeOutline, busOutline, homeOutline, ticketOutline, helpCircleOutline, 
  chatbubbleOutline, chevronForwardOutline, phonePortraitOutline 
} from 'ionicons/icons';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent background scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const navLinks = [
    { name: 'Shtëpia', path: '/', icon: <IonIcon icon={homeOutline} style={{ fontSize: 18 }} /> },
    { name: 'Linjat & Oraret', path: '/routes', icon: <IonIcon icon={busOutline} style={{ fontSize: 18 }} /> },
    { name: 'Biletat & Abonetë', path: '/tickets', icon: <IonIcon icon={ticketOutline} style={{ fontSize: 18 }} /> },
    { name: 'Ndihma', path: '/help-center', icon: <IonIcon icon={helpCircleOutline} style={{ fontSize: 18 }} /> },
    { name: 'Kontakti', path: '/contact', icon: <IonIcon icon={chatbubbleOutline} style={{ fontSize: 18 }} /> },
  ];

  return (
    <>
      <style>{`
        .desktop-nav-link {
          position: relative;
          font-size: 10.5px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #64748b;
          padding: 8px 16px;
          border-radius: 99px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          text-decoration: none;
        }

        .desktop-nav-link:hover {
          color: #f97316;
          background: rgba(249, 115, 22, 0.04);
        }

        .desktop-nav-link.active {
          color: #f97316;
          background: rgba(249, 115, 22, 0.06);
        }

        .desktop-nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 50%;
          width: 0;
          height: 2.5px;
          background: #f97316;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          transform: translateX(-50%);
          border-radius: 99px;
        }

        .desktop-nav-link:hover::after {
          width: 30%;
        }

        .desktop-nav-link.active::after {
          width: 40%;
        }

        .pulsing-indicator {
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background-color: #f97316;
          box-shadow: 0 0 10px rgba(249, 115, 22, 0.8);
          animation: nav-dot-pulse 2s infinite;
        }

        @keyframes nav-dot-pulse {
          0% {
            transform: translateX(-50%) scale(0.8);
            opacity: 0.5;
            box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.7);
          }
          70% {
            transform: translateX(-50%) scale(1);
            opacity: 1;
            box-shadow: 0 0 0 6px rgba(249, 115, 22, 0);
          }
          100% {
            transform: translateX(-50%) scale(0.8);
            opacity: 0.5;
            box-shadow: 0 0 0 0 rgba(249, 115, 22, 0);
          }
        }

        .header-capsule {
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .header-capsule.scrolled {
          box-shadow: 
            0 15px 35px -10px rgba(249, 115, 22, 0.08), 
            0 5px 15px -5px rgba(15, 23, 42, 0.05),
            0 0 0 1.5px rgba(249, 115, 22, 0.05);
        }
      `}</style>

      <div className={`fixed inset-x-0 z-50 transition-all duration-500 flex justify-center px-4 ${
        scrolled ? 'top-4' : 'top-6'
      }`}>
        <header 
          className={`header-capsule w-full max-w-5xl rounded-2xl md:rounded-full ${
            scrolled 
              ? 'scrolled bg-white/80 backdrop-blur-lg border border-slate-200/60 py-2.5 px-6' 
              : 'bg-white/60 backdrop-blur-md border border-slate-200/40 shadow-sm py-4 px-8'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group text-decoration-none" onClick={() => setIsOpen(false)}>
              <img src="/logo.png" alt="Urbani IM Logo" className="w-8 h-8 object-contain rounded-xl group-hover:scale-105 transition-all duration-300" />
              <span className="font-extrabold text-lg tracking-tight text-slate-900">
                Urbani<span className="text-orange-500 font-medium">IM</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    href={link.path}
                    className={`desktop-nav-link ${isActive ? 'active' : ''}`}
                  >
                    {link.name}
                    {isActive && <span className="pulsing-indicator" />}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Burger Trigger */}
            <button
              onClick={() => setIsOpen(true)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100/80 text-slate-700 hover:bg-slate-200/80 transition-colors border border-slate-200/20"
              aria-label="Hap menunë"
            >
              <IonIcon icon={menuOutline} style={{ fontSize: 18 }} />
            </button>
          </div>
        </header>
      </div>

      {/* ── Mobile Navigation Drawer Overlay ───────────────────────────────── */}
      <div 
        className={`fixed inset-0 z-[100] md:hidden transition-opacity duration-300 pointer-events-none ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0'
        }`}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm cursor-pointer"
          onClick={() => setIsOpen(false)}
        />

        {/* Drawer Panel */}
        <aside 
          className={`absolute top-0 right-0 bottom-0 w-[85%] max-w-[340px] bg-white/95 backdrop-blur-xl border-l border-slate-200/50 shadow-2xl flex flex-col p-6 transition-transform duration-300 ease-out ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Urbani IM Logo" className="w-7 h-7 object-contain rounded-lg" />
              <span className="font-extrabold text-base tracking-tight text-slate-950">
                Urbani<span className="text-orange-500 font-medium">IM</span>
              </span>
            </div>
            
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors border border-slate-200/10"
              aria-label="Mbyll menunë"
            >
              <IonIcon icon={closeOutline} style={{ fontSize: 16 }} />
            </button>
          </div>

          {/* Vertical Menu Links */}
          <nav className="flex flex-col gap-2.5">
            {navLinks.map((link, idx) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={() => setIsOpen(false)}
                  style={{
                    animationDelay: `${idx * 50}ms`,
                  }}
                  className={`group flex items-center justify-between p-3.5 rounded-2xl transition-all duration-200 text-decoration-none animate-fade-up ${
                    isActive 
                      ? 'bg-orange-50 text-orange-700 font-bold shadow-sm shadow-orange-500/5' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-orange-500 font-semibold'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`p-2 rounded-xl transition-all duration-200 ${
                      isActive 
                        ? 'bg-orange-500 text-white' 
                        : 'bg-slate-100 text-slate-500 group-hover:bg-orange-50 group-hover:text-orange-500'
                    }`}>
                      {link.icon}
                    </span>
                    <span className="text-sm">{link.name}</span>
                  </div>
                  <IonIcon 
                    icon={chevronForwardOutline}
                    style={{ fontSize: 15 }} 
                    className={`transition-all duration-200 ${
                      isActive 
                        ? 'text-orange-500 translate-x-0' 
                        : 'text-slate-300 group-hover:text-orange-500 group-hover:translate-x-1'
                    }`} 
                  />
                </Link>
              );
            })}
          </nav>

          {/* Drawer Footer Call-to-action */}
          <div className="mt-auto pt-6 border-t border-slate-100 flex flex-col gap-4">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-orange-50 text-orange-500 flex-shrink-0">
                <IonIcon icon={phonePortraitOutline} style={{ fontSize: 18 }} />
              </span>
              <div>
                <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider leading-none">
                  Aplikacioni celular
                </p>
                <p className="text-xs font-bold text-slate-800 mt-1.5 leading-none">
                  Shkarko Urbani IM
                </p>
              </div>
            </div>
            
            <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold px-1">
              <span>Urbani IM v1.0.0</span>
              <span>© {new Date().getFullYear()}</span>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

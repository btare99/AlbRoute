import Link from 'next/link';
import { IonIcon } from '@/app/components/common/IonIcon';
import { busOutline, mailOutline, timeOutline, shieldCheckmarkOutline } from 'ionicons/icons';

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" className="inline-block mr-2">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
  </svg>
);

const GooglePlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" className="inline-block mr-2">
    <path d="M3.18 23.76c.3.17.64.24.99.2l13.19-11.95L13.65 8.3 3.18 23.76zm17.64-10.03L17.5 11.8l-3.8 3.44 3.8 3.44 3.35-1.95a1.34 1.34 0 0 0 0-2.99zM3.38.28C3.06.1 2.68.06 2.34.2L15.33 12 11.52 15.43 3.38.28z" />
  </svg>
);

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 pb-8 border-t border-slate-850 relative">
      {/* Moving Bus Animation Banner */}
      <div className="w-full h-16 bg-slate-950 border-b border-slate-850/60 relative overflow-hidden flex items-center">
        {/* Road Center Line (dashed orange line) */}
        <div className="absolute bottom-3 left-0 w-full h-[2px] bg-dashed-road opacity-20" />
        {/* Road edge lines */}
        <div className="absolute bottom-11 left-0 w-full h-[1px] bg-slate-800/40" />
        <div className="absolute bottom-1 left-0 w-full h-[1px] bg-slate-800/40" />
        
        {/* Animated Bus Wrapper */}
        <div 
          className="absolute bottom-2.5 w-[120px] h-[45px] z-10" 
          style={{ animation: 'bus-move 25s linear infinite' }}
        >
          <svg viewBox="0 0 120 45" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="busGrad" x1="0" y1="0" x2="120" y2="45" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#ea580c" />
              </linearGradient>
              <linearGradient id="windowGrad" x1="0" y1="0" x2="0" y2="20" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
            </defs>
            
            {/* Bus shadow */}
            <ellipse cx="60" cy="41" rx="50" ry="3" fill="#020617" opacity="0.6" />

            {/* Main body chassis */}
            <rect x="10" y="8" width="100" height="28" rx="6" fill="url(#busGrad)" stroke="#f97316" strokeWidth="1" />
            
            {/* Sleek bottom skirt */}
            <path d="M 10 30 L 110 30 L 108 36 L 12 36 Z" fill="#0f172a" />
            
            {/* Wheel arches */}
            <circle cx="28" cy="36" r="7.5" fill="#090d16" />
            <circle cx="88" cy="36" r="7.5" fill="#090d16" />
            
            {/* Windows area */}
            <rect x="14" y="12" width="92" height="11" rx="2.5" fill="url(#windowGrad)" />
            
            {/* Window dividers */}
            <line x1="32" y1="12" x2="32" y2="23" stroke="#ea580c" strokeWidth="0.8" opacity="0.3" />
            <line x1="52" y1="12" x2="52" y2="23" stroke="#ea580c" strokeWidth="0.8" opacity="0.3" />
            <line x1="72" y1="12" x2="72" y2="23" stroke="#ea580c" strokeWidth="0.8" opacity="0.3" />
            <line x1="92" y1="12" x2="92" y2="23" stroke="#ea580c" strokeWidth="0.8" opacity="0.3" />

            {/* Brand Text "Urbani Im" */}
            <text 
              x="60" 
              y="24" 
              textAnchor="middle" 
              fill="#ffffff" 
              fontSize="7.5" 
              fontWeight="900" 
              fontFamily="system-ui, -apple-system, sans-serif" 
              letterSpacing="0.2"
              className="animated-bus-text"
            >
              Urbani Im
            </text>
            
            {/* Headlight and glow */}
            <rect x="10" y="27" width="2" height="4" rx="0.5" fill="#fef08a" />
            <circle cx="10" cy="29" r="2.5" fill="#ffffff" opacity="0.8" />
            
            {/* Taillight */}
            <rect x="108" y="27" width="2" height="4" rx="0.5" fill="#f87171" />

            {/* LED Route indicator */}
            <rect x="16" y="9.5" width="12" height="4" rx="0.8" fill="#020617" />
            <text 
              x="22" 
              y="13" 
              textAnchor="middle" 
              fill="#fbbf24" 
              fontSize="3" 
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              className="animated-bus-route-text"
            >
              L1
            </text>
            
            {/* Front door */}
            <rect x="94" y="16" width="12" height="20" rx="1" fill="#0f172a" opacity="0.5" stroke="#f97316" strokeWidth="0.5" />
            <line x1="100" y1="16" x2="100" y2="36" stroke="#f97316" strokeWidth="0.5" opacity="0.5" />

            {/* Wheels (rotating) */}
            <g className="wheel-rotating" style={{ transformOrigin: '28px 36px' }}>
              <circle cx="28" cy="36" r="6" fill="#1e293b" stroke="#f97316" strokeWidth="1.2" />
              <circle cx="28" cy="36" r="2.2" fill="#e2e8f0" />
              <line x1="28" y1="30" x2="28" y2="42" stroke="#475569" strokeWidth="0.8" />
              <line x1="22" y1="36" x2="34" y2="36" stroke="#475569" strokeWidth="0.8" />
            </g>
            <g className="wheel-rotating" style={{ transformOrigin: '88px 36px' }}>
              <circle cx="88" cy="36" r="6" fill="#1e293b" stroke="#f97316" strokeWidth="1.2" />
              <circle cx="88" cy="36" r="2.2" fill="#e2e8f0" />
              <line x1="88" y1="30" x2="88" y2="42" stroke="#475569" strokeWidth="0.8" />
              <line x1="82" y1="36" x2="94" y2="36" stroke="#475569" strokeWidth="0.8" />
            </g>
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10 pt-16">
        {/* Column 1: Info & Brand */}
        <div className="flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-2 group text-decoration-none">
            <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-md">
              <IonIcon icon={busOutline} style={{ fontSize: 18 }} />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">
              Urbani<span className="text-orange-400 font-medium">IM</span>
            </span>
          </Link>
          <p className="text-sm text-slate-400 leading-relaxed mt-2">
            Zgjidhja më e mirë dixhitale për ndjekjen e transportit publik dhe blerjen e abonesë në të gjitha qytetet kryesore shqiptare.
          </p>
          <div className="flex items-center gap-2 mt-2 text-xs text-orange-400 bg-teal-950/40 border border-orange-800/40 px-3 py-1.5 rounded-lg w-fit">
            <IonIcon icon={shieldCheckmarkOutline} style={{ fontSize: 14 }} />
            100% e mbrojtur sipas GDPR
          </div>
        </div>

        {/* Column 2: Navigation Links */}
        <div className="flex flex-col gap-4">
          <h4 className="text-white font-bold text-sm uppercase tracking-wider">Lundrimi</h4>
          <ul className="list-none p-0 m-0 flex flex-col gap-2">
            <li>
              <Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors text-decoration-none">
                Shtëpia
              </Link>
            </li>
            <li>
              <Link href="/routes" className="text-sm text-slate-400 hover:text-white transition-colors text-decoration-none">
                Linjat & Oraret
              </Link>
            </li>
            <li>
              <Link href="/tickets" className="text-sm text-slate-400 hover:text-white transition-colors text-decoration-none">
                Biletat & Abonetë
              </Link>
            </li>
            <li>
              <Link href="/help-center" className="text-sm text-slate-400 hover:text-white transition-colors text-decoration-none">
                Qendra e Ndihmës
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Contact & Support */}
        <div className="flex flex-col gap-4">
          <h4 className="text-white font-bold text-sm uppercase tracking-wider">Suporti</h4>
          <ul className="list-none p-0 m-0 flex flex-col gap-3">
            <li className="flex items-center gap-2 text-sm text-slate-400">
              <IonIcon icon={mailOutline} style={{ fontSize: 16 }} className="text-orange-500" />
              <a href="mailto:support@urbani-im.al" className="text-slate-400 hover:text-white transition-colors text-decoration-none">
                support@urbani-im.al
              </a>
            </li>
            <li className="flex items-start gap-2 text-sm text-slate-400">
              <IonIcon icon={timeOutline} style={{ fontSize: 16 }} className="text-orange-500 mt-0.5" />
              <span>
                E Hënë – E Premte
                <br />
                <span className="text-xs text-slate-500">09:00 – 17:00</span>
              </span>
            </li>
            <li>
              <Link href="/contact" className="text-sm text-orange-400 hover:text-orange-300 transition-colors text-decoration-none font-medium">
                Na shkruani një mesazh &rarr;
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 4: Download Badges */}
        <div className="flex flex-col gap-4">
          <h4 className="text-white font-bold text-sm uppercase tracking-wider">Shkarkoni App</h4>
          <p className="text-sm text-slate-400">Merreni aplikacionin falas në pajisjen tuaj:</p>
          <div className="flex flex-col gap-2.5 mt-1">
            <a 
              href="https://apps.apple.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn-base btn-dark bg-slate-800 border border-slate-700/60 hover:bg-slate-700 text-xs py-2.5 px-4 justify-start"
            >
              <AppleIcon />
              <div className="text-left leading-tight">
                <div className="text-[10px] text-slate-400">Shkarko në</div>
                <div className="font-bold text-xs text-white">App Store</div>
              </div>
            </a>
            <a 
              href="https://play.google.com/store/apps/details?id=al.busal.urbani" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn-base btn-dark bg-slate-800 border border-slate-700/60 hover:bg-slate-700 text-xs py-2.5 px-4 justify-start"
            >
              <GooglePlayIcon />
              <div className="text-left leading-tight">
                <div className="text-[10px] text-slate-400">Shkarko në</div>
                <div className="font-bold text-xs text-white">Google Play</div>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-6 mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div>
          <p>Urbani IM &copy; {currentYear}. Të gjitha të drejtat të rezervuara.</p>
        </div>
        <div className="flex gap-6">
          <Link href="/privacy-policy" className="hover:text-slate-400 transition-colors text-decoration-none">
            Politika e Privatësisë
          </Link>
          <Link href="/terms-and-conditions" className="hover:text-slate-400 transition-colors text-decoration-none">
            Kushtet e Përdorimit
          </Link>
        </div>
      </div>
    </footer>
  );
}

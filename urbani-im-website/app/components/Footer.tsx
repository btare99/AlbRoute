import Link from 'next/link';
import { Bus, Mail, Phone, Clock, ShieldCheck } from 'lucide-react';

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
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Column 1: Info & Brand */}
        <div className="flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-2 group text-decoration-none">
            <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-md">
              <Bus size={18} strokeWidth={2.5} />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">
              Urbani<span className="text-orange-400 font-medium">IM</span>
            </span>
          </Link>
          <p className="text-sm text-slate-400 leading-relaxed mt-2">
            Zgjidhja më e mirë dixhitale për ndjekjen e transportit publik dhe blerjen e abonesë në të gjitha qytetet kryesore shqiptare.
          </p>
          <div className="flex items-center gap-2 mt-2 text-xs text-orange-400 bg-teal-950/40 border border-orange-800/40 px-3 py-1.5 rounded-lg w-fit">
            <ShieldCheck size={14} />
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
              <Mail size={16} className="text-orange-500" />
              <a href="mailto:support@urbani-im.al" className="text-slate-400 hover:text-white transition-colors text-decoration-none">
                support@urbani-im.al
              </a>
            </li>
            <li className="flex items-start gap-2 text-sm text-slate-400">
              <Clock size={16} className="text-orange-500 mt-0.5" />
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

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  MapPin, Bus, WifiOff, Zap, Clock, Shield, 
  ChevronDown, ArrowUpRight, Star, Smartphone, 
  QrCode, Activity, CheckCircle2 
} from 'lucide-react';

interface FAQItem {
  q: string;
  a: string;
}

export default function Home() {
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    { q: 'A është aplikacioni Urbani IM falas?', a: 'Po, Urbani IM është plotësisht falas për t\'u shkarkuar dhe përdorur. Nuk ka blerje apo tarifa të fshehura brenda aplikacionit.' },
    { q: 'Si funksionon ndjekja e autobusëve në kohë reale?', a: 'Të gjithë autobusët kanë të instaluar transmetues GPS. Aplikacioni merr koordinatat e tyre të fundit çdo 3 sekonda dhe i vizualizon live mbi hartë.' },
    { q: 'Si mund të blej një Abone dixhitale?', a: 'Në profilin tuaj brenda aplikacionit, shkoni tek seksioni \'Biletat & Abonetë\', zgjidhni llojin e abonesë dhe kryeni pagesën e sigurt. Kodi QR i gjeneruar do të shërbejë si aboneja juaj.' },
    { q: 'A funksionon aplikacioni pa lidhje interneti (offline)?', a: 'Po, linjat, oraret dhe stacionet ruhen në memorie. Mund t\'i kontrolloni ato edhe offline, por ndjekja live e autobusëve kërkon lidhje aktive interneti.' }
  ];

  const lineStatuses = [
    { name: 'Linja 1 - Unaza', status: 'Operative', type: 'green' },
    { name: 'Linja 2 - Tirana e Re', status: 'Operative', type: 'green' },
    { name: 'Linja 3 - Kombinat-Kinostudio', status: 'Vonesa të lehta', type: 'orange' },
    { name: 'Linja 4 - Sauk-Kopshti Zoologjik', status: 'Operative', type: 'green' },
    { name: 'Linja 5 - Kamëz', status: 'Operative', type: 'green' },
  ];

  return (
    <div className="min-h-screen pb-20 animate-fade-up">
      {/* ── HERO SECTION ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-12 pb-20 md:py-24">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left: Text Content */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200/60 rounded-full px-4 py-1.5 w-fit mx-auto lg:mx-0">
              <span className="live-dot-container">
                <span className="live-dot" />
                <span className="live-ring" />
              </span>
              <span className="text-xs font-semibold text-orange-800">Sistemi GPS i Përditësuar Live</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Udhëto më thjeshtë me <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-500">Urbani IM</span>
            </h1>
            
            <p className="text-base md:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Ndiq autobusët live në hartë, planifiko rrugëtimet më të shpejta të tranzitit dhe bli abone dixhitale direkt nga telefoni yt.
            </p>

            {/* App Store Badges */}
            <div id="shkarko" className="flex flex-wrap gap-4 justify-center lg:justify-start mt-4">
              <a 
                href="https://apps.apple.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-base btn-dark px-6 py-3 shadow-lg shadow-slate-950/10 flex items-center gap-2 hover:-translate-y-0.5 transition-all"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <span>App Store</span>
              </a>
              <a 
                href="https://play.google.com/store/apps/details?id=al.busal.urbani" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-base btn-secondary px-6 py-3 shadow-lg shadow-yellow-500/10 flex items-center gap-2 hover:-translate-y-0.5 transition-all"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M3.18 23.76c.3.17.64.24.99.2l13.19-11.95L13.65 8.3 3.18 23.76zm17.64-10.03L17.5 11.8l-3.8 3.44 3.8 3.44 3.35-1.95a1.34 1.34 0 0 0 0-2.99zM3.38.28C3.06.1 2.68.06 2.34.2L15.33 12 11.52 15.43 3.38.28z" />
                </svg>
                <span>Google Play</span>
              </a>
            </div>

            {/* Ratings / Social Proof */}
            <div className="flex items-center gap-6 justify-center lg:justify-start mt-6 pt-6 border-t border-slate-200">
              <div>
                <div className="flex items-center gap-1 text-amber-500 font-bold text-lg">
                  <Star size={18} fill="currentColor" />
                  <Star size={18} fill="currentColor" />
                  <Star size={18} fill="currentColor" />
                  <Star size={18} fill="currentColor" />
                  <Star size={18} fill="currentColor" />
                  <span className="text-slate-800 ml-1">4.8</span>
                </div>
                <div className="text-xs text-slate-500 mt-1">Vlerësimi në App Store</div>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div>
                <div className="font-extrabold text-slate-900 text-lg">10,000+</div>
                <div className="text-xs text-slate-500 mt-1">Shkarkime Aktive</div>
              </div>
            </div>
          </div>

          {/* Hero Right: Animated CSS Phone Mockup */}
          <div className="lg:col-span-5 flex justify-center relative">
            {/* Background glowing gradients */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-orange-500/10 blur-3xl -z-10" />
            
            {/* Phone Container */}
            <div className="relative w-[300px] h-[600px] bg-slate-950 rounded-[40px] p-3 shadow-2xl border-4 border-slate-800 animate-float flex flex-col overflow-hidden">
              {/* Ear Speaker & Camera notch */}
              <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-30">
                <div className="w-32 h-4 bg-slate-950 rounded-b-xl flex items-center justify-center">
                  <div className="w-12 h-1 bg-slate-800 rounded-full" />
                </div>
              </div>

              {/* Inner Screen */}
              <div className="flex-grow bg-slate-900 rounded-[30px] overflow-hidden relative flex flex-col">
                <img 
                  src="/app_home_screenshot.png" 
                  alt="Urbani IM App Screenshot" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── LIVE TRANSIT STATUS BOARD ───────────────────────────────────── */}
      <section className="py-12 bg-slate-50 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Statusi në Kohë Reale i Linjave
            </h2>
            <p className="text-sm md:text-base text-slate-500 mt-2">
              Paneli i mëposhtëm tregon disponueshmërinë aktuale të linjave kryesore të autobusëve në Tiranë.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {lineStatuses.map((line, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm flex items-center justify-between group hover:border-orange-600/30 hover:shadow-md transition-all duration-300"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-800 group-hover:text-orange-600 transition-colors">
                    {line.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                    <Activity size={12} /> Përditësuar tani
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="live-dot-container">
                    <span className={`live-dot ${line.type === 'orange' ? 'live-dot-orange' : ''}`} />
                    <span className={`live-ring ${line.type === 'orange' ? 'live-ring-orange' : ''}`} />
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {line.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link href="/routes" className="text-sm font-semibold text-orange-600 hover:text-orange-700 inline-flex items-center gap-1 group text-decoration-none">
              Shiko oraret e plota për të gjitha stacionet <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CORE FEATURES ──────────────────────────────────────────────── */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Pse të përdorni Urbani IM?
            </h2>
            <p className="text-slate-500 mt-3 leading-relaxed">
              Zbuloni karakteristikat e fuqishme që e bëjnë transportin tuaj të përditshëm më efikas dhe pa stres.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="glass-card rounded-2xl p-8 relative flex flex-col gap-5">
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <MapPin size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Ndjekja në Kohë Reale</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Shiko pozicionin ekzakt të autobuzëve në hartë live, të përditësuar çdo 3 sekonda përmes koordinatave GPS të transmetuara drejtpërdrejt.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-card rounded-2xl p-8 relative flex flex-col gap-5">
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <Bus size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Bileta &amp; Abone Dixhitale</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Bli abone studentore, të përgjithshme ose bileta ditore direkt në aplikacion. Kryej pagesa të sigurta dhe merr kodin QR për kontrollin.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-card rounded-2xl p-8 relative flex flex-col gap-5">
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <WifiOff size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Funksionimi Offline</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Nuk keni internet? Nuk ka problem. Linjat, oraret dhe itineraret zyrtare të stacioneve ruhen në memorie dhe mund të konsultohen offline.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE DIGITAL TICKET SHOWCASE ─────────────────────────── */}
      <section className="py-16 bg-slate-900 text-white rounded-3xl max-w-7xl mx-auto mx-6 px-8 md:px-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl -z-10" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 flex flex-col gap-6">
            <span className="text-orange-400 font-bold text-xs uppercase tracking-wider">Hapi i ri i udhëtimit</span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Bli Abonenë tuaj në sekonda pa pritje në radhë
            </h2>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              Me sistemin tonë të biletave dixhitale, ju mund të blini abonenë studentore ose të përgjithshme pa shkuar te kioska. Vetëm zgjidhni llojin, kryeni pagesën e sigurt, dhe keni kodin QR gati për skanim.
            </p>
            <div className="flex flex-wrap gap-4 mt-2">
              <Link href="/tickets" className="btn-base btn-secondary text-sm">
                Shiko opsionet e biletave
              </Link>
              <Link href="/help-center" className="btn-base btn-outline border-slate-700 text-slate-300 hover:bg-slate-800 text-sm">
                Mëso më shumë rreth skanimit
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            {/* Rotating / Glossy Ticket Mockup */}
            <div className="relative w-72 h-[380px] bg-gradient-to-br from-slate-800 to-slate-950 rounded-2xl border border-slate-700/60 p-6 shadow-2xl flex flex-col justify-between group hover:scale-[1.03] transition-all duration-300 overflow-hidden">
              {/* Shining overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <div className="w-6 h-6 rounded-md bg-orange-500 flex items-center justify-center text-white">
                    <Bus size={12} strokeWidth={2.5} />
                  </div>
                  <span className="font-bold text-xs text-white">Urbani IM</span>
                </div>
                <div className="bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded text-[8px] font-bold uppercase">
                  Aboni Dixhital
                </div>
              </div>

              {/* QR Code Container */}
              <div className="flex-grow flex flex-col items-center justify-center my-6">
                <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-800">
                  <QrCode size={120} className="text-slate-900" />
                </div>
                <p className="text-[10px] text-slate-400 mt-3 uppercase tracking-wider font-semibold">
                  Skeno kodin për verifikim
                </p>
              </div>

              <div className="border-t border-slate-800/80 pt-4 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>Pronari:</span>
                  <span className="font-semibold text-slate-300">Student</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>Validiteti:</span>
                  <span className="font-semibold text-orange-400">Qershor 2026</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>Statusi:</span>
                  <span className="font-bold text-orange-400">AKTIV</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS SECTION ──────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: <Zap size={20} />, label: 'Përdorues', value: '10,000+ Shkarkime Aktive', desc: 'Qindra qytetarë që udhëtojnë çdo ditë më shpejt.' },
            { icon: <Clock size={20} />, label: 'Përditësimi GPS', value: 'Live çdo 3 sekonda', desc: 'Të dhëna të sakta pa vonesa në marrjen e sinjalit.' },
            { icon: <Shield size={20} />, label: 'Privatësia', value: '100% e mbrojtur', desc: 'Të dhënat tuaja përpunohen plotësisht sipas GDPR.' },
          ].map((item, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200/50 p-6 flex items-start gap-4 shadow-sm">
              <span className="flex p-3 rounded-xl bg-orange-50 text-orange-600 flex-shrink-0">
                {item.icon}
              </span>
              <div>
                <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                  {item.label}
                </p>
                <p className="text-base font-bold text-slate-800 mt-1">
                  {item.value}
                </p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ SECTION (ACCORDION) ────────────────────────────────────── */}
      <section className="py-12 max-w-3xl mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Pyetjet më të shpeshta (FAQ)
          </h2>
          <p className="text-slate-500 mt-2 text-sm md:text-base">
            Përgjigje të shpejta për funksionimin e përgjithshëm të aplikacionit.
          </p>
        </div>

        <div className="accordion-wrapper">
          {faqs.map((faq, index) => {
            const isOpen = openAccordion === index;
            return (
              <div key={index} className={`accordion-card ${isOpen ? 'open' : ''}`}>
                <button
                  type="button"
                  onClick={() => setOpenAccordion(isOpen ? null : index)}
                  className="accordion-trigger"
                >
                  <span className="accordion-title">{faq.q}</span>
                  <div className="accordion-icon">
                    <ChevronDown size={16} strokeWidth={2.5} />
                  </div>
                </button>
                <div 
                  className="accordion-content"
                  style={{ maxHeight: isOpen ? '200px' : '0px' }}
                >
                  <div className="accordion-content-inner">
                    <p>{faq.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <Link href="/help-center" className="text-sm font-semibold text-orange-600 hover:text-orange-700 inline-flex items-center gap-1 group text-decoration-none">
            Shiko qendrën e plotë të ndihmës për më shumë udhëzime <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
}
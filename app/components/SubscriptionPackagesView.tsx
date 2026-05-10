'use client';
import { useState } from 'react';
import { ChevronLeft, Check, Ticket, Sparkles, CreditCard, ShieldCheck, ArrowRight } from 'lucide-react';
import useStore from '../store/useStore';
import { translations } from '../store/translations';

const PACKAGES = [
  {
    id: 'general',
    name: 'Abone e Përgjithshme',
    price: '1600',
    duration: '30 Ditë',
    color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    popular: true,
    features: [
      'Udhëtime të pakufizuara',
      'E vlefshme në çdo linjë brenda Tiranës',
      'Format digjital në aplikacion',
      'Vlefshmëri 1 mujore'
    ]
  },
  {
    id: 'student',
    name: 'Abone Studenti',
    price: '600',
    duration: '30 Ditë',
    color: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    popular: false,
    features: [
      'Zbritje speciale për studentë',
      'Kërkohet karta e studentit',
      'E vlefshme në çdo linjë',
      'Format digjital në aplikacion'
    ]
  },
  {
    id: 'single_line',
    name: 'Abone Linje',
    price: '900',
    duration: '30 Ditë',
    color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    popular: false,
    features: [
      'Zgjedhje e vetëm 1 linje',
      'Udhëtime të pakufizuara në atë linjë',
      'Format digjital në aplikacion',
      'Ideale për rrugë ditore fiks'
    ]
  }
];

export default function SubscriptionPackagesView() {
  const setView = useStore((s: any) => s.setView);
  const language = useStore((s: any) => s.language);
  const t = translations[language] || translations.al;
  const [selectedPkg, setSelectedPkg] = useState<string | null>(null);

  return (
    <div 
      style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)', color: '#fff', overflowY: 'auto', paddingBottom: 100 }}
      onClick={() => setSelectedPkg(null)}
    >
      
      {/* Header */}
      <div style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', gap: 16, position: 'sticky', top: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(12px)', zIndex: 10, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={() => setView('map')} style={{ color: '#fff', padding: 8, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: 'none', cursor: 'pointer', display: 'flex' }}>
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Ticket size={22} color="#f59e0b" />
            {t.packages || 'Abonimet'}
          </h1>
        </div>
      </div>

      {/* Hero Section */}
      <div style={{ padding: '30px 20px 10px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 10px 0', background: 'linear-gradient(135deg, #fff, #a1a1aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Zgjidh Planin Tënd
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, margin: 0, lineHeight: 1.5 }}>
          Abonohu digjitalisht dhe udhëto lirshëm në të gjithë Tiranën, pa pasur nevojë për karton fizik.
        </p>
      </div>

      {/* Packages List */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {PACKAGES.map((pkg) => {
          const isSelected = selectedPkg === pkg.id;
          return (
            <div 
              key={pkg.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPkg(pkg.id);
              }}
              style={{
                background: isSelected ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isSelected ? '#f59e0b' : 'rgba(255,255,255,0.05)'}`,
                borderRadius: 24,
                padding: 24,
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                boxShadow: isSelected ? '0 20px 40px rgba(245, 158, 11, 0.1)' : 'none'
              }}
            >
              {/* Background Glow */}
              <div style={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, background: pkg.color, opacity: 0.1, filter: 'blur(40px)', borderRadius: '50%' }} />

              {pkg.popular && (
                <div style={{ position: 'absolute', top: 0, right: 24, background: pkg.color, padding: '6px 12px', borderBottomLeftRadius: 12, borderBottomRightRadius: 12, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, color: '#fff' }}>
                  <Sparkles size={14} /> MË E SHITURA
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: 20, fontWeight: 700 }}>{pkg.name}</h3>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: 100 }}>
                    {pkg.duration}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    {pkg.price} <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>L</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {pkg.features.map((feature, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '50%', padding: 4, display: 'flex' }}>
                      <Check size={12} color="#fff" />
                    </div>
                    <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>{feature}</span>
                  </div>
                ))}
              </div>

              {/* Footer with inline checkout */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.05)", minHeight: 45 }}>
                
                {/* Left Side: Selection indicator */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: "50%",
                    border: `1.5px solid ${isSelected ? "#f59e0b" : "rgba(255,255,255,0.2)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "border-color 0.2s",
                  }}>
                    {isSelected && <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b" }} />}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: isSelected ? "#f59e0b" : "rgba(255,255,255,0.4)", transition: "color 0.2s" }}>
                    {isSelected ? "E Zgjedhur" : "Zgjidh këtë plan"}
                  </span>
                </div>

                {/* Right Side: Animated Checkout Button */}
                <div 
                  style={{ 
                    overflow: 'hidden', 
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    opacity: isSelected ? 1 : 0,
                    transform: isSelected ? 'translateX(0)' : 'translateX(10px)',
                    maxWidth: isSelected ? 200 : 0,
                    pointerEvents: isSelected ? 'auto' : 'none'
                  }}
                >
                  <button 
                    onClick={(e) => { e.stopPropagation(); /* Perform checkout */ }}
                    style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)' }}
                  >
                    VAZHDO <ArrowRight size={14} />
                  </button>
                </div>

              </div>

            </div>
          );
        })}
      </div>

      {/* Trust badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '20px', color: 'rgba(255,255,255,0.3)', fontSize: 13, marginTop: 'auto' }}>
        <ShieldCheck size={16} /> Pagesë 100% e Sigurt
      </div>

    </div>
  );
}

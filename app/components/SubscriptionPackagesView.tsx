'use client';
import { useState } from 'react';
import { ChevronLeft, Check, Ticket, Sparkles, CreditCard, ShieldCheck, ArrowRight } from 'lucide-react';
import useStore from '../store/useStore';
import { translations } from '../store/translations';

export default function SubscriptionPackagesView() {
  const setView = useStore((s: any) => s.setView);
  const language = useStore((s: any) => s.language);
  const t = translations[language as keyof typeof translations] || translations.al;
  const [selectedPkg, setSelectedPkg] = useState<string | null>(null);

  const PACKAGES = [
    {
      id: 'general',
      name: t.general_pass,
      price: '1600',
      duration: t.thirty_days,
      color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      popular: true,
      features: [
        t.unlimited_rides,
        t.valid_all_lines,
        t.digital_format,
        t.one_month_validity
      ]
    },
    {
      id: 'student',
      name: t.student_pass,
      price: t.free,
      duration: t.thirty_days,
      color: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      popular: false,
      features: [
        t.student_discount,
        t.student_card_required,
        t.valid_every_line,
        t.digital_format
      ]
    },
    {
      id: 'tourist',
      name: t.tourist_pass,
      price: '800',
      duration: t.seven_days,
      color: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
      popular: false,
      features: [
        t.tourist_unlimited,
        t.valid_all_lines,
        t.digital_format,
        language === 'al' ? 'Ideale për vizitorë' : 'Ideal for visitors'
      ]
    },
    {
      id: 'single_line',
      name: t.single_line_pass,
      price: '900',
      duration: t.thirty_days,
      color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      popular: false,
      features: [
        t.single_line_choice,
        t.unlimited_single_line,
        t.digital_format,
        t.ideal_fixed_route
      ]
    }
  ];

  return (
    <div
      style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)', color: '#fff', overflowY: 'auto', paddingBottom: 100 }}
      onClick={() => setSelectedPkg(null)}
    >

      {/* Header */}
      <div style={{ 
        padding: '24px 20px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px', 
        position: 'sticky', 
        top: 0, 
        background: 'var(--bg-dark)', 
        zIndex: 10,
      }}>
        <div style={{
          width: '38px', height: '38px', borderRadius: '10px',
          background: 'rgba(245,158,11,0.1)',
          border: '0.5px solid rgba(245,158,11,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Ticket size={18} style={{ color: '#f59e0b' }} />
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: '#fff' }}>{t.packages}</h1>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', margin: 0, marginTop: '2px' }}>
            {language === 'al' ? 'Zgjidhni abonimin tuaj' : 'Choose your subscription'}
          </p>
        </div>
      </div>

      {/* Hero Section */}
      <div style={{ padding: '30px 20px 10px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 10px 0', background: 'linear-gradient(135deg, #fff, #a1a1aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {t.choose_plan}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, margin: 0, lineHeight: 1.5 }}>
          {t.plan_subtitle}
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
                transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
                transform: isSelected ? 'scale(1.015)' : 'scale(1)',
                boxShadow: isSelected ? '0 20px 40px rgba(245, 158, 11, 0.12)' : '0 4px 12px rgba(0,0,0,0.02)'
              }}
            >
              {/* Background Glow */}
              <div style={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, background: pkg.color, opacity: 0.1, filter: 'blur(40px)', borderRadius: '50%' }} />

              {pkg.popular && (
                <div style={{ position: 'absolute', top: 0, right: 24, background: pkg.color, padding: '6px 12px', borderBottomLeftRadius: 12, borderBottomRightRadius: 12, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, color: '#fff', textTransform: 'uppercase' }}>
                  <Sparkles size={14} /> {t.best_seller}
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
                    {pkg.price} {pkg.price !== t.free && <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>L</span>}
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
                    transition: "border-color 0.4s cubic-bezier(0.25, 1, 0.5, 1)",
                  }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b", transform: isSelected ? 'scale(1)' : 'scale(0)', opacity: isSelected ? 1 : 0, transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)' }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: isSelected ? "#f59e0b" : "rgba(255,255,255,0.4)", transition: "color 0.4s ease" }}>
                    {isSelected ? t.selected : t.choose_this_plan}
                  </span>
                </div>

                {/* Animated Checkout Button */}
                <div
                  style={{
                    overflow: 'hidden',
                    transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
                    opacity: isSelected ? 1 : 0,
                    transform: isSelected ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.95)',
                    maxWidth: isSelected ? 200 : 0,
                    pointerEvents: isSelected ? 'auto' : 'none'
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      useStore.getState().setCheckoutPackage(pkg);
                    }}
                    style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)' }}
                  >
                    {t.continue_btn} <ArrowRight size={14} />
                  </button>
                </div>

              </div>

            </div>
          );
        })}
      </div>

      {/* Trust badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '20px', color: 'rgba(255,255,255,0.3)', fontSize: 13, marginTop: 'auto' }}>
        <ShieldCheck size={16} /> {t.secure_payment}
      </div>

    </div>
  );
}

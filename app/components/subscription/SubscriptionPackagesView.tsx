'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Check, Ticket, Sparkles, CreditCard, ShieldCheck, ArrowRight, Zap, Star, Clock, Route, Shirt } from 'lucide-react';
import useStore from '../../store/useStore';
import { translations } from '../../store/translations';

export default function SubscriptionPackagesView() {
  const setView = useStore((s: any) => s.setView);
  const language = useStore((s: any) => s.language);
  const t = translations[language as keyof typeof translations] || translations.al;
  const [selectedPkg, setSelectedPkg] = useState<string | null>('general');

  const PACKAGES = [
    {
      id: 'general',
      name: t.general_pass,
      price: '1600',
      duration: t.thirty_days,
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      popular: true,
      icon: Zap,
      description: t.sub_desc_general,
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
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      popular: false,
      icon: Star,
      description: t.sub_desc_student,
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
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      popular: false,
      icon: Shirt,
      description: t.sub_desc_tourist,
      features: [
        t.tourist_unlimited,
        t.valid_all_lines,
        t.digital_format,
        t.sub_7day_validity
      ]
    },
    {
      id: 'single_line',
      name: t.single_line_pass,
      price: '900',
      duration: t.thirty_days,
      color: '#a855f7',
      gradient: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
      popular: false,
      icon: Route,
      description: t.sub_desc_single_line,
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
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#0a0f1a',
        color: '#fff',
        overflowY: 'auto',
        paddingBottom: 120,
        position: 'relative'
      }}
      onClick={() => setSelectedPkg(null)}
    >


      {/* Header */}
      <div style={{
        padding: '24px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        position: 'sticky',
        top: 0,
        background: 'radial-gradient(ellipse at 50% -20%, rgba(245, 158, 11, 0.12), transparent 70%), linear-gradient(180deg, rgba(10,15,26,0.9) 60%, transparent 100%)',
        backdropFilter: 'blur(12px)',
        zIndex: 20,
      }}>

        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '26px', fontWeight: '800', margin: 0, letterSpacing: '-0.8px', lineHeight: 1.1, background: 'linear-gradient(to right, #ffffff, rgba(255,255,255,0.6))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {t.packages}
          </h1>
          <p style={{ color: 'rgba(245, 158, 11, 0.8)', fontSize: '13px', margin: '4px 0 0 0', fontWeight: '600', letterSpacing: '0.2px' }}>
            {t.sub_choose_travel_plan}
          </p>
        </div>
      </div>

      {/* Hero Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ padding: '32px 24px 16px', position: 'relative', zIndex: 1 }}
      >
        <h2 style={{ fontSize: '32px', fontWeight: '900', margin: '0 0 8px 0', lineHeight: 1.1, background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {t.choose_plan}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px', margin: 0, lineHeight: 1.5, maxWidth: '280px' }}>
          {t.plan_subtitle}
        </p>
      </motion.div>

      {/* Packages List */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', zIndex: 1 }}>
        <AnimatePresence>
          {PACKAGES.map((pkg, idx) => {
            const isSelected = selectedPkg === pkg.id;
            const Icon = pkg.icon;

            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPkg(pkg.id);
                }}
                style={{
                  background: isSelected ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                  border: `1.5px solid ${isSelected ? pkg.color : 'rgba(255,255,255,0.05)'}`,
                  borderRadius: '28px',
                  padding: '24px',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isSelected ? `0 20px 40px ${pkg.color}15` : 'none'
                }}
              >
                {/* Popular Badge */}
                {pkg.popular && (
                  <div style={{
                    position: 'absolute', top: 0, right: 0,
                    background: pkg.gradient,
                    padding: '6px 16px',
                    borderBottomLeftRadius: '16px',
                    fontSize: '11px', fontWeight: '800',
                    display: 'flex', alignItems: 'center', gap: '4px', color: '#fff',
                    textTransform: 'uppercase', letterSpacing: '0.05em'
                  }}>
                    <Sparkles size={12} /> {t.best_seller}
                  </div>
                )}
                
                {/* Card Header */}
                <div style={{ display: 'flex', marginBottom: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ margin: '0', fontSize: '18px', fontWeight: '800', color: isSelected ? '#fff' : 'rgba(255,255,255,0.9)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {pkg.name}
                    </h3>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: pkg.color }}>
                      {pkg.duration}
                    </div>
                  </div>
                  <div style={{ 
                    background: isSelected ? 'rgba(255,255,255,0.15)' : `${pkg.color}15`,
                    padding: '6px 12px',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: '900',
                    color: isSelected ? '#fff' : pkg.color,
                    transition: 'all 0.3s ease',
                    flexShrink: 0
                  }}>
                    {pkg.price === t.free ? t.free : `${pkg.price}L`}
                  </div>
                </div>

                {/* Description */}
                <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.4 }}>
                  {pkg.description}
                </p>

                {/* Features */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {pkg.features.map((feature, fIdx) => (
                    <div key={fIdx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '11px', color: isSelected ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.4)', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        • {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Action Button - Shows when selected */}
                <motion.div
                  initial={false}
                  animate={{ height: isSelected ? 'auto' : 0, opacity: isSelected ? 1 : 0, marginTop: isSelected ? 24 : 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ overflow: 'hidden' }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      useStore.getState().setCheckoutPackage(pkg);
                      setView('checkout');
                    }}
                    style={{
                      width: '100%',
                      background: pkg.gradient,
                      color: '#fff',
                      border: 'none',
                      padding: '14px',
                      borderRadius: '16px',
                      fontSize: '15px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: `0 10px 20px ${pkg.color}30`
                    }}
                  >
                    {t.continue_btn} <ArrowRight size={18} />
                  </button>
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Footer / Trust Badge */}
      <div style={{ padding: '20px', marginTop: 'auto', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 20px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '100px',
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          <ShieldCheck size={16} color="#10b981" />
          <span style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.5)' }}>
            {t.secure_payment}
          </span>
        </div>
      </div>
    </div>
  );
}

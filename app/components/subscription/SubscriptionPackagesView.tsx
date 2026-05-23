'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import useStore from '../../store/useStore';
import { translations } from '../../store/translations';

const COLORS = {
  general:     { bg: 'rgba(186,117,23,0.10)', accent: '#BA7517', pill: 'rgba(186,117,23,0.14)', pillText: '#BA7517' },
  student:     { bg: 'rgba(59,109,17,0.10)',  accent: '#3B6D11', pill: 'rgba(59,109,17,0.14)',  pillText: '#3B6D11' },
  tourist:     { bg: 'rgba(24,95,165,0.10)',  accent: '#185FA5', pill: 'rgba(24,95,165,0.14)',  pillText: '#185FA5' },
  single_line: { bg: 'rgba(126,89,255,0.12)', accent: '#7E59FF', pill: 'rgba(126,89,255,0.18)', pillText: '#E8E0FF' },
} as const;

export default function SubscriptionPackagesView() {
  const setView   = useStore((s: any) => s.setView);
  const language  = useStore((s: any) => s.language);
  const t         = translations[language as keyof typeof translations] || translations.al;
  const [selectedPkg, setSelectedPkg] = useState<string>('general');

  const PACKAGES = [
    {
      id: 'general',
      name: t.general_pass,
      price: '1600',
      duration: t.thirty_days,
      popular: true,
      description: t.sub_desc_general,
      features: [t.unlimited_rides, t.valid_all_lines, t.digital_format, t.one_month_validity],
    },
    {
      id: 'student',
      name: t.student_pass,
      price: t.free,
      duration: t.thirty_days,
      popular: false,
      description: t.sub_desc_student,
      features: [t.student_discount, t.student_card_required, t.valid_every_line, t.digital_format],
    },
    {
      id: 'tourist',
      name: t.tourist_pass,
      price: '800',
      duration: t.seven_days,
      popular: false,
      description: t.sub_desc_tourist,
      features: [t.tourist_unlimited, t.valid_all_lines, t.digital_format, t.sub_7day_validity],
    },
    {
      id: 'single_line',
      name: t.single_line_pass,
      price: '900',
      duration: t.thirty_days,
      popular: false,
      description: t.sub_desc_single_line,
      features: [t.single_line_choice, t.unlimited_single_line, t.digital_format, t.ideal_fixed_route],
    },
  ];

  return (
    <div style={styles.root}>

      {/* ── Header ── */}
      <div style={styles.header}>
        <h1 style={styles.h1}>{t.choose_plan}</h1>
        <p style={styles.subtitle}>{t.plan_subtitle}</p>
      </div>

      {/* ── Cards ── */}
      <div style={styles.list}>
        {PACKAGES.map((pkg, idx) => {
          const isSelected = selectedPkg === pkg.id;
          const colors     = COLORS[pkg.id as keyof typeof COLORS];

          return (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.07 }}
              onClick={() => setSelectedPkg(pkg.id)}
              style={{
                ...styles.card,
                borderColor: isSelected ? colors.accent : 'rgba(255,255,255,0.08)',
                borderWidth: isSelected ? 1.5 : 1,
                background: isSelected ? `linear-gradient(145deg, ${colors.accent}15 0%, rgba(255,255,255,0.06) 100%)` : 'rgba(255,255,255,0.04)',
                boxShadow: isSelected ? `0 24px 60px ${colors.accent}20` : 'none',
                transform: isSelected ? 'scale(1.01)' : 'none',
              }}
            >
              {/* Card top row */}
              <div style={styles.cardTop}>
                <div style={styles.nameBlock}>
                  <div style={styles.cardName}>{pkg.name}</div>
                  <div style={styles.cardDur}>{pkg.duration}</div>
                  {pkg.popular && (
                    <span style={{ ...styles.badge, background: colors.pill, color: colors.pillText }}>
                      {t.best_seller}
                    </span>
                  )}
                </div>

                <div style={{
                  ...styles.priceTag,
                  background: isSelected ? colors.accent : 'rgba(255,255,255,0.10)',
                  color: isSelected ? '#fff' : 'rgba(255,255,255,0.9)',
                  borderColor: isSelected ? 'transparent' : 'rgba(255,255,255,0.08)',
                }}>
                  {pkg.price === t.free ? t.free : `${pkg.price} L`}
                </div>
              </div>

              {/* Divider */}
              <div style={styles.divider} />

              {/* Features */}
              <div style={styles.features}>
                {pkg.features.map((feat, fi) => (
                  <div key={fi} style={styles.feat}>
                    <span style={{ ...styles.dot, background: isSelected ? colors.accent : 'rgba(255,255,255,0.55)' }} />
                    <span style={styles.featText}>{feat}</span>
                  </div>
                ))}
              </div>

              {/* CTA — only when selected */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    key="cta"
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        useStore.getState().setCheckoutPackage(pkg);
                        setView('checkout');
                      }}
                      style={{ ...styles.ctaBtn, background: colors.accent }}
                    >
                      {t.continue_btn}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* ── Footer ── */}
      <div style={styles.footer}>
        <span style={styles.footerText}>{t.secure_payment}</span>
      </div>
    </div>
  );
}

/* ─── Styles ─────────────────────────────────────────────────── */
const styles: Record<string, React.CSSProperties> = {
  root: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--bg-dark, #040712)',
    color: '#fff',
    overflowY: 'auto',
    paddingBottom: 100,
  },
  header: {
    padding: '32px 20px 16px',
    background: 'radial-gradient(ellipse at 50% -20%, rgba(48, 209, 88, 0.12), transparent 70%), linear-gradient(180deg, rgba(10,15,26,0.9) 60%, transparent 100%)',
    backdropFilter: 'blur(12px)',
    position: 'sticky',
    top: 0,
    zIndex: 20,
  },
  h1: {
    fontSize: 24,
    fontWeight: 600,
    color: '#fff',
    margin: 0,
    letterSpacing: '-0.5px',
    background: 'linear-gradient(to right, #ffffff, rgba(255,255,255,0.65))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.65)',
    margin: '4px 0 0',
    fontWeight: 400,
  },
  list: {
    padding: '8px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  card: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: '20px',
    cursor: 'pointer',
    transition: 'border-color 0.2s, background 0.2s, transform 0.2s',
    userSelect: 'none',
    backdropFilter: 'blur(10px)',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  nameBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    flex: 1,
    minWidth: 0,
  },
  cardName: {
    fontSize: 15,
    fontWeight: 700,
    color: '#fff',
    letterSpacing: '-0.2px',
  },
  cardDur: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.68)',
    fontWeight: 500,
  },
  badge: {
    marginTop: 4,
    display: 'inline-block',
    fontSize: 11,
    fontWeight: 700,
    padding: '4px 10px',
    borderRadius: 999,
    letterSpacing: '0.02em',
    alignSelf: 'flex-start',
    border: '1px solid rgba(255,255,255,0.12)',
  },
  priceTag: {
    fontSize: 14,
    fontWeight: 700,
    padding: '8px 14px',
    borderRadius: 12,
    transition: 'background 0.2s, color 0.2s',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    border: '1px solid rgba(255,255,255,0.08)',
  },
  divider: {
    height: 0.5,
    background: 'rgba(255,255,255,0.08)',
    margin: '14px 0',
  },
  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  feat: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: '50%',
    flexShrink: 0,
    transition: 'background 0.2s',
  },
  featText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 1.4,
  },
  ctaBtn: {
    width: '100%',
    padding: '13px',
    borderRadius: 12,
    border: 'none',
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    letterSpacing: '-0.1px',
    transition: 'opacity 0.15s',
  },
  footer: {
    marginTop: 'auto',
    padding: '20px',
    textAlign: 'center',
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: 500,
  },
};
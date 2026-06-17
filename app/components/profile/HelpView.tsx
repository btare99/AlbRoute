'use client';
import { motion } from 'framer-motion';
import { IonIcon } from '@/app/components/common/IonIcon';
import useStore from '../../store/useStore';
import {
  helpCircleOutline,
  shieldOutline,
  documentTextOutline,
  mailOutline,
  chevronForwardOutline,
  phonePortraitOutline,
  chatbubbleOutline,
  arrowBackOutline,
} from 'ionicons/icons';
import { translations } from '../../store/translations';

// ─── Konstante hapësire ───────────────────────────────────────────────────────
const PX = '24px';
const ROW_PX = '16px';

// ─── Tipi ─────────────────────────────────────────────────────────────────────
interface HelpItem {
  icon: string;
  label: string;
  sublabel?: string;
  onClick: () => void;
  danger?: boolean;
}

interface HelpSection {
  title: string;
  items: HelpItem[];
}

// ─── Faqja kryesore ───────────────────────────────────────────────────────────
export default function HelpView() {
  const setView = useStore((state: any) => state.setView);
  const language = useStore((state: any) => state.language);
  const t = translations[language] || translations.al;
  const currentCoverIndex = useStore((state: any) => state.currentCoverIndex);

  const sections: HelpSection[] = [
    {
      title: 'General',
      items: [
        {
          icon: helpCircleOutline,
          label: 'Help Center',
          sublabel: 'urbanim.app/help',
          onClick: () => window.open('https://alb-route-1aim.vercel.app/help-center', '_blank', 'noreferrer'),
        },
        {
          icon: chatbubbleOutline,
          label: 'Feedback',
          sublabel: 'Lini një feedback',
          onClick: () => setView('feedback'),
        },
        {
          icon: mailOutline,
          label: 'Email Support',
          sublabel: 'support@albroute.al',
          onClick: () => window.open('mailto:support@albroute.al'),
        },
      ],
    },
    {
      title: 'Legal',
      items: [
        {
          icon: shieldOutline,
          label: 'Privacy Policy',
          onClick: () => window.open('https://alb-route-1aim.vercel.app/privacy-policy', '_blank', 'noreferrer'),
        },
        {
          icon: documentTextOutline,
          label: 'Terms and Conditions',
          onClick: () => window.open('https://alb-route-1aim.vercel.app/terms-and-conditions', '_blank', 'noreferrer'),
        },
      ],
    },
    {
      title: 'App',
      items: [
        {
          icon: phonePortraitOutline,
          label: 'About',
          sublabel: `Version 1.0.6`,
          onClick: () => { },
        },
      ],
    },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{ height: '100%', overflowY: 'auto', background: 'var(--bg-dark)', position: 'relative' }}
    >

      {/* Curved Gradient Header (Cover) */}
      <div style={{
        position: 'relative',
        height: 'calc(170px + env(safe-area-inset-top, 0px))',
        overflow: 'visible',
        boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
        zIndex: 10,
        background: '#0a0f1d'
      }}>
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
        {/* Navigation header with Back Button */}
        <div style={{
          position: 'absolute', top: 'calc(12px + env(safe-area-inset-top, 0px))', left: '20px', right: '20px',
          display: 'flex', alignItems: 'center', zIndex: 5
        }}>
          {/* Back Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setView('profile')}
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
              {t.prof_help_center}
            </span>
          </div>
        </div>

        {/* Organic Wave Bottom Divider */}
        <svg viewBox="0 0 1440 220" preserveAspectRatio="none" style={{ position: 'absolute', bottom: -1, left: 0, width: '100%', height: '45px', zIndex: 2 }}>
          <path fill="var(--bg-dark)" d="M0,160 C 180,160 180,210 360,210 C 540,210 540,110 720,110 C 900,110 900,210 1080,210 C 1260,210 1260,160 1440,160 L 1440,220 L 0,220 Z"></path>
        </svg>
      </div>

      {/* Content scroll area */}
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: 'calc(80px + max(24px, calc(16px + env(safe-area-inset-bottom, 12px))))', marginTop: '20px' }}>

        {/* Seksionet */}
        {sections.map((section, sIdx) => (
          <motion.div 
            key={section.title}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15, delay: sIdx * 0.1 }}
          >
            <p style={{
              fontSize: '13px',
              fontWeight: '700',
              color: '#ffffff',
              margin: '24px 0 12px',
              padding: `0 ${ROW_PX}`,
            }}>
              {section.title}
            </p>

            {section.items.map((item, index) => (
              <div key={item.label}>
                <HelpRow item={item} rowPx={ROW_PX} />
                {index < section.items.length - 1 && (
                  <div style={{
                    height: '0.5px',
                    background: 'rgba(255,255,255,0.06)',
                    margin: `0 ${ROW_PX}`,
                  }} />
                )}
              </div>
            ))}
          </motion.div>
        ))}

      </div>
    </motion.div>
  );
}

// ─── HelpRow ──────────────────────────────────────────────────────────────────
function HelpRow({ item, rowPx }: { item: HelpItem; rowPx: string }) {
  return (
    <button
      type="button"
      onClick={item.onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        padding: `10px ${rowPx}`,
        borderRadius: '14px',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'background 0.2s ease',
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{
        width: '38px',
        height: '38px',
        borderRadius: '11px',
        background: 'rgba(255,255,255,0.07)',
        border: '0.5px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <IonIcon
          icon={item.icon}
          style={{ fontSize: 17, color: 'rgba(255,255,255,0.5)' }}
        />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: 0,
          fontSize: '15px',
          fontWeight: '600',
          letterSpacing: '-0.1px',
          lineHeight: 1.25,
          color: item.danger ? '#ef4444' : '#fff',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {item.label}
        </p>
        {item.sublabel && (
          <p style={{
            margin: '3px 0 0 0',
            fontSize: '12px',
            color: item.danger ? 'rgba(239,68,68,0.75)' : 'rgba(255,255,255,0.55)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {item.sublabel}
          </p>
        )}
      </div>

      <IonIcon
        icon={chevronForwardOutline}
        style={{
          fontSize: 13,
          color: item.danger ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.14)',
          flexShrink: 0,
        }}
      />
    </button>
  );
}

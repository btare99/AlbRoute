'use client';
import { IonIcon } from '@ionic/react';
import useStore from '../../store/useStore';
import { ChevronLeft } from 'lucide-react';
import {
  helpCircleOutline,
  shieldOutline,
  documentTextOutline,
  mailOutline,
  chevronForwardOutline,
  phonePortraitOutline,
  chatbubbleOutline,
} from 'ionicons/icons';

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

  const sections: HelpSection[] = [
    {
      title: 'General',
      items: [
        {
          icon: helpCircleOutline,
          label: 'Help Center',
          sublabel: 'urbanim.app/help',
          onClick: () => window.open('https://alb-route.vercel.app/help', '_blank', 'noreferrer'),
        },
        {
          icon: chatbubbleOutline,
          label: 'Feedback',
          sublabel: 'support@albroute.al',
          onClick: () => window.open('mailto:support@albroute.al'),
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
          onClick: () => setView('privacy'),
        },
        {
          icon: documentTextOutline,
          label: 'Terms and Conditions',
          onClick: () => setView('terms'),
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
          onClick: () => {},
        },
      ],
    },
  ];

  return (
    <div className="page-content" style={{ padding: `24px ${PX} 32px` }}>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setView('profile')}
        style={{
          display: 'flex', alignItems: 'center', gap: '4px',
          color: '#71717a', background: 'none', border: 'none',
          fontSize: '14px', fontWeight: '600', cursor: 'pointer',
          padding: '8px 0', minWidth: 'auto', minHeight: 'auto',
          marginBottom: '24px',
        }}
      >
        <ChevronLeft size={18} /> Back
      </button>

      {/* ── Title block ───────────────────────────────────────────────────── */}
      <div style={{
        padding: `0 ${ROW_PX}`,
        marginBottom: '28px',
      }}>
        <h2 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#fff',
          lineHeight: 1.12,
          letterSpacing: '-0.7px',
          margin: '0 0 8px 0',
        }}>
          Help &amp;<br />Support
        </h2>
        <p style={{
          fontSize: '13px',
          color: 'rgba(255,255,255,0.3)',
          lineHeight: 1.5,
          margin: 0,
        }}>
          Resources, legal info and account settings
        </p>
      </div>

      {/* ── Seksionet ─────────────────────────────────────────────────────── */}
      {sections.map((section) => (
        <div key={section.title}>
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
        </div>
      ))}

    </div>
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
            color: item.danger ? 'rgba(239,68,68,0.45)' : 'rgba(255,255,255,0.27)',
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

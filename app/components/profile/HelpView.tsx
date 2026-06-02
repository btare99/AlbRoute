'use client';
import { IonIcon } from '@ionic/react';
import useStore from '../../store/useStore';
import {
  chevronBackOutline,
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
    <div className="page-content" style={{ padding: `28px ${PX} 48px` }}>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div style={{
        marginBottom: '36px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
      }}>
        <button
          type="button"
          onClick={() => setView('profile')}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.05)',
            border: '0.5px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            flexShrink: 0,
            padding: 0,
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
        >
          <IonIcon icon={chevronBackOutline} style={{ fontSize: 20 }} />
        </button>

        <div style={{ flex: 1 }}>
          <h1 style={{
            fontSize: '16px',
            fontWeight: '600',
            margin: 0,
            color: '#fff',
          }}>
            Help &amp; Support
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.3)',
            fontSize: '12px',
            margin: '2px 0 0 0',
          }}>
            Resources, legal info and account settings
          </p>
        </div>
      </div>

      {/* ── Title block ───────────────────────────────────────────────────── */}
      <div style={{
        padding: `0 ${ROW_PX}`,
        marginBottom: '36px',
      }}>
        <p style={{
          fontSize: '11px',
          fontWeight: '600',
          color: 'rgba(255,255,255,0.2)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          margin: '0 0 14px 0',
        }}>
          Overview
        </p>
        <h2 style={{
          fontSize: '30px',
          fontWeight: '700',
          color: '#fff',
          lineHeight: 1.12,
          letterSpacing: '-0.7px',
          margin: '0 0 10px 0',
        }}>
          Help &amp;<br />Support
        </h2>
        <p style={{
          fontSize: '14px',
          color: 'rgba(255,255,255,0.3)',
          lineHeight: 1.55,
          margin: 0,
        }}>
          Resources, legal info and account settings
        </p>
      </div>

      {/* ── Seksionet ─────────────────────────────────────────────────────── */}
      {sections.map((section) => (
        <div key={section.title}>
          <p style={{
            fontSize: '11px',
            fontWeight: '600',
            color: 'rgba(255,255,255,0.2)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            margin: '24px 0 6px',
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
        padding: `12px ${rowPx}`,
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
        width: '40px',
        height: '40px',
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
          style={{ fontSize: 18, color: 'rgba(255,255,255,0.5)' }}
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

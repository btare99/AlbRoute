'use client';

import { useState } from 'react';
import useStore from '../../store/useStore';
import { IonIcon } from '@/app/components/common/IonIcon';
import { chevronBackOutline, checkmarkCircleOutline } from 'ionicons/icons';

const MAX_CHARS = 500;

export default function FeedbackView() {
  const setView = useStore((state: any) => state.setView);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  const canSubmit = feedbackText.trim().length > 0 && !isLoading;
  const charPct   = Math.min(feedbackText.length / MAX_CHARS, 1);
  const nearLimit = feedbackText.length >= MAX_CHARS * 0.85;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: feedbackText }),
      });

      if (response.ok) {
        setFeedbackSubmitted(true);
        setFeedbackText('');
        setTimeout(() => {
          setFeedbackSubmitted(false);
          setView('help');
        }, 2200);
      } else {
        alert('Ndodhi një gabim. Ju lutem provoni më vonë.');
      }
    } catch (err) {
      console.error('Gabim në dërgimin e feedback-ut:', err);
      alert('Ndodhi një gabim. Ju lutem provoni më vonë.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: 'calc(24px + env(safe-area-inset-top, 0px)) 20px calc(80px + max(24px, calc(16px + env(safe-area-inset-bottom, 12px))))', maxWidth: '480px', margin: '0 auto' }}>

      {/* ── Back button ─────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setView('help')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          background: 'none',
          border: 'none',
          padding: '6px 0',
          marginBottom: '28px',
          color: 'rgba(255,255,255,0.4)',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer',
          letterSpacing: '0.01em',
        }}
      >
        <IonIcon icon={chevronBackOutline} style={{ fontSize: 17 }} />
        Kthehu
      </button>

      {/* ── Title ───────────────────────────────────────────────────────── */}
      <h2 style={{
        fontSize: '26px',
        fontWeight: '700',
        color: '#fff',
        letterSpacing: '-0.6px',
        lineHeight: 1.1,
        margin: '0 0 6px',
      }}>
        Feedback
      </h2>
      <p style={{
        fontSize: '13px',
        color: 'rgba(255,255,255,0.35)',
        lineHeight: 1.55,
        margin: '0 0 28px',
      }}>
        Na ndihmo të përmirësojmë aplikacionin duke ndarë mendimet tuaja.
      </p>

      {/* ── Success state ───────────────────────────────────────────────── */}
      {feedbackSubmitted ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '56px 24px',
          borderRadius: '16px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          gap: '12px',
          textAlign: 'center',
        }}>
          <IonIcon icon={checkmarkCircleOutline} style={{ fontSize: 42, color: '#22c55e' }} />
          <p style={{ fontSize: '16px', fontWeight: '600', color: '#fff', margin: 0 }}>
            Feedback-u u dërgua!
          </p>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.5 }}>
            Faleminderit. Do të ktheheni automatikisht.
          </p>
        </div>
      ) : (

        /* ── Form ─────────────────────────────────────────────────────── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Textarea */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{
              fontSize: '13px',
              fontWeight: '600',
              color: 'rgba(255,255,255,0.55)',
              letterSpacing: '0.03em',
              textTransform: 'uppercase',
            }}>
              Mesazhi juaj
            </label>

            <textarea
              value={feedbackText}
              onChange={(e) => {
                if (e.target.value.length <= MAX_CHARS) setFeedbackText(e.target.value);
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Çfarë mund të përmirësohet? A keni hasur ndonjë problem?"
              rows={6}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${focused ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.09)'}`,
                color: '#fff',
                fontSize: '14px',
                fontFamily: 'inherit',
                lineHeight: '1.6',
                resize: 'none',
                outline: 'none',
                transition: 'border-color 0.2s ease',
                boxSizing: 'border-box',
              }}
            />

            {/* Character counter */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: '8px',
            }}>
              {/* Progress bar */}
              <div style={{
                flex: 1,
                height: '2px',
                borderRadius: '2px',
                background: 'rgba(255,255,255,0.08)',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${charPct * 100}%`,
                  borderRadius: '2px',
                  background: nearLimit ? '#ef4444' : 'rgba(255,255,255,0.25)',
                  transition: 'width 0.15s ease, background 0.2s ease',
                }} />
              </div>
              <span style={{
                fontSize: '11px',
                fontWeight: '500',
                color: nearLimit ? '#ef4444' : 'rgba(255,255,255,0.25)',
                minWidth: '54px',
                textAlign: 'right',
                transition: 'color 0.2s ease',
              }}>
                {feedbackText.length} / {MAX_CHARS}
              </span>
            </div>
          </div>

          {/* ── Buttons ── */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                        <button
              type="button"
              onClick={() => setView('help')}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '13px 16px',
                borderRadius: '12px',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.5)',
                fontSize: '14px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'border-color 0.18s ease, color 0.18s ease',
                letterSpacing: '-0.01em',
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.75)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
              }}
            >
              Anulo
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              style={{
                flex: 1,
                padding: '13px 16px',
                borderRadius: '12px',
                background: canSubmit ? '#fff' : 'rgba(255,255,255,0.1)',
                border: '1px solid transparent',
                color: canSubmit ? '#111' : 'rgba(255,255,255,0.25)',
                fontSize: '14px',
                fontWeight: '600',
                cursor: canSubmit ? 'pointer' : 'not-allowed',
                transition: 'background 0.18s ease, color 0.18s ease',
                letterSpacing: '-0.01em',
              }}
              onMouseEnter={(e) => { if (canSubmit) e.currentTarget.style.background = '#e8e8e8'; }}
              onMouseLeave={(e) => { if (canSubmit) e.currentTarget.style.background = '#fff'; }}
            >
              {isLoading ? 'Po dërgohet…' : 'Dërgo'}
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
'use client';
import { useState } from 'react';
import useStore from '../../store/useStore';
import { IonIcon } from '@ionic/react';
import { chevronBackOutline, alertOutline, mailOutline } from 'ionicons/icons';
import { translations } from '../../store/translations';

export default function DeleteAccountView() {
  const { setView, user, addNotification } = useStore((state: any) => state);
  const t = translations['en'];

  const [step, setStep] = useState<'email' | 'sent'>('email');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequestDeletion = async () => {
    setError(null);

    // Validate email format
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Check if email matches the logged-in user's email
    if (email.toLowerCase() !== user?.email?.toLowerCase()) {
      setError('The email address does not match your account email');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/request-deletion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });

      if (res.ok) {
        setStep('sent');
        addNotification('Check your email for confirmation link', 'success');
      } else {
        const data = await res.json().catch(() => null);
        setError(data?.message || 'Failed to request deletion. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.95)', backdropFilter: 'blur(20px)',
      zIndex: 1000, display: 'flex', flexDirection: 'column',
      overflow: 'auto'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '12px',
        borderBottom: '0.5px solid rgba(255,255,255,0.06)'
      }}>
        <button
          type="button"
          onClick={() => setView('edit_profile')}
          style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', cursor: 'pointer', flexShrink: 0
          }}
        >
          <IonIcon icon={chevronBackOutline} style={{ fontSize: 20 }} />
        </button>
        <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#fff' }}>
          Delete Account
        </h2>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column' }}>
        {step === 'email' ? (
          <>
            {/* Warning */}
            <div style={{
              background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '12px', padding: '16px', marginBottom: '24px',
              display: 'flex', gap: '12px'
            }}>
              <IonIcon icon={alertOutline} style={{
                fontSize: 20, color: '#ef4444', flexShrink: 0, marginTop: '2px'
              }} />
              <div>
                <p style={{
                  margin: 0, fontSize: '14px', fontWeight: '600', color: '#ef4444', marginBottom: '4px'
                }}>
                  This action cannot be undone
                </p>
                <p style={{
                  margin: 0, fontSize: '12px', color: 'rgba(239, 68, 68, 0.7)', lineHeight: '1.4'
                }}>
                  Your account and all associated data will be permanently deleted after 30 days. A confirmation email will be sent first.
                </p>
              </div>
            </div>

            {/* Email Input */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block', fontSize: '12px', fontWeight: '600',
                color: 'rgba(255,255,255,0.5)', marginBottom: '8px', textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Confirm your email
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  placeholder="your@email.com"
                  style={{
                    width: '100%', padding: '14px 40px 14px 40px', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff', fontSize: '14px', fontFamily: 'inherit',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                  }}
                />
                <IonIcon icon={mailOutline} style={{
                  position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                  fontSize: 16, color: 'rgba(255,255,255,0.3)'
                }} />
              </div>
              {user?.email && (
                <p style={{
                  fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '6px'
                }}>
                  Your account email: {user.email}
                </p>
              )}
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '10px', padding: '12px', marginBottom: '24px',
                fontSize: '13px', color: '#ef4444'
              }}>
                {error}
              </div>
            )}

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
              <button
                onClick={() => setView('edit_profile')}
                style={{
                  flex: 1, padding: '14px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff', fontWeight: '600', fontSize: '14px',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleRequestDeletion}
                disabled={loading || !email}
                style={{
                  flex: 1, padding: '14px', borderRadius: '12px',
                  background: loading || !email ? 'rgba(239, 68, 68, 0.3)' : '#ef4444',
                  color: '#fff', fontWeight: '600', fontSize: '14px',
                  border: 'none', cursor: loading || !email ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s', opacity: loading || !email ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!loading && email) {
                    e.currentTarget.style.background = '#dc2626';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading && email) {
                    e.currentTarget.style.background = '#ef4444';
                  }
                }}
              >
                {loading ? 'Sending...' : 'Request Deletion'}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Success State */}
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', textAlign: 'center', padding: '40px 20px'
            }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                background: 'rgba(34, 197, 94, 0.1)', border: '2px solid rgba(34, 197, 94, 0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '24px'
              }}>
                <IonIcon icon={mailOutline} style={{
                  fontSize: 40, color: '#22c55e'
                }} />
              </div>

              <h3 style={{
                fontSize: '18px', fontWeight: '700', color: '#fff', margin: '0 0 8px 0'
              }}>
                Check your email
              </h3>
              <p style={{
                fontSize: '14px', color: 'rgba(255,255,255,0.5)', margin: '0 0 24px 0',
                lineHeight: '1.5'
              }}>
                We've sent a confirmation email to <strong style={{ color: '#fff' }}>{user?.email}</strong>. Click the confirmation link to delete your account.
              </p>

              <div style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px', padding: '16px', marginBottom: '24px', width: '100%'
              }}>
                <p style={{
                  fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: '1.6'
                }}>
                  The confirmation link will expire in <strong>24 hours</strong>. After confirmation, your account will be deleted within 30 days.
                </p>
              </div>

              <button
                onClick={() => setView('edit_profile')}
                style={{
                  width: '100%', padding: '14px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff', fontWeight: '600', fontSize: '14px',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                }}
              >
                Go back
              </button>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        input::placeholder {
          color: rgba(255, 255, 255, 0.2);
        }
        input:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
}

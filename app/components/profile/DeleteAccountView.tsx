'use client';
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import useStore from '../../store/useStore';
import { IonIcon } from '@/app/components/common/IonIcon';
import { chevronBackOutline, alertOutline, mailOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { translations } from '../../store/translations';

export default function DeleteAccountView() {
  const searchParams = useSearchParams();
  const { setView, user, addNotification } = useStore((state: any) => state);
  const t = translations['en'];

  const [step, setStep] = useState<'email' | 'verify' | 'confirmed'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    // Check if user came from email confirmation link
    const deleteConfirmed = searchParams?.get('deleteConfirmed');
    const confirmedEmail = searchParams?.get('email');
    
    if (deleteConfirmed === 'true' && confirmedEmail) {
      setStep('confirmed');
      setEmail(decodeURIComponent(confirmedEmail));
      addNotification('Account deletion confirmed! It will be deleted in 30 days.', 'success');
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [searchParams, addNotification]);

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
        // Store email for verification step
        setEmail(email);
        setStep('verify');
        setOtp(['', '', '', '', '', '']);
        addNotification('Confirmation code sent to your email', 'success');
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

  // ─── FIX #1: Handle OTP input changes ──────────────────────────────────────────

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').substring(0, 6);
    const newOtp = [...otp];
    
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    
    const focusIndex = Math.min(pastedData.length, 5);
    otpRefs.current[focusIndex]?.focus();
  };

  // ─── FIX #2: Handle OTP verification ──────────────────────────────────────────

  const handleVerifyCode = async () => {
    setError(null);
    const code = otp.join('');

    if (code.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    // Use stored email or user.email as fallback
    const confirmationEmail = email || user?.email;
    console.log('[DeleteAccountView] Verifying with email:', confirmationEmail, 'code:', code);

    if (!confirmationEmail) {
      setError('Email not found. Please go back and try again.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/confirm-deletion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: confirmationEmail, code }),
      });

      if (res.ok) {
        const data = await res.json();
        setStep('confirmed');
        addNotification('Account deletion confirmed! It will be deleted in 30 days.', 'success');
      } else {
        const data = await res.json().catch(() => null);
        console.log('[DeleteAccountView] Error response:', data);
        setError(data?.message || 'Invalid or expired code. Please try again.');
      }
    } catch (err) {
      console.log('[DeleteAccountView] Catch error:', err);
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
        <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#fff', flex: 1 }}>
          Delete Account
        </h2>
      </div>

      {/* Action Buttons - Fixed at Top */}
      {(step === 'email' || step === 'verify') && (
        <div style={{
          padding: '16px 24px', display: 'flex', gap: '12px',
          borderBottom: '0.5px solid rgba(255,255,255,0.06)',
          background: 'rgba(0, 0, 0, 0.5)'
        }}>
          <button
            onClick={() => setView('edit_profile')}
            style={{
              flex: 1, padding: '12px', borderRadius: '12px',
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
          {step === 'email' && (
            <button
              onClick={handleRequestDeletion}
              disabled={loading || !email}
              style={{
                flex: 1, padding: '12px', borderRadius: '12px',
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
          )}
        </div>
      )}

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


          </>
        ) : step === 'verify' ? (
          <>
            {/* Verification State - Enter OTP code */}
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
                Enter Confirmation Code
              </h3>
              <p style={{
                fontSize: '14px', color: 'rgba(255,255,255,0.5)', margin: '0 0 24px 0',
                lineHeight: '1.5'
              }}>
                We've sent a 6-digit code to <strong style={{ color: '#fff' }}>{user?.email}</strong>
              </p>

              {/* 6 OTP Input Squares */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', gap: '8px',
                maxWidth: '300px', margin: '24px 0', width: '100%'
              }} onPaste={handleOtpPaste}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={el => { otpRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(e.target.value, idx)}
                    onKeyDown={e => handleOtpKeyDown(e, idx)}
                    autoFocus={idx === 0}
                    style={{
                      width: '44px', height: '48px',
                      background: '#121214', border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '12px', color: '#fff', fontSize: '20px',
                      fontWeight: '700', textAlign: 'center', outline: 'none',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                      e.currentTarget.style.background = '#121214';
                    }}
                  />
                ))}
              </div>

              {error && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '10px', padding: '12px', marginBottom: '24px',
                  fontSize: '13px', color: '#ef4444', width: '100%'
                }}>
                  {error}
                </div>
              )}

              <div style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px', padding: '16px', marginBottom: '24px', width: '100%'
              }}>
                <p style={{
                  fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: '1.6'
                }}>
                  The code will expire in <strong>15 minutes</strong>. After confirmation, your account will be deleted within 30 days.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                <button
                  onClick={() => {
                    setStep('email');
                    setOtp(['', '', '', '', '', '']);
                    setError(null);
                  }}
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
                  Back
                </button>
                <button
                  onClick={handleVerifyCode}
                  disabled={loading || otp.join('').length !== 6}
                  style={{
                    flex: 1, padding: '14px', borderRadius: '12px',
                    background: loading || otp.join('').length !== 6 ? 'rgba(239, 68, 68, 0.3)' : '#ef4444',
                    color: '#fff', fontWeight: '600', fontSize: '14px',
                    border: 'none', cursor: loading || otp.join('').length !== 6 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    opacity: loading || otp.join('').length !== 6 ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!loading && otp.join('').length === 6) {
                      e.currentTarget.style.background = '#dc2626';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading && otp.join('').length === 6) {
                      e.currentTarget.style.background = '#ef4444';
                    }
                  }}
                >
                  {loading ? 'Verifying...' : 'Confirm Deletion'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Confirmed State - Account deletion confirmed */}
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
                <IonIcon icon={checkmarkCircleOutline} style={{
                  fontSize: 40, color: '#22c55e'
                }} />
              </div>

              <h3 style={{
                fontSize: '18px', fontWeight: '700', color: '#fff', margin: '0 0 8px 0'
              }}>
                Account Deletion Confirmed
              </h3>
              <p style={{
                fontSize: '14px', color: 'rgba(255,255,255,0.5)', margin: '0 0 24px 0',
                lineHeight: '1.5'
              }}>
                Your account deletion request has been confirmed. Your account will be permanently deleted in <strong style={{ color: '#fff' }}>30 days</strong>.
              </p>

              <div style={{
                background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '12px', padding: '16px', marginBottom: '24px', width: '100%'
              }}>
                <p style={{
                  fontSize: '12px', color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: '1.6'
                }}>
                  <strong style={{ color: '#fff' }}>Note:</strong> You can still log in during this 30-day period. To cancel the deletion, contact our support team.
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

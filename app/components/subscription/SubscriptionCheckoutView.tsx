'use client';
import { useState, useEffect } from 'react';
import { ChevronLeft, CreditCard, ShieldCheck, CheckCircle2, Check, Store, QrCode, User, ArrowRight } from 'lucide-react';
import useStore from '../../store/useStore';
import { translations } from '../../store/translations';

const UNIVERSITIES = [
  "Academy of Albanological Studies",
  "Academy of Security",
  "Agricultural University of Tirana",
  "Albanian University",
  "Aldent University",
  "Bedër University College",
  "Canadian Institute of Technology",
  "Epoka University",
  "Epitech Albania",
  "European University of Tirana",
  "Ivodent Academy",
  "Luarasi University",
  "Marin Barleti University",
  "Marubi Academy of Film and Multimedia",
  "Mediterranean University of Albania",
  "Metropolitan University of Tirana",
  "Our Lady of Good Counsel University",
  "Polis University",
  "Polytechnic University of Tirana",
  "Qiriazi University College",
  "Tirana Business University College",
  "University of Arts, Tirana",
  "University of Medicine, Tirana",
  "University of New York Tirana",
  "University of Sports, Tirana",
  "University of Tirana",
  "Wisdom University"
].sort();

export default function SubscriptionCheckoutView() {
  const setView = useStore((s: any) => s.setView);
  const language = useStore((s: any) => s.language);
  const t = translations[language as keyof typeof translations] || translations.al;
  const pkg = useStore((s: any) => s.checkoutPackage);

  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [university, setUniversity] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'apple_pay' | 'counter'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [idNumber, setIdNumber] = useState('');
  const [isUniPickerOpen, setIsUniPickerOpen] = useState(false);
  const [uniSearch, setUniSearch] = useState('');
  const [step, setStep] = useState<'methods' | 'form'>('methods');

  // Handle click outside uni picker
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const container = document.getElementById('uni-picker-container');
      if (container && !container.contains(e.target as Node)) {
        setIsUniPickerOpen(false);
      }
    };
    if (isUniPickerOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isUniPickerOpen]);

  const TermsCheckbox = () => (
    <div
      onClick={() => setAcceptedTerms(!acceptedTerms)}
      style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginTop: 10, marginBottom: 4 }}
    >
      <div style={{
        width: 20, height: 20, borderRadius: 6, border: `1.5px solid ${acceptedTerms ? '#f59e0b' : 'rgba(255,255,255,0.2)'}`,
        background: acceptedTerms ? '#f59e0b' : 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s ease'
      }}>
        <Check size={14} color="#fff" style={{ opacity: acceptedTerms ? 1 : 0, transform: acceptedTerms ? 'scale(1)' : 'scale(0)', transition: 'all 0.2s cubic-bezier(0.25, 1, 0.5, 1)' }} />
      </div>
      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', userSelect: 'none' }}>
        {t.accept_terms || 'Pranoj'} <a href="#" onClick={(e) => { e.stopPropagation(); /* Open terms modal */ }} style={{ color: '#f59e0b', textDecoration: 'none', fontWeight: 600 }}>{t.terms_link || 'Termat dhe Kushtet'}</a>
      </span>
    </div>
  );

  // If no package is selected, go back to packages view
  if (!pkg) {
    setView('packages');
    return null;
  }

  const handlePay = (e: any) => {
    if (e && e.preventDefault) e.preventDefault();
    setIsProcessing(true);

    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        setView('get_pass'); // Redirect to Get Pass wizard
      }, 2000);
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', color: '#fff', padding: 20, textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, animation: 'scaleIn 0.5s cubic-bezier(0.25, 1, 0.5, 1)' }}>
          <CheckCircle2 size={40} color="#10b981" />
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Pagesë e Suksesshme!</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, maxWidth: 300 }}>
          Abonimi juaj <strong>{pkg.name}</strong> është aktivizuar. Po ju kalojmë tek karta digjitale...
        </p>
        <style>{`
          @keyframes scaleIn {
            from { transform: scale(0); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)', color: '#fff', overflowY: 'auto', paddingBottom: 100 }}>

      {/* Header */}
      <div style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', gap: 16, position: 'sticky', top: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(12px)', zIndex: 10, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <button 
          onClick={() => {
            if (step === 'form') setStep('methods');
            else setView('packages');
          }} 
          style={{ color: '#fff', padding: 8, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: 'none', cursor: 'pointer', display: 'flex' }}
        >
          <ChevronLeft size={20} />
        </button>
        <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>
          {step === 'form' ? (
            paymentMethod === 'card' ? 'Të dhënat e Kartës' : 
            paymentMethod === 'paypal' ? 'PayPal' : 
            paymentMethod === 'apple_pay' ? 'Apple Pay' : 
            'Pagesa në Sportel'
          ) : (t.choose_payment || 'Mënyra e Pagesës')}
        </h1>
      </div>

      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Step Indicator */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 24, padding: '0 4px' }}>
          <div style={{ flex: 1, height: 4, borderRadius: 2, background: '#f59e0b', opacity: 1 }}></div>
          <div style={{ flex: 1, height: 4, borderRadius: 2, background: step === 'form' ? '#f59e0b' : 'rgba(255,255,255,0.1)', transition: 'all 0.3s' }}></div>
        </div>

        {/* Order Summary (ONLY IN STEP 1) */}
        {step === 'methods' && (
          <div style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 24,
            padding: '24px',
            marginBottom: 32,
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            animation: 'fadeIn 0.4s ease'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 700 }}>
                {t.order_summary || 'Përmbledhja e Porosisë'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(16, 185, 129, 0.1)', padding: '4px 10px', borderRadius: 100, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <ShieldCheck size={12} color="#10b981" />
                <span style={{ fontSize: 10, color: '#10b981', fontWeight: 800, textTransform: 'uppercase' }}>Secure</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: pkg.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}>
                  <CreditCard size={22} color="#fff" />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 17, color: '#fff' }}>{pkg.name}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{pkg.duration}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, fontSize: 20, color: '#fff' }}>{pkg.price} {pkg.price !== t.free && 'L'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 20 }}>
              <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Total</span>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 28, fontWeight: 900, color: '#f59e0b', letterSpacing: -0.5 }}>{pkg.price} {pkg.price !== t.free && 'L'}</span>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 500, marginTop: 2 }}>Të gjitha taksat të përfshira</div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Form */}
        {/* Payment Method Selector */}
        {pkg.price !== t.free ? (
          <>
            {step === 'methods' ? (
              <div style={{ animation: 'fadeIn 0.4s ease' }}>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 700, marginBottom: 16, paddingLeft: 4 }}>
                  {t.choose_payment || 'Zgjidhni mënyrën e pagesës'}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
                  {[
                    { id: 'card', name: 'Karta', icon: <CreditCard size={20} /> },
                    { id: 'paypal', name: 'PayPal', icon: <span style={{ fontWeight: 800, fontFamily: 'Arial', fontSize: 18, letterSpacing: -1, color: '#0070ba' }}>P</span> },
                    { id: 'apple_pay', name: 'Apple Pay', icon: <span style={{ fontWeight: 800, fontSize: 20 }}></span> },
                    { id: 'counter', name: 'Sportel / Cash', icon: <Store size={20} /> }
                  ].map(method => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => {
                        setPaymentMethod(method.id as any);
                        setStep('form');
                      }}
                      style={{
                        padding: '16px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                        borderRadius: 20,
                        background: 'rgba(255,255,255,0.03)',
                        border: '1.5px solid rgba(255,255,255,0.05)',
                        color: 'rgba(255,255,255,0.6)',
                        fontSize: 15,
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        textAlign: 'left'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; }}
                    >
                      <div style={{ 
                        width: 44, 
                        height: 44, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        background: 'rgba(255,255,255,0.05)', 
                        borderRadius: 12,
                        color: '#fff'
                      }}>
                        {method.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 16, color: '#fff' }}>{method.name}</div>
                        <div style={{ fontSize: 12, opacity: 0.5, fontWeight: 400 }}>{method.id === 'card' ? 'Visa, Mastercard, Amex' : method.id === 'counter' ? 'Paguaj në pikën më të afërt' : 'Pagesë e shpejtë dhe e sigurt'}</div>
                      </div>
                      <ChevronLeft size={18} style={{ transform: 'rotate(180deg)', opacity: 0.3 }} />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ animation: 'slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                {/* Form Rendering */}
                {paymentMethod === 'card' && (
                  <form onSubmit={handlePay} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 600, paddingLeft: 4 }}>{t.card_holder || 'Mbajtësi i Kartës'}</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="JON DOE"
                          className="checkout-input"
                          style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '16px', color: '#fff', fontSize: 16, outline: 'none', transition: 'all 0.2s ease' }}
                        />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 4px' }}>
                          <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>{t.card_number || 'Numri i Kartës'}</label>
                        </div>
                        <div style={{ position: 'relative' }}>
                          <input
                            type="text"
                            required
                            maxLength={19}
                            value={cardNumber}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
                              setCardNumber(val);
                            }}
                            className="checkout-input"
                            placeholder="0000 0000 0000 0000"
                            style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '16px 120px 16px 20px', color: '#fff', fontSize: 16, outline: 'none', letterSpacing: 1.5, transition: 'all 0.2s ease' }}
                          />
                          <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 4, pointerEvents: 'none' }}>
                            {/* Card Brand Icons inside input */}
                            <div className="card-brand-badge" style={{ width: 32, height: 20, background: '#fff', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                              <span style={{ fontSize: 8, fontWeight: 900, color: '#1a1f71', fontFamily: 'serif', fontStyle: 'italic' }}>VISA</span>
                            </div>
                            <div className="card-brand-badge" style={{ width: 32, height: 20, background: '#111', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)', position: 'relative', overflow: 'hidden' }}>
                               <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#eb001b', position: 'absolute', left: 6, opacity: 0.9 }}></div>
                               <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f79e1b', position: 'absolute', right: 6, opacity: 0.9 }}></div>
                            </div>
                            <div className="card-brand-badge" style={{ width: 32, height: 20, background: '#f0f0f0', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                              <span style={{ fontSize: 7, fontWeight: 900, color: '#0070d1' }}>AMEX</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 16 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 600, paddingLeft: 4 }}>{t.expiry || 'Skadenca'}</label>
                          <input
                            type="text"
                            required
                            maxLength={5}
                            value={expiry}
                            onChange={(e) => {
                              let val = e.target.value.replace(/\D/g, '');
                              if (val.length >= 2) val = val.substring(0, 2) + '/' + val.substring(2, 4);
                              setExpiry(val);
                            }}
                            className="checkout-input"
                            placeholder="MM/YY"
                            style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '16px', color: '#fff', fontSize: 16, outline: 'none', transition: 'all 0.2s ease' }}
                          />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 600, paddingLeft: 4 }}>CVV</label>
                          <input
                            type="password"
                            required
                            maxLength={3}
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                            className="checkout-input"
                            placeholder="***"
                            style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '16px', color: '#fff', fontSize: 16, outline: 'none', letterSpacing: 4, transition: 'all 0.2s ease' }}
                          />
                        </div>
                      </div>

                      <div style={{ marginTop: 8 }}>
                        <TermsCheckbox />
                      </div>

                    <button
                      type="submit"
                      disabled={isProcessing || !acceptedTerms}
                      style={{
                        marginTop: 8,
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        color: '#fff',
                        border: 'none',
                        padding: '18px',
                        borderRadius: 18,
                        fontSize: 16,
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 10,
                        boxShadow: (isProcessing || !acceptedTerms) ? 'none' : '0 12px 32px rgba(245, 158, 11, 0.3)',
                        opacity: (isProcessing || !acceptedTerms) ? 0.5 : 1,
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {isProcessing ? 'Procesim...' : `${t.pay_btn || 'Paguaj'} - ${pkg.price} L`}
                    </button>
                  </form>
                )}

                {paymentMethod === 'paypal' && (
                  <div style={{ animation: 'slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ 
                      background: 'linear-gradient(145deg, rgba(0, 112, 186, 0.05) 0%, rgba(0, 112, 186, 0.02) 100%)', 
                      padding: 32, 
                      borderRadius: 28, 
                      border: '1px solid rgba(0, 112, 186, 0.15)', 
                      textAlign: 'center',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                        <div style={{ 
                          width: 80, height: 80, 
                          background: '#fff', 
                          borderRadius: '50%', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center', 
                          boxShadow: '0 8px 30px rgba(0, 112, 186, 0.2)',
                          border: '4px solid #f2f2f2'
                        }}>
                          <div style={{ display: 'flex', gap: -2 }}>
                            <span style={{ fontWeight: 900, fontSize: 36, color: '#003087', fontFamily: 'Arial', fontStyle: 'italic', marginRight: -6 }}>P</span>
                            <span style={{ fontWeight: 900, fontSize: 36, color: '#0070ba', fontFamily: 'Arial', fontStyle: 'italic' }}>P</span>
                          </div>
                        </div>
                      </div>
                      <h3 style={{ margin: '0 0 12px 0', fontSize: 22, fontWeight: 800, color: '#fff' }}>PayPal Express</h3>
                      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, lineHeight: 1.6, margin: '0 0 32px 0', padding: '0 20px' }}>
                        Paguani në mënyrë të shpejtë dhe të sigurt duke përdorur llogarinë tuaj PayPal.
                      </p>
                      
                      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px 20px', borderRadius: 20, marginBottom: 32, textAlign: 'left', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600 }}>
                          <CheckCircle2 size={16} color="#10b981" />
                          Ridrejtim i sigurt
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600, marginTop: 8 }}>
                          <CheckCircle2 size={16} color="#10b981" />
                          Mbrojtje e blerësit
                        </div>
                      </div>

                      <TermsCheckbox />
                      <button
                        onClick={handlePay}
                        disabled={isProcessing || !acceptedTerms}
                        style={{ 
                          marginTop: 24, 
                          background: '#ffc439', 
                          color: '#111', 
                          border: 'none', 
                          padding: '20px', 
                          borderRadius: 100, 
                          fontSize: 17, 
                          fontWeight: 900, 
                          cursor: 'pointer', 
                          width: '100%', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, 
                          opacity: !acceptedTerms ? 0.5 : 1, 
                          transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
                          boxShadow: !acceptedTerms ? 'none' : '0 10px 30px rgba(255, 196, 57, 0.2)'
                        }}
                        onMouseEnter={(e) => { if (acceptedTerms) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                      >
                        {isProcessing ? 'Procesim...' : 'Paguaj me PayPal'}
                      </button>
                    </div>
                  </div>
                )}

                {paymentMethod === 'apple_pay' && (
                  <div style={{ animation: 'slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ 
                      background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)', 
                      padding: 32, 
                      borderRadius: 28, 
                      border: '1px solid rgba(255, 255, 255, 0.1)', 
                      textAlign: 'center',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                        <div style={{ 
                          width: 80, height: 80, 
                          background: '#000', 
                          borderRadius: '50%', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center', 
                          border: '2px solid rgba(255, 255, 255, 0.2)',
                          boxShadow: '0 0 30px rgba(255,255,255,0.05)'
                        }}>
                          <span style={{ fontSize: 42, color: '#fff' }}></span>
                        </div>
                      </div>
                      <h3 style={{ margin: '0 0 12px 0', fontSize: 22, fontWeight: 800, color: '#fff' }}>Apple Pay</h3>
                      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, lineHeight: 1.6, margin: '0 0 32px 0', padding: '0 20px' }}>
                        Përdorni Touch ID ose Face ID për të kryer pagesën menjëherë në pajisjen tuaj Apple.
                      </p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(255,255,255,0.03)', padding: 14, borderRadius: 16 }}>
                          <ShieldCheck size={20} color="#10b981" />
                          <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>E sigurt dhe private</div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Numri i kartës suaj nuk ruhet</div>
                          </div>
                        </div>
                      </div>

                      <TermsCheckbox />
                      <button
                        onClick={handlePay}
                        disabled={isProcessing || !acceptedTerms}
                        style={{ 
                          marginTop: 24, 
                          background: '#fff', 
                          color: '#000', 
                          border: 'none', 
                          padding: '20px', 
                          borderRadius: 100, 
                          fontSize: 18, 
                          fontWeight: 900, 
                          cursor: 'pointer', 
                          width: '100%', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, 
                          opacity: !acceptedTerms ? 0.5 : 1, 
                          transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)'
                        }}
                        onMouseEnter={(e) => { if (acceptedTerms) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                      >
                        {isProcessing ? 'Procesim...' : <span><span style={{ fontSize: 22 }}></span> Pay</span>}
                      </button>
                    </div>
                  </div>
                )}

                {paymentMethod === 'counter' && (
                  <div style={{ animation: 'slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {!showQr ? (
                      <div style={{ 
                        background: 'linear-gradient(145deg, rgba(245, 158, 11, 0.05) 0%, rgba(245, 158, 11, 0.02) 100%)', 
                        padding: 32, 
                        borderRadius: 28, 
                        border: '1px solid rgba(245, 158, 11, 0.15)',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                          <div style={{ width: 80, height: 80, background: 'rgba(245, 158, 11, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed rgba(245, 158, 11, 0.3)' }}>
                            <User size={36} color="#f59e0b" />
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 32 }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 600, paddingLeft: 4 }}>Emër Mbiemër</label>
                            <input
                              type="text"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder="Emri juaj i plotë"
                              className="checkout-input"
                              style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '16px', color: '#fff', fontSize: 16, outline: 'none', transition: 'all 0.2s' }}
                            />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 600, paddingLeft: 4 }}>Numri ID / Pasaportës</label>
                            <input
                              type="text"
                              value={idNumber}
                              onChange={(e) => setIdNumber(e.target.value.toUpperCase())}
                              placeholder="L30502040A"
                              className="checkout-input"
                              style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '16px', color: '#fff', fontSize: 16, outline: 'none', transition: 'all 0.2s' }}
                            />
                          </div>
                        </div>

                        <TermsCheckbox />

                        <button
                          onClick={() => {
                            if (name && idNumber && acceptedTerms) setShowQr(true);
                            else alert('Ju lutem plotësoni të dhënat dhe pranoni kushtet.');
                          }}
                          style={{ 
                            marginTop: 24, 
                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', 
                            color: '#111', 
                            border: 'none', 
                            padding: '20px', 
                            borderRadius: 100, 
                            fontSize: 16, 
                            fontWeight: 900, 
                            cursor: 'pointer', 
                            width: '100%', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, 
                            transition: 'all 0.3s ease',
                            boxShadow: '0 10px 30px rgba(245, 158, 11, 0.25)'
                          }}
                        >
                          <QrCode size={20} />
                          Gjenero QR Code
                        </button>
                      </div>
                    ) : (
                      <div style={{ 
                        background: '#fff', 
                        padding: '40px 32px', 
                        borderRadius: 32, 
                        textAlign: 'center', 
                        animation: 'scaleIn 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
                        color: '#111'
                      }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 32 }}>
                          <div style={{ fontSize: 14, color: '#f59e0b', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2 }}>Sporteli Urbani Im</div>
                          <div style={{ width: 40, height: 4, background: '#f59e0b', borderRadius: 2 }}></div>
                        </div>

                        <div style={{ 
                          background: '#f8fafc', 
                          padding: 24, 
                          borderRadius: 24, 
                          border: '2px solid #f1f5f9', 
                          marginBottom: 32, 
                          display: 'inline-block',
                          boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.02)'
                        }}>
                          <QrCode size={200} color="#111" strokeWidth={1.5} />
                        </div>

                        <div style={{ textAlign: 'left', background: '#f8fafc', padding: 20, borderRadius: 20, marginBottom: 32, border: '1px solid #f1f5f9' }}>
                          <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginBottom: 12, textTransform: 'uppercase' }}>Detajet e Klientit</div>
                          <div style={{ fontWeight: 800, fontSize: 18, color: '#1e293b' }}>{name}</div>
                          <div style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>ID: <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>{idNumber}</span></div>
                        </div>

                        <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6, margin: '0 0 32px 0' }}>
                          Paraqisni këtë kod në çdo sportel të autorizuar për të përfunduar pagesën në kesh.
                        </p>

                        <button
                          onClick={handlePay}
                          style={{ 
                            background: '#111', 
                            color: '#fff', 
                            border: 'none', 
                            padding: '20px', 
                            borderRadius: 100, 
                            fontSize: 16, 
                            fontWeight: 900, 
                            cursor: 'pointer', 
                            width: '100%', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                            boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                          }}
                        >
                          E kuptova
                        </button>
                        <button
                          onClick={() => setShowQr(false)}
                          style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 13, marginTop: 20, cursor: 'pointer', fontWeight: 700 }}
                        >
                          Ndrysho të dhënat
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          /* Free Package State */
          <div style={{ animation: 'slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)', display: 'flex', flexDirection: 'column', gap: 16, marginTop: 10 }}>
            <div style={{ 
              background: 'linear-gradient(145deg, rgba(16, 185, 129, 0.05) 0%, rgba(16, 185, 129, 0.02) 100%)', 
              padding: 32, 
              borderRadius: 28, 
              border: '1px solid rgba(16, 185, 129, 0.2)',
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
            }}>

              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                <div style={{ width: 80, height: 80, background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(16, 185, 129, 0.3)' }}>
                  <User size={36} color="#10b981" />
                </div>
              </div>

              <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#fff' }}>{t.student_verification || 'Verifikimi i Studentit'}</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginTop: 8 }}>Plotësoni të dhënat e sakta nga karta juaj e studentit.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 32 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 600, paddingLeft: 4 }}>{t.student_id_label || 'Numri i Kartës së Studentit'}</label>
                  <input
                    type="text"
                    required
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                    placeholder="L30502040A"
                    className="checkout-input"
                    style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '16px', color: '#fff', fontSize: 15, outline: 'none', transition: 'all 0.2s' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 600, paddingLeft: 4 }}>Numri Serial i Kartës</label>
                  <input
                    type="text"
                    required
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="A-123456"
                    className="checkout-input"
                    style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '16px', color: '#fff', fontSize: 15, outline: 'none', transition: 'all 0.2s' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, position: 'relative' }} id="uni-picker-container">
                  <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 600, paddingLeft: 4 }}>{t.university_label || 'Universiteti'}</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="Zgjidhni universitetin..."
                      value={university || uniSearch}
                      onChange={(e) => {
                        setUniSearch(e.target.value);
                        setUniversity(e.target.value);
                        setIsUniPickerOpen(true);
                      }}
                      onFocus={() => setIsUniPickerOpen(true)}
                      className="checkout-input"
                      style={{
                        width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 16, padding: '16px', color: '#fff', fontSize: 15, outline: 'none'
                      }}
                    />
                    <ChevronLeft size={18} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%) rotate(-90deg)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
                  </div>

                  {isUniPickerOpen && (uniSearch || university) && (
                    <div style={{
                      position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
                      background: '#1e293b',
                      border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20,
                      boxShadow: '0 20px 60px rgba(0,0,0,0.5)', zIndex: 100,
                      maxHeight: 250, overflowY: 'auto', padding: 8,
                      animation: 'fadeIn 0.2s ease'
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {UNIVERSITIES.filter(u => u.toLowerCase().includes((uniSearch || university).toLowerCase())).map((uni, idx) => (
                          <button
                            key={idx}
                            onClick={(e) => {
                              e.stopPropagation();
                              setUniversity(uni);
                              setUniSearch('');
                              setIsUniPickerOpen(false);
                            }}
                            style={{
                              width: '100%', padding: '14px 16px', textAlign: 'left',
                              background: university === uni ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                              border: 'none', borderRadius: 12, color: '#fff',
                              fontSize: 14, fontWeight: university === uni ? 700 : 500, cursor: 'pointer', transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => { if (university !== uni) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                            onMouseLeave={(e) => { if (university !== uni) e.currentTarget.style.background = 'transparent'; }}
                          >
                            {uni}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <TermsCheckbox />

              <button
                onClick={(e) => {
                  if (!studentId || !university || !serialNumber) return alert('Ju lutem plotësoni të gjitha të dhënat e studentit.');
                  useStore.getState().updateProfile({ idNumber: studentId, university, serialNumber });
                  handlePay(e);
                }}
                disabled={isProcessing || !acceptedTerms}
                style={{ 
                  marginTop: 24, 
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                  color: '#fff', 
                  border: 'none', 
                  padding: '20px', 
                  borderRadius: 100, 
                  fontSize: 16, 
                  fontWeight: 900, 
                  cursor: 'pointer', 
                  width: '100%', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, 
                  boxShadow: (isProcessing || !acceptedTerms) ? 'none' : '0 10px 30px rgba(16, 185, 129, 0.2)', 
                  opacity: (isProcessing || !acceptedTerms) ? 0.5 : 1,
                  transition: 'all 0.3s ease'
                }}
              >
                {isProcessing ? 'Procesim...' : (t.activate_free || 'Aktivizo Falas')}
              </button>
            </div>
          </div>
        )}
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(20px); }
            to { opacity: 1; transform: translateX(0); }
          }
          .checkout-input:focus {
            background: rgba(255,255,255,0.08) !important;
            border-color: #f59e0b !important;
            box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.1);
          }
          .card-brand-badge {
            transition: all 0.3s ease;
          }
          .card-brand-badge:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          }
        `}</style>

      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '20px', color: 'rgba(255,255,255,0.3)', fontSize: 13, marginTop: 'auto' }}>
        <ShieldCheck size={16} /> {t.secure_payment || 'Pagesë 100% e Sigurt'}
      </div>

    </div>
  );
}

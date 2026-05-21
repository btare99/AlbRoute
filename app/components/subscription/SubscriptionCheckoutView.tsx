'use client';
import { useState, useEffect } from 'react';
import { ChevronLeft, CreditCard, ShieldCheck, CheckCircle2, Check, Store, QrCode, User, ArrowRight, Barcode, Camera, X } from 'lucide-react';
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

const getCardType = (num: string) => {
  const clean = num.replace(/\s/g, '');
  if (clean.startsWith('4')) return 'visa';
  if (clean.startsWith('5')) return 'mastercard';
  if (clean.startsWith('3')) return 'amex';
  return 'generic';
};

const CreditCardIcon = () => (
  <div style={{
    width: 44,
    height: 44,
    borderRadius: 12,
    background: 'linear-gradient(135deg, #1e1e24 0%, #2a2b36 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)',
    border: '1px solid rgba(255,255,255,0.1)',
    position: 'relative'
  }}>
    <div style={{
      position: 'absolute',
      left: 6,
      top: 14,
      width: 8,
      height: 6,
      borderRadius: 2,
      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      opacity: 0.8
    }} />
    <div style={{
      position: 'absolute',
      right: 6,
      bottom: 6,
      display: 'flex',
      alignItems: 'center'
    }}>
      <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#eb001b', opacity: 0.95 }} />
      <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f79e1b', opacity: 0.95, marginLeft: -5 }} />
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, width: 22 }}>
      <div style={{ height: 1.5, background: 'rgba(255,255,255,0.2)', width: '100%' }} />
      <div style={{ height: 1.5, background: 'rgba(255,255,255,0.2)', width: '60%' }} />
    </div>
  </div>
);

const PayPalIcon = () => (
  <div style={{
    width: 44,
    height: 44,
    borderRadius: 12,
    background: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    position: 'relative'
  }}>
    <svg viewBox="0 0 24 24" width="24" height="24">
      <path d="M10.8 4.8H5.6c-.3 0-.6.2-.7.5l-2 12.1c0 .2.1.4.3.4h2.7l.6-3.8c0-.3.3-.5.6-.5h2.1c2.8 0 4.9-1.1 5.5-4.2.3-1.3.2-2.3-.5-2.8-.7-.5-1.9-.7-3.4-.7zm.9 3.8c-.2 1.1-.9 1.8-2 1.8H8.3l.5-3h1.4c.7 0 1.2.1 1.4.3.2.2.3.5.1.9z" fill="#003087" />
      <path d="M13 7.8H7.8c-.3 0-.6.2-.7.5l-2 12.1c0 .2.1.4.3.4h2.7l.6-3.8c0-.3.3-.5.6-.5h2.1c2.8 0 4.9-1.1 5.5-4.2.3-1.3.2-2.3-.5-2.8-.7-.5-1.9-.7-3.4-.7zm.9 3.8c-.2 1.1-.9 1.8-2 1.8H10.5l.5-3h1.4c.7 0 1.2.1 1.4.3.2.2.3.5.1.9z" fill="#0070ba" style={{ transform: 'translate(1.5px, 1.5px)' }} />
    </svg>
  </div>
);

const ApplePayIcon = () => (
  <div style={{
    width: 44,
    height: 44,
    borderRadius: 12,
    background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 20%, #a1c4fd 50%, #c2e9fb 70%, #e0c3fc 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 15px rgba(224, 195, 252, 0.4)',
    border: '1px solid rgba(255,255,255,0.4)',
    color: '#000'
  }}>
    <svg viewBox="0 0 170 170" width="22" height="22" fill="currentColor">
      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.04-1.92-14.1-6.15-3.57-2.99-7.37-7.63-11.39-13.91-8.57-13.43-14.37-27.97-17.4-43.61-3.03-15.64-2.28-29.8 2.27-42.49 4.1-11.45 10.74-20.22 19.92-26.31 9.18-6.09 19.14-9.15 29.9-9.17 6.13 0 12.82 1.57 20.08 4.71 7.25 3.14 11.96 4.71 14.13 4.71 2.05 0 6.64-1.57 13.78-4.71 7.14-3.14 13.6-4.59 19.38-4.34 18.08 1.45 32 8.08 41.74 19.87-14.83 8.97-22.1 21.31-21.8 37.03.3 12.06 4.76 21.99 13.4 29.77 8.63 7.78 19 12.06 31.11 12.86-2.65 7.64-6.11 15.11-10.37 22.41zM119.22 30c0-7.84 2.8-15.11 8.4-21.82 7-8.14 15.3-12.28 24.9-12.43.15 8.14-2.6 15.53-8.25 22.17-6.9 8.29-15 12.38-24.3 12.28-.6-.2-.75-.2-.75-.2z"/>
    </svg>
  </div>
);

const CashIcon = () => (
  <div style={{
    width: 44,
    height: 44,
    borderRadius: 12,
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
    border: '1px solid rgba(255,255,255,0.2)',
    color: '#fff'
  }}>
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  </div>
);

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
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [isScanningAnim, setIsScanningAnim] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [idNumber, setIdNumber] = useState('');
  const [isUniPickerOpen, setIsUniPickerOpen] = useState(false);
  const [uniSearch, setUniSearch] = useState('');
  const [step, setStep] = useState<'methods' | 'form'>('methods');
  const [cameraError, setCameraError] = useState(false);
  const [designStyle, setDesignStyle] = useState<'grid' | 'tabs' | 'premium' | 'icons'>('grid');

  // ZXing Live Barcode Scanner Effect
  useEffect(() => {
    let codeReader: any = null;
    if (showBarcodeScanner) {
      setCameraError(false);
      import('@zxing/library').then(({ BrowserMultiFormatReader }) => {
        codeReader = new BrowserMultiFormatReader();
        codeReader.decodeFromVideoDevice(null, 'video-preview', (result: any, err: any) => {
          if (result) {
            const text = result.getText();
            setStudentId(text);
            setSerialNumber('A-' + Math.floor(100000 + Math.random() * 900000));
            setUniversity('University of Tirana');
            setShowBarcodeScanner(false);
          }
          if (err && !(err.name === 'NotFoundException' || err.message?.includes('NotFoundException'))) {
            console.warn('Barcode scan error:', err);
          }
        }).catch((e: any) => {
          console.error('Camera init error:', e);
          setCameraError(true);
        });
      }).catch((err: any) => {
        console.error('Failed to import zxing:', err);
        setCameraError(true);
      });
    }

    return () => {
      if (codeReader && codeReader.reset) {
        codeReader.reset();
      }
    };
  }, [showBarcodeScanner]);

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
    <label htmlFor="terms-checkbox" style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginTop: 10, marginBottom: 12, fontSize: 16, color: 'rgba(255,255,255,0.85)' }}>
      <input
        id="terms-checkbox"
        type="checkbox"
        checked={acceptedTerms}
        onChange={(e) => setAcceptedTerms(e.target.checked)}
        style={{
          width: 22,
          height: 22,
          borderRadius: 6,
          border: `1.5px solid ${acceptedTerms ? '#f59e0b' : 'rgba(255,255,255,0.3)'}`,
          background: acceptedTerms ? '#f59e0b' : 'rgba(255,255,255,0.08)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: 0,
          accentColor: '#f59e0b',
          cursor: 'pointer'
        }}
        aria-checked={acceptedTerms}
      />
      <span style={{ userSelect: 'none', fontSize: 16, color: 'rgba(255,255,255,0.85)' }}>
        {t.accept_terms || 'Pranoj'}
      </span>
      <a href="#" onClick={(e) => { e.stopPropagation(); /* Open terms modal */ }} style={{ color: '#f59e0b', textDecoration: 'none', fontWeight: 600, fontSize: 16, marginLeft: 4 }}>
        {t.terms_link || 'Termat dhe Kushtet'}
      </a>
    </label>
  );

  // If no package is selected, go back to packages view
  useEffect(() => {
    if (!pkg) setView('packages');
  }, [pkg, setView]);

  if (!pkg) return null;

  const handlePay = (e: any) => {
    if (e && e.preventDefault) e.preventDefault();
    setIsProcessing(true);

    // Prepare payment details
    const paymentDetails: any = { method: paymentMethod };
    if (paymentMethod === 'card') {
      paymentDetails.cardHolder = name;
      paymentDetails.cardNumberLast4 = cardNumber.replace(/\s/g, '').slice(-4) || '';
    } else if (paymentMethod === 'counter') {
      paymentDetails.customerName = name;
      paymentDetails.idNumber = idNumber;
    } else if (pkg.price === t.free || pkg.price === 'Falas') {
      paymentDetails.method = 'free_student';
    }
    
    // Update checkoutPackage with payment info
    useStore.getState().setCheckoutPackage({
      ...pkg,
      payment: paymentDetails
    });

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
          aria-label="Kthehu"
          onClick={() => {
            if (step === 'form') setStep('methods');
            else setView('packages');
          }}
          style={{ color: '#fff', padding: 12, minWidth: 44, minHeight: 44, borderRadius: 14, background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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

        {/* Payment Form */}
        {/* Payment Method Selector */}
        {pkg.price !== t.free ? (
          <>
            {step === 'methods' ? (
              <div style={{ animation: 'fadeIn 0.4s ease' }}>
                <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 700, marginBottom: 20, paddingLeft: 4 }}>
                  {t.choose_payment || 'Zgjidhni mënyrën e pagesës'}
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: 16,
                  marginBottom: 28
                }}>
                  {[
                    { id: 'card', name: 'Karta Kredit / Debit', desc: 'Visa, Mastercard, Amex', icon: <CreditCardIcon />, glowColor: 'rgba(245, 158, 11, 0.2)' },
                    { id: 'paypal', name: 'PayPal', desc: 'Pagesë e shpejtë me llogari', icon: <PayPalIcon />, glowColor: 'rgba(0, 112, 186, 0.25)' },
                    { id: 'apple_pay', name: 'Apple Pay', desc: 'Pagesë e shpejtë me pajisje Apple', icon: <ApplePayIcon />, glowColor: 'rgba(224, 195, 252, 0.25)' },
                    { id: 'counter', name: 'Sportel / Cash', desc: 'Gjenero QR dhe paguaj me kesh', icon: <CashIcon />, glowColor: 'rgba(16, 185, 129, 0.25)' }
                  ].map(method => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => {
                        setPaymentMethod(method.id as any);
                        setStep('form');
                      }}
                      style={{
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: 16,
                        borderRadius: 24,
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1.5px solid rgba(255, 255, 255, 0.06)',
                        color: '#fff',
                        cursor: 'pointer',
                        textAlign: 'left',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                        backdropFilter: 'blur(10px)',
                        width: '100%'
                      }}
                      className={`payment-method-card method-${method.id}`}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', zIndex: 1 }}>
                        {method.icon}
                        <div className="arrow-indicator" style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: 'rgba(255,255,255,0.05)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <ChevronLeft size={16} style={{ transform: 'rotate(180deg)', opacity: 0.6 }} />
                        </div>
                      </div>
                      
                      <div style={{ zIndex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 4, letterSpacing: -0.3 }}>{method.name}</div>
                        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>{method.desc}</div>
                      </div>
                      
                      <div className="hover-glow" style={{
                        position: 'absolute',
                        inset: 0,
                        background: `radial-gradient(circle at 50% 120%, ${method.glowColor} 0%, transparent 70%)`,
                        opacity: 0,
                        pointerEvents: 'none',
                        zIndex: 0
                      }} />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ animation: 'slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                {/* Form Rendering */}
                {paymentMethod === 'card' && (
                  <form onSubmit={handlePay} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    {/* Interactive Live Credit Card Preview */}
                    <div style={{
                      width: '100%',
                      maxWidth: 360,
                      margin: '0 auto 12px auto',
                      aspectRatio: '1.586',
                      borderRadius: 24,
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
                      border: '1.5px solid rgba(255,255,255,0.12)',
                      backdropFilter: 'blur(20px)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                      padding: '24px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                      overflow: 'hidden',
                      animation: 'fadeIn 0.5s ease',
                      boxSizing: 'border-box'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '-50%',
                        left: '-50%',
                        width: '200%',
                        height: '200%',
                        background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 60%)',
                        pointerEvents: 'none'
                      }} />
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1 }}>
                        {/* Chip */}
                        <div style={{
                          width: 44,
                          height: 32,
                          borderRadius: 6,
                          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                          position: 'relative',
                          overflow: 'hidden',
                          border: '1px solid rgba(255,255,255,0.15)'
                        }}>
                          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'rgba(0,0,0,0.2)' }} />
                          <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 1, background: 'rgba(0,0,0,0.2)' }} />
                          <div style={{ position: 'absolute', inset: 4, border: '1px solid rgba(0,0,0,0.15)', borderRadius: 2 }} />
                        </div>
                        
                        {/* Logo */}
                        <div style={{ height: 28, display: 'flex', alignItems: 'center' }}>
                          {getCardType(cardNumber) === 'visa' && (
                            <span style={{ fontSize: 22, fontWeight: 900, color: '#fff', fontStyle: 'italic', letterSpacing: -1, fontFamily: 'sans-serif' }}>VISA</span>
                          )}
                          {getCardType(cardNumber) === 'mastercard' && (
                            <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                              <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#eb001b', opacity: 0.95 }} />
                              <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#f79e1b', opacity: 0.95, marginLeft: -8 }} />
                            </div>
                          )}
                          {getCardType(cardNumber) === 'amex' && (
                            <span style={{ fontSize: 16, fontWeight: 800, color: '#93c5fd', letterSpacing: 0.5 }}>AMEX</span>
                          )}
                          {getCardType(cardNumber) === 'generic' && (
                            <CreditCard size={22} color="rgba(255,255,255,0.7)" />
                          )}
                        </div>
                      </div>

                      {/* Number */}
                      <div style={{ zIndex: 1, margin: '12px 0', textAlign: 'center' }}>
                        <div style={{
                          fontSize: '20px',
                          fontWeight: 'bold',
                          letterSpacing: '2.5px',
                          color: '#fff',
                          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                          fontFamily: 'monospace'
                        }}>
                          {cardNumber || '•••• •••• •••• ••••'}
                        </div>
                      </div>

                      {/* Holder/Expiry */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', zIndex: 1 }}>
                        <div>
                          <div style={{ fontSize: 8, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', letterSpacing: 1, marginBottom: 2 }}>{t.card_holder || 'Mbajtësi i Kartës'}</div>
                          <div style={{ fontSize: 14, fontWeight: 'bold', color: '#fff', letterSpacing: 0.5, textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }}>
                            {name || 'JON DOE'}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 8, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', letterSpacing: 1, marginBottom: 2 }}>Skadenca</div>
                          <div style={{ fontSize: 14, fontWeight: 'bold', color: '#fff', letterSpacing: 0.5, fontFamily: 'monospace' }}>
                            {expiry || 'MM/YY'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <label htmlFor="payment-card-holder" style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', fontWeight: 600, paddingLeft: 4 }}>{t.card_holder || 'Mbajtësi i Kartës'}</label>
                      <input
                        id="payment-card-holder"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="JON DOE"
                        className="checkout-input"
                        style={{ width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 16, padding: '16px', color: '#fff', fontSize: 18, outline: 'none', transition: 'all 0.2s ease' }}
                      />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 4px' }}>
                          <label htmlFor="payment-card-number" style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>{t.card_number || 'Numri i Kartës'}</label>
                        </div>
                        <div style={{ position: 'relative' }}>
                          <input
                            id="payment-card-number"
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
                          <label htmlFor="payment-expiry" style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', fontWeight: 600, paddingLeft: 4 }}>{t.expiry || 'Skadenca'}</label>
                          <input
                            id="payment-expiry"
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
                          <label htmlFor="payment-cvv" style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', fontWeight: 600, paddingLeft: 4 }}>CVV</label>
                          <input
                            id="payment-cvv"
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: 600 }}>
                          <CheckCircle2 size={16} color="#10b981" />
                          Ridrejtim i sigurt
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: 600, marginTop: 8 }}>
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
                            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>E sigurt dhe private</div>
                            <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)' }}>Numri i kartës suaj nuk ruhet</div>
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
                            <label htmlFor="counter-name" style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', fontWeight: 600, paddingLeft: 4 }}>Emër Mbiemër</label>
                            <input
                              id="counter-name"
                              type="text"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder="Emri juaj i plotë"
                              className="checkout-input"
                              style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '16px', color: '#fff', fontSize: 16, outline: 'none', transition: 'all 0.2s' }}
                            />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <label htmlFor="counter-id" style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', fontWeight: 600, paddingLeft: 4 }}>Numri ID / Pasaportës</label>
                            <input
                              id="counter-id"
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
                          <div style={{ fontSize: 16, color: '#f59e0b', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2 }}>Sporteli Urbani Im</div>
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
                          <div style={{ fontSize: 16, color: '#475569', fontWeight: 600, marginBottom: 12, textTransform: 'uppercase' }}>Detajet e Klientit</div>
                          <div style={{ fontWeight: 800, fontSize: 18, color: '#1e293b' }}>{name}</div>
<div style={{ fontSize: 15, color: '#475569', marginTop: 4 }}>ID: <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>{idNumber}</span></div>
                        </div>

                        <p style={{ color: '#475569', fontSize: 16, lineHeight: 1.6, margin: '0 0 32px 0' }}>
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
                          style={{ background: 'none', border: 'none', color: '#475569', fontSize: 16, marginTop: 20, cursor: 'pointer', fontWeight: 700 }}
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

              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#fff' }}>{t.student_verification || 'Verifikimi i Studentit'}</h3>
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 16, marginTop: 8 }}>Plotësoni të dhënat e sakta nga karta juaj e studentit.</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
                <button
                  type="button"
                  onClick={() => setShowBarcodeScanner(true)}
                  style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.25))',
                    border: '1.5px solid rgba(16, 185, 129, 0.4)',
                    color: '#10b981',
                    padding: '14px 24px',
                    borderRadius: 20,
                    fontSize: 15,
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    boxShadow: '0 8px 25px rgba(16, 185, 129, 0.2)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(5, 150, 105, 0.35))'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.25))'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <Barcode size={22} color="#10b981" />
                  Skano Barkodin e Kartës (1D Barcode)
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 32 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label htmlFor="student-card-number" style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', fontWeight: 600, paddingLeft: 4 }}>{t.student_id_label || 'Numri i Kartës së Studentit'}</label>
                  <input
                    id="student-card-number"
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
                  <label htmlFor="student-serial-number" style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', fontWeight: 600, paddingLeft: 4 }}>Numri Serial i Kartës</label>
                  <input
                    id="student-serial-number"
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
                  <label htmlFor="student-university" style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', fontWeight: 600, paddingLeft: 4 }}>{t.university_label || 'Universiteti'}</label>
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
                              fontSize: 16, fontWeight: university === uni ? 700 : 500, cursor: 'pointer', transition: 'all 0.2s'
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
          @keyframes scanLaser {
            0% { top: 0%; }
            50% { top: 100%; }
            100% { top: 0%; }
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
          .payment-method-card {
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
          }
          .payment-method-card:hover {
            transform: translateY(-4px) scale(1.02);
            background: rgba(255, 255, 255, 0.06) !important;
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3) !important;
          }
          .payment-method-card:hover .hover-glow {
            opacity: 0.15 !important;
          }
          .payment-method-card:hover .arrow-indicator {
            background: rgba(255, 255, 255, 0.15) !important;
            transform: translateX(4px);
          }
          .payment-method-card.method-card:hover {
            border-color: rgba(245, 158, 11, 0.4) !important;
          }
          .payment-method-card.method-paypal:hover {
            border-color: rgba(0, 112, 186, 0.4) !important;
          }
          .payment-method-card.method-apple_pay:hover {
            border-color: rgba(224, 195, 252, 0.4) !important;
          }
          .payment-method-card.method-counter:hover {
            border-color: rgba(16, 185, 129, 0.4) !important;
          }
        `}</style>

      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '20px', color: 'rgba(255,255,255,0.55)', fontSize: 15, marginTop: 'auto' }}>
        <ShieldCheck size={16} /> {t.secure_payment || 'Pagesë 100% e Sigurt'}
      </div>

      {/* HORIZONTAL BARCODE SCANNER MODAL */}
      {showBarcodeScanner && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20,
          animation: 'fadeIn 0.3s ease'
        }}>
          <div style={{
            background: 'linear-gradient(145deg, #1e293b, #0f172a)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 32, width: '100%', maxWidth: 440, padding: 32,
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative'
          }}>
            <button
              aria-label="Mbyll"
              onClick={() => setShowBarcodeScanner(false)}
              style={{ position: 'absolute', right: 24, top: 24, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>

            <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, border: '2px solid rgba(16, 185, 129, 0.2)' }}>
              <Barcode size={32} color="#10b981" />
            </div>

            <h3 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#fff', textAlign: 'center' }}>Skanuesi i Barkodit të Studentit</h3>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 16, textAlign: 'center', marginTop: 6, marginBottom: 24 }}>
              Vendosni barkodin horizontal (1D Barcode) të kartës suaj të studentit brenda kornizës së gjelbër.
            </p>

            {/* LIVE CAMERA VIEWFINDER (HORIZONTAL 1D BARCODE SPECIFIC) */}
            <div style={{
              width: '100%', height: 240, background: '#000', borderRadius: 24, position: 'relative',
              overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'inset 0 0 30px rgba(0,0,0,0.8)', border: '2px solid rgba(255,255,255,0.1)'
            }}>
              {/* REAL LIVE VIDEO FEED */}
              <video
                id="video-preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
                playsInline
                muted
              ></video>

              {/* Simulated Camera Feed Fallback Background (Visible before camera starts or if blocked) */}
              <div style={{ position: 'absolute', inset: 0, opacity: 0.3, background: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 4px)', pointerEvents: 'none' }}></div>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.55)', fontSize: 15, fontWeight: 600, letterSpacing: 1, pointerEvents: 'none', zIndex: 1 }}>
                {cameraError ? 'Kamera nuk u gjet. Përdorni skanimin e simuluar.' : 'Duke nisur kamerën...'}
              </div>

              {/* Horizontal Viewfinder Target Box */}
              <div style={{
                position: 'absolute', width: 310, height: 140, border: '2px solid #10b981', borderRadius: 20,
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.4), inset 0 0 20px rgba(16, 185, 129, 0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, pointerEvents: 'none'
              }}>
                {/* Corner Accents */}
                <div style={{ position: 'absolute', top: -4, left: -4, width: 20, height: 20, borderLeft: '4px solid #10b981', borderTop: '4px solid #10b981', borderRadius: '4px 0 0 0' }}></div>
                <div style={{ position: 'absolute', top: -4, right: -4, width: 20, height: 20, borderRight: '4px solid #10b981', borderTop: '4px solid #10b981', borderRadius: '0 4px 0 0' }}></div>
                <div style={{ position: 'absolute', bottom: -4, left: -4, width: 20, height: 20, borderLeft: '4px solid #10b981', borderBottom: '4px solid #10b981', borderRadius: '0 0 0 4px' }}></div>
                <div style={{ position: 'absolute', bottom: -4, right: -4, width: 20, height: 20, borderRight: '4px solid #10b981', borderBottom: '4px solid #10b981', borderRadius: '0 0 4px 0' }}></div>

                {/* Laser Line Animation */}
                <div style={{
                  position: 'absolute', width: '100%', height: 2, background: '#ef4444',
                  boxShadow: '0 0 12px 2px #ef4444', animation: 'scanLaser 2s ease-in-out infinite'
                }}></div>
              </div>
            </div>

            <button
              onClick={() => {
                setIsScanningAnim(true);
                setTimeout(() => {
                  setStudentId('L30502040A');
                  setSerialNumber('A-987654');
                  setUniversity('University of Tirana');
                  setIsScanningAnim(false);
                  setShowBarcodeScanner(false);
                }, 1000);
              }}
              style={{
                marginTop: 28, background: 'rgba(255,255,255,0.05)', color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)', padding: '16px 28px', borderRadius: 100, fontSize: 16, fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                justifyContent: 'center', transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            >
              <Camera size={18} />
              {isScanningAnim ? 'Po Skanon...' : 'Kryej Skanimin e Simuluar (Test Fallback)'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

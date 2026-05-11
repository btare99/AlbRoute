'use client';
import { useState, useEffect } from 'react';
import { ChevronLeft, CreditCard, ShieldCheck, CheckCircle2, Check, Store, QrCode, User } from 'lucide-react';
import useStore from '../store/useStore';
import { translations } from '../store/translations';

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
  const [paymentMethod, setPaymentMethod] = useState<'card'|'paypal'|'apple_pay'|'counter'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [idNumber, setIdNumber] = useState('');
  
  const [isUniPickerOpen, setIsUniPickerOpen] = useState(false);
  const [uniSearch, setUniSearch] = useState('');

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
    e.preventDefault();
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
        <button onClick={() => setView('packages')} style={{ color: '#fff', padding: 8, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: 'none', cursor: 'pointer', display: 'flex' }}>
          <ChevronLeft size={20} />
        </button>
        <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>
          {t.checkout_title || 'Arka'}
        </h1>
      </div>

      <div style={{ padding: '20px' }}>
        
        {/* Order Summary */}
        <div style={{ 
          background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)', 
          border: '1px solid rgba(255,255,255,0.08)', 
          borderRadius: 24, 
          padding: '24px', 
          marginBottom: 32,
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
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
                width: 48, height: 48, borderRadius: 16, 
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

        {/* Payment Form */}
        {/* Payment Method Selector */}
        {pkg.price !== t.free ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
              {[
                { id: 'card', name: 'Karta', icon: <CreditCard size={22} /> },
                { id: 'paypal', name: 'PayPal', icon: <span style={{ fontWeight: 800, fontFamily: 'Arial', fontSize: 20, letterSpacing: -1, color: paymentMethod === 'paypal' ? '#fff' : '#0070ba' }}>P</span> },
                { id: 'apple_pay', name: 'Apple Pay', icon: <span style={{ fontWeight: 800, fontSize: 22 }}></span> },
                { id: 'counter', name: 'Sportel', icon: <Store size={22} /> }
              ].map(method => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method.id as any)}
                  style={{
                    padding: '16px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    borderRadius: 20,
                    background: paymentMethod === method.id ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255,255,255,0.03)',
                    border: `2px solid ${paymentMethod === method.id ? '#f59e0b' : 'rgba(255,255,255,0.05)'}`,
                    color: paymentMethod === method.id ? '#f59e0b' : 'rgba(255,255,255,0.7)',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: paymentMethod === method.id ? 'scale(1.02)' : 'scale(1)',
                    boxShadow: paymentMethod === method.id ? '0 8px 20px rgba(245, 158, 11, 0.15)' : 'none'
                  }}
                >
                  <div style={{ padding: 10, background: paymentMethod === method.id ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.03)', borderRadius: 14 }}>
                    {method.icon}
                  </div>
                  {method.name}
                </button>
              ))}
            </div>

            {/* Payment Forms */}
            {paymentMethod === 'card' && (
              <form onSubmit={handlePay} style={{ display: 'flex', flexDirection: 'column', gap: 18, animation: 'fadeIn 0.5s ease' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 600, paddingLeft: 4 }}>{t.card_holder || 'Mbajtësi i Kartës'}</label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="JON DOE"
                    style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '16px', color: '#fff', fontSize: 16, outline: 'none', transition: 'all 0.2s' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 600, paddingLeft: 4 }}>{t.card_number || 'Numri i Kartës'}</label>
                  <div style={{ position: 'relative' }}>
                    <CreditCard size={20} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                    <input 
                      type="text" 
                      required
                      maxLength={19}
                      value={cardNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
                        setCardNumber(val);
                      }}
                      placeholder="0000 0000 0000 0000"
                      style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '16px 16px 16px 48px', color: '#fff', fontSize: 16, outline: 'none', letterSpacing: 1.5, transition: 'all 0.2s' }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                    />
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
                        if (val.length >= 2) val = val.substring(0,2) + '/' + val.substring(2,4);
                        setExpiry(val);
                      }}
                      placeholder="MM/YY"
                      style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '16px', color: '#fff', fontSize: 16, outline: 'none', transition: 'all 0.2s' }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
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
                      placeholder="***"
                      style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '16px', color: '#fff', fontSize: 16, outline: 'none', letterSpacing: 4, transition: 'all 0.2s' }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
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
              <div style={{ animation: 'fadeIn 0.5s ease', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: 24, borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                    <div style={{ width: 64, height: 64, background: '#0070ba', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(0, 112, 186, 0.3)' }}>
                      <span style={{ fontWeight: 900, fontSize: 32, color: '#fff', fontFamily: 'Arial' }}>P</span>
                    </div>
                  </div>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: 18, fontWeight: 700 }}>PayPal Express</h3>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.6, margin: '0 0 24px 0' }}>
                    Ju do të ridrejtoheni në faqen e sigurt të PayPal për të përfunduar pagesën.
                  </p>
                  <TermsCheckbox />
                  <button 
                    onClick={handlePay}
                    disabled={isProcessing || !acceptedTerms}
                    style={{ marginTop: 20, background: '#ffc439', color: '#111', border: 'none', padding: '16px', borderRadius: 100, fontSize: 16, fontWeight: 800, cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: !acceptedTerms ? 0.5 : 1, transition: 'all 0.2s' }}
                  >
                    {isProcessing ? 'Procesim...' : 'Paguaj me PayPal'}
                  </button>
                </div>
              </div>
            )}

            {paymentMethod === 'apple_pay' && (
              <div style={{ animation: 'fadeIn 0.5s ease', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: 24, borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                    <div style={{ width: 64, height: 64, background: '#000', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>
                      <span style={{ fontSize: 32 }}></span>
                    </div>
                  </div>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: 18, fontWeight: 700 }}>Apple Pay</h3>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.6, margin: '0 0 24px 0' }}>
                    Përdorni Touch ID ose Face ID në pajisjen tuaj për të konfirmuar transaksionin menjëherë.
                  </p>
                  <TermsCheckbox />
                  <button 
                    onClick={handlePay}
                    disabled={isProcessing || !acceptedTerms}
                    style={{ marginTop: 20, background: '#000', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '16px', borderRadius: 100, fontSize: 18, fontWeight: 700, cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: !acceptedTerms ? 0.5 : 1, transition: 'all 0.2s' }}
                  >
                    {isProcessing ? 'Procesim...' : <span><span style={{ fontSize: 20 }}></span> Pay</span>}
                  </button>
                </div>
              </div>
            )}

            {paymentMethod === 'counter' && (
              <div style={{ animation: 'fadeIn 0.5s ease', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {!showQr ? (
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: 24, borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                      <div style={{ width: 64, height: 64, background: 'rgba(245, 158, 11, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed rgba(245, 158, 11, 0.3)' }}>
                        <User size={32} color="#f59e0b" />
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 600, paddingLeft: 4 }}>Emër Mbiemër</label>
                        <input 
                          type="text" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Emri juaj i plotë"
                          style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '16px', color: '#fff', fontSize: 16, outline: 'none' }}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 600, paddingLeft: 4 }}>Numri ID / Pasaportës</label>
                        <input 
                          type="text" 
                          value={idNumber}
                          onChange={(e) => setIdNumber(e.target.value.toUpperCase())}
                          placeholder="L30502040A"
                          style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '16px', color: '#fff', fontSize: 16, outline: 'none' }}
                        />
                      </div>
                    </div>

                    <TermsCheckbox />
                    
                    <button 
                      onClick={() => {
                        if (name && idNumber && acceptedTerms) setShowQr(true);
                        else alert('Ju lutem plotësoni të dhënat dhe pranoni kushtet.');
                      }}
                      style={{ marginTop: 20, background: '#f59e0b', color: '#111', border: 'none', padding: '16px', borderRadius: 100, fontSize: 16, fontWeight: 800, cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}
                    >
                      <QrCode size={20} />
                      Gjenero QR Code
                    </button>
                  </div>
                ) : (
                  <div style={{ background: '#fff', padding: 30, borderRadius: 24, textAlign: 'center', animation: 'scaleIn 0.5s ease' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                      <div style={{ fontSize: 14, color: '#111', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Kodi i Pagesës</div>
                      <div style={{ fontSize: 12, color: '#666' }}>ID: {idNumber}</div>
                    </div>
                    
                    <div style={{ background: '#f8f9fa', padding: 20, borderRadius: 20, border: '1px solid #eee', marginBottom: 24, display: 'inline-block' }}>
                      <QrCode size={180} color="#111" strokeWidth={1.5} />
                    </div>

                    <p style={{ color: '#666', fontSize: 14, lineHeight: 1.5, margin: '0 0 24px 0' }}>
                      Tregojani këtë kod sportelistit për ta skanuar dhe kryer pagesën.
                    </p>

                    <button 
                      onClick={handlePay}
                      style={{ background: '#10b981', color: '#fff', border: 'none', padding: '16px', borderRadius: 100, fontSize: 16, fontWeight: 800, cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                    >
                      Konfirmo Skanimin (Simulim)
                    </button>
                    <button 
                      onClick={() => setShowQr(false)}
                      style={{ background: 'none', border: 'none', color: '#999', fontSize: 13, marginTop: 16, cursor: 'pointer', fontWeight: 600 }}
                    >
                      Ndrysho të dhënat
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          /* Free Package State */
          <div style={{ animation: 'fadeIn 0.4s ease', display: 'flex', flexDirection: 'column', gap: 16, marginTop: 10 }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: 20, borderRadius: 16, border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, color: '#10b981' }}>
                <ShieldCheck size={20} />
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{t.student_verification || 'Verifikimi i Studentit'}</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{t.student_id_label || 'Numri i Kartës së Studentit'}</label>
                  <input 
                    type="text" 
                    required
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                    placeholder="L30502040A"
                    style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 12, padding: '14px 16px', color: '#fff', fontSize: 15, outline: 'none', transition: 'border-color 0.2s' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>Numri Serial i Kartës</label>
                  <input 
                    type="text" 
                    required
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="P.sh. A-123456"
                    style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 12, padding: '14px 16px', color: '#fff', fontSize: 15, outline: 'none', transition: 'border-color 0.2s' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, position: 'relative' }} id="uni-picker-container">
                  <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{t.university_label || 'Universiteti'}</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="text"
                      placeholder="Kërko universitetin..."
                      value={university || uniSearch}
                      onChange={(e) => {
                        setUniSearch(e.target.value);
                        setUniversity(e.target.value);
                        setIsUniPickerOpen(true);
                      }}
                      onFocus={() => setIsUniPickerOpen(true)}
                      style={{ 
                        width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(16,185,129,0.3)', 
                        borderRadius: 12, padding: '14px 16px', color: '#fff', fontSize: 15, outline: 'none'
                      }}
                    />
                    <ChevronLeft size={18} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%) rotate(-90deg)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
                  </div>

                  {isUniPickerOpen && (uniSearch || university) && (
                    <div style={{ 
                      position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, 
                      background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(30px)', 
                      border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, 
                      boxShadow: '0 20px 60px rgba(0,0,0,0.6)', zIndex: 100, 
                      maxHeight: 250, overflowY: 'auto', padding: 6,
                      animation: 'fadeIn 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                              width: '100%', padding: '12px 14px', textAlign: 'left', 
                              background: university === uni ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                              border: 'none', borderRadius: 10, color: '#fff', 
                              fontSize: 14, fontWeight: university === uni ? 700 : 500, cursor: 'pointer', transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => { if (university !== uni) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                            onMouseLeave={(e) => { if (university !== uni) e.currentTarget.style.background = 'transparent'; }}
                          >
                            {uni}
                          </button>
                        ))}
                        {UNIVERSITIES.filter(u => u.toLowerCase().includes((uniSearch || university).toLowerCase())).length === 0 && (
                          <div style={{ padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
                            Nuk u gjet asnjë rezultat
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <TermsCheckbox />

              <button 
                onClick={(e) => {
                  if(!studentId || !university || !serialNumber) return alert('Ju lutem plotësoni të gjitha të dhënat e studentit.');
                  useStore.getState().updateProfile({ idNumber: studentId, university, serialNumber });
                  handlePay(e);
                }}
                disabled={isProcessing || !acceptedTerms}
                style={{ marginTop: 16, background: '#10b981', color: '#fff', border: 'none', padding: '16px', borderRadius: 16, fontSize: 16, fontWeight: 700, cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: (isProcessing || !acceptedTerms) ? 'none' : '0 8px 24px rgba(16, 185, 129, 0.25)', opacity: (isProcessing || !acceptedTerms) ? 0.5 : 1 }}
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
        `}</style>

      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '20px', color: 'rgba(255,255,255,0.3)', fontSize: 13, marginTop: 'auto' }}>
        <ShieldCheck size={16} /> {t.secure_payment || 'Pagesë 100% e Sigurt'}
      </div>

    </div>
  );
}

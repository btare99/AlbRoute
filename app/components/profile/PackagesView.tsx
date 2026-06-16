'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IonIcon } from '@/app/components/common/IonIcon';
import { 
  arrowBackOutline, 
  ticketOutline, 
  checkmarkCircleOutline, 
  cardOutline, 
  lockClosedOutline, 
  schoolOutline, 
  calendarOutline, 
  shieldCheckmarkOutline 
} from 'ionicons/icons';
import useStore from '../../store/useStore';
import { translations } from '../../store/translations';

export default function PackagesView() {
  const language = useStore((state: any) => state.language);
  const setView = useStore((state: any) => state.setView);
  const t = translations[language] || translations.al;

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [step, setStep] = useState<'plans' | 'checkout' | 'success'>('plans');

  // Checkout form states
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [studentId, setStudentId] = useState('');
  const [university, setUniversity] = useState('');
  const [isPaying, setIsPaying] = useState(false);

  const PLANS = [
    {
      id: 'general',
      title: t.general_pass || 'Abone e Përgjithshme',
      subtitle: t.thirty_days || '30 Ditë',
      price: '1600 ALL',
      image: '/abone-gjenerale.png',
      color: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      badge: t.best_seller || 'MË E SHITURA',
      features: [
        t.unlimited_rides || 'Udhëtime të pakufizuara',
        t.valid_all_lines || 'E vlefshme në çdo linjë brenda Tiranës',
        t.digital_format || 'Format digjital në aplikacion',
      ]
    },
    {
      id: 'student',
      title: t.student_pass || 'Abone Studenti',
      subtitle: t.thirty_days || '30 Ditë',
      price: '600 ALL',
      image: '/abone-studenti.png',
      color: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
      badge: t.student_discount || 'Zbritje Studenti',
      features: [
        t.unlimited_rides || 'Udhëtime të pakufizuara',
        t.student_card_required || 'Kërkohet karta e studentit',
        t.valid_every_line || 'E vlefshme në çdo linjë',
      ]
    },
    {
      id: 'line',
      title: t.single_line_pass || 'Abone Linje',
      subtitle: t.thirty_days || '30 Ditë',
      price: '800 ALL',
      image: '/abone-linje.png',
      color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      features: [
        t.single_line_choice || 'Zgjedhje e vetëm 1 linje',
        t.unlimited_single_line || 'Udhëtime të pakufizuara në atë linjë',
        t.ideal_fixed_route || 'Ideale për rrugë ditore fiks',
      ]
    },
    {
      id: 'tourist',
      title: t.tourist_pass || 'Abone Turistike',
      subtitle: t.seven_days || '7 Ditë',
      price: '1000 ALL',
      image: '/abone-turistike.png',
      color: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
      features: [
        t.tourist_unlimited || 'Udhëtime të pakufizuara për 1 javë',
        t.digital_format || 'Format digjital në aplikacion',
        t.one_month_validity || 'Vlefshmëri 1 javore',
      ]
    }
  ];

  const activePlan = PLANS.find(p => p.id === selectedPlan);

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPaying(true);
    setTimeout(() => {
      setIsPaying(false);
      setStep('success');
    }, 2000);
  };

  return (
    <div style={{ 
      padding: 'calc(24px + env(safe-area-inset-top, 0px)) 20px calc(80px + env(safe-area-inset-bottom, 0px))', 
      maxWidth: '520px', 
      margin: '0 auto',
      color: '#fff'
    }}>
      
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px', gap: '16px' }}>
        {step !== 'plans' && (
          <button 
            onClick={() => setStep(step === 'success' ? 'plans' : 'plans')}
            style={{
              background: 'rgba(255,255,255,0.06)', border: 'none', width: '40px', height: '40px',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#fff'
            }}
          >
            <IonIcon icon={arrowBackOutline} style={{ fontSize: 18 }} />
          </button>
        )}
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', margin: 0, letterSpacing: '-0.02em' }}>
            {step === 'plans' ? (t.choose_plan || 'Zgjidh Planin Tënd') : 
             step === 'checkout' ? (t.checkout_title || 'Arka') : 
             'Blerja u Krye'}
          </h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: '4px 0 0 0' }}>
            {step === 'plans' ? (t.plan_subtitle || 'Udhëto lirshëm në të gjithë Tiranën me abone digjitale.') :
             step === 'checkout' ? 'Konfirmo dhe kryej pagesën tuaj të sigurt.' :
             'Abonimi juaj digjital është aktiv tani!'}
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        
        {/* STEP 1: PLANS LIST */}
        {step === 'plans' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}
          >
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: selectedPlan === plan.id ? '2px solid #f59e0b' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '24px',
                  padding: '20px',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                  boxShadow: selectedPlan === plan.id ? '0 8px 30px rgba(245, 158, 11, 0.15)' : 'none'
                }}
              >
                {plan.badge && (
                  <span style={{
                    position: 'absolute', top: '12px', right: '12px',
                    background: plan.id === 'student' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                    color: plan.id === 'student' ? '#10b981' : '#f59e0b',
                    fontSize: '10px', fontWeight: '800', padding: '4px 10px',
                    borderRadius: '20px', letterSpacing: '0.05em'
                  }}>
                    {plan.badge}
                  </span>
                )}

                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '14px',
                    background: plan.color, display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <IonIcon icon={ticketOutline} style={{ fontSize: 24, color: '#fff' }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '17px', fontWeight: '700', margin: 0 }}>{plan.title}</h3>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '3px' }}>
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{plan.subtitle}</span>
                      <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
                      <span style={{ fontSize: '13px', fontWeight: '800', color: '#f59e0b' }}>{plan.price}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {plan.features.map((feat, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '12.5px', color: 'rgba(255,255,255,0.7)' }}>
                      <IonIcon icon={checkmarkCircleOutline} style={{ fontSize: 15, color: '#f59e0b' }} />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {selectedPlan && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  width: '100%', padding: '15px', borderRadius: '16px',
                  background: '#f59e0b', color: '#000', border: 'none',
                  fontWeight: '800', fontSize: '14px', cursor: 'pointer',
                  marginTop: '10px', boxShadow: '0 8px 25px rgba(245, 158, 11, 0.3)'
                }}
                onClick={() => setStep('checkout')}
              >
                {t.continue_btn || 'VAZHDO'}
              </motion.button>
            )}
          </motion.div>
        )}

        {/* STEP 2: CHECKOUT */}
        {step === 'checkout' && activePlan && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
          >
            {/* Plan Summary Card */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '20px', padding: '16px', marginBottom: '20px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {t.order_summary || 'Përmbledhja'}
                </span>
                <h4 style={{ fontSize: '16px', fontWeight: '700', margin: '2px 0 0 0' }}>{activePlan.title}</h4>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '18px', fontWeight: '800', color: '#f59e0b' }}>{activePlan.price}</span>
              </div>
            </div>

            <form onSubmit={handlePay} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Conditional Student Verification */}
              {activePlan.id === 'student' && (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.05)',
                  border: '1px solid rgba(16, 185, 129, 0.15)',
                  borderRadius: '20px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px'
                }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#10b981' }}>
                    <IonIcon icon={schoolOutline} style={{ fontSize: 18 }} />
                    <span style={{ fontSize: '14px', fontWeight: '700' }}>
                      {t.student_verification || 'Verifikimi i Studentit'}
                    </span>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                      {t.student_id_label || 'ID e Studentit'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="A12345678"
                      value={studentId}
                      onChange={e => setStudentId(e.target.value)}
                      style={{
                        width: '100%', padding: '12px', borderRadius: '12px',
                        background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)',
                        color: '#fff', fontSize: '14px', marginTop: '6px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                      {t.university_label || 'Universiteti'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Universiteti i Tiranës"
                      value={university}
                      onChange={e => setUniversity(e.target.value)}
                      style={{
                        width: '100%', padding: '12px', borderRadius: '12px',
                        background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)',
                        color: '#fff', fontSize: '14px', marginTop: '6px'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Payment Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
                  <IonIcon icon={cardOutline} style={{ fontSize: 16 }} />
                  <span>{t.choose_payment || 'Mënyra e Pagesës'}</span>
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                    {t.card_holder || 'Emri mbi Kartë'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Filan Fisteku"
                    value={cardHolder}
                    onChange={e => setCardHolder(e.target.value)}
                    style={{
                      width: '100%', padding: '12px', borderRadius: '12px',
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                      color: '#fff', fontSize: '14px', marginTop: '6px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                    {t.card_number || 'Numri i Kartës'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="4000 1234 5678 9010"
                    maxLength={19}
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value)}
                    style={{
                      width: '100%', padding: '12px', borderRadius: '12px',
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                      color: '#fff', fontSize: '14px', marginTop: '6px'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                      {t.expiry || 'Valide deri'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="MM/YY"
                      maxLength={5}
                      value={expiry}
                      onChange={e => setExpiry(e.target.value)}
                      style={{
                        width: '100%', padding: '12px', borderRadius: '12px',
                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                        color: '#fff', fontSize: '14px', marginTop: '6px'
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>CVV</label>
                    <input
                      type="password"
                      required
                      placeholder="***"
                      maxLength={3}
                      value={cvv}
                      onChange={e => setCvv(e.target.value)}
                      style={{
                        width: '100%', padding: '12px', borderRadius: '12px',
                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                        color: '#fff', fontSize: '14px', marginTop: '6px'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Secure Payment details */}
              <div style={{ 
                display: 'flex', gap: '6px', alignItems: 'center', 
                fontSize: '11px', color: 'rgba(255,255,255,0.4)', justifyContent: 'center', marginTop: '8px'
              }}>
                <IonIcon icon={lockClosedOutline} />
                <span>{t.secure_payment || 'Pagesë e Kriptuar SSL 256-bit'}</span>
              </div>

              <button
                type="submit"
                disabled={isPaying}
                style={{
                  width: '100%', padding: '15px', borderRadius: '16px',
                  background: '#f59e0b', color: '#000', border: 'none',
                  fontWeight: '800', fontSize: '14px', cursor: 'pointer',
                  marginTop: '10px', boxShadow: '0 8px 25px rgba(245, 158, 11, 0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}
              >
                {isPaying ? (
                  <div style={{ width: '16px', height: '16px', border: '2px solid rgba(0,0,0,0.1)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                ) : (
                  <>
                    <IonIcon icon={shieldCheckmarkOutline} style={{ fontSize: 16 }} />
                    {t.pay_btn || 'Paguaj'}
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}

        {/* STEP 3: SUCCESS */}
        {step === 'success' && activePlan && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '28px', padding: '32px 24px', textAlign: 'center',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px'
            }}
          >
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981'
            }}>
              <IonIcon icon={checkmarkCircleOutline} style={{ fontSize: 36 }} />
            </div>

            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>Pagesa u Krye me Sukses!</h2>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: '6px 0 0 0' }}>
                Abonimi juaj është regjistruar në sistem.
              </p>
            </div>

            {/* Generated Mock Digital Card */}
            <div style={{
              width: '100%', height: '160px', borderRadius: '20px',
              background: activePlan.color, padding: '20px',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              textAlign: 'left', position: 'relative', overflow: 'hidden',
              boxShadow: '0 12px 30px rgba(0,0,0,0.3)'
            }}>
              {/* Card background glowing circles */}
              <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
              <div style={{ position: 'absolute', bottom: '-20px', left: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>AlbRoute Digital Pass</span>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '2px 0 0 0' }}>{activePlan.title}</h3>
                </div>
                <div style={{ fontSize: '22px' }}>
                  <IonIcon icon={ticketOutline} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Mbajtësi</span>
                  <div style={{ fontSize: '13px', fontWeight: '700' }}>{cardHolder || 'Udhëtar i AlbRoute'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Skadon më</span>
                  <div style={{ fontSize: '13px', fontWeight: '700' }}>
                    {(() => {
                      const d = new Date();
                      d.setDate(d.getDate() + (activePlan.id === 'tourist' ? 7 : 30));
                      return d.toLocaleDateString('sq-AL', { day: '2-digit', month: '2-digit', year: 'numeric' });
                    })()}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setView('map')}
              style={{
                width: '100%', padding: '14px', borderRadius: '14px',
                background: 'rgba(255,255,255,0.06)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)',
                fontWeight: '700', fontSize: '13px', cursor: 'pointer', marginTop: '10px'
              }}
            >
              Kthehu tek Harta
            </button>
          </motion.div>
        )}

      </AnimatePresence>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

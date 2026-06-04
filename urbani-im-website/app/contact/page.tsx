'use client';

import { useState } from 'react';
import { 
  Mail, Clock, HelpCircle, CheckCircle2, 
  Send, MessageSquare, MapPin, Shield 
} from 'lucide-react';

export default function ContactPage() {
  const [contactText, setContactText] = useState('');
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSent, setContactSent] = useState(false);

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactText.trim() || contactLoading) return;
    setContactLoading(true);
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: contactText }),
      });
      setContactSent(true);
      setContactText('');
      setTimeout(() => setContactSent(false), 5000);
    } catch (e) {
      console.error('Failed to submit contact message', e);
    } finally {
      setContactLoading(false);
    }
  };

  const contactCards = [
    { icon: <Mail size={20} />, label: 'Email mbështetës', value: 'support@urbani-im.al', desc: 'Na shkruani në çdo kohë' },
    { icon: <Clock size={20} />, label: 'Orari i shërbimit', value: 'E Hënë – E Premte, 09:00–17:00', desc: 'Ekipi ynë është i gatshëm t\'ju ndihmojë' },
    { icon: <HelpCircle size={20} />, label: 'Koha e përgjigjes', value: 'Brenda 24 orëve', desc: 'Rishikim i shpejtë i biletave/sugjerimeve' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 animate-fade-up">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200/60 rounded-full px-4 py-1.5 mb-4">
          <MessageSquare size={14} className="text-orange-600" />
          <span className="text-xs font-semibold text-orange-800">Komunikim i Hapur</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
          Na Kontaktoni
        </h1>
        <p className="text-sm md:text-base text-slate-500 mt-2 max-w-xl mx-auto">
          Keni sugjerime, pyetje apo problematika me transportin publik? Na shkruani dhe kontribuoni në përmirësimin e shërbimit.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Info & Map */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900">
            Detajet e Suportit
          </h2>
          <p className="text-xs md:text-sm text-slate-500 leading-relaxed -mt-3">
            Ekipi ynë mbështetës shqyrton çdo mesazh dhe raportim linje për të siguruar saktësinë e të dhënave në kohë reale.
          </p>

          <div className="flex flex-col gap-4">
            {contactCards.map((card, idx) => (
              <div 
                key={idx} 
                className="bg-white p-5 rounded-2xl border border-slate-200/50 shadow-sm flex items-start gap-4"
              >
                <span className="flex p-3 rounded-xl bg-orange-50 text-orange-600 flex-shrink-0">
                  {card.icon}
                </span>
                <div>
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                    {card.label}
                  </p>
                  <p className="text-sm font-bold text-slate-800 mt-1">
                    {card.value}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {card.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Stylized CSS Map container */}
          <div className="bg-slate-100 rounded-2xl border border-slate-200/60 p-4 h-[180px] relative overflow-hidden flex flex-col justify-end">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(200,200,200,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(200,200,200,0.15)_1px,transparent_1px)] bg-[size:15px_15px]" />
            {/* Map lines */}
            <div className="absolute top-[80px] left-0 right-0 h-4 bg-slate-200/80 -rotate-12" />
            <div className="absolute top-0 bottom-0 left-[120px] w-4 bg-slate-200/80 rotate-12" />
            
            {/* GPS Pulse pin */}
            <div className="absolute top-[70px] left-[110px] z-10">
              <span className="live-dot-container">
                <span className="live-dot" />
                <span className="live-ring" />
              </span>
            </div>
            
            <div className="relative bg-white/95 backdrop-blur-sm p-3 rounded-xl border border-slate-200/60 shadow-sm flex items-center gap-2">
              <MapPin size={16} className="text-orange-600" />
              <div>
                <div className="text-[10px] font-bold text-slate-800">Zyra Urbani IM</div>
                <div className="text-[8px] text-slate-400">Sheshi Skënderbej, Tiranë, Shqipëri</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Contact/Feedback Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/60 p-8 shadow-sm">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-6">
            Dërgo një Mesazh
          </h2>

          {contactSent ? (
            <div className="flex flex-col items-center gap-4 py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 shadow-inner">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Sugjerimi juaj u dërgua!</h3>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                Faleminderit që jeni pjesë e Urbani IM. Mesazhi juaj u regjistrua me sukses dhe ekipi ynë do t\'ju përgjigjet brenda 24 orëve.
              </p>
            </div>
          ) : (
            <form onSubmit={handleContact} className="flex flex-col gap-5">
              <div>
                <label htmlFor="textarea-message" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Mesazhi ose Pyetja juaj
                </label>
                <textarea
                  id="textarea-message"
                  value={contactText}
                  onChange={(e) => setContactText(e.target.value)}
                  placeholder="Shkruani sugjerimin, pyetjen ose problematikën tuaj këtu me të gjitha detajet e nevojshme..."
                  rows={6}
                  disabled={contactLoading}
                  className="input-field min-h-[140px] resize-none"
                  required
                />
              </div>

              <div className="flex items-center gap-2 text-[10px] text-slate-400 bg-slate-50 border border-slate-100 p-3.5 rounded-xl leading-relaxed">
                <Shield size={16} className="text-orange-600 flex-shrink-0" />
                <span>
                  Duke klikuar dërgo, ju pranoni përpunimin e të dhënave tuaja të komunikimit sipas Rregullores së Politikës së Privatësisë.
                </span>
              </div>

              <button
                type="submit"
                disabled={!contactText.trim() || contactLoading}
                className="btn-base btn-primary w-full py-3.5 flex items-center justify-center gap-2"
              >
                {contactLoading ? (
                  <span>Po dërgohet...</span>
                ) : (
                  <>
                    <Send size={16} /> <span>Dërgo Mesazh</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

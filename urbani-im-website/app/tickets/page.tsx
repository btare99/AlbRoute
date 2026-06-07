'use client';

import { useState } from 'react';
import Link from 'next/link';
import { IonIcon } from '@/app/components/common/IonIcon';
import { 
  qrCodeOutline, cardOutline, shieldCheckmarkOutline, checkmarkCircleOutline, 
  chevronDownOutline, phonePortraitOutline, busOutline, pricetagOutline 
} from 'ionicons/icons';

interface FAQItem {
  q: string;
  a: string;
}

export default function DigitalTickets() {
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);

  const passes = [
    {
      title: 'Abone Studentore',
      price: '600 Lekë',
      duration: 'Validiteti: 1 Muaj Kalendarik',
      badge: 'Më e popullarizuara',
      features: [
        'Udhëtime të pakufizuara në të gjitha linjat',
        'Kërkon verifikim të kartës së studentit',
        'Gjenerim automatik i kodit QR',
        'Mundësi rinovimi automatik çdo muaj'
      ],
      btnText: 'Bli në Aplikacion',
      primary: true
    },
    {
      title: 'Abone e Përgjithshme',
      price: '1,600 Lekë',
      duration: 'Validiteti: 1 Muaj Kalendarik',
      badge: 'Për të gjithë',
      features: [
        'Udhëtime të pakufizuara në të gjitha linjat',
        'Nuk kërkohet dokument shtesë verifikimi',
        'Transferueshme midis pajisjeve tuaja',
        'Faturim i shpejtë në email'
      ],
      btnText: 'Bli në Aplikacion',
      primary: false
    },
    {
      title: 'Biletë 10-Ditore',
      price: '300 Lekë',
      duration: 'Validiteti: 10 ditë nga aktivizimi',
      badge: 'Udhëtarë rastësorë',
      features: [
        'Deri në 10 udhëtime të përfshira',
        'Përdoret në çdo kohë brenda 30 ditëve',
        'Kosto më e ulët për udhëtim (30 Lekë)',
        'Ideale për vizitorë ose fundjava'
      ],
      btnText: 'Bli në Aplikacion',
      primary: false
    }
  ];

  const purchaseSteps = [
    {
      icon: <IonIcon icon={phonePortraitOutline} style={{ fontSize: 24 }} />,
      title: '1. Shkarko & Regjistrohu',
      desc: 'Shkarkoni aplikacionin Urbani IM në iOS ose Android dhe krijoni një llogari me emailin tuaj ose me Google/Apple ID.'
    },
    {
      icon: <IonIcon icon={cardOutline} style={{ fontSize: 24 }} />,
      title: '2. Zgjidh & Paguaj',
      desc: 'Shkoni tek seksioni "Biletat" në profilin tuaj, zgjidhni abonenë që dëshironi dhe kryeni pagesën e sigurt me kartë krediti/debiti ose portofol elektronik.'
    },
    {
      icon: <IonIcon icon={qrCodeOutline} style={{ fontSize: 24 }} />,
      title: '3. Merr Kodin QR & Udhëto',
      desc: 'Kodi QR i abonesë tuaj do të gjenerohet menjëherë në aplikacion. Thjesht skenojeni atë në pajisjen verifikuese kur hipni në autobus.'
    }
  ];

  const ticketFaqs: FAQItem[] = [
    { q: 'Si bëhet verifikimi i statusit të studentit?', a: 'Gjatë blerjes së Abonesë Studentore në aplikacion, do t\'ju kërkohet të ngarkoni një foto të kartës suaj të studentit ose vërtetimit të shkollës. Verifikimi bëhet automatikisht brenda 24 orëve.' },
    { q: 'A mund ta ndaj abonenë time me dikë tjetër?', a: 'Abonetë dixhitale janë personale dhe lidhen me pajisjen tuaj celulare. Ato përmbajnë emrin tuaj dhe kodin unik QR që nuk mund të skenohet në dy pajisje njëkohësisht.' },
    { q: 'Çfarë ndodh nëse më fiket telefoni gjatë udhëtimit?', a: 'Ju jeni përgjegjës për të mbajtur pajisjen tuaj të ndezur për të treguar abonenë/biletën aktive te kontrollori. Nëse telefoni juaj është i fikur, kontrollorët mund t\'ju gjobisin sipas rregullave të tranzitit.' },
    { q: 'A mund të marr faturë tatimore për blerjen?', a: 'Po, pas çdo blerjeje të kryer me sukses, një faturë tatimore e detajuar PDF do t\'ju dërgohet automatikisht në adresën tuaj të email-it të regjistruar.' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 animate-fade-up">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200/60 rounded-full px-4 py-1.5 mb-4">
          <IonIcon icon={pricetagOutline} style={{ fontSize: 14 }} className="text-orange-600" />
          <span className="text-xs font-semibold text-orange-800">Kurseni Kohë &amp; Para</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
          Biletat &amp; Abonetë Dixhitale
        </h1>
        <p className="text-sm md:text-base text-slate-500 mt-2 max-w-xl mx-auto">
          Zgjidhni paketën më të përshtatshme për udhëtimin tuaj. Blerje e shpejtë, e sigurt dhe 100% pa letra.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {passes.map((pass, index) => (
          <div 
            key={index} 
            className={`rounded-2xl p-8 flex flex-col justify-between relative transition-all duration-300 ${
              pass.primary 
                ? 'bg-slate-900 text-white shadow-xl scale-105 border-2 border-orange-500 z-10' 
                : 'bg-white text-slate-800 border border-slate-200/60 shadow-sm hover:border-slate-300'
            }`}
          >
            {/* Ribbon Badge */}
            <span className={`absolute top-4 right-4 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
              pass.primary ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {pass.badge}
            </span>

            <div>
              <h3 className="text-lg font-bold mt-2">{pass.title}</h3>
              <p className={`text-xs mt-1 ${pass.primary ? 'text-slate-400' : 'text-slate-500'}`}>
                {pass.duration}
              </p>
              
              <div className="my-6">
                <span className="text-4xl font-extrabold tracking-tight">{pass.price}</span>
              </div>

              {/* Features List */}
              <ul className="flex flex-col gap-3 my-6 list-none p-0 m-0 border-t pt-6 border-slate-200/20">
                {pass.features.map((feat, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-2.5 text-xs">
                    <IonIcon icon={checkmarkCircleOutline} style={{ fontSize: 16 }} className={pass.primary ? 'text-orange-400 mt-0.5' : 'text-orange-600 mt-0.5'} />
                    <span className={pass.primary ? 'text-slate-300' : 'text-slate-600'}>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link 
              href="/#shkarko" 
              className={`btn-base text-xs py-3 text-center mt-4 w-full ${
                pass.primary ? 'btn-secondary' : 'btn-dark'
              }`}
            >
              {pass.btnText}
            </Link>
          </div>
        ))}
      </div>

      {/* How it works Section */}
      <section className="py-16 border-y border-slate-200/60 my-16">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Si funksionon procesi?
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Mënyra më e thjeshtë dhe e shpejtë për të marrë biletën tuaj të udhëtimit në Tiranë.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {purchaseSteps.map((step, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200/50 shadow-sm flex flex-col gap-4 text-center items-center">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-inner">
                {step.icon}
              </div>
              <h3 className="text-base font-bold text-slate-900">{step.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Secure Payment details & QR Verification */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mb-16">
        <div className="flex flex-col gap-6">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Transaksione të Sigurta &amp; Privatësi e Mbrojtur
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Ne përdorim standardet më të fundit të enkriptimit për përpunimin e pagesave tuaja. Të dhënat tuaja financiare përpunohen në mënyrë të sigurt nga Stripe dhe ofruesit zyrtarë, pa ruajtur asnjë detaj të kartës suaj në serverat tanë.
          </p>
          <div className="flex flex-col gap-3">
            {[
              { icon: <IonIcon icon={shieldCheckmarkOutline} className="text-orange-600" style={{ fontSize: 18 }} />, label: 'Enkriptim 256-bit SSL për të gjitha pagesat' },
              { icon: <IonIcon icon={cardOutline} className="text-orange-600" style={{ fontSize: 18 }} />, label: 'Mbështetje për VISA, MasterCard dhe Apple Pay' },
              { icon: <IonIcon icon={busOutline} className="text-orange-600" style={{ fontSize: 18 }} />, label: 'Skenim i shpejtë dhe funksionim i garantuar në autobus' }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 text-xs text-slate-700 font-semibold">
                {item.icon}
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 text-white rounded-3xl p-8 relative overflow-hidden flex flex-col justify-center items-center text-center">
          <div className="absolute top-0 right-0 w-60 h-60 bg-orange-500/10 rounded-full blur-3xl -z-10" />
          <IonIcon icon={qrCodeOutline} style={{ fontSize: 160 }} className="text-orange-400 mb-4" />
          <h3 className="text-lg font-bold">Verifikimi me Kod QR</h3>
          <p className="text-xs text-slate-400 max-w-sm mt-2 leading-relaxed">
            Skaneri i autobusit do të lexojë kodin tuaj QR në sekonda. Ekranet tanë mbështesin skanimin edhe në nivele të ulëta ndriçimi.
          </p>
        </div>
      </section>

      {/* Ticket FAQ Section */}
      <section className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-extrabold text-slate-900">
            Pyetje rreth Biletave &amp; Pagesave
          </h2>
        </div>

        <div className="accordion-wrapper">
          {ticketFaqs.map((faq, index) => {
            const isOpen = openAccordion === index;
            return (
              <div key={index} className={`accordion-card ${isOpen ? 'open' : ''}`}>
                <button
                  type="button"
                  onClick={() => setOpenAccordion(isOpen ? null : index)}
                  className="accordion-trigger"
                >
                  <span className="accordion-title">{faq.q}</span>
                  <div className="accordion-icon">
                    <IonIcon icon={chevronDownOutline} style={{ fontSize: 16 }} />
                  </div>
                </button>
                <div 
                  className="accordion-content"
                  style={{ maxHeight: isOpen ? '200px' : '0px' }}
                >
                  <div className="accordion-content-inner">
                    <p>{faq.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

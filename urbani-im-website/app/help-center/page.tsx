'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Search, ChevronRight, ChevronDown, ChevronLeft,
  MapPin, Bus, Bell, User, WifiOff, Zap,
  MessageSquare, Mail, Bug, HelpCircle, BookOpen,
  Shield, Smartphone, Clock, Star, ArrowUpRight,
  X, CheckCircle2,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Article {
  id: string;
  title: string;
  body: string;
  tags: string[];
}

interface FAQItem {
  q: string;
  a: string;
}

interface Category {
  id: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  color: string;
  articles: Article[];
}

// ─── Data ────────────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = [
  {
    id: 'fillimi',
    icon: <Zap size={22} strokeWidth={2} />,
    label: 'Fillimi i shpejtë',
    description: 'Konfigurimi i parë i aplikacionit',
    color: '#0d9488',
    articles: [
      {
        id: 'f1', title: 'Si të krijoni një llogari', tags: ['llogari', 'regjistrim'],
        body: 'Hapni aplikacionin dhe trokitni "Regjistrohu". Plotësoni emailin dhe fjalëkalimin tuaj, pastaj konfirmoni emailin nëpërmjet linkut që do të merrni. Mund të regjistroheni edhe me Google ose Apple ID.',
      },
      {
        id: 'f2', title: 'Si të caktoni qytetin tuaj', tags: ['qytet', 'vendndodhje', 'konfigurim'],
        body: 'Gjatë konfigurimit të parë, aplikacioni do t\'ju kërkojë leje për vendndodhjen. Nëse refuzoni, mund ta caktoni qytetin manualisht nga Cilësimet → Qyteti im. Aplikacioni mbështet të gjitha qytetet kryesore shqiptare.',
      },
      {
        id: 'f3', title: 'Lejet e nevojshme (GPS & njoftimet)', tags: ['leje', 'gps', 'njoftimet'],
        body: 'Aplikacioni kërkon: (1) Vendndodhja — për të gjetur linjat pranë jush; (2) Njoftimet — për t\'ju lajmëruar kur autobusi është afër; (3) Internet — për të dhënat në kohë reale. Të gjitha lejet mund të menaxhohen nga cilësimet e telefonit tuaj.',
      },
    ],
  },
  {
    id: 'udhetimi',
    icon: <MapPin size={22} strokeWidth={2} />,
    label: 'Planifikimi i udhëtimit',
    description: 'Harta, linjat dhe oraret',
    color: '#0d9488',
    articles: [
      {
        id: 'u1', title: 'Si të planifikoni një udhëtim nga A në B', tags: ['udhëtim', 'planifikim', 'rrugë'],
        body: 'Trokitni ikonën e kërkimit → shkruani destinacionin. Aplikacioni do të tregojë opsionet më të mira: linja direkte, me ndërrim, dhe kohën e parashikuar. Mund të zgjidhni sipas kohës më të shkurtër ose numrit të ndërrimit.',
      },
      {
        id: 'u2', title: 'Si të lexoni hartën live', tags: ['hartë', 'live', 'autobus'],
        body: 'Autobuset shfaqen si ikona të lëvizshme mbi hartë. Ngjyra tregon linjën. Trokitni mbi autobus për të parë: numrin e linjës, kohën e ardhjes dhe destinacionin. Harta rifresohet çdo 10 sekonda.',
      },
      {
        id: 'u3', title: 'Si të ruani destinacionet e preferuara', tags: ['preferuar', 'ruaj', 'shtëpi', 'punë'],
        body: 'Në ekranin kryesor, trokitni ikonën ★ pranë çdo destinacioni. Shtëpia dhe puna mund të caktohen nga Profili → Vendet e mia. Destinacionet e ruajtura shfaqen menjëherë kur hapni kërkimin.',
      },
      {
        id: 'u4', title: 'Si të caktoni alarm për autobusin', tags: ['alarm', 'njoftim', 'rikujtues'],
        body: 'Gjeni linjën tuaj → trokitni mbi stacionin → "Cakto alarm". Mund të zgjidhni të njoftoheni 5, 10 ose 15 minuta para ardhjes. Alarmet funksionojnë edhe kur aplikacioni është në sfond.',
      },
    ],
  },
  {
    id: 'autobusi',
    icon: <Bus size={22} strokeWidth={2} />,
    label: 'Linjat & oraret',
    description: 'Informacione për transportin publik',
    color: '#0d9488',
    articles: [
      {
        id: 'a1', title: 'Si të gjeni orarin e një linje', tags: ['orar', 'linjë', 'oraret'],
        body: 'Nga menyja kryesore → "Linjat" → zgjidhni linjën. Oraret ndahen sipas ditëve: ditë pune, e shtunë, e diel dhe festat kombëtare. Oraret mund të ndryshojnë gjatë festave — kontrolloni gjithmonë njoftimet.',
      },
      {
        id: 'a2', title: 'Si të raportoni një linjë që mungon ose ka të dhëna gabim', tags: ['raportim', 'gabim', 'linjë'],
        body: 'Shkoni te linja → menyja (⋯) → "Raportoni problem". Zgjidhni llojin: linja mungon, orar i gabuar, stacion i gabuar, ose tjetër. Çdo raportim shqyrtohet brenda 48 orëve.',
      },
      {
        id: 'a3', title: 'Nga vijnë të dhënat e transportit?', tags: ['të dhëna', 'gtfs', 'operatori'],
        body: 'Të dhënat tona vijnë nga operatorët zyrtarë të transportit publik nëpërmjet formatit GTFS (General Transit Feed Specification). Pozicioni live i autobuseve vjen nga GPS e autobuseve. Nëse të dhënat janë të pasakta, mund të jenë shkak ndryshime të fundit nga operatori.',
      },
    ],
  },
  {
    id: 'njoftimet',
    icon: <Bell size={22} strokeWidth={2} />,
    label: 'Njoftimet',
    description: 'Alarme dhe rikujtues',
    color: '#0d9488',
    articles: [
      {
        id: 'n1', title: 'Njoftimet nuk po vijnë', tags: ['njoftim', 'alarm', 'problem'],
        body: 'Kontrolloni: (1) Cilësimet e telefonit → Aplikacionet → Urbani IM → Njoftimet — të aktivizuara? (2) Modaliteti "Mos shqetëso" mund të bllokojë njoftimet. (3) Brenda aplikacionit: Cilësimet → Njoftimet — çfarë është aktivizuar? Nëse problemi vazhdon, çinstaloni dhe rinstaloni aplikacionin.',
      },
      {
        id: 'n2', title: 'Si të personalizoni llojet e njoftimeve', tags: ['njoftim', 'personalizim', 'cilësime'],
        body: 'Cilësimet → Njoftimet. Mund të aktivizoni/çaktivizoni veçmas: ardhja e autobusit, vonesa, ndryshimet e orarit, lajme nga operatori, dhe njoftime promovuese. Rekomandojmë të mbani aktive të paktën "ardhja e autobusit" dhe "vonesa".',
      },
    ],
  },
  {
    id: 'llogaria',
    icon: <User size={22} strokeWidth={2} />,
    label: 'Llogaria & profili',
    description: 'Email, fjalëkalim, privatësia',
    color: '#0d9488',
    articles: [
      {
        id: 'l1', title: 'Si të ndryshoni emailin ose fjalëkalimin', tags: ['email', 'fjalëkalim', 'ndryshim'],
        body: 'Profili → "Ndrysho të dhënat". Për emailin nevojitet konfirmim i adresës së re. Për fjalëkalimin duhet të dini fjalëkalimin aktual. Nëse keni harruar fjalëkalimin, përdorni "Keni harruar fjalëkalimin?" në ekranin e hyrjes.',
      },
      {
        id: 'l2', title: 'Si të fshini llogarinë', tags: ['fshij', 'llogari', 'çregjistrim'],
        body: 'Profili → Cilësimet → "Fshi llogarinë". Ky veprim është i pakthyeshëm. Të gjitha të dhënat tuaja do të fshihen brenda 30 ditëve sipas GDPR. Destinacionet e ruajtura dhe historiku i udhëtimeve do të humbasin përgjithmonë.',
      },
      {
        id: 'l3', title: 'Të dhënat tuaja & privatësia', tags: ['privatësi', 'gdpr', 'të dhëna'],
        body: 'Ne mbledhim: vendndodhjen (vetëm kur aplikacioni është aktiv), historikun e kërkimeve, dhe të dhënat e përdorimit. Nuk shesim të dhëna tek palë të treta. Mund të shkarkoni të gjitha të dhënat tuaja nga Profili → Privatësia → "Shkarko të dhënat".',
      },
    ],
  },
  {
    id: 'teknik',
    icon: <Smartphone size={22} strokeWidth={2} />,
    label: 'Probleme teknike',
    description: 'GPS, ngarkimi, bug-e',
    color: '#0d9488',
    articles: [
      {
        id: 't1', title: 'GPS nuk funksionon ose vendndodhja është e pasaktë', tags: ['gps', 'vendndodhje', 'problem'],
        body: 'Provoni: (1) Mbyllni dhe rihapni aplikacionin. (2) Kontrolloni nëse GPS është aktivizuar në telefon. (3) Kaloni jashtë ndërtesës — GPS nuk funksionon mirë brenda. (4) Cilësimet → "Kalibroni vendndodhjen". Nëse problemi vazhdon, kontrolloni nëse ka përditësim të disponueshëm.',
      },
      {
        id: 't2', title: 'Aplikacioni nuk ngarkohet ose ngrin', tags: ['ngrin', 'crash', 'ngarkim'],
        body: 'Hapat për zgjidhje: (1) Mbyllni plotësisht aplikacionin dhe rihapeni. (2) Kontrolloni lidhjen me internetin. (3) Pastroni cache-in: Cilësimet e telefonit → Aplikacionet → Urbani IM → Pastro cache. (4) Rinstaloni aplikacionin. Nëse vazhdon, raportoni bug-in me detajet e pajisjes suaj.',
      },
      {
        id: 't3', title: 'Harta nuk shfaqet siç duhet', tags: ['hartë', 'vizual', 'problem'],
        body: 'Harta kërkon lidhje të mirë interneti. Provoni: (1) Ndrysho nga WiFi në 4G ose anasjelltas. (2) Zmadhoni/zvogëloni hartën disa herë. (3) Trokitni "Vendos hartën" (ikona e shenjëzimit). (4) Nëse harta shfaq "Offline" — shkarkoni hartën offline nga Cilësimet → Hartat Offline.',
      },
    ],
  },
  {
    id: 'offline',
    icon: <WifiOff size={22} strokeWidth={2} />,
    label: 'Offline & bateria',
    description: 'Pa internet dhe kursim energjie',
    color: '#0d9488',
    articles: [
      {
        id: 'o1', title: 'A funksionon aplikacioni pa internet?', tags: ['offline', 'internet', 'harta'],
        body: 'Funksionet offline: oraret e ruajtura, hartat e shkarkuara, linjat e preferuara. Nuk funksionojnë pa internet: pozicioni live i autobuseve, njoftimet, kërkimi i rrugëve të reja. Për të shkarkuar hartat offline: Cilësimet → Hartat Offline → zgjidhni qytetin.',
      },
      {
        id: 'o2', title: 'Si të kurseni baterinë', tags: ['bateri', 'kursim', 'energji'],
        body: 'Mënyrat kryesore: (1) Aktivizoni "Modalitetin e kursimit të baterisë" nga Cilësimet e aplikacionit — zvogëlon shpeshtësinë e rifreskimit të GPS. (2) Mbyllni aplikacionin kur nuk e përdorni. (3) Çaktivizoni njoftimet që nuk i nevojiten. (4) Shkarkoni hartat offline — redukton shkarkimin e të dhënave.',
      },
    ],
  },
  {
    id: 'aksesibiliteti',
    icon: <Shield size={22} strokeWidth={2} />,
    label: 'Aksesibiliteti',
    description: 'Lexues ekrani, kontrast, tekst',
    color: '#0d9488',
    articles: [
      {
        id: 'ak1', title: 'Mbështetja për VoiceOver dhe TalkBack', tags: ['aksesibiliteti', 'voiceover', 'talkback'],
        body: 'Aplikacioni mbështet plotësisht VoiceOver (iOS) dhe TalkBack (Android). Të gjitha elementet janë të etiketuara për lexues ekrani. Nëse hasni probleme, na raportoni dhe do të rregullojmë me prioritet.',
      },
      {
        id: 'ak2', title: 'Madhësia e tekstit dhe kontrasti', tags: ['tekst', 'madhësi', 'kontrast'],
        body: 'Aplikacioni respekton cilësimet e madhësisë së tekstit të telefonit tuaj. Për kontrast të lartë, aktivizoni "Modaliteti me kontrast të lartë" nga Cilësimet → Pamja. Nëse ngjyrat nuk janë të qarta, kontaktoni ekipin tonë.',
      },
    ],
  },
];

const FAQ: FAQItem[] = [
  { q: 'A është aplikacioni falas?', a: 'Po, Urbani IM është plotësisht falas. Nuk ka blerje brenda aplikacionit dhe nuk do të ketë.' },
  { q: 'Sa shpesh përditësohen të dhënat live?', a: 'Pozicioni i autobuseve përditësohet çdo 10 sekonda. Oraret verifikohen çdo natë nga sistemi ynë.' },
  { q: 'Pse aplikacioni kërkon vendndodhjen gjatë gjithë kohës?', a: 'Ju mund të zgjidhni "Vetëm gjatë përdorimit" — kjo është opsioni i rekomanduar. "Gjithmonë" nevojitet vetëm nëse doni njoftimet proaktive kur kaloni pranë stacioneve.' },
  { q: 'A mbështetet transporti ndërkombëtar?', a: 'Aktualisht mbulojmë vetëm qytetet shqiptare. Mbulimi ndërkombëtar është në planin tonë për vitin e ardhshëm.' },
  { q: 'Si mund të kontribuoj me të dhëna?', a: 'Mund të raportoni ndryshime të linjave, stacione të reja ose të dhëna të pasakta direkt nga aplikacioni. Komuniteti aktiv i kontribuesve na ndihmon të mbajmë gjithçka të përditësuar.' },
  { q: 'Çfarë bëj nëse humbas autobusin?', a: 'Harta live do t\'ju tregojë autobusin e ardhshëm. Trokitni mbi stacionin tuaj për të parë të gjitha linjat dhe kohët e ardhjes. Mund të caktoni alarm për herën tjetër.' },
];

// ─── Search helper ────────────────────────────────────────────────────────────

function searchAll(query: string): { category: Category; article: Article }[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  const results: { category: Category; article: Article }[] = [];
  for (const cat of CATEGORIES) {
    for (const art of cat.articles) {
      if (
        art.title.toLowerCase().includes(q) ||
        art.body.toLowerCase().includes(q) ||
        art.tags.some((t) => t.toLowerCase().includes(q))
      ) {
        results.push({ category: cat, article: art });
      }
    }
  }
  return results;
}

// ─── Sub-views ────────────────────────────────────────────────────────────────

function ArticleView({
  article, category, onBack,
}: { article: Article; category: Category; onBack: () => void }) {
  return (
    <article className="animate-fade-up" style={{ padding: '8px 0 40px' }}>
      <button type="button" onClick={onBack} className="back-button" id="btn-back-to-category">
        <ChevronLeft size={16} strokeWidth={2.5} /> Kthehu te kategoritë
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
        <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600', letterSpacing: '.05em', textTransform: 'uppercase' }}>
          {category.label}
        </span>
      </div>

      <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', letterSpacing: '-0.5px', lineHeight: 1.25, margin: '0 0 20px' }}>
        {article.title}
      </h2>

      <p style={{ fontSize: '15px', color: '#334155', lineHeight: 1.8, margin: '0 0 32px', whiteSpace: 'pre-line' }}>
        {article.body}
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '40px' }}>
        {article.tags.map((tag) => (
          <span key={tag} className="tag-badge">#{tag}</span>
        ))}
      </div>

      <div className="helpful-card">
        <p style={{ fontSize: '14px', fontWeight: '600', color: '#475569', margin: '0 0 14px' }}>
          A ju ndihmoi ky artikull?
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          {['👍  Po, faleminderit', '👎  Jo, kam pyetje'].map((label, index) => (
            <button key={label} type="button" className="helpful-btn" id={`btn-helpful-${index}`}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </article>
  );
}

function CategoryView({
  category, onBack, onArticle,
}: { category: Category; onBack: () => void; onArticle: (a: Article) => void }) {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  return (
    <div className="animate-fade-up" style={{ padding: '8px 0 40px' }}>
      <button type="button" onClick={onBack} className="back-button" id="btn-back-to-main">
        <ChevronLeft size={16} strokeWidth={2.5} /> Kthehu në faqen kryesore
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
        <div className="card-icon-round" style={{ margin: '0' }}>
          {category.icon}
        </div>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', letterSpacing: '-0.5px', margin: 0 }}>
            {category.label}
          </h2>
          <p style={{ fontSize: '13.5px', color: '#64748b', margin: '2px 0 0' }}>{category.description}</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {category.articles.map((art) => {
          const isOpen = openIndex === art.id;
          return (
            <div key={art.id} className="accordion-item-card">
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : art.id)}
                className="accordion-row-btn"
              >
                <span className="accordion-row-title">{art.title}</span>
                <div className="accordion-arrow-round" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}>
                  <ChevronDown size={14} strokeWidth={2.5} />
                </div>
              </button>
              <div className={`accordion-reveal-box ${isOpen ? 'open' : ''}`}>
                <div className="accordion-reveal-content">
                  <p style={{ margin: '0 0 16px', color: '#334155', lineHeight: 1.7 }}>{art.body}</p>
                  <button
                    type="button"
                    onClick={() => onArticle(art)}
                    style={{
                      background: 'none', border: 'none', color: '#0d9488', fontSize: '13px',
                      fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px',
                      cursor: 'pointer', padding: 0
                    }}
                  >
                    Lexo artikullin e plotë <ArrowUpRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function HelpCenterView() {
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<{ category: Category; article: Article }[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
  const [openMainAccordion, setOpenMainAccordion] = useState<string | null>(null);
  const [contactSent, setContactSent] = useState(false);
  const [contactText, setContactText] = useState('');
  const [contactLoading, setContactLoading] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);
  const guidesRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  // Live search
  useEffect(() => {
    setSearchResults(searchAll(search));
  }, [search]);

  const handleContact = async () => {
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
      setTimeout(() => setContactSent(false), 4000);
    } catch (e) {
      console.error('Failed to submit feedback', e);
    } finally {
      setContactLoading(false);
    }
  };

  const clearSearch = () => { setSearch(''); searchRef.current?.focus(); };

  // Smooth scroll helper
  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveCategory(null);
    setActiveArticle(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Grouped sections representation (Getting Started, Transit Services, Technical Support)
  const SECTIONS = [
    {
      id: 'sec-getting-started',
      title: 'Fillimi & Udhëtimi (Getting Started)',
      subtitle: 'Nisni udhëtimin tuaj dhe mësoni si të përdorni aplikacionin për planifikim rrugësh.',
      articles: [
        ...(CATEGORIES.find(c => c.id === 'fillimi')?.articles || []),
        ...(CATEGORIES.find(c => c.id === 'udhetimi')?.articles || []),
      ],
      catColor: '#0d9488',
    },
    {
      id: 'sec-transit-services',
      title: 'Oraret & Njoftimet (Transit & Alerts)',
      subtitle: 'Informacione mbi oraret zyrtare, linjat, ndryshimet në kohë reale dhe alarmet.',
      articles: [
        ...(CATEGORIES.find(c => c.id === 'autobusi')?.articles || []),
        ...(CATEGORIES.find(c => c.id === 'njoftimet')?.articles || []),
      ],
      catColor: '#0d9488',
    },
    {
      id: 'sec-tech-support',
      title: 'Llogaria & Zgjidhja e Problemeve (Troubleshooting)',
      subtitle: 'Menaxhimi i profilit të përdoruesit, lejet e GPS dhe udhëzimet për përdorim offline.',
      articles: [
        ...(CATEGORIES.find(c => c.id === 'llogaria')?.articles || []),
        ...(CATEGORIES.find(c => c.id === 'teknik')?.articles || []),
        ...(CATEGORIES.find(c => c.id === 'offline')?.articles || []),
        ...(CATEGORIES.find(c => c.id === 'aksesibiliteti')?.articles || []),
      ],
      catColor: '#0d9488',
    },
  ];

  // ── Render view conditional logic ─────────────────────────────────────────
  const renderContent = () => {
    if (activeArticle && activeCategory) {
      return (
        <div className="section-container">
          <ArticleView
            article={activeArticle}
            category={activeCategory}
            onBack={() => setActiveArticle(null)}
          />
        </div>
      );
    }
    if (activeCategory) {
      return (
        <div className="section-container">
          <CategoryView
            category={activeCategory}
            onBack={() => setActiveCategory(null)}
            onArticle={(a) => setActiveArticle(a)}
          />
        </div>
      );
    }

    return (
      <>
        {/* ── 3 Column Feature Cards ───────────────────────────────────────── */}
        <div className="cards-grid" ref={guidesRef}>
          <div className="category-pill-card" onClick={() => scrollTo(faqRef)}>
            <div className="card-icon-round">
              <BookOpen size={24} />
            </div>
            <h3 className="card-title">Udhëzuesit (Guides)</h3>
            <p className="card-desc">Gjeni udhëzime të hollësishme për përdorimin e hartave, GPS dhe konfigurimet e para.</p>
          </div>

          <div className="category-pill-card" onClick={() => scrollTo(faqRef)}>
            <div className="card-icon-round">
              <MessageSquare size={24} />
            </div>
            <h3 className="card-title">Pyetjet e Shpeshta (FAQ)</h3>
            <p className="card-desc">Përgjigje të shpejta për pyetjet më të shpeshta rreth aplikacionit dhe të dhënave live.</p>
          </div>

          <div className="category-pill-card" onClick={() => scrollTo(contactRef)}>
            <div className="card-icon-round">
              <User size={24} />
            </div>
            <h3 className="card-title">Komuniteti & Suporti</h3>
            <p className="card-desc">Na kontaktoni drejtpërdrejt për të raportuar problematika ose sugjeruar linja të reja.</p>
          </div>
        </div>

        {/* ── Category Links Grid (Quick Navigation) ───────────────────────── */}
        <div className="section-container">
          <h2 className="section-header-title" style={{ fontSize: '20px', marginBottom: '24px' }}>Lundro sipas kategorisë</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginBottom: '60px' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat)}
                style={{
                  background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px',
                  padding: '16px', display: 'flex', alignItems: 'center', gap: '10px',
                  cursor: 'pointer', textTransform: 'none', textAlign: 'left',
                  transition: 'all 0.2s ease', outline: 'none'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#94a3b8'; e.currentTarget.style.background = '#f8fafc'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#ffffff'; }}
              >
                <span style={{ color: '#0d9488', display: 'flex' }}>{cat.icon}</span>
                <span style={{ fontSize: '13.5px', fontWeight: '600', color: '#1e293b' }}>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Grouped Accordion Sections ───────────────────────────────────── */}
        {SECTIONS.map((sec) => (
          <div key={sec.id} className="section-container">
            <h2 className="section-header-title">{sec.title}</h2>
            <p className="section-header-desc">{sec.subtitle}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {sec.articles.map((art) => {
                const accordionKey = `${sec.id}-${art.id}`;
                const isOpen = openMainAccordion === accordionKey;
                return (
                  <div key={art.id} className="accordion-item-card">
                    <button
                      type="button"
                      onClick={() => setOpenMainAccordion(isOpen ? null : accordionKey)}
                      className="accordion-row-btn"
                    >
                      <span className="accordion-row-title">{art.title}</span>
                      <div className="accordion-arrow-round" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}>
                        <ChevronDown size={14} strokeWidth={2.5} />
                      </div>
                    </button>
                    <div className={`accordion-reveal-box ${isOpen ? 'open' : ''}`}>
                      <div className="accordion-reveal-content">
                        <p style={{ margin: '0 0 16px', color: '#475569', lineHeight: 1.7 }}>{art.body}</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                          {art.tags.map(t => <span key={t} className="tag-badge">#{t}</span>)}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const originalCategory = CATEGORIES.find(c => c.articles.some(a => a.id === art.id));
                            if (originalCategory) {
                              setActiveCategory(originalCategory);
                              setActiveArticle(art);
                            }
                          }}
                          style={{
                            background: 'none', border: 'none', color: '#0d9488', fontSize: '13px',
                            fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px',
                            cursor: 'pointer', padding: 0
                          }}
                        >
                          Faqja e plotë e udhëzuesit <ArrowUpRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* ── FAQ Section ─────────────────────────────────────────────────── */}
        <div className="section-container" ref={faqRef}>
          <h2 className="section-header-title">Pyetjet më të shpeshta (FAQ)</h2>
          <p className="section-header-desc">Përgjigje të shpejta për menaxhimin e përgjithshëm dhe pyetjet më të hasura.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {FAQ.map((item, i) => {
              const accordionKey = `faq-${i}`;
              const isOpen = openMainAccordion === accordionKey;
              return (
                <div key={i} className="accordion-item-card">
                  <button
                    type="button"
                    onClick={() => setOpenMainAccordion(isOpen ? null : accordionKey)}
                    className="accordion-row-btn"
                  >
                    <span className="accordion-row-title" style={{ color: '#1e293b' }}>{item.q}</span>
                    <div className="accordion-arrow-round" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', color: '#64748b', background: '#f8fafc' }}>
                      <ChevronDown size={14} strokeWidth={2.5} />
                    </div>
                  </button>
                  <div className={`accordion-reveal-box ${isOpen ? 'open' : ''}`}>
                    <div className="accordion-reveal-content">
                      <p style={{ margin: 0, color: '#475569', lineHeight: 1.7 }}>{item.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Contact Form ─────────────────────────────────────────────────── */}
        <div className="section-container" ref={contactRef}>
          <h2 className="section-header-title">Nuk e gjetët atë që kërkoni?</h2>
          <p className="section-header-desc">Shkruani drejtpërdrejt ekipit tonë të mbështetjes teknike dhe do t'ju kthehemi menjëherë.</p>

          <div className="accordion-item-card" style={{ padding: '32px 24px', background: '#ffffff' }}>
            {contactSent ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '16px 0', textAlign: 'center' }}>
                <div style={{ display: 'flex', padding: '12px', borderRadius: '50%', background: '#f0fdfa', border: '1px solid #ccfbf1' }}>
                  <CheckCircle2 size={32} color="#0d9488" strokeWidth={1.5} />
                </div>
                <p style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Kërkesa juaj u dërgua me sukses!</p>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0, maxWidth: '280px', lineHeight: 1.5 }}>
                  Do t'ju kthejmë përgjigje brenda 24 orëve në adresën e dhënë.
                </p>
              </div>
            ) : (
              <>
                <textarea
                  id="textarea-feedback"
                  value={contactText}
                  onChange={(e) => setContactText(e.target.value)}
                  placeholder="Shkruani pyetjen ose problematikën tuaj këtu..."
                  rows={4}
                  disabled={contactLoading}
                  className="contact-textarea"
                />
                <button
                  type="button"
                  onClick={handleContact}
                  id="btn-submit-feedback"
                  disabled={!contactText.trim() || contactLoading}
                  className={`contact-submit-btn ${contactText.trim() && !contactLoading ? 'active' : 'inactive'}`}
                  style={{
                    background: contactText.trim() && !contactLoading ? '#0d9488' : '#f1f5f9',
                    color: contactText.trim() && !contactLoading ? '#ffffff' : '#94a3b8'
                  }}
                >
                  {contactLoading ? 'Po dërgohet...' : 'Dërgo mesazh'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── Support Info footer grid ────────────────────────────────────── */}
        <div className="section-container" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            {[
              { icon: <Mail size={15} />, label: 'Email mbështetës', value: 'support@urbani-im.al' },
              { icon: <Clock size={15} />, label: 'Orari i shërbimit', value: 'E Hënë – E Premte, 09:00–17:00' },
              { icon: <HelpCircle size={15} />, label: 'Koha mesatare', value: 'Brenda 24 orëve' },
            ].map((item, idx) => (
              <div key={idx} className="support-item" style={{ background: '#ffffff', borderColor: '#f1f5f9' }}>
                <span style={{ display: 'flex', padding: '8px', borderRadius: '8px', background: '#f0fdfa', color: '#0d9488', flexShrink: 0 }}>
                  {item.icon}
                </span>
                <div>
                  <p style={{ fontSize: '9px', color: '#64748b', margin: 0, fontWeight: '700', letterSpacing: '.04em', textTransform: 'uppercase' }}>
                    {item.label}
                  </p>
                  <p style={{ fontSize: '13px', color: '#334155', margin: '1px 0 0', fontWeight: '600' }}>
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="help-wrapper">
      <style>{`
        /* Global CSS layout declarations matching reference image style */
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        
        .help-wrapper {
          background: #fcfdfd;
          min-height: 100vh;
          color: #1e293b;
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          width: 100%;
          box-sizing: border-box;
          overflow-y: auto;
        }

        /* Nav Bar rules */
        .nav-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 40px;
          background: #ffffff;
          border-bottom: 1px solid #f1f5f9;
          position: sticky;
          top: 0;
          z-index: 200;
        }

        @media (max-width: 640px) {
          .nav-bar {
            padding: 16px 20px;
          }
        }

        .nav-logo {
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
          text-decoration: none;
        }
        
        .nav-logo span {
          font-weight: 400;
          color: #475569;
          margin-left: 2px;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        @media (max-width: 768px) {
          .nav-links {
            display: none;
          }
        }

        .nav-link {
          font-size: 14px;
          font-weight: 500;
          color: #475569;
          text-decoration: none;
          transition: color 0.15s ease;
        }

        .nav-link:hover {
          color: #0d9488;
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .btn-request {
          font-size: 13px;
          font-weight: 500;
          color: #475569;
          background: transparent;
          border: 1px solid #cbd5e1;
          border-radius: 9999px;
          padding: 8px 18px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
        }

        .btn-request:hover {
          border-color: #94a3b8;
          background: #f8fafc;
          color: #0f172a;
        }

        .btn-signin {
          font-size: 13px;
          font-weight: 600;
          color: #1e293b;
          background: #facc15;
          border: none;
          border-radius: 9999px;
          padding: 8px 18px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
        }

        .btn-signin:hover {
          background: #eab308;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(234, 179, 8, 0.2);
        }

        /* Hero Banner rules */
        .hero-section {
          padding: 72px 20px 56px;
          text-align: center;
          background: radial-gradient(circle at top, #f0fdfa 0%, #fcfdfd 100%);
          position: relative;
        }

        .hero-title {
          font-size: 38px;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -1px;
          margin: 0 0 20px;
          line-height: 1.25;
        }

        @media (max-width: 640px) {
          .hero-title {
            font-size: 28px;
          }
        }

        .hero-underline {
          position: relative;
          z-index: 1;
        }

        .hero-underline::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: 2px;
          width: 100%;
          height: 6px;
          background: rgba(20, 184, 166, 0.25);
          z-index: -1;
          border-radius: 4px;
        }

        .search-pill-container {
          max-width: 540px;
          margin: 0 auto 16px;
          position: relative;
        }

        .search-pill-input {
          width: 100%;
          padding: 16px 64px 16px 24px;
          border-radius: 9999px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          color: #1e293b;
          font-size: 14.5px;
          outline: none;
          transition: all 0.25s ease;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.03);
          font-family: inherit;
          box-sizing: border-box;
        }

        .search-pill-input:focus {
          border-color: #cbd5e1;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.06);
        }

        .search-pill-btn {
          position: absolute;
          right: 6px;
          top: 50%;
          transform: translateY(-50%);
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: #facc15;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #1e293b;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .search-pill-btn:hover {
          background: #eab308;
          transform: translateY(-50%) scale(1.05);
        }

        .hero-subtitle {
          font-size: 13px;
          color: #64748b;
          margin: 0;
        }

        /* 3 Columns Cards rules */
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(1, 1fr);
          gap: 20px;
          max-width: 960px;
          margin: -24px auto 48px;
          padding: 0 20px;
        }

        @media (min-width: 640px) {
          .cards-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 960px) {
          .cards-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .category-pill-card {
          background: #ffffff;
          border: 1px solid #f1f5f9;
          border-radius: 16px;
          padding: 28px 24px;
          text-align: center;
          transition: all 0.22s ease;
          cursor: pointer;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.02);
        }

        .category-pill-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.05);
          border-color: #e2e8f0;
        }

        .card-icon-round {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f0fdfa;
          border: 1px solid #ccfbf1;
          color: #0d9488;
          margin: 0 auto 16px;
          transition: transform 0.2s ease;
        }

        .category-pill-card:hover .card-icon-round {
          transform: scale(1.08);
        }

        .card-title {
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 8px;
        }

        .card-desc {
          font-size: 12.5px;
          color: #64748b;
          line-height: 1.5;
          margin: 0;
        }

        /* Grouped Accordions rules */
        .section-container {
          max-width: 768px;
          margin: 0 auto 48px;
          padding: 0 20px;
        }

        .section-header-title {
          font-size: 22px;
          font-weight: 700;
          color: #0f172a;
          text-align: center;
          margin: 0 0 6px;
        }

        .section-header-desc {
          font-size: 13.5px;
          color: #64748b;
          text-align: center;
          margin: 0 0 20px;
          line-height: 1.55;
        }

        .accordion-item-card {
          background: #ffffff;
          border: 1px solid #f1f5f9;
          border-radius: 10px;
          margin-bottom: 10px;
          transition: all 0.2s ease;
        }

        .accordion-item-card:hover {
          border-color: #e2e8f0;
        }

        .accordion-row-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 16px 20px;
          background: transparent;
          border: none;
          cursor: pointer;
          text-align: left;
          font-family: inherit;
        }

        .accordion-row-title {
          font-size: 14px;
          font-weight: 600;
          color: #0d9488;
          transition: color 0.15s ease;
        }

        .accordion-arrow-round {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #f0fdfa;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #0d9488;
          flex-shrink: 0;
          transition: all 0.2s ease;
        }

        .accordion-reveal-box {
          overflow: hidden;
          max-height: 0;
          opacity: 0;
          transition: max-height 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.2s ease;
        }

        .accordion-reveal-box.open {
          max-height: 400px;
          opacity: 1;
        }

        .accordion-reveal-content {
          padding: 0 20px 16px;
          color: #334155;
          font-size: 13.5px;
          line-height: 1.7;
        }

        /* Animations */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-up {
          animation: fadeUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        /* Forms rules */
        .contact-textarea {
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #1e293b;
          font-size: 13.5px;
          font-family: inherit;
          line-height: 1.6;
          resize: none;
          outline: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }

        .contact-textarea:focus {
          border-color: #0d9488;
          box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.1);
        }

        .contact-submit-btn {
          width: 100%;
          margin-top: 10px;
          padding: 12px;
          border-radius: 8px;
          font-size: 13.5px;
          font-weight: 600;
          transition: all 0.2s ease;
          border: none;
          font-family: inherit;
        }

        .contact-submit-btn.active {
          background: #0d9488;
          color: #ffffff;
          cursor: pointer;
        }

        .contact-submit-btn.inactive {
          background: #f1f5f9;
          color: #94a3b8;
          cursor: not-allowed;
        }

        /* Sub-views styles */
        .back-button {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: none;
          border: none;
          padding: 6px 0;
          margin-bottom: 20px;
          color: #64748b;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: color 0.15s ease;
          font-family: inherit;
        }

        .back-button:hover {
          color: #0d9488;
        }

        .tag-badge {
          padding: 3px 8px;
          border-radius: 6px;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          font-size: 11px;
          color: #475569;
        }

        .helpful-card {
          padding: 20px;
          border-radius: 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          text-align: center;
        }

        .helpful-btn {
          padding: 8px 16px;
          border-radius: 8px;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #475569;
          font-size: 12.5px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: inherit;
        }

        .helpful-btn:hover {
          background: #f8fafc;
          border-color: #94a3b8;
          color: #0f172a;
        }

        .support-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border: 1px solid #f1f5f9;
          border-radius: 10px;
        }

        input::-webkit-search-cancel-button {
          display: none;
        }
      `}</style>

      {/* ── Navigation Header ─────────────────────────────────────────────── */}
      <nav className="nav-bar">
        <a href="/" className="nav-logo">
          Urbani<span>IM</span>
        </a>
        <div className="nav-links">
          <a href="/" className="nav-link">Home</a>
          <a href="/help-center" className="nav-link">Help</a>
          <a href="/privacy-policy" className="nav-link">Privacy</a>
        </div>
        <div className="nav-actions">
          <a href="mailto:support@urbani-im.al" className="btn-request">
            Contact Support
          </a>
          <a href="/" className="btn-signin">
            Back to Home
          </a>
        </div>
      </nav>

      {/* ── Hero Banner Section ───────────────────────────────────────────── */}
      <header className="hero-section">
        <h1 className="hero-title">
          How can we <span className="hero-underline">help you?</span>
        </h1>
        <div className="search-pill-container">
          <input
            ref={searchRef}
            id="input-search-help"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
            placeholder="Start typing your search..."
            className="search-pill-input"
          />
          <button type="button" className="search-pill-btn" aria-label="Search" onClick={() => searchRef.current?.focus()}>
            <Search size={16} />
          </button>

          {/* Search Dropdown suggest list */}
          {search && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                right: 0,
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                overflow: 'hidden',
                zIndex: 100,
                boxShadow: '0 12px 30px rgba(0,0,0,0.06)',
                textAlign: 'left',
              }}
            >
              {searchResults.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '13.5px' }}>
                  No results found for "<span style={{ color: '#0f172a', fontWeight: '600' }}>{search}</span>"
                </div>
              ) : (
                searchResults.slice(0, 5).map(({ category, article }) => (
                  <button
                    key={article.id}
                    type="button"
                    onClick={() => { setSearch(''); setActiveCategory(category); setActiveArticle(article); }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 20px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <BookOpen size={15} color="#0d9488" style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '13.5px', fontWeight: '500', color: '#0f172a', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {article.title}
                      </p>
                      <p style={{ fontSize: '11px', color: '#0d9488', margin: '2px 0 0', fontWeight: '500' }}>
                        {category.label}
                      </p>
                    </div>
                    <ArrowUpRight size={13} color="#94a3b8" />
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        <p className="hero-subtitle">
          Or <span style={{ fontWeight: '600', color: '#0f172a' }}>choose</span> an option below to plan your trip.
        </p>
      </header>

      {/* ── Main View Content ─────────────────────────────────────────────── */}
      <main style={{ paddingBottom: '60px' }}>
        {renderContent()}
      </main>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer style={{ background: '#ffffff', borderTop: '1px solid #f1f5f9', padding: '32px 20px', textAlign: 'center' }}>
        <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
          Urbani IM HelpCenter · © {new Date().getFullYear()} · all rights reserved.
        </p>
      </footer>
    </div>
  );
}
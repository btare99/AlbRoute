'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Search, ChevronRight, ChevronDown, ChevronLeft,
  MapPin, Bus, Bell, User, Wifi, WifiOff, Zap,
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
    icon: <Zap size={18} strokeWidth={2} />,
    label: 'Fillimi i shpejtë',
    description: 'Konfigurimi i parë i aplikacionit',
    color: '#f59e0b',
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
    icon: <MapPin size={18} strokeWidth={2} />,
    label: 'Planifikimi i udhëtimit',
    description: 'Harta, linjat dhe oraret',
    color: '#10b981',
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
    icon: <Bus size={18} strokeWidth={2} />,
    label: 'Linjat & oraret',
    description: 'Informacione për transportin publik',
    color: '#6366f1',
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
    icon: <Bell size={18} strokeWidth={2} />,
    label: 'Njoftimet',
    description: 'Alarme dhe rikujtues',
    color: '#ec4899',
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
    icon: <User size={18} strokeWidth={2} />,
    label: 'Llogaria & profili',
    description: 'Email, fjalëkalim, privatësia',
    color: '#14b8a6',
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
    icon: <Smartphone size={18} strokeWidth={2} />,
    label: 'Probleme teknike',
    description: 'GPS, ngarkimi, bug-e',
    color: '#f97316',
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
    icon: <WifiOff size={18} strokeWidth={2} />,
    label: 'Offline & bateria',
    description: 'Pa internet dhe kursim energjie',
    color: '#8b5cf6',
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
    icon: <Shield size={18} strokeWidth={2} />,
    label: 'Aksesibiliteti',
    description: 'Lexues ekrani, kontrast, tekst',
    color: '#06b6d4',
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
  { q: 'Si mund të kontribuoj me të dhëna?', a: 'Mund të raportoni ndryshime të linjave, stacione të reja ose të dhëna të pasakta direkt nga aplikacioni. Komunitet aktiv kontribuesish na ndihmon të mbajmë gjithçka të përditësuar.' },
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
    <div style={{ padding: '24px 20px 40px', maxWidth: '480px', margin: '0 auto', animation: 'fadeUp .25s ease' }}>
      <button type="button" onClick={onBack} style={styles.backBtn}>
        <ChevronLeft size={17} strokeWidth={2} /> Kthehu
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <span style={{ ...styles.categoryDot, background: category.color }} />
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', fontWeight: '500', letterSpacing: '.04em', textTransform: 'uppercase' }}>
          {category.label}
        </span>
      </div>

      <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#f0ede8', letterSpacing: '-0.5px', lineHeight: 1.2, margin: '0 0 16px' }}>
        {article.title}
      </h2>

      <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, margin: '0 0 28px' }}>
        {article.body}
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '32px' }}>
        {article.tags.map((tag) => (
          <span key={tag} style={styles.tag}>{tag}</span>
        ))}
      </div>

      <div style={styles.helpfulBox}>
        <p style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.55)', margin: '0 0 10px' }}>
          A ju ndihmoi ky artikull?
        </p>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['👍  Po', '👎  Jo'].map((label) => (
            <button key={label} type="button" style={styles.helpfulBtn}>{label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function CategoryView({
  category, onBack, onArticle,
}: { category: Category; onBack: () => void; onArticle: (a: Article) => void }) {
  return (
    <div style={{ padding: '24px 20px 40px', maxWidth: '480px', margin: '0 auto', animation: 'fadeUp .25s ease' }}>
      <button type="button" onClick={onBack} style={styles.backBtn}>
        <ChevronLeft size={17} strokeWidth={2} /> Kthehu
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{ ...styles.catIcon, background: `${category.color}18`, color: category.color }}>
          {category.icon}
        </div>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#f0ede8', letterSpacing: '-0.4px', margin: 0 }}>
            {category.label}
          </h2>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>{category.description}</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {category.articles.map((art, i) => (
          <button
            key={art.id}
            type="button"
            onClick={() => onArticle(art)}
            style={{
              ...styles.articleRow,
              borderTopLeftRadius: i === 0 ? '12px' : '4px',
              borderTopRightRadius: i === 0 ? '12px' : '4px',
              borderBottomLeftRadius: i === category.articles.length - 1 ? '12px' : '4px',
              borderBottomRightRadius: i === category.articles.length - 1 ? '12px' : '4px',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
          >
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#f0ede8' }}>{art.title}</span>
            <ChevronRight size={15} color="rgba(255,255,255,0.25)" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function HelpCenterView() {
  const [search, setSearch]           = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<{ category: Category; article: Article }[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [activeArticle, setActiveArticle]   = useState<Article | null>(null);
  const [openFAQ, setOpenFAQ]         = useState<number | null>(null);
  const [contactSent, setContactSent] = useState(false);
  const [contactText, setContactText] = useState('');
  const [contactLoading, setContactLoading] = useState(false);
  const [contactFocused, setContactFocused] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

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
      setTimeout(() => setContactSent(false), 3000);
    } finally {
      setContactLoading(false);
    }
  };

  const clearSearch = () => { setSearch(''); searchRef.current?.focus(); };

  // ── Article / Category drill-down ─────────────────────────────────────────
  if (activeArticle && activeCategory) {
    return (
      <ArticleView
        article={activeArticle}
        category={activeCategory}
        onBack={() => setActiveArticle(null)}
      />
    );
  }
  if (activeCategory) {
    return (
      <CategoryView
        category={activeCategory}
        onBack={() => setActiveCategory(null)}
        onArticle={(a) => setActiveArticle(a)}
      />
    );
  }

  // ── Main view ─────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .help-root { animation: fadeUp .3s ease; }

        .search-result-row:hover { background: rgba(255,255,255,0.07) !important; }

        .faq-btn { transition: background .15s ease; }
        .faq-btn:hover { background: rgba(255,255,255,0.06) !important; }

        .cat-card { transition: background .15s ease, transform .15s ease; }
        .cat-card:hover { background: rgba(255,255,255,0.07) !important; transform: translateY(-1px); }
        .cat-card:active { transform: scale(.99); }

        textarea::placeholder { color: rgba(255,255,255,0.2); }
        input::placeholder { color: rgba(255,255,255,0.2); }
      `}</style>

      <div className="help-root" style={{ padding: '24px 20px 48px', maxWidth: '480px', margin: '0 auto' }}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#f0ede8', letterSpacing: '-0.6px', margin: 0 }}>
              Qendra e ndihmës
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.22)', borderRadius: '100px', padding: '4px 10px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              <span style={{ fontSize: '11px', fontWeight: '600', color: '#10b981' }}>Online</span>
            </div>
          </div>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', margin: 0, lineHeight: 1.5 }}>
            Si mund t'ju ndihmojmë sot?
          </p>
        </div>

        {/* ── Search ──────────────────────────────────────────────────────── */}
        <div style={{ position: 'relative', marginBottom: '28px' }}>
          <Search size={15} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            ref={searchRef}
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
            placeholder="Kërkoni artikuj, tema, probleme…"
            style={{
              width: '100%',
              padding: '12px 40px 12px 38px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${searchFocused ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.09)'}`,
              color: '#f0ede8',
              fontSize: '14px',
              fontFamily: 'inherit',
              outline: 'none',
              transition: 'border-color .2s ease',
              boxSizing: 'border-box',
            }}
          />
          {search && (
            <button type="button" onClick={clearSearch} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex' }}>
              <X size={14} color="rgba(255,255,255,0.35)" />
            </button>
          )}

          {/* Search dropdown */}
          {search && (
            <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: '#1a1a19', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', overflow: 'hidden', zIndex: 50, boxShadow: '0 12px 32px rgba(0,0,0,0.4)' }}>
              {searchResults.length === 0 ? (
                <div style={{ padding: '20px 16px', textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: '13px' }}>
                  Asnjë rezultat për "{search}"
                </div>
              ) : (
                searchResults.slice(0, 6).map(({ category, article }) => (
                  <button
                    key={article.id}
                    type="button"
                    className="search-result-row"
                    onClick={() => { setSearch(''); setActiveCategory(category); setActiveArticle(article); }}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <BookOpen size={14} color="rgba(255,255,255,0.3)" style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '13px', fontWeight: '500', color: '#f0ede8', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{article.title}</p>
                      <p style={{ fontSize: '11px', color: category.color, margin: 0, opacity: .8 }}>{category.label}</p>
                    </div>
                    <ArrowUpRight size={13} color="rgba(255,255,255,0.2)" />
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* ── Quick actions ────────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '28px' }}>
          {[
            { icon: <MessageSquare size={15} />, label: 'Dërgo feedback', color: '#6366f1', action: () => window.location.href = 'mailto:support@urbani-im.al' },
            { icon: <Bug size={15} />, label: 'Raporto bug', color: '#f97316', action: () => window.location.href = 'mailto:support@urbani-im.al' },
            { icon: <Clock size={15} />, label: 'Oraret', color: '#10b981', action: () => { setActiveCategory(CATEGORIES[2]); } },
            { icon: <Star size={15} />, label: 'Vlerëso appet', color: '#f59e0b', action: () => {} },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={item.action}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 13px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', color: item.color, fontSize: '13px', fontWeight: '500', transition: 'background .15s ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        {/* ── Categories ───────────────────────────────────────────────────── */}
        <section style={{ marginBottom: '32px' }}>
          <p style={styles.sectionLabel}>Kategoritë</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {CATEGORIES.map((cat, i) => (
              <button
                key={cat.id}
                type="button"
                className="cat-card"
                onClick={() => setActiveCategory(cat)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '14px 14px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: i === 0 ? '12px 12px 4px 4px' : i === CATEGORIES.length - 1 ? '4px 4px 12px 12px' : '4px',
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                <div style={{ ...styles.catIcon, background: `${cat.color}18`, color: cat.color, flexShrink: 0 }}>
                  {cat.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#f0ede8', margin: 0, letterSpacing: '-0.2px' }}>{cat.label}</p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>{cat.description}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', fontWeight: '500' }}>{cat.articles.length}</span>
                  <ChevronRight size={15} color="rgba(255,255,255,0.2)" />
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ── FAQ ─────────────────────────────────────────────────────────── */}
        <section style={{ marginBottom: '32px' }}>
          <p style={styles.sectionLabel}>Pyetjet më të shpeshta</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {FAQ.map((item, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: i === 0 ? '12px 12px 4px 4px' : i === FAQ.length - 1 ? '4px 4px 12px 12px' : '4px',
                  overflow: 'hidden',
                }}
              >
                <button
                  type="button"
                  className="faq-btn"
                  onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '14px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                >
                  <span style={{ fontSize: '13px', fontWeight: '500', color: '#f0ede8', lineHeight: 1.4 }}>{item.q}</span>
                  <ChevronDown
                    size={15}
                    color="rgba(255,255,255,0.3)"
                    style={{ flexShrink: 0, transition: 'transform .2s ease', transform: openFAQ === i ? 'rotate(180deg)' : 'none' }}
                  />
                </button>
                {openFAQ === i && (
                  <div style={{ padding: '0 14px 14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, margin: '12px 0 0' }}>{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── Contact support ──────────────────────────────────────────────── */}
        <section style={{ marginBottom: '32px' }}>
          <p style={styles.sectionLabel}>Na kontaktoni</p>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '18px' }}>
            {contactSent ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '24px 0', textAlign: 'center' }}>
                <CheckCircle2 size={32} strokeWidth={1.5} color="#22c55e" />
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#f0ede8', margin: 0 }}>Mesazhi u dërgua!</p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Do t'ju kthehemi brenda 24 orëve.</p>
              </div>
            ) : (
              <>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', margin: '0 0 14px', lineHeight: 1.5 }}>
                  Nuk gjetet çfarë kërkoni? Shkruani drejtpërdrejt ekipit tonë.
                </p>
                <textarea
                  value={contactText}
                  onChange={(e) => setContactText(e.target.value)}
                  onFocus={() => setContactFocused(true)}
                  onBlur={() => setContactFocused(false)}
                  placeholder="Përshkruani problemin ose pyetjen tuaj…"
                  rows={4}
                  disabled={contactLoading}
                  style={{
                    width: '100%', padding: '12px', borderRadius: '10px',
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${contactFocused ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)'}`,
                    color: '#f0ede8', fontSize: '13px', fontFamily: 'inherit',
                    lineHeight: 1.65, resize: 'none', outline: 'none',
                    transition: 'border-color .2s ease', boxSizing: 'border-box',
                  }}
                />
                <button
                  type="button"
                  onClick={handleContact}
                  disabled={!contactText.trim() || contactLoading}
                  style={{
                    width: '100%', marginTop: '10px', padding: '12px',
                    borderRadius: '10px',
                    background: contactText.trim() && !contactLoading ? '#f0ede8' : 'rgba(255,255,255,0.08)',
                    border: '1px solid transparent',
                    color: contactText.trim() && !contactLoading ? '#111' : 'rgba(255,255,255,0.2)',
                    fontSize: '14px', fontWeight: '600', cursor: contactText.trim() && !contactLoading ? 'pointer' : 'not-allowed',
                    transition: 'background .18s ease, color .18s ease',
                  }}
                  onMouseEnter={(e) => { if (contactText.trim() && !contactLoading) e.currentTarget.style.background = '#e0ddd8'; }}
                  onMouseLeave={(e) => { if (contactText.trim() && !contactLoading) e.currentTarget.style.background = '#f0ede8'; }}
                >
                  {contactLoading ? 'Po dërgohet…' : 'Dërgo mesazh'}
                </button>
              </>
            )}
          </div>
        </section>

        {/* ── Support info ─────────────────────────────────────────────────── */}
        <section>
          <p style={styles.sectionLabel}>Informacione kontakti</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {[
              { icon: <Mail size={15} />, label: 'Email suporti', value: 'support@urbani-im.al', color: '#6366f1' },
              { icon: <Clock size={15} />, label: 'Oraret e suportit', value: 'E Hënë – E Premte, 09:00–17:00', color: '#10b981' },
              { icon: <HelpCircle size={15} />, label: 'Koha mesatare e përgjigjes', value: 'Brenda 24 orëve', color: '#f59e0b' },
            ].map((item, i, arr) => (
              <div
                key={item.label}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 14px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: i === 0 ? '12px 12px 4px 4px' : i === arr.length - 1 ? '4px 4px 12px 12px' : '4px',
                }}
              >
                <span style={{ color: item.color, display: 'flex' }}>{item.icon}</span>
                <div>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', margin: 0, fontWeight: '500', letterSpacing: '.03em', textTransform: 'uppercase' }}>{item.label}</p>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', margin: 0, fontWeight: '500' }}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Version note ─────────────────────────────────────────────────── */}
        <p style={{ marginTop: '32px', textAlign: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.15)' }}>
          Urbani IM · v2.4.1 · {new Date().getFullYear()}
        </p>

      </div>
    </>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  backBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '4px',
    background: 'none', border: 'none', padding: '6px 0', marginBottom: '24px',
    color: 'rgba(255,255,255,0.4)', fontSize: '14px', fontWeight: '500',
    cursor: 'pointer', letterSpacing: '0.01em',
  },
  sectionLabel: {
    fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.25)',
    letterSpacing: '.1em', textTransform: 'uppercase', margin: '0 0 8px 2px',
  },
  catIcon: {
    width: '36px', height: '36px', borderRadius: '10px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  categoryDot: {
    display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%',
  },
  tag: {
    padding: '3px 10px', borderRadius: '100px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.09)',
    fontSize: '11px', fontWeight: '500', color: 'rgba(255,255,255,0.4)',
  },
  helpfulBox: {
    padding: '16px', borderRadius: '12px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
  },
  helpfulBtn: {
    padding: '8px 18px', borderRadius: '8px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: '500',
    cursor: 'pointer',
  },
  articleRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: '12px', padding: '14px 14px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.07)',
    cursor: 'pointer', textAlign: 'left', transition: 'background .15s ease',
  },
};
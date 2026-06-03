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
        body: 'Aplikacioni mbështet plotësisht VoiceOver (iOS) and TalkBack (Android). Të gjitha elementet janë të etiketuara për lexues ekrani. Nëse hasni probleme, na raportoni dhe do të rregullojmë me prioritet.',
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

      <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', letterSpacing: '-0.5px', lineHeight: 1.25, margin: '0 0 20px' }}>
        {article.title}
      </h2>

      <p style={{ fontSize: '15px', color: '#374151', lineHeight: 1.8, margin: '0 0 32px', whiteSpace: 'pre-line' }}>
        {article.body}
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '40px' }}>
        {article.tags.map((tag) => (
          <span key={tag} className="tag-badge">#{tag}</span>
        ))}
      </div>

      <div className="helpful-card">
        <p style={{ fontSize: '14px', fontWeight: '600', color: '#4b5563', margin: '0 0 14px' }}>
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
  return (
    <div className="animate-fade-up" style={{ padding: '8px 0 40px' }}>
      <button type="button" onClick={onBack} className="back-button" id="btn-back-to-main">
        <ChevronLeft size={16} strokeWidth={2.5} /> Kthehu në faqen kryesore
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
        <div className="cat-icon-container">
          {category.icon}
        </div>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', letterSpacing: '-0.5px', margin: 0 }}>
            {category.label}
          </h2>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: '2px 0 0' }}>{category.description}</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {category.articles.map((art) => (
          <button
            key={art.id}
            type="button"
            onClick={() => onArticle(art)}
            className="monochrome-card"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              padding: '16px 20px',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              <BookOpen size={15} color="#4b5563" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {art.title}
              </span>
            </div>
            <ChevronRight size={15} color="#9ca3af" style={{ flexShrink: 0 }} />
          </button>
        ))}
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
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [contactSent, setContactSent] = useState(false);
  const [contactText, setContactText] = useState('');
  const [contactLoading, setContactLoading] = useState(false);
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
      setTimeout(() => setContactSent(false), 4000);
    } catch (e) {
      console.error('Failed to submit feedback', e);
    } finally {
      setContactLoading(false);
    }
  };

  const clearSearch = () => { setSearch(''); searchRef.current?.focus(); };

  // ── Render view conditional logic ─────────────────────────────────────────
  const renderContent = () => {
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

    return (
      <div className="animate-fade-up">
        {/* ── Search ──────────────────────────────────────────────────────── */}
        <div style={{ position: 'relative', marginBottom: '28px' }}>
          <div className="search-box">
            <Search size={16} className="search-icon-left" />
            <input
              ref={searchRef}
              id="input-search-help"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              placeholder="Kërkoni artikuj, tema ose pyetje..."
              className="search-input"
            />
            {search && (
              <button
                type="button"
                onClick={clearSearch}
                id="btn-clear-search"
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={15} color="#9ca3af" />
              </button>
            )}
          </div>

          {/* Search dropdown results */}
          {search && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                right: 0,
                background: '#ffffff',
                border: '1px solid #d1d5db',
                borderRadius: '10px',
                overflow: 'hidden',
                zIndex: 100,
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
              }}
            >
              {searchResults.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280', fontSize: '13.5px' }}>
                  Nuk u gjet asnjë rezultat për "<span style={{ color: '#111827', fontWeight: '600' }}>{search}</span>"
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
                      padding: '12px 18px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      borderBottom: '1px solid #e5e7eb',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#f9fafb'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <BookOpen size={15} color="#4b5563" style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '13.5px', fontWeight: '500', color: '#111827', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {article.title}
                      </p>
                      <p style={{ fontSize: '11px', color: '#6b7280', margin: '2px 0 0', fontWeight: '500' }}>
                        {category.label}
                      </p>
                    </div>
                    <ArrowUpRight size={13} color="#9ca3af" />
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* ── Quick actions ────────────────────────────────────────────────── */}
        <div className="actions-grid">
          {[
            { icon: <MessageSquare size={16} />, label: 'Feedback', action: () => window.location.href = 'mailto:support@urbani-im.al' },
            { icon: <Bug size={16} />, label: 'Raporto Bug', action: () => window.location.href = 'mailto:support@urbani-im.al' },
            { icon: <Clock size={16} />, label: 'Oraret', action: () => { setActiveCategory(CATEGORIES[2]); } },
            { icon: <Star size={16} />, label: 'Vlerëso', action: () => { } },
          ].map((item, idx) => (
            <button
              key={item.label}
              type="button"
              onClick={item.action}
              id={`btn-quick-action-${idx}`}
              className="action-btn"
            >
              <span style={{ display: 'flex', padding: '6px', borderRadius: '50%' }}>{item.icon}</span>
              <span style={{ fontSize: '12px', fontWeight: '600' }}>{item.label}</span>
            </button>
          ))}
        </div>

        {/* ── Categories ───────────────────────────────────────────────────── */}
        <section style={{ marginBottom: '36px' }}>
          <h2 style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', letterSpacing: '.1em', textTransform: 'uppercase', margin: '0 0 10px 2px' }}>
            Kategoritë e ndihmës
          </h2>
          <div className="category-list">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className="monochrome-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px 18px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                }}
              >
                <div className="cat-icon-container">
                  {cat.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: 0, letterSpacing: '-0.1px' }}>{cat.label}</p>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {cat.description}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#4b5563', fontWeight: '600', background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
                    {cat.articles.length}
                  </span>
                  <ChevronRight size={15} color="#9ca3af" />
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ── FAQ ─────────────────────────────────────────────────────────── */}
        <section style={{ marginBottom: '36px' }}>
          <h2 style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', letterSpacing: '.1em', textTransform: 'uppercase', margin: '0 0 10px 2px' }}>
            Pyetjet më të shpeshta (FAQ)
          </h2>
          <div className="faq-list">
            {FAQ.map((item, i) => {
              const isOpen = openFAQ === i;
              return (
                <div key={i} className="monochrome-card" style={{ overflow: 'hidden' }}>
                  <button
                    type="button"
                    onClick={() => setOpenFAQ(isOpen ? null : i)}
                    id={`btn-faq-trigger-${i}`}
                    className="faq-header-btn"
                  >
                    <span style={{ fontSize: '13.5px', fontWeight: '600', color: '#111827', lineHeight: 1.4 }}>{item.q}</span>
                    <ChevronDown
                      size={15}
                      color="#6b7280"
                      style={{ flexShrink: 0, transition: 'transform 0.2s ease', transform: isOpen ? 'rotate(180deg)' : 'none' }}
                    />
                  </button>
                  <div className={`faq-answer-container ${isOpen ? 'open' : ''}`} style={{ borderTop: isOpen ? '1px solid #e5e7eb' : 'none' }}>
                    <div className="faq-answer-content">
                      {item.a}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Contact form ─────────────────────────────────────────────────── */}
        <section style={{ marginBottom: '36px' }}>
          <h2 style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', letterSpacing: '.1em', textTransform: 'uppercase', margin: '0 0 10px 2px' }}>
            Na kontaktoni
          </h2>
          <div className="monochrome-card" style={{ padding: '20px' }}>
            {contactSent ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '16px 0', textAlign: 'center' }}>
                <div style={{ display: 'flex', padding: '10px', borderRadius: '50%', background: '#f3f4f6', border: '1px solid #d1d5db' }}>
                  <CheckCircle2 size={28} color="#111827" strokeWidth={2} />
                </div>
                <p style={{ fontSize: '14.5px', fontWeight: '700', color: '#111827', margin: 0 }}>Mesazhi u dërgua me sukses!</p>
                <p style={{ fontSize: '12.5px', color: '#6b7280', margin: 0, maxWidth: '280px', lineHeight: 1.5 }}>
                  Ekipi ynë do t'ju kthejë përgjigje brenda 24 orëve.
                </p>
              </div>
            ) : (
              <>
                <p style={{ fontSize: '13px', color: '#4b5563', margin: '0 0 14px', lineHeight: 1.5 }}>
                  Nuk gjetët përgjigje? Na shkruani drejtpërdrejt.
                </p>
                <textarea
                  id="textarea-feedback"
                  value={contactText}
                  onChange={(e) => setContactText(e.target.value)}
                  placeholder="Përshkruani pyetjen ose problematikën tuaj këtu..."
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
                >
                  {contactLoading ? 'Po dërgohet...' : 'Dërgo mesazh'}
                </button>
              </>
            )}
          </div>
        </section>

        {/* ── Support Info Grid ────────────────────────────────────────────── */}
        <section style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', letterSpacing: '.1em', textTransform: 'uppercase', margin: '0 0 10px 2px' }}>
            Informacioni i kontaktit
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { icon: <Mail size={15} />, label: 'Email mbështetës', value: 'support@urbani-im.al' },
              { icon: <Clock size={15} />, label: 'Orari i punës', value: 'E Hënë – E Premte, 09:00–17:00' },
              { icon: <HelpCircle size={15} />, label: 'Koha mesatare', value: 'Brenda 24 orëve' },
            ].map((item, idx) => (
              <div key={idx} className="support-item">
                <span style={{ display: 'flex', padding: '8px', borderRadius: '8px', background: '#f3f4f6', color: '#111827', flexShrink: 0 }}>
                  {item.icon}
                </span>
                <div>
                  <p style={{ fontSize: '9px', color: '#6b7280', margin: 0, fontWeight: '700', letterSpacing: '.04em', textTransform: 'uppercase' }}>
                    {item.label}
                  </p>
                  <p style={{ fontSize: '13px', color: '#374151', margin: '1px 0 0', fontWeight: '500' }}>
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  };

  return (
    <div className="help-wrapper">
      <style>{`
        /* Global Reset and Styles for Help Center Monochrome Theme */
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        
        .help-wrapper {
          background: #ffffff;
          min-height: 100vh;
          color: #111827;
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          width: 100%;
          padding: 48px 20px 80px;
          box-sizing: border-box;
          overflow-y: auto;
        }

        .help-container {
          max-width: 640px;
          margin: 0 auto;
        }

        /* Scrollbar styling */
        .help-wrapper::-webkit-scrollbar {
          width: 6px;
        }
        .help-wrapper::-webkit-scrollbar-track {
          background: #ffffff;
        }
        .help-wrapper::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 9999px;
        }
        .help-wrapper::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }

        /* Animations */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-up {
          animation: fadeUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        /* Clean Monochrome Cards */
        .monochrome-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .monochrome-card:hover {
          border-color: #9ca3af;
          background: #f9fafb;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
        }
        
        .monochrome-card:active {
          transform: translateY(0);
        }

        /* Header status badge */
        .status-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          border-radius: 9999px;
          padding: 4px 10px;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #111827;
        }

        /* Search styling rules */
        .search-box {
          position: relative;
          width: 100%;
        }

        .search-input {
          width: 100%;
          padding: 14px 44px;
          border-radius: 10px;
          background: #ffffff;
          border: 1px solid #d1d5db;
          color: #111827;
          font-size: 14.5px;
          outline: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
          font-family: inherit;
        }

        .search-input:focus {
          border-color: #111827;
          box-shadow: 0 0 0 2px rgba(17, 24, 39, 0.05);
        }

        .search-icon-left {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: #6b7280;
          transition: color 0.2s ease;
        }

        .search-input:focus ~ .search-icon-left {
          color: #111827;
        }

        /* Quick actions layout */
        .actions-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          margin-bottom: 28px;
        }

        @media (min-width: 480px) {
          .actions-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        .action-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 10px;
          border-radius: 10px;
          cursor: pointer;
          text-align: center;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          transition: all 0.2s ease;
          color: #374151;
          font-family: inherit;
        }

        .action-btn:hover {
          background: #f9fafb;
          border-color: #9ca3af;
          color: #111827;
          transform: translateY(-1px);
        }
        
        .action-btn:active {
          transform: translateY(0);
        }

        /* Category layouts */
        .category-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .cat-icon-container {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          color: #111827;
          flex-shrink: 0;
        }

        /* FAQ Accordion mechanics */
        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .faq-header-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 14px 18px;
          background: transparent;
          border: none;
          cursor: pointer;
          text-align: left;
          color: #111827;
          font-family: inherit;
        }

        .faq-answer-container {
          overflow: hidden;
          max-height: 0;
          opacity: 0;
          transition: max-height 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.2s ease;
        }

        .faq-answer-container.open {
          max-height: 250px;
          opacity: 1;
        }

        .faq-answer-content {
          padding: 0 18px 14px;
          color: #4b5563;
          font-size: 13.5px;
          line-height: 1.6;
        }

        /* Forms styling */
        .contact-textarea {
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          background: #ffffff;
          border: 1px solid #d1d5db;
          color: #111827;
          font-size: 14px;
          font-family: inherit;
          line-height: 1.6;
          resize: none;
          outline: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }

        .contact-textarea:focus {
          border-color: #111827;
          box-shadow: 0 0 0 2px rgba(17, 24, 39, 0.05);
        }

        .contact-submit-btn {
          width: 100%;
          margin-top: 10px;
          padding: 12px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s ease;
          border: none;
          font-family: inherit;
        }

        .contact-submit-btn.active {
          background: #111827;
          color: #ffffff;
          cursor: pointer;
        }

        .contact-submit-btn.active:hover {
          background: #1f2937;
        }

        .contact-submit-btn.inactive {
          background: #f3f4f6;
          color: #9ca3af;
          cursor: not-allowed;
        }

        /* Drilldown sub-elements styles */
        .back-button {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: none;
          border: none;
          padding: 6px 0;
          margin-bottom: 20px;
          color: #6b7280;
          font-size: 13.5px;
          font-weight: 500;
          cursor: pointer;
          transition: color 0.15s ease;
          font-family: inherit;
        }

        .back-button:hover {
          color: #111827;
        }

        .tag-badge {
          padding: 3px 10px;
          border-radius: 9999px;
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          font-size: 11px;
          color: #4b5563;
        }

        .helpful-card {
          padding: 20px;
          border-radius: 12px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          text-align: center;
        }

        .helpful-btn {
          padding: 8px 16px;
          border-radius: 8px;
          background: #ffffff;
          border: 1px solid #d1d5db;
          color: #374151;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: inherit;
        }

        .helpful-btn:hover {
          background: #f9fafb;
          border-color: #9ca3af;
          color: #111827;
        }

        .support-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
        }
        
        /* Input overrides */
        input::-webkit-search-cancel-button {
          display: none;
        }
      `}</style>

      <div className="help-container">
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <header style={{ marginBottom: '28px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', letterSpacing: '-0.6px', margin: 0 }}>
              Qendra e Ndihmës
            </h1>
            <p style={{ fontSize: '13.5px', color: '#6b7280', margin: '4px 0 0', lineHeight: 1.5 }}>
              Gjeni përgjigje të shpejta ose na shkruani direkt për çdo pyetje.
            </p>
          </div>
          <div className="status-badge" style={{ flexShrink: 0 }}>
            <span className="status-dot" />
            <span style={{ fontSize: '11px', fontWeight: '600', color: '#374151' }}>Suporti Aktiv</span>
          </div>
        </header>

        {/* ── Sub-view / Page content ──────────────────────────────────────── */}
        <main>
          {renderContent()}
        </main>

        {/* ── Version & Copyright footer ───────────────────────────────────── */}
        <footer style={{ marginTop: '40px', borderTop: '1px solid #e5e7eb', paddingTop: '20px', textAlign: 'center' }}>
          <p style={{ fontSize: '11.5px', color: '#9ca3af', margin: 0 }}>
            Urbani IM · versioni v2.5.0 · © {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </div>
  );
}
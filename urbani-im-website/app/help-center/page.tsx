'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Search, ChevronRight, ChevronDown, ChevronLeft,
  MapPin, Bus, Bell, User, WifiOff, Zap,
  MessageSquare, Mail, Bug, HelpCircle, BookOpen,
  Shield, Smartphone, Clock, Star, ArrowUpRight,
  X, CheckCircle2, Wifi,
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
    icon: <Zap size={20} strokeWidth={2} />,
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
    icon: <MapPin size={20} strokeWidth={2} />,
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
    icon: <Bus size={20} strokeWidth={2} />,
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
    icon: <Bell size={20} strokeWidth={2} />,
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
    icon: <User size={20} strokeWidth={2} />,
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
    icon: <Smartphone size={20} strokeWidth={2} />,
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
    icon: <WifiOff size={20} strokeWidth={2} />,
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
    icon: <Shield size={20} strokeWidth={2} />,
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
    <article className="animate-fade-up" style={{ padding: '0 0 40px' }}>
      <button type="button" onClick={onBack} className="back-button" id="btn-back-to-category">
        <ChevronLeft size={16} strokeWidth={2.5} /> Kthehu te kategoritë
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: category.color }} />
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: '600', letterSpacing: '.05em', textTransform: 'uppercase' }}>
          {category.label}
        </span>
      </div>

      <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#f0ede8', letterSpacing: '-0.5px', lineHeight: 1.25, margin: '0 0 20px' }}>
        {article.title}
      </h2>

      <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, margin: '0 0 32px', whiteSpace: 'pre-line' }}>
        {article.body}
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '40px' }}>
        {article.tags.map((tag) => (
          <span key={tag} className="tag-badge">#{tag}</span>
        ))}
      </div>

      <div className="helpful-card">
        <p style={{ fontSize: '14px', fontWeight: '600', color: 'rgba(255,255,255,0.6)', margin: '0 0 14px' }}>
          A ju ndihmoi ky artikull?
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          {['👍  Po, faleminderit', '👎  Jo, ende kam pyetje'].map((label, index) => (
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
    <div className="animate-fade-up" style={{ padding: '0 0 40px' }}>
      <button type="button" onClick={onBack} className="back-button" id="btn-back-to-main">
        <ChevronLeft size={16} strokeWidth={2.5} /> Kthehu në faqen kryesore
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <div className="cat-icon-container" style={{ background: `${category.color}15`, color: category.color, border: `1px solid ${category.color}25` }}>
          {category.icon}
        </div>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#f0ede8', letterSpacing: '-0.5px', margin: 0 }}>
            {category.label}
          </h2>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>{category.description}</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {category.articles.map((art) => (
          <button
            key={art.id}
            type="button"
            onClick={() => onArticle(art)}
            className="glass-card"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              padding: '18px 20px',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
              <BookOpen size={16} color={category.color} style={{ flexShrink: 0, opacity: 0.8 }} />
              <span style={{ fontSize: '14.5px', fontWeight: '500', color: '#f0ede8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {art.title}
              </span>
            </div>
            <ChevronRight size={16} color="rgba(255,255,255,0.25)" style={{ flexShrink: 0 }} />
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
        <div style={{ position: 'relative', marginBottom: '32px' }}>
          <div className="search-box">
            <Search size={18} className="search-icon-left" />
            <input
              ref={searchRef}
              id="input-search-help"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              placeholder="Kërkoni artikuj, tema ose orare..."
              className="search-input"
            />
            {search && (
              <button
                type="button"
                onClick={clearSearch}
                id="btn-clear-search"
                style={{
                  position: 'absolute',
                  right: '16px',
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
                <X size={16} color="rgba(255,255,255,0.4)" />
              </button>
            )}
          </div>

          {/* Search dropdown results */}
          {search && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                right: 0,
                background: 'rgba(20, 20, 19, 0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '14px',
                overflow: 'hidden',
                zIndex: 100,
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
              }}
            >
              {searchResults.length === 0 ? (
                <div style={{ padding: '24px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
                  Nuk u gjet asnjë rezultat për "<span style={{ color: '#FF6B35', fontWeight: '500' }}>{search}</span>"
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
                      gap: '14px',
                      padding: '14px 20px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      transition: 'background 0.2s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <BookOpen size={16} color={category.color} style={{ flexShrink: 0, opacity: 0.8 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '13.5px', fontWeight: '500', color: '#f0ede8', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {article.title}
                      </p>
                      <p style={{ fontSize: '11px', color: category.color, margin: '2px 0 0', opacity: 0.8, fontWeight: '500' }}>
                        {category.label}
                      </p>
                    </div>
                    <ArrowUpRight size={14} color="rgba(255,255,255,0.25)" />
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* ── Quick actions ────────────────────────────────────────────────── */}
        <div className="actions-grid">
          {[
            { icon: <MessageSquare size={16} />, label: 'Feedback', color: '#6366f1', action: () => window.location.href = 'mailto:support@urbani-im.al' },
            { icon: <Bug size={16} />, label: 'Raporto Bug', color: '#f97316', action: () => window.location.href = 'mailto:support@urbani-im.al' },
            { icon: <Clock size={16} />, label: 'Oraret', color: '#10b981', action: () => { setActiveCategory(CATEGORIES[2]); } },
            { icon: <Star size={16} />, label: 'Vlerëso', color: '#f59e0b', action: () => { } },
          ].map((item, idx) => (
            <button
              key={item.label}
              type="button"
              onClick={item.action}
              id={`btn-quick-action-${idx}`}
              className="glass-card action-btn"
              style={{ color: item.color }}
            >
              <span style={{ display: 'flex', padding: '8px', borderRadius: '50%', background: `${item.color}12` }}>{item.icon}</span>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#f0ede8' }}>{item.label}</span>
            </button>
          ))}
        </div>

        {/* ── Categories ───────────────────────────────────────────────────── */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.3)', letterSpacing: '.12em', textTransform: 'uppercase', margin: '0 0 12px 4px' }}>
            Kategoritë e ndihmës
          </h2>
          <div className="category-list">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className="glass-card category-card-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px 20px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                }}
              >
                <div className="cat-icon-container" style={{ background: `${cat.color}15`, color: cat.color, border: `1px solid ${cat.color}25` }}>
                  {cat.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '14.5px', fontWeight: '600', color: '#f0ede8', margin: 0, letterSpacing: '-0.1px' }}>{cat.label}</p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {cat.description}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', fontWeight: '600', background: 'rgba(255,255,255,0.03)', padding: '2px 6px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    {cat.articles.length}
                  </span>
                  <ChevronRight size={16} color="rgba(255,255,255,0.2)" />
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ── FAQ ─────────────────────────────────────────────────────────── */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.3)', letterSpacing: '.12em', textTransform: 'uppercase', margin: '0 0 12px 4px' }}>
            Pyetjet më të shpeshta (FAQ)
          </h2>
          <div className="faq-list">
            {FAQ.map((item, i) => {
              const isOpen = openFAQ === i;
              return (
                <div key={i} className="glass-card" style={{ overflow: 'hidden' }}>
                  <button
                    type="button"
                    onClick={() => setOpenFAQ(isOpen ? null : i)}
                    id={`btn-faq-trigger-${i}`}
                    className="faq-header-btn"
                  >
                    <span style={{ fontSize: '13.5px', fontWeight: '600', color: '#f0ede8', lineHeight: 1.4 }}>{item.q}</span>
                    <ChevronDown
                      size={16}
                      color="rgba(255,255,255,0.4)"
                      style={{ flexShrink: 0, transition: 'transform 0.25s ease', transform: isOpen ? 'rotate(180deg)' : 'none' }}
                    />
                  </button>
                  <div className={`faq-answer-container ${isOpen ? 'open' : ''}`} style={{ borderTop: isOpen ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
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
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.3)', letterSpacing: '.12em', textTransform: 'uppercase', margin: '0 0 12px 4px' }}>
            Na kontaktoni
          </h2>
          <div className="glass-card" style={{ padding: '24px' }}>
            {contactSent ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '20px 0', textAlign: 'center' }}>
                <div style={{ display: 'flex', padding: '12px', borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', animation: 'checkmark 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards' }}>
                  <CheckCircle2 size={32} color="#22c55e" strokeWidth={1.5} />
                </div>
                <p style={{ fontSize: '15px', fontWeight: '700', color: '#f0ede8', margin: 0 }}>Mesazhi u dërgua me sukses!</p>
                <p style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.4)', margin: 0, maxWidth: '280px', lineHeight: 1.5 }}>
                  Ekipi ynë i mbështetjes do t'ju përgjigjet brenda 24 orëve në adresën tuaj.
                </p>
              </div>
            ) : (
              <>
                <p style={{ fontSize: '13.5px', color: 'rgba(255,255,255,0.5)', margin: '0 0 16px', lineHeight: 1.6 }}>
                  Nuk e gjetët përgjigjen që kërkonit? Shkruani drejtpërdrejt te ne.
                </p>
                <textarea
                  id="textarea-feedback"
                  value={contactText}
                  onChange={(e) => setContactText(e.target.value)}
                  placeholder="Përshkruani pyetjen ose problematikën tuaj në detaje..."
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
          <h2 style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.3)', letterSpacing: '.12em', textTransform: 'uppercase', margin: '0 0 12px 4px' }}>
            Informacioni i kontaktit
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { icon: <Mail size={16} />, label: 'Email zyrtar i mbështetjes', value: 'support@urbani-im.al', color: '#6366f1' },
              { icon: <Clock size={16} />, label: 'Orari i shërbimit', value: 'E Hënë – E Premte, 09:00–17:00', color: '#10b981' },
              { icon: <HelpCircle size={16} />, label: 'Koha e parashikuar e përgjigjes', value: 'Zakonisht brenda 24 orëve', color: '#f59e0b' },
            ].map((item, idx) => (
              <div key={idx} className="support-item">
                <span style={{ display: 'flex', padding: '10px', borderRadius: '10px', background: `${item.color}12`, color: item.color, flexShrink: 0 }}>
                  {item.icon}
                </span>
                <div>
                  <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', margin: 0, fontWeight: '700', letterSpacing: '.04em', textTransform: 'uppercase' }}>
                    {item.label}
                  </p>
                  <p style={{ fontSize: '13.5px', color: 'rgba(255,255,255,0.75)', margin: '2px 0 0', fontWeight: '500' }}>
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
        /* Import font family and setup reset for standard look inside custom wrapper */
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        
        .help-wrapper {
          background: #111110;
          min-height: 100vh;
          color: #f0ede8;
          font-family: 'Plus Jakarta Sans', sans-serif;
          width: 100%;
          padding: 48px 20px 80px;
          box-sizing: border-box;
          overflow-y: auto;
        }

        .help-container {
          max-width: 640px;
          margin: 0 auto;
        }

        /* Custom scrollbar matching styling theme */
        .help-wrapper::-webkit-scrollbar {
          width: 6px;
        }
        .help-wrapper::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.01);
        }
        .help-wrapper::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 9999px;
        }
        .help-wrapper::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        /* Animations */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse {
          0% { transform: scale(0.92); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
          100% { transform: scale(0.92); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        @keyframes checkmark {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }

        .animate-fade-up {
          animation: fadeUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        /* Glassmorphism Cards styling */
        .glass-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 16px;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .glass-card:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.12);
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
        }
        
        .glass-card:active {
          transform: translateY(0) scale(0.995);
        }

        /* Header status badge */
        .header-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.15);
          border-radius: 9999px;
          padding: 5px 12px;
        }

        .pulse-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10b981;
          animation: pulse 2.2s infinite;
        }

        /* Search styling layout rules */
        .search-box {
          position: relative;
          width: 100%;
        }

        .search-input {
          width: 100%;
          padding: 16px 48px 16px 48px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #f0ede8;
          font-size: 14.5px;
          outline: none;
          transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          box-sizing: border-box;
          font-family: inherit;
        }

        .search-input:focus {
          background: rgba(255, 255, 255, 0.05);
          border-color: #FF6B35;
          box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.15);
        }

        .search-icon-left {
          position: absolute;
          left: 18px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: rgba(255, 255, 255, 0.35);
          transition: all 0.25s ease;
        }

        .search-input:focus ~ .search-icon-left {
          color: #FF6B35;
        }

        /* Quick actions layout */
        .actions-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-bottom: 32px;
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
          padding: 16px 12px;
          border-radius: 14px;
          cursor: pointer;
          text-align: center;
          background: rgba(255, 255, 255, 0.015);
          transition: all 0.22s ease;
        }

        .action-btn:hover {
          transform: translateY(-3px);
        }
        
        .action-btn svg {
          transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        .action-btn:hover svg {
          transform: scale(1.1) rotate(5deg);
        }

        /* Category layouts */
        .category-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .cat-icon-container {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.22s ease;
        }

        .category-card-item:hover .cat-icon-container {
          transform: scale(1.08);
        }

        /* FAQ Accordion mechanics */
        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .faq-header-btn {
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
          color: #f0ede8;
          font-family: inherit;
        }

        .faq-answer-container {
          overflow: hidden;
          max-height: 0;
          opacity: 0;
          transition: max-height 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.22s ease;
        }

        .faq-answer-container.open {
          max-height: 300px;
          opacity: 1;
        }

        .faq-answer-content {
          padding: 0 20px 18px;
          color: rgba(255, 255, 255, 0.55);
          font-size: 13.5px;
          line-height: 1.65;
        }

        /* Forms styling */
        .contact-textarea {
          width: 100%;
          padding: 16px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #f0ede8;
          font-size: 14px;
          font-family: inherit;
          line-height: 1.6;
          resize: none;
          outline: none;
          transition: all 0.25s ease;
          box-sizing: border-box;
        }

        .contact-textarea:focus {
          background: rgba(255, 255, 255, 0.03);
          border-color: #FF6B35;
          box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.15);
        }

        .contact-submit-btn {
          width: 100%;
          margin-top: 12px;
          padding: 14px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.25s ease;
          border: none;
          font-family: inherit;
        }

        .contact-submit-btn.active {
          background: #FF6B35;
          color: #ffffff;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(255, 107, 53, 0.25);
        }

        .contact-submit-btn.active:hover {
          background: #ff7e50;
          box-shadow: 0 6px 20px rgba(255, 107, 53, 0.35);
        }

        .contact-submit-btn.inactive {
          background: rgba(255, 255, 255, 0.04);
          color: rgba(255, 255, 255, 0.2);
          cursor: not-allowed;
        }

        /* Drilldown sub-elements styles */
        .back-button {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          padding: 8px 0;
          margin-bottom: 24px;
          color: rgba(255, 255, 255, 0.45);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: color 0.2s ease;
          font-family: inherit;
        }

        .back-button:hover {
          color: #FF6B35;
        }

        .tag-badge {
          padding: 4px 12px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          font-size: 11.5px;
          color: rgba(255, 255, 255, 0.45);
        }

        .helpful-card {
          padding: 24px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid rgba(255, 255, 255, 0.06);
          text-align: center;
        }

        .helpful-btn {
          padding: 10px 20px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.7);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .helpful-btn:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.12);
          color: #ffffff;
        }

        .support-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 14px 20px;
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 14px;
        }
        
        /* Input overrides */
        input::-webkit-search-cancel-button {
          display: none;
        }
      `}</style>

      <div className="help-container">
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <header style={{ marginBottom: '32px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#f0ede8', letterSpacing: '-0.8px', margin: 0 }}>
              Qendra e Ndihmës
            </h1>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', margin: '6px 0 0', lineHeight: 1.5 }}>
              Gjeni përgjigje të shpejta ose na shkruani për mbështetje teknike.
            </p>
          </div>
          <div className="header-badge" style={{ flexShrink: 0 }}>
            <span className="pulse-dot" />
            <span style={{ fontSize: '11.5px', fontWeight: '600', color: '#10b981', letterSpacing: '0.02em' }}>Suporti Online</span>
          </div>
        </header>

        {/* ── Sub-view / Page content ──────────────────────────────────────── */}
        <main>
          {renderContent()}
        </main>

        {/* ── Version & Copyright footer ───────────────────────────────────── */}
        <footer style={{ marginTop: '48px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '24px', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', margin: 0 }}>
            Urbani IM · versioni v2.5.0 · © {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </div>
  );
}
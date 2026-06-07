'use client';

import { useState, useRef, useEffect } from 'react';
import { IonIcon } from '@/app/components/common/IonIcon';
import {
  searchOutline, chevronDownOutline, chevronBackOutline, pinOutline,
  busOutline, notificationsOutline, personOutline, wifiOutline,
  flashOutline, chatbubbleOutline, mailOutline, helpCircleOutline,
  bookOutline, shieldCheckmarkOutline, phonePortraitOutline, timeOutline,
  openOutline, closeOutline, checkmarkCircleOutline, thumbsUpOutline,
  thumbsDownOutline, chatbubbleEllipsesOutline
} from 'ionicons/icons';

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
    icon: <IonIcon icon={flashOutline} style={{ fontSize: 24 }} />,
    label: 'Fillimi i shpejtë',
    description: 'Konfigurimi i parë i aplikacionit dhe llogaria',
    color: '#f97316',
    articles: [
      {
        id: 'f1', title: 'Si të krijoni një llogari', tags: ['llogari', 'regjistrim', 'profil'],
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
    icon: <IonIcon icon={pinOutline} style={{ fontSize: 24 }} />,
    label: 'Planifikimi i udhëtimit',
    description: 'Përdorimi i hartës live dhe gjetja e rrugëve',
    color: '#f97316',
    articles: [
      {
        id: 'u1', title: 'Si të planifikoni një udhëtim nga A në B', tags: ['udhëtim', 'planifikim', 'rrugë'],
        body: 'Trokitni ikonën e kërkimit → shkruani destinacionin. Aplikacioni do të tregojë opsionet më të mira: linja direkte, me ndërrim, dhe kohën e parashikuar. Mund të zgjidhni sipas kohës më të shkurtër ose numrit të ndërrimit.',
      },
      {
        id: 'u2', title: 'Si të lexoni hartën live', tags: ['hartë', 'live', 'autobus', 'gps'],
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
    icon: <IonIcon icon={busOutline} style={{ fontSize: 24 }} />,
    label: 'Linjat & oraret',
    description: 'Itineraret zyrtare dhe statusi aktual',
    color: '#f97316',
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
    icon: <IonIcon icon={notificationsOutline} style={{ fontSize: 24 }} />,
    label: 'Njoftimet',
    description: 'Konfigurimi i alarmeve dhe lajmërimeve',
    color: '#f97316',
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
    icon: <IonIcon icon={personOutline} style={{ fontSize: 24 }} />,
    label: 'Llogaria & profili',
    description: 'Menaxhimi i profilit dhe të dhënave personale',
    color: '#f97316',
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
    icon: <IonIcon icon={phonePortraitOutline} style={{ fontSize: 24 }} />,
    label: 'Probleme teknike',
    description: 'Zgjidhja e problemeve me GPS dhe hartën',
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
    icon: <IonIcon icon={wifiOutline} style={{ fontSize: 24 }} />,
    label: 'Offline & bateria',
    description: 'Përdorimi pa internet dhe kursimi i baterisë',
    color: '#f97316',
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
    icon: <IonIcon icon={shieldCheckmarkOutline} style={{ fontSize: 24 }} />,
    label: 'Aksesibiliteti',
    description: 'Lexuesit e ekranit dhe kontrastet vizuale',
    color: '#f97316',
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

const POPULAR_KEYWORDS = ['orari', 'harta', 'gps', 'biletat', 'llogaria'];

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
  article, category, onBack, onVoteUp, onVoteDown, voteStatus
}: {
  article: Article;
  category: Category;
  onBack: () => void;
  onVoteUp: () => void;
  onVoteDown: () => void;
  voteStatus: 'none' | 'up' | 'down';
}) {
  return (
    <article className="animate-fade-up bg-white border border-slate-200/80 p-6 md:p-10 rounded-3xl shadow-sm max-w-3xl mx-auto my-4 transition-all duration-300 hover:shadow-md relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700"></div>

      <button type="button" onClick={onBack} className="back-button mb-6 text-slate-500 hover:text-orange-600 font-semibold text-sm transition-colors duration-200 flex items-center gap-1.5" id="btn-back-to-category">
        <IonIcon icon={chevronBackOutline} style={{ fontSize: 16 }} /> Kthehu te kategoritë
      </button>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 bg-orange-50 text-orange-600 rounded-full border border-orange-100/60">{category.label}</span>
      </div>

      <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug mb-6">
        {article.title}
      </h2>

      <div className="text-sm md:text-base text-slate-600 leading-relaxed mb-8 whitespace-pre-line space-y-4">
        {article.body}
      </div>

      <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-100 pb-8">
        {article.tags.map((tag) => (
          <span key={tag} className="text-xs px-2.5 py-1 bg-slate-50 border border-slate-200/60 text-slate-500 rounded-lg">#{tag}</span>
        ))}
      </div>

      <div className="helpful-container bg-slate-50/70 border border-slate-100 rounded-2xl p-6 text-center">
        {voteStatus === 'none' && (
          <>
            <p className="text-sm font-bold text-slate-800 mb-4">
              A ju ndihmoi ky artikull?
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={onVoteUp}
                className="helpful-btn flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-slate-200 hover:border-orange-500 hover:bg-orange-50/20 text-slate-600 hover:text-orange-600 font-semibold text-xs transition-all duration-200 hover:-translate-y-0.5"
                id="btn-helpful-yes"
              >
                <IonIcon icon={thumbsUpOutline} style={{ fontSize: 14 }} /> Po, faleminderit
              </button>
              <button
                type="button"
                onClick={onVoteDown}
                className="helpful-btn flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-slate-200 hover:border-amber-500 hover:bg-amber-50/20 text-slate-600 hover:text-amber-600 font-semibold text-xs transition-all duration-200 hover:-translate-y-0.5"
                id="btn-helpful-no"
              >
                <IonIcon icon={thumbsDownOutline} style={{ fontSize: 14 }} /> Jo, kam pyetje
              </button>
            </div>
          </>
        )}
        {voteStatus === 'up' && (
          <div className="text-orange-600 flex flex-col items-center gap-2 py-2 animate-fade-up">
            <IonIcon icon={checkmarkCircleOutline} style={{ fontSize: 32 }} />
            <p className="text-sm font-bold">Ju faleminderit për feedback-un!</p>
            <p className="text-xs text-slate-400">Vlerësimi juaj na ndihmon të përmirësojmë udhëzuesit tanë.</p>
          </div>
        )}
        {voteStatus === 'down' && (
          <div className="text-amber-600 flex flex-col items-center gap-2 py-2 animate-fade-up">
            <IonIcon icon={helpCircleOutline} style={{ fontSize: 32 }} />
            <p className="text-sm font-bold">Na vjen keq që ky artikull nuk ju ndihmoi.</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Ju lutemi plotësoni formën e kontaktit në fund të faqes për të marrë ndihmë të drejtpërdrejtë nga stafi ynë.
            </p>
          </div>
        )}
      </div>
    </article>
  );
}

function CategoryView({
  category, onBack, onArticle,
}: { category: Category; onBack: () => void; onArticle: (a: Article) => void }) {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  return (
    <div className="animate-fade-up max-w-3xl mx-auto my-4">
      <button type="button" onClick={onBack} className="back-button mb-6 text-slate-500 hover:text-orange-600 font-semibold text-sm transition-colors duration-200 flex items-center gap-1.5" id="btn-back-to-main">
        <IonIcon icon={chevronBackOutline} style={{ fontSize: 16 }} /> Kthehu në faqen kryesore
      </button>

      <div className="flex items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm mb-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-orange-500"></div>
        <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-inner flex-shrink-0">
          {category.icon}
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {category.label}
          </h2>
          <p className="text-xs text-slate-400 mt-1">{category.description}</p>
        </div>
      </div>

      <div className="accordion-wrapper space-y-3">
        {category.articles.map((art) => {
          const isOpen = openIndex === art.id;
          return (
            <div key={art.id} className={`accordion-card border border-slate-200/60 rounded-2xl bg-white overflow-hidden transition-all duration-300 ${isOpen ? 'border-orange-500 shadow-sm' : 'hover:border-slate-300'}`}>
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : art.id)}
                className="accordion-trigger w-full flex items-center justify-between p-5 text-left bg-none border-none cursor-pointer"
              >
                <span className={`accordion-title text-[14.5px] font-bold transition-colors duration-200 ${isOpen ? 'text-orange-600' : 'text-slate-700'}`}>{art.title}</span>
                <div className={`accordion-icon w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-orange-50 text-orange-600 rotate-180' : 'bg-slate-100 text-slate-500'}`}>
                      <IonIcon icon={chevronDownOutline} style={{ fontSize: 14 }} />
                </div>
              </button>
              <div 
                className="accordion-content transition-all duration-300 ease-in-out"
                style={{ maxHeight: isOpen ? '500px' : '0px' }}
              >
                <div className="accordion-content-inner p-5 pt-0 bg-slate-50/50 border-t border-slate-100 text-sm text-slate-600 leading-relaxed">
                  <p className="mb-4">{art.body}</p>
                  <button
                    type="button"
                    onClick={() => onArticle(art)}
                    className="text-xs font-bold text-orange-600 hover:text-orange-700 inline-flex items-center gap-1 bg-none border-none p-0 cursor-pointer transition-colors duration-150"
                  >
                    Lexo artikullin e plotë <IonIcon icon={openOutline} style={{ fontSize: 14 }} />
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
  
  // Track votes on articles
  const [articleVotes, setArticleVotes] = useState<Record<string, 'up' | 'down'>>({});

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
      setTimeout(() => setContactSent(false), 5000);
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
      catColor: '#f97316',
    },
    {
      id: 'sec-transit-services',
      title: 'Oraret & Njoftimet (Transit & Alerts)',
      subtitle: 'Informacione mbi oraret zyrtare, linjat, ndryshimet në kohë reale dhe alarmet.',
      articles: [
        ...(CATEGORIES.find(c => c.id === 'autobusi')?.articles || []),
        ...(CATEGORIES.find(c => c.id === 'njoftimet')?.articles || []),
      ],
      catColor: '#f97316',
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
      catColor: '#f97316',
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
            voteStatus={articleVotes[activeArticle.id] || 'none'}
            onVoteUp={() => setArticleVotes(prev => ({ ...prev, [activeArticle.id]: 'up' }))}
            onVoteDown={() => {
              setArticleVotes(prev => ({ ...prev, [activeArticle.id]: 'down' }));
              setTimeout(() => {
                scrollTo(contactRef);
              }, 1200);
            }}
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
        <div className="cards-grid mb-12" ref={guidesRef}>
          <div 
            className="category-pill-card group border border-slate-200/80 bg-white hover:border-orange-500/30 hover:shadow-xl hover:shadow-slate-100 transition-all duration-300 p-8 rounded-3xl text-center cursor-pointer relative overflow-hidden" 
            onClick={() => scrollTo(guidesRef)}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="card-icon-round w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-5 transition-transform duration-300 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white">
              <IonIcon icon={bookOutline} style={{ fontSize: 24 }} />
            </div>
            <h3 className="card-title text-base font-bold text-slate-800 mb-2">Udhëzuesit (Guides)</h3>
            <p className="card-desc text-xs text-slate-400 leading-relaxed">Gjeni udhëzime të hollësishme për përdorimin e hartave, GPS dhe konfigurimet e para.</p>
          </div>

          <div 
            className="category-pill-card group border border-slate-200/80 bg-white hover:border-orange-500/30 hover:shadow-xl hover:shadow-slate-100 transition-all duration-300 p-8 rounded-3xl text-center cursor-pointer relative overflow-hidden" 
            onClick={() => scrollTo(faqRef)}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="card-icon-round w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-5 transition-transform duration-300 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white">
              <IonIcon icon={chatbubbleOutline} style={{ fontSize: 24 }} />
            </div>
            <h3 className="card-title text-base font-bold text-slate-800 mb-2">Pyetjet e Shpeshta (FAQ)</h3>
            <p className="card-desc text-xs text-slate-400 leading-relaxed">Përgjigje të shpejta për pyetjet më të shpeshta rreth aplikacionit dhe të dhënave live.</p>
          </div>

          <div 
            className="category-pill-card group border border-slate-200/80 bg-white hover:border-orange-500/30 hover:shadow-xl hover:shadow-slate-100 transition-all duration-300 p-8 rounded-3xl text-center cursor-pointer relative overflow-hidden" 
            onClick={() => scrollTo(contactRef)}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="card-icon-round w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-5 transition-transform duration-300 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white">
              <IonIcon icon={chatbubbleEllipsesOutline} style={{ fontSize: 24 }} />
            </div>
            <h3 className="card-title text-base font-bold text-slate-800 mb-2">Komuniteti & Suporti</h3>
            <p className="card-desc text-xs text-slate-400 leading-relaxed">Na kontaktoni drejtpërdrejt për të raportuar problematika ose sugjeruar linja të reja.</p>
          </div>
        </div>

        {/* ── Category Bento Grid (Quick Navigation) ───────────────────────── */}
        <div className="section-container">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mb-2">Lundro sipas kategorisë</h2>
          <p className="text-xs text-slate-400 mb-6">Zgjidhni kategorinë e dëshiruar për të filtruar udhëzimet tona.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-16">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className="group p-5 bg-white border border-slate-200/70 hover:border-orange-500/30 hover:shadow-lg hover:shadow-slate-50 rounded-2xl flex flex-col items-start gap-4 cursor-pointer text-left transition-all duration-300 relative overflow-hidden hover:-translate-y-1"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50/20 rounded-bl-full translate-x-4 -translate-y-4 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-300"></div>
                <span className="flex p-3 rounded-xl bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all duration-300 relative z-10">{cat.icon}</span>
                <div className="relative z-10 w-full">
                  <span className="block text-[13.5px] font-bold text-slate-800 group-hover:text-orange-600 transition-colors duration-200">{cat.label}</span>
                  <span className="block text-[10px] text-slate-400 mt-1 font-semibold">{cat.articles.length} artikuj</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Grouped Accordion Sections ───────────────────────────────────── */}
        {SECTIONS.map((sec) => (
          <div key={sec.id} className="section-container">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{sec.title}</h2>
            <p className="text-xs text-slate-400 mt-1 mb-6">{sec.subtitle}</p>

            <div className="accordion-wrapper space-y-3">
              {sec.articles.map((art) => {
                const accordionKey = `${sec.id}-${art.id}`;
                const isOpen = openMainAccordion === accordionKey;
                return (
                  <div key={art.id} className={`accordion-card border border-slate-200/60 rounded-2xl bg-white overflow-hidden transition-all duration-300 ${isOpen ? 'border-orange-500 shadow-sm' : 'hover:border-slate-300'}`}>
                    <button
                      type="button"
                      onClick={() => setOpenMainAccordion(isOpen ? null : accordionKey)}
                      className="accordion-trigger w-full flex items-center justify-between p-5 text-left bg-none border-none cursor-pointer"
                    >
                      <span className={`accordion-title text-[14.5px] font-bold transition-colors duration-200 ${isOpen ? 'text-orange-600' : 'text-slate-700'}`}>{art.title}</span>
                      <div className={`accordion-icon w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-orange-50 text-orange-600 rotate-180' : 'bg-slate-100 text-slate-500'}`}>
                        <IonIcon icon={chevronDownOutline} style={{ fontSize: 14 }} />
                      </div>
                    </button>
                    <div 
                      className="accordion-content transition-all duration-300 ease-in-out"
                      style={{ maxHeight: isOpen ? '500px' : '0px' }}
                    >
                      <div className="accordion-content-inner p-5 pt-0 bg-slate-50/50 border-t border-slate-100 text-sm text-slate-600 leading-relaxed">
                        <p className="mb-4">{art.body}</p>
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {art.tags.map(t => <span key={t} className="text-[10px] px-2 py-0.5 bg-slate-100 border border-slate-200/50 text-slate-500 rounded">#{t}</span>)}
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
                          className="text-xs font-bold text-orange-600 hover:text-orange-700 inline-flex items-center gap-1 bg-none border-none p-0 cursor-pointer transition-colors duration-150"
                        >
                          Faqja e plotë e udhëzuesit <IonIcon icon={openOutline} style={{ fontSize: 14 }} />
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
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Pyetjet më të shpeshta (FAQ)</h2>
          <p className="text-xs text-slate-400 mt-1 mb-6">Përgjigje të shpejta për menaxhimin e përgjithshëm dhe pyetjet më të hasura.</p>

          <div className="accordion-wrapper space-y-3">
            {FAQ.map((item, i) => {
              const accordionKey = `faq-${i}`;
              const isOpen = openMainAccordion === accordionKey;
              return (
                <div key={i} className={`accordion-card border border-slate-200/60 rounded-2xl bg-white overflow-hidden transition-all duration-300 ${isOpen ? 'border-orange-500 shadow-sm' : 'hover:border-slate-300'}`}>
                  <button
                    type="button"
                    onClick={() => setOpenMainAccordion(isOpen ? null : accordionKey)}
                    className="accordion-trigger w-full flex items-center justify-between p-5 text-left bg-none border-none cursor-pointer"
                  >
                    <span className={`accordion-title text-[14.5px] font-bold transition-colors duration-200 ${isOpen ? 'text-orange-600' : 'text-slate-700'}`}>{item.q}</span>
                    <div className={`accordion-icon w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-orange-50 text-orange-600 rotate-180' : 'bg-slate-100 text-slate-500'}`}>
                      <IonIcon icon={chevronDownOutline} style={{ fontSize: 14 }} />
                    </div>
                  </button>
                  <div 
                    className="accordion-content transition-all duration-300 ease-in-out"
                    style={{ maxHeight: isOpen ? '250px' : '0px' }}
                  >
                    <div className="accordion-content-inner p-5 pt-0 bg-slate-50/50 border-t border-slate-100 text-sm text-slate-600 leading-relaxed">
                      <p>{item.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Contact Form ─────────────────────────────────────────────────── */}
        <div className="section-container" ref={contactRef}>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Nuk e gjetët atë që kërkoni?</h2>
          <p className="text-xs text-slate-400 mt-1 mb-6">Shkruani drejtpërdrejt ekipit tonë të mbështetjes teknike dhe do t'ju kthehemi menjëherë.</p>

          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 to-orange-700"></div>
            {contactSent ? (
              <div className="flex flex-col items-center gap-4 py-8 text-center animate-fade-up">
                <div className="w-14 h-14 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 shadow-inner">
                  <IonIcon icon={checkmarkCircleOutline} style={{ fontSize: 24 }} />
                </div>
                <h3 className="text-base font-bold text-slate-900">Kërkesa juaj u dërgua me sukses!</h3>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                  Do t'ju kthejmë përgjigje brenda 24 orëve në adresën tuaj të regjistruar.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <textarea
                  id="textarea-feedback"
                  value={contactText}
                  onChange={(e) => setContactText(e.target.value)}
                  placeholder="Shkruani pyetjen ose problematikën tuaj këtu me detaje..."
                  rows={4}
                  disabled={contactLoading}
                  className="contact-textarea w-full p-4 border border-slate-200 rounded-2xl focus:border-orange-500 focus:ring-4 focus:ring-orange-50 text-slate-700 text-sm outline-none resize-none transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={handleContact}
                  id="btn-submit-feedback"
                  disabled={!contactText.trim() || contactLoading}
                  className={`btn-base w-full py-3.5 flex items-center justify-center gap-2 font-bold text-sm rounded-2xl transition-all duration-200 ${
                    contactText.trim() && !contactLoading 
                      ? 'btn-primary bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/10 hover:shadow-orange-700/20 hover:-translate-y-0.5' 
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {contactLoading ? 'Po dërgohet...' : 'Dërgo mesazh'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Support Info footer grid ────────────────────────────────────── */}
        <div className="section-container mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: <IonIcon icon={mailOutline} style={{ fontSize: 16 }} />, label: 'Email mbështetës', value: 'support@urbani-im.al' },
              { icon: <IonIcon icon={timeOutline} style={{ fontSize: 16 }} />, label: 'Orari i shërbimit', value: '09:00 – 17:00' },
              { icon: <IonIcon icon={helpCircleOutline} style={{ fontSize: 16 }} />, label: 'Koha mesatare', value: 'Brenda 24 orëve' },
            ].map((item, idx) => (
              <div key={idx} className="support-item flex items-center gap-4 p-5 border border-slate-200/80 bg-white rounded-2xl hover:border-orange-500/20 hover:shadow-lg hover:shadow-slate-50 transition-all duration-300">
                <span className="flex p-3 rounded-xl bg-orange-50 text-orange-600 flex-shrink-0">
                  {item.icon}
                </span>
                <div>
                  <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">
                    {item.label}
                  </p>
                  <p className="text-xs font-bold text-slate-800 mt-1 leading-none">
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
    <div className="pb-16 animate-fade-up relative overflow-hidden min-h-screen">
      {/* ── Background Mesh/Glow elements ────────────────────────────────── */}
      <div className="glow-container absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="glow-orbglow glow-orb-1"></div>
        <div className="glow-orbglow glow-orb-2"></div>
      </div>

      <style>{`
        .glow-orb-1 {
          position: absolute;
          top: -100px;
          left: 10%;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(249, 115, 22, 0.07) 0%, transparent 70%);
          filter: blur(80px);
          animation: float-orb 15s ease-in-out infinite alternate;
          pointer-events: none;
        }
        .glow-orb-2 {
          position: absolute;
          top: 300px;
          right: 5%;
          width: 450px;
          height: 450px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(249, 115, 22, 0.04) 0%, transparent 70%);
          filter: blur(70px);
          animation: float-orb-rev 18s ease-in-out infinite alternate;
          pointer-events: none;
        }

        @keyframes float-orb {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(40px, -40px) scale(1.1); }
        }
        @keyframes float-orb-rev {
          0% { transform: translate(0, 0) scale(1.1); }
          100% { transform: translate(-30px, 30px) scale(0.9); }
        }

        .hero-section {
          padding: 80px 20px 70px;
          text-align: center;
          position: relative;
          z-index: 10;
        }

        .hero-title {
          font-size: 36px;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -1.5px;
          margin: 0 0 24px;
          line-height: 1.2;
        }

        @media (max-width: 768px) {
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
          height: 8px;
          background: rgba(249, 115, 22, 0.2);
          z-index: -1;
          border-radius: 4px;
        }

        .search-pill-container {
          max-width: 540px;
          margin: 0 auto 20px;
          position: relative;
          box-shadow: 0 12px 35px -12px rgba(249, 115, 22, 0.15);
          border-radius: 9999px;
          z-index: 20;
        }

        .search-pill-input {
          width: 100%;
          padding: 18px 64px 18px 28px;
          border-radius: 9999px;
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          color: #1e293b;
          font-size: 15px;
          outline: none;
          transition: all 0.3s ease;
          font-family: inherit;
          box-sizing: border-box;
        }

        .search-pill-input:focus {
          border-color: #f97316;
          box-shadow: 0 0 0 5px rgba(249, 115, 22, 0.08);
        }

        .search-pill-btn {
          position: absolute;
          right: 7px;
          top: 50%;
          transform: translateY(-50%);
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: #f97316;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .search-pill-btn:hover {
          background: #ea580c;
          transform: translateY(-50%) scale(1.05);
        }

        .hero-subtitle {
          font-size: 13.5px;
          color: #64748b;
          margin: 0;
        }

        /* 3 Columns Cards rules */
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          max-width: 960px;
          margin: -10px auto 48px;
          padding: 0 20px;
          position: relative;
          z-index: 10;
        }

        /* Grouped Accordions rules */
        .section-container {
          max-width: 800px;
          margin: 0 auto 56px;
          padding: 0 20px;
          position: relative;
          z-index: 10;
        }

        .accordion-wrapper {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        input::-webkit-search-cancel-button {
          display: none;
        }
      `}</style>

      {/* ── Hero Banner Section ───────────────────────────────────────────── */}
      <header className="hero-section">
        <h1 className="hero-title">
          Si mund t'ju <span className="hero-underline">ndihmojmë?</span>
        </h1>
        
        {/* Search Input */}
        <div className="search-pill-container">
          <input
            ref={searchRef}
            id="input-search-help"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
            placeholder="Kërkoni për një artikull ose pyetje..."
            className="search-pill-input"
          />
          {search ? (
            <button 
              type="button" 
              className="absolute right-16 top-50% translate-y-[-50%] text-slate-400 hover:text-slate-600 bg-none border-none outline-none cursor-pointer p-1"
              onClick={clearSearch}
              style={{ top: '50%' }}
              aria-label="Fshi kërkimin"
            >
              <IonIcon icon={closeOutline} style={{ fontSize: 16 }} />
            </button>
          ) : null}
          <button type="button" className="search-pill-btn" aria-label="Kërko" onClick={() => searchRef.current?.focus()}>
            <IonIcon icon={searchOutline} style={{ fontSize: 16 }} />
          </button>

          {/* Search Dropdown suggest list */}
          {search && (
            <div
              className="absolute left-0 right-0 bg-white border border-slate-200/80 rounded-2xl overflow-hidden z-[100] shadow-xl shadow-slate-200/50 text-left mt-2.5 animate-fade-up"
              style={{
                top: '100%',
              }}
            >
              {searchResults.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-sm">
                  Nuk u gjet asnjë rezultat për "<span className="text-slate-800 font-semibold">{search}</span>"
                </div>
              ) : (
                searchResults.slice(0, 5).map(({ category, article }) => (
                  <button
                    key={article.id}
                    type="button"
                    onClick={() => { setSearch(''); setActiveCategory(category); setActiveArticle(article); }}
                    className="w-full flex items-center gap-4 px-6 py-4 bg-transparent border-none cursor-pointer text-left border-b border-slate-100 hover:bg-slate-50 transition-colors duration-150"
                  >
                    <IonIcon icon={bookOutline} style={{ fontSize: 16 }} className="text-orange-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 margin-0 truncate">
                        {article.title}
                      </p>
                      <p className="text-[10px] text-orange-600 mt-1 font-semibold">
                        {category.label}
                      </p>
                    </div>
                    <IonIcon icon={openOutline} style={{ fontSize: 14 }} className="text-slate-300" />
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Popular Tags suggestions */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-4 relative z-20">
          <span className="text-xs text-slate-400 font-semibold">Kërkesat popullore:</span>
          {POPULAR_KEYWORDS.map(kw => (
            <button
              key={kw}
              type="button"
              onClick={() => { setSearch(kw); searchRef.current?.focus(); }}
              className="text-xs px-3 py-1 bg-orange-50/50 hover:bg-orange-50 border border-orange-100/50 hover:border-orange-200 text-orange-600 rounded-full cursor-pointer transition-all duration-200"
            >
              #{kw}
            </button>
          ))}
        </div>

        <p className="hero-subtitle">
          Ose <span className="font-semibold text-slate-800">zgjidhni</span> një kategori më poshtë për udhëzime të plota.
        </p>
      </header>

      {/* ── Main View Content ─────────────────────────────────────────────── */}
      <main className="relative z-10" style={{ paddingBottom: '60px' }}>
        {renderContent()}
      </main>
    </div>
  );
}
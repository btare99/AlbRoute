import React from "react";

// ─── Metadata ───────────────────────────────────────────────────────────────
export const metadata = {
  title: "Terms and Conditions - Urbani IM",
  description:
    "Lexoni kushtet dhe rregullat e përdorimit të aplikacionit Urbani IM dhe faqes sonë të internetit.",
  robots: "noindex, nofollow",
};

// ─── Helper Components ───────────────────────────────────────────────────────
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: '32px' }}>
      <h2 className="section-title">
        {title}
      </h2>
      {children}
    </section>
  );
}

function BulletList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="bullet-list">
      {items.map((item, i) => (
        <li key={i} className="bullet-item">{item}</li>
      ))}
    </ul>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TermsPage() {
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

        /* Policy Container and Cards */
        .policy-container {
          max-width: 768px;
          margin: 48px auto 80px;
          padding: 0 20px;
        }

        .policy-card {
          background: #ffffff;
          border: 1px solid #f1f5f9;
          border-radius: 16px;
          padding: 48px 40px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.02);
        }

        @media (max-width: 640px) {
          .policy-card {
            padding: 32px 20px;
          }
        }

        .policy-title {
          font-size: 32px;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.8px;
          margin: 0 0 12px;
        }

        .policy-desc {
          font-size: 14.5px;
          color: #64748b;
          line-height: 1.6;
          margin: 0 0 32px;
        }

        .section-title {
          font-size: 18px;
          font-weight: 700;
          color: #0d9488;
          margin: 0 0 16px;
          padding-bottom: 8px;
          border-bottom: 1px solid #f1f5f9;
        }

        .policy-text {
          font-size: 14px;
          color: #334155;
          line-height: 1.7;
          margin: 0 0 16px;
        }

        .bullet-list {
          list-style-type: disc;
          margin: 0 0 16px 20px;
          padding: 0;
        }

        .bullet-item {
          font-size: 14px;
          color: #334155;
          line-height: 1.7;
          margin-bottom: 6px;
        }

        .policy-link {
          color: #0d9488;
          text-decoration: underline;
          transition: color 0.15s ease;
        }

        .policy-link:hover {
          color: #0f766e;
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
          <a href="/terms-and-conditions" className="nav-link">Terms</a>
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

      {/* ── Content Card ──────────────────────────────────────────────────── */}
      <main className="policy-container">
        <article className="policy-card">
          <header>
            <h1 className="policy-title">Terms and Conditions</h1>
            <p className="policy-desc">
              Këto Kushte dhe Rregulla ("Kushtet") rregullojnë përdorimin e aplikacionit Urbani IM dhe faqes sonë të internetit. Duke hyrë ose përdorur shërbimin, ju pranoni plotësisht këto kushte. Nëse nuk jeni dakord, ju lutemi mos e përdorni shërbimin.
            </p>
          </header>

          <Section title="1. Përdorimi i Shërbimit">
            <p className="policy-text">
              Ju mund të përdorni shërbimin tonë vetëm për qëllime të ligjshme. Ndalohet kategorikisht:
            </p>
            <BulletList
              items={[
                "Dhënia e informacioneve të rreme ose mashtruese gjatë krijimit të llogarisë.",
                "Përdorimi i shërbimit për qëllime të paligjshme ose të paautorizuara.",
                "Përpjekja për të dëmtuar infrastrukturën apo për të fituar akses të paautorizuar në serverat tanë.",
                "Transmetimi i viruseve, malware-ve apo materialeve të tjera të dëmshme.",
                "Përdorimi i mjeteve të automatizuara (skraper, bot) për nxjerrjen e të dhënave pa autorizim paraprak me shkrim.",
              ]}
            />
          </Section>

          <Section title="2. Llogaritë e Përdoruesve">
            <p className="policy-text">
              Kur krijoni një llogari te ne, ju jeni përgjegjës për:
            </p>
            <BulletList
              items={[
                "Ruajtjen e konfidencialitetit të fjalëkalimit dhe kredencialeve tuaja.",
                "Çdo aktivitet që ndodh nën llogarinë tuaj.",
                "Njoftimin e menjëhershëm në support@urbani-im.al nëse dyshoni për ndonjë thyerje të sigurisë.",
              ]}
            />
          </Section>

          <Section title="3. Kushtet e Shërbimit Live">
            <p className="policy-text">
              Informacioni mbi pozicionin live të autobusëve vjen nga GPS e instaluar në mjete. Ne bëjmë çdo përpjekje për të garantuar saktësi, por nuk mund të mbajmë përgjegjësi për vonesa apo pasaktësi që vijnë si pasojë e problemeve teknike të operatorëve apo vonesave në rrjet.
            </p>
          </Section>

          <Section title="4. Pronësia Intelektuale">
            <p className="policy-text">
              Gjithë përmbajtja e faqes dhe aplikacionit — përfshirë tekstin, kodin burimor, logot, grafikat dhe dizajnin — është pronë e Urbani IM ose e licencuesve tanë dhe mbrohet nga ligjet e të drejtës së autorit. Ju nuk mund të kopjoni, shpërndani apo krijoni vepra të derivuara pa autorizim me shkrim.
            </p>
          </Section>

          <Section title="5. Kufizimi i Përgjegjësisë">
            <p className="policy-text">
              Deri në kufijtë e lejuar nga ligji, Urbani IM nuk do të jetë përgjegjës për asnjë dëm të tërthortë, rastësor ose vijues që rezulton nga përdorimi ose pamundësia për të përdorur shërbimin tonë.
            </p>
          </Section>

          <Section title="6. Ndryshimet në Kushtet e Shërbimit">
            <p className="policy-text">
              Ne rezervojmë të drejtën të përditësojmë këto Kushte në çdo kohë. Kur kryejmë ndryshime thelbësore, do t'ju njoftojmë përmes aplikacionit ose duke vendosur një njoftim të dukshëm në faqen tonë. Vazhdimi i përdorimit të shërbimit pas përditësimit përbën pranim të kushteve të reja.
            </p>
          </Section>

          <Section title="7. Kontakti">
            <p className="policy-text">
              Për çdo pyetje apo sqarim mbi këto Kushte, ju lutemi na shkruani në adresa e mëposhtme:
            </p>
            <address style={{ fontStyle: 'normal', color: '#475569', fontSize: '14px', lineHeight: 1.6 }}>
              <p style={{ fontWeight: '700', color: '#1e293b' }}>Urbani IM Support</p>
              <p>Email: <a href="mailto:support@urbani-im.al" className="policy-link">support@urbani-im.al</a></p>
            </address>
          </Section>

          <footer style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
              Përditësuar së fundmi: 3 Qershor 2026
            </p>
          </footer>
        </article>
      </main>
    </div>
  );
}
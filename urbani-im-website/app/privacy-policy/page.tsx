import React from "react";

// ─── Metadata ───────────────────────────────────────────────────────────────
export const metadata = {
  title: "Privacy Policy - Urbani IM",
  description:
    "Mësoni se si Urbani IM mbledh, përdor dhe mbron të dhënat tuaja personale në përputhje me rregulloren GDPR.",
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
export default function PrivacyPolicyPage() {
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

        /* Styled Table */
        .policy-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          font-size: 13.5px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
        }

        .policy-table th {
          background: #f8fafc;
          color: #334155;
          font-weight: 600;
          text-align: left;
          padding: 12px 16px;
          border-bottom: 1px solid #e2e8f0;
        }

        .policy-table td {
          padding: 12px 16px;
          border-bottom: 1px solid #f1f5f9;
          color: #475569;
        }

        .policy-table tr:last-child td {
          border-bottom: none;
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
          Help<span>Center</span>
        </a>
        <div className="nav-links">
          <a href="/" className="nav-link">Home</a>
          <a href="/help-center" className="nav-link">Articles</a>
          <a href="/help-center" className="nav-link">Categories</a>
        </div>
        <div className="nav-actions">
          <a href="/help-center#textarea-feedback" className="btn-request">
            Submit a Request
          </a>
          <a href="#" className="btn-signin">
            Sign In
          </a>
        </div>
      </nav>

      {/* ── Content Card ──────────────────────────────────────────────────── */}
      <main className="policy-container">
        <article className="policy-card">
          <header>
            <h1 className="policy-title">Privacy Policy</h1>
            <p className="policy-desc">
              Kjo Politikë e Privatësisë shpjegon se si Urbani IM ("ne", "neve", ose "Shërbimi") mbledh, përdor dhe mbron të dhënat tuaja personale kur përdorni faqen tonë të internetit ose shërbimet tona. Duke përdorur faqen tonë, ju pranoni praktikat e përshkruara këtu.
            </p>
          </header>

          <Section title="1. Të dhënat që mbledhim">
            <BulletList
              items={[
                "Të dhënat e llogarisë: emri, adresa e emailit, fjalëkalimi i siguruar dhe adresa e dërgesës.",
                "Të dhënat e udhëtimit: destinacionet e kërkuara, linjat e preferuara, historiku i kërkimeve.",
                "Të dhënat e pagesës: procesimi i transaksioneve bëhet në mënyrë të sigurt nga ofruesit tanë të pagesave — ne nuk ruajmë numra kartash krediti.",
                "Të dhënat teknike: adresa IP, lloji i shfletuesit, cookies dhe të dhënat e përdorimit të faqes.",
              ]}
            />
          </Section>

          <Section title="2. Baza ligjore për përpunim (GDPR)">
            <p className="policy-text">
              Sipas Rregullores së Përgjithshme për Mbrojtjen e të Dhënave (GDPR), përpunimi i të dhënave bazohet në këto pika ligjore:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '16px 0' }}>
              {[
                {
                  basis: "Kontrata",
                  desc: "Përpunimi i kërkesave tuaja, menaxhimi i llogarisë dhe dhënia e ndihmës teknike.",
                },
                {
                  basis: "Pëlqimi",
                  desc: "Dërgimi i email-eve promovuese dhe njoftimeve live. Pëlqimi mund të tërhiqet në çdo kohë.",
                },
                {
                  basis: "Interesi Legjitim",
                  desc: "Përmirësimi i shërbimeve tona, analizimi i trafikut dhe parandalimi i mashtrimeve.",
                },
                {
                  basis: "Detyrimi Ligjor",
                  desc: "Ruajtja e të dhënave financiare dhe transaksioneve për t'iu përgjigjur ligjeve tatimore.",
                },
              ].map(({ basis, desc }) => (
                <div key={basis} style={{ display: 'flex', gap: '12px' }}>
                  <span style={{ fontWeight: '700', color: '#1e293b', minWidth: '120px', fontSize: '14px' }}>
                    {basis}
                  </span>
                  <span style={{ color: '#475569', fontSize: '14px' }}>{desc}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section title="3. Si i përdorim të dhënat tuaja">
            <BulletList
              items={[
                "Për të procesuar dhe lehtësuar udhëtimet tuaja me transport publik.",
                "Për të menaxhuar llogarinë tuaj dhe për t'ju ofruar ndihmë teknike.",
                "Për të dërguar njoftime mbi ndryshimet e orareve apo linjave.",
                "Për të analizuar të dhënat e përdorimit me qëllim përmirësimin e aplikacionit.",
                "Për të detektuar dhe parandaluar ndërhyrjet e paautorizuara.",
              ]}
            />
          </Section>

          <Section title="4. Cookies dhe Teknologjitë e Ngjashme">
            <p className="policy-text">
              Ne përdorim cookies për të ruajtur preferencat tuaja. Mund t'i menaxhoni ato në cilësimet e shfletuesit tuaj, ndonëse disa veçori mund të mos funksionojnë pa to.
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table className="policy-table">
                <thead>
                  <tr>
                    <th>Lloji</th>
                    <th>Qëllimi</th>
                    <th>Kohëzgjatja</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Thelbësore", "Menaxhimi i sesionit dhe autentikimi", "Sesioni"],
                    ["Analitike", "Kuptimi i trafikut dhe sjelljes (Google Analytics)", "Deri në 12 muaj"],
                    ["Preferencat", "Ruajtja e gjuhës, qytetit dhe cilësimeve të pamjes", "Deri në 12 muaj"],
                  ].map(([type, purpose, duration]) => (
                    <tr key={type}>
                      <td style={{ fontWeight: '600' }}>{type}</td>
                      <td>{purpose}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>{duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="5. Ndarja e të dhënave me palët e treta">
            <p className="policy-text">
              Ne nuk i shesim të dhënat tuaja personale. Ndarja e të dhënave bëhet vetëm me partnerë të besuar për qëllime të përcaktuara:
            </p>
            <BulletList
              items={[
                "Procesuesit e pagesave (Stripe, PayPal) për transaksione të sigurta.",
                "Ofruesit e shërbimeve cloud (AWS, Vercel) për hostimin dhe funksionimin e faqes.",
                "Platformat analitike (Google Analytics) për përmirësimin e shërbimit.",
              ]}
            />
          </Section>

          <Section title="6. Siguria e të Dhënave">
            <p className="policy-text">
              Ne përdorim masa teknike të avancuara, si enkriptimi (HTTPS) dhe ruajtja e koduar e fjalëkalimeve, për të garantuar siguri maksimale. Për çdo dyshim rreth sigurisë, na kontaktoni në{" "}
              <a
                href="mailto:support@urbani-im.al"
                className="policy-link"
              >
                support@urbani-im.al
              </a>
              .
            </p>
          </Section>

          <Section title="7. Ruajtja e të Dhënave">
            <p className="policy-text">
              Të dhënat ruhen vetëm për sa kohë janë të nevojshme. Të dhënat e llogarisë fshihen brenda 30 ditëve nga kërkesa juaj për fshirje. Të dhënat e transaksioneve financiare ruhen për 7 vite për arsye ligjore tatimore.
            </p>
          </Section>

          <Section title="8. Të Drejtat Tuaja sipas GDPR">
            <p className="policy-text">
              Nëse ndodheni në BE/ZPE, ju gëzoni të drejtat e mëposhtme që mund t'i ushtroni duke shkruar në{" "}
              <a
                href="mailto:support@urbani-im.al"
                className="policy-link"
              >
                support@urbani-im.al
              </a>
              :
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              {[
                { right: "E drejta e aksesit", desc: "Kërkoni një kopje të të dhënave tuaja." },
                { right: "E drejta e korrigjimit", desc: "Korrigjoni të dhënat e pasakta." },
                { right: "E drejta e fshirjes", desc: "Fshirja e të dhënave tuaja ('e drejta për t'u harruar')." },
                { right: "E drejta e transportueshmërisë", desc: "Marrja e të dhënave në një format të lexueshëm nga makinat." },
              ].map(({ right, desc }) => (
                <div key={right} style={{ display: 'flex', gap: '12px' }}>
                  <span style={{ fontWeight: '700', color: '#1e293b', minWidth: '180px', fontSize: '14px' }}>
                    {right}
                  </span>
                  <span style={{ color: '#475569', fontSize: '14px' }}>{desc}</span>
                </div>
              ))}
            </div>
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
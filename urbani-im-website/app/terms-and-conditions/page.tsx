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
    <div className="pb-16 animate-fade-up">
      <style>{`
        /* Policy Container and Cards */
        .policy-container {
          max-width: 768px;
          margin: 32px auto 60px;
          padding: 0 20px;
        }

        .policy-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 40px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.01);
        }

        @media (max-width: 640px) {
          .policy-card {
            padding: 24px 20px;
          }
        }

        .policy-title {
          font-size: 28px;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.8px;
          margin: 0 0 12px;
        }

        .policy-desc {
          font-size: 14px;
          color: #64748b;
          line-height: 1.6;
          margin: 0 0 32px;
        }

        .section-title {
          font-size: 16.5px;
          font-weight: 700;
          color: #f97316;
          margin: 0 0 16px;
          padding-bottom: 8px;
          border-bottom: 1px solid #f1f5f9;
        }

        .policy-text {
          font-size: 13.5px;
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
          font-size: 13.5px;
          color: #334155;
          line-height: 1.7;
          margin-bottom: 6px;
        }

        .policy-link {
          color: #f97316;
          text-decoration: underline;
          transition: color 0.15s ease;
        }

        .policy-link:hover {
          color: #ea580c;
        }
      `}</style>

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
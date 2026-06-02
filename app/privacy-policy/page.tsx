import React from "react";

// ─── FIX #9: metadata e plotë me robots noindex ───────────────────────────────
export const metadata = {
  title: "Privacy Policy - Clothing E‑commerce",
  description:
    "Learn how Clothing E‑commerce collects, uses, and protects your personal data in accordance with GDPR.",
  robots: "noindex, nofollow",
};

// ─── Komponent ndihmës për seksionet ─────────────────────────────────────────
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
        {title}
      </h2>
      {children}
    </section>
  );
}

function BulletList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="list-disc ml-6 space-y-1 text-gray-700">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

// ─── Faqja kryesore ───────────────────────────────────────────────────────────
export default function PrivacyPolicyPage() {
  return (
    // FIX #2 (strukturor): mbështjellë me <article> semantik
    <main className="bg-white min-h-screen">
      <article className="mx-auto max-w-3xl px-6 py-12">

        {/* Titulli */}
        <header className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Privacy Policy
          </h1>
          <p className="text-gray-600 text-base leading-relaxed">
            This Privacy Policy explains how Clothing E‑commerce ("we", "us",
            or "the Service") collects, uses, and protects your personal
            information when you use our website or services. By using our site
            you agree to the practices described here.
          </p>
        </header>

        {/* 1 — Informacioni që mbledhim */}
        <Section title="1. Information We Collect">
          <BulletList
            items={[
              "Account information: name, email address, password (stored as a secure hash), delivery address.",
              "Order information: purchased items, sizes, style preferences, order history.",
              "Payment information: card details are processed and tokenised by our payment providers — we do not store raw card numbers.",
              "Technical information: IP address, browser type, cookies, and site usage data.",
            ]}
          />
        </Section>

        {/* 2 — Baza ligjore — FIX #4 */}
        <Section title="2. Lawful Basis for Processing (GDPR)">
          <p className="text-gray-700 mb-3">
            Under the General Data Protection Regulation (GDPR), we process
            your personal data on the following legal grounds:
          </p>
          <div className="space-y-3">
            {[
              {
                basis: "Contract",
                desc: "Processing your orders, managing your account, and providing customer support.",
              },
              {
                basis: "Consent",
                desc: "Sending marketing emails and newsletters. You may withdraw consent at any time.",
              },
              {
                basis: "Legitimate Interest",
                desc: "Improving our services, analyzing site traffic, and preventing fraud — balanced against your rights.",
              },
              {
                basis: "Legal Obligation",
                desc: "Retaining order and financial records to comply with tax and accounting laws.",
              },
            ].map(({ basis, desc }) => (
              <div key={basis} className="flex gap-3">
                <span className="font-semibold text-gray-900 min-w-[140px]">
                  {basis}
                </span>
                <span className="text-gray-700">{desc}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* 3 — Si i përdorim të dhënat */}
        <Section title="3. How We Use Your Data">
          <BulletList
            items={[
              "Process and fulfill your orders, including shipping and returns.",
              "Manage your account and provide customer support.",
              "Send transactional emails (order confirmation, shipping updates).",
              "Send marketing communications where you have given consent.",
              "Analyze site usage to improve the shopping experience.",
              "Detect and prevent fraud and unauthorized access.",
            ]}
          />
        </Section>

        {/* 4 — Cookies — FIX #6 */}
        <Section title="4. Cookies and Similar Technologies">
          <p className="text-gray-700 mb-3">
            We use cookies and similar tracking technologies. You can manage or
            reject non-essential cookies through your browser settings or our
            cookie banner, although some features may not function correctly
            without them.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50 text-gray-600 font-semibold">
                <tr>
                  <th className="px-4 py-2 border-b border-gray-200">Type</th>
                  <th className="px-4 py-2 border-b border-gray-200">Purpose</th>
                  <th className="px-4 py-2 border-b border-gray-200">Duration</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {[
                  ["Essential", "Session management, cart, authentication", "Session"],
                  ["Analytics", "Understand traffic and user behaviour (e.g. Google Analytics)", "Up to 12 months"],
                  ["Marketing", "Personalised ads and retargeting (with consent)", "Up to 12 months"],
                  ["Preferences", "Store language, currency, and display settings", "Up to 12 months"],
                ].map(([type, purpose, duration]) => (
                  <tr key={type} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-2 font-medium">{type}</td>
                    <td className="px-4 py-2">{purpose}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* 5 — Ndarja me palët e treta */}
        <Section title="5. Sharing with Third Parties">
          <p className="text-gray-700 mb-3">
            We do not sell your personal data. We may share data with trusted
            service providers strictly for the purposes listed below:
          </p>
          <BulletList
            items={[
              "Payment processors (e.g. Stripe, PayPal) — to handle transactions securely.",
              "Shipping and logistics providers — to fulfill and deliver your orders.",
              "Email service providers — to send transactional and marketing emails.",
              "Analytics platforms (e.g. Google Analytics) — to understand site usage (data is anonymised where possible).",
              "Cloud hosting providers — to store and serve the application.",
            ]}
          />
          <p className="text-gray-700 mt-3">
            All third parties are contractually bound to use your data only for
            the agreed purposes and to maintain appropriate security standards.
          </p>
        </Section>

        {/* 6 — Transferimi ndërkombëtar — FIX #5 */}
        <Section title="6. International Data Transfers">
          <p className="text-gray-700">
            Some of our service providers operate outside the European Economic
            Area (EEA). Where data is transferred internationally, we ensure
            appropriate safeguards are in place — such as Standard Contractual
            Clauses (SCCs) approved by the European Commission, or transfers
            only to countries with an adequate level of data protection as
            recognised by the EU. You may request details of these safeguards by
            contacting us at the address below.
          </p>
        </Section>

        {/* 7 — Siguria */}
        <Section title="7. Security">
          <p className="text-gray-700">
            We implement appropriate technical and organisational measures —
            including encryption in transit (HTTPS), hashed passwords, and
            access controls — to protect your information. No system is entirely
            invulnerable. If you discover a security incident or vulnerability,
            please contact us immediately at{" "}
            <a
              href="mailto:support@clothing-ecommerce.com"
              className="text-blue-600 underline"
            >
              support@clothing-ecommerce.com
            </a>
            .
          </p>
        </Section>

        {/* 8 — Mbajtja e të dhënave — FIX #7 */}
        <Section title="8. Data Retention">
          <p className="text-gray-700 mb-3">
            We retain personal data only for as long as necessary for the
            purposes described in this policy or to comply with legal
            obligations. Specific retention periods:
          </p>
          <BulletList
            items={[
              "Account data: retained while your account is active. Deleted within 30 days of an account deletion request.",
              "Order and financial records: retained for 7 years to comply with tax and accounting regulations.",
              "Marketing consent records: retained for the duration of the marketing relationship plus 3 years.",
              "Analytics data: aggregated and anonymised after 12 months.",
              "Support communications: retained for 2 years after the last contact.",
            ]}
          />
        </Section>

        {/* 9 — Të drejtat e plota GDPR — FIX #3 */}
        <Section title="9. Your Rights Under GDPR">
          <p className="text-gray-700 mb-4">
            If you are located in the EU/EEA, you have the following rights
            regarding your personal data. To exercise any of these rights,
            contact us at{" "}
            <a
              href="mailto:support@clothing-ecommerce.com"
              className="text-blue-600 underline"
            >
              support@clothing-ecommerce.com
            </a>
            . We will respond within 30 days.
          </p>
          <div className="space-y-4">
            {[
              {
                right: "Right of Access",
                desc: "Request a copy of the personal data we hold about you.",
              },
              {
                right: "Right to Rectification",
                desc: "Request correction of inaccurate or incomplete data.",
              },
              {
                right: "Right to Erasure",
                desc: 'Request deletion of your data ("right to be forgotten"), subject to legal retention obligations.',
              },
              {
                right: "Right to Restriction",
                desc: "Request that we limit how we process your data in certain circumstances.",
              },
              {
                right: "Right to Data Portability",
                desc: "Receive your data in a structured, machine-readable format and transfer it to another provider.",
              },
              {
                right: "Right to Object",
                desc: "Object to processing based on legitimate interests or for direct marketing purposes.",
              },
              {
                right: "Rights Related to Automated Decision-Making",
                desc: "Not be subject to decisions based solely on automated processing that significantly affect you.",
              },
              {
                right: "Right to Withdraw Consent",
                desc: "Withdraw consent at any time where processing is based on consent (e.g. marketing emails), without affecting prior processing.",
              },
            ].map(({ right, desc }) => (
              <div key={right} className="flex gap-3">
                <span className="font-semibold text-gray-900 min-w-[200px]">
                  {right}
                </span>
                <span className="text-gray-700">{desc}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* 10 — Autoriteti mbikëqyrës — FIX #8 */}
        <Section title="10. Right to Lodge a Complaint">
          <p className="text-gray-700">
            If you believe we have not handled your personal data in accordance
            with applicable law, you have the right to lodge a complaint with
            your local data protection supervisory authority. In the EU, you can
            find your national authority at{" "}
            <a
              href="https://edpb.europa.eu/about-edpb/about-edpb/members_en"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              edpb.europa.eu
            </a>
            . We would, however, appreciate the opportunity to address your
            concerns directly before you approach the authority.
          </p>
        </Section>

        {/* 11 — Fëmijët */}
        <Section title="11. Children's Privacy">
          <p className="text-gray-700">
            Our Service is not directed at children under the age of 16. We do
            not knowingly collect personal information from children. If you
            believe a child has provided us with their data, please contact us
            and we will delete it promptly.
          </p>
        </Section>

        {/* 12 — Ndryshimet e politikës */}
        <Section title="12. Changes to This Policy">
          <p className="text-gray-700">
            We may update this Privacy Policy from time to time. When we make
            significant changes, we will notify you by email or by posting a
            prominent notice on our website. The "Last updated" date at the
            bottom of this page indicates when the policy was last revised.
            Continued use of the Service after changes constitutes acceptance of
            the updated policy.
          </p>
        </Section>

        {/* 13 — Kontakti */}
        <Section title="13. Contact">
          <p className="text-gray-700">
            For any questions, requests, or concerns regarding this Privacy
            Policy or our data practices, please contact us at:
          </p>
          <address className="not-italic mt-3 text-gray-700 space-y-1">
            <p className="font-semibold">Clothing E‑commerce</p>
            <p>
              Email:{" "}
              <a
                href="mailto:support@clothing-ecommerce.com"
                className="text-blue-600 underline"
              >
                support@clothing-ecommerce.com
              </a>
            </p>
          </address>
        </Section>

        {/* Footer — FIX #1 (text-muted → text-gray-400) + FIX #2 (<small> → <p>) */}
        <footer className="pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-400">
            Last updated: May 31, 2026
          </p>
        </footer>

      </article>
    </main>
  );
}
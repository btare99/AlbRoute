import React from "react";

// ─── FIX #9: metadata e plotë me robots noindex ───────────────────────────────
export const metadata = {
  title: "Terms and Conditions - Clothing E‑commerce",
  description:
    "Read the terms and conditions governing your use of Clothing E‑commerce, including orders, payments, returns, and your legal rights.",
  robots: "noindex, nofollow",
};

// ─── Komponentë ndihmës ───────────────────────────────────────────────────────
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
export default function TermsPage() {
  return (
    // FIX #2: mbështjellë me <article> semantik
    <main className="bg-white min-h-screen">
      <article className="mx-auto max-w-3xl px-6 py-12">

        {/* Titulli */}
        <header className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Terms and Conditions
          </h1>
          <p className="text-gray-600 text-base leading-relaxed">
            These Terms and Conditions ("Terms") govern your use of the Clothing
            E‑commerce website and services. By accessing or using the site, you
            accept these Terms in full. If you do not agree, please do not use
            the Service.
          </p>
        </header>

        {/* 1 — Përdorimi i Shërbimit */}
        <Section title="1. Use of the Service">
          <p className="text-gray-700 mb-3">
            You may use our Service only for lawful purposes and in accordance
            with these Terms. You agree not to:
          </p>
          <BulletList
            items={[
              "Provide false, inaccurate, or misleading information when creating an account or placing an order.",
              "Use the site for any illegal or unauthorised purpose.",
              "Attempt to gain unauthorised access to any part of the Service or its infrastructure.",
              "Transmit any harmful, offensive, or disruptive content.",
              "Use automated tools (bots, scrapers) to access the Service without our prior written consent.",
            ]}
          />
          <p className="text-gray-700 mt-3">
            We reserve the right to suspend or terminate access for any violation
            of these Terms.
          </p>
        </Section>

        {/* 2 — Llogaritë */}
        <Section title="2. Accounts">
          <p className="text-gray-700 mb-3">
            To place orders you may need to create an account. You are
            responsible for:
          </p>
          <BulletList
            items={[
              "Keeping your login credentials confidential.",
              "All activity that occurs under your account.",
              "Notifying us immediately at support@clothing-ecommerce.com if you suspect unauthorised access.",
            ]}
          />
          <p className="text-gray-700 mt-3">
            We may close accounts that are inactive for an extended period or
            that we reasonably believe are being misused.
          </p>
        </Section>

        {/* 3 — Porositë dhe Pagesat */}
        <Section title="3. Orders and Payments">
          <p className="text-gray-700 mb-3">
            All orders are subject to product availability and our acceptance.
            We reserve the right to refuse or cancel any order at our
            discretion. Key points:
          </p>
          <BulletList
            items={[
              "Payments are processed by third-party providers (e.g. Stripe, PayPal). We do not store full card details on our servers.",
              "An order confirmation email does not constitute final acceptance — we may cancel if stock becomes unavailable or a pricing error is identified.",
              "You must be at least 18 years old, or have parental/guardian consent, to make a purchase.",
              "All prices are shown inclusive of applicable taxes unless stated otherwise.",
            ]}
          />
        </Section>

        {/* 4 — Çmimet dhe Gabimet */}
        <Section title="4. Pricing and Errors">
          <p className="text-gray-700 mb-3">
            We make every effort to ensure accurate pricing and product
            descriptions, but errors may occasionally occur.
          </p>
          <BulletList
            items={[
              "Prices are subject to change without notice.",
              "If a pricing error is identified after your order is placed, we will contact you to either confirm the order at the correct price or cancel it with a full refund.",
              "We are not obliged to honour orders placed at an obviously erroneous price (e.g. a £500 item listed at £0.50).",
              "Product images are for illustrative purposes; actual items may vary slightly in colour due to display settings.",
            ]}
          />
        </Section>

        {/* 5 — Dërgimi dhe Kthimet — FIX: shtuar detaje */}
        <Section title="5. Shipping and Returns">
          <p className="text-gray-700 mb-3">
            Shipping and return conditions are as follows:
          </p>
          <BulletList
            items={[
              "Estimated delivery times are provided at checkout and are not guaranteed.",
              "Risk of loss or damage passes to you once the item is delivered to the address you provided.",
              "EU/UK customers have the right to cancel an order within 14 days of receiving it (Cooling-Off Period), under the Consumer Rights Directive / Consumer Contracts Regulations.",
              "To initiate a return, contact support@clothing-ecommerce.com within the applicable return window with your order number.",
              "Returned items must be unused, in original packaging, and accompanied by proof of purchase.",
              "Refunds are issued to the original payment method within 14 days of receiving the returned item.",
              "We cover return shipping costs for defective or incorrectly sent items. For change-of-mind returns, return shipping costs are the customer's responsibility unless otherwise stated.",
            ]}
          />
        </Section>

        {/* 6 — Dritat e Konsumatorit (EU/UK) — seksion i ri */}
        <Section title="6. Consumer Rights (EU / UK)">
          <p className="text-gray-700 mb-3">
            If you are a consumer in the European Union or United Kingdom, you
            have statutory rights that these Terms do not affect:
          </p>
          <BulletList
            items={[
              "Goods must be of satisfactory quality, fit for purpose, and as described.",
              "If goods are faulty, you may be entitled to a repair, replacement, or refund depending on the circumstances.",
              "You have a 14-day right to cancel a distance contract (online purchase) without giving a reason, starting from the day you receive the goods.",
              "Digital content must work as described. You are entitled to a repair, replacement, or price reduction for faulty digital content.",
            ]}
          />
          <p className="text-gray-700 mt-3">
            Nothing in these Terms limits or excludes your statutory consumer
            rights.
          </p>
        </Section>

        {/* 7 — Përgjegjësia */}
        <Section title="7. Limitation of Liability">
          <p className="text-gray-700 mb-3">
            To the fullest extent permitted by applicable law:
          </p>
          <BulletList
            items={[
              "We are not liable for indirect, incidental, special, or consequential damages arising from your use of the Service.",
              "Our total liability for any claim arising out of or related to the Service is limited to the amount you paid for the order giving rise to the claim.",
              "We are not responsible for delays or failures caused by events outside our reasonable control (force majeure), including natural disasters, strikes, or infrastructure outages.",
            ]}
          />
          <p className="text-gray-700 mt-3">
            These limitations do not apply to liability for death or personal
            injury caused by our negligence, fraud, or any other liability that
            cannot be excluded by law.
          </p>
        </Section>

        {/* 8 — Pronësia Intelektuale */}
        <Section title="8. Intellectual Property">
          <p className="text-gray-700 mb-3">
            All content on this site — including text, images, logos, product
            photography, graphics, and software — is the property of Clothing
            E‑commerce or its licensors and is protected by copyright and other
            intellectual property laws.
          </p>
          <BulletList
            items={[
              "You may not copy, reproduce, distribute, or create derivative works from any site content without our prior written permission.",
              "You may not use our trademarks or brand assets without express authorisation.",
              "User-submitted content (e.g. reviews) remains your property, but you grant us a non-exclusive licence to display it on the Service.",
            ]}
          />
        </Section>

        {/* 9 — Ligji i Zbatueshëm — seksion i ri */}
        <Section title="9. Governing Law and Disputes">
          <p className="text-gray-700 mb-3">
            These Terms are governed by and construed in accordance with
            applicable law. For EU consumers, the mandatory consumer protection
            laws of your country of residence also apply.
          </p>
          <BulletList
            items={[
              "We aim to resolve any disputes directly — please contact us first at support@clothing-ecommerce.com.",
              "EU consumers may also use the European Commission's Online Dispute Resolution (ODR) platform at ec.europa.eu/consumers/odr.",
              "Nothing in these Terms affects your right to bring proceedings in the courts of your country of residence.",
            ]}
          />
        </Section>

        {/* 10 — Ndryshimet e Kushteve */}
        <Section title="10. Changes to These Terms">
          <p className="text-gray-700">
            We may revise these Terms at any time. When we make material changes,
            we will notify you by email or by displaying a prominent notice on
            the site. Changes take effect when posted. Your continued use of the
            Service after changes are posted constitutes your acceptance of the
            updated Terms. If you do not agree to the revised Terms, you should
            stop using the Service.
          </p>
        </Section>

        {/* 11 — Kontakti */}
        <Section title="11. Contact">
          <p className="text-gray-700">
            For any questions or concerns about these Terms, please contact us:
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
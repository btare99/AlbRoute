'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
  </svg>
);

const GooglePlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
    <path d="M3.18 23.76c.3.17.64.24.99.2l13.19-11.95L13.65 8.3 3.18 23.76zm17.64-10.03L17.5 11.8l-3.8 3.44 3.8 3.44 3.35-1.95a1.34 1.34 0 0 0 0-2.99zM3.38.28C3.06.1 2.68.06 2.34.2L15.33 12 11.52 15.43 3.38.28z" />
  </svg>
);

export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: #111110;
          min-height: 100svh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2.5rem 1.25rem;
        }

        /* ── Page wrapper ── */
        .wrap {
          width: 100%;
          max-width: 360px;
          display: flex;
          flex-direction: column;
          align-items: center;
          opacity: 0;
          transform: translateY(18px);
          transition: opacity .5s ease, transform .5s ease;
        }
        .wrap.in {
          opacity: 1;
          transform: translateY(0);
        }

        /* ── Logo ── */
        .logo-wrap {
          width: 80px;
          height: 80px;
          border-radius: 20px;
          background: #1c1c1b;
          border: 1px solid #2e2e2c;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          margin-bottom: 1.75rem;
        }

        /* ── Headings ── */
        .app-name {
          font-size: 2rem;
          font-weight: 700;
          color: #f0ede8;
          letter-spacing: -.03em;
          text-align: center;
          line-height: 1;
        }

        .tagline {
          margin-top: .5rem;
          font-size: .75rem;
          font-weight: 500;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: #555451;
          text-align: center;
        }

        /* ── Description ── */
        .description {
          margin-top: 1.25rem;
          font-size: .9rem;
          line-height: 1.75;
          color: #7a7875;
          text-align: center;
          max-width: 280px;
        }

        /* ── Separator ── */
        .sep {
          width: 100%;
          height: 1px;
          background: #222220;
          margin: 2rem 0;
        }

        /* ── Buttons ── */
        .btn-group {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .btn {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 15px 20px;
          border-radius: 14px;
          text-decoration: none;
          border: 1px solid transparent;
          transition: background .18s ease, border-color .18s ease, transform .18s ease;
          cursor: pointer;
        }
        .btn:hover  { transform: translateY(-1px); }
        .btn:active { transform: scale(.99); }
        .btn:focus-visible { outline: 2px solid #f0ede8; outline-offset: 3px; }

        .btn-primary {
          background: #f0ede8;
          border-color: #f0ede8;
          color: #111110;
        }
        .btn-primary:hover { background: #ffffff; border-color: #ffffff; }

        .btn-secondary {
          background: transparent;
          border-color: #2e2e2c;
          color: #f0ede8;
        }
        .btn-secondary:hover { background: #1c1c1b; border-color: #3e3e3c; }

        .btn-icon { flex-shrink: 0; display: flex; align-items: center; }

        .btn-label { display: flex; flex-direction: column; }
        .btn-sub  {
          font-size: .67rem;
          font-weight: 500;
          letter-spacing: .04em;
          line-height: 1;
          margin-bottom: 2px;
        }
        .btn-main {
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: -.01em;
          line-height: 1.15;
        }

        .btn-primary .btn-sub  { color: #777470; }
        .btn-primary .btn-main { color: #111110; }
        .btn-secondary .btn-sub  { color: #555451; }
        .btn-secondary .btn-main { color: #f0ede8; }

        /* ── Footer ── */
        .footer {
          margin-top: 2.25rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: .55rem;
        }
        .copy {
          font-size: .72rem;
          color: #3e3e3c;
        }
        .footer-links {
          display: flex;
          gap: 20px;
        }
        .footer-links a {
          font-size: .72rem;
          color: #555451;
          text-decoration: none;
          transition: color .15s;
        }
        .footer-links a:hover { color: #a0a09d; }
        .footer-links a:focus-visible { outline: 2px solid #f0ede8; outline-offset: 2px; border-radius: 2px; }
      `}</style>

      <div className={`wrap${mounted ? ' in' : ''}`}>

        {/* Logo */}
        <div className="logo-wrap">
          <Image
            src="/logo.png"
            alt="Urbani IM logo"
            width={56}
            height={56}
            priority
            className="object-contain"
          />
        </div>

        {/* Heading */}
        <h1 className="app-name">Urbani IM</h1>
        <p className="tagline">Smart Transportation Solution</p>

        {/* Description */}
        <p className="description">
          Track buses, plan your journey, and travel smarter through the city — all in one place.
        </p>

        <div className="sep" aria-hidden="true" />

        {/* Buttons */}
        <div className="btn-group">
          <a
            href="https://apps.apple.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            aria-label="Download Urbani IM on the App Store"
          >
            <span className="btn-icon" aria-hidden="true"><AppleIcon /></span>
            <span className="btn-label">
              <span className="btn-sub">Download on the</span>
              <span className="btn-main">App Store</span>
            </span>
          </a>

          <a
            href="https://play.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            aria-label="Get Urbani IM on Google Play"
          >
            <span className="btn-icon" aria-hidden="true"><GooglePlayIcon /></span>
            <span className="btn-label">
              <span className="btn-sub">Get it on</span>
              <span className="btn-main">Google Play</span>
            </span>
          </a>
        </div>

        {/* Footer */}
        <footer className="footer">
          <p className="copy">Urbani IM &copy; {new Date().getFullYear()}</p>
          <nav className="footer-links" aria-label="Legal links">
            <a href="/terms-and-conditions">Terms and Conditions</a>
            <a href="/privacy-policy">Privacy Policy</a>
          </nav>
        </footer>

      </div>
    </>
  );
}
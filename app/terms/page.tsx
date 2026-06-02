import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions - Urbani Im",
  description: "Terms and Conditions for Urbani Im.",
  robots: "noindex, nofollow",
};

// Place your existing Terms component in the same folder as
// `TermsPage.tsx` and export it as the default export.

import TermsPage from "./TermsPage";

export default function Page() {
  return (
    <div className="px-6 py-12 bg-white text-gray-700">
      <div className="max-w-4xl mx-auto">
        <TermsPage />
      </div>
    </div>
  );
}

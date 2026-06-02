import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Urbani Im",
  description: "Privacy Policy for Urbani Im.",
  robots: "noindex, nofollow",
};

// Place your existing full GDPR-compliant component in the same folder as
// `PrivacyPolicyPage.tsx` and export it as the default export.
// This page file simply mounts that component so the route is `/privacy`.

import PrivacyPolicyPage from "./PrivacyPolicyPage";

export default function Page() {
  return (
    <div className="px-6 py-12 bg-white text-gray-700">
      <div className="max-w-4xl mx-auto">
        <PrivacyPolicyPage />
      </div>
    </div>
  );
}

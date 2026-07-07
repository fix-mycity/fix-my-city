import React from "react";
import { useNavigate } from "react-router-dom";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="antialiased min-h-screen bg-background text-on-surface flex flex-col font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/30">
        <div className="flex justify-between items-center w-full px-4 md:px-8 max-w-3xl mx-auto h-16">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-primary hover:text-secondary transition-colors font-semibold"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            <span>Back</span>
          </button>
          <div className="flex items-center gap-2">
            <span
              className="material-symbols-outlined text-secondary-container"
              style={{ fontVariationSettings: "'FILL' 1", fontSize: "24px" }}
            >
              location_city
            </span>
            <span className="text-lg font-bold text-primary tracking-tight">
              Fix My City
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-24 pb-16 px-4 max-w-3xl mx-auto w-full">
        <div className="bg-surface-container-lowest p-6 md:p-10 rounded-2xl shadow-card border border-outline-variant/20">
          <h1 className="font-display-lg text-3xl text-text-primary mb-2">
            Privacy Policy
          </h1>
          <p className="text-body-md text-text-muted mb-8">
            Last updated: July 7, 2026
          </p>

          <div className="space-y-6 text-on-surface-variant leading-relaxed">
            <section>
              <h2 className="font-headline-kpi text-lg text-text-primary font-bold mb-2">
                1. Information We Collect
              </h2>
              <p>
                We collect your username, email address, state, district, and pincode during registration. We also collect the text descriptions and photos that you submit in your civic reports.
              </p>
            </section>

            <section>
              <h2 className="font-headline-kpi text-lg text-text-primary font-bold mb-2">
                2. How We Use Information
              </h2>
              <p>
                We use your details to verify your account via OTP, publish your reports, and coordinate with municipal authorities to help resolve issues in your area.
              </p>
            </section>

            <section>
              <h2 className="font-headline-kpi text-lg text-text-primary font-bold mb-2">
                3. Information Sharing
              </h2>
              <p>
                Civic reports, including location coordinates, descriptions, and uploaded photos, are shared with municipal authorities. We do not sell or lease your personal contact information to third parties.
              </p>
            </section>

            <section>
              <h2 className="font-headline-kpi text-lg text-text-primary font-bold mb-2">
                4. Data Security
              </h2>
              <p>
                We implement standard security measures, including password hashing and encrypted data transmission, to safeguard your information from unauthorized access.
              </p>
            </section>

            <section>
              <h2 className="font-headline-kpi text-lg text-text-primary font-bold mb-2">
                5. Your Rights
              </h2>
              <p>
                You can request the deletion of your account and your submitted data at any time. Once requested, your personal data will be permanently removed.
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-lowest border-t border-outline-variant/30 py-6 text-center text-body-sm text-text-muted">
        <p>&copy; {new Date().getFullYear()} Fix My City. All rights reserved.</p>
      </footer>
    </div>
  );
}

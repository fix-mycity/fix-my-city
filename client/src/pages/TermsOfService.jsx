import React from "react";
import { useNavigate } from "react-router-dom";

export default function TermsOfService() {
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
            Terms of Service
          </h1>
          <p className="text-body-md text-text-muted mb-8">
            Last updated: July 7, 2026
          </p>

          <div className="space-y-6 text-on-surface-variant leading-relaxed">
            <section>
              <h2 className="font-headline-kpi text-lg text-text-primary font-bold mb-2">
                1. Acceptance of Terms
              </h2>
              <p>
                By creating an account or using the Fix My City platform, you agree to be bound by these Terms of Service. If you do not agree, please do not use the application.
              </p>
            </section>

            <section>
              <h2 className="font-headline-kpi text-lg text-text-primary font-bold mb-2">
                2. User Accounts
              </h2>
              <p>
                To submit civic reports, you must register and verify your account via OTP. You are responsible for all activities under your account and for keeping your OTP and credentials secure.
              </p>
            </section>

            <section>
              <h2 className="font-headline-kpi text-lg text-text-primary font-bold mb-2">
                3. Content Guidelines
              </h2>
              <p>
                You agree to report genuine civic issues and upload accurate details and photos. Submitting defamatory, fake, offensive, or copyrighted material is prohibited.
              </p>
            </section>

            <section>
              <h2 className="font-headline-kpi text-lg text-text-primary font-bold mb-2">
                4. License to Content
              </h2>
              <p>
                By submitting reports and photos, you grant us the right to share the report contents, location, and photos with local municipal authorities to help resolve the issues.
              </p>
            </section>

            <section>
              <h2 className="font-headline-kpi text-lg text-text-primary font-bold mb-2">
                5. Limitation of Liability
              </h2>
              <p>
                Fix My City is a platform designed to connect citizens with local authorities. We do not guarantee that every submitted issue will be resolved by the government.
              </p>
            </section>

            <section>
              <h2 className="font-headline-kpi text-lg text-text-primary font-bold mb-2">
                6. Changes to Terms
              </h2>
              <p>
                We reserve the right to modify these Terms of Service at any time. Your continued use of the platform constitutes acceptance of the updated terms.
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

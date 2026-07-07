import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleReportClick = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="antialiased min-h-screen flex flex-col font-sans text-on-surface bg-[#F7F9FC]">
      <header
        id="top-nav"
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 border-b border-outline-variant/30 backdrop-blur-md ${
          isScrolled
            ? "bg-surface-container-lowest/95 shadow-md"
            : "bg-background/80"
        }`}
      >
        <div className="flex justify-between items-center w-full px-4 md:px-8 max-w-7xl mx-auto h-20">
          <a href="#" className="flex items-center gap-2 cursor-pointer">
            <span
              className="material-symbols-outlined text-secondary-container"
              style={{ fontVariationSettings: "'FILL' 1", fontSize: "32px" }}
            >
              location_city
            </span>
            <span className="text-xl md:text-2xl font-bold text-primary tracking-tight">
              Fix My City
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-8">
            <a className="text-on-surface-variant hover:text-primary transition-colors text-base hover:bg-surface-container-low rounded-lg px-3 py-2" href="#how-it-works">How It Works</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors text-base hover:bg-surface-container-low rounded-lg px-3 py-2" href="#features">Features</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors text-base hover:bg-surface-container-low rounded-lg px-3 py-2" href="#for-government">For Government</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors text-base hover:bg-surface-container-low rounded-lg px-3 py-2" href="#testimonials">Stories</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <button onClick={() => navigate("/login")} className="text-base text-primary font-semibold hover:text-primary-container transition-colors px-3 py-2">
              Log In
            </button>
            <button onClick={() => navigate("/register")} className="bg-secondary-container text-on-secondary-fixed font-semibold px-6 py-2.5 rounded-lg hover:bg-secondary-fixed transition-all active:scale-95 duration-150 shadow-sm hover:shadow-[0_0_4px_0px_#50d9fe]">
              Sign Up
            </button>
          </div>

          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-primary p-2 focus:outline-none" aria-label="Toggle Menu">
            <span className="material-symbols-outlined">{isMobileMenuOpen ? "close" : "menu"}</span>
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-surface-container-lowest border-b border-outline-variant/30 px-6 py-4 shadow-lg flex flex-col gap-4 animate-fadeIn">
            <a onClick={() => setIsMobileMenuOpen(false)} className="text-on-surface-variant font-medium py-2 hover:text-primary" href="#how-it-works">How It Works</a>
            <a onClick={() => setIsMobileMenuOpen(false)} className="text-on-surface-variant font-medium py-2 hover:text-primary" href="#features">Features</a>
            <a onClick={() => setIsMobileMenuOpen(false)} className="text-on-surface-variant font-medium py-2 hover:text-primary" href="#for-government">For Government</a>
            <a onClick={() => setIsMobileMenuOpen(false)} className="text-on-surface-variant font-medium py-2 hover:text-primary" href="#testimonials">Stories</a>
            <hr className="border-outline-variant/20" />
            <div className="flex flex-col gap-3 pt-2">
              <button onClick={() => { setIsMobileMenuOpen(false); navigate("/login"); }} className="w-full text-center py-2.5 text-primary font-semibold border border-primary rounded-lg">
                Log In
              </button>
              <button onClick={() => { setIsMobileMenuOpen(false); navigate("/register"); }} className="w-full bg-secondary-container text-on-secondary-fixed font-semibold py-2.5 rounded-lg shadow-sm">
                Sign Up
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow flex flex-col pt-20">
        <section className="relative py-16 md:py-24 overflow-hidden px-4 md:px-8 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-6 z-10">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary leading-tight">
                Report It. <span className="text-secondary-container">Track It.</span> Fix It.
              </h1>
              <p className="text-on-surface-variant text-base md:text-lg max-w-xl leading-relaxed">
                A smarter way for citizens and city governments to work together and resolve issues faster. Modern infrastructure management powered by community action.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <button onClick={handleReportClick} className="bg-secondary-container text-on-secondary-fixed font-semibold px-8 py-3 rounded-lg hover:bg-secondary-fixed transition-all active:scale-95 duration-150 shadow-sm flex items-center justify-center gap-2 hover:shadow-[0_0_4px_0px_#50d9fe]">
                  <span className="material-symbols-outlined">report</span>
                  Report an Issue
                </button>
                <a href="#how-it-works" className="border-2 border-primary text-primary font-semibold px-8 py-3 rounded-lg hover:bg-surface-container-low transition-colors active:scale-95 duration-150 flex items-center justify-center gap-2 bg-transparent">
                  <span className="material-symbols-outlined">info</span>
                  Learn More
                </a>
              </div>
            </div>

            <div className="relative z-10 w-full h-[400px] md:h-[500px] rounded-xl bg-surface-container-lowest border border-outline-variant/30 overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.18),0_0_25px_rgba(59,130,246,0.12)] hover:shadow-[0_30px_70px_rgba(0,0,0,0.28),0_0_40px_rgba(59,130,246,0.18)] hover:-translate-y-2 transition-all duration-500 ease-out">
              <img alt="Digital Smart City Map" className="w-full h-full object-cover rounded-xl transition-transform duration-700 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBtQhek4Sh7fO2k6r8LJ2UojP-D_eGaIRX6AyoJDNoJO45ifexoBVunlG8aUe7S25jQ3zUuxJb_3tfiYyuGKGFazVlJX96NRWHNne9dnia_x16c0GVgbrvMrEjNHk2Edji0YBX21zypvNDYjNq1J0Dmo2xzw3fo4q5GLKoMWjCa_49UPB1w-PbJQcNw9ZI78v3XYHW3Udvd4jQIptLt-FPUdxZOHrDx994_uK4BUiCC6ALHSpaKLBisgNpbpWCOgY4JvaqAInP0F-E1" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent pointer-events-none"></div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-secondary-container/20 rounded-full blur-2xl pointer-events-none"></div>
            </div>
          </div>
          <div className="absolute top-0 right-0 -z-0 opacity-10 pointer-events-none w-1/2 h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent"></div>
        </section>

        <section className="bg-surface-container-lowest border-y border-outline-variant/30 py-8 px-4 md:px-8 w-full">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-x-0 md:divide-x md:divide-outline-variant/30">
              <div className="flex flex-col items-center justify-center text-center px-4">
                <span className="text-3xl font-bold text-primary mb-1">12,400+</span>
                <span className="text-xs text-on-surface-variant uppercase tracking-widest font-semibold">Issues Resolved</span>
              </div>
              <div className="flex flex-col items-center justify-center text-center px-4">
                <span className="text-3xl font-bold text-primary mb-1">48hr</span>
                <span className="text-xs text-on-surface-variant uppercase tracking-widest font-semibold">Avg Response</span>
              </div>
              <div className="flex flex-col items-center justify-center text-center px-4">
                <span className="text-3xl font-bold text-primary mb-1">25</span>
                <span className="text-xs text-on-surface-variant uppercase tracking-widest font-semibold">Departments</span>
              </div>
              <div className="flex flex-col items-center justify-center text-center px-4">
                <span className="text-3xl font-bold text-primary mb-1">98%</span>
                <span className="text-xs text-on-surface-variant uppercase tracking-widest font-semibold">Satisfaction</span>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-24 px-4 md:px-8 max-w-7xl mx-auto w-full scroll-mt-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">How It Works</h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto text-base">
              A streamlined process turning civic complaints into actionable, resolved infrastructure improvements.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { id: "1. Report an Issue", desc: "Submit details, location, and photos in seconds via our intuitive app.", icon: "add_a_photo" },
              { id: "2. AI Classifies", desc: "Our system automatically routes issues to the right department.", icon: "smart_toy" },
              { id: "3. Team Resolves", desc: "Local teams are dispatched to address the problem on the ground.", icon: "engineering" },
              { id: "4. Get Notified", desc: "Track progress transparently and receive real-time status updates.", icon: "notifications_active" },
            ].map((step, idx) => (
              <div key={idx} className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30 hover:border-secondary-container/50 transition-all flex flex-col items-start gap-4 group">
                <div className="w-12 h-12 rounded-lg bg-surface-container-low flex items-center justify-center text-primary group-hover:bg-secondary-container group-hover:text-on-secondary-fixed transition-colors">
                  <span className="material-symbols-outlined">{step.icon}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-primary mb-2">{step.id}</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="py-24 bg-surface-container-low px-4 md:px-8 w-full scroll-mt-20">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Comprehensive Coverage</h2>
                <p className="text-on-surface-variant max-w-xl text-base">
                  One platform to manage all aspects of civic infrastructure and reporting.
                </p>
              </div>
              <button onClick={() => navigate("/features")} className="text-primary font-semibold hover:text-primary-container transition-colors flex items-center gap-1 group">
                View All Categories
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
              <div className="md:col-span-2 bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30 flex flex-col md:flex-row gap-6 items-center overflow-hidden relative group">
                <div className="flex-1 z-10 flex flex-col justify-center h-full">
                  <div className="w-10 h-10 rounded bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined">insights</span>
                  </div>
                  <h3 className="text-lg font-bold text-primary mb-2">AI-Powered Insights</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">
                    Predictive analytics help city managers allocate resources efficiently by anticipating maintenance needs before critical failures occur.
                  </p>
                </div>
                <div className="flex-1 w-full h-full relative z-0 opacity-80 group-hover:opacity-100 transition-opacity">
                  <img className="absolute inset-0 w-full h-full object-cover object-left rounded-lg shadow-sm border border-outline-variant/20" alt="Data Analytics Visualization Layout Mockup" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXyEZCcTBKYm-upEoEhl9z4-pg5lXlUBFXFCc3rmCl34UUbohpgsLgNg7iaW6T0qC9zT2SFFEbJsbiTL8YzM5EbkgoL3IlOCPzZ5wa1z3zMoyJ4cFdtkYpB0XjPVhPxOJb3odoVwFP_AxJDu-xeyn0z2nGan8qBk84FuKlRfFuJgHXHquq2RLa9YfWPhbbAQDe70xo24UOZvQt9YpLsS_7HgMxr9XlneREQSSoJjwaonOAxWRLg9tyAe862Int1D39ROE1frl8CA" />
                </div>
              </div>

              {[
                { title: "Traffic Monitoring", desc: "Report potholes, broken lights, and signage issues.", icon: "traffic" },
                { title: "Waste Management", desc: "Manage missed collections and illegal dumping reports.", icon: "recycling" },
                { title: "Water Management", desc: "Track leaks, pressure issues, and water quality concerns.", icon: "water_drop" },
                { title: "Emergency Response", desc: "Rapid escalation protocols for hazards requiring immediate action.", icon: "emergency_share" },
              ].map((feat, idx) => (
                <div key={idx} className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined">{feat.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-primary mb-2">{feat.title}</h3>
                    <p className="text-on-surface-variant text-sm">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="for-government" className="py-24 bg-[#F7F9FC] px-4 md:px-8 w-full relative overflow-hidden border-y border-outline-variant/20 scroll-mt-20">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="aspect-[4/3] rounded-xl shadow-sm bg-surface-container-lowest border border-outline-variant/30 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
                <img className="w-full h-full object-cover object-top p-4 bg-surface-container-low" alt="Administrative Portal Interface Preview" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAy7FNLgyj00Uh5j_6EAMm69zAboZxT0PAcZLaVJoNX2_1wwd8cyZqnko5oGPkD0mnllzfoN5UYpZnFvrEdR3RRkfMLdjfA4oNaxHkWFDnsqM0VQgHojO0oz9QChqkfjmvKDTcCxBTXaReer0wnozNHMjggCbLRNs1MDhdp5MYdqmzYjVHLlZ8VpnA8sE5H2Hp616CgTVRbZskbIVlhlVoipeV3iY_ymh11IPE-c-cttT3jf0eFZSumXYwnnmPXDJQFeoDdya3iAg" />
              </div>
              <div className="absolute -bottom-6 -right-6 md:right-8 bg-surface-container-lowest p-4 rounded-lg shadow-lg border border-outline-variant/30 flex items-center gap-4 z-10 w-64">
                <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-600 flex items-center justify-center">
                  <span className="material-symbols-outlined">trending_up</span>
                </div>
                <div>
                  <p className="text-[10px] tracking-widest font-semibold text-on-surface-variant uppercase">Efficiency Gain</p>
                  <p className="text-xl font-bold text-primary">+42% resolution rate</p>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2 flex flex-col gap-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary w-max font-semibold text-xs uppercase tracking-wider">
                <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                Public Sector
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-primary">Built for City Administrators</h2>
              <p className="text-on-surface-variant text-base md:text-lg leading-relaxed">
                Equip your departments with a centralized command center. Fix My City provides robust coordination tools, automated dispatch logic, and comprehensive reporting to help local governments do more with less while maintaining transparency.
              </p>
              <ul className="flex flex-col gap-3 mt-2 mb-4">
                {[
                  "Cross-departmental task assignment",
                  "SLA tracking and automated escalations",
                  "Public dashboard generation",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-on-surface">
                    <span className="material-symbols-outlined text-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
                      check_circle
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate("/demo")} className="bg-primary text-on-primary font-semibold px-8 py-3 rounded-lg hover:bg-primary-container transition-colors active:scale-95 duration-150 shadow-sm w-max">
                Request a Demo
              </button>
            </div>
          </div>
        </section>

        <section id="testimonials" className="py-24 px-4 md:px-8 max-w-7xl mx-auto w-full relative scroll-mt-20">
          <div className="text-center mb-16 relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Trusted by Communities</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div className="bg-surface-container-lowest/80 backdrop-blur-md p-8 rounded-xl shadow-sm border border-outline-variant/30 flex flex-col gap-6 relative">
              <span className="material-symbols-outlined text-secondary-container/20 text-6xl absolute top-4 right-4">format_quote</span>
              <p className="text-primary italic text-lg relative z-10 leading-relaxed">
                "The app completely changed how we interact with the city. I reported a broken streetlight on my street, and within 48 hours I got a notification that a crew was dispatched. It actually feels like our voices are heard now."
              </p>
              <div className="flex items-center gap-4 mt-auto">
                <div className="w-12 h-12 rounded-full bg-surface-container-low border border-outline-variant/30 overflow-hidden">
                  <img className="w-full h-full object-cover" alt="Sarah Jenkins" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDTNgN-j5P-Y8R2CigFi5MNrmPNbyFq7RkEYXnyw91mFb97ualKxcECjwX9eZypQI4tn3_H1n6Vir-5hCsRaX4dNIW1H0Gg84_cGxfUpC2GxWMHHtah4IQ8Rvtb5b_opbWF9uwVaM-2uxWQD-D0ab7-r0VaRo1nB9-51MmrPCrQAp6HWPX259YJsR1t_KRGfFPGidrvkoEjcU7m_jJX48GkLM1srkfvAZGx_yR3FUTSlGzHZwDfFhPaZWitWCPncJ3pVHlHgqfJlg" />
                </div>
                <div>
                  <p className="font-bold text-primary text-base">Sarah Jenkins</p>
                  <p className="text-[10px] tracking-widest text-on-surface-variant font-semibold uppercase">Local Resident</p>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest/80 backdrop-blur-md p-8 rounded-xl shadow-sm border border-outline-variant/30 flex flex-col gap-6 relative">
              <span className="material-symbols-outlined text-secondary-container/20 text-6xl absolute top-4 right-4">format_quote</span>
              <p className="text-primary italic text-lg relative z-10 leading-relaxed">
                "As a department head, the automated triage is a lifesaver. We no longer spend hours sorting emails and calls; issues come in categorized with location data attached. Our resolution times have dropped by half."
              </p>
              <div className="flex items-center gap-4 mt-auto">
                <div className="w-12 h-12 rounded-full bg-surface-container-low border border-outline-variant/30 overflow-hidden">
                  <img className="w-full h-full object-cover" alt="Marcus Thorne" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZb2R2cAPcCsyzZeS15V1h1GzK0S1O_LUDBtXvZpPSn34Tw56DXtxHU8Gw-rHcdyhsBBISkWHW5vkX6S8pn80DtYl8V_j27A2fVnHUH2YHY8QfWTjWcHfXFDd0HzA5myZwiDvpZDV3g5eCiRYVgXGK54M0FBTt7a0X-rm2sbey6C6GMqLiaRUpojaz17gbxkkhi8PKL-P7xzLv6D52n-cV-H5MNd7L-6-nc77uzfU_NveMYkPsA5ssQwxltkuKYQgPY1DGu8hJ1Q" />
                </div>
                <div>
                  <p className="font-bold text-primary text-base">Marcus Thorne</p>
                  <p className="text-[10px] tracking-widest text-on-surface-variant font-semibold uppercase">Director of Public Works</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full bg-[#1A365D] py-20 px-4 md:px-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "24px 24px" }}></div>
          <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center gap-8">
            <h2 className="text-3xl md:text-4xl font-bold text-on-primary">Ready to make your city better?</h2>
            <p className="text-on-primary/80 text-lg max-w-2xl leading-relaxed">
              Join thousands of citizens and proactive governments building smarter, safer, and more responsive communities today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto">
              <button onClick={() => navigate("/register")} className="bg-secondary-container text-on-secondary-fixed font-semibold px-10 py-4 rounded-lg hover:bg-secondary-fixed transition-all active:scale-95 duration-150 shadow-sm text-lg w-full sm:w-auto hover:shadow-[0_0_4px_0px_#50d9fe]">
                Get Started
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-primary w-full text-on-primary py-12 px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="flex flex-col gap-4 mb-8 md:mb-0 max-w-xs">
            <a href="#" className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary-container" style={{ fontVariationSettings: "'FILL' 1", fontSize: "28px" }}>location_city</span>
              <span className="text-xl font-bold text-secondary-container">Fix My City</span>
            </a>
            <p className="text-sm opacity-80 mt-2">
              © 2026 Fix My City. Empowering communities through smart infrastructure.
            </p>
          </div>

          <div className="flex flex-wrap gap-12 md:gap-24">
            <div className="flex flex-col gap-3">
              <h4 className="text-secondary-container font-semibold uppercase tracking-wider text-xs mb-2">Product</h4>
              <a className="text-sm opacity-80 hover:opacity-100 transition-colors hover:underline" href="#features">Features</a>
              <a className="text-sm opacity-80 hover:opacity-100 transition-colors hover:underline" href="#for-government">For Government</a>
              <button onClick={() => navigate("/docs")} className="text-left text-sm font-bold text-secondary-fixed hover:underline">API Documentation</button>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="text-secondary-container font-semibold uppercase tracking-wider text-xs mb-2">Company</h4>
              <button onClick={() => navigate("/about")} className="text-left text-sm opacity-80 hover:opacity-100 transition-colors hover:underline">About Us</button>
              <button onClick={() => navigate("/contact")} className="text-left text-sm font-bold text-secondary-fixed hover:underline">Contact Support</button>
              <button onClick={() => navigate("/careers")} className="text-left text-sm opacity-80 hover:opacity-100 transition-colors hover:underline">Careers</button>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="text-secondary-container font-semibold uppercase tracking-wider text-xs mb-2">Legal</h4>
              <button onClick={() => navigate("/terms")} className="text-left text-sm font-bold text-secondary-fixed hover:underline">Terms of Service</button>
              <button onClick={() => navigate("/privacy")} className="text-left text-sm font-bold text-secondary-fixed hover:underline">Privacy Policy</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
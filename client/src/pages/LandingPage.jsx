import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function LandingPage() {
  const navigate = useNavigate();
  // Ensure your Redux state matches this structure, or provide a fallback
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated || false);

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
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
    <div className="antialiased min-h-screen flex flex-col font-sans text-slate-900 bg-slate-50">
      
      {/* Navigation - Uses Footer Color Theme */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
          isScrolled ? "bg-[#1A365D] shadow-lg py-2" : "bg-[#1A365D] py-4"
        }`}
      >
        <div className="flex justify-between items-center w-full px-6 md:px-12 max-w-7xl mx-auto h-16">
          <a href="#" className="flex items-center gap-2 cursor-pointer text-white">
            <span className="material-symbols-outlined text-3xl text-blue-400">
              location_city
            </span>
            <span className="text-xl md:text-2xl font-bold tracking-tight">
              Fix My City
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-8">
            <a className="text-slate-300 hover:text-white transition-colors font-medium" href="#how-it-works">How It Works</a>
            <a className="text-slate-300 hover:text-white transition-colors font-medium" href="#features">Features</a>
            <button onClick={() => navigate("/worker")} className="text-blue-300 hover:text-white transition-colors font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-base">engineering</span>
              Field Operations
            </button>
            <a className="text-slate-300 hover:text-white transition-colors font-medium" href="#testimonials">Stories</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <button onClick={() => navigate("/login")} className="text-white font-semibold hover:text-blue-300 transition-colors px-3 py-2">
              Log In
            </button>
            <button onClick={() => navigate("/register")} className="bg-blue-500 text-white font-bold px-6 py-2.5 rounded-lg hover:bg-blue-400 transition-colors shadow-sm">
              Sign Up
            </button>
          </div>

          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-white p-2">
            <span className="material-symbols-outlined text-2xl">{isMobileMenuOpen ? "close" : "menu"}</span>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#1A365D] border-t border-slate-700 px-6 py-4 flex flex-col gap-4 shadow-xl">
            <a onClick={() => setIsMobileMenuOpen(false)} className="text-slate-200 font-medium py-2" href="#how-it-works">How It Works</a>
            <a onClick={() => setIsMobileMenuOpen(false)} className="text-slate-200 font-medium py-2" href="#features">Features</a>
            <button onClick={() => { setIsMobileMenuOpen(false); navigate("/worker"); }} className="text-left text-blue-300 font-bold py-2 flex items-center gap-2">
              <span className="material-symbols-outlined">engineering</span>
              Field Operations Portal
            </button>
            <a onClick={() => setIsMobileMenuOpen(false)} className="text-slate-200 font-medium py-2" href="#testimonials">Stories</a>
            <hr className="border-slate-700" />
            <button onClick={() => { setIsMobileMenuOpen(false); navigate("/login"); }} className="w-full text-center py-2.5 text-white font-semibold border border-slate-500 rounded-lg">
              Log In
            </button>
            <button onClick={() => { setIsMobileMenuOpen(false); navigate("/register"); }} className="w-full bg-blue-500 text-white font-bold py-2.5 rounded-lg">
              Sign Up
            </button>
          </div>
        )}
      </header>

      <main className="flex-grow flex flex-col mt-20 md:mt-24">
        
        {/* Hero Section - Uses Footer Color Theme */}
        <section className="bg-[#1A365D] text-white py-16 md:py-20 px-6 md:px-12 w-full">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
                Report It. <span className="text-blue-400">Track It.</span> Fix It.
              </h1>
              <p className="text-slate-300 text-lg md:text-xl max-w-xl leading-relaxed">
                A smarter way for citizens, field officers, and city authorities to work together. Report local issues in seconds and watch your community improve.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <button onClick={handleReportClick} className="bg-blue-500 text-white font-bold px-8 py-4 rounded-lg hover:bg-blue-400 transition-colors shadow-lg flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">report</span>
                  Report an Issue
                </button>
                <button onClick={() => navigate("/worker")} className="border-2 border-blue-400 text-blue-200 font-bold px-8 py-4 rounded-lg hover:bg-blue-900/50 transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">engineering</span>
                  Field Worker Portal
                </button>
              </div>
            </div>

            {/* Kerala (Manjeri) Map Embed */}
            <div className="w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-700">
              <iframe
                title="Kerala Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d62650.08882046808!2d76.08271168128362!3d11.121511210816997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba6368d1975e535%3A0xb9db5c51a9675204!2sManjeri%2C%20Kerala!5e0!3m2!1sen!2sin!4v1698144000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </section>

        {/* Quick Stats Section */}
        <section className="bg-white border-b border-slate-200 py-10 px-6 w-full">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x-0 md:divide-x md:divide-slate-200">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-extrabold text-[#1A365D]">12,400+</span>
              <span className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-1">Issues Resolved</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-extrabold text-[#1A365D]">48hr</span>
              <span className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-1">Avg Response</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-extrabold text-[#1A365D]">25</span>
              <span className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-1">Departments</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-extrabold text-[#1A365D]">98%</span>
              <span className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-1">Satisfaction</span>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 px-6 md:px-12 max-w-7xl mx-auto w-full scroll-mt-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1A365D] mb-4">How It Works</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">
              A simple process turning civic complaints into actionable improvements.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "1. Report Issue", desc: "Submit details, location, and photos.", icon: "add_a_photo" },
              { title: "2. Auto Route", desc: "System directs it to the right department.", icon: "smart_toy" },
              { title: "3. Fast Fix", desc: "Local field officers address the problem.", icon: "engineering" },
              { title: "4. Get Updates", desc: "Receive real-time status notifications.", icon: "notifications_active" },
            ].map((step, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-3xl">{step.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-[#1A365D] mb-3">{step.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-slate-100 px-6 md:px-12 w-full scroll-mt-24">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#1A365D] mb-4">What You Can Report</h2>
              <p className="text-slate-600 max-w-xl mx-auto text-lg">
                One platform to manage all aspects of your city's infrastructure.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Roads & Traffic", desc: "Report potholes, broken signals, and signage issues.", icon: "traffic" },
                { title: "Waste & Sanitation", desc: "Manage missed collections and illegal dumping.", icon: "recycling" },
                { title: "Water & Pipes", desc: "Track leaks, blockages, and water quality concerns.", icon: "water_drop" },
                { title: "Public Lighting", desc: "Report broken streetlights and electrical hazards.", icon: "lightbulb" },
              ].map((feat, idx) => (
                <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
                  <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-2xl">{feat.icon}</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#1A365D] mb-2">{feat.title}</h3>
                  <p className="text-slate-600 text-sm">{feat.desc}</p>
                </div>
              ))}
            </div>

            {/* Dedicated Worker Banner inside Landing Page */}
            <div className="mt-12 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 rounded-3xl p-8 md:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 border border-slate-700">
              <div className="space-y-3 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider">
                  <span className="material-symbols-outlined text-sm">handyman</span>
                  Field Workforce Portal
                </div>
                <h3 className="text-2xl md:text-3xl font-extrabold">Are you a Municipal Field Officer?</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Access real-time task dispatches, update your duty availability status, and manage leave applications directly on the officer portal.
                </p>
              </div>

              <button 
                onClick={() => navigate("/worker")}
                className="bg-blue-500 hover:bg-blue-400 text-white font-extrabold px-8 py-4 rounded-2xl shadow-lg transition-all flex items-center gap-2 shrink-0"
              >
                <span className="material-symbols-outlined">engineering</span>
                Open Worker Portal
              </button>
            </div>

          </div>
        </section>

        {/* Testimonials / Stories (Malayalam Content) */}
        <section id="testimonials" className="py-20 px-6 md:px-12 max-w-5xl mx-auto w-full scroll-mt-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1A365D]">Trusted by Communities</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Malayalam Testimonial 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
              <span className="material-symbols-outlined text-blue-100 text-5xl mb-4">format_quote</span>
              <p className="text-slate-700 italic text-lg mb-8 flex-grow font-malayalam leading-relaxed">
                "ഈ ആപ്പ് ഞങ്ങളുടെ നഗരവുമായുള്ള ഇടപെടലുകൾ പൂർണ്ണമായും മാറ്റിമറിച്ചു. കേടായ ഒരു തെരുവുവിളക്കിനെക്കുറിച്ച് ഞാൻ റിപ്പോർട്ട് ചെയ്തു, 48 മണിക്കൂറിനുള്ളിൽ തന്നെ അധികൃതർ അത് നന്നാക്കാൻ എത്തി."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden">
                  <img className="w-full h-full object-cover" alt="Ramees" src="https://images.unsplash.com/photo-1592009309602-1dde752490ae?q=80&w=200&auto=format&fit=crop" />
                </div>
                <div>
                  <p className="font-bold text-[#1A365D]">Ramees</p>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">പ്രദേശവാസി</p>
                </div>
              </div>
            </div>

            {/* Malayalam Testimonial 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
              <span className="material-symbols-outlined text-blue-100 text-5xl mb-4">format_quote</span>
              <p className="text-slate-700 italic text-lg mb-8 flex-grow font-malayalam leading-relaxed">
                "ഇത് ഉപയോഗിക്കാൻ വളരെ എളുപ്പമാണ്. ജോലിക്ക് പോകുന്ന വഴിയിൽ കണ്ട വലിയൊരു കുഴിയുടെ ചിത്രം ഞാൻ അപ്‌ലോഡ് ചെയ്തു, അത് ശരിയാക്കിയപ്പോൾ എനിക്ക് അറിയിപ്പും ലഭിച്ചു."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden">
                  <img className="w-full h-full object-cover" alt="Rahul Nair" src="https://images.unsplash.com/photo-1552058544-f2b08422138a?q=80&w=200&auto=format&fit=crop" />
                </div>
                <div>
                  <p className="font-bold text-[#1A365D]">Rahul Nair</p>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">സ്ഥിരം യാത്രക്കാരൻ</p>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-[#1A365D] w-full text-white py-12 px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="flex flex-col gap-4 mb-8 md:mb-0 max-w-xs">
            <a href="#" className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-400 text-3xl">location_city</span>
              <span className="text-xl font-bold">Fix My City</span>
            </a>
            <p className="text-sm text-slate-300 mt-2">
              © 2026 Fix My City. Empowering communities through smart infrastructure.
            </p>
          </div>

          <div className="flex flex-wrap gap-12 md:gap-24">
            <div className="flex flex-col gap-3">
              <h4 className="text-blue-400 font-bold uppercase tracking-wider text-xs mb-2">Product</h4>
              <a className="text-sm text-slate-300 hover:text-white transition-colors" href="#features">Features</a>
              <button onClick={() => navigate("/worker")} className="text-left text-sm text-slate-300 hover:text-white transition-colors">Worker Portal</button>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="text-blue-400 font-bold uppercase tracking-wider text-xs mb-2">Company</h4>
              <button onClick={() => navigate("/about")} className="text-left text-sm text-slate-300 hover:text-white transition-colors">About Us</button>
              <button onClick={() => navigate("/contact")} className="text-left text-sm text-slate-300 hover:text-white transition-colors">Contact Support</button>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="text-blue-400 font-bold uppercase tracking-wider text-xs mb-2">Legal</h4>
              <button onClick={() => navigate("/terms")} className="text-left text-sm text-slate-300 hover:text-white transition-colors">Terms of Service</button>
              <button onClick={() => navigate("/privacy")} className="text-left text-sm text-slate-300 hover:text-white transition-colors">Privacy Policy</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
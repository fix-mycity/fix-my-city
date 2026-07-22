import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function WorkerLanding() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth || {});

  const handlePortalAction = () => {
    if (isAuthenticated && user?.role === 'Worker') {
      navigate('/worker/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-blue-500 selection:text-white">
      
      {/* Top Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
              <span className="material-symbols-outlined text-white text-2xl">handyman</span>
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white block leading-none">Fix My City</span>
              <span className="text-[11px] text-blue-400 font-bold uppercase tracking-wider block mt-0.5">Field Operations Portal</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Portal Features</a>
            <a href="#workflow" className="hover:text-white transition-colors">Field Workflow</a>
            <a href="#departments" className="hover:text-white transition-colors">Departments</a>
          </nav>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/')}
              className="text-xs font-semibold text-slate-400 hover:text-white transition-colors px-3 py-2 hidden sm:block"
            >
              Main Platform
            </button>
            <button 
              onClick={handlePortalAction}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md shadow-blue-600/30 flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">login</span>
              {isAuthenticated && user?.role === 'Worker' ? 'Go to Dashboard' : 'Worker Sign In'}
            </button>
          </div>

        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-28 pb-16">
        
        {/* HERO SECTION */}
        <section className="relative px-6 lg:px-12 py-16 md:py-24 max-w-7xl mx-auto overflow-hidden">
          {/* Subtle Glow Backdrop */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                Official Municipal Workforce Platform
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
                Empowering Municipal <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400">Field Operations</span>
              </h1>

              <p className="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
                The centralized portal for municipal field technicians, traffic officers, and service crews. Receive real-time task dispatches, manage duty availability, and submit leave requests directly to department administrators.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <button 
                  onClick={handlePortalAction}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm px-8 py-4 rounded-2xl transition-all shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">shield_person</span>
                  Access Field Officer Portal
                </button>

                <button 
                  onClick={() => navigate('/')}
                  className="w-full sm:w-auto border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-200 font-bold text-sm px-7 py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">home</span>
                  Back to Main Site
                </button>
              </div>

              {/* KPI Badges */}
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-800/80 max-w-lg mx-auto lg:mx-0">
                <div>
                  <h4 className="text-2xl font-extrabold text-white">99.4%</h4>
                  <p className="text-xs text-slate-400 font-medium">Task Completion</p>
                </div>
                <div>
                  <h4 className="text-2xl font-extrabold text-white">&lt; 15m</h4>
                  <p className="text-xs text-slate-400 font-medium">Dispatch Time</p>
                </div>
                <div>
                  <h4 className="text-2xl font-extrabold text-white">24 / 7</h4>
                  <p className="text-xs text-slate-400 font-medium">Duty Coverage</p>
                </div>
              </div>

            </div>

            {/* Graphic Illustration Card */}
            <div className="lg:col-span-5">
              <div className="bg-gradient-to-b from-slate-900 to-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-2xl space-y-6 relative overflow-hidden">
                
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                      <span className="material-symbols-outlined">engineering</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Active Field Worker</h3>
                      <p className="text-xs text-slate-400">Duty: Available for Tasks</p>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    AVAILABLE
                  </span>
                </div>

                {/* Mock Assigned Task Card */}
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase">
                      Water Authority
                    </span>
                    <span className="text-[11px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      IN PROGRESS
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white">Main Pipeline Pressure Leak Repair</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Underground water line leak reported near Civil Station main road.
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-900">
                    <span className="flex items-center gap-1 text-slate-300">
                      <span className="material-symbols-outlined text-rose-400 text-sm">location_on</span>
                      Zone 4, District Central
                    </span>
                    <button className="text-blue-400 font-bold hover:underline flex items-center gap-1">
                      Resolve Task
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </div>
                </div>

                {/* Quick Leave Application Badge */}
                <div className="bg-slate-950/50 p-3.5 rounded-2xl border border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-xs text-slate-300">
                    <span className="material-symbols-outlined text-amber-400">event_busy</span>
                    <span>Leave Request #104: <strong>Approved</strong></span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    OFF SHIFT
                  </span>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* PORTAL FEATURES GRID */}
        <section id="features" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto border-t border-slate-900">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">Key Capabilities for Field Officers</h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
              Built to streamline day-to-day operations for municipal field service crews and managers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 flex flex-col space-y-3 hover:border-blue-500/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl">assignment_turned_in</span>
              </div>
              <h3 className="text-base font-bold text-white">Real-Time Task Feed</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Instant notification and task cards for assigned field complaints, complete with GPS coordinates and priority tags.
              </p>
            </div>

            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 flex flex-col space-y-3 hover:border-emerald-500/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl">tune</span>
              </div>
              <h3 className="text-base font-bold text-white">Duty Status Switcher</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Toggle your status instantly between Available, Busy on Job Site, and Off Shift to keep department admins updated.
              </p>
            </div>

            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 flex flex-col space-y-3 hover:border-amber-500/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl">event_busy</span>
              </div>
              <h3 className="text-base font-bold text-white">Leave Application</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Submit leave requests with start and end dates directly to department management and track approval status.
              </p>
            </div>

            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 flex flex-col space-y-3 hover:border-purple-500/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl">task_alt</span>
              </div>
              <h3 className="text-base font-bold text-white">Resolution Reports</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Submit completion summaries and work logs upon finishing field tasks to close out reported citizen issues.
              </p>
            </div>

          </div>
        </section>

        {/* DEPARTMENTS SECTION */}
        <section id="departments" className="py-16 px-6 lg:px-12 max-w-7xl mx-auto border-t border-slate-900">
          <div className="bg-gradient-to-r from-blue-900/40 via-slate-900 to-indigo-900/40 rounded-3xl p-8 md:p-12 border border-slate-800 text-center space-y-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Supporting Municipal Departments</h2>
            <p className="text-slate-300 text-sm max-w-xl mx-auto">
              Connecting field officers across Water Authority, Traffic Control, and Public Infrastructure.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <div className="px-5 py-3 rounded-2xl bg-slate-900/90 border border-slate-700 text-sm font-bold text-blue-300 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-400">water_drop</span>
                Water Authority
              </div>
              <div className="px-5 py-3 rounded-2xl bg-slate-900/90 border border-slate-700 text-sm font-bold text-amber-300 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400">traffic</span>
                Traffic Control
              </div>
              <div className="px-5 py-3 rounded-2xl bg-slate-900/90 border border-slate-700 text-sm font-bold text-emerald-300 flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400">location_city</span>
                Public Infrastructure
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-8 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-500">handyman</span>
            <span className="font-bold text-slate-300">Fix My City Field Operations</span>
          </div>
          <p>© {new Date().getFullYear()} Fix My City Municipal Operations Portal.</p>
        </div>
      </footer>

    </div>
  );
}

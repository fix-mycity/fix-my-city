import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../features/auth/authThunks';
import { toast } from 'react-hot-toast';

export default function WorkerLayout({ children }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success("Logged out successfully");
      navigate('/login');
    } catch (err) {
      toast.success("Logging out...");
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased">
      {/* Navbar */}
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-white text-xl">handyman</span>
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-white block leading-none">Fix My City</span>
              <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider block mt-0.5">Field Officer Operations</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2.5 bg-slate-800/80 px-3.5 py-1.5 rounded-xl border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-semibold text-slate-200">
                {user?.username || user?.email || 'Field Officer'}
              </span>
            </div>

            <button 
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-600 text-xs font-bold transition-all shadow-sm border border-slate-700 hover:border-rose-500 text-slate-300 hover:text-white"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              Sign Out
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 -mr-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="material-symbols-outlined">{isMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>

        {/* Mobile Nav Drawer */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 py-3 pb-4 flex flex-col gap-3">
            <div className="text-xs font-medium text-slate-300 px-1">
              Signed in as <span className="font-bold text-white">{user?.username || user?.email}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-xs font-bold transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              Sign Out
            </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-4 text-center border-t border-slate-200 mt-auto bg-white text-xs text-slate-400 font-medium">
        © {new Date().getFullYear()} Fix My City • Field Worker Operations Portal
      </footer>
    </div>
  );
}

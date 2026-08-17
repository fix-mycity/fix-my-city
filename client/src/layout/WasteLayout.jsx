import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../features/auth/authThunks';
import { toast } from 'react-hot-toast';
import { Menu, X, Trash2, LayoutDashboard, ClipboardList, Briefcase, LogOut, Lightbulb, Megaphone } from 'lucide-react';
import '../styles/wasteManagement.css';

export default function WasteLayout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success("Logged out from Waste Authority successfully!");
      navigate('/login');
    } catch (err) {
      toast.success("Logging out...");
      navigate('/login');
    }
  };

  const isActive = (path) => {
    if (path === '/waste') {
      return location.pathname === '/waste' || location.pathname === '/waste/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans antialiased overflow-hidden relative">

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Side Navigation Bar */}
      <aside className={`w-64 bg-[#064e3b] text-white flex flex-col h-screen shrink-0 shadow-xl z-50 fixed md:relative transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 flex justify-between items-center border-b border-[#047857]/45">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/40 font-bold">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold tracking-tight">Waste Authority</div>
              <div className="text-xs text-emerald-400 font-extrabold tracking-wider uppercase">Smart Sanitation</div>
            </div>
          </div>
          <button
            className="md:hidden text-slate-200 hover:text-white"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 px-4 space-y-2 mt-6 text-sm font-medium">
          <Link
            to="/waste"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`rounded-xl px-4 py-3 flex items-center gap-3 transition-all ${isActive('/waste')
                ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30'
                : 'text-emerald-100/70 hover:bg-[#047857]/45 hover:text-white'
              }`}
          >
            <LayoutDashboard className="w-5 h-5 text-emerald-400" />
            Dashboard
          </Link>

          <Link
            to="/waste/complaints"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`rounded-xl px-4 py-3 flex items-center gap-3 transition-all ${isActive('/waste/complaints')
                ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30'
                : 'text-emerald-100/70 hover:bg-[#047857]/45 hover:text-white'
              }`}
          >
            <ClipboardList className="w-5 h-5 text-emerald-400" />
            Complaints Queue
          </Link>

          <Link
            to="/waste/bins"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`rounded-xl px-4 py-3 flex items-center gap-3 transition-all ${isActive('/waste/bins')
                ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30'
                : 'text-emerald-100/70 hover:bg-[#047857]/45 hover:text-white'
              }`}
          >
            <Trash2 className="w-5 h-5 text-emerald-400" />
            Waste Bins
          </Link>

          <Link
            to="/waste/workers"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`rounded-xl px-4 py-3 flex items-center gap-3 transition-all ${isActive('/waste/workers')
                ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30'
                : 'text-emerald-100/70 hover:bg-[#047857]/45 hover:text-white'
              }`}
          >
            <Briefcase className="w-5 h-5 text-emerald-400" />
            Sanitation Workers
          </Link>

          <Link
            to="/waste/suggestions"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`rounded-xl px-4 py-3 flex items-center gap-3 transition-all ${isActive('/waste/suggestions')
                ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30'
                : 'text-emerald-100/70 hover:bg-[#047857]/45 hover:text-white'
              }`}
          >
            <Lightbulb className="w-5 h-5 text-emerald-400" />
            Suggestions
          </Link>

          <Link
            to="/waste/posts"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`rounded-xl px-4 py-3 flex items-center gap-3 transition-all ${isActive('/waste/posts')
                ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30'
                : 'text-emerald-100/70 hover:bg-[#047857]/45 hover:text-white'
              }`}
          >
            <Megaphone className="w-5 h-5 text-emerald-400" />
            Announcements
          </Link>
        </nav>

        {/* User Profile Footer Card */}
        <div className="p-4 border-t border-[#047857]/45 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <img
              alt="User Avatar"
              className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500/50"
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'Sanitation Admin')}&background=10b981&color=fff`}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.username || 'Sanitation Admin'}</p>
              <p className="text-xs text-emerald-450 font-semibold truncate capitalize text-emerald-350">Sanitation Admin</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 bg-emerald-900/40 hover:bg-rose-500/20 text-emerald-100 hover:text-rose-450 rounded-xl text-xs font-bold transition-all border border-emerald-800/60 hover:border-rose-500/30"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="flex-grow flex flex-col w-full h-screen overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center shrink-0 justify-between">
          <div className="flex items-center">
            <button
              className="text-slate-600 hover:bg-slate-100 p-2 rounded-lg transition-colors mr-3"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="font-bold text-slate-800 text-lg">Waste Console</span>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto p-4 md:p-6 lg:p-8 max-w-[1440px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}

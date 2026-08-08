import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../features/auth/authThunks';
import { toast } from 'react-hot-toast';
import { Menu, X, ShieldAlert, LayoutDashboard, Radio, Users, UserPlus, LogOut, FileText } from 'lucide-react';
import DepartmentSwitcher from '../components/shared/DepartmentSwitcher';

export default function EmergencyLayout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success("Logged out from Emergency Command!");
      navigate('/login');
    } catch (err) {
      toast.error(err || "Logout failed.");
    }
  };

  const isActive = (path) => location.pathname.includes(path);

  return (
    <div className="flex h-screen bg-slate-950 font-sans antialiased overflow-hidden relative text-slate-100">
      
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 z-40 md:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Side Navigation Bar */}
      <aside className={`w-64 bg-slate-900 border-r border-rose-900/30 text-white flex flex-col h-screen shrink-0 shadow-2xl z-50 fixed md:relative transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        
        {/* Brand Header */}
        <div className="p-6 flex justify-between items-center border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600/20 border border-rose-500/40 text-rose-500 flex items-center justify-center shadow-lg shadow-rose-950/50 animate-pulse">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                Fix My City
              </div>
              <div className="text-[10px] text-rose-400 font-extrabold tracking-widest uppercase">
                Emergency Dept
              </div>
            </div>
          </div>
          <button 
            className="md:hidden text-slate-400 hover:text-white"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Department Switcher */}
        <div className="px-6 py-3 border-b border-slate-800">
          <DepartmentSwitcher />
        </div>

        {/* Sidebar Links */}
        <nav className="flex-1 px-4 space-y-2 mt-4 text-sm font-semibold">
          <Link 
            to="/emergency/dashboard" 
            className={`rounded-xl px-4 py-3 flex items-center gap-3 transition-all ${isActive('/dashboard') || isActive('/admin/emergency') ? 'bg-rose-600 text-white font-bold shadow-lg shadow-rose-600/30 border border-rose-400/30' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'}`}
          >
            <LayoutDashboard className="w-5 h-5 text-rose-400" />
            Dashboard
          </Link>

          <Link 
            to="/emergency/complaints" 
            className={`rounded-xl px-4 py-3 flex items-center gap-3 transition-all ${isActive('/complaints') ? 'bg-rose-600 text-white font-bold shadow-lg shadow-rose-600/30 border border-rose-400/30' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'}`}
          >
            <FileText className="w-5 h-5 text-rose-400" />
            Emergency Complaints
          </Link>

          <Link 
            to="/emergency/workers" 
            className={`rounded-xl px-4 py-3 flex items-center gap-3 transition-all ${isActive('/workers') ? 'bg-rose-600 text-white font-bold shadow-lg shadow-rose-600/30 border border-rose-400/30' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'}`}
          >
            <Users className="w-5 h-5 text-rose-400" />
            Emergency Workers
          </Link>

          <Link 
            to="/emergency/broadcasts" 
            className={`rounded-xl px-4 py-3 flex items-center gap-3 transition-all ${isActive('/broadcasts') ? 'bg-rose-600 text-white font-bold shadow-lg shadow-rose-600/30 border border-rose-400/30' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'}`}
          >
            <Radio className="w-5 h-5 text-rose-400" />
            Public Advisories
          </Link>
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/50 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-rose-600/20 border border-rose-500/30 text-rose-400 flex items-center justify-center font-bold text-sm shrink-0">
              {user?.username?.substring(0, 2)?.toUpperCase() || 'EM'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.username || 'Emergency Admin'}</p>
              <p className="text-[10px] text-slate-400 truncate">Emergency Dept Head</p>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-xl transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-grow flex flex-col w-full h-screen overflow-hidden bg-slate-950">
        {/* Mobile Header */}
        <div className="md:hidden bg-slate-900 border-b border-rose-900/30 p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button 
              className="text-slate-400 hover:text-white p-2 rounded-lg"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="font-extrabold text-white text-base">Emergency Dept</span>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto w-full p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

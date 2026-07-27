import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../features/auth/authThunks';
import { toast } from 'react-hot-toast';
import { Menu, X, ShieldAlert, LayoutDashboard, Users, ArrowRightLeft, LogOut, Settings } from 'lucide-react';

export default function SuperAdminLayout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success("Logged out successfully!");
      navigate('/login');
    } catch (err) {
      toast.error(err || "Logout failed.");
    }
  };

  const isActive = (path) => location.pathname.includes(path);

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
      <aside className={`w-64 bg-slate-900 text-white flex flex-col h-screen shrink-0 shadow-xl z-50 fixed md:relative transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 flex justify-between items-center border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/40 font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold tracking-tight">Fix My City</div>
              <div className="text-xs text-purple-400 font-extrabold tracking-wider uppercase">Super Admin</div>
            </div>
          </div>
          <button 
            className="md:hidden text-slate-400 hover:text-white"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Sidebar Nav Links */}
        <nav className="flex-1 px-4 space-y-2 mt-6 text-sm font-medium">
          <Link 
            to="/super-admin/dashboard" 
            className={`rounded-xl px-4 py-3 flex items-center gap-3 transition-all ${
              isActive('/dashboard') 
                ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 text-purple-400" />
            Master Analytics
          </Link>

          <Link 
            to="/super-admin/users" 
            className={`rounded-xl px-4 py-3 flex items-center gap-3 transition-all ${
              isActive('/users') 
                ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Users className="w-5 h-5 text-purple-400" />
            User Directory & RBAC
          </Link>

          <Link 
            to="/super-admin/complaints" 
            className={`rounded-xl px-4 py-3 flex items-center gap-3 transition-all ${
              isActive('/complaints') 
                ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <ArrowRightLeft className="w-5 h-5 text-purple-400" />
            Master Complaints
          </Link>
        </nav>
 
        {/* User Footer Profile Card */}
        <div className="p-4 border-t border-slate-800 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <img 
              alt="User Avatar" 
              className="w-10 h-10 rounded-full object-cover border-2 border-purple-500/50" 
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'Super Admin')}&background=7c3aed&color=fff`} 
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.username || 'Super Admin'}</p>
              <p className="text-xs text-purple-400 font-semibold truncate capitalize">Root Master</p>
            </div>
          </div>
          <div className="flex gap-2 justify-around pt-1">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 rounded-xl text-xs font-bold transition-all border border-slate-700 hover:border-rose-500/30" 
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
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
            <span className="font-bold text-slate-800 text-lg">Super Admin Console</span>
          </div>
        </div>
        
        <div className="flex-grow overflow-y-auto p-4 md:p-6 lg:p-8 max-w-[1440px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}

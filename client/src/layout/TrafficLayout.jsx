import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../features/auth/authThunks';
import { toast } from 'react-hot-toast';
import { Menu, X } from 'lucide-react';
import DepartmentSwitcher from '../components/shared/DepartmentSwitcher';

const TrafficLayout = ({ children }) => {
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
        <div className="p-6 flex justify-between items-center">
          <div>
            <div className="text-3xl font-bold tracking-tight">Fix My City</div>
            <div className="text-xs text-amber-500 font-bold tracking-wider uppercase mt-1">Traffic Dept</div>
          </div>
          <button 
            className="md:hidden text-slate-400 hover:text-white"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-6 py-3 border-y border-slate-800">
          <DepartmentSwitcher />
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4 text-sm font-medium">
          <Link 
            to="/traffic/dashboard" 
            className={`rounded-lg px-4 py-3 flex items-center transition-colors ${isActive('/dashboard') ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <span className="material-symbols-outlined mr-3">dashboard</span>
            Dashboard
          </Link>
          <Link 
            to="/traffic/incidents" 
            className={`rounded-lg px-4 py-3 flex items-center transition-colors ${isActive('/incidents') ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <span className="material-symbols-outlined mr-3">warning</span>
            Incidents
          </Link>
          <Link 
            to="/traffic/workers" 
            className={`rounded-lg px-4 py-3 flex items-center transition-colors ${isActive('/workers') ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <span className="material-symbols-outlined mr-3">engineering</span>
            Workers
          </Link>
          <Link 
            to="/traffic/live-map" 
            className={`rounded-lg px-4 py-3 flex items-center transition-colors ${isActive('/live-map') ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <span className="material-symbols-outlined mr-3">map</span>
            Live Map
          </Link>
        </nav>
 
        <div className="p-4 border-t border-slate-800 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <img 
              alt="User Avatar" 
              className="w-10 h-10 rounded-full object-cover border-2 border-slate-700" 
              src="https://ui-avatars.com/api/?name=Traffic+Admin&background=random" 
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.username || 'Admin'}</p>
              <p className="text-xs text-slate-400 truncate capitalize">{user?.role || 'Traffic Admin'}</p>
            </div>
          </div>
          <div className="flex gap-2 justify-around">
            <button className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800" title="Settings">
              <span className="material-symbols-outlined">settings</span>
            </button>
            <button 
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-slate-800" 
              title="Logout"
            >
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="flex-grow flex flex-col w-full h-screen overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center shrink-0">
          <button 
            className="text-slate-600 hover:bg-slate-100 p-2 rounded-lg transition-colors mr-3"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-slate-800 text-lg">Traffic Dept</span>
        </div>
        
        <div className="flex-grow overflow-y-auto max-w-[1440px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default TrafficLayout;

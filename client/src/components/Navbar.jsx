import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../features/auth/authThunks';
import { toast } from 'react-hot-toast';
import { getUserProfileApi } from '../api/userProfileApi';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const [profileAvatar, setProfileAvatar] = useState('');

  const defaultAvatar = "https://ui-avatars.com/api/?name=Citizen&background=cbd5e1&color=334155&rounded=true";

  useEffect(() => {
    async function loadAvatar() {
      try {
        const res = await getUserProfileApi();
        setProfileAvatar(res.data?.avatar_url || '');
      } catch (err) {
        console.error("Failed to load user avatar in navbar:", err);
      }
    }
    loadAvatar();
  }, []);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success("Logged out successfully!");
      navigate('/login');
    } catch (err) {
      toast.error(err || "Logout failed.");
    }
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { label: 'Analytics', path: '#', icon: 'analytics' },
    { label: 'Community', path: '#', icon: 'groups' },
    { label: 'Reports', path: '/reports', icon: 'description' }
  ];

  return (
    <>
      <header className="bg-white border-b border-slate-200 text-slate-800 shrink-0 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">

          {/* Left: Brand logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-all duration-200">
              <span className="material-symbols-outlined text-white text-xl">location_city</span>
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
              Fix My City
            </span>
          </Link>

          {/* Center: Navigation Links */}
          <nav className="hidden md:flex items-center gap-2 text-sm font-medium">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/');
              const isPlaceholder = item.path === '#';

              if (isPlaceholder) {
                return (
                  <span
                    key={item.label}
                    className="text-slate-400 cursor-not-allowed rounded-lg px-4 py-2 flex items-center gap-2 transition-colors select-none"
                    title="Coming Soon"
                  >
                    <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                    {item.label}
                  </span>
                );
              }

              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`rounded-lg px-4 py-2 flex items-center gap-2 transition-all duration-200 ${isActive
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/10'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: User profile / actions */}
          <div className="flex items-center gap-4">
            <Link
              to="/profile"
              className="flex items-center gap-3 group border-r border-slate-200 pr-4 hover:opacity-90 transition-all duration-200"
              title="Profile Settings"
            >
              <img
                alt="User Avatar"
                className="w-9 h-9 rounded-full object-cover border-2 border-slate-200 group-hover:border-blue-500 transition-colors duration-200"
                src={profileAvatar || defaultAvatar}
              />
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors duration-200">{user?.username || 'Citizen'}</p>
                <p className="text-[10px] text-slate-500 leading-none capitalize mt-0.5">{user?.role || 'Citizen'}</p>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="text-slate-500 hover:text-red-650 hover:text-red-600 hover:bg-slate-100 transition-all duration-200 p-2 rounded-lg flex items-center justify-center"
              title="Logout"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-16 flex items-center justify-around z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/');
          const isPlaceholder = item.path === '#';

          if (isPlaceholder) {
            return (
              <span
                key={item.label}
                className="text-slate-300 flex flex-col items-center justify-center text-[10px] font-semibold cursor-not-allowed select-none"
                title="Coming Soon"
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                {item.label}
              </span>
            );
          }

          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex flex-col items-center justify-center text-[10px] font-bold transition-colors ${isActive
                ? 'text-blue-600'
                : 'text-slate-500 hover:text-slate-900'
                }`}
            >
              <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../features/auth/authThunks';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      if (user.role === 'Department_Admin' || user.role === 'Super_Admin') {
        const permissions = user.permissions || [];
        const deptPermissions = permissions.filter(p => p.startsWith('dept:'));

        if (deptPermissions.length === 1) {
          const perm = deptPermissions[0];
          if (perm === 'dept:water') {
            navigate('/water/dashboard', { replace: true });
          } else if (perm === 'dept:traffic') {
            navigate('/traffic/dashboard', { replace: true });
          } else if (perm === 'dept:waste') {
            navigate('/waste/dashboard', { replace: true });
          }
        } else if (deptPermissions.length >= 2) {
          navigate('/admin/portal', { replace: true });
        }
      }
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success("Logged out successfully!");
    } catch (err) {
      toast.error(err || "Logout failed.");
    }
  };

  // Mock Data for the dummy UI
  const stats = [
    { label: 'Total Reports', value: '12', icon: 'assignment', color: 'text-slate-400' },
    { label: 'Resolved', value: '8', icon: 'check_circle', color: 'text-emerald-500' },
    { label: 'In Progress', value: '3', icon: 'pending', color: 'text-amber-500' },
    { label: 'Pending', value: '1', icon: 'error', color: 'text-red-500' }
  ];

  const reports = [
    {
      id: 1,
      type: 'Pothole',
      icon: 'warning',
      title: 'Deep Pothole on Elm St',
      description: 'Large pothole forming near the intersection, causing traffic hazard.',
      status: 'In Progress',
      statusColor: 'bg-amber-500 shadow-amber-500/40',
      address: '1200 Elm St',
      date: 'Oct 22, 2023',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCqcH-jOf4CygcLl5zBfclvOugsAaFwrMiUUIDKobrIrVzgmkd5rAKNIpGOfDsYmCZjjF5g214dxdDDuBKQpp-nDKYl-itXKAKT1bXIWffG7Ch-rlp9CMYbVYjBR3vaNNU2S2Bp3adP48GIX3zYVSlAR32m_yhfc4fnLOKSMFruPi2zfwHNaROl2KQduGkUV-oXGmRR2Qe5JMLzhc7ntIU6P-aKadC2F84AiELYTS16V3ui8jCPaznlTDPvC884C6BZfyD1rzTTQg'
    },
    {
      id: 2,
      type: 'Streetlight',
      icon: 'lightbulb',
      title: 'Broken Streetlight',
      description: 'The streetlight has been out for a week, making the crossing dangerous.',
      status: 'Resolved',
      statusColor: 'bg-emerald-500 shadow-emerald-500/40',
      address: '45 Maple Ave',
      date: 'Oct 15, 2023',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5E8Q_zpij2GU2IA696LtuAx0kbkbeUKQOQcypQ3Ms1gZ0fSvBuftMSE8muCrl2j8ozVRLZiuhtPz2QcbXf4j2eV8VnFwPIAbE_He14VnATunyjBJlK7nfoSG5zXL6ubbfciJcUjKTHdPIj1O8m2AQK6TRdCdOOSenQ7nKQcAmfdDJc7GSxFpFc-x-BmtK1qSVsGbpB9rUWkvQPLzz3ToMwuEj-xnyZ_luiHl-ETuM6D4f0I2ERepVSo1Aar7lM9GwRGXGCzcRjQ'
    }
  ];

  const updates = [
    {
      id: 1,
      message: 'Pothole report on Main St assigned to Field Officer.',
      time: '2 hours ago',
      indicatorColor: 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]'
    },
    {
      id: 2,
      message: 'Graffiti removed at Central Park entrance.',
      time: 'Yesterday',
      indicatorColor: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]'
    }
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans antialiased overflow-hidden">
      
      {/* Side Navigation Bar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen shrink-0 shadow-xl z-50">
        <div className="p-6">
          <div className="text-3xl font-bold tracking-tight">Fix My City</div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4 text-sm font-medium">
          <a href="#" className="bg-blue-600 text-white rounded-lg px-4 py-3 flex items-center transition-colors shadow-sm">
            <span className="material-symbols-outlined mr-3">dashboard</span>
            Dashboard
          </a>
          <a href="#" className="text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg px-4 py-3 flex items-center transition-colors">
            <span className="material-symbols-outlined mr-3">analytics</span>
            Analytics
          </a>
          <a href="#" className="text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg px-4 py-3 flex items-center transition-colors">
            <span className="material-symbols-outlined mr-3">groups</span>
            Community
          </a>
          <a href="#" className="text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg px-4 py-3 flex items-center transition-colors">
            <span className="material-symbols-outlined mr-3">folder</span>
            Resources
          </a>
        </nav>
 
        <div className="p-4">
          <button className="w-full bg-blue-500 text-white px-4 py-3 rounded-lg text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-blue-400 hover:shadow-[0_0_12px_rgba(59,130,246,0.5)] transition-all duration-200">
            <span className="material-symbols-outlined text-sm">add</span> Report New Issue
          </button>
        </div>

        <div className="p-4 border-t border-slate-800 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <img 
              alt="User Avatar" 
              className="w-10 h-10 rounded-full object-cover border-2 border-slate-700" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAjXV44J7hHagG25vu-i0QNfHuE6FUQYoz9M1qZy8QPGMTNifXENQJw-o5BCCpb1iU8jbphl-_vCcEpwdZoNqtmYsynhYuKhEn45buuwq0qUJVLsK5WsnvpKGFa28EiLLLGiH8QWrull36_OiRSwJHgY0v-lQxpJ2YA5KHMjKrwH9NGHLruawNgFjzBClUyp1BQfaAWhjtb8St-cd8O4RbMgeUlJqf0nQOkQ0rDMiScYOzUBLWc3FkV90i4E-aksBuTi63NTrGkKA" 
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.username || 'Jamsheed'}</p>
              <p className="text-xs text-slate-400 truncate capitalize">{user?.role || 'Citizen'}</p>
            </div>
          </div>
          <div className="flex gap-2 justify-around">
            <button className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800" title="Notifications">
              <span className="material-symbols-outlined">notifications</span>
            </button>
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
      <main className="flex-grow p-8 max-w-[1440px] mx-auto w-full overflow-y-auto">
        
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">Welcome back, {user?.username || 'Jamsheed'}</h1>
          <p className="text-slate-500 font-medium">Tuesday, Oct 24 • You have 2 active reports.</p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between h-[140px] hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</span>
                <span className={`material-symbols-outlined ${stat.color}`}>{stat.icon}</span>
              </div>
              <div className="text-4xl font-bold text-slate-900">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: My Reports */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h2 className="text-xl font-bold text-slate-900">My Reports</h2>
                <a href="#" className="text-blue-600 hover:text-blue-700 text-sm font-semibold transition-colors">View All Reports &rarr;</a>
              </div>
              
              <div className="divide-y divide-slate-100">
                {reports.map((report) => (
                  <div key={report.id} className="p-5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row gap-5">
                    <div 
                      className="w-full sm:w-28 h-28 rounded-lg bg-cover bg-center shrink-0 border border-slate-200" 
                      style={{ backgroundImage: `url('${report.image}')` }}
                    />
                    <div className="flex-grow flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="material-symbols-outlined text-blue-600 text-sm">{report.icon}</span>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{report.type}</span>
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 mb-1">{report.title}</h3>
                          <p className="text-sm text-slate-600 line-clamp-1">{report.description}</p>
                        </div>
                        <span className={`${report.statusColor} text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm whitespace-nowrap`}>
                          {report.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mt-4 sm:mt-0">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">location_on</span> {report.address}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">calendar_today</span> {report.date}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Map & Updates */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Map Widget */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[300px]">
              <div className="p-5 border-b border-slate-200 bg-slate-50">
                <h2 className="text-lg font-bold text-slate-900">Nearby Issues</h2>
              </div>
              <div className="flex-grow bg-slate-100 relative">
                {/* Abstract SVG Grid Pattern Background */}
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-60" 
                  style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'100%25\\' height=\\'100%25\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cdefs%3E%3Cpattern id=\\'grid\\' width=\\'40\\' height=\\'40\\' patternUnits=\\'userSpaceOnUse\\'%3E%3Cpath d=\\'M 40 0 L 0 0 0 40\\' fill=\\'none\\' stroke=\\'%23cbd5e1\\' stroke-width=\\'1\\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\\'100%25\\' height=\\'100%25\\' fill=\\'url(%23grid)\\'/%3E%3C/svg%3E')" }}
                />
                
                {/* Map Pins */}
                <div className="absolute top-[30%] left-[40%] text-red-500 animate-bounce">
                  <span className="material-symbols-outlined drop-shadow-md text-3xl">location_on</span>
                </div>
                <div className="absolute top-[60%] left-[20%] text-amber-500">
                  <span className="material-symbols-outlined drop-shadow-md text-2xl">location_on</span>
                </div>
                <div className="absolute top-[20%] left-[70%] text-blue-500">
                  <span className="material-symbols-outlined drop-shadow-md text-2xl">location_on</span>
                </div>
              </div>
            </div>

            {/* Updates Widget */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-200 bg-slate-50">
                <h2 className="text-lg font-bold text-slate-900">Recent Updates</h2>
              </div>
              <div className="p-5 space-y-5">
                {updates.map((update) => (
                  <div key={update.id} className="flex gap-4 items-start">
                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${update.indicatorColor}`} />
                    <div>
                      <p className="text-sm font-medium text-slate-800 leading-snug">{update.message}</p>
                      <span className="text-xs font-semibold text-slate-500 mt-1 block">{update.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
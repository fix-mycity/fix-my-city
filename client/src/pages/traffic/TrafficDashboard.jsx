import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../features/auth/authThunks';
import { fetchTrafficComplaints } from '../../features/traffic/trafficThunks';
import { toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

const TrafficDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { complaints, dashboardStatus } = useSelector((state) => state.traffic);

  useEffect(() => {
    dispatch(fetchTrafficComplaints());
  }, [dispatch]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success("Logged out successfully!");
      navigate('/login');
    } catch (err) {
      toast.error(err || "Logout failed.");
    }
  };

  const pendingComplaints = complaints.filter(c => c.status === 'PENDING').length;
  const inProgressComplaints = complaints.filter(c => c.status === 'ASSIGNED').length;
  const resolvedComplaints = complaints.filter(c => c.status === 'RESOLVED').length;
  const closedComplaints = complaints.filter(c => c.status === 'CLOSED').length;

  const stats = [
    { label: 'Total Reports', value: complaints.length.toString(), icon: 'assignment', color: 'text-slate-400' },
    { label: 'Resolved', value: (resolvedComplaints + closedComplaints).toString(), icon: 'check_circle', color: 'text-emerald-500' },
    { label: 'In Progress', value: inProgressComplaints.toString(), icon: 'pending', color: 'text-amber-500' },
    { label: 'Pending', value: pendingComplaints.toString(), icon: 'error', color: 'text-red-500' }
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans antialiased overflow-hidden">
      
      {/* Side Navigation Bar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen shrink-0 shadow-xl z-50">
        <div className="p-6">
          <div className="text-3xl font-bold tracking-tight">Fix My City</div>
          <div className="text-xs text-amber-500 font-bold tracking-wider uppercase mt-1">Traffic Dept</div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4 text-sm font-medium">
          <Link to="/traffic/dashboard" className="bg-blue-600 text-white rounded-lg px-4 py-3 flex items-center transition-colors shadow-sm">
            <span className="material-symbols-outlined mr-3">dashboard</span>
            Dashboard
          </Link>
          <Link to="/traffic/workers" className="text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg px-4 py-3 flex items-center transition-colors">
            <span className="material-symbols-outlined mr-3">engineering</span>
            Workers
          </Link>
          <a href="#" className="text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg px-4 py-3 flex items-center transition-colors">
            <span className="material-symbols-outlined mr-3">analytics</span>
            Analytics
          </a>
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
      <main className="flex-grow p-8 max-w-[1440px] mx-auto w-full overflow-y-auto">
        
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">Traffic Command Center</h1>
          <p className="text-slate-500 font-medium">Manage and dispatch workers to resolve traffic incidents.</p>
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

        {/* Reports List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <h2 className="text-xl font-bold text-slate-900">Traffic Incidents</h2>
          </div>
          
          <div className="divide-y divide-slate-100">
            {dashboardStatus === 'loading' && <div className="p-8 text-center text-slate-500">Loading incidents...</div>}
            {dashboardStatus === 'succeeded' && complaints.length === 0 && (
              <div className="p-8 text-center text-slate-500">No traffic incidents reported.</div>
            )}
            
            {dashboardStatus === 'succeeded' && complaints.map((report) => (
              <div key={report.id} className="p-5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row gap-5">
                <div 
                  className="w-full sm:w-28 h-28 rounded-lg bg-cover bg-center shrink-0 border border-slate-200" 
                  style={{ backgroundImage: `url('${report.image_url || 'https://via.placeholder.com/150'}')` }}
                />
                <div className="flex-grow flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="material-symbols-outlined text-blue-600 text-sm">traffic</span>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{report.category}</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{report.title}</h3>
                      <p className="text-sm text-slate-600 line-clamp-1">{report.description}</p>
                    </div>
                    <span className={`text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm whitespace-nowrap ${
                      report.status === 'PENDING' ? 'bg-red-500 shadow-red-500/40' :
                      report.status === 'ASSIGNED' ? 'bg-amber-500 shadow-amber-500/40' :
                      'bg-emerald-500 shadow-emerald-500/40'
                    }`}>
                      {report.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mt-4 sm:mt-0">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">location_on</span> {report.location || 'Unknown'}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">calendar_today</span> 
                      {new Date(report.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
};

export default TrafficDashboard;

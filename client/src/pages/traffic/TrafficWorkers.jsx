import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../features/auth/authThunks';
import { createTrafficWorker } from '../../features/traffic/trafficThunks';
import { resetWorkerCreateStatus } from '../../features/traffic/trafficSlice';
import { toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

const TrafficWorkers = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { workerCreateStatus, workerCreateError } = useSelector((state) => state.traffic);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    state: '',
    district: '',
    pincode: '',
    password: '',
    confirm_password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(createTrafficWorker(formData));
  };

  useEffect(() => {
    if (workerCreateStatus === 'succeeded') {
      toast.success("Worker created successfully!");
      setFormData({
        username: '', email: '', state: '', district: '', pincode: '', password: '', confirm_password: ''
      });
      dispatch(resetWorkerCreateStatus());
    } else if (workerCreateStatus === 'failed') {
      // It could be a string or an object like [{msg: "error"}] or {detail: "error"}
      let errorMsg = "Failed to create worker";
      if (Array.isArray(workerCreateError)) {
        errorMsg = workerCreateError[0]?.msg || errorMsg;
      } else if (typeof workerCreateError === 'object' && workerCreateError?.detail) {
        errorMsg = workerCreateError.detail;
      } else if (typeof workerCreateError === 'string') {
        errorMsg = workerCreateError;
      }
      toast.error(errorMsg);
      dispatch(resetWorkerCreateStatus());
    }
  }, [workerCreateStatus, workerCreateError, dispatch]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success("Logged out successfully!");
      navigate('/login');
    } catch (err) {
      toast.error(err || "Logout failed.");
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans antialiased overflow-hidden">
      
      {/* Side Navigation Bar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen shrink-0 shadow-xl z-50">
        <div className="p-6">
          <div className="text-3xl font-bold tracking-tight">Fix My City</div>
          <div className="text-xs text-amber-500 font-bold tracking-wider uppercase mt-1">Traffic Dept</div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4 text-sm font-medium">
          <Link to="/traffic/dashboard" className="text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg px-4 py-3 flex items-center transition-colors">
            <span className="material-symbols-outlined mr-3">dashboard</span>
            Dashboard
          </Link>
          <Link to="/traffic/workers" className="bg-blue-600 text-white rounded-lg px-4 py-3 flex items-center transition-colors shadow-sm">
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
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">Worker Management</h1>
          <p className="text-slate-500 font-medium">Hire and manage your field officers. Maximum 5 allowed.</p>
        </div>

        {/* Worker Creation Form */}
        <div className="max-w-2xl bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-200 bg-slate-50">
            <h2 className="text-xl font-bold text-slate-900">Add New Worker</h2>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Username</label>
                  <input 
                    type="text" name="username" value={formData.username} onChange={handleChange} required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Email</label>
                  <input 
                    type="email" name="email" value={formData.email} onChange={handleChange} required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">State</label>
                  <input 
                    type="text" name="state" value={formData.state} onChange={handleChange} required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">District</label>
                  <input 
                    type="text" name="district" value={formData.district} onChange={handleChange} required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Pincode</label>
                  <input 
                    type="text" name="pincode" value={formData.pincode} onChange={handleChange} required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Password</label>
                  <input 
                    type="password" name="password" value={formData.password} onChange={handleChange} required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Confirm Password</label>
                  <input 
                    type="password" name="confirm_password" value={formData.confirm_password} onChange={handleChange} required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-sm"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-6 flex justify-end">
                <button 
                  type="submit" 
                  disabled={workerCreateStatus === 'loading'}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-bold tracking-wide transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
                >
                  {workerCreateStatus === 'loading' ? (
                    <><span className="material-symbols-outlined animate-spin text-sm">refresh</span> Creating...</>
                  ) : (
                    <><span className="material-symbols-outlined text-sm">add</span> Create Worker</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

      </main>
    </div>
  );
};

export default TrafficWorkers;

import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { logoutUser } from '../../features/auth/authThunks';
import tt from '@tomtom-international/web-sdk-maps';
import '@tomtom-international/web-sdk-maps/dist/maps.css';

const TrafficMap = () => {
  const mapElement = useRef(null);
  const [map, setMap] = useState(null);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Pre-defined areas for the dropdown
  const cityAreas = [
    { name: 'City Center (Thrissur)', lng: 76.2144, lat: 10.5276 },
    { name: 'Palakkad Highway', lng: 76.6508, lat: 10.7749 },
    { name: 'Kochi Bypass', lng: 76.3082, lat: 9.9816 }
  ];

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success("Logged out successfully!");
      navigate('/login');
    } catch (err) {
      toast.error(err || "Logout failed.");
    }
  };

  useEffect(() => {
    const apiKey = import.meta.env.VITE_TOMTOM_API_KEY;
    
    if (!apiKey) {
      toast.error("TomTom API Key is missing in .env!");
      return;
    }

    // Initialize TomTom Map
    let mapInstance = tt.map({
      key: apiKey,
      container: mapElement.current,
      center: [76.2144, 10.5276], // Default Center
      zoom: 12,
      style: 'tomtom://vector/1/basic-main'
    });

    mapInstance.on('load', () => {
      // Add Traffic Flow Layer
      mapInstance.addTier(new tt.TrafficFlowTier({
        key: apiKey,
        style: 'tomtom://vector/1/relative0'
      }));
      
      // Add Traffic Incidents Layer
      mapInstance.addTier(new tt.TrafficIncidentTier({
        key: apiKey,
        incidentDetails: {
          style: 's0'
        }
      }));
    });

    mapInstance.addControl(new tt.FullscreenControl());
    mapInstance.addControl(new tt.NavigationControl());

    setMap(mapInstance);

    return () => {
      if (mapInstance) mapInstance.remove();
    };
  }, []);

  const handleAreaChange = (e) => {
    if (!map) return;
    const selectedArea = cityAreas.find(area => area.name === e.target.value);
    if (selectedArea) {
      map.flyTo({
        center: [selectedArea.lng, selectedArea.lat],
        zoom: 14,
        speed: 1.5
      });
      toast.success(`Panning to ${selectedArea.name}`);
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
          <Link to="/traffic/workers" className="text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg px-4 py-3 flex items-center transition-colors">
            <span className="material-symbols-outlined mr-3">engineering</span>
            Workers
          </Link>
          <Link to="/traffic/live-map" className="bg-blue-600 text-white rounded-lg px-4 py-3 flex items-center transition-colors shadow-sm">
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
      <main className="flex-grow p-8 max-w-[1440px] mx-auto w-full overflow-y-auto flex flex-col">
        
        {/* Welcome Header */}
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">Real-Time Traffic Map</h1>
            <p className="text-slate-500 font-medium">Powered by TomTom Traffic API</p>
          </div>
          
          <div className="flex items-center gap-3">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Select Area:</label>
            <div className="relative">
              <select 
                onChange={handleAreaChange}
                className="appearance-none bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-64 p-2.5 font-medium cursor-pointer transition-colors shadow-sm"
              >
                <option value="">-- View Entire City --</option>
                {cityAreas.map((area, index) => (
                  <option key={index} value={area.name}>{area.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                <span className="material-symbols-outlined">expand_more</span>
              </div>
            </div>
          </div>
        </div>

        {/* Map Container Card */}
        <div className="flex-grow relative bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[600px]">
          <div ref={mapElement} className="absolute inset-0 w-full h-full bg-slate-100" />
          
          {/* Legend Overlay */}
          <div className="absolute bottom-6 left-6 bg-white p-4 rounded-xl shadow-md border border-slate-200 z-10">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Traffic Flow Legend</h4>
            <div className="space-y-2 text-sm font-medium text-slate-700">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded-sm shadow-inner"></div> Fast
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded-sm shadow-inner"></div> Slow
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded-sm shadow-inner"></div> Queuing
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-800 rounded-sm shadow-inner"></div> Stationary
              </div>
            </div>
          </div>
        </div>
        
      </main>
    </div>
  );
};

export default TrafficMap;

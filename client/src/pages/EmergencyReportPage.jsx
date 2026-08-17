import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { triggerSOS } from '../services/emergencyService';
import { toast } from 'react-hot-toast';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const categories = [
  { value: 'HEALTH_AMBULANCE', label: 'Ambulance / Medical', icon: 'medical_services', color: 'bg-rose-50 border-rose-250 text-rose-600' },
  { value: 'FIRE_FORCE', label: 'Fire Force', icon: 'local_fire_department', color: 'bg-amber-50 border-amber-250 text-amber-600' },
  { value: 'POLICE_EMERGENCY', label: 'Police Security', icon: 'local_police', color: 'bg-blue-50 border-blue-250 text-blue-600' },
  { value: 'GAS_LEAK', label: 'Gas / Chemical Leak', icon: 'masks', color: 'bg-purple-50 border-purple-250 text-purple-600' },
  { value: 'TRAFFIC_EMERGENCY', label: 'Traffic / Accident', icon: 'traffic', color: 'bg-orange-50 border-orange-250 text-orange-600' },
  { value: 'WATER_CRISIS', label: 'Water / Pipeline Burst', icon: 'water_damage', color: 'bg-sky-50 border-sky-250 text-sky-600' },
  { value: 'WASTE_HAZARD', label: 'Waste Hazard', icon: 'biohazard', color: 'bg-emerald-50 border-emerald-250 text-emerald-600' },
  { value: 'BLOOD_EMERGENCY', label: 'Blood Request', icon: 'bloodtype', color: 'bg-red-50 border-red-250 text-red-600' }
];

export default function EmergencyReportPage() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [isReportingEmergency, setIsReportingEmergency] = useState(false);
  const [showMapAdjuster, setShowMapAdjuster] = useState(false);
  const [emergencyForm, setEmergencyForm] = useState({
    description: '',
    category: 'HEALTH_AMBULANCE',
    latitude: '',
    longitude: '',
    affected_radius_meters: 500
  });

  const [detectedEmergencyLocationText, setDetectedEmergencyLocationText] = useState('');
  const [detectingEmergencyLocation, setDetectingEmergencyLocation] = useState(false);
  const [isSearchingEmergencyLocation, setIsSearchingEmergencyLocation] = useState(false);
  const [emergencyLocationSearchQuery, setEmergencyLocationSearchQuery] = useState('');
  const [emergencyLocationResults, setEmergencyLocationResults] = useState([]);

  // Geocode location
  const handleGeocodeEmergencyLocation = async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      if (res.ok) {
        const data = await res.json();
        setDetectedEmergencyLocationText(data.display_name || `Coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      }
    } catch (err) {
      console.error("Geocoding failed:", err);
    }
  };

  // Device GPS Location Acquisition
  const handleDetectEmergencyLocation = () => {
    setDetectingEmergencyLocation(true);
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      setDetectingEmergencyLocation(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setEmergencyForm(prev => ({
          ...prev,
          latitude: lat,
          longitude: lng
        }));
        handleGeocodeEmergencyLocation(lat, lng);
        setDetectingEmergencyLocation(false);
        toast.success("Location retrieved from device!");
      },
      (error) => {
        console.error(error);
        toast.error("Unable to access GPS device location. Please search manually.");
        setDetectingEmergencyLocation(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Auto detect coordinates on page load
  useEffect(() => {
    handleDetectEmergencyLocation();
  }, []);

  const handleSearchEmergencyLocation = async (query) => {
    if (!query.trim()) return;
    setIsSearchingEmergencyLocation(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
      if (res.ok) {
        const data = await res.json();
        setEmergencyLocationResults(data);
        if (data.length === 0) {
          toast.error("No locations found for this query.");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to look up location coordinates.");
    } finally {
      setIsSearchingEmergencyLocation(false);
    }
  };

  const handleSelectEmergencyLocation = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setEmergencyForm(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng
    }));
    setDetectedEmergencyLocationText(result.display_name);
    setEmergencyLocationSearchQuery('');
    setEmergencyLocationResults([]);
  };

  const handleEmergencySubmit = async (e) => {
    e.preventDefault();
    if (!emergencyForm.latitude || !emergencyForm.longitude) {
      toast.error("Please select a crisis site location.");
      return;
    }

    const selectedCategoryObj = categories.find(c => c.value === emergencyForm.category);
    const categoryLabel = selectedCategoryObj ? selectedCategoryObj.label : emergencyForm.category;
    const autoTitle = `SOS Alert: ${categoryLabel}`;
    const descVal = emergencyForm.description.trim() || "Immediate emergency assistance required at target location.";

    setIsReportingEmergency(true);
    const triggerToast = toast.loading("Alerting local emergency services...");
    try {
      await triggerSOS({
        title: autoTitle,
        description: descVal,
        category: emergencyForm.category,
        severity: 'CRITICAL',
        latitude: parseFloat(emergencyForm.latitude),
        longitude: parseFloat(emergencyForm.longitude),
        affected_radius_meters: 500
      });
      toast.success("Emergency SOS Beacon Active! Responders notified.", { id: triggerToast });
      
      // Go back to the emergency tab on dashboard
      navigate('/dashboard?tab=emergency');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Failed to trigger SOS beacon.", { id: triggerToast });
      setIsReportingEmergency(false);
    }
  };

  // Map Setup
  const emergencyMapRef = useRef(null);
  const emergencyMarkerRef = useRef(null);

  useEffect(() => {
    const mapContainer = document.getElementById('emergency-form-map');
    if (!mapContainer) {
      if (emergencyMapRef.current) {
        emergencyMapRef.current.remove();
        emergencyMapRef.current = null;
        emergencyMarkerRef.current = null;
      }
      return;
    }

    const lat = parseFloat(emergencyForm.latitude) || 10.0159;
    const lng = parseFloat(emergencyForm.longitude) || 76.3419;

    if (!emergencyMapRef.current) {
      const mapInstance = L.map(mapContainer, {
        zoomControl: true,
        attributionControl: false
      }).setView([lat, lng], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstance);
      emergencyMapRef.current = mapInstance;

      const marker = L.marker([lat, lng], { draggable: true }).addTo(mapInstance);
      emergencyMarkerRef.current = marker;

      marker.on('dragend', (e) => {
        const position = e.target.getLatLng();
        setEmergencyForm(prev => ({
          ...prev,
          latitude: position.lat,
          longitude: position.lng
        }));
        handleGeocodeEmergencyLocation(position.lat, position.lng);
      });
    } else {
      emergencyMapRef.current.setView([lat, lng]);
      if (emergencyMarkerRef.current) {
        emergencyMarkerRef.current.setLatLng([lat, lng]);
      }
    }
  }, [showMapAdjuster, emergencyForm.latitude, emergencyForm.longitude]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard?tab=emergency')}
            className="flex items-center gap-1.5 py-2 px-3 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors font-bold text-sm"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            Back to Dashboard
          </button>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping"></span>
            <span className="text-xs font-black uppercase tracking-wider text-rose-700">SOS Live Portal</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-slate-200 bg-gradient-to-r from-rose-500/10 to-red-500/10 flex items-center gap-4">
            <div className="bg-rose-100 text-rose-600 p-3 rounded-2xl animate-pulse">
              <span className="material-symbols-outlined text-3xl font-black">emergency</span>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-rose-955 tracking-tight">Trigger Emergency SOS</h1>
              <p className="text-xs text-slate-500 font-semibold mt-1">This report is routed directly to municipal emergency dispatch for immediate responder taskforce allocation.</p>
            </div>
          </div>

          <form onSubmit={handleEmergencySubmit} className="p-6 sm:p-8 space-y-8">
            {/* 1. Category Tiles Grid */}
            <div className="space-y-4">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-wider">Select Crisis Category *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                {categories.map((cat) => {
                  const isSelected = emergencyForm.category === cat.value;
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setEmergencyForm(prev => ({ ...prev, category: cat.value }))}
                      className={`flex flex-col items-center justify-center p-5 rounded-2xl border text-center transition-all duration-300 ${
                        isSelected
                          ? 'border-red-500 bg-red-50 text-red-700 shadow-md ring-4 ring-red-500/10 scale-[1.03] font-black'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100/70 text-slate-600 hover:text-slate-800 font-bold'
                      }`}
                    >
                      <span className="material-symbols-outlined text-3xl mb-2">{cat.icon}</span>
                      <span className="text-xs leading-tight">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Target Location Selector & Collapsible Map */}
            <div className="space-y-4">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-wider">Crisis Location *</label>
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-250 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex gap-3.5 items-start min-w-0">
                  <span className="material-symbols-outlined text-rose-600 animate-pulse mt-0.5 text-2xl">location_on</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black text-slate-800">Target Incident Location</p>
                    <p className="text-xs font-semibold text-slate-500 mt-1.5 leading-relaxed break-words">
                      {detectedEmergencyLocationText || (emergencyForm.latitude ? `GPS Coordinates: ${parseFloat(emergencyForm.latitude).toFixed(5)}, ${parseFloat(emergencyForm.longitude).toFixed(5)}` : "Detecting location coordinates...")}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMapAdjuster(!showMapAdjuster)}
                  className="text-xs font-black text-blue-700 hover:text-blue-600 border border-blue-200 hover:bg-blue-50/50 px-4 py-2.5 rounded-xl transition-all shadow-sm shrink-0"
                >
                  {showMapAdjuster ? "Hide Map Adjuster" : "Pin/Adjust on Map"}
                </button>
              </div>

              {showMapAdjuster && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 border border-slate-200 rounded-2xl p-5 bg-slate-50/30">
                  <div className="lg:col-span-5 space-y-4">
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wider">Search Landmark / Address</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                        placeholder="Search street, landmark, area..."
                        value={emergencyLocationSearchQuery}
                        onChange={(e) => {
                          setEmergencyLocationSearchQuery(e.target.value);
                          if (!e.target.value) {
                            setEmergencyLocationResults([]);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSearchEmergencyLocation(emergencyLocationSearchQuery);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleSearchEmergencyLocation(emergencyLocationSearchQuery)}
                        disabled={isSearchingEmergencyLocation}
                        className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition-all disabled:opacity-50 flex items-center justify-center shrink-0"
                      >
                        Search
                      </button>
                    </div>
                    
                    {/* Autocomplete drop-down results */}
                    {emergencyLocationResults.length > 0 && (
                      <div className="bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto mt-1">
                        {emergencyLocationResults.map((result) => (
                          <button
                            key={result.place_id}
                            type="button"
                            className="w-full text-left px-4 py-2.5 hover:bg-rose-50 text-[11px] font-semibold text-slate-700 border-b border-slate-105 last:border-0 block transition-colors"
                            onClick={() => handleSelectEmergencyLocation(result)}
                          >
                            <div className="flex gap-2.5 items-start">
                              <span className="material-symbols-outlined text-rose-500 text-sm mt-0.5">location_on</span>
                              <p className="text-slate-800 leading-tight truncate">{result.display_name}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleDetectEmergencyLocation}
                      disabled={detectingEmergencyLocation}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-black transition-all disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-sm">{detectingEmergencyLocation ? 'sync' : 'my_location'}</span>
                      {detectingEmergencyLocation ? 'Acquiring GPS...' : 'Detect Location again'}
                    </button>
                  </div>

                  <div className="lg:col-span-7 h-[250px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative">
                    <div id="emergency-form-map" className="w-full h-full z-10"></div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Description Area */}
            <div className="space-y-2.5">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-wider">Incident Details (Optional)</label>
              <textarea 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all h-24 resize-none"
                placeholder="Specify critical details to assist emergency teams (e.g. casualties, spreading hazard, blocked pathways)..."
                value={emergencyForm.description}
                onChange={(e) => setEmergencyForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            {/* 4. Action Button */}
            <button
              type="submit"
              disabled={isReportingEmergency}
              className="w-full bg-gradient-to-r from-red-650 to-rose-650 hover:from-red-600 hover:to-rose-600 text-white py-4.5 rounded-2xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 hover:shadow-red-500/30 transition-all disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-lg animate-pulse font-black">emergency</span>
              {isReportingEmergency ? 'Alerting Dispatch Center...' : 'TRIGGER EMERGENCY SOS'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getMyComplaintsApi } from '../api/complaintsApi';
import Navbar from '../components/Navbar';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import ComplaintDetailsModal from '../components/shared/ComplaintDetailsModal';

const isVideoUrl = (url) => {
  if (!url) return false;
  const cleanUrl = url.toLowerCase().split('?')[0];
  return cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.webm') || cleanUrl.endsWith('.ogg') || cleanUrl.endsWith('.mov') || cleanUrl.endsWith('.quicktime') || url.includes('/video');
};

import ComplaintLocation from '../components/shared/ComplaintLocation';

const ReportsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetailsModalMobile, setShowDetailsModalMobile] = useState(false);
  const rightMapRef = useRef(null);

  useEffect(() => {
    if (!selectedReport) return;
    const lat = Number(selectedReport.location_lat || selectedReport.latitude || 0);
    const lng = Number(selectedReport.location_lng || selectedReport.longitude || 0);

    if (lat && lng) {
      setTimeout(() => {
        const container = document.getElementById(`right-pane-map-${selectedReport.id}`);
        if (container) {
          if (rightMapRef.current) {
            rightMapRef.current.remove();
            rightMapRef.current = null;
          }
          
          const mapInstance = L.map(container, {
            zoomControl: false,
            attributionControl: false
          }).setView([lat, lng], 14);
          
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstance);
          
          const pinColor = {
            traffic: '#f59e0b',
            waste: '#ef4444',
            water: '#3b82f6',
            general: '#64748b'
          }[selectedReport.department] || '#ef4444';

          const customIcon = L.divIcon({
            className: 'custom-map-pin',
            html: `<div style="
               background-color: ${pinColor};
               width: 24px;
               height: 24px;
               border-radius: 50%;
               border: 2px solid white;
               box-shadow: 0 2px 4px rgba(0,0,0,0.3);
               display: flex;
               align-items: center;
               justify-content: center;
               color: white;
             ">
               <span class="material-symbols-outlined" style="font-size: 14px; font-weight: bold;">location_on</span>
             </div>`,
             iconSize: [24, 24],
             iconAnchor: [12, 24]
          });

          L.marker([lat, lng], { icon: customIcon }).addTo(mapInstance);
          rightMapRef.current = mapInstance;
        }
      }, 100);
    }
  }, [selectedReport]);

  const loadReports = async () => {
    try {
      const res = await getMyComplaintsApi();
      const sorted = (res.data || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setComplaints(sorted);
      setFilteredComplaints(sorted);
      // Auto-select first report if any exist
      if (sorted.length > 0) {
        setSelectedReport(sorted[0]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load your complaints list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  // Filter complaints based on status tab and search text
  useEffect(() => {
    let result = complaints;

    if (statusFilter !== 'ALL') {
      if (statusFilter === 'RESOLVED') {
        result = result.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED');
      } else if (statusFilter === 'IN_PROGRESS') {
        result = result.filter(c => c.status === 'IN_PROGRESS' || c.status === 'ASSIGNED');
      } else {
        result = result.filter(c => c.status === statusFilter);
      }
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.title.toLowerCase().includes(query) || 
        c.description.toLowerCase().includes(query) ||
        c.department.toLowerCase().includes(query)
      );
    }

    setFilteredComplaints(result);
    
    // Adjust selected report if current one is filtered out
    if (result.length > 0) {
      // Keep current selection if it's still in the filtered list
      const stillVisible = result.some(c => c.id === selectedReport?.id);
      if (!stillVisible) {
        setSelectedReport(result[0]);
      }
    } else {
      setSelectedReport(null);
    }
  }, [statusFilter, searchQuery, complaints]);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'RESOLVED':
      case 'CLOSED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100/50';
      case 'IN_PROGRESS':
      case 'ASSIGNED':
        return 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100/50';
      default:
        return 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100/50';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'RESOLVED':
      case 'CLOSED':
        return 'bg-emerald-500 text-white shadow-emerald-500/20';
      case 'IN_PROGRESS':
      case 'ASSIGNED':
        return 'bg-amber-500 text-white shadow-amber-500/20';
      default:
        return 'bg-red-500 text-white shadow-red-500/20';
    }
  };

  const getDeptIcon = (dept) => {
    switch (dept) {
      case 'traffic': return 'traffic';
      case 'waste': return 'delete_sweep';
      case 'water': return 'water_drop';
      default: return 'help';
    }
  };

  const getDeptColorClass = (dept) => {
    switch (dept) {
      case 'traffic': return 'bg-amber-500/10 text-amber-600';
      case 'waste': return 'bg-red-500/10 text-red-600';
      case 'water': return 'bg-blue-500/10 text-blue-600';
      default: return 'bg-slate-500/10 text-slate-600';
    }
  };

  const defaultIssuePlaceholder = "https://images.unsplash.com/photo-1599740831664-927e1f1484f2?q=80&w=300&auto=format&fit=crop";

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2">
          <span className="material-symbols-outlined animate-spin text-4xl text-blue-600">sync</span>
          <p className="text-slate-600 font-semibold">Loading reports log...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans antialiased overflow-hidden">
      
      {/* Top Navigation Navbar */}
      <Navbar />

      {/* Main Workspace split */}
      <div className="flex-1 flex overflow-hidden p-4 pb-20 lg:p-6 lg:pb-6 max-w-[1600px] mx-auto w-full gap-6">
        
        {/* Left Side: Filterable Scroll List */}
        <div className="w-full lg:w-[420px] flex flex-col h-full bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm shrink-0">
          {/* Filters Panel */}
          <div className="p-4 border-b border-slate-200 space-y-3 bg-slate-50/50">
            {/* Search Input */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <span className="material-symbols-outlined text-sm">search</span>
              </span>
              <input 
                type="text" 
                className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                placeholder="Search report title, description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Filter Tabs */}
            <div className="flex gap-1.5 overflow-x-auto text-[11px] font-bold text-slate-500 select-none pb-0.5">
              {[
                { label: 'All', value: 'ALL' },
                { label: 'Pending', value: 'PENDING' },
                { label: 'In Progress', value: 'IN_PROGRESS' },
                { label: 'Resolved', value: 'RESOLVED' }
              ].map(tab => (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value)}
                  className={`px-3 py-1.5 rounded-md border transition-all shrink-0 ${
                    statusFilter === tab.value 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                      : 'bg-white border-slate-200 hover:bg-slate-100 hover:text-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable Items Container */}
          <div className="flex-grow overflow-y-auto divide-y divide-slate-100">
            {filteredComplaints.length > 0 ? (
              filteredComplaints.map((report) => (
                <button
                  key={report.id}
                  onClick={() => {
                    setSelectedReport(report);
                    if (window.innerWidth < 1024) {
                      setShowDetailsModalMobile(true);
                    }
                  }}
                  className={`w-full text-left p-4 flex gap-4 transition-all border-l-4 ${
                    selectedReport?.id === report.id 
                      ? 'bg-blue-50/40 border-blue-600 hover:bg-blue-50/50' 
                      : 'bg-white border-transparent hover:bg-slate-50'
                  }`}
                >
                  {/* Small Image or Video thumbnail */}
                  <div className="w-16 h-16 rounded-lg shrink-0 border border-slate-200 bg-slate-100 flex items-center justify-center overflow-hidden relative">
                    {report.image_url ? (
                      isVideoUrl(report.image_url) ? (
                        <video 
                          src={report.image_url} 
                          muted 
                          playsInline 
                          autoPlay 
                          loop 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img 
                          src={report.image_url} 
                          alt={report.title} 
                          className="w-full h-full object-cover"
                        />
                      )
                    ) : (
                      <span className="material-symbols-outlined text-slate-300 text-xl">image</span>
                    )}
                  </div>
                  
                  {/* Text details */}
                  <div className="flex-grow overflow-hidden flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-0.5">
                        <h4 className="text-xs font-bold text-slate-900 truncate leading-snug">{report.title}</h4>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border shrink-0 ${getStatusStyle(report.status)}`}>
                          {report.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-semibold line-clamp-1 leading-snug mb-1">{report.description}</p>
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold">
                      <span className="flex items-center gap-0.5 truncate max-w-[160px]">
                        <span className="material-symbols-outlined text-[10px]">location_on</span>
                        <ComplaintLocation lat={report.location_lat} lng={report.location_lng} />
                      </span>
                      <span>{new Date(report.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-16 px-4">
                <span className="material-symbols-outlined text-slate-200 text-4xl">assignment_late</span>
                <p className="text-slate-400 font-semibold text-xs mt-2">No reports found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Detailed pane */}
        <div className="hidden lg:flex flex-col flex-grow h-full bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm relative">
          {selectedReport ? (
            <div className="flex flex-col h-full overflow-y-auto">
              
              {/* Cover Image or Video banner */}
              <div className="relative h-48 bg-slate-900 w-full shrink-0 overflow-hidden flex items-center justify-center">
                {selectedReport.image_url && isVideoUrl(selectedReport.image_url) ? (
                  <video 
                    src={selectedReport.image_url} 
                    controls 
                    className="h-full object-contain relative z-10 w-full"
                  />
                ) : (
                  <>
                    <div 
                      className="absolute inset-0 bg-cover bg-center opacity-40 blur-sm scale-105" 
                      style={{ backgroundImage: `url('${selectedReport.image_url || defaultIssuePlaceholder}')` }}
                    />
                    <img 
                      src={selectedReport.image_url || defaultIssuePlaceholder} 
                      alt={selectedReport.title}
                      className="h-full object-contain relative z-10"
                    />
                  </>
                )}
                
                {/* Department Overlay */}
                <div className={`absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black shadow-md border border-white/10 ${getDeptColorClass(selectedReport.department)} backdrop-blur-md`}>
                  <span className="material-symbols-outlined text-sm">{getDeptIcon(selectedReport.department)}</span>
                  <span className="uppercase tracking-wider">{selectedReport.department}</span>
                </div>
              </div>

              {/* Detail body */}
              <div className="p-6 flex-grow space-y-6">
                
                {/* Header Title + status */}
                <div className="flex justify-between items-start gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{selectedReport.title}</h2>
                    <p className="text-xs text-slate-450 font-semibold mt-1">
                      Report ID: #{selectedReport.id} • Filed on {new Date(selectedReport.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span className={`${getStatusBadgeClass(selectedReport.status)} text-white text-xs font-black px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5 tracking-wider`}>
                    <span className="material-symbols-outlined text-sm">
                      {selectedReport.status === 'RESOLVED' || selectedReport.status === 'CLOSED' ? 'check_circle' : 'pending'}
                    </span>
                    {selectedReport.status}
                  </span>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</h4>
                  <p className="text-sm font-medium text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-wrap leading-relaxed">
                    {selectedReport.description}
                  </p>
                </div>

                {/* Visual Evidence Comparison */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-blue-600 text-base">photo_library</span>
                    Visual Evidence
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Before */}
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between h-48">
                      <span className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider block mb-1">Before Fix (Citizen Upload)</span>
                      {selectedReport.image_url ? (
                        <div className="w-full flex-1 rounded-lg overflow-hidden border border-slate-200 relative bg-black">
                          {isVideoUrl(selectedReport.image_url) ? (
                            <video src={selectedReport.image_url} controls className="w-full h-full object-cover" />
                          ) : (
                            <img src={selectedReport.image_url} alt="Before Fix" className="w-full h-full object-cover" />
                          )}
                        </div>
                      ) : (
                        <div className="w-full flex-1 rounded-lg border border-dashed border-slate-350 bg-white flex flex-col items-center justify-center text-slate-400 text-xs">
                          <span className="material-symbols-outlined text-2xl mb-1 text-slate-350">image_not_supported</span>
                          No before media
                        </div>
                      )}
                    </div>

                    {/* After */}
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between h-48">
                      <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider block mb-1">After Fix (Worker Proof)</span>
                      {selectedReport.resolution_image ? (
                        <div className="w-full flex-1 rounded-lg overflow-hidden border border-slate-200 relative bg-black">
                          {isVideoUrl(selectedReport.resolution_image) ? (
                            <video src={selectedReport.resolution_image} controls className="w-full h-full object-cover" />
                          ) : (
                            <img src={selectedReport.resolution_image} alt="After Fix" className="w-full h-full object-cover" />
                          )}
                        </div>
                      ) : (
                        <div className="w-full flex-1 rounded-lg border border-dashed border-slate-300 bg-white flex flex-col items-center justify-center text-slate-400 text-xs">
                          <span className="material-symbols-outlined text-2xl mb-1 text-slate-350">add_a_photo</span>
                          {selectedReport.status === 'RESOLVED' || selectedReport.status === 'CLOSED' ? 'No resolution media' : 'Awaiting completion upload'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Location and Interactive Map Card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between h-40">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Location details</span>
                      <div className="text-xs font-bold text-slate-850 leading-tight">
                        <ComplaintLocation lat={selectedReport.location_lat} lng={selectedReport.location_lng} />
                      </div>
                      <p className="text-[9px] text-slate-400 font-semibold mt-1">
                        Coordinates: {selectedReport.location_lat.toFixed(6)}, {selectedReport.location_lng.toFixed(6)}
                      </p>
                    </div>
                    
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${selectedReport.location_lat},${selectedReport.location_lng}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="shrink-0 flex items-center justify-center gap-1.5 py-2 bg-white border border-slate-200 text-xs font-bold text-slate-705 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-all shadow-sm"
                    >
                      <span className="material-symbols-outlined text-sm">map</span>
                      Google Maps
                    </a>
                  </div>

                  {/* Interactive Leaflet Map Div */}
                  <div 
                    id={`right-pane-map-${selectedReport.id}`} 
                    className="w-full h-40 rounded-xl border border-slate-205 overflow-hidden shadow-sm relative z-0 bg-slate-100"
                  />
                </div>

                {/* Official Resolution Summary */}
                {selectedReport.resolution_report && (
                  <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-100 shadow-sm space-y-1">
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm font-bold">check_circle</span>
                      Official Resolution Notes
                    </span>
                    <p className="text-sm font-semibold text-emerald-900 whitespace-pre-wrap leading-relaxed">
                      {selectedReport.resolution_report}
                    </p>
                  </div>
                )}

                {/* Department worker & Timeline section */}
                <div className="border-t border-slate-100 pt-5 space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tracking Timeline</h4>
                  
                  <div className="space-y-4 text-xs">
                    
                    {/* Step 1: Filed */}
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span className="material-symbols-outlined p-0.5 rounded-full text-[10px] shrink-0 bg-blue-50 text-blue-600 border border-blue-100 font-bold">
                          done
                        </span>
                        <div className="w-[1px] bg-slate-200 flex-grow my-1"></div>
                      </div>
                      <div className="pt-0.5">
                        <p className="font-extrabold text-slate-800">Issue Reported</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Filed successfully by citizen on {new Date(selectedReport.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Step 2: Assigned */}
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span className={`material-symbols-outlined p-0.5 rounded-full text-[10px] shrink-0 font-bold ${
                          selectedReport.assigned_worker_id 
                            ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                            : 'bg-slate-50 text-slate-400 border border-slate-200'
                        }`}>
                          {selectedReport.assigned_worker_id ? 'done' : 'person'}
                        </span>
                        <div className="w-[1px] bg-slate-200 flex-grow my-1"></div>
                      </div>
                      <div className="pt-0.5">
                        <p className="font-extrabold text-slate-800">Worker Assignment</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {selectedReport.assigned_worker_id 
                            ? `Assigned to worker ID #${selectedReport.assigned_worker_id}` 
                            : 'Awaiting review and worker allocation'}
                        </p>
                      </div>
                    </div>

                    {/* Step 3: Resolved */}
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span className={`material-symbols-outlined p-0.5 rounded-full text-[10px] shrink-0 font-bold ${
                          selectedReport.status === 'RESOLVED' || selectedReport.status === 'CLOSED'
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                            : 'bg-slate-50 text-slate-400 border border-slate-200'
                        }`}>
                          {selectedReport.status === 'RESOLVED' || selectedReport.status === 'CLOSED' ? 'check' : 'task_alt'}
                        </span>
                      </div>
                      <div className="pt-0.5">
                        <p className="font-extrabold text-slate-800">Resolution Status</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {selectedReport.status === 'RESOLVED' || selectedReport.status === 'CLOSED'
                            ? `Resolved successfully ${selectedReport.resolved_at ? `on ${new Date(selectedReport.resolved_at).toLocaleString()}` : ''}`
                            : 'Pending final review and verification'}
                        </p>
                      </div>
                    </div>

                  </div>
                </div>

              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <span className="material-symbols-outlined text-slate-200 text-7xl mb-4 select-none">receipt_long</span>
              <h3 className="text-xl font-bold text-slate-700">Select a Report</h3>
              <p className="text-slate-400 max-w-sm font-semibold text-xs mt-1">
                Click on any report in the left sidebar to view its category, uploaded photo/video, map coordinates, and tracking timeline.
              </p>
            </div>
          )}
        </div>

      </div>

      {showDetailsModalMobile && selectedReport && (
        <ComplaintDetailsModal 
          complaint={selectedReport} 
          onClose={() => setShowDetailsModalMobile(false)} 
        />
      )}

    </div>
  );
};

export default ReportsPage;

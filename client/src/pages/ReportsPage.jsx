import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getMyComplaintsApi } from '../api/complaintsApi';
import Navbar from '../components/Navbar';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import ComplaintDetailsModal from '../components/shared/ComplaintDetailsModal';
import ComplaintLocation from '../components/shared/ComplaintLocation';
import {
  Search,
  MapPin,
  Calendar,
  Image as ImageIcon,
  Camera,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronRight,
  SlidersHorizontal,
  Info,
  Layers,
  Map,
  Compass,
  FileText,
  User,
  ShieldCheck,
  ChevronDown,
  Loader2,
  Activity,
  AlertTriangle
} from 'lucide-react';

const isVideoUrl = (url) => {
  if (!url) return false;
  const cleanUrl = url.toLowerCase().split('?')[0];
  return cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.webm') || cleanUrl.endsWith('.ogg') || cleanUrl.endsWith('.mov') || cleanUrl.endsWith('.quicktime') || url.includes('/video');
};

export default function ReportsPage() {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetailsModalMobile, setShowDetailsModalMobile] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'media' | 'map'
  const rightMapRef = useRef(null);

  // Load complaints list
  const loadReports = async () => {
    try {
      setLoading(true);
      const res = await getMyComplaintsApi();
      const sorted = (res.data || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setComplaints(sorted);
      setFilteredComplaints(sorted);
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

  // Filter complaints based on status filter and search query
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
        (c.title || '').toLowerCase().includes(query) ||
        (c.description || '').toLowerCase().includes(query) ||
        (c.department || '').toLowerCase().includes(query)
      );
    }

    setFilteredComplaints(result);

    if (result.length > 0) {
      const stillVisible = result.some(c => c.id === selectedReport?.id);
      if (!stillVisible) {
        setSelectedReport(result[0]);
        setActiveTab('overview');
      }
    } else {
      setSelectedReport(null);
    }
  }, [statusFilter, searchQuery, complaints]);

  // Leaflet map initialization
  useEffect(() => {
    if (!selectedReport || activeTab !== 'map') return;
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
            waste: '#10b981',
            water: '#3b82f6',
            general: '#6366f1'
          }[selectedReport.department] || '#ef4444';

          const customIcon = L.divIcon({
            className: 'custom-map-pin',
            html: `<div style="
               background-color: ${pinColor};
               width: 32px;
               height: 32px;
               border-radius: 50%;
               border: 3px solid white;
               box-shadow: 0 4px 12px rgba(0,0,0,0.25);
               display: flex;
               align-items: center;
               justify-content: center;
               color: white;
             ">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
             </div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 32]
          });

          L.marker([lat, lng], { icon: customIcon }).addTo(mapInstance);
          rightMapRef.current = mapInstance;
        }
      }, 50);
    }
  }, [selectedReport, activeTab]);

  const handleSelectReport = (report) => {
    setSelectedReport(report);
    setActiveTab('overview');
    if (window.innerWidth < 1024) {
      setShowDetailsModalMobile(true);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'RESOLVED':
      case 'CLOSED':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-250',
          badge: 'bg-emerald-600 text-white shadow-emerald-600/20 shadow-lg',
          indicator: 'bg-emerald-500',
          icon: CheckCircle2
        };
      case 'IN_PROGRESS':
      case 'ASSIGNED':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-250',
          badge: 'bg-amber-550 bg-amber-500 text-white shadow-amber-500/20 shadow-lg',
          indicator: 'bg-amber-500',
          icon: Clock
        };
      default:
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-250',
          badge: 'bg-rose-500 text-white shadow-rose-500/20 shadow-lg',
          indicator: 'bg-rose-500',
          icon: AlertTriangle
        };
    }
  };

  const getDeptConfig = (dept) => {
    switch (dept) {
      case 'traffic':
        return { label: 'Traffic Control', bg: 'bg-amber-50/80 border-amber-200 text-amber-800', icon: Compass };
      case 'waste':
        return { label: 'Waste Management', bg: 'bg-emerald-50/80 border-emerald-200 text-emerald-800', icon: Trash2 };
      case 'water':
        return { label: 'Water Authority', bg: 'bg-blue-50/80 border-blue-200 text-blue-800', icon: Compass };
      default:
        return { label: 'General Operations', bg: 'bg-indigo-50/80 border-indigo-200 text-indigo-800', icon: FileText };
    }
  };

  const Trash2 = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" {...props}><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
  );

  const defaultIssuePlaceholder = "https://images.unsplash.com/photo-1599740831664-927e1f1484f2?q=80&w=600&auto=format&fit=crop";

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
          <p className="text-slate-500 font-extrabold text-sm tracking-wide">Loading reports log...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans antialiased overflow-hidden">
      <Navbar />

      {/* Main Split Layout */}
      <div className="flex-1 flex overflow-hidden p-4 pb-24 lg:p-6 lg:pb-6 max-w-[1600px] mx-auto w-full gap-6">
        
        {/* Left Sidebar List */}
        <div className="w-full lg:w-[420px] flex flex-col h-full bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-md shrink-0">
          
          {/* Search and Filters Header */}
          <div className="p-5 border-b border-slate-200/60 space-y-4 bg-gradient-to-b from-slate-50/50 to-white">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-slate-800 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                placeholder="Search reports by title, keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Horizontal Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto text-xs font-bold text-slate-500 select-none pb-1 scrollbar-none">
              {[
                { label: 'All', value: 'ALL' },
                { label: 'Pending', value: 'PENDING' },
                { label: 'In Progress', value: 'IN_PROGRESS' },
                { label: 'Resolved', value: 'RESOLVED' }
              ].map(tab => (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value)}
                  className={`px-4 py-2 rounded-xl border transition-all shrink-0 font-black shadow-sm ${
                    statusFilter === tab.value
                      ? 'bg-indigo-600 text-white border-indigo-650 shadow-indigo-500/20'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800 hover:border-slate-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Complaints Scroll Items */}
          <div className="flex-grow overflow-y-auto divide-y divide-slate-100">
            {filteredComplaints.length > 0 ? (
              filteredComplaints.map((report) => {
                const isSelected = selectedReport?.id === report.id;
                const statusConf = getStatusConfig(report.status);
                const isVideo = isVideoUrl(report.image_url);
                return (
                  <button
                    key={report.id}
                    onClick={() => handleSelectReport(report)}
                    className={`w-full text-left p-4.5 flex gap-4 transition-all duration-300 border-l-4 ${
                      isSelected
                        ? 'bg-indigo-50/30 border-indigo-600 shadow-sm'
                        : 'bg-white border-transparent hover:bg-slate-50/60'
                    }`}
                  >
                    {/* Media Thumbnail */}
                    <div className="w-16 h-16 rounded-2xl shrink-0 border border-slate-200 bg-slate-100 flex items-center justify-center overflow-hidden relative shadow-sm hover:scale-[1.03] duration-300">
                      {report.image_url ? (
                        isVideo ? (
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
                        <ImageIcon className="w-7 h-7 text-slate-350" />
                      )}
                    </div>

                    {/* Text Details */}
                    <div className="flex-grow overflow-hidden flex flex-col justify-between h-16 py-0.5">
                      <div>
                        <div className="flex justify-between items-start gap-2.5">
                          <h4 className={`text-xs font-black truncate leading-tight ${isSelected ? 'text-indigo-950 font-black' : 'text-slate-900'}`}>{report.title}</h4>
                          <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border shrink-0 ${statusConf.bg}`}>
                            {report.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-semibold line-clamp-1 leading-snug mt-1">{report.description}</p>
                      </div>

                      <div className="flex items-center justify-between text-[9px] text-slate-400 font-extrabold mt-1">
                        <span className="flex items-center gap-0.5 truncate max-w-[170px]">
                          <MapPin className="w-3.5 h-3.5 text-slate-450 shrink-0" />
                          <span className="truncate"><ComplaintLocation lat={report.location_lat} lng={report.location_lng} /></span>
                        </span>
                        <span>{new Date(report.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="text-center py-20 px-4">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-200/50">
                  <XCircle className="w-7 h-7 text-slate-400 animate-pulse" />
                </div>
                <h4 className="text-sm font-black text-slate-800">No reports found</h4>
                <p className="text-slate-400 font-semibold text-xs mt-1">Try altering your search or filters.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Details Panel */}
        <div className="hidden lg:flex flex-col flex-grow h-full bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-md relative">
          {selectedReport ? (
            <div className="flex flex-col h-full overflow-y-auto">
              
              {/* Cover Media Header Banner */}
              <div className="relative h-60 bg-slate-950 w-full shrink-0 overflow-hidden flex items-center justify-center border-b border-slate-200">
                {selectedReport.image_url && isVideoUrl(selectedReport.image_url) ? (
                  <video
                    src={selectedReport.image_url}
                    controls
                    className="h-full object-contain relative z-10 w-full"
                  />
                ) : (
                  <>
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-40 blur-lg scale-110"
                      style={{ backgroundImage: `url('${selectedReport.image_url || defaultIssuePlaceholder}')` }}
                    />
                    <img
                      src={selectedReport.image_url || defaultIssuePlaceholder}
                      alt={selectedReport.title}
                      className="h-full object-contain relative z-10 hover:scale-[1.01] transition-transform duration-500"
                    />
                  </>
                )}

                {/* Glassmorphic Float Badge */}
                <div className={`absolute top-5 left-5 z-20 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black shadow-xl border border-white/20 backdrop-blur-md bg-white/90 text-slate-800`}>
                  <Layers className="w-4 h-4 text-indigo-600 animate-pulse" />
                  <span className="uppercase tracking-widest">{getDeptConfig(selectedReport.department).label}</span>
                </div>
              </div>

              {/* Title & Stats Summary bar */}
              <div className="px-6 py-5.5 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/40">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight mb-1">{selectedReport.title}</h2>
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider flex items-center gap-2">
                    <span className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-600 font-black">ID: #{selectedReport.id}</span>
                    <span>• Filed {new Date(selectedReport.created_at).toLocaleString()}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`${getStatusConfig(selectedReport.status).badge} text-xs font-black px-4 py-2 rounded-xl flex items-center gap-1.5 tracking-widest uppercase`}>
                    {React.createElement(getStatusConfig(selectedReport.status).icon, { className: 'w-4 h-4 shrink-0' })}
                    {selectedReport.status}
                  </span>
                </div>
              </div>

              {/* Tabs Navigation (Overview, Media, Map) */}
              <div className="px-6 border-b border-slate-100 flex gap-6 text-sm font-bold text-slate-500 bg-white sticky top-0 z-20 select-none">
                {[
                  { id: 'overview', label: 'Overview', icon: Info },
                  { id: 'media', label: 'Media Proofs', icon: Camera },
                  { id: 'map', label: 'Location Map', icon: Map }
                ].map(tab => {
                  const isTabActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 border-b-2 flex items-center gap-2 transition-all outline-none font-black ${
                        isTabActive
                          ? 'border-indigo-655 border-indigo-600 text-indigo-600'
                          : 'border-transparent text-slate-450 hover:text-slate-700'
                      }`}
                    >
                      {React.createElement(tab.icon, { className: `w-4 h-4 ${isTabActive ? 'text-indigo-600 animate-pulse' : 'text-slate-400'}` })}
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Scrollable Tab Contents */}
              <div className="p-6 flex-grow">
                {activeTab === 'overview' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {/* Description Section */}
                    <div className="space-y-2.5">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</h4>
                      <p className="text-sm font-semibold text-slate-700 bg-slate-50/50 p-5 rounded-2xl border border-slate-200/60 whitespace-pre-wrap leading-relaxed shadow-inner">
                        {selectedReport.description}
                      </p>
                    </div>

                    {/* Timeline section */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tracking Timeline</h4>

                      <div className="space-y-6 text-xs max-w-xl">
                        {/* Step 1: Filed */}
                        <div className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 border-2 border-indigo-200 flex items-center justify-center shadow-sm font-black text-sm shrink-0">
                              ✓
                            </div>
                            <div className="w-[2px] bg-slate-200 flex-grow my-1.5"></div>
                          </div>
                          <div className="pt-0.5">
                            <p className="font-black text-slate-900 text-sm">Issue Reported</p>
                            <p className="text-[10px] text-slate-500 mt-1 font-semibold">
                              Filed successfully by citizen on {new Date(selectedReport.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* Step 2: Assigned */}
                        <div className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 shadow-sm font-black text-sm shrink-0 ${
                              selectedReport.assigned_worker_id
                                ? 'bg-indigo-50 text-indigo-600 border-indigo-200'
                                : 'bg-slate-50 text-slate-400 border-slate-200'
                            }`}>
                              {selectedReport.assigned_worker_id ? '✓' : '2'}
                            </div>
                            <div className="w-[2px] bg-slate-200 flex-grow my-1.5"></div>
                          </div>
                          <div className="pt-0.5">
                            <p className="font-black text-slate-900 text-sm">Worker Assignment</p>
                            <p className="text-[10px] text-slate-500 mt-1 font-semibold">
                              {selectedReport.assigned_worker_id
                                ? `Assigned to Municipal Field Worker (ID #${selectedReport.assigned_worker_id})`
                                : 'Awaiting admin review and municipal staff dispatch'}
                            </p>
                          </div>
                        </div>

                        {/* Step 3: Resolved */}
                        <div className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 shadow-sm font-black text-sm shrink-0 ${
                              selectedReport.status === 'RESOLVED' || selectedReport.status === 'CLOSED'
                                ? 'bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-500/20'
                                : 'bg-slate-50 text-slate-400 border-slate-200'
                            }`}>
                              {selectedReport.status === 'RESOLVED' || selectedReport.status === 'CLOSED' ? '✓' : '3'}
                            </div>
                          </div>
                          <div className="pt-0.5">
                            <p className="font-black text-slate-900 text-sm">Resolution Status</p>
                            <p className="text-[10px] text-slate-500 mt-1 font-semibold">
                              {selectedReport.status === 'RESOLVED' || selectedReport.status === 'CLOSED'
                                ? `Resolved successfully ${selectedReport.resolved_at ? `on ${new Date(selectedReport.resolved_at).toLocaleString()}` : ''}`
                                : 'Awaiting worker completion upload and final approval'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'media' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Before Media card */}
                      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col justify-between h-72 hover:border-indigo-200 transition-all hover:shadow-md duration-300">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[10px] font-black text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-1.5 tracking-wider uppercase">
                            Before Fix (Citizen Upload)
                          </span>
                        </div>
                        {selectedReport.image_url ? (
                          <div className="w-full flex-1 rounded-2xl overflow-hidden border border-slate-100 relative bg-black">
                            {isVideoUrl(selectedReport.image_url) ? (
                              <video src={selectedReport.image_url} controls className="w-full h-full object-cover" />
                            ) : (
                              <img src={selectedReport.image_url} alt="Before Fix" className="w-full h-full object-cover" />
                            )}
                          </div>
                        ) : (
                          <div className="w-full flex-1 rounded-2xl border border-dashed border-slate-205 border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center text-slate-400 text-xs font-semibold">
                            <ImageIcon className="w-9 h-9 mb-2 opacity-50 text-slate-350" />
                            No before media uploaded
                          </div>
                        )}
                      </div>

                      {/* After Media card */}
                      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col justify-between h-72 hover:border-emerald-200 transition-all hover:shadow-md duration-300">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-1.5 tracking-wider uppercase">
                            After Fix (Worker Proof)
                          </span>
                        </div>
                        {selectedReport.resolution_image ? (
                          <div className="w-full flex-1 rounded-2xl overflow-hidden border border-slate-100 relative bg-black">
                            {isVideoUrl(selectedReport.resolution_image) ? (
                              <video src={selectedReport.resolution_image} controls className="w-full h-full object-cover" />
                            ) : (
                              <img src={selectedReport.resolution_image} alt="After Fix" className="w-full h-full object-cover" />
                            )}
                          </div>
                        ) : (
                          <div className="w-full flex-1 rounded-2xl border border-dashed border-slate-205 border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center text-slate-400 text-xs font-semibold">
                            <Camera className="w-9 h-9 mb-2 opacity-50 text-slate-350" />
                            {selectedReport.status === 'RESOLVED' || selectedReport.status === 'CLOSED'
                              ? 'No resolution media provided'
                              : 'Awaiting completion upload'}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Official Resolution Summary */}
                    {selectedReport.resolution_report && (
                      <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl shadow-sm space-y-2 mt-6">
                        <h4 className="text-[10px] font-black text-emerald-800 uppercase tracking-widest flex items-center gap-1.5">
                          <ShieldCheck className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                          Official Resolution Notes
                        </h4>
                        <p className="text-sm font-semibold text-emerald-950 whitespace-pre-wrap leading-relaxed">
                          {selectedReport.resolution_report}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'map' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Location text card */}
                      <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between h-56">
                        <div className="space-y-2.5">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Location Details</span>
                          <div className="text-sm font-black text-slate-800 leading-snug">
                            <ComplaintLocation lat={selectedReport.location_lat} lng={selectedReport.location_lng} />
                          </div>
                          <p className="text-[10px] text-slate-400 font-semibold mt-1">
                            Coordinates: {Number(selectedReport.location_lat).toFixed(6)}, {Number(selectedReport.location_lng).toFixed(6)}
                          </p>
                        </div>

                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${selectedReport.location_lat},${selectedReport.location_lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 flex items-center justify-center gap-2 py-3 bg-slate-50 border border-slate-200 text-xs font-black text-slate-700 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-all shadow-sm"
                        >
                          <MapPin className="w-4 h-4 text-slate-550" />
                          Open in Google Maps
                        </a>
                      </div>

                      {/* Map Pane Container */}
                      <div
                        id={`right-pane-map-${selectedReport.id}`}
                        className="w-full h-56 rounded-3xl border border-slate-200 shadow-sm relative z-0 bg-slate-100 overflow-hidden"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-50/20">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-200/50 mb-4">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-base font-black text-slate-700">Select a Report</h3>
              <p className="text-slate-400 max-w-xs font-semibold text-xs mt-1">
                Select a report from the list to view comprehensive details, timeline tracking, and resolution proof.
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
}

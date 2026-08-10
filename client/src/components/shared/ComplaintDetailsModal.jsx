import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import ComplaintLocation from './ComplaintLocation';
import { downloadTaskPdfReport } from '../../services/workerService';
import { toast } from 'react-hot-toast';
import { getFeedbackForComplaintApi, createFeedbackApi } from '../../api/feedbackApi';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const isVideoUrl = (url) => {
  if (!url) return false;
  const cleanUrl = url.toLowerCase().split('?')[0];
  return cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.webm') || cleanUrl.endsWith('.ogg') || cleanUrl.endsWith('.mov') || cleanUrl.endsWith('.quicktime') || url.includes('/video');
};

export default function ComplaintDetailsModal({ complaint, onClose, workerName = null, showImages = true }) {
  const { user } = useSelector((state) => state.auth);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [lightboxMedia, setLightboxMedia] = useState(null); // { url, isVideo }

  // Feedback states
  const [feedback, setFeedback] = useState(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');

  const mapRef = useRef(null);

  useEffect(() => {
    if (!complaint) return;
    const lat = Number(complaint.location_lat || complaint.latitude || 0);
    const lng = Number(complaint.location_lng || complaint.longitude || 0);

    if (lat && lng && !mapRef.current) {
      setTimeout(() => {
        const container = document.getElementById(`modal-map-${complaint.id}`);
        if (container) {
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
          }[complaint.category || complaint.department] || '#ef4444';

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
          mapRef.current = mapInstance;
        }
      }, 100);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [complaint]);
  useEffect(() => {
    if (!complaint) return;
    const loadFeedback = async () => {
      if (complaint.status === 'RESOLVED' || complaint.status === 'CLOSED') {
        setLoadingFeedback(true);
        try {
          const res = await getFeedbackForComplaintApi(complaint.id);
          setFeedback(res.data || null);
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingFeedback(false);
        }
      }
    };
    loadFeedback();
  }, [complaint]);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    try {
      const res = await createFeedbackApi({
        complaint_id: complaint.id,
        rating: feedbackRating,
        comment: feedbackComment.trim()
      });
      setFeedback(res.data);
      toast.success("Feedback submitted successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Failed to submit feedback.");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (!complaint) return null;

  const beforeImg = complaint.before_image || complaint.image_url;
  const afterImg = complaint.after_image || complaint.resolution_image;
  const isResolved = complaint.status === 'RESOLVED' || complaint.status === 'CLOSED';
  const lat = Number(complaint.location_lat || complaint.latitude || 0);
  const lng = Number(complaint.location_lng || complaint.longitude || 0);

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      const res = await downloadTaskPdfReport(complaint.id);
      if (res.data?.pdf_url) {
        window.open(res.data.pdf_url, '_blank');
        toast.success("PDF Work Completion Report opened!");
      } else {
        toast.error(res.data?.message || "Failed to generate PDF report.");
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not generate PDF report.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const getStatusBadgeStyle = (status) => {
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

  const getDeptColor = (dept) => {
    switch (dept) {
      case 'traffic': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'waste': return 'bg-red-50 text-red-700 border-red-200';
      case 'water': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getDeptIcon = (dept) => {
    switch (dept) {
      case 'traffic': return 'warning';
      case 'waste': return 'delete_sweep';
      case 'water': return 'water_drop';
      default: return 'help';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div
        className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-slate-100 flex flex-col transition-all scale-100 transform duration-300"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header Section */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start sticky top-0 z-10 backdrop-blur-md">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-3 py-1 text-xs font-black rounded-lg border flex items-center gap-1.5 uppercase tracking-wide ${getDeptColor(complaint.department)}`}>
                <span className="material-symbols-outlined text-sm font-bold">{getDeptIcon(complaint.department)}</span>
                {complaint.department || 'General'}
              </span>
              <span className="text-[11px] font-mono text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded">#FMC-COMP-{complaint.id}</span>
              <span className={`px-3 py-1 text-xs font-black rounded-full shadow-sm uppercase tracking-wide ${getStatusBadgeStyle(complaint.status)}`}>
                {complaint.status}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">{complaint.title}</h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-all shrink-0"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-6 flex-grow overflow-y-auto">

          {/* Incident Description */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 shadow-inner">
            <span className="text-xs font-bold text-slate-450 uppercase tracking-wider block mb-1">Issue Description</span>
            <p className="text-sm font-medium text-slate-750 leading-relaxed whitespace-pre-wrap">{complaint.description}</p>
          </div>

          {/* Media Evidence Showcase */}
          {showImages && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-blue-600 text-base">photo_library</span>
                Visual Evidence
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                {/* Before Fix Frame */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-250/60 flex flex-col justify-between h-56">
                  <span className="text-[11px] font-extrabold text-amber-800 uppercase tracking-wider block mb-2">Original Upload (Citizen)</span>
                  {beforeImg ? (
                    <div
                      onClick={() => setLightboxMedia({ url: beforeImg, isVideo: isVideoUrl(beforeImg) })}
                      className="w-full flex-1 rounded-xl overflow-hidden border border-slate-200 cursor-pointer relative group bg-black"
                    >
                      {isVideoUrl(beforeImg) ? (
                        <video src={beforeImg} muted className="w-full h-full object-cover" />
                      ) : (
                        <img src={beforeImg} alt="Before Fix" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      )}
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                        <span className="material-symbols-outlined text-base">
                          {isVideoUrl(beforeImg) ? 'play_circle' : 'zoom_in'}
                        </span>
                        {isVideoUrl(beforeImg) ? 'Play Video' : 'Enlarge'}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full flex-1 rounded-xl border border-dashed border-slate-300 bg-white flex flex-col items-center justify-center text-slate-400 text-xs">
                      <span className="material-symbols-outlined text-3xl mb-1 text-slate-350">image_not_supported</span>
                      No media uploaded
                    </div>
                  )}
                </div>

                {/* After Fix Frame */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-250/60 flex flex-col justify-between h-56">
                  <span className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider block mb-2">Resolution Proof (Worker)</span>
                  {afterImg ? (
                    <div
                      onClick={() => setLightboxMedia({ url: afterImg, isVideo: isVideoUrl(afterImg) })}
                      className="w-full flex-1 rounded-xl overflow-hidden border border-slate-200 cursor-pointer relative group bg-black"
                    >
                      {isVideoUrl(afterImg) ? (
                        <video src={afterImg} muted className="w-full h-full object-cover" />
                      ) : (
                        <img src={afterImg} alt="After Fix" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      )}
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                        <span className="material-symbols-outlined text-base">
                          {isVideoUrl(afterImg) ? 'play_circle' : 'zoom_in'}
                        </span>
                        {isVideoUrl(afterImg) ? 'Play Video' : 'Enlarge'}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full flex-1 rounded-xl border border-dashed border-slate-300 bg-white flex flex-col items-center justify-center text-slate-400 text-xs">
                      <span className="material-symbols-outlined text-3xl mb-1 text-slate-350">add_a_photo</span>
                      {isResolved ? 'No resolution media uploaded' : 'Awaiting worker completion upload'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Location and Map Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* Coordinates & Details */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 flex flex-col justify-between h-48">
              <div>
                <span className="text-xs font-bold text-slate-450 uppercase tracking-wider block mb-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-rose-500 text-base">location_on</span>
                  Reported Location
                </span>
                <div className="text-sm font-bold text-slate-800 leading-snug">
                  <ComplaintLocation lat={lat} lng={lng} />
                </div>
                <p className="text-[10px] text-slate-400 font-semibold mt-1">GPS Coordinates: {lat.toFixed(6)}, {lng.toFixed(6)}</p>
              </div>

              {lat !== 0 && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-white border border-slate-200 text-xs font-bold text-slate-700 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-all shadow-sm shrink-0"
                >
                  <span className="material-symbols-outlined text-base">map</span>
                  Open in Google Maps
                </a>
              )}
            </div>

            {/* Interactive Leaflet Mini-Map */}
            <div
              id={`modal-map-${complaint.id}`}
              className="w-full h-48 rounded-2xl border border-slate-200 overflow-hidden shadow-sm relative z-0 bg-slate-100"
            />
          </div>

          {/* Official Resolution report text */}
          {complaint.resolution_report && (
            <div className="bg-emerald-50/70 p-5 rounded-2xl border border-emerald-100 shadow-sm space-y-1">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block flex items-center gap-1">
                <span className="material-symbols-outlined text-sm font-bold">check_circle</span>
                Official Resolution Notes
              </span>
              <p className="text-sm font-semibold text-emerald-900 whitespace-pre-wrap leading-relaxed">
                {complaint.resolution_report}
              </p>
            </div>
          )}

          {/* Citizen Feedback Section */}
          {isResolved && (
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-indigo-650 text-indigo-650 text-indigo-605 text-indigo-600 text-sm font-bold">rate_review</span>
                Resolution Feedback
              </h4>

              {loadingFeedback ? (
                <div className="text-center py-2 text-slate-500 font-semibold text-xs">Loading feedback...</div>
              ) : feedback ? (
                // Display submitted feedback
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`material-symbols-outlined text-sm ${star <= feedback.rating ? 'text-amber-500 fill-current' : 'text-slate-200'
                          }`}
                      >
                        star
                      </span>
                    ))}
                  </div>
                  {feedback.comment && (
                    <p className="text-sm font-medium text-slate-700 italic">
                      "{feedback.comment}"
                    </p>
                  )}
                  <p className="text-[10px] text-slate-400 font-bold">Submitted by {feedback.citizen_name} on {new Date(feedback.created_at).toLocaleDateString()}</p>
                </div>
              ) : Number(user?.id) === Number(complaint.reported_by || complaint.citizen_id) ? (
                // Render feedback form (only for the citizen who reported it)
                <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Rate the resolution</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFeedbackRating(star)}
                          className="text-amber-500 focus:outline-none hover:scale-110 transition-transform"
                        >
                          <span className={`material-symbols-outlined text-2xl ${star <= feedbackRating ? 'fill-current text-amber-500' : 'text-slate-300'
                            }`}>
                            star
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Comments (Optional)</label>
                    <textarea
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all h-20 resize-none font-semibold"
                      placeholder="Share your experience or rating comments..."
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingFeedback}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-md flex items-center gap-2"
                  >
                    {submittingFeedback && <span className="material-symbols-outlined animate-spin text-[14px]">sync</span>}
                    Submit Feedback
                  </button>
                </form>
              ) : (
                <p className="text-xs text-slate-450 italic">No feedback submitted for this resolution yet.</p>
              )}
            </div>
          )}

          {/* Department Tracking Timeline */}
          <div className="border-t border-slate-100 pt-5 space-y-4">
            <h4 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Tracking Timeline</h4>

            <div className="space-y-4 text-xs">

              {/* Step 1: Filed */}
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className="material-symbols-outlined p-1 rounded-full text-xs shrink-0 bg-blue-50 text-blue-600 border border-blue-100 font-bold">
                    done
                  </span>
                  <div className="w-[1px] bg-slate-200 flex-grow my-1"></div>
                </div>
                <div className="pt-0.5">
                  <p className="font-extrabold text-slate-800">Issue Reported</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Filed successfully by citizen on {new Date(complaint.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Step 2: Assigned */}
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className={`material-symbols-outlined p-1 rounded-full text-xs shrink-0 font-bold ${complaint.assigned_worker_id
                    ? 'bg-blue-50 text-blue-600 border border-blue-100'
                    : 'bg-slate-50 text-slate-400 border border-slate-200'
                    }`}>
                    {complaint.assigned_worker_id ? 'done' : 'person'}
                  </span>
                  <div className="w-[1px] bg-slate-200 flex-grow my-1"></div>
                </div>
                <div className="pt-0.5">
                  <p className="font-extrabold text-slate-800">Worker Assignment</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {complaint.assigned_worker_id
                      ? `Assigned to worker ID #${complaint.assigned_worker_id} ${workerName ? `(${workerName})` : ''}`
                      : 'Awaiting review and worker allocation from department admin'}
                  </p>
                </div>
              </div>

              {/* Step 3: Resolved */}
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className={`material-symbols-outlined p-1 rounded-full text-xs shrink-0 font-bold ${isResolved
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                    : 'bg-slate-50 text-slate-400 border border-slate-200'
                    }`}>
                    {isResolved ? 'check' : 'task_alt'}
                  </span>
                </div>
                <div className="pt-0.5">
                  <p className="font-extrabold text-slate-800">Resolution Status</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {isResolved
                      ? `Resolved successfully ${complaint.resolved_at ? `on ${new Date(complaint.resolved_at).toLocaleString()}` : ''}`
                      : 'Pending final review and field verification'}
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Modal Footer Section */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center sticky bottom-0 z-10 backdrop-blur-md">
          {isResolved ? (
            <button
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="px-4 py-2.5 text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-250 rounded-xl transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              {downloadingPdf ? (
                <span className="material-symbols-outlined animate-spin text-sm text-blue-600">sync</span>
              ) : (
                <span className="material-symbols-outlined text-sm text-rose-600">picture_as_pdf</span>
              )}
              Download PDF Report
            </button>
          ) : <div />}

          <button
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-black text-white bg-slate-900 hover:bg-slate-850 rounded-xl transition-colors shadow-md"
          >
            Close Window
          </button>
        </div>

      </div>

      {/* Lightbox Media Player Overlay */}
      {lightboxMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-955/90 backdrop-blur-md" onClick={() => setLightboxMedia(null)}>
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl bg-black p-2 border border-slate-800 shadow-2xl" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setLightboxMedia(null)}
              className="absolute top-4 right-4 bg-slate-900/80 hover:bg-slate-850 text-white p-2 rounded-full z-20 flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-lg font-bold">close</span>
            </button>
            {lightboxMedia.isVideo ? (
              <video src={lightboxMedia.url} controls autoPlay className="max-w-full max-h-[85vh] object-contain rounded-2xl" />
            ) : (
              <img src={lightboxMedia.url} alt="Enlarged visual" className="max-w-full max-h-[85vh] object-contain rounded-2xl" />
            )}
          </div>
        </div>
      )}

    </div>
  );
}

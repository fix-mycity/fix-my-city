import React, { useState } from 'react';
import ComplaintLocation from './ComplaintLocation';
import { downloadTaskPdfReport } from '../../services/workerService';
import { toast } from 'react-hot-toast';

export default function ComplaintDetailsModal({ complaint, onClose, workerName = null, showImages = true }) {
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

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

  const safeFormatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'N/A';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/80 flex justify-between items-start sticky top-0 bg-white z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
                {complaint.category || complaint.department || 'Field Incident'}
              </span>
              <span className="text-xs font-mono text-slate-400">#FMC-COMP-{complaint.id}</span>
              <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                complaint.status === 'RESOLVED' ? 'bg-purple-100 text-purple-800' :
                complaint.status === 'CLOSED' ? 'bg-emerald-100 text-emerald-800' :
                'bg-amber-100 text-amber-800'
              }`}>
                {complaint.status}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">{complaint.title}</h2>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 flex-grow">
          
          {/* Incident Description */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Description</span>
            <p className="text-sm text-slate-800 leading-relaxed">{complaint.description}</p>
          </div>

          {/* Location & Map Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block flex items-center gap-1">
                <span className="material-symbols-outlined text-rose-500 text-base">location_on</span>
                Location & Address
              </span>
              <div className="text-sm text-slate-800 font-medium">
                <ComplaintLocation lat={lat} lng={lng} />
              </div>
              <p className="text-xs text-slate-400">GPS: {lat.toFixed(4)}, {lng.toFixed(4)}</p>
              {lat !== 0 && (
                <a 
                  href={`https://maps.google.com/?q=${lat},${lng}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline mt-1"
                >
                  <span className="material-symbols-outlined text-sm">open_in_new</span>
                  Open in Google Maps
                </a>
              )}
            </div>

            {/* Officer & Dates */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div>
                <span className="text-slate-400 font-medium block">Reported On:</span>
                <span className="font-semibold text-slate-800">{safeFormatDate(complaint.created_at)}</span>
              </div>
              {complaint.resolved_at && (
                <div>
                  <span className="text-slate-400 font-medium block">Resolved On:</span>
                  <span className="font-semibold text-slate-800">{safeFormatDate(complaint.resolved_at)}</span>
                </div>
              )}
              {workerName && (
                <div>
                  <span className="text-slate-400 font-medium block">Assigned Officer:</span>
                  <span className="font-bold text-blue-700">{workerName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Before & After Visual Evidence Section */}
          {showImages && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-blue-600 text-base">photo_library</span>
                Complaint Visual Evidence
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Before Fix */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-amber-700 block">Before Fix (Citizen Photo)</span>
                  {beforeImg ? (
                    <div 
                      onClick={() => setLightboxImage(beforeImg)}
                      className="w-full h-44 rounded-lg overflow-hidden border border-slate-200 cursor-pointer relative group bg-slate-900/10"
                    >
                      <img src={beforeImg} alt="Before Fix" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                        <span className="material-symbols-outlined text-base">zoom_in</span>
                        Enlarge
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-44 rounded-lg border border-dashed border-slate-300 bg-white flex flex-col items-center justify-center text-slate-400 text-xs">
                      <span className="material-symbols-outlined text-3xl mb-1">image_not_supported</span>
                      No before image uploaded
                    </div>
                  )}
                </div>

                {/* After Fix */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-emerald-700 block">After Fix (Officer Proof)</span>
                  {afterImg ? (
                    <div 
                      onClick={() => setLightboxImage(afterImg)}
                      className="w-full h-44 rounded-lg overflow-hidden border border-slate-200 cursor-pointer relative group bg-slate-900/10"
                    >
                      <img src={afterImg} alt="After Fix" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                        <span className="material-symbols-outlined text-base">zoom_in</span>
                        Enlarge
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-44 rounded-lg border border-dashed border-slate-300 bg-white flex flex-col items-center justify-center text-slate-400 text-xs">
                      <span className="material-symbols-outlined text-3xl mb-1">add_a_photo</span>
                      {isResolved ? 'No after photo provided' : 'Awaiting completion upload'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Worker Resolution Notes */}
          {complaint.resolution_report && (
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 space-y-1">
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">task_alt</span>
                Worker Resolution Summary Notes
              </span>
              <p className="text-sm text-emerald-950 font-medium">{complaint.resolution_report}</p>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center sticky bottom-0 bg-white z-10">
          {isResolved ? (
            <button
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="px-4 py-2 text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              {downloadingPdf ? (
                <span className="material-symbols-outlined animate-spin text-sm text-blue-600">sync</span>
              ) : (
                <span className="material-symbols-outlined text-sm text-rose-600">picture_as_pdf</span>
              )}
              Download PDF Report
            </button>
          ) : <div></div>}

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors shadow-sm"
          >
            Close Window
          </button>
        </div>

      </div>

      {/* Lightbox Image Preview */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md" onClick={() => setLightboxImage(null)}>
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-black p-2 border border-slate-700 shadow-2xl" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 bg-slate-900/80 hover:bg-slate-800 text-white p-2 rounded-full z-10"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
            <img src={lightboxImage} alt="Enlarged Visual" className="max-w-full max-h-[85vh] object-contain rounded-xl" />
          </div>
        </div>
      )}

    </div>
  );
}

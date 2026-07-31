import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCitizenComplaints, getCitizenNotifications } from "../../services/citizenService";

export default function CitizenHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const [complaintsRes, notificationsRes] = await Promise.all([
          getCitizenComplaints(id),
          getCitizenNotifications(id)
        ]);

        const combined = [
          ...complaintsRes.data.map(c => ({
            type: "COMPLAINT",
            date: new Date(c.created_at),
            title: `Complaint Filed: ${c.title}`,
            detail: `Ref: ${c.complaint_number} | Priority: ${c.priority} | Status: ${c.status}`,
            icon: "assignment",
            color: "text-blue-400 bg-blue-500/10 border-blue-500/20"
          })),
          ...notificationsRes.data.map(n => ({
            type: "NOTIFICATION",
            date: new Date(n.created_at || new Date()),
            title: `Notification Received: ${n.title}`,
            detail: `Channel: ${n.delivery_channel} | Content: ${n.message}`,
            icon: "notifications",
            color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
          }))
        ];

        // Sort by date descending
        combined.sort((a, b) => b.date - a.date);
        setHistory(combined);
      } catch (err) {
        console.error("Failed to fetch citizen history logs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [id]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="bg-slate-900 border border-slate-800 hover:bg-slate-850 p-2 rounded-lg text-slate-400 hover:text-white transition"
        >
          <span className="material-icons block text-sm">arrow_back</span>
        </button>
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide">Citizen Operation History</h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Chronological audit log of citizen activities, complaints, and broadcasts.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="h-[300px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500" />
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
          {history.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">No recorded activity history for this citizen.</p>
          ) : (
            <div className="relative border-l border-slate-800 ml-4 pl-6 space-y-6">
              {history.map((item, idx) => (
                <div key={idx} className="relative">
                  {/* Timeline bullet dot */}
                  <span className={`absolute -left-[37px] top-1 p-1.5 rounded-full border ${item.color}`}>
                    <span className="material-icons text-xs block">{item.icon}</span>
                  </span>
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono block">
                      {item.date.toLocaleString()}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1">{item.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

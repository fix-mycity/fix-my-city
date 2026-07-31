import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCitizenById, getCitizenComplaints, getCitizenNotifications } from "../../services/citizenService";
import CitizenProfileCard from "../../components/waterAuthority/CitizenProfileCard";
import CitizenComplaintHistory from "../../components/waterAuthority/CitizenComplaintHistory";
import CitizenNotificationHistory from "../../components/waterAuthority/CitizenNotificationHistory";

export default function CitizenDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const [detailRes, complaintsRes, notificationsRes] = await Promise.all([
        getCitizenById(id),
        getCitizenComplaints(id),
        getCitizenNotifications(id)
      ]);
      setDetail(detailRes.data);
      setComplaints(complaintsRes.data);
      setNotifications(notificationsRes.data);
    } catch (err) {
      console.error("Failed to fetch citizen detail:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
        <button
          onClick={() => navigate("/water/citizens")}
          className="bg-slate-900 border border-slate-800 hover:bg-slate-850 p-2 rounded-lg text-slate-400 hover:text-white transition"
        >
          <span className="material-icons block text-sm">arrow_back</span>
        </button>
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide">Citizen Profile Dashboard</h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Detailed operations history logs for this specific water user.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="h-[300px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500" />
        </div>
      ) : detail ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <CitizenProfileCard citizen={detail.citizen} />
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Summary Metrics</h3>
              <div className="flex justify-between items-center text-sm py-2 border-b border-slate-800/40">
                <span className="text-slate-400">Resolved Complaints</span>
                <span className="font-semibold text-emerald-450">{detail.resolved_complaints} cases</span>
              </div>
              <div className="flex justify-between items-center text-sm py-2 border-b border-slate-800/40">
                <span className="text-slate-400">Pending Complaints</span>
                <span className="font-semibold text-blue-400">{detail.pending_complaints} cases</span>
              </div>
              <div className="flex justify-between items-center text-sm py-2 last:border-b-0">
                <span className="text-slate-400">Total Alerts Pushed</span>
                <span className="font-semibold text-white">{detail.notification_count} messages</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <CitizenComplaintHistory complaints={complaints} />
            <CitizenNotificationHistory notifications={notifications} />
          </div>
        </div>
      ) : (
        <div className="h-[200px] flex items-center justify-center text-slate-500">
          Citizen profile could not be loaded.
        </div>
      )}
    </div>
  );
}

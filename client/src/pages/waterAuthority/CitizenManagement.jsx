import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCitizens, updateCitizenServiceStatus, getCitizenDetails } from "../../services/citizenService";
import CitizenTable from "../../components/waterAuthority/CitizenTable";
import CitizenSearch from "../../components/waterAuthority/CitizenSearch";
import CitizenFilter from "../../components/waterAuthority/CitizenFilter";
import CitizenCard from "../../components/waterAuthority/CitizenCard";
import ExportCitizenButton from "../../components/waterAuthority/ExportCitizenButton";

export default function CitizenManagement() {
  const navigate = useNavigate();
  const [citizens, setCitizens] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    ward: "",
    area: "",
    status: ""
  });

  // Modal detail states
  const [selectedCitizen, setSelectedCitizen] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchCitizens = async () => {
    setLoading(true);
    try {
      const res = await getCitizens({
        page,
        page_size: 10,
        search: search || undefined,
        ward: filters.ward || undefined,
        area: filters.area || undefined,
        status: filters.status || undefined
      });
      setCitizens(res.data.items || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error("Failed to fetch citizens list:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCitizens();
  }, [page, search, filters]);

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({ ward: "", area: "", status: "" });
    setSearch("");
    setPage(1);
  };

  const handleToggleStatus = async (userId, currentStatus, ward, area) => {
    const nextStatus = currentStatus === "ENABLED" ? "DISABLED" : "ENABLED";
    try {
      await updateCitizenServiceStatus(userId, {
        service_status: nextStatus,
        ward,
        area
      });
      fetchCitizens();
    } catch (err) {
      console.error("Failed to toggle citizen service status:", err);
    }
  };

  const handleViewCitizenDetails = async (userId) => {
    try {
      const res = await getCitizenDetails(userId);
      setSelectedCitizen(res.data);
      setShowDetailModal(true);
    } catch (err) {
      console.error("Failed to fetch citizen details:", err);
    }
  };

  const totalDisabled = citizens.filter(c => c.service_status === "DISABLED").length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
            Citizen Management & Service Registry
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
            Monitor registered water consumers, service flags, ward locations, and citizen complaint records.
          </p>
        </div>
        <ExportCitizenButton />
      </div>

      {/* Cards Summary Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem'
      }}>
        <CitizenCard
          title="Total Citizens Loaded"
          value={total}
          icon="group"
          color="blue"
          description="Synced municipal consumer profiles"
        />
        <CitizenCard
          title="Active Service Enabled"
          value={Math.max(total - totalDisabled, 0)}
          icon="check_circle"
          color="emerald"
          description="Authorized for water service requests"
        />
        <CitizenCard
          title="Access Service Suspended"
          value={totalDisabled}
          icon="block"
          color="rose"
          description="Soft-flagged service suspensions"
        />
      </div>

      {/* Search & Filter Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <CitizenSearch value={search} onChange={(val) => { setSearch(val); setPage(1); }} />
        </div>
        <CitizenFilter filters={filters} onChange={handleFilterChange} onClear={handleClearFilters} />
      </div>

      {/* Table Section */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '30vh' }}>
          <span className="material-symbols-outlined" style={{ animation: 'spin 2s linear infinite', fontSize: '2.5rem', color: '#2563eb' }}>
            autorenew
          </span>
        </div>
      ) : (
        <CitizenTable 
          citizens={citizens}
          total={total}
          page={page}
          pageSize={10}
          onPageChange={setPage}
          onView={handleViewCitizenDetails}
          onToggleStatus={handleToggleStatus}
        />
      )}

      {/* Citizen Details Modal */}
      {showDetailModal && selectedCitizen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '550px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '1.5rem',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#2563eb' }}>
                  Citizen ID #{selectedCitizen.profile?.user_id || selectedCitizen.id}
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0f172a', margin: '0.2rem 0 0 0' }}>
                  {selectedCitizen.profile?.full_name || selectedCitizen.full_name || "Anonymous Citizen"}
                </h3>
              </div>
              <button type="button" onClick={() => setShowDetailModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div><strong style={{ color: '#64748b' }}>Email:</strong> {selectedCitizen.profile?.email || selectedCitizen.email || "N/A"}</div>
              <div><strong style={{ color: '#64748b' }}>Phone:</strong> {selectedCitizen.profile?.phone_number || selectedCitizen.phone_number || "N/A"}</div>
              <div><strong style={{ color: '#64748b' }}>Ward:</strong> {selectedCitizen.profile?.ward || selectedCitizen.ward || "Not Configured"}</div>
              <div><strong style={{ color: '#64748b' }}>Area:</strong> {selectedCitizen.profile?.area || selectedCitizen.area || "Not Configured"}</div>
              <div><strong style={{ color: '#64748b' }}>Service Status:</strong> {selectedCitizen.profile?.service_status || selectedCitizen.service_status || "ENABLED"}</div>
              <div><strong style={{ color: '#64748b' }}>Complaints Logged:</strong> {selectedCitizen.complaint_count || selectedCitizen.complaints?.length || 0}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              <button type="button" onClick={() => setShowDetailModal(false)} style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#475569', fontWeight: '600', cursor: 'pointer' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

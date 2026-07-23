import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCitizens, updateCitizenServiceStatus } from "../../services/citizenService";
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

  const fetchCitizens = async () => {
    setLoading(true);
    try {
      const res = await getCitizens({
        page,
        page_size: 10,
        search,
        ...filters
      });
      setCitizens(res.data.items);
      setTotal(res.data.total);
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

  // Compute overall totals for cards
  const totalEnabled = citizens.filter(c => c.service_status === "ENABLED").length;
  const totalDisabled = citizens.filter(c => c.service_status === "DISABLED").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Citizen Management</h1>
          <p className="text-slate-400 text-sm mt-1">
            Monitor registered water users, service flags, and citizen complaint records.
          </p>
        </div>
        <ExportCitizenButton />
      </div>

      {/* Cards Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <CitizenCard
          title="Total Citizens Loaded"
          value={total}
          icon="people"
          color="blue"
          description="Total synced profile records"
        />
        <CitizenCard
          title="Active Access Enabled"
          value={total - totalDisabled}
          icon="check_circle"
          color="emerald"
          description="Authorized for water service requests"
        />
        <CitizenCard
          title="Access Flag Disabled"
          value={totalDisabled}
          icon="block"
          color="rose"
          description="Soft flagged service suspensions"
        />
      </div>

      {/* Search & Filter Row */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <CitizenSearch value={search} onChange={(val) => { setSearch(val); setPage(1); }} />
        <button
          onClick={fetchCitizens}
          className="bg-slate-900 border border-slate-800 text-slate-350 p-2.5 rounded-lg hover:bg-slate-800 transition"
        >
          <span className="material-icons block text-sm">refresh</span>
        </button>
      </div>

      <CitizenFilter
        filters={filters}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
      />

      {loading ? (
        <div className="h-[200px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500" />
        </div>
      ) : (
        <CitizenTable
          citizens={citizens}
          total={total}
          page={page}
          onPageChange={setPage}
          onView={(id) => navigate(`/water/citizens/${id}`)}
          onToggleStatus={handleToggleStatus}
        />
      )}
    </div>
  );
}

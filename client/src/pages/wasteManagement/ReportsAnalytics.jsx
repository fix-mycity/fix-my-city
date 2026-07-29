import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/wasteManagement/PageHeader';
import LoadingSkeleton from '../../components/wasteManagement/LoadingSkeleton';

import {
  getWasteAnalytics,
  exportWasteReport,
  getWasteVehicles,
  getWasteWorkers
} from '../../services/wasteManagementService';
import { toast } from 'react-hot-toast';

export default function ReportsAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dropdown Options
  const [vehicles, setVehicles] = useState([]);
  const [workers, setWorkers] = useState([]);

  // Timeframe & Filters
  const [timeframe, setTimeframe] = useState('Monthly'); // 'Daily', 'Weekly', 'Monthly', 'Yearly'
  const [filters, setFilters] = useState({
    ward: '',
    vehicle_id: '',
    worker_id: '',
    status: ''
  });

  const fetchOptions = async () => {
    try {
      const [vRes, wRes] = await Promise.all([getWasteVehicles(), getWasteWorkers()]);
      setVehicles(vRes.data.items || []);
      setWorkers(wRes.data.items || []);
    } catch (err) {
      console.error('Failed to load filter options:', err);
    }
  };

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const params = {
        timeframe,
        ...filters
      };
      const res = await getWasteAnalytics(params);
      setAnalytics(res.data);
    } catch (err) {
      toast.error('Failed to load waste analytics reports.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeframe, filters]);

  const handleExport = async (format) => {
    try {
      toast.loading(`Preparing ${format.toUpperCase()} report export...`, { id: 'exporting' });
      const res = await exportWasteReport({
        export_format: format,
        timeframe,
        ward: filters.ward
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `waste_management_report_${timeframe.toLowerCase()}.${format === 'excel' ? 'xlsx' : format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`${format.toUpperCase()} report downloaded!`, { id: 'exporting' });
    } catch (err) {
      toast.error(`Failed to export ${format.toUpperCase()} report.`, { id: 'exporting' });
    }
  };

  if (loading || !analytics) {
    return <LoadingSkeleton />;
  }

  const kpis = analytics.summary_kpis || {};

  return (
    <div className="waste-reports-analytics-page">
      {/* Header & Export Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
            Waste Department Reports & Analytics
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
            Comprehensive operational intelligence, route efficiency, fleet utilization, and worker performance
          </p>
        </div>

        {/* Export Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => handleExport('pdf')}
            className="waste-btn"
            style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '0.82rem', padding: '0.45rem 0.75rem' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>picture_as_pdf</span>
            Export PDF
          </button>

          <button
            onClick={() => handleExport('excel')}
            className="waste-btn"
            style={{ backgroundColor: '#f0fdf4', border: '1px solid #d1fae5', color: '#047857', fontSize: '0.82rem', padding: '0.45rem 0.75rem' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>table_view</span>
            Export Excel
          </button>

          <button
            onClick={() => handleExport('csv')}
            className="waste-btn"
            style={{ backgroundColor: '#e0f2fe', border: '1px solid #bae6fd', color: '#0369a1', fontSize: '0.82rem', padding: '0.45rem 0.75rem' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
            Export CSV
          </button>
        </div>
      </div>

      {/* Timeframe Sub-Tab Selector */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
        {['Daily', 'Weekly', 'Monthly', 'Yearly'].map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            style={{
              padding: '0.45rem 0.9rem',
              fontSize: '0.82rem',
              fontWeight: '700',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: timeframe === tf ? '#047857' : '#f1f5f9',
              color: timeframe === tf ? '#ffffff' : '#475569'
            }}
          >
            {tf} Report
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', padding: '0.85rem 1rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>filter_alt</span>
          Analytics Filters:
        </div>

        <select
          className="waste-form-select"
          style={{ width: 'auto', padding: '0.4rem 0.65rem', fontSize: '0.82rem' }}
          value={filters.ward}
          onChange={(e) => setFilters({ ...filters, ward: e.target.value })}
        >
          <option value="">All Wards</option>
          <option value="Ward 1">Ward 1 - Old City</option>
          <option value="Ward 2">Ward 2 - Civil Lines</option>
          <option value="Ward 4">Ward 4 - Connaught Circus</option>
          <option value="Ward 7">Ward 7 - Vasant Kunj</option>
          <option value="Ward 9">Ward 9 - Green Park</option>
          <option value="Ward 12">Ward 12 - Okhla Phase 3</option>
        </select>

        <select
          className="waste-form-select"
          style={{ width: 'auto', padding: '0.4rem 0.65rem', fontSize: '0.82rem' }}
          value={filters.vehicle_id}
          onChange={(e) => setFilters({ ...filters, vehicle_id: e.target.value })}
        >
          <option value="">All Vehicles</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>{v.vehicle_number} ({v.vehicle_type})</option>
          ))}
        </select>

        <select
          className="waste-form-select"
          style={{ width: 'auto', padding: '0.4rem 0.65rem', fontSize: '0.82rem' }}
          value={filters.worker_id}
          onChange={(e) => setFilters({ ...filters, worker_id: e.target.value })}
        >
          <option value="">All Workers</option>
          {workers.map((w) => (
            <option key={w.id} value={w.id}>{w.name} ({w.role})</option>
          ))}
        </select>

        <select
          className="waste-form-select"
          style={{ width: 'auto', padding: '0.4rem 0.65rem', fontSize: '0.82rem' }}
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Statuses</option>
          <option value="COMPLETED">Completed / Resolved</option>
          <option value="PENDING">Pending / New</option>
          <option value="IN_PROGRESS">In Progress</option>
        </select>

        <button
          onClick={() => setFilters({ ward: '', vehicle_id: '', worker_id: '', status: '' })}
          className="waste-btn waste-btn-secondary"
          style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
        >
          Reset Filters
        </button>
      </div>

      {/* KPI Cards Banner */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: '800', textTransform: 'uppercase' }}>TOTAL WASTE CLEARED</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginTop: '0.25rem' }}>
            {kpis.total_waste_cleared_tons || 150.5} Tons
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: '800', textTransform: 'uppercase' }}>COMPLAINT RESOLUTION</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginTop: '0.25rem' }}>
            {kpis.complaint_resolution_rate || '91.2%'}
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: '800', textTransform: 'uppercase' }}>FLEET UPTIME RATE</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginTop: '0.25rem' }}>
            {kpis.fleet_uptime_rate || '88.0%'}
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '0.75rem', color: '#6d28d9', fontWeight: '800', textTransform: 'uppercase' }}>AVG RESOLUTION TIME</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginTop: '0.25rem' }}>
            {kpis.avg_response_time || '3.5 Hours'}
          </div>
        </div>
      </div>

      {/* 6 Visual Analytics Chart Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* 1. Complaint Analytics Chart */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span className="material-symbols-outlined" style={{ color: '#0284c7', fontSize: '20px' }}>pie_chart</span>
            1. Complaint Category Analytics
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {(analytics.complaint_analytics || []).map((item, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                  <span style={{ color: '#334155' }}>{item.category}</span>
                  <span style={{ color: '#0284c7' }}>{item.count} complaints ({item.percentage}%)</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${item.percentage}%`, height: '100%', backgroundColor: '#0284c7', borderRadius: '4px' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Collection Tonnage Analytics Chart */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span className="material-symbols-outlined" style={{ color: '#047857', fontSize: '20px' }}>bar_chart</span>
            2. Waste Collection Tonnage Trend
          </h3>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '140px', paddingTop: '1rem', borderBottom: '1px solid #e2e8f0' }}>
            {(analytics.collection_analytics || []).map((bar, idx) => {
              const heightPercent = Math.min(100, Math.round((bar.weight_tons / 30) * 100));
              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#047857', marginBottom: '0.2rem' }}>{bar.weight_tons}t</span>
                  <div style={{ width: '18px', height: `${heightPercent}px`, backgroundColor: '#10b981', borderRadius: '4px 4px 0 0' }}></div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.3rem' }}>{bar.period}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Sanitation Worker Performance */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span className="material-symbols-outlined" style={{ color: '#6d28d9', fontSize: '20px' }}>badge</span>
            3. Sanitation Worker Performance
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(analytics.worker_performance || []).map((w, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', backgroundColor: '#f8fafc', borderRadius: '6px', fontSize: '0.85rem' }}>
                <div>
                  <div style={{ fontWeight: '700', color: '#0f172a' }}>{w.worker_name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{w.role} • {w.completed_tasks} tasks</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '800', color: '#6d28d9' }}>⭐ {w.rating} / 5.0</div>
                  <div style={{ fontSize: '0.72rem', color: '#047857' }}>{w.attendance_percent}% Att.</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Fleet Vehicle Usage & Efficiency */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span className="material-symbols-outlined" style={{ color: '#d97706', fontSize: '20px' }}>local_shipping</span>
            4. Fleet Vehicle Usage & Efficiency
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(analytics.vehicle_usage || []).map((v, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', backgroundColor: '#f8fafc', borderRadius: '6px', fontSize: '0.85rem' }}>
                <div>
                  <div style={{ fontWeight: '700', color: '#0f172a' }}>{v.vehicle_number}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{v.vehicle_type} ({v.capacity_tons} Tons)</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '800', color: '#047857' }}>{v.efficiency_score}% Score</div>
                  <div style={{ fontSize: '0.72rem', color: '#d97706' }}>{v.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Smart Bin Status Distribution */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span className="material-symbols-outlined" style={{ color: '#0284c7', fontSize: '20px' }}>delete_sweep</span>
            5. Smart Bin Status Distribution
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {(analytics.bin_status || []).map((b, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                  <span style={{ color: '#334155' }}>Status: {b.status}</span>
                  <span style={{ color: '#0284c7' }}>{b.count} Bins ({b.percentage}%)</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${b.percentage}%`, height: '100%', backgroundColor: b.status === 'Overflow' ? '#dc2626' : b.status === 'Full' ? '#d97706' : '#10b981', borderRadius: '4px' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Collection Efficiency Rate */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span className="material-symbols-outlined" style={{ color: '#047857', fontSize: '20px' }}>verified</span>
            6. Overall Collection Efficiency
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: '#f0fdf4', padding: '1.25rem', borderRadius: '10px', border: '1px solid #d1fae5' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a' }}>Route Completion Efficiency Rate:</span>
              <span style={{ fontSize: '1.3rem', fontWeight: '800', color: '#047857' }}>
                {analytics.collection_efficiency?.efficiency_rate || 94.8}%
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a' }}>On-Time Scheduled Routes:</span>
              <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0284c7' }}>
                {analytics.collection_efficiency?.on_time_routes_percent || 92.4}%
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a' }}>Total Monthly Cleared Tonnage:</span>
              <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>
                {analytics.collection_efficiency?.total_cleared_tonnage || 150.5} Tons
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';

function ChartCard({ title, children }) {
  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>{title}</h3>
        <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#94a3b8' }}>insights</span>
      </div>
      <div>
        {children}
      </div>
    </div>
  );
}

export default function DashboardCharts({ complaints = [], workers = [] }) {
  const total = complaints.length;
  
  const resolvedCount = complaints.filter(c => ['COMPLETED', 'VERIFIED', 'CLOSED'].includes(c.status)).length;
  const inProgressCount = complaints.filter(c => ['ACCEPTED', 'WORKER_ASSIGNED', 'IN_PROGRESS'].includes(c.status)).length;
  const pendingCount = complaints.filter(c => ['NEW', 'PENDING'].includes(c.status)).length;

  const resolvedPct = total > 0 ? Math.round((resolvedCount / total) * 100) : 0;
  const inProgressPct = total > 0 ? Math.round((inProgressCount / total) * 100) : 0;
  const pendingPct = total > 0 ? Math.max(0, 100 - resolvedPct - inProgressPct) : 100;

  const statusData = [
    { label: "Resolved Complaints", count: resolvedCount, percent: resolvedPct, color: "#16a34a" },
    { label: "In-Progress Repairs", count: inProgressCount, percent: inProgressPct, color: "#ea580c" },
    { label: "Pending Review", count: pendingCount, percent: pendingPct, color: "#dc2626" }
  ];

  const categoryMap = {};
  complaints.forEach(c => {
    const cat = c.category || 'General Issue';
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  });

  const categoriesData = Object.keys(categoryMap).length > 0 
    ? Object.entries(categoryMap).map(([category, count]) => ({
        category,
        count,
        percent: total > 0 ? Math.round((count / total) * 100) : 0
      }))
    : [
        { category: "Pipe Burst & Leakage", count: 2, percent: 67 },
        { category: "Low Water Pressure", count: 1, percent: 33 }
      ];

  const activeWorkersList = workers.length > 0 
    ? workers.slice(0, 4).map(w => ({
        name: `${w.first_name || ''} ${w.last_name || ''}`.trim() || `Worker #${w.id}`,
        availability: w.availability || 'AVAILABLE',
        designation: w.designation || 'Technician'
      }))
    : [
        { name: "Suresh Kumar", availability: "AVAILABLE", designation: "Pipe Fitter" },
        { name: "Ramesh Sharma", availability: "AVAILABLE", designation: "Valve Operator" },
        { name: "Anil Patel", availability: "AVAILABLE", designation: "Pump Inspector" }
      ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '1.25rem',
      marginBottom: '1.25rem'
    }}>
      {/* 1. Complaint Status Distribution */}
      <ChartCard title="Live Complaint Status Distribution">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <svg width="130" height="130" viewBox="0 0 42 42" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#f1f5f9" strokeWidth="4" />
            <circle 
              cx="21" cy="21" r="15.915" fill="transparent" 
              stroke="#16a34a" strokeWidth="4.5" 
              strokeDasharray={`${resolvedPct} ${100 - resolvedPct}`} 
              strokeDashoffset="0" 
            />
            <circle 
              cx="21" cy="21" r="15.915" fill="transparent" 
              stroke="#ea580c" strokeWidth="4.5" 
              strokeDasharray={`${inProgressPct} ${100 - inProgressPct}`} 
              strokeDashoffset={`-${resolvedPct}`} 
            />
            <circle 
              cx="21" cy="21" r="15.915" fill="transparent" 
              stroke="#dc2626" strokeWidth="4.5" 
              strokeDasharray={`${pendingPct} ${100 - pendingPct}`} 
              strokeDashoffset={`-${resolvedPct + inProgressPct}`} 
            />
          </svg>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: '1 1 140px' }}>
            {statusData.map((item, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: item.color }} />
                  <span style={{ fontWeight: '600', color: '#475569' }}>{item.label}</span>
                </div>
                <span style={{ fontWeight: '700', color: '#0f172a' }}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </ChartCard>

      {/* 2. Complaint Categories Breakdown */}
      <ChartCard title="Water Issues by Category">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {categoriesData.map((item, index) => (
            <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ fontWeight: '600', color: '#334155' }}>{item.category}</span>
                <span style={{ fontWeight: '700', color: '#0f172a' }}>{item.count} reports ({item.percent}%)</span>
              </div>
              <div style={{ height: '8px', width: '100%', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    height: '100%', 
                    width: `${Math.max(item.percent, 8)}%`,
                    backgroundColor: index === 0 ? '#2563eb' : index === 1 ? '#0284c7' : index === 2 ? '#7c3aed' : '#db2777',
                    borderRadius: '4px',
                    transition: 'width 0.5s ease'
                  }} 
                />
              </div>
            </div>
          ))}
        </div>
      </ChartCard>

      {/* 3. Field Workers Roster Status */}
      <ChartCard title="Technicians Roster Overview">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {activeWorkersList.map((worker, index) => (
            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="material-symbols-outlined" style={{ color: '#2563eb', fontSize: '1.2rem' }}>engineering</span>
                <div>
                  <div style={{ fontWeight: '700', color: '#0f172a' }}>{worker.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{worker.designation}</div>
                </div>
              </div>
              <span style={{ 
                fontSize: '0.72rem', 
                fontWeight: '700', 
                padding: '0.2rem 0.5rem', 
                borderRadius: '50px',
                backgroundColor: worker.availability === 'AVAILABLE' ? '#f0fdf4' : '#fef2f2',
                color: worker.availability === 'AVAILABLE' ? '#16a34a' : '#dc2626',
                border: `1px solid ${worker.availability === 'AVAILABLE' ? '#bbf7d0' : '#fecaca'}`
              }}>
                {worker.availability}
              </span>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  );
}

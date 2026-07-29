import React from 'react';

function ChartCard({ title, icon, children }) {
  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#10b981' }}>{icon || 'insights'}</span>
          {title}
        </h3>
        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Live Data</span>
      </div>
      <div>
        {children}
      </div>
    </div>
  );
}

export default function DashboardCharts({ summary }) {
  const complaintStatus = summary?.complaint_status || [
    { name: "Completed", count: 4, percent: 50, color: "#10b981" },
    { name: "In-Progress", count: 2, percent: 25, color: "#f59e0b" },
    { name: "Pending", count: 2, percent: 25, color: "#ef4444" }
  ];

  const dailyCollection = summary?.daily_collection || [
    { date: "Jul 22", count: 4, weight_tons: 8.5 },
    { date: "Jul 23", count: 5, weight_tons: 10.2 },
    { date: "Jul 24", count: 3, weight_tons: 6.8 },
    { date: "Jul 25", count: 6, weight_tons: 12.0 },
    { date: "Jul 26", count: 4, weight_tons: 7.9 },
    { date: "Jul 27", count: 5, weight_tons: 9.4 },
    { date: "Jul 28", count: 7, weight_tons: 14.1 }
  ];

  const vehicleStatus = summary?.vehicle_status || [
    { name: "Active / Ready", count: 3, percent: 60, color: "#10b981" },
    { name: "In Service Route", count: 1, percent: 20, color: "#06b6d4" },
    { name: "Maintenance", count: 1, percent: 20, color: "#f59e0b" }
  ];

  const wasteCategories = summary?.waste_categories || [
    { category: "Organic Waste", count: 4, percent: 40 },
    { category: "Recyclable", count: 3, percent: 30 },
    { category: "General Waste", count: 2, percent: 20 },
    { category: "Hazardous", count: 1, percent: 10 }
  ];

  // SVG calculations for Complaint Status donut
  let cumulativePercent = 0;

  // Max weight for Daily Collection bar chart
  const maxWeight = Math.max(...dailyCollection.map(d => d.weight_tons), 1);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
      gap: '1.25rem',
      marginBottom: '1.75rem'
    }}>
      {/* Chart 1: Complaint Status */}
      <ChartCard title="Complaint Status Distribution" icon="pie_chart">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <svg width="130" height="130" viewBox="0 0 42 42" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#f1f5f9" strokeWidth="4" />
            {complaintStatus.map((st, i) => {
              const strokeDasharray = `${st.percent} ${100 - st.percent}`;
              const strokeDashoffset = `-${cumulativePercent}`;
              cumulativePercent += st.percent;
              return (
                <circle
                  key={i}
                  cx="21" cy="21" r="15.915"
                  fill="transparent"
                  stroke={st.color}
                  strokeWidth="4.5"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                />
              );
            })}
          </svg>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flexGrow: 1 }}>
            {complaintStatus.map((st, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#475569' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: st.color, display: 'inline-block' }}></span>
                  {st.name}
                </span>
                <span style={{ fontWeight: '700', color: '#0f172a' }}>{st.count} ({st.percent}%)</span>
              </div>
            ))}
          </div>
        </div>
      </ChartCard>

      {/* Chart 2: Daily Collection */}
      <ChartCard title="Daily Collection History (Tons & Routes)" icon="bar_chart">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '140px', paddingTop: '1rem' }}>
          {dailyCollection.map((d, i) => {
            const heightPct = Math.round((d.weight_tons / maxWeight) * 100);
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', width: '12%' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: '700', color: '#047857' }}>{d.weight_tons}t</span>
                <div style={{
                  width: '100%',
                  height: `${Math.max(heightPct, 15)}%`,
                  background: 'linear-gradient(180deg, #10b981 0%, #047857 100%)',
                  borderRadius: '6px 6px 0 0',
                  transition: 'height 0.4s ease'
                }} title={`${d.count} routes, ${d.weight_tons} tons`} />
                <span style={{ fontSize: '0.7rem', color: '#64748b', whiteSpace: 'nowrap' }}>{d.date}</span>
              </div>
            );
          })}
        </div>
      </ChartCard>

      {/* Chart 3: Vehicle Operational Status */}
      <ChartCard title="Fleet Vehicle Operational Status" icon="local_shipping">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {vehicleStatus.map((v, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ fontWeight: '600', color: '#334155' }}>{v.name}</span>
                <span style={{ fontWeight: '700', color: '#0f172a' }}>{v.count} Vehicles ({v.percent}%)</span>
              </div>
              <div style={{ height: '8px', width: '100%', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${v.percent}%`, backgroundColor: v.color, borderRadius: '4px' }}></div>
              </div>
            </div>
          ))}
        </div>
      </ChartCard>

      {/* Chart 4: Waste Categories */}
      <ChartCard title="Waste Categories Breakdown" icon="category">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {wasteCategories.map((wc, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#0f172a' }}>{wc.category}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{wc.count} Bins</span>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#047857', backgroundColor: '#d1fae5', padding: '0.15rem 0.5rem', borderRadius: '12px' }}>
                  {wc.percent}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  );
}

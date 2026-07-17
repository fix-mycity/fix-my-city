import React from 'react';
import { chartPlaceholders } from '../../utils/waterMockData';

// Reusable Chart Container Component
function ChartContainer({ title, children }) {
  return (
    <div className="water-chart-container" style={{ gridColumn: 'span 6' }}>
      <div className="water-chart-header">
        <h3 className="water-chart-title">{title}</h3>
        <button className="water-chart-options-btn" title="Chart Options">
          <span className="material-symbols-outlined">more_vert</span>
        </button>
      </div>
      <div className="water-chart-body">
        {children}
      </div>
    </div>
  );
}

export default function DashboardCharts() {
  const { 
    complaintStatus, 
    complaintCategories, 
    monthlyComplaints, 
    workerPerformance, 
    waterSupplyDistribution 
  } = chartPlaceholders;

  return (
    <div className="water-charts-grid">
      
      {/* 1. Complaint Status (Donut Chart) */}
      <ChartContainer title={complaintStatus.title}>
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '2rem' }}>
          <svg width="150" height="150" className="chart-svg-donut" viewBox="0 0 42 42">
            <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#f1f5f9" strokeWidth="4" />
            {/* Resolved segment (65%): start at 0, length 65 */}
            <circle 
              className="donut-segment" 
              cx="21" 
              cy="21" 
              r="15.915" 
              fill="transparent" 
              stroke="#10b981" 
              strokeWidth="4" 
              strokeDasharray="65 35" 
              strokeDashoffset="0" 
            />
            {/* In Progress segment (20%): start at 65, length 20. offset is -65 */}
            <circle 
              className="donut-segment" 
              cx="21" 
              cy="21" 
              r="15.915" 
              fill="transparent" 
              stroke="#f59e0b" 
              strokeWidth="4" 
              strokeDasharray="20 80" 
              strokeDashoffset="-65" 
            />
            {/* Pending segment (15%): start at 85, length 15. offset is -85 */}
            <circle 
              className="donut-segment" 
              cx="21" 
              cy="21" 
              r="15.915" 
              fill="transparent" 
              stroke="#ef4444" 
              strokeWidth="4" 
              strokeDasharray="15 85" 
              strokeDashoffset="-85" 
            />
            <g className="chart-donut-text">
              <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" style={{ fontSize: '0.45rem', fontWeight: '800', fill: '#0f172a', transform: 'rotate(90deg)', transformOrigin: 'center' }}>
                48 Total
              </text>
            </g>
          </svg>

          <div className="chart-donut-details">
            {complaintStatus.data.map((item, index) => (
              <div key={index} className="donut-legend-item">
                <div className="donut-legend-label">
                  <span className="donut-legend-color" style={{ backgroundColor: item.color }} />
                  <span>{item.label}</span>
                </div>
                <span className="donut-legend-val">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </ChartContainer>

      {/* 2. Complaint Categories (Horizontal Bar Chart) */}
      <ChartContainer title={complaintCategories.title}>
        <div className="chart-bar-horizontal-list">
          {complaintCategories.data.map((item, index) => (
            <div key={index} className="horizontal-bar-row">
              <div className="horizontal-bar-labels">
                <span>{item.category}</span>
                <span>{item.count} complaints ({item.percent}%)</span>
              </div>
              <div className="horizontal-bar-track">
                <div 
                  className="horizontal-bar-fill" 
                  style={{ 
                    width: `${item.percent}%`,
                    backgroundColor: index === 0 ? '#3b82f6' : index === 1 ? '#06b6d4' : index === 2 ? '#6366f1' : '#a855f7' 
                  }} 
                />
              </div>
            </div>
          ))}
        </div>
      </ChartContainer>

      {/* 3. Monthly Complaints Trend (Line Chart) */}
      <ChartContainer title={monthlyComplaints.title}>
        <div style={{ width: '100%', height: '220px' }}>
          <svg className="chart-svg-line" viewBox="0 0 500 200">
            <defs>
              <linearGradient id="line-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Gridlines */}
            <line x1="50" y1="30" x2="480" y2="30" className="line-chart-gridline" />
            <line x1="50" y1="80" x2="480" y2="80" className="line-chart-gridline" />
            <line x1="50" y1="130" x2="480" y2="130" className="line-chart-gridline" />
            <line x1="50" y1="170" x2="480" y2="170" className="line-chart-gridline" />

            {/* Area Path */}
            <path 
              d="M 50 170 L 50 135 L 130 142 L 210 110 L 290 108 L 370 145 L 450 155 L 450 170 Z" 
              className="line-chart-area" 
            />

            {/* Line Path */}
            <path 
              d="M 50 135 L 130 142 L 210 110 L 290 108 L 370 145 L 450 155" 
              className="line-chart-path" 
            />

            {/* Points & Labels */}
            {[[50, 135, 65], [130, 142, 59], [210, 110, 80], [290, 108, 81], [370, 145, 56], [450, 155, 48]].map((pt, i) => (
              <g key={i}>
                <circle cx={pt[0]} cy={pt[1]} r="4" className="line-chart-point" />
                <text x={pt[0]} y={pt[1] - 10} textAnchor="middle" style={{ fontSize: '10px', fontWeight: 'bold', fill: '#1e293b' }}>
                  {pt[2]}
                </text>
                <text x={pt[0]} y="190" textAnchor="middle" style={{ fontSize: '10px', fill: '#64748b' }}>
                  {monthlyComplaints.labels[i]}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </ChartContainer>

      {/* 4. Worker Performance (Vertical Bar Chart) */}
      <ChartContainer title={workerPerformance.title}>
        <div style={{ width: '100%', height: '220px' }}>
          <svg className="chart-svg-bar-vertical" viewBox="0 0 500 200">
            {/* Gridlines */}
            <line x1="40" y1="30" x2="480" y2="30" className="line-chart-gridline" />
            <line x1="40" y1="100" x2="480" y2="100" className="line-chart-gridline" />
            <line x1="40" y1="170" x2="480" y2="170" className="line-chart-gridline" />

            {/* Bars */}
            {workerPerformance.data.map((item, i) => {
              const barHeight = item.completed * 8; // scale factor
              const x = 70 + i * 85;
              const y = 170 - barHeight;
              return (
                <g key={i}>
                  <rect 
                    x={x} 
                    y={y} 
                    width="40" 
                    height={barHeight} 
                    rx="4" 
                    className="vertical-bar-rect" 
                  />
                  <text x={x + 20} y={y - 8} textAnchor="middle" style={{ fontSize: '10px', fontWeight: 'bold', fill: '#0f172a' }}>
                    {item.completed}
                  </text>
                  <text x={x + 20} y="185" textAnchor="middle" style={{ fontSize: '10px', fontWeight: '500', fill: '#64748b' }}>
                    {item.name}
                  </text>
                  <text x={x + 20} y="198" textAnchor="middle" style={{ fontSize: '9px', fontWeight: '600', fill: '#10b981' }}>
                    ★ {item.rating}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </ChartContainer>

      {/* 5. Water Supply Distribution by Zone */}
      <ChartContainer title={waterSupplyDistribution.title}>
        <div className="chart-pie-layout">
          <svg width="150" height="150" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
            {/* Circle segments */}
            {/* North (31%): length 31, offset 0 */}
            <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#3b82f6" strokeWidth="4" strokeDasharray="31 69" strokeDashoffset="0" />
            {/* South (29%): length 29, offset -31 */}
            <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#60a5fa" strokeWidth="4" strokeDasharray="29 71" strokeDashoffset="-31" />
            {/* East (21%): length 21, offset -60 */}
            <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#93c5fd" strokeWidth="4" strokeDasharray="21 79" strokeDashoffset="-60" />
            {/* West (19%): length 19, offset -81 */}
            <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#bfdbfe" strokeWidth="4" strokeDasharray="19 81" strokeDashoffset="-81" />
          </svg>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', flexGrow: '1' }}>
            {waterSupplyDistribution.data.map((item, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: item.color }} />
                  <span style={{ fontWeight: '500' }}>{item.zone}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontWeight: '700', color: '#1e293b' }}>{item.volume}</span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '0.5rem' }}>({item.share}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ChartContainer>

    </div>
  );
}

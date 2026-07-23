import React from "react";

export default function AreaChartCard({ title, data = {} }) {
  const keys = Object.keys(data);
  const values = Object.values(data);

  const width = 500;
  const height = 240;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 35;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxVal = Math.max(...values, 10);
  const minVal = 0;
  const range = maxVal - minVal;

  const points = keys.map((key, idx) => {
    const x = paddingLeft + (idx / (keys.length - 1 || 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((data[key] - minVal) / range) * chartHeight;
    return { x, y, value: data[key], label: key };
  });

  const pathD = points.reduce((acc, p, idx) => {
    return acc + `${idx === 0 ? "M" : "L"} ${p.x} ${p.y} `;
  }, "");

  // Area path closes at bottom corners
  const areaD = points.length > 0 
    ? `${pathD} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`
    : "";

  const yTicks = 4;
  const gridlines = Array.from({ length: yTicks + 1 }).map((_, idx) => {
    const ratio = idx / yTicks;
    const y = paddingTop + chartHeight * ratio;
    const value = Math.round(maxVal - ratio * range);
    return { y, value };
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">{title}</h3>
      {keys.length === 0 ? (
        <div className="h-[200px] flex items-center justify-center text-slate-500 text-sm">
          No Trend Data Available
        </div>
      ) : (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Gridlines */}
          {gridlines.map((line, idx) => (
            <g key={idx}>
              <line
                x1={paddingLeft}
                y1={line.y}
                x2={width - paddingRight}
                y2={line.y}
                stroke="#334155"
                strokeWidth="0.5"
                strokeDasharray="4 4"
              />
              <text
                x={paddingLeft - 8}
                y={line.y + 3}
                fill="#94a3b8"
                fontSize="9"
                textAnchor="end"
                fontFamily="sans-serif"
              >
                {line.value}
              </text>
            </g>
          ))}

          {/* Area Fill */}
          <path d={areaD} fill="url(#areaGrad)" />

          {/* Curve Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* X axis labels */}
          {points.map((p, idx) => (
            <text
              key={idx}
              x={p.x}
              y={height - paddingBottom + 16}
              fill="#94a3b8"
              fontSize="9"
              textAnchor="middle"
              fontFamily="sans-serif"
            >
              {p.label}
            </text>
          ))}

          {/* Markers */}
          {points.map((p, idx) => (
            <g key={idx} className="group cursor-pointer">
              <circle
                cx={p.x}
                cy={p.y}
                r="4"
                fill="#1e293b"
                stroke="#10b981"
                strokeWidth="2"
              />
              <text
                x={p.x}
                y={p.y - 10}
                fill="#ffffff"
                fontSize="9"
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="sans-serif"
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                {p.value}
              </text>
            </g>
          ))}
        </svg>
      )}
    </div>
  );
}

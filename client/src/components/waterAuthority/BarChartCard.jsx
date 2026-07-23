import React from "react";

export default function BarChartCard({ title, data = {} }) {
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

  const barCount = keys.length;
  const barGap = 16;
  const totalGaps = barGap * (barCount - 1 || 1);
  const barWidth = Math.max((chartWidth - totalGaps) / (barCount || 1), 10);

  const items = keys.map((key, idx) => {
    const x = paddingLeft + idx * (barWidth + barGap);
    const val = data[key];
    const barHeight = (val / range) * chartHeight;
    const y = paddingTop + chartHeight - barHeight;
    return { x, y, barHeight, value: val, label: key };
  });

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
          No Distribution Data Available
        </div>
      ) : (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id="barGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.4" />
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

          {/* Bars */}
          {items.map((item, idx) => (
            <g key={idx} className="group cursor-pointer">
              <rect
                x={item.x}
                y={item.y}
                width={barWidth}
                height={Math.max(item.barHeight, 2)}
                rx="4"
                fill="url(#barGrad)"
                className="transition-all duration-300 hover:fill-violet-400"
              />
              {/* Value Label above Bar */}
              <text
                x={item.x + barWidth / 2}
                y={item.y - 6}
                fill="#cbd5e1"
                fontSize="9"
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="sans-serif"
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                {item.value}
              </text>
              {/* Category labels */}
              <text
                x={item.x + barWidth / 2}
                y={height - paddingBottom + 16}
                fill="#94a3b8"
                fontSize="8.5"
                textAnchor="middle"
                fontFamily="sans-serif"
              >
                {item.label.length > 9 ? `${item.label.slice(0, 7)}..` : item.label}
              </text>
            </g>
          ))}
        </svg>
      )}
    </div>
  );
}

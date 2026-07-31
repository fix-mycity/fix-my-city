import React from "react";

export default function ChartContainer({ children }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      {children}
    </div>
  );
}

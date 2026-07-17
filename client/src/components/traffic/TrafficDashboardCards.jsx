import React from 'react';
import { AlertCircle, Clock, CheckCircle, Activity } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, colorClass, bgClass }) => (
  <div className={`p-6 rounded-2xl border bg-white shadow-sm flex items-center justify-between`}>
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
    </div>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bgClass} ${colorClass}`}>
      <Icon className="w-6 h-6" />
    </div>
  </div>
);

const TrafficDashboardCards = ({ summary }) => {
  const { statuses = {}, total_complaints = 0 } = summary || {};
  
  const active = (statuses.ASSIGNED || 0) + (statuses.IN_PROGRESS || 0);
  const resolved = (statuses.RESOLVED || 0) + (statuses.CLOSED || 0);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard 
        title="Total Incidents" 
        value={total_complaints} 
        icon={Activity}
        colorClass="text-slate-600"
        bgClass="bg-slate-100"
      />
      <StatCard 
        title="Active Incidents" 
        value={active} 
        icon={AlertCircle}
        colorClass="text-amber-600"
        bgClass="bg-amber-100"
      />
      <StatCard 
        title="Resolved" 
        value={resolved} 
        icon={CheckCircle}
        colorClass="text-emerald-600"
        bgClass="bg-emerald-100"
      />
      <StatCard 
        title="Pending Assignment" 
        value={statuses.PENDING || 0} 
        icon={Clock}
        colorClass="text-blue-600"
        bgClass="bg-blue-100"
      />
    </div>
  );
};

export default TrafficDashboardCards;

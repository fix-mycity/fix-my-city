import React from 'react';
import DashboardCard from './DashboardCard';

export default function DashboardCards({ summary, complaints = [], workers = [] }) {
  const totalCount = summary?.total_complaints ?? complaints.length;
  const newCount = (summary?.statuses?.NEW || 0) + (summary?.statuses?.PENDING || 0);
  const activeCount = (summary?.statuses?.ACCEPTED || 0) + (summary?.statuses?.WORKER_ASSIGNED || 0) + (summary?.statuses?.IN_PROGRESS || 0);
  const resolvedCount = (summary?.statuses?.COMPLETED || 0) + (summary?.statuses?.VERIFIED || 0) + (summary?.statuses?.CLOSED || 0);
  const highPriorityCount = summary?.priorities?.HIGH || 0;
  const availableWorkersCount = workers.filter(w => w.availability === 'AVAILABLE' || w.employment_status === 'ACTIVE').length;

  const realCards = [
    {
      id: 'total_complaints',
      title: "Total Water Complaints",
      count: totalCount.toString(),
      description: "All citizen issue reports logged",
      icon: "report_problem",
      trend: `${newCount} pending review`,
      trendType: newCount > 0 ? "warning" : "up",
      color: "blue"
    },
    {
      id: 'pending_complaints',
      title: "Pending / New Reports",
      count: newCount.toString(),
      description: "Awaiting worker assignment",
      icon: "pending_actions",
      trend: `${highPriorityCount} urgent cases`,
      trendType: highPriorityCount > 0 ? "danger" : "neutral",
      color: "orange"
    },
    {
      id: 'active_complaints',
      title: "In-Progress Repairs",
      count: activeCount.toString(),
      description: "Active field worker assignments",
      icon: "construction",
      trend: `${activeCount} work orders active`,
      trendType: "neutral",
      color: "amber"
    },
    {
      id: 'resolved_complaints',
      title: "Resolved Complaints",
      count: resolvedCount.toString(),
      description: "Successfully fixed & verified",
      icon: "check_circle",
      trend: totalCount > 0 ? `${Math.round((resolvedCount / totalCount) * 100)}% resolution rate` : "100% compliance",
      trendType: "up",
      color: "green"
    },
    {
      id: 'high_priority',
      title: "High Priority Cases",
      count: highPriorityCount.toString(),
      description: "Emergency & major leakages",
      icon: "error_outline",
      trend: "Immediate action required",
      trendType: highPriorityCount > 0 ? "danger" : "up",
      color: "red"
    },
    {
      id: 'field_workers',
      title: "Available Field Workers",
      count: `${availableWorkersCount} / ${workers.length || 1}`,
      description: "Technicians ready on standby",
      icon: "engineering",
      trend: `${availableWorkersCount} available`,
      trendType: "up",
      color: "green"
    }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '1rem',
      marginBottom: '1.25rem'
    }}>
      {realCards.map((stat) => (
        <DashboardCard
          key={stat.id}
          title={stat.title}
          count={stat.count}
          description={stat.description}
          icon={stat.icon}
          trend={stat.trend}
          trendType={stat.trendType}
          color={stat.color}
        />
      ))}
    </div>
  );
}

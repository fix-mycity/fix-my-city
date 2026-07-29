import React from 'react';
import DashboardCard from './DashboardCard';

export default function DashboardCards({ summary }) {
  const cards = summary?.cards || summary || {};

  const cardList = [
    {
      id: 'total_complaints',
      title: "Total Complaints",
      count: (cards.total_complaints ?? 0).toString(),
      description: "All citizen waste reports logged",
      icon: "report_problem",
      trend: `${cards.pending_complaints ?? 0} pending`,
      trendType: (cards.pending_complaints ?? 0) > 0 ? "warning" : "up",
      color: "red"
    },
    {
      id: 'pending_complaints',
      title: "Pending Complaints",
      count: (cards.pending_complaints ?? 0).toString(),
      description: "Awaiting sanitation dispatch",
      icon: "pending_actions",
      trend: "Action required",
      trendType: (cards.pending_complaints ?? 0) > 0 ? "danger" : "up",
      color: "amber"
    },
    {
      id: 'completed_collections',
      title: "Completed Collections",
      count: (cards.completed_collections ?? 0).toString(),
      description: "Successfully cleared routes",
      icon: "task_alt",
      trend: "Optimal compliance",
      trendType: "up",
      color: "emerald"
    },
    {
      id: 'total_waste_bins',
      title: "Total Waste Bins",
      count: (cards.total_waste_bins ?? 0).toString(),
      description: "Deployed smart bins across city",
      icon: "delete",
      trend: "Monitored",
      trendType: "up",
      color: "teal"
    },
    {
      id: 'total_vehicles',
      title: "Total Vehicles",
      count: (cards.total_vehicles ?? 0).toString(),
      description: "Compactors & Tipper trucks fleet",
      icon: "local_shipping",
      trend: "Fleet ready",
      trendType: "up",
      color: "blue"
    },
    {
      id: 'total_workers',
      title: "Total Workers",
      count: (cards.total_workers ?? 0).toString(),
      description: "Sanitation field staff & drivers",
      icon: "group",
      trend: "Shift active",
      trendType: "up",
      color: "purple"
    },
    {
      id: 'todays_collections',
      title: "Today's Collections",
      count: (cards.todays_collections ?? 0).toString(),
      description: "Routes scheduled for today",
      icon: "event_available",
      trend: "Today's Target",
      trendType: "up",
      color: "cyan"
    }
  ];

  return (
    <div className="waste-cards-grid">
      {cardList.map((c) => (
        <DashboardCard
          key={c.id}
          title={c.title}
          count={c.count}
          description={c.description}
          icon={c.icon}
          trend={c.trend}
          trendType={c.trendType}
          color={c.color}
        />
      ))}
    </div>
  );
}

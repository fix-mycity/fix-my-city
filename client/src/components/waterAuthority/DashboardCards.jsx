import React from 'react';
import DashboardCard from './DashboardCard';
import { statsData } from '../../utils/waterMockData';

export default function DashboardCards() {
  return (
    <div className="water-dashboard-cards">
      {statsData.map((stat) => (
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

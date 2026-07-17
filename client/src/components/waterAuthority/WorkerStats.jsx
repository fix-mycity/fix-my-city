import React from 'react';
import DashboardCard from './DashboardCard';

export default function WorkerStats({ stats }) {
  const { total = 0, available = 0, busy = 0, onLeave = 0, inactive = 0 } = stats || {};

  return (
    <div className="water-dashboard-cards" style={{ marginBottom: '2rem' }}>
      <DashboardCard
        title="Total Workers"
        count={total}
        description="Registered Field Workers"
        icon="engineering"
        trend="Active & Inactive"
        trendType="neutral"
        color="blue"
      />
      <DashboardCard
        title="Available Workers"
        count={available}
        description="On standby/ready"
        icon="person_play"
        trend="Ready to dispatch"
        trendType="up"
        color="green"
      />
      <DashboardCard
        title="Busy Workers"
        count={busy}
        description="On active duty"
        icon="construction"
        trend="Currently resolving tasks"
        trendType="neutral"
        color="indigo"
      />
      <DashboardCard
        title="On Leave"
        count={onLeave}
        description="Resting / Leave approved"
        icon="calendar_today"
        trend="Returning soon"
        trendType="warning"
        color="amber"
      />
      <DashboardCard
        title="Inactive Workers"
        count={inactive}
        description="Deactivated accounts"
        icon="person_off"
        trend="Suspended or retired"
        trendType="danger"
        color="red"
      />
    </div>
  );
}

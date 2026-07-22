import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchTrafficDashboardSummary,
  fetchTrafficIncidents
} from '../../features/traffic/trafficThunks';
import TrafficPageHeader from '../../components/traffic/TrafficPageHeader';
import TrafficDashboardCards from '../../components/traffic/TrafficDashboardCards';
import TrafficIncidentList from '../../components/traffic/TrafficIncidentList';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { dashboardSummary, incidents, summaryStatus, incidentsStatus } = useSelector((state) => state.traffic);

  useEffect(() => {
    dispatch(fetchTrafficDashboardSummary());
    dispatch(fetchTrafficIncidents({ page: 1, page_size: 5 }));
  }, [dispatch]);

  return (
    <div className="p-8 transition-all duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        <TrafficPageHeader 
          title="Traffic Command Center" 
          subtitle="Overview of city traffic incidents and worker deployments."
        />

        {summaryStatus === 'loading' ? (
          <div className="animate-pulse space-y-8">
            <div className="grid grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-slate-200 rounded-2xl"></div>)}
            </div>
          </div>
        ) : (
          <TrafficDashboardCards summary={dashboardSummary} />
        )}

        <TrafficIncidentList incidents={incidents?.items || []} status={incidentsStatus || 'idle'} readOnly={true} />
      </div>
    </div>
  );
};

export default Dashboard;

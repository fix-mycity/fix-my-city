import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTrafficIncidents } from '../../features/traffic/trafficThunks';
import TrafficPageHeader from '../../components/traffic/TrafficPageHeader';
import TrafficIncidentList from '../../components/traffic/TrafficIncidentList';
import { ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react';

const TrafficIncidents = () => {
  const dispatch = useDispatch();
  const { incidents, incidentsStatus } = useSelector((state) => state.traffic);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    dispatch(fetchTrafficIncidents({ 
      page: currentPage, 
      page_size: pageSize, 
      search: searchTerm || undefined,
      status_filter: statusFilter || undefined
    }));
  }, [dispatch, currentPage, searchTerm, statusFilter]);

  // Handlers for search/filter to reset pagination to page 1
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleNextPage = () => {
    if (currentPage < (incidents?.total_pages || 1)) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <div className="p-8 transition-all duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        <TrafficPageHeader 
          title="Traffic Incidents Management" 
          subtitle="View, filter, and manage all city traffic incidents."
        />

        {/* Filters and Search Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input 
              type="text" 
              placeholder="Search incidents by description or location..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 transition-colors"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-slate-400" />
            </div>
            <select
              value={statusFilter}
              onChange={handleStatusChange}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 appearance-none bg-white transition-colors cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>

        {/* Incident List Content */}
        {incidentsStatus === 'loading' && incidents?.items?.length === 0 ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-200 rounded-xl w-full"></div>)}
          </div>
        ) : (
          <>
            <TrafficIncidentList incidents={incidents?.items || []} status={incidentsStatus || 'idle'} />
            
            {/* Pagination Controls */}
            {incidents?.total_pages > 1 && (
              <div className="flex items-center justify-between bg-white px-6 py-4 rounded-xl border border-slate-200 shadow-sm mt-6">
                <div className="text-sm font-medium text-slate-500">
                  Showing page <span className="font-bold text-slate-800">{incidents.page}</span> of <span className="font-bold text-slate-800">{incidents.total_pages}</span> 
                  {' '}({incidents.total_items} total incidents)
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>
                  <button 
                    onClick={handleNextPage}
                    disabled={currentPage >= (incidents?.total_pages || 1)}
                    className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TrafficIncidents;

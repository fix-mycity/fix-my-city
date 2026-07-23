import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import InspectionTable from '../../components/waterAuthority/InspectionTable';
import InspectionForm from '../../components/waterAuthority/InspectionForm';
import { getQualityInspections, createQualityInspection, updateQualityInspection, deleteQualityInspection } from '../../services/qualityInspectionService';

export default function InspectionSchedule() {
  const navigate = useNavigate();

  const [inspections, setInspections] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState(null);

  const fetchInspections = async () => {
    setIsLoading(true);
    try {
      const response = await getQualityInspections({ page, page_size: 10 });
      setInspections(response.data.items);
      setTotalItems(response.data.total_items);
      setTotalPages(response.data.total_pages);
    } catch (err) {
      toast.error("Failed to load inspection schedules.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInspections();
  }, [page]);

  const handleCreateOrUpdate = async (payload) => {
    try {
      if (selectedInspection?.id) {
        await updateQualityInspection(selectedInspection.id, payload);
        toast.success("Inspection schedule updated successfully!");
      } else {
        await createQualityInspection(payload);
        toast.success("Inspection scheduled successfully!");
      }
      fetchInspections();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to save inspection schedule.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this inspection schedule?")) {
      try {
        await deleteQualityInspection(id);
        toast.success("Inspection schedule deleted.");
        fetchInspections();
      } catch (err) {
        toast.error("Failed to delete inspection schedule.");
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button 
            onClick={() => navigate('/water/quality')}
            className="water-btn-icon" 
            title="Back to Dashboard"
            style={{ border: '1px solid var(--water-border)', width: '36px', height: '36px', borderRadius: '8px' }}
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--water-text)', margin: 0 }}>
              Quality Inspection Schedules
            </h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--water-text-muted)' }}>
              Schedule lab technician samples collections and inspect field nodes.
            </span>
          </div>
        </div>

        <button 
          onClick={() => { setSelectedInspection(null); setIsFormOpen(true); }}
          className="water-btn"
          style={{ backgroundColor: 'var(--water-primary)', color: '#ffffff', border: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '700' }}
        >
          <span className="material-symbols-outlined">event_available</span>
          Schedule Quality Test
        </button>
      </div>

      {/* Main Table */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '30vh' }}>
          <span className="material-symbols-outlined" style={{ animation: 'spin 2s linear infinite', fontSize: '2.5rem', color: 'var(--water-primary-light)' }}>
            autorenew
          </span>
        </div>
      ) : (
        <>
          <InspectionTable 
            inspections={inspections}
            onEdit={(insp) => { setSelectedInspection(insp); setIsFormOpen(true); }}
            onDelete={handleDelete}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--water-text-muted)' }}>
                Showing page {page} of {totalPages} ({totalItems} items)
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(p - 1, 1))}
                  className="water-btn"
                  style={{ opacity: page === 1 ? 0.5 : 1, cursor: page === 1 ? 'not-allowed' : 'pointer' }}
                >
                  Previous
                </button>
                <button 
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                  className="water-btn"
                  style={{ opacity: page === totalPages ? 0.5 : 1, cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Booking Form Modal */}
      <InspectionForm 
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setSelectedInspection(null); }}
        onSubmit={handleCreateOrUpdate}
        initialData={selectedInspection || {}}
      />

    </div>
  );
}

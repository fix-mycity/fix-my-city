import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import MaintenanceForm from '../../components/waterAuthority/MaintenanceForm';
import { getMaintenance, updateMaintenance } from '../../services/maintenanceService';

export default function EditMaintenance() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [maint, setMaint] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMaintenance = async () => {
      try {
        const response = await getMaintenance(id);
        setMaint(response.data);
      } catch (err) {
        toast.error("Failed to load maintenance job details.");
        navigate('/water/maintenance');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMaintenance();
  }, [id, navigate]);

  const handleSubmit = async (payload) => {
    try {
      await updateMaintenance(id, payload);
      toast.success("Maintenance details updated successfully!");
      navigate(`/water/maintenance/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to update maintenance details.");
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
        <span className="material-symbols-outlined" style={{ animation: 'spin 2s linear infinite', fontSize: '2.5rem', color: 'var(--water-primary-light)' }}>
          autorenew
        </span>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {maint && (
        <MaintenanceForm 
          initialData={maint}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/water/maintenance/${id}`)}
          isEdit={true}
        />
      )}
    </div>
  );
}

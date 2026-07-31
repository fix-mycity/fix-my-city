import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import MaintenanceForm from '../../components/waterAuthority/MaintenanceForm';
import { createMaintenance } from '../../services/maintenanceService';

export default function AddMaintenance() {
  const navigate = useNavigate();

  const handleSubmit = async (payload) => {
    try {
      const response = await createMaintenance(payload);
      toast.success("Maintenance request created successfully!");
      navigate(`/water/maintenance/${response.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to submit request.");
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <MaintenanceForm 
        onSubmit={handleSubmit}
        onCancel={() => navigate('/water/maintenance')}
      />
    </div>
  );
}

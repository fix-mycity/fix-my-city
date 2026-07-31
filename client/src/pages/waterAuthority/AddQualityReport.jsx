import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import QualityForm from '../../components/waterAuthority/QualityForm';
import { createQualityReport } from '../../services/waterQualityService';

export default function AddQualityReport() {
  const navigate = useNavigate();

  const handleSubmit = async (payload) => {
    try {
      const response = await createQualityReport(payload);
      toast.success("Water quality report saved successfully!");
      navigate(`/water/quality/${response.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to save quality report.");
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <QualityForm 
        onSubmit={handleSubmit}
        onCancel={() => navigate('/water/quality')}
      />
    </div>
  );
}

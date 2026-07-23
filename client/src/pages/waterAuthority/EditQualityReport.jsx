import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import QualityForm from '../../components/waterAuthority/QualityForm';
import { getQualityReportById, updateQualityReport } from '../../services/waterQualityService';

export default function EditQualityReport() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await getQualityReportById(id);
        setReport(response.data);
      } catch (err) {
        toast.error("Failed to load quality report details.");
        navigate('/water/quality');
      } finally {
        setIsLoading(false);
      }
    };
    fetchReport();
  }, [id, navigate]);

  const handleSubmit = async (payload) => {
    try {
      await updateQualityReport(id, payload);
      toast.success("Quality report parameters updated successfully!");
      navigate(`/water/quality/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to save quality changes.");
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
      {report && (
        <QualityForm 
          initialData={report}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/water/quality/${id}`)}
          isEdit={true}
        />
      )}
    </div>
  );
}

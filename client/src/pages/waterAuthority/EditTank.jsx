import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import TankForm from '../../components/waterAuthority/TankForm';
import { getTankById, updateTank } from '../../services/waterTankService';

export default function EditTank() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tank, setTank] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTank = async () => {
      try {
        const response = await getTankById(id);
        setTank(response.data);
      } catch (err) {
        toast.error("Failed to load tank details.");
        navigate('/water/tanks');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTank();
  }, [id, navigate]);

  const handleSubmit = async (payload) => {
    try {
      await updateTank(id, payload);
      toast.success("Water tank updated successfully!");
      navigate(`/water/tanks/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to save tank adjustments.");
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
      {tank && (
        <TankForm 
          initialData={tank}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/water/tanks/${id}`)}
          isEdit={true}
        />
      )}
    </div>
  );
}

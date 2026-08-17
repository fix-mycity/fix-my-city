import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/wasteManagement/PageHeader';
import { BinFillLevelIndicator, BinStatusBadge, BinTypeBadge } from '../../components/wasteManagement/BinFillLevelIndicator';
import { UpdateFillLevelModal } from '../../components/wasteManagement/UpdateFillLevelModal';
import LoadingSkeleton from '../../components/wasteManagement/LoadingSkeleton';

import { getWasteBinById, deleteWasteBin } from '../../services/wasteManagementService';
import { toast } from 'react-hot-toast';

export default function BinDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [bin, setBin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isFillModalOpen, setIsFillModalOpen] = useState(false);

  const fetchBinDetails = async () => {
    setLoading(true);
    try {
      const res = await getWasteBinById(id);
      setBin(res.data);
    } catch (err) {
      toast.error('Failed to load waste bin details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBinDetails();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete Waste Bin #${bin.bin_code}?`)) {
      try {
        await deleteWasteBin(bin.id);
        toast.success('Waste Bin deleted successfully');
        navigate('/waste/bins');
      } catch (err) {
        toast.error('Failed to delete bin.');
      }
    }
  };

  if (loading || !bin) {
    return <LoadingSkeleton />;
  }

  const qrSvgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(bin.qr_code_data || `WASTE_BIN_${bin.bin_code}`)}`;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Code - Bin #${bin.bin_code}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              font-family: system-ui, -apple-system, sans-serif;
            }
            .qr-card {
              text-align: center;
              padding: 20px;
              border: 1px solid #e2e8f0;
              border-radius: 16px;
              box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
            }
            img {
              width: 250px;
              height: 250px;
            }
            h1 {
              font-size: 1.5rem;
              margin: 15px 0 5px 0;
              color: #0f172a;
            }
            p {
              font-size: 0.9rem;
              margin: 0;
              color: #475569;
            }
          </style>
        </head>
        <body>
          <div class="qr-card">
            <img src="${qrSvgUrl}" alt="QR Code" />
            <h1>Bin #${bin.bin_code}</h1>
            <p>${bin.waste_type} Bin - ${bin.capacity_liters}L</p>
            <p>${bin.location} (${bin.ward || 'General'})</p>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="waste-bin-details-page">
      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => navigate('/waste/bins')}
          className="waste-btn waste-btn-secondary"
          style={{ padding: '0.4rem 0.75rem', fontSize: '0.82rem' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
          Back to Waste Bins List
        </button>
      </div>

      <PageHeader
        title={`Waste Bin #${bin.bin_code}`}
        subtitle={`${bin.waste_type} Bin • Installed ${bin.installation_date ? new Date(bin.installation_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}`}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Main Specifications Card */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <BinTypeBadge type={bin.waste_type} />
                <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  {bin.location}
                </h2>
              </div>
              <BinStatusBadge status={bin.status} />
            </div>

            {/* Fill Level Gauge Block */}
            <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span className="material-symbols-outlined" style={{ color: '#10b981', fontSize: '20px' }}>equalizer</span>
                  Current Fill Level
                </span>
                <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#047857' }}>
                  {bin.fill_level_percentage}%
                </span>
              </div>
              <BinFillLevelIndicator level={bin.fill_level_percentage} />
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.65rem' }}>
                Last Emptied Timestamp: {bin.last_emptied_at ? new Date(bin.last_emptied_at).toLocaleString() : 'Not recorded today'}
              </div>
            </div>

            {/* Specification Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>Capacity</div>
                <div style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>{bin.capacity_liters} Liters</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>Category Waste Type</div>
                <div style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>{bin.waste_type}</div>
              </div>
            </div>
          </div>

          {/* Location & Coordinates */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="material-symbols-outlined" style={{ color: '#06b6d4', fontSize: '20px' }}>location_on</span>
              Location & GPS Coordinates
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Ward / Municipal Zone</div>
                <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#0f172a' }}>{bin.ward || 'General'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Neighborhood Area</div>
                <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#0f172a' }}>{bin.area || 'Citywide'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>GPS Coordinates (Lat, Long)</div>
                <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#0f172a' }}>
                  {bin.latitude || 28.6139}, {bin.longitude || 77.2090}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Quick Administrative Actions */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a', margin: '0 0 1rem 0' }}>
              Administrative Actions
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={() => setIsFillModalOpen(true)}
                className="waste-btn waste-btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>equalizer</span>
                Update Fill Level
              </button>

              <button
                onClick={handlePrint}
                className="waste-btn waste-btn-secondary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>print</span>
                Print QR Code Tag
              </button>

              <button
                onClick={handleDelete}
                className="waste-btn"
                style={{ width: '100%', justifyContent: 'center', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                Delete Waste Bin
              </button>
            </div>
          </div>

          {/* QR Code Preview Card */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a', margin: '0 0 0.75rem 0' }}>
              Waste Tag QR Code
            </h3>

            <div style={{
              display: 'inline-block',
              padding: '0.75rem',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              marginBottom: '0.5rem'
            }}>
              <img
                src={qrSvgUrl}
                alt={`QR Tag for ${bin.bin_code}`}
                style={{ width: '140px', height: '140px', display: 'block' }}
              />
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Scan QR to identify this waste bin on route rounds.
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <UpdateFillLevelModal
        isOpen={isFillModalOpen}
        onClose={() => setIsFillModalOpen(false)}
        bin={bin}
        onSuccess={fetchBinDetails}
      />
    </div>
  );
}

import React from 'react';
import WorkerStatusBadge from './WorkerStatusBadge';
import WorkerAvailabilityBadge from './WorkerAvailabilityBadge';

export default function WorkerProfileCard({ worker, onEditClick, onBackClick }) {
  if (!worker) return null;

  const {
    first_name,
    last_name,
    email,
    phone,
    photo,
    gender,
    date_of_birth,
    address,
    place,
    pin_code,
    designation,
    skill,
    experience,
    joining_date,
    availability,
    employment_status,
    emergency_contact_phone
  } = worker;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      maxWidth: '900px',
      margin: '0 auto'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button 
          onClick={onBackClick}
          className="water-btn"
          style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>arrow_back</span>
          Back to List
        </button>
        <button 
          onClick={() => onEditClick(worker.id)}
          className="water-btn water-btn-primary"
          style={{ padding: '0.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '700' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>edit</span>
          Edit Profile
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '300px 1fr',
        gap: '1.5rem',
        alignItems: 'start'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid var(--water-border)',
          borderRadius: 'var(--water-radius)',
          padding: '2rem 1.5rem',
          boxShadow: 'var(--water-shadow)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '1.25rem'
        }}>
          <div style={{
            width: '130px',
            height: '130px',
            borderRadius: '50%',
            backgroundColor: '#f1f5f9',
            overflow: 'hidden',
            border: '3px solid var(--water-primary-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {photo ? (
              <img src={photo} alt={`${first_name} ${last_name}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span className="material-symbols-outlined" style={{ fontSize: '4rem', color: '#94a3b8' }}>person</span>
            )}
          </div>

          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--water-text)', margin: '0 0 0.25rem 0' }}>
              {first_name} {last_name}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--water-text-muted)', fontWeight: '600', textTransform: 'uppercase', margin: 0 }}>
              {designation || 'Field Technician'}
            </p>

          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', borderTop: '1px solid var(--water-border)', paddingTop: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--water-text-muted)', fontWeight: '600' }}>Availability:</span>
              <WorkerAvailabilityBadge availability={availability} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--water-text-muted)', fontWeight: '600' }}>Status:</span>
              <WorkerStatusBadge status={employment_status} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem'
          }}>
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid var(--water-border)',
              borderRadius: 'var(--water-radius)',
              padding: '1rem 1.25rem',
              boxShadow: 'var(--water-shadow-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '2.2rem', color: 'var(--water-primary-light)', padding: '0.5rem', backgroundColor: 'var(--water-primary-subtle)', borderRadius: '8px' }}>
                pending_actions
              </span>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800' }}>0</h4>
                <span style={{ fontSize: '0.8rem', color: 'var(--water-text-muted)', fontWeight: '600' }}>Assigned Tasks</span>
              </div>
            </div>

            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid var(--water-border)',
              borderRadius: 'var(--water-radius)',
              padding: '1rem 1.25rem',
              boxShadow: 'var(--water-shadow-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '2.2rem', color: 'var(--water-success)', padding: '0.5rem', backgroundColor: 'var(--water-success-subtle)', borderRadius: '8px' }}>
                task_alt
              </span>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800' }}>0</h4>
                <span style={{ fontSize: '0.8rem', color: 'var(--water-text-muted)', fontWeight: '600' }}>Completed Tasks</span>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid var(--water-border)',
            borderRadius: 'var(--water-radius)',
            padding: '1.5rem',
            boxShadow: 'var(--water-shadow)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', borderBottom: '1px solid var(--water-border)', paddingBottom: '0.5rem', margin: 0, color: 'var(--water-primary-dark)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>badge</span>
              Professional Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem 2rem', fontSize: '0.88rem' }}>
              <div>
                <span style={{ color: 'var(--water-text-muted)', display: 'block', marginBottom: '0.2rem' }}>Primary Skill</span>
                <strong style={{ color: 'var(--water-text)' }}>{skill || 'General Maintenance'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--water-text-muted)', display: 'block', marginBottom: '0.2rem' }}>Years of Experience</span>
                <strong style={{ color: 'var(--water-text)' }}>{experience} {experience === 1 ? 'Year' : 'Years'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--water-text-muted)', display: 'block', marginBottom: '0.2rem' }}>Place</span>
                <strong style={{ color: 'var(--water-text)' }}>{place || 'Not Assigned'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--water-text-muted)', display: 'block', marginBottom: '0.2rem' }}>Pin Code</span>
                <strong style={{ color: 'var(--water-text)' }}>{pin_code || 'Not Assigned'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--water-text-muted)', display: 'block', marginBottom: '0.2rem' }}>Joining Date</span>
                <strong style={{ color: 'var(--water-text)' }}>{formatDate(joining_date)}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--water-text-muted)', display: 'block', marginBottom: '0.2rem' }}>Gender / Date of Birth</span>
                <strong style={{ color: 'var(--water-text)' }}>{gender || 'N/A'} {date_of_birth ? `(${formatDate(date_of_birth)})` : ''}</strong>
              </div>
            </div>

            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', borderBottom: '1px solid var(--water-border)', paddingBottom: '0.5rem', margin: '0.75rem 0 0 0', color: 'var(--water-primary-dark)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>contact_mail</span>
              Contact Details
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', gap: '2rem' }}>
                <div style={{ flex: 1 }}>
                  <span style={{ color: 'var(--water-text-muted)', display: 'block', marginBottom: '0.2rem' }}>Phone Number</span>
                  <strong style={{ color: 'var(--water-text)' }}>{phone}</strong>
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ color: 'var(--water-text-muted)', display: 'block', marginBottom: '0.2rem' }}>Email Address</span>
                  <strong style={{ color: 'var(--water-text)' }}>{email}</strong>
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--water-text-muted)', display: 'block', marginBottom: '0.2rem' }}>Residential Address</span>
                <strong style={{ color: 'var(--water-text)' }}>{address || 'No address provided'}</strong>
              </div>
            </div>

            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', borderBottom: '1px solid var(--water-border)', paddingBottom: '0.5rem', margin: '0.75rem 0 0 0', color: 'var(--water-primary-dark)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>contact_emergency</span>
              Emergency Contact
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem 2rem', fontSize: '0.88rem' }}>
              <div>
                <span style={{ color: 'var(--water-text-muted)', display: 'block', marginBottom: '0.2rem' }}>Contact Phone</span>
                <strong style={{ color: 'var(--water-text)' }}>{emergency_contact_phone || 'N/A'}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

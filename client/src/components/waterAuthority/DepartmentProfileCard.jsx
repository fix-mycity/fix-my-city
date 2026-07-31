import React from "react";

export default function DepartmentProfileCard({ profile = {} }) {
  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    }}>
      {/* Banner */}
      <div style={{ height: '120px', position: 'relative', backgroundColor: '#f1f5f9' }}>
        <img
          src={profile.department_banner || "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&auto=format&fit=crop"}
          alt="Banner"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {/* Logo */}
        <div style={{
          position: 'absolute',
          left: '1.25rem',
          bottom: '-1.25rem',
          width: '60px',
          height: '60px',
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          overflow: 'hidden',
          border: '3px solid #ffffff',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
        }}>
          <img
            src={profile.department_logo || "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=100&auto=format&fit=crop"}
            alt="Logo"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      </div>

      <div style={{ paddingTop: '2rem', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
            Water Management Authority
          </h3>
          <a
            href={profile.website}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: '600', textDecoration: 'none', display: 'inline-block', marginTop: '0.2rem' }}
          >
            {profile.website || "https://water.municipal.city.gov"}
          </a>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0, lineHeight: '1.5' }}>
          {profile.department_description || "No description provided."}
        </p>
        <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '500', borderTop: '1px solid #f1f5f9', paddingTop: '0.6rem' }}>
          Social Handles: {profile.social_links || "None linked"}
        </div>
      </div>
    </div>
  );
}

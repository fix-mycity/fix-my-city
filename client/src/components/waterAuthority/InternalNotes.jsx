import React, { useState } from 'react';

export default function InternalNotes({ authorityNotes, resolutionNotes, onSaveNotes, isSaving }) {
  const [newNote, setNewNote] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    onSaveNotes(newNote);
    setNewNote('');
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid var(--water-border)',
      borderRadius: 'var(--water-radius)',
      padding: '1.5rem',
      boxShadow: 'var(--water-shadow-sm)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem'
    }}>
      <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--water-text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span className="material-symbols-outlined" style={{ color: 'var(--water-primary-light)' }}>sticky_note_2</span>
        Internal & Operational Notes
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Authority Notes */}
        <div>
          <h4 style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--water-text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
            Authority Office Notes
          </h4>
          <div style={{
            padding: '0.85rem',
            backgroundColor: 'var(--water-bg)',
            border: '1px solid var(--water-border)',
            borderRadius: '8px',
            fontSize: '0.88rem',
            color: authorityNotes ? 'var(--water-text)' : 'var(--water-text-muted)',
            fontStyle: authorityNotes ? 'normal' : 'italic',
            lineHeight: '1.4'
          }}>
            {authorityNotes || "No office notes recorded for this complaint."}
          </div>
        </div>

        {/* Resolution Notes */}
        <div>
          <h4 style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--water-text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
            Field Resolution Notes (Workers)
          </h4>
          <div style={{
            padding: '0.85rem',
            backgroundColor: 'var(--water-success-subtle)',
            border: '1px solid var(--water-success)',
            borderRadius: '8px',
            fontSize: '0.88rem',
            color: resolutionNotes ? 'var(--water-text)' : 'var(--water-text-muted)',
            fontStyle: resolutionNotes ? 'normal' : 'italic',
            lineHeight: '1.4'
          }}>
            {resolutionNotes || "No worker resolution logs uploaded yet."}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{
        borderTop: '1px solid var(--water-border)',
        paddingTop: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}>
        <label style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--water-text)' }}>
          Update/Overwrite Authority Notes
        </label>
        <textarea
          placeholder="Type updated authority details here..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          rows={3}
          style={{
            width: '100%',
            padding: '0.6rem',
            borderRadius: '8px',
            border: '1px solid var(--water-border)',
            fontSize: '0.85rem',
            outline: 'none',
            resize: 'none'
          }}
        />
        <button
          type="submit"
          className="water-btn water-btn-primary"
          style={{ width: 'fit-content', marginLeft: 'auto', padding: '0.5rem 1rem' }}
          disabled={isSaving || !newNote.trim()}
        >
          {isSaving ? 'Saving...' : 'Save Notes'}
        </button>
      </form>
    </div>
  );
}

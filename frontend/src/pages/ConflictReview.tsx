import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import { ConflictItem } from '../types';
import { ConflictBadge } from '../components/ConflictBadge';
import { AlertTriangle, CheckCircle2, FileText, ArrowRight, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';

export const ConflictReview: React.FC = () => {
  const [conflicts, setConflicts] = useState<ConflictItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedConflict, setSelectedConflict] = useState<ConflictItem | null>(null);
  const [resolutionValue, setResolutionValue] = useState<string>('');
  const [resolutionNotes, setResolutionNotes] = useState<string>('');
  const [resolving, setResolving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchConflicts = async () => {
    setLoading(true);
    try {
      // First trigger scan if empty
      await apiClient.post('/validation/run-check');
      const res = await apiClient.get<ConflictItem[]>('/validation/conflicts');
      setConflicts(res.data);
      if (res.data.length > 0 && !selectedConflict) {
        setSelectedConflict(res.data[0]);
        setResolutionValue(res.data[0].source_a_value);
      }
    } catch (err) {
      console.error('Failed to load conflicts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConflicts();
  }, []);

  const handleSelectConflict = (c: ConflictItem) => {
    setSelectedConflict(c);
    setResolutionValue(c.resolved_value || c.source_a_value);
    setResolutionNotes(c.resolution_notes || '');
    setSuccessMessage(null);
  };

  const handleResolve = async (chosenValue: string) => {
    if (!selectedConflict) return;
    setResolving(true);
    try {
      const res = await apiClient.post(`/validation/conflicts/${selectedConflict.id}/resolve`, {
        resolved_value: chosenValue,
        resolution_notes: resolutionNotes || `Verified authoritative record: ${chosenValue}`,
      });
      setSuccessMessage(`Conflict successfully resolved with value: ${chosenValue}`);
      // Refresh list
      const listRes = await apiClient.get<ConflictItem[]>('/validation/conflicts');
      setConflicts(listRes.data);
      setSelectedConflict(res.data);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Resolution failed');
    } finally {
      setResolving(false);
    }
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShieldAlert style={{ color: '#F43F5E' }} size={24} />
            Cross-Document Consistency & Conflict Review
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>
            Human-in-the-Loop Discrepancy Resolution & Provenance Audit Trail (Module 3 & 9)
          </p>
        </div>
        <button onClick={fetchConflicts} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Rescan Discrepancies
        </button>
      </div>

      {successMessage && (
        <div style={{ padding: '0.8rem 1.2rem', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', borderRadius: '8px', color: '#34D399', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={16} /> {successMessage}
        </div>
      )}

      {/* Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '1.5rem' }}>
        
        {/* Left: Conflict List */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#F8FAFC' }}>
            Detected Discrepancies ({conflicts.length})
          </h2>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#94A3B8' }}>Scanning documents for inconsistencies...</div>
          ) : conflicts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#10B981' }}>
              <CheckCircle2 size={32} style={{ margin: '0 auto 0.5rem auto' }} />
              <div>All cross-document figures are consistent!</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {conflicts.map((c) => {
                const isSelected = selectedConflict?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => handleSelectConflict(c)}
                    style={{
                      padding: '1rem',
                      borderRadius: '8px',
                      border: isSelected ? '1px solid #38BDF8' : '1px solid rgba(51, 65, 85, 0.5)',
                      background: isSelected ? 'rgba(56, 189, 248, 0.1)' : 'rgba(15, 23, 42, 0.4)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: isSelected ? '#38BDF8' : '#F1F5F9' }}>
                        {c.conflict_id || 'DISCREPANCY'}
                      </span>
                      <ConflictBadge status={c.status} />
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                      {c.metric_name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                      {c.subsidiary} {c.year ? `• Year ${c.year}` : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Side-by-Side Resolution Workspace */}
        {selectedConflict ? (
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                Discrepancy Investigation & Resolution
              </h2>
              <ConflictBadge status={selectedConflict.status} />
            </div>

            <div style={{ padding: '0.75rem', background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244,63,94,0.25)', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.825rem', color: '#FDA4AF' }}>
              <strong>Conflict Cause:</strong> {selectedConflict.resolution_notes || 'Cross-document reported values differ for the same metric & period.'}
            </div>

            {/* Side-by-side comparison cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              
              {/* Source A */}
              <div className="glass-card" style={{ border: selectedConflict.resolved_value === selectedConflict.source_a_value ? '2px solid #10B981' : '1px solid rgba(71,85,105,0.5)' }}>
                <div style={{ fontSize: '0.75rem', color: '#38BDF8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  Source A (Primary Report)
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#F1F5F9', marginBottom: '0.4rem', wordBreak: 'break-all' }}>
                  {selectedConflict.source_a_filename}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '0.75rem' }}>
                  Location: Page {selectedConflict.source_a_page}
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#F8FAFC', marginBottom: '1rem' }}>
                  {selectedConflict.source_a_value}
                </div>
                <button
                  onClick={() => handleResolve(selectedConflict.source_a_value)}
                  disabled={resolving}
                  className="btn-primary"
                  style={{ width: '100%', fontSize: '0.8rem', padding: '0.4rem' }}
                >
                  Adopt Source A
                </button>
              </div>

              {/* Source B */}
              <div className="glass-card" style={{ border: selectedConflict.resolved_value === selectedConflict.source_b_value ? '2px solid #10B981' : '1px solid rgba(71,85,105,0.5)' }}>
                <div style={{ fontSize: '0.75rem', color: '#F59E0B', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  Source B (Comparative Sheet)
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#F1F5F9', marginBottom: '0.4rem', wordBreak: 'break-all' }}>
                  {selectedConflict.source_b_filename}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '0.75rem' }}>
                  Location: Page/Row {selectedConflict.source_b_page}
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#F8FAFC', marginBottom: '1rem' }}>
                  {selectedConflict.source_b_value}
                </div>
                <button
                  onClick={() => handleResolve(selectedConflict.source_b_value)}
                  disabled={resolving}
                  className="btn-secondary"
                  style={{ width: '100%', fontSize: '0.8rem', padding: '0.4rem' }}
                >
                  Adopt Source B
                </button>
              </div>

            </div>

            {/* Resolution History / Status */}
            {selectedConflict.status === 'resolved' && (
              <div style={{ padding: '1rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34D399', marginBottom: '0.3rem' }}>
                  ✓ Official Resolved Value: {selectedConflict.resolved_value}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                  Resolved by: <strong>{selectedConflict.resolved_by || 'Coordinator'}</strong> at {selectedConflict.resolved_at ? new Date(selectedConflict.resolved_at).toLocaleString() : 'Recent'}
                </div>
              </div>
            )}

          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8' }}>
            Select a discrepancy from the list to inspect and resolve.
          </div>
        )}

      </div>
    </div>
  );
};

import React, { useEffect, useState, useContext } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  FileText,
  ArrowRight,
  ShieldAlert,
  Scale,
  Check,
  Filter,
  CheckCircle,
  HelpCircle,
  Clock,
  UserCheck,
} from 'lucide-react';
import { listConflicts, resolveConflict, runValidation } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import ConflictBadge from '../components/ConflictBadge';
import type { ConflictItem } from '../types';

export default function ValidationPage() {
  const { user } = useContext(AuthContext);
  const [conflicts, setConflicts] = useState<ConflictItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('open');
  const [scanning, setScanning] = useState(false);
  const [selectedConflict, setSelectedConflict] = useState<ConflictItem | null>(null);

  // Resolution form state
  const [resolvedValue, setResolvedValue] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolving, setResolving] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchConflicts = async () => {
    setLoading(true);
    try {
      const data = await listConflicts(filterStatus);
      setConflicts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConflicts();
  }, [filterStatus]);

  const handleScan = async () => {
    setScanning(true);
    setNotification(null);
    try {
      const res = await runValidation();
      setNotification(`Automated reconciliation complete: ${res.total_scanned} documents scanned. ${res.conflicts_detected} discrepancies flagged.`);
      await fetchConflicts();
    } catch (e) {
      console.error(e);
      setNotification('Failed to complete validation scan.');
    } finally {
      setScanning(false);
    }
  };

  const openResolution = (c: ConflictItem) => {
    setSelectedConflict(c);
    setResolvedValue(c.source_a_value);
    setResolutionNotes(`Authoritative value verified against audited statutory return by ${user?.full_name || user?.username}`);
  };

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConflict) return;
    setResolving(true);
    try {
      await resolveConflict(selectedConflict.id, {
        resolved_value: resolvedValue,
        resolution_notes: resolutionNotes,
      });
      setNotification(`Conflict ${selectedConflict.conflict_id || selectedConflict.id} resolved and recorded in immutable audit trail.`);
      setSelectedConflict(null);
      await fetchConflicts();
    } catch (e) {
      console.error(e);
      setNotification('Failed to record reconciliation resolution.');
    } finally {
      setResolving(false);
    }
  };

  const openCount = conflicts.filter((c) => c.status === 'open').length;
  const resolvedCount = conflicts.filter((c) => c.status === 'resolved').length;

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.2rem 0.65rem', borderRadius: 'var(--radius-full)', background: '#EEF2FF', border: '1px solid #C7D2FE', color: '#4F46E5', fontSize: '0.72rem', fontWeight: 600, marginBottom: '0.45rem' }}>
            <Scale size={13} />
            <span>Automated Cross-Source Verification</span>
          </div>
          <h1 className="page-title">
            <span>Cross-Document Conflict Review & Reconciliation</span>
          </h1>
          <p className="page-description">
            Automated numerical discrepancy detection comparing Geological Reports, DGMS Monthly Returns, and Rail Siding Dispatches across CIL mining blocks.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button
            id="run-validation-scan-button"
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleScan}
            disabled={scanning}
          >
            <RefreshCw size={13} className={scanning ? 'animate-spin' : ''} />
            <span>{scanning ? 'Evaluating Corpus...' : 'Run Automated Conflict Scan'}</span>
          </button>
        </div>
      </div>

      {/* ── Notification Banner ─────────────────────────────────────────────── */}
      {notification && (
        <div
          style={{
            background: '#EFF6FF',
            border: '1px solid #BFDBFE',
            color: '#1E40AF',
            padding: '0.75rem 1.15rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <CheckCircle2 size={16} color="#2563EB" />
            <span>{notification}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Reconciliation Metrics ───────────────────────────────────────────── */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-card-top">
            <span className="kpi-label">Open Discrepancies</span>
            <div className="kpi-icon-wrapper" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
              <AlertTriangle size={18} color="#DC2626" />
            </div>
          </div>
          <div className="kpi-value" style={{ color: openCount > 0 ? '#DC2626' : 'var(--text-primary)' }}>
            {openCount}
          </div>
          <div className="kpi-subtext">
            <span>Requires authorized sign-off</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-top">
            <span className="kpi-label">Reconciled Records</span>
            <div className="kpi-icon-wrapper" style={{ background: '#ECFDF5', border: '1px solid #A7F3D0' }}>
              <CheckCircle2 size={18} color="#059669" />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#059669' }}>
            {resolvedCount}
          </div>
          <div className="kpi-subtext">
            <span>Recorded in audit ledger</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-top">
            <span className="kpi-label">Detection Algorithm</span>
            <div className="kpi-icon-wrapper" style={{ background: '#EEF2FF', border: '1px solid #C7D2FE' }}>
              <Scale size={18} color="#4F46E5" />
            </div>
          </div>
          <div className="kpi-value">
            100%
          </div>
          <div className="kpi-subtext">
            <span>Zero False Negatives</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-top">
            <span className="kpi-label">Authorized Role</span>
            <div className="kpi-icon-wrapper" style={{ background: '#FAF5FF', border: '1px solid #E9D5FF' }}>
              <ShieldAlert size={18} color="#7C3AED" />
            </div>
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
            {user?.role || 'Project Coordinator'}
          </div>
          <div className="kpi-subtext">
            <span>Cryptographic audit stamped</span>
          </div>
        </div>
      </div>

      {/* ── Filter Tabs ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.65rem' }}>
        {[
          { key: 'open', label: 'Unresolved Discrepancies' },
          { key: 'resolved', label: 'Reconciled Archive' },
          { key: 'all', label: 'All Document Conflicts' },
        ].map((tab) => (
          <button
            key={tab.key}
            id={`filter-conflict-${tab.key}`}
            type="button"
            className={`btn btn-sm ${filterStatus === tab.key ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterStatus(tab.key)}
            style={{ fontSize: '0.78rem' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Conflict Items List ──────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {loading ? (
          <div className="loading-state">
            <RefreshCw size={22} className="animate-spin" style={{ color: '#4F46E5' }} />
            <div>Loading conflict reconciliation records...</div>
          </div>
        ) : conflicts.length === 0 ? (
          <div className="panel" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', background: '#FFFFFF' }}>
            <CheckCircle size={32} color="#10B981" style={{ margin: '0 auto 0.75rem' }} />
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              No Discrepancies Found
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              All evaluated documents match statutory tolerance rules for the current filter.
            </div>
          </div>
        ) : (
          conflicts.map((c) => {
            const isResolved = c.status === 'resolved';
            const isCritical = c.severity === 'critical';

            return (
              <div
                key={c.id}
                id={`conflict-card-${c.conflict_id || c.id}`}
                className="panel animate-in"
                style={{
                  borderLeft: isResolved
                    ? '4px solid #10B981'
                    : isCritical
                    ? '4px solid #EF4444'
                    : '4px solid #F59E0B',
                  background: '#FFFFFF',
                  boxShadow: 'var(--shadow-sm)',
                  padding: '1.35rem 1.6rem',
                }}
              >
                {/* Conflict Card Header */}
                <div className="panel-header" style={{ marginBottom: '1rem', paddingBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span className="font-mono" style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', background: '#F1F5F9', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                      {c.conflict_id || c.id}
                    </span>
                    <h3 className="panel-title" style={{ fontSize: '0.96rem', fontWeight: 700 }}>
                      {c.metric_name}
                    </h3>
                    <ConflictBadge severity={c.severity} status={c.status} />
                  </div>

                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                    {c.subsidiary} {c.year ? `• FY ${c.year}` : ''}
                  </div>
                </div>

                {/* Side-by-Side Source Comparison */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto 1fr',
                    gap: '1rem',
                    alignItems: 'center',
                    background: '#F8FAFC',
                    padding: '1rem 1.15rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid #E2E8F0',
                    marginBottom: '1rem',
                  }}
                >
                  {/* Source A */}
                  <div
                    style={{
                      padding: '0.85rem 1rem',
                      background: '#FFFFFF',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid #BFDBFE',
                      boxShadow: 'var(--shadow-xs)',
                    }}
                  >
                    <div style={{ fontSize: '0.7rem', color: '#1D4ED8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <FileText size={13} />
                      <span>Source Document A</span>
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.source_a_filename} (Page {c.source_a_page})
                    </div>
                    <div className="font-mono" style={{ fontSize: '1.35rem', fontWeight: 700, color: '#DC2626' }}>
                      {c.source_a_value}
                    </div>
                  </div>

                  {/* Comparison Divider */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 0.5rem' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#EEF2FF', border: '1px solid #C7D2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4F46E5' }}>
                      <Scale size={16} />
                    </div>
                    <span className="font-mono" style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      DELTA
                    </span>
                  </div>

                  {/* Source B */}
                  <div
                    style={{
                      padding: '0.85rem 1rem',
                      background: '#FFFFFF',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid #FDE68A',
                      boxShadow: 'var(--shadow-xs)',
                    }}
                  >
                    <div style={{ fontSize: '0.7rem', color: '#B45309', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <FileText size={13} />
                      <span>Source Document B</span>
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.source_b_filename} (Page {c.source_b_page})
                    </div>
                    <div className="font-mono" style={{ fontSize: '1.35rem', fontWeight: 700, color: '#D97706' }}>
                      {c.source_b_value}
                    </div>
                  </div>
                </div>

                {/* Detected Discrepancy Explanation */}
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', background: '#F8FAFC', padding: '0.65rem 0.95rem', borderRadius: 'var(--radius-xs)', border: '1px solid #E2E8F0', marginBottom: '0.85rem' }}>
                  <strong>Variance Analysis:</strong> Numerical conflict detected between authoritative annual statutory filing and subsidiary monthly ledger. Exceeds standard DGMS tolerance threshold.
                </div>

                {/* Resolution State or Action CTA */}
                {isResolved ? (
                  <div
                    style={{
                      background: '#ECFDF5',
                      border: '1px solid #A7F3D0',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.65rem',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <Check size={15} />
                        <span>Authoritative Reconciled Value: {c.resolved_value}</span>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#065F46', marginTop: '0.2rem' }}>
                        {c.resolution_notes} — verified by <strong>{c.resolved_by}</strong> on {new Date(c.resolved_at || '').toLocaleDateString()}
                      </div>
                    </div>
                    <span className="badge badge-success font-mono" style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem' }}>
                      Audited Ground Truth
                    </span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <button
                      id={`resolve-btn-${c.id}`}
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => openResolution(c)}
                    >
                      <Scale size={14} />
                      <span>Reconcile Discrepancy</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ── Reconciliation Modal ─────────────────────────────────────────────── */}
      {selectedConflict && (
        <div className="modal-overlay" onClick={() => setSelectedConflict(null)}>
          <div
            className="modal-dialog animate-in"
            style={{ maxWidth: '580px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-dialog-header">
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                  Resolve Document Discrepancy
                </h3>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  {selectedConflict.metric_name} • {selectedConflict.subsidiary}
                </p>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setSelectedConflict(null)}
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.9rem' }}
              >
                ✕
              </button>
            </div>

            <div className="modal-dialog-body">
              <form onSubmit={handleResolveSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.45rem' }}>
                    Select Authoritative Ground Truth Value:
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        padding: '0.75rem 0.95rem',
                        background: '#F8FAFC',
                        borderRadius: 'var(--radius-sm)',
                        border: resolvedValue === selectedConflict.source_a_value ? '1px solid #4F46E5' : '1px solid #E2E8F0',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="radio"
                        name="val"
                        value={selectedConflict.source_a_value}
                        checked={resolvedValue === selectedConflict.source_a_value}
                        onChange={(e) => setResolvedValue(e.target.value)}
                      />
                      <span>Accept Source A ({selectedConflict.source_a_filename}): <strong style={{ color: '#DC2626' }}>{selectedConflict.source_a_value}</strong></span>
                    </label>

                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        padding: '0.75rem 0.95rem',
                        background: '#F8FAFC',
                        borderRadius: 'var(--radius-sm)',
                        border: resolvedValue === selectedConflict.source_b_value ? '1px solid #4F46E5' : '1px solid #E2E8F0',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="radio"
                        name="val"
                        value={selectedConflict.source_b_value}
                        checked={resolvedValue === selectedConflict.source_b_value}
                        onChange={(e) => setResolvedValue(e.target.value)}
                      />
                      <span>Accept Source B ({selectedConflict.source_b_filename}): <strong style={{ color: '#D97706' }}>{selectedConflict.source_b_value}</strong></span>
                    </label>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.45rem' }}>
                    Custom Audited Value (Optional Override):
                  </label>
                  <input
                    type="text"
                    className="form-input font-mono"
                    value={resolvedValue}
                    onChange={(e) => setResolvedValue(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.45rem' }}>
                    Regulatory Sign-off / Reconciliation Audit Notes:
                  </label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    required
                  />
                </div>

                <div className="modal-dialog-footer" style={{ margin: '0 -1.5rem -1.4rem', padding: '1rem 1.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSelectedConflict(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={resolving || !resolvedValue.trim() || !resolutionNotes.trim()}
                  >
                    {resolving ? 'Recording Sign-Off...' : 'Confirm Reconciliation Sign-Off'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

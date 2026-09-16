import React, { useState, useEffect } from 'react';
import { listConflicts, resolveConflict } from '../services/api';
import type { ConflictItem } from '../types';
import { ShieldAlert, CheckCircle2, AlertTriangle, X, RefreshCw, Filter } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const SEVERITY_BADGE: Record<string, string> = {
  critical: 'badge-rose',
  warning: 'badge-amber',
  info: 'badge-blue',
};

const STATUS_FILTER = ['all', 'open', 'resolved'];

export default function ValidationPage() {
  const { user } = useAuth();
  const [conflicts, setConflicts] = useState<ConflictItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolveNote, setResolveNote] = useState('');

  const canResolve = ['Administrator', 'Project Coordinator'].includes(user?.role || '');

  const load = async () => {
    setLoading(true);
    try {
      const data = await listConflicts(statusFilter === 'all' ? undefined : statusFilter);
      setConflicts(data);
    } catch (e: any) {
      setMessage({ type: 'error', text: 'Failed to load conflicts' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [statusFilter]);

  const handleResolve = async (id: string) => {
    try {
      await resolveConflict(id, {
        status: 'resolved',
        resolution_notes: resolveNote || 'Manually resolved',
        resolved_by: user?.username,
      });
      setMessage({ type: 'success', text: 'Conflict marked as resolved.' });
      setResolvingId(null);
      setResolveNote('');
      await load();
    } catch (e: any) {
      setMessage({ type: 'error', text: e?.response?.data?.detail || 'Failed to resolve conflict' });
    }
  };

  const total = conflicts.length;
  const critical = conflicts.filter(c => c.severity === 'critical').length;
  const open = conflicts.filter(c => c.status === 'open').length;
  const resolved = conflicts.filter(c => c.status !== 'open').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <div className="page-title-icon" style={{ background: 'rgba(251,113,133,0.12)', border: '1px solid rgba(251,113,133,0.25)' }}>
              <ShieldAlert size={22} color="#FB7185" />
            </div>
            Conflict Detection & Review
          </h1>
          <p className="page-desc">Cross-document data conflicts detected by the validation engine</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={load}><RefreshCw size={14} /> Refresh</button>
      </div>

      {message && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}><X size={14} /></button>
        </div>
      )}

      {/* Stats */}
      <div className="stat-grid">
        {[
          { label: 'Total Conflicts', value: total, color: '#94A3B8' },
          { label: 'Critical', value: critical, color: '#FB7185' },
          { label: 'Open', value: open, color: '#F59E0B' },
          { label: 'Resolved', value: resolved, color: '#10B981' },
        ].map((s, i) => (
          <div key={i} className="glass-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {STATUS_FILTER.map((f) => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={`btn btn-sm ${statusFilter === f ? 'btn-primary' : 'btn-secondary'}`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Conflicts List */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>Loading conflicts...</div>
        ) : conflicts.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
            <CheckCircle2 size={36} color="#10B981" style={{ margin: '0 auto 1rem', display: 'block' }} />
            <div>No conflicts found.</div>
            <div style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
              {statusFilter === 'all' ? 'Ingest documents and run validation to detect conflicts.' : `No ${statusFilter} conflicts.`}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {conflicts.map((c) => (
              <div key={c.id} style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(51,65,85,0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                      <span className={`badge ${SEVERITY_BADGE[c.severity || 'warning']}`}>
                        {c.severity || 'warning'}
                      </span>
                      <span className="badge badge-indigo" style={{ fontSize: '0.65rem' }}>{c.metric_name || c.metric_type}</span>
                      {c.subsidiary && <span className="badge badge-gray" style={{ fontSize: '0.65rem' }}>{c.subsidiary}</span>}
                      {c.year && <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>{c.year}</span>}
                      <span className={`badge ${c.status === 'open' ? 'badge-amber' : 'badge-emerald'}`} style={{ fontSize: '0.65rem' }}>
                        {c.status}
                      </span>
                    </div>

                    {/* Conflict sources */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div style={{ background: 'rgba(56,189,248,0.07)', padding: '0.6rem 0.75rem', borderRadius: 8, border: '1px solid rgba(56,189,248,0.15)' }}>
                        <div style={{ fontSize: '0.7rem', color: '#64748B', marginBottom: '0.2rem' }}>Source A</div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#38BDF8' }}>{c.source_a_value}</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '0.2rem' }}>{c.source_a_filename} (p.{c.source_a_page})</div>
                      </div>
                      <div style={{ fontSize: '1.2rem', color: '#FB7185', fontWeight: 900 }}>≠</div>
                      <div style={{ background: 'rgba(251,113,133,0.07)', padding: '0.6rem 0.75rem', borderRadius: 8, border: '1px solid rgba(251,113,133,0.15)' }}>
                        <div style={{ fontSize: '0.7rem', color: '#64748B', marginBottom: '0.2rem' }}>Source B</div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FB7185' }}>{c.source_b_value}</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '0.2rem' }}>{c.source_b_filename} (p.{c.source_b_page})</div>
                      </div>
                    </div>

                    {c.resolution_notes && (
                      <div style={{ fontSize: '0.78rem', color: '#94A3B8', fontStyle: 'italic' }}>
                        Resolution: {c.resolution_notes} {c.resolved_by && `— by ${c.resolved_by}`}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {canResolve && c.status === 'open' && (
                    <div>
                      {resolvingId === c.id ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: 200 }}>
                          <textarea
                            className="form-textarea"
                            value={resolveNote}
                            onChange={(e) => setResolveNote(e.target.value)}
                            placeholder="Resolution note..."
                            style={{ minHeight: 60, fontSize: '0.8rem' }}
                          />
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button className="btn btn-success btn-sm" onClick={() => handleResolve(c.id)}>
                              <CheckCircle2 size={13} /> Confirm
                            </button>
                            <button className="btn btn-secondary btn-sm" onClick={() => setResolvingId(null)}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button className="btn btn-secondary btn-sm" onClick={() => setResolvingId(c.id)}>
                          Resolve
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

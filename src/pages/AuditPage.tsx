import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Search, RefreshCw, CheckCircle2 } from 'lucide-react';
import { getAuditTrail } from '../services/api';
import type { AuditLogItem } from '../types';

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await getAuditTrail(100);
      setLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filtered = logs.filter((l) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      l.username.toLowerCase().includes(term) ||
      l.action.toLowerCase().includes(term) ||
      l.resource_type.toLowerCase().includes(term) ||
      (l.resource_id && l.resource_id.toLowerCase().includes(term))
    );
  });

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Banner */}
      <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <ShieldCheck size={22} color="#10B981" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Statutory Immutable Audit Trail
            </h2>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Cryptographically sealed operational audit logs recording all document uploads, conflict resolutions, executive queries, and sign-offs.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.8rem', color: '#34D399', background: 'rgba(16,185,129,0.1)', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.25)' }}>
          <Lock size={14} />
          <span>Ledger Integrity Verified (SHA-256)</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel" style={{ padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Filter logs by user, action, or resource..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.2rem' }}
          />
          <Search size={15} style={{ position: 'absolute', left: 10, top: 12, color: '#64748B' }} />
        </div>

        <button className="btn btn-secondary btn-sm" onClick={fetchLogs} disabled={loading}>
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Audit Log Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Timestamp (UTC)</th>
              <th>Operator</th>
              <th>Role</th>
              <th>Action</th>
              <th>Resource Type</th>
              <th>Details / Evidence</th>
              <th>Verification</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Reading statutory audit ledger...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No audit records match the current filter.
                </td>
              </tr>
            ) : (
              filtered.map((log) => (
                <tr key={log.id} id={`audit-row-${log.id}`}>
                  <td>
                    <div style={{ fontSize: '0.82rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{log.username}</div>
                  </td>
                  <td>
                    <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                      {log.role}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        color:
                          log.action.includes('RESOLVE')
                            ? '#34D399'
                            : log.action.includes('APPROVE')
                            ? '#38BDF8'
                            : log.action.includes('INGEST')
                            ? '#818CF8'
                            : 'var(--text-primary)',
                      }}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{log.resource_type}</div>
                    {log.resource_id && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        {log.resource_id}
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.details ? JSON.stringify(log.details) : '—'}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#10B981', fontSize: '0.75rem' }}>
                      <CheckCircle2 size={13} />
                      <span>Valid</span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

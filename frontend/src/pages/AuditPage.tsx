import React, { useState, useEffect } from 'react';
import { getAuditTrail } from '../services/api';
import type { AuditLogItem } from '../types';
import { ClipboardList, RefreshCw, Search, Shield } from 'lucide-react';

const ACTION_COLORS: Record<string, string> = {
  DOCUMENT_UPLOADED: 'badge-blue',
  AI_QUERY_SUBMITTED: 'badge-violet',
  REPORT_GENERATED: 'badge-emerald',
  REPORT_APPROVE: 'badge-emerald',
  REPORT_REJECT: 'badge-rose',
  REPORT_SUBMIT_FOR_APPROVAL: 'badge-amber',
  HIGH_PRIORITY_QUERY_CREATED: 'badge-amber',
  USER_LOGIN: 'badge-cyan',
  CONFLICT_RESOLVED: 'badge-indigo',
};

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(50);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAuditTrail(limit);
      setLogs(data);
    } catch (e) {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [limit]);

  const filtered = logs.filter(l =>
    !search || l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.username?.toLowerCase().includes(search.toLowerCase()) ||
    l.resource_type?.toLowerCase().includes(search.toLowerCase())
  );

  const ROLE_COLORS: Record<string, string> = {
    Administrator: 'badge-rose',
    'Project Coordinator': 'badge-blue',
    'Director/Senior Officer': 'badge-violet',
    'Implementation Agency': 'badge-amber',
    Auditor: 'badge-emerald',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <div className="page-title-icon" style={{ background: 'rgba(129,140,248,0.12)', border: '1px solid rgba(129,140,248,0.25)' }}>
              <ClipboardList size={22} color="#818CF8" />
            </div>
            Immutable Audit Trail
          </h1>
          <p className="page-desc">Read-only access log of all platform actions for compliance & accountability</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <select className="form-select" value={limit} onChange={(e) => setLimit(parseInt(e.target.value))} style={{ width: 120 }}>
            <option value={25}>25 entries</option>
            <option value={50}>50 entries</option>
            <option value={100}>100 entries</option>
          </select>
          <button className="btn btn-secondary btn-sm" onClick={load}><RefreshCw size={14} /></button>
        </div>
      </div>

      {/* Search + Stats */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 250 }}>
          <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
          <input
            className="form-input"
            style={{ paddingLeft: '2.25rem' }}
            placeholder="Search by action, user, or resource..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <div className="glass-card" style={{ padding: '0.5rem 1rem', textAlign: 'center', minWidth: 90 }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#818CF8' }}>{filtered.length}</div>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Entries</div>
          </div>
          <div className="glass-card" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Shield size={14} color="#10B981" />
            <span style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: 600 }}>Read-Only</span>
          </div>
        </div>
      </div>

      {/* Audit Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>Loading audit logs...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
            <ClipboardList size={36} style={{ margin: '0 auto 1rem', opacity: 0.3, display: 'block' }} />
            <div>No audit log entries found.</div>
          </div>
        ) : (
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Role</th>
                  <th>Action</th>
                  <th>Resource</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#64748B', whiteSpace: 'nowrap' }}>
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{log.username || '—'}</div>
                    </td>
                    <td>
                      <span className={`badge ${ROLE_COLORS[log.role] || 'badge-gray'}`} style={{ fontSize: '0.65rem' }}>
                        {log.role || '—'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${ACTION_COLORS[log.action] || 'badge-gray'}`} style={{ fontSize: '0.65rem', fontFamily: 'JetBrains Mono, monospace' }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: '#94A3B8' }}>
                      {log.resource_type}
                      {log.resource_id && <span style={{ color: '#64748B', fontSize: '0.7rem', marginLeft: '0.3rem' }}>#{log.resource_id.slice(0, 8)}</span>}
                    </td>
                    <td style={{ fontSize: '0.75rem', color: '#64748B', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.details ? JSON.stringify(log.details).slice(0, 80) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { listReports, generateReport, updateReportApproval, getReportDetail } from '../services/api';
import type { ReportItem } from '../types';
import { FileBarChart2, Plus, CheckCircle2, X, AlertTriangle, Clock, Download, Eye, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const REPORT_TYPES = [
  { value: 'production_summary', label: 'Coal Production Summary', icon: '⛏️' },
  { value: 'geological_summary', label: 'Geological Survey Summary', icon: '🪨' },
  { value: 'compliance_inspection', label: 'Compliance & Inspection', icon: '🛡️' },
  { value: 'conflict_analysis', label: 'Data Conflict Analysis', icon: '⚠️' },
];

const SUBSIDIARIES = ['', 'Northern Coalfields Sample Ltd', 'Eastern Mining Sample Ltd', 'Central Collieries Sample Ltd'];
const YEARS = ['', '2021', '2022', '2023', '2024', '2025'];

const STATUS_BADGE: Record<string, string> = {
  draft: 'badge-gray',
  pending_approval: 'badge-amber',
  approved: 'badge-emerald',
  rejected: 'badge-rose',
};

export default function ReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerate, setShowGenerate] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [form, setForm] = useState({ report_type: 'production_summary', subsidiary: '', year: '' });

  const canGenerate = ['Administrator', 'Project Coordinator'].includes(user?.role || '');
  const canApprove = ['Administrator', 'Director/Senior Officer'].includes(user?.role || '');

  const load = async () => {
    setLoading(true);
    try {
      const data = await listReports();
      setReports(data);
    } catch (e: any) {
      setMessage({ type: 'error', text: 'Failed to load reports' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setMessage(null);
    try {
      const result = await generateReport({
        report_type: form.report_type,
        subsidiary: form.subsidiary || undefined,
        year: form.year ? parseInt(form.year) : undefined,
      });
      setMessage({ type: 'success', text: `Report "${result.title}" generated successfully (status: ${result.status})` });
      setShowGenerate(false);
      await load();
    } catch (e: any) {
      setMessage({ type: 'error', text: e?.response?.data?.detail || 'Report generation failed' });
    } finally {
      setGenerating(false);
    }
  };

  const handleApproval = async (reportId: string, action: 'approve' | 'reject' | 'submit_for_approval') => {
    try {
      await updateReportApproval(reportId, action);
      setMessage({ type: 'success', text: `Report ${action.replace('_', ' ')}d successfully` });
      await load();
      if (selectedReport?.id === reportId) {
        const updated = await getReportDetail(reportId);
        setSelectedReport(updated);
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: e?.response?.data?.detail || `Failed to ${action} report` });
    }
  };

  const handleViewDetail = async (reportId: string) => {
    setDetailLoading(true);
    try {
      const detail = await getReportDetail(reportId);
      setSelectedReport(detail);
    } catch (e: any) {
      setMessage({ type: 'error', text: 'Failed to load report detail' });
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <div className="page-title-icon" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }}>
              <FileBarChart2 size={22} color="#10B981" />
            </div>
            Automated Report Generator
          </h1>
          <p className="page-desc">Generate structured reports from the knowledge base with approval workflow</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {canGenerate && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowGenerate(!showGenerate)}>
              <Plus size={14} /> Generate Report
            </button>
          )}
          <button className="btn btn-secondary btn-sm" onClick={load}><RefreshCw size={14} /></button>
        </div>
      </div>

      {message && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}><X size={14} /></button>
        </div>
      )}

      {/* Generate Form */}
      {showGenerate && canGenerate && (
        <div className="glass-panel" style={{ padding: '1.5rem' }} id="generate-report-form">
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Configure New Report</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Report Type</label>
              <select className="form-select" value={form.report_type} onChange={(e) => setForm({ ...form, report_type: e.target.value })}>
                {REPORT_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Subsidiary</label>
              <select className="form-select" value={form.subsidiary} onChange={(e) => setForm({ ...form, subsidiary: e.target.value })}>
                {SUBSIDIARIES.map(s => <option key={s} value={s}>{s || 'All Subsidiaries'}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Year</label>
              <select className="form-select" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })}>
                {YEARS.map(y => <option key={y} value={y}>{y || 'All Years'}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-primary" onClick={handleGenerate} disabled={generating} id="generate-report-submit">
              {generating ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                  Generating...
                </span>
              ) : <><FileBarChart2 size={16} /> Generate</>}
            </button>
            <button className="btn btn-secondary" onClick={() => setShowGenerate(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: selectedReport ? '1fr 400px' : '1fr', gap: '1.5rem' }}>
        {/* Reports List */}
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(51,65,85,0.4)' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Generated Reports ({reports.length})</h2>
          </div>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>Loading reports...</div>
          ) : reports.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
              <FileBarChart2 size={36} style={{ margin: '0 auto 1rem', opacity: 0.3, display: 'block' }} />
              <div>No reports generated yet.</div>
              <div style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Use the "Generate Report" button above to create your first report.</div>
            </div>
          ) : (
            <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Subsidiary</th>
                    <th>Year</th>
                    <th>Status</th>
                    <th>Generated By</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => {
                    const typeInfo = REPORT_TYPES.find(t => t.value === r.report_type);
                    return (
                      <tr key={r.id} style={{ background: selectedReport?.id === r.id ? 'rgba(56,189,248,0.05)' : undefined }}>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '0.82rem', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</div>
                          <div style={{ fontSize: '0.7rem', color: '#64748B' }}>{new Date(r.created_at).toLocaleDateString()}</div>
                        </td>
                        <td><span style={{ fontSize: '0.82rem' }}>{typeInfo?.icon} {typeInfo?.label || r.report_type}</span></td>
                        <td style={{ fontSize: '0.8rem', color: '#94A3B8', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.subsidiary || 'All'}</td>
                        <td style={{ color: '#38BDF8', fontWeight: 700 }}>{r.report_year || 'All'}</td>
                        <td><span className={`badge ${STATUS_BADGE[r.status] || 'badge-gray'}`} style={{ fontSize: '0.65rem' }}>{r.status.replace('_', ' ')}</span></td>
                        <td style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{r.generated_by || 'system'}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => handleViewDetail(r.id)} style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}>
                              <Eye size={12} />
                            </button>
                            {r.status === 'draft' && canGenerate && (
                              <button className="btn btn-secondary btn-sm" onClick={() => handleApproval(r.id, 'submit_for_approval')} style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}>
                                Submit
                              </button>
                            )}
                            {r.status === 'pending_approval' && canApprove && (
                              <>
                                <button className="btn btn-success btn-sm" onClick={() => handleApproval(r.id, 'approve')} style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}>
                                  <CheckCircle2 size={12} /> Approve
                                </button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleApproval(r.id, 'reject')} style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}>
                                  <X size={12} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selectedReport && (
          <div className="glass-panel" style={{ padding: '1.25rem', height: 'fit-content', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Report Detail</h3>
              <button onClick={() => setSelectedReport(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}><X size={16} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{selectedReport.title}</div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                <span className={`badge ${STATUS_BADGE[selectedReport.status] || 'badge-gray'}`}>{selectedReport.status}</span>
                {selectedReport.approved_by && <span className="badge badge-emerald">Approved by {selectedReport.approved_by}</span>}
              </div>
              {selectedReport.content?.executive_summary && (
                <div style={{ fontSize: '0.82rem', color: '#94A3B8', lineHeight: 1.7, padding: '0.75rem', background: 'rgba(56,189,248,0.05)', borderRadius: 8, border: '1px solid rgba(56,189,248,0.15)' }}>
                  {selectedReport.content.executive_summary}
                </div>
              )}
              {selectedReport.content?.source_documents?.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Source Documents</div>
                  {selectedReport.content.source_documents.slice(0, 5).map((d: any, i: number) => (
                    <div key={i} style={{ fontSize: '0.78rem', color: '#94A3B8', padding: '0.25rem 0' }}>📄 {d.filename} ({d.year || '?'})</div>
                  ))}
                </div>
              )}
              {selectedReport.reviewer_notes && (
                <div style={{ fontSize: '0.82rem', color: '#F59E0B', padding: '0.5rem 0.75rem', background: 'rgba(245,158,11,0.08)', borderRadius: 6, border: '1px solid rgba(245,158,11,0.2)' }}>
                  <strong>Reviewer Notes:</strong> {selectedReport.reviewer_notes}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect, useContext } from 'react';
import {
  FileText,
  FileCheck2,
  CheckCircle2,
  Clock,
  Printer,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Send,
  Download,
  FileDown,
  FileSpreadsheet,
  AlertCircle,
  FolderOpen,
} from 'lucide-react';
import { listReports, generateReport, updateReportApproval } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import type { ReportItem } from '../types';

export default function ReportsPage() {
  const { user } = useContext(AuthContext);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);

  // Generator form
  const [reportType, setReportType] = useState('Production Summary');
  const [subsidiary, setSubsidiary] = useState('Northern Coalfields Limited (NCSL)');
  const [year, setYear] = useState(2023);

  // Approval modal
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await listReports();
      setReports(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setNotification(null);
    try {
      const newRep = await generateReport({
        report_type: reportType,
        subsidiary,
        year,
      });
      await fetchReports();
      setSelectedReport(newRep);
      setNotification(`Intelligence dossier "${newRep.title}" compiled and queued for Director sign-off.`);
    } catch (e) {
      console.error(e);
      setNotification('Failed to compile intelligence dossier.');
    } finally {
      setGenerating(false);
    }
  };

  const handleApprovalAction = async (action: 'approved' | 'rejected') => {
    if (!selectedReport) return;
    setUpdatingStatus(true);
    try {
      const updated = await updateReportApproval(selectedReport.id, action, reviewerNotes);
      setSelectedReport(updated);
      await fetchReports();
      setNotification(
        action === 'approved'
          ? `Dossier ${selectedReport.id} granted official statutory approval.`
          : `Revision request recorded for dossier ${selectedReport.id}.`
      );
    } catch (e) {
      console.error(e);
      setNotification('Failed to update dossier statutory approval status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Export handlers
  const exportJSON = (report: ReportItem) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `${report.title.replace(/\s+/g, '_')}_Dossier.json`);
    dlAnchorElem.click();
  };

  const exportCSV = (report: ReportItem) => {
    const metrics = report.content_json?.metrics || {};
    let csvContent = 'data:text/csv;charset=utf-8,Metric,Value\n';
    Object.entries(metrics).forEach(([k, v]) => {
      csvContent += `"${k}","${v}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${report.title.replace(/\s+/g, '_')}_Metrics.csv`);
    link.click();
  };

  const canApprove = user?.role === 'Director/Senior Officer' || user?.role === 'Administrator';

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.2rem 0.65rem', borderRadius: 'var(--radius-full)', background: '#EEF2FF', border: '1px solid #C7D2FE', color: '#4F46E5', fontSize: '0.72rem', fontWeight: 600, marginBottom: '0.45rem' }}>
            <FileText size={13} />
            <span>Statutory Reporting Engine</span>
          </div>
          <h1 className="page-title">
            <span>Statutory Intelligence Briefs & Dossiers</span>
          </h1>
          <p className="page-description">
            Automated compilation of formal executive briefs, DGMS compliance reconciliations, and parliamentary standing committee returns with digital provenance.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              background: '#EEF2FF',
              border: '1px solid #C7D2FE',
              fontSize: '0.74rem',
              color: '#4F46E5',
              fontWeight: 600,
            }}
          >
            <ShieldCheck size={14} color="#4F46E5" />
            <span>Ministry Standard Formats</span>
          </span>
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

      {/* ── Formal Enterprise Dossier Generator ───────────────────────────────── */}
      <div className="panel" id="generate-brief-panel" style={{ background: '#FFFFFF', boxShadow: 'var(--shadow-sm)' }}>
        <div className="panel-header">
          <div>
            <h3 className="panel-title">
              <Sparkles size={16} color="#4F46E5" />
              <span>Compile Executive Intelligence Dossier</span>
            </h3>
            <p className="panel-subtitle">Select statutory template and target subsidiary scope</p>
          </div>
        </div>

        <form
          onSubmit={handleGenerate}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr)) auto',
            gap: '1.15rem',
            alignItems: 'flex-end',
          }}
        >
          <div>
            <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.45rem' }}>
              Statutory Template Type
            </label>
            <select
              id="report-type-select"
              className="form-select"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              style={{ fontSize: '0.8rem', background: '#FFFFFF' }}
            >
              <option value="Production Summary">Annual Production & Overburden Audit</option>
              <option value="Cross-Subsidiary Reconciliation">Cross-Subsidiary Discrepancy Reconciliation</option>
              <option value="Parliamentary QA Dossier">Parliamentary Standing Committee QA Dossier</option>
              <option value="Environmental & CSR Compliance">Environmental & CSR Statutory Filing</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.45rem' }}>
              Target CIL Subsidiary
            </label>
            <select
              id="report-subsidiary-select"
              className="form-select"
              value={subsidiary}
              onChange={(e) => setSubsidiary(e.target.value)}
              style={{ fontSize: '0.8rem', background: '#FFFFFF' }}
            >
              <option value="Northern Coalfields Limited (NCSL)">Northern Coalfields Limited (NCSL)</option>
              <option value="Eastern Mining Services (EMSL)">Eastern Mining Services (EMSL)</option>
              <option value="Central Collieries Limited (CCSL)">Central Collieries Limited (CCSL)</option>
              <option value="All CIL Subsidiaries">All CIL Subsidiaries Combined</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.45rem' }}>
              Reporting Financial Year
            </label>
            <select
              id="report-year-select"
              className="form-select"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              style={{ fontSize: '0.8rem', background: '#FFFFFF' }}
            >
              <option value="2024">FY 2024-25</option>
              <option value="2023">FY 2023-24</option>
              <option value="2022">FY 2022-23</option>
            </select>
          </div>

          <button
            id="generate-report-btn"
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={generating}
            style={{ height: 38, padding: '0 1.35rem' }}
          >
            {generating ? (
              <>
                <Clock size={14} className="animate-spin" />
                <span>Compiling Dossier...</span>
              </>
            ) : (
              <>
                <Send size={14} />
                <span>Generate Dossier</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* ── Generated Reports History ────────────────────────────────────────── */}
      <div className="panel" style={{ background: '#FFFFFF', boxShadow: 'var(--shadow-sm)' }}>
        <div className="panel-header">
          <div>
            <h3 className="panel-title">
              <FileText size={16} color="#059669" />
              <span>Enterprise Intelligence Dossier Archive</span>
            </h3>
            <p className="panel-subtitle">Audited briefs, approval status, and exportable data</p>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="enterprise-table" id="reports-ledger-table">
            <thead>
              <tr>
                <th>Dossier Title</th>
                <th>Classification</th>
                <th>Subsidiary</th>
                <th>FY</th>
                <th>Status</th>
                <th>Author</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2.75rem', color: 'var(--text-muted)' }}>
                    Loading dossier archive...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2.75rem', color: 'var(--text-muted)' }}>
                    No reports generated yet. Use the generator console above to create your first brief.
                  </td>
                </tr>
              ) : (
                reports.map((r) => (
                  <tr key={r.id} id={`report-row-${r.id}`}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.title}</div>
                      <div className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        ID: {r.id}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>
                        {r.report_type}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>{r.subsidiary}</td>
                    <td className="font-mono" style={{ fontSize: '0.78rem' }}>{r.report_year}</td>
                    <td>
                      {r.status === 'approved' ? (
                        <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>
                          Director Approved
                        </span>
                      ) : r.status === 'rejected' ? (
                        <span className="badge badge-critical" style={{ fontSize: '0.68rem' }}>
                          Revision Required
                        </span>
                      ) : (
                        <span className="badge badge-warning" style={{ fontSize: '0.68rem' }}>
                          Pending Sign-Off
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>{r.generated_by}</td>
                    <td className="font-mono" style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setSelectedReport(r);
                            setReviewerNotes(r.reviewer_notes || '');
                          }}
                          style={{ fontSize: '0.74rem' }}
                        >
                          <span>Inspect</span>
                          <ChevronRight size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Formal Enterprise Dossier Modal ──────────────────────────────────── */}
      {selectedReport && (
        <div className="modal-overlay" onClick={() => setSelectedReport(null)}>
          <div
            className="modal-dialog animate-in"
            style={{ maxWidth: '840px' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="modal-dialog-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                    {selectedReport.title}
                  </h3>
                  {selectedReport.status === 'approved' ? (
                    <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>
                      Approved
                    </span>
                  ) : (
                    <span className="badge badge-warning" style={{ fontSize: '0.68rem' }}>
                      Pending Sign-Off
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {selectedReport.subsidiary} • FY {selectedReport.report_year} • Compiled by {selectedReport.generated_by}
                </p>
              </div>

              {/* Action Toolbar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => exportCSV(selectedReport)}
                  title="Export Metrics as CSV"
                  style={{ fontSize: '0.74rem', padding: '0.3rem 0.6rem' }}
                >
                  <FileSpreadsheet size={13} color="#059669" />
                  <span>CSV</span>
                </button>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => exportJSON(selectedReport)}
                  title="Export Dossier as JSON"
                  style={{ fontSize: '0.74rem', padding: '0.3rem 0.6rem' }}
                >
                  <FileDown size={13} color="#4F46E5" />
                  <span>JSON</span>
                </button>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => window.print()}
                  title="Print Formal Dossier"
                  style={{ fontSize: '0.74rem', padding: '0.3rem 0.6rem' }}
                >
                  <Printer size={13} />
                  <span>Print</span>
                </button>

                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setSelectedReport(null)}
                  style={{ padding: '0.25rem 0.55rem', fontSize: '0.9rem' }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Dossier Content Body */}
            <div className="modal-dialog-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {selectedReport.content_json ? (
                <>
                  {/* Executive Summary */}
                  <div style={{ background: '#F8FAFC', padding: '1.15rem', borderRadius: 'var(--radius-sm)', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#4F46E5', textTransform: 'uppercase', marginBottom: '0.45rem', letterSpacing: '0.04em' }}>
                      1. Executive Summary
                    </div>
                    <p style={{ fontSize: '0.86rem', color: 'var(--text-primary)', lineHeight: 1.7 }}>
                      {selectedReport.content_json.executive_summary}
                    </p>
                  </div>

                  {/* Reconciled Metrics Summary */}
                  <div style={{ background: '#F8FAFC', padding: '1.15rem', borderRadius: 'var(--radius-sm)', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.04em' }}>
                      2. Reconciled Metrics & Findings
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem' }}>
                      {Object.entries(selectedReport.content_json.metrics || {}).map(([k, v]: [string, any]) => (
                        <div key={k} style={{ background: '#FFFFFF', padding: '0.75rem 0.85rem', borderRadius: 'var(--radius-xs)', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-xs)' }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                            {k.replace(/_/g, ' ').toUpperCase()}
                          </div>
                          <div className="font-mono" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                            {v}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Statutory Verification Provenance */}
                  <div style={{ background: '#F8FAFC', padding: '1.15rem', borderRadius: 'var(--radius-sm)', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase', marginBottom: '0.45rem', letterSpacing: '0.04em' }}>
                      3. Statutory Verification & Audit Provenance
                    </div>
                    <ul style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: '1.25rem', lineHeight: 1.7 }}>
                      <li>Extracted figures cross-referenced against authoritative CIL production ledgers.</li>
                      <li>Verified against DGMS safety logbooks and electronic weighbridge dispatch chits.</li>
                      <li>Discrepancy resolutions certified by authorized Project Coordinator.</li>
                    </ul>
                  </div>
                </>
              ) : (
                <div style={{ background: '#F8FAFC', padding: '1.15rem', borderRadius: 'var(--radius-sm)', border: '1px solid #E2E8F0', whiteSpace: 'pre-wrap', fontSize: '0.84rem', lineHeight: 1.65 }}>
                  {typeof selectedReport.content === 'string' ? selectedReport.content : JSON.stringify(selectedReport.content, null, 2)}
                </div>
              )}

              {/* Statutory Sign-off Action Block */}
              <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1.15rem', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldCheck size={18} color="#4F46E5" />
                    <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Director Statutory Sign-off & Seal
                    </span>
                  </div>
                  {selectedReport.approved_by && (
                    <span style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 600 }}>
                      Signed off by: {selectedReport.approved_by}
                    </span>
                  )}
                </div>

                {canApprove ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <textarea
                      className="form-textarea"
                      rows={2}
                      placeholder="Enter Director / Senior Officer statutory sign-off remarks or revision instruction..."
                      value={reviewerNotes}
                      onChange={(e) => setReviewerNotes(e.target.value)}
                      style={{ fontSize: '0.8rem' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => handleApprovalAction('rejected')}
                        disabled={updatingStatus}
                      >
                        Request Revision
                      </button>
                      <button
                        id="approve-report-btn"
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => handleApprovalAction('approved')}
                        disabled={updatingStatus}
                      >
                        <CheckCircle2 size={14} />
                        <span>{updatingStatus ? 'Sealing...' : 'Grant Statutory Approval'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: 'var(--radius-xs)', border: '1px solid #E2E8F0' }}>
                    Statutory sign-off is restricted to <strong>Director / Senior Officer</strong> or <strong>Administrator</strong> roles. Switch accounts via the top header profile menu to execute approvals.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

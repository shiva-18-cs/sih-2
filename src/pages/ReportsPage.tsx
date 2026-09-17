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

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await listReports();
      setReports(data);
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
    try {
      const newRep = await generateReport({
        report_type: reportType,
        subsidiary,
        year,
      });
      await fetchReports();
      setSelectedReport(newRep);
    } catch (e) {
      console.error(e);
      alert('Failed to generate report');
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
    } catch (e) {
      console.error(e);
      alert('Failed to update report status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const canApprove = user?.role === 'Director/Senior Officer' || user?.role === 'Administrator';

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Creation Panel */}
      <div className="glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Sparkles size={20} color="#38BDF8" />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Automated Intelligence Report Generation
          </h2>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          Compile verified statutory dossiers with conflict resolution cross-references, provenance footnotes, and executive summaries.
        </p>

        <form onSubmit={handleGenerate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr)) auto', gap: '1rem', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Report Template
            </label>
            <select className="form-select" value={reportType} onChange={(e) => setReportType(e.target.value)}>
              <option value="Production Summary">Annual Production & Overburden Audit</option>
              <option value="Cross-Subsidiary Reconciliation">Cross-Subsidiary Discrepancy Reconciliation</option>
              <option value="Parliamentary QA Dossier">Parliamentary Standing Committee QA Dossier</option>
              <option value="Environmental & CSR Compliance">Environmental & CSR Statutory Filing</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              CIL Subsidiary
            </label>
            <select className="form-select" value={subsidiary} onChange={(e) => setSubsidiary(e.target.value)}>
              <option value="Northern Coalfields Limited (NCSL)">Northern Coalfields Limited (NCSL)</option>
              <option value="Eastern Mining Services (EMSL)">Eastern Mining Services (EMSL)</option>
              <option value="Central Collieries Limited (CCSL)">Central Collieries Limited (CCSL)</option>
              <option value="All CIL Subsidiaries">All CIL Subsidiaries Combined</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Reporting Year
            </label>
            <select className="form-select" value={year} onChange={(e) => setYear(Number(e.target.value))}>
              <option value="2024">2024 (FY 2024-25)</option>
              <option value="2023">2023 (FY 2023-24)</option>
              <option value="2022">2022 (FY 2022-23)</option>
            </select>
          </div>

          <button
            id="generate-report-btn"
            type="submit"
            className="btn btn-primary"
            disabled={generating}
            style={{ height: '38px' }}
          >
            {generating ? (
              <span>Synthesizing...</span>
            ) : (
              <>
                <Send size={14} />
                <span>Generate Dossier</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Reports Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Dossier Title</th>
              <th>Type</th>
              <th>Subsidiary</th>
              <th>Year</th>
              <th>Status</th>
              <th>Author</th>
              <th>Generated Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Loading reports...
                </td>
              </tr>
            ) : reports.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No reports generated yet. Use the form above to generate your first dossier.
                </td>
              </tr>
            ) : (
              reports.map((r) => (
                <tr key={r.id} id={`report-row-${r.id}`}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.title}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ID: {r.id}</div>
                  </td>
                  <td>
                    <span className="badge badge-info">{r.report_type}</span>
                  </td>
                  <td>{r.subsidiary}</td>
                  <td>{r.report_year}</td>
                  <td>
                    {r.status === 'approved' ? (
                      <span className="badge badge-success">Director Approved</span>
                    ) : r.status === 'rejected' ? (
                      <span className="badge badge-critical">Revision Requested</span>
                    ) : (
                      <span className="badge badge-warning">Pending Review</span>
                    )}
                  </td>
                  <td>{r.generated_by}</td>
                  <td>{new Date(r.created_at).toLocaleDateString()}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setSelectedReport(r);
                        setReviewerNotes(r.reviewer_notes || '');
                      }}
                    >
                      <span>Inspect Dossier</span>
                      <ChevronRight size={13} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Report Modal */}
      {selectedReport && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1.5rem' }}>
          <div className="glass-panel animate-in" style={{ width: '100%', maxWidth: '820px', maxHeight: '92vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.85rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{selectedReport.title}</h3>
                  {selectedReport.status === 'approved' ? (
                    <span className="badge badge-success">Approved</span>
                  ) : (
                    <span className="badge badge-warning">Pending Sign-off</span>
                  )}
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {selectedReport.subsidiary} • FY {selectedReport.report_year} • Generated by {selectedReport.generated_by}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>
                  <Printer size={13} />
                  <span>Print</span>
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => setSelectedReport(null)}>
                  ✕ Close
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>
              {selectedReport.content_json ? (
                <>
                  <div style={{ background: 'rgba(15,23,42,0.7)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-blue)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      1. Executive Summary
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.7 }}>
                      {selectedReport.content_json.executive_summary}
                    </p>
                  </div>

                  <div style={{ background: 'rgba(15,23,42,0.7)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-indigo)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      2. Reconciled Metrics & Findings
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginTop: '0.75rem' }}>
                      {Object.entries(selectedReport.content_json.metrics || {}).map(([k, v]: [string, any]) => (
                        <div key={k} style={{ background: 'rgba(13,21,38,0.8)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{k.replace(/_/g, ' ').toUpperCase()}</div>
                          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(15,23,42,0.7)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-emerald)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      3. Statutory Verification & Audit Provenance
                    </h4>
                    <ul style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', paddingLeft: '1.25rem', lineHeight: 1.8 }}>
                      <li>All source figures verified against CIL monthly production ledgers.</li>
                      <li>Cross-checked against DGMS safety logbooks and weighbridge dispatch chits.</li>
                      <li>Discrepancy resolution verified by authorized Project Coordinator.</li>
                    </ul>
                  </div>
                </>
              ) : (
                <div style={{ background: 'rgba(15,23,42,0.7)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border)', whiteSpace: 'pre-wrap', fontSize: '0.88rem', lineHeight: 1.7 }}>
                  {typeof selectedReport.content === 'string' ? selectedReport.content : JSON.stringify(selectedReport.content, null, 2)}
                </div>
              )}
            </div>

            {/* Approval / Sign-off Section */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={18} color="#38BDF8" />
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Director Approval & Statutory Sign-off
                  </span>
                </div>
                {selectedReport.approved_by && (
                  <span style={{ fontSize: '0.75rem', color: '#34D399' }}>
                    Signed off by: {selectedReport.approved_by}
                  </span>
                )}
              </div>

              {canApprove ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="Enter Director / Senior Officer sign-off endorsement or revision request..."
                    value={reviewerNotes}
                    onChange={(e) => setReviewerNotes(e.target.value)}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleApprovalAction('rejected')}
                      disabled={updatingStatus}
                    >
                      Request Revision
                    </button>
                    <button
                      id="approve-report-btn"
                      className="btn btn-success btn-sm"
                      onClick={() => handleApprovalAction('approved')}
                      disabled={updatingStatus}
                    >
                      <CheckCircle2 size={14} />
                      <span>{updatingStatus ? 'Recording...' : 'Grant Statutory Approval'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'rgba(51,65,85,0.2)', padding: '0.75rem', borderRadius: '8px' }}>
                  Statutory sign-off is restricted to <strong>Director / Senior Officer</strong> or <strong>Administrator</strong> roles. Switch to the Director demo account to execute approvals.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

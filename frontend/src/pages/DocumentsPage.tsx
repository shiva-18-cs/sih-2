import React, { useState, useEffect, useRef } from 'react';
import { listDocuments, uploadDocument, bulkIngestDataset, triggerIndexing } from '../services/api';
import type { DocumentItem } from '../types';
import { Upload, FileText, RefreshCw, Database, CheckCircle2, AlertTriangle, Clock, Cpu, ChevronDown, X, Layers } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const STATUS_BADGE: Record<string, string> = {
  ingested: 'badge-emerald',
  flagged: 'badge-amber',
  processing: 'badge-blue',
  validated: 'badge-cyan',
};

const OCR_BADGE: Record<string, string> = {
  digital_text: 'badge-blue',
  tesseract: 'badge-amber',
  paddleocr: 'badge-violet',
  none: 'badge-gray',
};

export default function DocumentsPage() {
  const { user } = useAuth();
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canUpload = ['Administrator', 'Project Coordinator', 'Implementation Agency'].includes(user?.role || '');

  const load = async () => {
    setLoading(true);
    try {
      const data = await listDocuments(100);
      setDocs(data);
    } catch (e: any) {
      setMessage({ type: 'error', text: e?.response?.data?.detail || 'Failed to load documents' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadPct(0);
    setMessage(null);
    try {
      for (const file of Array.from(files)) {
        await uploadDocument(file, (pct) => setUploadPct(pct));
      }
      setMessage({ type: 'success', text: `${files.length} file(s) uploaded successfully. Indexing in progress.` });
      await load();
    } catch (e: any) {
      setMessage({ type: 'error', text: e?.response?.data?.detail || 'Upload failed' });
    } finally {
      setUploading(false);
      setUploadPct(0);
    }
  };

  const handleBulkIngest = async () => {
    setBulkLoading(true);
    setMessage(null);
    try {
      const result = await bulkIngestDataset();
      setMessage({ type: 'success', text: `Bulk ingest complete: ${result.ingested_count || 0} documents processed.` });
      await load();
    } catch (e: any) {
      setMessage({ type: 'error', text: e?.response?.data?.detail || 'Bulk ingest failed. Ensure dataset/raw_docs exists.' });
    } finally {
      setBulkLoading(false);
    }
  };

  const handleTriggerIndex = async () => {
    try {
      await triggerIndexing();
      setMessage({ type: 'success', text: 'Embedding indexing triggered in background.' });
    } catch (e: any) {
      setMessage({ type: 'error', text: e?.response?.data?.detail || 'Indexing failed' });
    }
  };

  const getFileTypeIcon = (type: string) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('xlsx') || type.includes('spreadsheet')) return '📊';
    if (type.includes('docx') || type.includes('word')) return '📝';
    if (type.includes('image')) return '🖼️';
    if (type.includes('csv')) return '📋';
    return '📁';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <div className="page-title-icon" style={{ background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.25)' }}>
              <FileText size={22} color="#38BDF8" />
            </div>
            Document Ingestion & OCR
          </h1>
          <p className="page-desc">Upload geological, production, and compliance reports in PDF, DOCX, XLSX, or image format</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {canUpload && (
            <>
              <button className="btn btn-secondary btn-sm" onClick={handleBulkIngest} disabled={bulkLoading}>
                {bulkLoading ? <span className="animate-spin" style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid #94A3B8', borderTopColor: 'white', borderRadius: '50%' }} /> : <Layers size={14} />}
                Bulk Ingest Dataset
              </button>
              {user?.role === 'Administrator' || user?.role === 'Implementation Agency' ? (
                <button className="btn btn-secondary btn-sm" onClick={handleTriggerIndex}>
                  <Database size={14} /> Trigger Indexing
                </button>
              ) : null}
            </>
          )}
          <button className="btn btn-secondary btn-sm" onClick={load}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Upload Zone */}
      {canUpload && (
        <div
          className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileUpload(e.dataTransfer.files); }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.xlsx,.csv,.png,.jpg,.jpeg"
            style={{ display: 'none' }}
            onChange={(e) => handleFileUpload(e.target.files)}
            id="file-upload-input"
          />
          {uploading ? (
            <div>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⬆️</div>
              <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Uploading... {uploadPct}%</div>
              <div className="progress-bar" style={{ maxWidth: 300, margin: '0 auto' }}>
                <div className="progress-fill" style={{ width: `${uploadPct}%` }} />
              </div>
            </div>
          ) : (
            <div>
              <Upload size={32} style={{ margin: '0 auto 0.75rem', color: '#38BDF8', display: 'block' }} />
              <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>Drop files here or click to upload</div>
              <div style={{ color: '#64748B', fontSize: '0.85rem' }}>Supports: PDF (digital & scanned), DOCX, XLSX, CSV, PNG, JPG</div>
              <div style={{ marginTop: '0.75rem' }}>
                <span className="badge badge-blue">PDF</span>{' '}
                <span className="badge badge-amber">DOCX</span>{' '}
                <span className="badge badge-emerald">XLSX</span>{' '}
                <span className="badge badge-violet">Images</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
        {[
          { label: 'Total', value: docs.length, color: '#38BDF8' },
          { label: 'Validated', value: docs.filter(d => d.status === 'validated' || d.status === 'ingested').length, color: '#10B981' },
          { label: 'Flagged', value: docs.filter(d => d.status === 'flagged').length, color: '#F59E0B' },
          { label: 'Avg Confidence', value: docs.length ? (docs.reduce((a, d) => a + d.avg_ocr_confidence, 0) / docs.length).toFixed(1) + '%' : 'N/A', color: '#A855F7' },
        ].map((s, i) => (
          <div key={i} className="glass-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Documents Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(51,65,85,0.4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Ingested Documents ({docs.length})</h2>
        </div>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>Loading documents...</div>
        ) : docs.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
            <FileText size={36} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <div>No documents ingested yet.</div>
            <div style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Use "Bulk Ingest Dataset" to load all available reports.</div>
          </div>
        ) : (
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>File</th>
                  <th>Type</th>
                  <th>Subsidiary</th>
                  <th>Year</th>
                  <th>Pages</th>
                  <th>OCR Engine</th>
                  <th>Confidence</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((doc) => (
                  <tr key={doc.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>{getFileTypeIcon(doc.file_type)}</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.82rem', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.filename}</div>
                          <div style={{ fontSize: '0.7rem', color: '#64748B' }}>{new Date(doc.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-indigo" style={{ fontSize: '0.68rem' }}>{doc.document_type || 'Unknown'}</span></td>
                    <td><div style={{ fontSize: '0.82rem', color: '#94A3B8', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.subsidiary || '—'}</div></td>
                    <td><span style={{ fontWeight: 700, color: '#38BDF8' }}>{doc.report_year || '—'}</span></td>
                    <td style={{ color: '#94A3B8' }}>{doc.page_count}</td>
                    <td><span className={`badge ${OCR_BADGE[doc.ocr_engine || 'none'] || 'badge-gray'}`} style={{ fontSize: '0.65rem' }}>{doc.ocr_engine || 'none'}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: doc.avg_ocr_confidence >= 80 ? '#10B981' : '#F59E0B' }}>
                          {doc.avg_ocr_confidence?.toFixed(1)}%
                        </div>
                        {doc.has_low_confidence_pages && <AlertTriangle size={13} color="#F59E0B" />}
                      </div>
                    </td>
                    <td><span className={`badge ${STATUS_BADGE[doc.status] || 'badge-gray'}`} style={{ fontSize: '0.65rem' }}>{doc.status}</span></td>
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

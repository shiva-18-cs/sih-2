import React, { useEffect, useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  FileCheck,
  AlertCircle,
  Trash2,
  Eye,
  RefreshCw,
  Cpu,
} from 'lucide-react';
import { listDocuments, uploadDocument, bulkIngestDataset, apiClient } from '../services/api';
import type { DocumentItem } from '../types';

export default function DocumentsPage() {
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [filterType, setFilterType] = useState('all');
  const [filterSubsidiary, setFilterSubsidiary] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const data = await listDocuments(100);
      setDocs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setUploadPct(0);
    try {
      await uploadDocument(file, (pct) => setUploadPct(pct));
      await fetchDocs();
    } catch (e) {
      console.error(e);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleBulkIngest = async () => {
    setLoading(true);
    try {
      await bulkIngestDataset();
      await fetchDocs();
      alert('Complete CMPDI/CIL demonstration dataset ingested successfully!');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this document from the knowledge base?')) return;
    try {
      await apiClient.delete(`/documents/${id}`);
      await fetchDocs();
    } catch (e) {
      console.error(e);
    }
  };

  const getFileIcon = (fileType: string) => {
    const t = fileType.toLowerCase();
    if (t.includes('xls') || t.includes('csv')) return <FileSpreadsheet size={18} color="#10B981" />;
    if (t.includes('png') || t.includes('jpg') || t.includes('image')) return <ImageIcon size={18} color="#F59E0B" />;
    return <FileText size={18} color="#38BDF8" />;
  };

  const filtered = docs.filter((d) => {
    if (filterType !== 'all' && d.document_type !== filterType) return false;
    if (filterSubsidiary !== 'all' && !d.subsidiary?.toLowerCase().includes(filterSubsidiary.toLowerCase())) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        d.filename.toLowerCase().includes(q) ||
        d.subsidiary?.toLowerCase().includes(q) ||
        d.mine_name?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Upload & Ingestion Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>
        <div
          className="glass-panel"
          style={{
            border: '2px dashed var(--border)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem 1.5rem',
            textAlign: 'center',
            cursor: 'pointer',
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
            }}
          />
          <UploadCloud size={36} color="#38BDF8" style={{ marginBottom: '0.75rem' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            Upload Mine Reports, Geological Logs or Core Drilling Sheets
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Supports PDF, DOCX, XLSX, CSV, PNG, and JPG. Multi-modal OCR parsing with automated table extraction.
          </p>

          {uploading && (
            <div style={{ width: '100%', maxWidth: '300px', marginTop: '1rem' }}>
              <div style={{ background: 'rgba(51,65,85,0.5)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${uploadPct}%`, background: '#38BDF8', height: '100%', transition: 'width 0.2s' }} />
              </div>
              <div style={{ fontSize: '0.75rem', color: '#38BDF8', marginTop: '0.35rem' }}>Processing & OCR OCRizing {uploadPct}%...</div>
            </div>
          )}
        </div>

        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>Dataset Ingestion</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Populate knowledge store with authoritative CIL subsidiary documents, scanned inspection logs, and contractor billing statements.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FileCheck size={14} color="#10B981" />
                <span>Multi-format: PDF, XLSX, DOCX, Degraded PNG</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Cpu size={14} color="#A855F7" />
                <span>Tesseract + PaddleOCR bilingual Hindi extraction</span>
              </div>
            </div>
          </div>

          <button id="bulk-ingest-button" className="btn btn-secondary" style={{ width: '100%', marginTop: '1rem' }} onClick={handleBulkIngest}>
            <RefreshCw size={14} />
            <span>Re-Index Full Dataset</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          <input
            id="doc-search-input"
            type="text"
            className="form-input"
            placeholder="Search by filename, subsidiary, mine..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '260px' }}
          />

          <select className="form-select" value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ width: '160px' }}>
            <option value="all">All Document Types</option>
            <option value="Production">Production</option>
            <option value="Geological">Geological</option>
            <option value="Inspection">Inspection</option>
            <option value="Safety">Safety</option>
            <option value="Environmental">Environmental</option>
          </select>

          <select className="form-select" value={filterSubsidiary} onChange={(e) => setFilterSubsidiary(e.target.value)} style={{ width: '200px' }}>
            <option value="all">All Subsidiaries</option>
            <option value="Northern">Northern Coalfields (NCSL)</option>
            <option value="Eastern">Eastern Mining (EMSL)</option>
            <option value="Central">Central Collieries (CCSL)</option>
          </select>
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Showing <strong>{filtered.length}</strong> of {docs.length} documents
        </div>
      </div>

      {/* Document Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Document Name</th>
              <th>Category</th>
              <th>Subsidiary & Mine</th>
              <th>Year / Period</th>
              <th>OCR Engine</th>
              <th>OCR Conf.</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Loading documents...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No documents match the current filters.
                </td>
              </tr>
            ) : (
              filtered.map((d) => (
                <tr key={d.id} id={`doc-row-${d.id}`}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      {getFileIcon(d.file_type)}
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{d.filename}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{d.page_count} pages • {d.file_type.toUpperCase()}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-info">{d.document_type || 'General'}</span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>{d.subsidiary}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{d.mine_name}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.82rem' }}>{d.report_year}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{d.report_period}</div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                      {d.ocr_engine || 'digital'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          color: d.avg_ocr_confidence >= 95 ? '#34D399' : d.avg_ocr_confidence >= 85 ? '#FBBF24' : '#FB7185',
                        }}
                      >
                        {d.avg_ocr_confidence.toFixed(1)}%
                      </span>
                      {d.has_low_confidence_pages && (
                        <span title="Contains degraded / low confidence pages" style={{ display: 'inline-flex' }}>
                          <AlertCircle size={13} color="#FBBF24" />
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    {d.status === 'flagged' ? (
                      <span className="badge badge-warning">Flagged Conflict</span>
                    ) : (
                      <span className="badge badge-success">Processed</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSelectedDoc(d)}
                        title="View Document Details & Snippet"
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(d.id)}
                        title="Delete Document"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Document Detail / Snippet Modal */}
      {selectedDoc && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1.5rem' }}>
          <div className="glass-panel animate-in" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{selectedDoc.filename}</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{selectedDoc.subsidiary} • {selectedDoc.report_year}</p>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setSelectedDoc(null)}>✕ Close</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Document ID</div>
                <div style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>{selectedDoc.id}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>OCR Engine & Confidence</div>
                <div style={{ fontSize: '0.85rem' }}>{selectedDoc.ocr_engine} ({selectedDoc.avg_ocr_confidence}%)</div>
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Extracted Content Snippet</div>
              <div style={{ background: 'rgba(15,23,42,0.8)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                {selectedDoc.content_snippet || 'No text snippet available.'}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <button className="btn btn-primary btn-sm" onClick={() => setSelectedDoc(null)}>Close View</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

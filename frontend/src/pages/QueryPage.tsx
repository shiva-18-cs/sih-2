import React, { useState, useEffect } from 'react';
import { askQuery, getQueryHistory } from '../services/api';
import type { QueryResult, SourceCitation } from '../types';
import { Search, Sparkles, AlertTriangle, CheckCircle2, Clock, FileText, ChevronRight, X, History } from 'lucide-react';

const SUBSIDIARIES = [
  '', 'Northern Coalfields Sample Ltd', 'Eastern Mining Sample Ltd', 'Central Collieries Sample Ltd',
];
const DOC_TYPES = ['', 'Production', 'Geological', 'Inspection', 'Administrative', 'Parliamentary'];
const YEARS = ['', '2021', '2022', '2023', '2024', '2025'];

const EXAMPLE_QUERIES = [
  'What was the total coal production of NCSL in 2024?',
  'Compare overburden removal across all three subsidiaries for 2023.',
  'What are the coal seam details reported in EMSL geological surveys?',
  'Summarize the safety violations and accident records for 2022.',
  'What is the total mineral reserve estimate for CCSL mines?',
];

export default function QueryPage() {
  const [queryText, setQueryText] = useState('');
  const [subsidiary, setSubsidiary] = useState('');
  const [year, setYear] = useState('');
  const [docType, setDocType] = useState('');
  const [result, setResult] = useState<QueryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    getQueryHistory(10).then(setHistory).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryText.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await askQuery({
        query_text: queryText,
        subsidiary_filter: subsidiary || undefined,
        year_filter: year ? parseInt(year) : undefined,
        doc_type_filter: docType || undefined,
      });
      setResult(res);
      // Refresh history
      getQueryHistory(10).then(setHistory).catch(() => {});
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Query failed. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <div className="page-title-icon" style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)' }}>
              <Sparkles size={22} color="#A855F7" />
            </div>
            AI Query
          </h1>
          <p className="page-desc">Ask questions about geological, mining, production and administrative reports.</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => setShowHistory(!showHistory)}>
          <History size={14} /> {showHistory ? 'Hide' : 'Show'} History
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: showHistory ? '1fr 340px' : '1fr', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Query Form */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Your Question</label>
                <textarea
                  className="form-textarea"
                  id="query-input"
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                  placeholder="e.g. What was the coal production for NCSL in 2024?"
                  style={{ minHeight: 80 }}
                />
              </div>

              {/* Filters */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Subsidiary</label>
                  <select className="form-select" value={subsidiary} onChange={(e) => setSubsidiary(e.target.value)}>
                    {SUBSIDIARIES.map((s) => <option key={s} value={s}>{s || 'All Subsidiaries'}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Year</label>
                  <select className="form-select" value={year} onChange={(e) => setYear(e.target.value)}>
                    {YEARS.map((y) => <option key={y} value={y}>{y || 'All Years'}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Document Type</label>
                  <select className="form-select" value={docType} onChange={(e) => setDocType(e.target.value)}>
                    {DOC_TYPES.map((t) => <option key={t} value={t}>{t || 'All Types'}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn btn-primary" disabled={loading || !queryText.trim()} id="query-submit">
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                      Searching knowledge base...
                    </span>
                  ) : (<><Search size={16} /> Ask Question</>)}
                </button>
                {queryText && (
                  <button type="button" className="btn btn-secondary" onClick={() => { setQueryText(''); setResult(null); setError(null); }}>
                    <X size={14} /> Clear
                  </button>
                )}
              </div>
            </form>

            {/* Example queries */}
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(51,65,85,0.4)' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '0.5rem', fontWeight: 600 }}>Example questions:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {EXAMPLE_QUERIES.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setQueryText(q)}
                    style={{ background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.18)', borderRadius: 6, padding: '0.25rem 0.6rem', fontSize: '0.75rem', color: '#94A3B8', cursor: 'pointer', transition: 'all 0.15s ease' }}
                    onMouseOver={e => (e.currentTarget.style.background = 'rgba(56,189,248,0.12)')}
                    onMouseOut={e => (e.currentTarget.style.background = 'rgba(56,189,248,0.06)')}
                  >
                    {q.length > 60 ? q.slice(0, 57) + '...' : q}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="alert alert-error">
              <AlertTriangle size={16} /><span>{error}</span>
            </div>
          )}

          {/* Result */}
          {result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} className="animate-in">
              {/* Answer metadata */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <span className={`badge ${result.is_insufficient_evidence ? 'badge-amber' : 'badge-emerald'}`}>
                  {result.is_insufficient_evidence ? '⚠ Insufficient Evidence' : '✓ Grounded Answer'}
                </span>
                <span className="badge badge-blue">
                  <Clock size={11} /> {result.latency_ms}ms
                </span>
                <span className="badge badge-gray">
                  <FileText size={11} /> {result.retrieved_chunks_count} chunks searched
                </span>
                <span className="badge badge-indigo">
                  {result.sources.length} source(s) cited
                </span>
              </div>

              {/* Answer text */}
              <div className={`answer-block ${result.is_insufficient_evidence ? 'insufficient' : ''}`}>
                {result.answer}
              </div>

              {/* Source citations */}
              {result.sources.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Source Citations ({result.sources.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {result.sources.map((src, i) => (
                      <div key={i} className="citation-card">
                        <div className="citation-header">
                          <FileText size={13} />
                          [{i + 1}] {src.document_name} — Page {src.page_no}
                          {src.metric_tag && <span className="badge badge-indigo" style={{ fontSize: '0.6rem', marginLeft: 'auto' }}>{src.metric_tag}</span>}
                          {(src.similarity || src.similarity_score) && (
                            <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: '#64748B' }}>
                              sim: {((src.similarity || src.similarity_score) || 0).toFixed(3)}
                            </span>
                          )}
                        </div>
                        <div className="citation-snippet">{src.snippet || src.snippet}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* History Panel */}
        {showHistory && (
          <div className="glass-panel" style={{ padding: '1.25rem', height: 'fit-content' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <History size={15} /> Recent Queries
            </h3>
            {history.length === 0 ? (
              <div style={{ color: '#64748B', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>No query history yet</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {history.map((h: any, i) => (
                  <div
                    key={i}
                    className="glass-card"
                    style={{ cursor: 'pointer', padding: '0.75rem' }}
                    onClick={() => setQueryText(h.query_text)}
                  >
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {h.query_text}
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <span className={`badge ${h.is_insufficient_evidence ? 'badge-amber' : 'badge-emerald'}`} style={{ fontSize: '0.6rem' }}>
                        {h.is_insufficient_evidence ? 'No Evidence' : 'Answered'}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#64748B' }}>{new Date(h.created_at).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

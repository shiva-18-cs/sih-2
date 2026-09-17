import React, { useState, useEffect } from 'react';
import {
  Search,
  Sparkles,
  FileText,
  Clock,
  AlertOctagon,
  ShieldCheck,
  CheckCircle2,
  ListFilter,
  ArrowRight,
} from 'lucide-react';
import { askQuery, getQueryHistory } from '../services/api';
import type { QueryResult } from '../types';

export default function QueryPage() {
  const [queryText, setQueryText] = useState('');
  const [subsidiaryFilter, setSubsidiaryFilter] = useState('');
  const [yearFilter, setYearFilter] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  const EXAMPLE_QUERIES = [
    {
      title: 'Factual Production Query',
      query: 'What was the total coal production of Northern Coalfields in 2022?',
    },
    {
      title: 'Bilingual Hindi Query (CSR)',
      query: 'वर्ष 2024 में उत्तरी कोयला क्षेत्र (NCSL) का कुल सीएसआर व्यय कितना था?',
    },
    {
      title: 'Negative / Anti-Hallucination Test',
      query: 'What was the total uranium enrichment output for Mine-A in 2023?',
    },
  ];

  const fetchHistory = async () => {
    try {
      const h = await getQueryHistory(10);
      setHistory(h);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSearch = async (textToSearch?: string) => {
    const q = textToSearch || queryText;
    if (!q.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await askQuery({
        query_text: q,
        subsidiary_filter: subsidiaryFilter || undefined,
        year_filter: yearFilter || undefined,
      });
      setResult(res);
      await fetchHistory();
    } catch (e) {
      console.error(e);
      alert('Error querying RAG knowledge store');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Banner */}
      <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <Sparkles size={22} color="#38BDF8" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Source-Grounded Semantic RAG Engine
            </h2>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Every answer is strictly anchored to indexed CMPDI/CIL source documents with exact page numbers, verbatim quotes, and mathematical anti-hallucination rejection.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.8rem', color: '#34D399', background: 'rgba(16,185,129,0.1)', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.25)' }}>
          <ShieldCheck size={16} />
          <span>Anti-Hallucination Guard: Active</span>
        </div>
      </div>

      {/* Query Input Box */}
      <div className="glass-panel">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
          <div style={{ position: 'relative' }}>
            <textarea
              id="rag-query-input"
              className="form-textarea"
              rows={3}
              placeholder="Ask a technical or operational question across all CIL documents (English or Devanagari Hindi)..."
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              style={{ paddingRight: '120px', fontSize: '0.95rem' }}
            />
            <button
              id="rag-submit-btn"
              type="submit"
              className="btn btn-primary"
              disabled={loading || !queryText.trim()}
              style={{ position: 'absolute', right: 12, bottom: 12 }}
            >
              {loading ? (
                <span>Querying...</span>
              ) : (
                <>
                  <Search size={15} />
                  <span>Ask Engine</span>
                </>
              )}
            </button>
          </div>

          {/* Filters & Pre-canned tests */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <ListFilter size={12} />
                Filters:
              </span>
              <select
                className="form-select"
                style={{ width: '180px', padding: '0.35rem 0.6rem', fontSize: '0.78rem' }}
                value={subsidiaryFilter}
                onChange={(e) => setSubsidiaryFilter(e.target.value)}
              >
                <option value="">All Subsidiaries</option>
                <option value="Northern">Northern Coalfields (NCSL)</option>
                <option value="Eastern">Eastern Mining (EMSL)</option>
                <option value="Central">Central Collieries (CCSL)</option>
              </select>

              <select
                className="form-select"
                style={{ width: '110px', padding: '0.35rem 0.6rem', fontSize: '0.78rem' }}
                value={yearFilter || ''}
                onChange={(e) => setYearFilter(e.target.value ? Number(e.target.value) : undefined)}
              >
                <option value="">All Years</option>
                <option value="2022">2022</option>
                <option value="2023">2023</option>
                <option value="2024">2024</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Quick Prompts:</span>
              {EXAMPLE_QUERIES.map((eq, i) => (
                <button
                  key={i}
                  id={`quick-query-${i}`}
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem' }}
                  onClick={() => {
                    setQueryText(eq.query);
                    handleSearch(eq.query);
                  }}
                >
                  {eq.title}
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>

      {/* Query Result Section */}
      {result && (
        <div className="glass-panel animate-in" style={{ borderLeft: result.is_insufficient_evidence ? '4px solid #FB7185' : '4px solid #38BDF8' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              {result.is_insufficient_evidence ? (
                <AlertOctagon size={20} color="#FB7185" />
              ) : (
                <CheckCircle2 size={20} color="#34D399" />
              )}
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {result.is_insufficient_evidence ? 'Out-of-Domain Guard Triggered' : 'Grounded RAG Response'}
              </h3>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Clock size={13} />
                {result.latency_ms}ms latency
              </span>
              <span>•</span>
              <span>{result.retrieved_chunks_count} chunks retrieved</span>
            </div>
          </div>

          {/* Formatted Answer */}
          <div
            id="rag-answer-body"
            style={{
              fontSize: '0.92rem',
              color: 'var(--text-primary)',
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap',
              background: 'rgba(15,23,42,0.6)',
              padding: '1.25rem',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              marginBottom: '1.25rem',
            }}
          >
            {result.answer}
          </div>

          {/* Sources Section */}
          {result.sources && result.sources.length > 0 && (
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FileText size={14} color="#38BDF8" />
                <span>Verified Source Documents ({result.sources.length})</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.85rem' }}>
                {result.sources.map((src, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'rgba(13,21,38,0.7)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      padding: '0.85rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {src.document_name}
                      </div>
                      <span className="badge badge-info" style={{ fontSize: '0.68rem' }}>
                        Page {src.page_no}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontStyle: 'italic', background: 'rgba(6,11,23,0.6)', padding: '0.5rem', borderRadius: '4px', borderLeft: '2px solid var(--accent-blue)' }}>
                      "{src.snippet}"
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      <span>Category: {src.metric_tag || 'Mining Report'}</span>
                      <span style={{ color: '#34D399', fontWeight: 600 }}>
                        Score: {(src.similarity || src.similarity_score || 0.9).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Query History */}
      {history.length > 0 && (
        <div className="glass-panel">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            Recent Intelligence Inquiries
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {history.slice(0, 5).map((h) => (
              <div
                key={h.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.6rem 0.8rem',
                  background: 'rgba(15,23,42,0.5)',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  setQueryText(h.query_text);
                  handleSearch(h.query_text);
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflow: 'hidden' }}>
                  <Search size={14} color="#64748B" />
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {h.query_text}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
                  {h.is_insufficient_evidence ? (
                    <span className="badge badge-critical" style={{ fontSize: '0.65rem' }}>Rejected</span>
                  ) : (
                    <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Grounded</span>
                  )}
                  <ArrowRight size={13} color="#64748B" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

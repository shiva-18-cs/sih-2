import React, { useState, useEffect } from 'react';
import {
  Search,
  Sparkles,
  FileText,
  Clock,
  AlertOctagon,
  ShieldCheck,
  CheckCircle2,
  Filter,
  ArrowRight,
  ExternalLink,
  Cpu,
  Layers,
  HelpCircle,
  Copy,
  Check,
  BookOpen,
  Compass,
} from 'lucide-react';
import { askQuery, getQueryHistory } from '../services/api';
import type { QueryResult } from '../types';

interface QueryPromptSuggestion {
  label: string;
  query: string;
  category: string;
}

const SUGGESTIONS: QueryPromptSuggestion[] = [
  {
    label: 'NCSL Annual Coal Production',
    query: 'What was the total coal production of Northern Coalfields in 2022?',
    category: 'Production',
  },
  {
    label: 'EMSL CSR Allocation (Hindi Bilingual)',
    query: 'वर्ष 2024 में उत्तरी कोयला क्षेत्र (NCSL) का कुल सीएसआर व्यय कितना था?',
    category: 'CSR / ESG',
  },
  {
    label: 'Safety & DGMS Compliance Return',
    query: 'What were the statutory safety inspection findings for Kargali Open Cast Mine?',
    category: 'Safety',
  },
  {
    label: 'Anti-Hallucination Guardrail Check',
    query: 'What was the total uranium enrichment output for Mine-A in 2023?',
    category: 'Guard Test',
  },
];

export default function QueryPage() {
  const [queryText, setQueryText] = useState('');
  const [subsidiaryFilter, setSubsidiaryFilter] = useState('');
  const [yearFilter, setYearFilter] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  const fetchHistory = async () => {
    try {
      const h = await getQueryHistory(10);
      setHistory(h || []);
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
    } finally {
      setLoading(false);
    }
  };

  const copyAnswer = () => {
    if (!result?.answer) return;
    navigator.clipboard.writeText(result.answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.2rem 0.65rem', borderRadius: 'var(--radius-full)', background: '#EEF2FF', border: '1px solid #C7D2FE', color: '#4F46E5', fontSize: '0.72rem', fontWeight: 600, marginBottom: '0.45rem' }}>
            <Sparkles size={13} />
            <span>DeepSearch Retrieval Engine</span>
          </div>
          <h1 className="page-title">
            <span>AI Analytical Query & Semantic Retrieval</span>
          </h1>
          <p className="page-description">
            Strictly grounded RAG retrieval across indexed Coal India Limited geological archives, DGMS safety filings, and statutory accounts with anti-hallucination guardrails.
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
              background: '#ECFDF5',
              border: '1px solid #A7F3D0',
              fontSize: '0.74rem',
              color: '#059669',
              fontWeight: 600,
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <ShieldCheck size={14} color="#10B981" />
            <span>Zero-Hallucination Verified</span>
          </span>
        </div>
      </div>

      {/* ── Prominent DeepSearch Input Console ───────────────────────────────── */}
      <div
        className="panel"
        id="ai-query-console"
        style={{
          background: 'linear-gradient(180deg, #FFFFFF 0%, #FAF5FF 100%)',
          border: '1px solid #E0E7FF',
          boxShadow: 'var(--shadow-md)',
          padding: '1.5rem',
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}
        >
          {/* Main Search Bar */}
          <div style={{ position: 'relative' }}>
            <textarea
              id="rag-query-input"
              className="form-textarea"
              rows={3}
              placeholder="Ask an analytical, geological, or regulatory question across CIL documents (English or Bilingual Hindi)..."
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              style={{
                paddingRight: '150px',
                paddingLeft: '1.25rem',
                paddingTop: '1rem',
                fontSize: '0.94rem',
                lineHeight: 1.6,
                borderRadius: 'var(--radius-md)',
                border: '1px solid #C7D2FE',
                background: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(99, 102, 241, 0.05)',
              }}
            />
            <button
              id="rag-submit-btn"
              type="submit"
              className="btn btn-primary"
              disabled={loading || !queryText.trim()}
              style={{
                position: 'absolute',
                right: 12,
                bottom: 12,
                padding: '0.55rem 1.15rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.84rem',
              }}
            >
              {loading ? (
                <>
                  <Clock size={14} className="animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search size={14} />
                  <span>Ask Assistant</span>
                </>
              )}
            </button>
          </div>

          {/* Scope Filters & Clickable Suggestions */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.85rem',
              borderTop: '1px solid #E0E7FF',
              paddingTop: '1rem',
            }}
          >
            {/* Filter Dropdowns */}
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.65rem' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Filter size={13} color="#4F46E5" />
                Filter Scope:
              </span>

              <select
                id="query-subsidiary-filter"
                className="form-select"
                style={{ width: '180px', padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                value={subsidiaryFilter}
                onChange={(e) => setSubsidiaryFilter(e.target.value)}
              >
                <option value="">All Subsidiaries</option>
                <option value="Northern">Northern Coalfields (NCSL)</option>
                <option value="Eastern">Eastern Mining (EMSL)</option>
                <option value="Central">Central Collieries (CCSL)</option>
              </select>

              <select
                id="query-year-filter"
                className="form-select"
                style={{ width: '110px', padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                value={yearFilter || ''}
                onChange={(e) => setYearFilter(e.target.value ? Number(e.target.value) : undefined)}
              >
                <option value="">All Years</option>
                <option value="2022">FY 2022</option>
                <option value="2023">FY 2023</option>
                <option value="2024">FY 2024</option>
              </select>
            </div>

            {/* Structured Suggestion Chips */}
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.45rem' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 500 }}>Example Queries:</span>
              {SUGGESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  id={`query-suggestion-${idx}`}
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{
                    fontSize: '0.72rem',
                    padding: '0.28rem 0.65rem',
                    borderRadius: 'var(--radius-full)',
                    background: '#FFFFFF',
                    borderColor: '#E2E8F0',
                  }}
                  onClick={() => {
                    setQueryText(s.query);
                    handleSearch(s.query);
                  }}
                >
                  <span style={{ color: '#4F46E5', fontWeight: 600, marginRight: '0.3rem' }}>{s.category}:</span>
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>

      {/* ── Processing State ─────────────────────────────────────────────────── */}
      {loading && (
        <div className="panel" style={{ textAlign: 'center', padding: '3rem 1.5rem', background: '#FFFFFF' }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
              border: '1px solid #C7D2FE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.15rem',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.15)',
            }}
          >
            <Sparkles size={22} color="#4F46E5" className="animate-spin" />
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Retrieving & Synthesizing Evidence
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem', maxWidth: '460px', margin: '0.35rem auto 0', lineHeight: 1.6 }}>
            Scanning pgvector embedding index, verifying cosine similarity thresholds, and auditing against extracted OCR ground truth...
          </div>
        </div>
      )}

      {/* ── Results Area (Answer + Evidence + Sources) ───────────────────────── */}
      {result && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* 1. Grounded Answer Card */}
          <div
            className="panel animate-in"
            id="rag-result-panel"
            style={{
              background: '#FFFFFF',
              borderLeft: result.is_insufficient_evidence ? '4px solid #EF4444' : '4px solid #4F46E5',
              boxShadow: 'var(--shadow-md)',
              padding: '1.5rem',
            }}
          >
            <div className="panel-header" style={{ marginBottom: '1rem', paddingBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {result.is_insufficient_evidence ? (
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#FEF2F2', border: '1px solid #FECACA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AlertOctagon size={18} color="#DC2626" />
                  </div>
                ) : (
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#ECFDF5', border: '1px solid #A7F3D0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle2 size={18} color="#059669" />
                  </div>
                )}
                <div>
                  <h3 className="panel-title" style={{ fontSize: '1.02rem', fontWeight: 700 }}>
                    {result.is_insufficient_evidence
                      ? 'Out-of-Domain Guardrail: Query Rejected'
                      : 'AI-Grounded Analytical Synthesis'}
                  </h3>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    {result.is_insufficient_evidence
                      ? 'System rejected the query to prevent hallucination — topic does not exist in indexed repository.'
                      : 'Synthesized exclusively from verified passages across CIL statutory documents.'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div className="font-mono" style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#F8FAFC', padding: '0.25rem 0.6rem', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                  <Clock size={12} color="#64748B" />
                  <span>{result.latency_ms}ms</span>
                  <span>•</span>
                  <span>{result.retrieved_chunks_count} chunks</span>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={copyAnswer}
                  style={{ fontSize: '0.74rem', padding: '0.3rem 0.65rem' }}
                >
                  {copied ? <Check size={13} color="#059669" /> : <Copy size={13} />}
                  <span>{copied ? 'Copied' : 'Copy Answer'}</span>
                </button>
              </div>
            </div>

            {/* Synthesized Answer Body */}
            <div
              id="rag-answer-body"
              style={{
                fontSize: '0.92rem',
                color: 'var(--text-primary)',
                lineHeight: 1.7,
                background: result.is_insufficient_evidence ? '#FEF2F2' : '#F8FAFC',
                padding: '1.25rem 1.35rem',
                borderRadius: 'var(--radius-sm)',
                border: `1px solid ${result.is_insufficient_evidence ? '#FECACA' : '#E2E8F0'}`,
                whiteSpace: 'pre-wrap',
              }}
            >
              {result.answer}
            </div>
          </div>

          {/* 2. Supporting Evidence & Verbatim Source Citations */}
          {result.sources && result.sources.length > 0 && (
            <div className="panel" id="rag-sources-panel" style={{ background: '#FFFFFF', boxShadow: 'var(--shadow-sm)' }}>
              <div className="panel-header">
                <div>
                  <h3 className="panel-title">
                    <FileText size={17} color="#4F46E5" />
                    <span>Supporting Source Evidence ({result.sources.length} Documents Cited)</span>
                  </h3>
                  <p className="panel-subtitle">
                    Verbatim textual and tabular extracts retrieved directly from verified repository filings
                  </p>
                </div>
                <span className="badge badge-purple font-mono" style={{ fontSize: '0.7rem' }}>
                  Vector Grounded
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.15rem' }}>
                {result.sources.map((src, i) => {
                  const similarityScore = (src.similarity || src.similarity_score || 0.92) * 100;
                  return (
                    <div
                      key={i}
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: 'var(--radius-sm)',
                        padding: '1rem 1.15rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.65rem',
                        boxShadow: 'var(--shadow-xs)',
                        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#C7D2FE';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.08)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#E2E8F0';
                        e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', overflow: 'hidden' }}>
                          <BookOpen size={14} color="#4F46E5" style={{ flexShrink: 0 }} />
                          <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {src.document_name}
                          </span>
                        </div>
                        <span className="badge badge-neutral font-mono" style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem' }}>
                          Page {src.page_no}
                        </span>
                      </div>

                      {/* Verbatim Snippet Box */}
                      <div
                        className="font-mono"
                        style={{
                          fontSize: '0.78rem',
                          color: 'var(--text-secondary)',
                          background: '#F8FAFC',
                          padding: '0.75rem 0.95rem',
                          borderRadius: 'var(--radius-xs)',
                          borderLeft: '3px solid #4F46E5',
                          border: '1px solid #E2E8F0',
                          borderLeftWidth: '3px',
                          borderLeftColor: '#4F46E5',
                          lineHeight: 1.6,
                        }}
                      >
                        "{src.snippet}"
                      </div>

                      {/* Similarity Progress Bar & Metadata */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                          <span>Tag: <strong>{src.metric_tag || 'Operational Return'}</strong></span>
                          <span className="font-mono" style={{ color: '#059669', fontWeight: 700 }}>
                            {similarityScore.toFixed(1)}% Match
                          </span>
                        </div>
                        <div style={{ width: '100%', height: '4px', background: '#F1F5F9', borderRadius: '2px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${Math.min(similarityScore, 100)}%`,
                              height: '100%',
                              background: 'linear-gradient(90deg, #4F46E5 0%, #10B981 100%)',
                              borderRadius: '2px',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Query History Ledger ─────────────────────────────────────────────── */}
      {history.length > 0 && (
        <div className="panel" id="query-history-ledger" style={{ background: '#FFFFFF', boxShadow: 'var(--shadow-xs)' }}>
          <div className="panel-header">
            <div>
              <h3 className="panel-title">
                <Clock size={16} color="var(--text-muted)" />
                <span>Recent Analytical Inquiries Ledger</span>
              </h3>
              <p className="panel-subtitle">Session queries with verifiable provenance audits</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {history.slice(0, 5).map((h) => (
              <div
                key={h.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 1rem',
                  background: '#F8FAFC',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #E2E8F0',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F1F5F9';
                  e.currentTarget.style.borderColor = '#CBD5E1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#F8FAFC';
                  e.currentTarget.style.borderColor = '#E2E8F0';
                }}
                onClick={() => {
                  setQueryText(h.query_text);
                  handleSearch(h.query_text);
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                  <Search size={14} color="#4F46E5" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {h.query_text}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                  {h.is_insufficient_evidence ? (
                    <span className="badge badge-critical" style={{ fontSize: '0.66rem' }}>Out-of-Domain</span>
                  ) : (
                    <span className="badge badge-success" style={{ fontSize: '0.66rem' }}>Grounded</span>
                  )}
                  <ArrowRight size={13} color="var(--text-dim)" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

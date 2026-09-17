import React, { useState, useEffect } from 'react';
import { Layers, Hash, FileText, Database, Sparkles } from 'lucide-react';
import { getTopics } from '../services/api';
import type { TopicWord } from '../types';

export default function TopicsPage() {
  const [words, setWords] = useState<TopicWord[]>([]);
  const [totalDocs, setTotalDocs] = useState(0);
  const [totalChunks, setTotalChunks] = useState(0);
  const [docBreakdown, setDocBreakdown] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [subsidiary, setSubsidiary] = useState('');
  const [year, setYear] = useState<number | undefined>(undefined);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const data = await getTopics(subsidiary || undefined, year);
      setWords(data.words || []);
      setTotalDocs(data.total_docs || 0);
      setTotalChunks(data.total_chunks || 0);
      setDocBreakdown(data.document_type_breakdown || {});
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, [subsidiary, year]);

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Banner */}
      <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <Layers size={22} color="#A855F7" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Domain Taxonomy & Mining Topic Frequency
            </h2>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Automated term frequency-inverse document frequency (TF-IDF) & semantic clustering across technical mining literature.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <select
            className="form-select"
            style={{ width: '200px', fontSize: '0.8rem' }}
            value={subsidiary}
            onChange={(e) => setSubsidiary(e.target.value)}
          >
            <option value="">All Subsidiaries</option>
            <option value="Northern">Northern Coalfields (NCSL)</option>
            <option value="Eastern">Eastern Mining (EMSL)</option>
            <option value="Central">Central Collieries (CCSL)</option>
          </select>

          <select
            className="form-select"
            style={{ width: '120px', fontSize: '0.8rem' }}
            value={year || ''}
            onChange={(e) => setYear(e.target.value ? Number(e.target.value) : undefined)}
          >
            <option value="">All Years</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
          </select>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Indexed Documents</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38BDF8' }}>{totalDocs}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Full technical corpus</div>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Embedded Semantic Chunks</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#818CF8' }}>{totalChunks}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Chunk size: 500 tokens (50 overlap)</div>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Key Industry Terms</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#A855F7' }}>{words.length}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Ranked by domain relevance</div>
        </div>
      </div>

      {/* Cloud & Term Visualizer */}
      <div className="glass-panel">
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Sparkles size={16} color="#A855F7" />
          <span>Extracted Technical Lexicon & Weighting</span>
        </h3>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Calculating domain keyword frequencies...
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', padding: '1rem', background: 'rgba(15,23,42,0.6)', borderRadius: '10px', border: '1px solid var(--border)' }}>
            {words.map((w, i) => {
              const fontSize = Math.max(0.8, Math.min(1.4, 0.75 + w.weight * 0.7));
              const opacity = Math.max(0.6, Math.min(1, 0.4 + w.weight * 0.6));
              return (
                <div
                  key={i}
                  style={{
                    padding: '0.4rem 0.75rem',
                    background: 'rgba(13,21,38,0.8)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Hash size={12} color="#38BDF8" style={{ opacity }} />
                  <span style={{ fontSize: `${fontSize}rem`, fontWeight: 600, color: '#F1F5F9', opacity }}>
                    {w.word}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--accent-blue)', background: 'rgba(56,189,248,0.1)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
                    {w.count}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Document Type Distribution */}
      <div className="glass-panel">
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
          Document Category Volume Breakdown
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          {Object.entries(docBreakdown).map(([cat, cnt]) => (
            <div key={cat} style={{ background: 'rgba(15,23,42,0.6)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cat}</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38BDF8', marginTop: '0.25rem' }}>{cnt} docs</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

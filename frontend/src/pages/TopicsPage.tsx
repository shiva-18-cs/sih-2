import React, { useState, useEffect } from 'react';
import { getTopics } from '../services/api';
import type { TopicWord } from '../types';
import { Tag, RefreshCw, Filter, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SUBSIDIARIES = ['', 'Northern Coalfields Sample Ltd', 'Eastern Mining Sample Ltd', 'Central Collieries Sample Ltd'];
const YEARS = ['', '2021', '2022', '2023', '2024', '2025'];

const WORD_COLORS = [
  '#38BDF8', '#818CF8', '#10B981', '#F59E0B', '#A855F7', '#22D3EE', '#FB7185',
  '#34D399', '#FBBF24', '#C084FC', '#60A5FA', '#F472B6', '#4ADE80', '#FCD34D',
];

export default function TopicsPage() {
  const [words, setWords] = useState<TopicWord[]>([]);
  const [totalDocs, setTotalDocs] = useState(0);
  const [totalChunks, setTotalChunks] = useState(0);
  const [typeBreakdown, setTypeBreakdown] = useState<Record<string, number>>({});
  const [subsidiary, setSubsidiary] = useState('');
  const [year, setYear] = useState('');
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'cloud' | 'chart'>('cloud');

  const load = async () => {
    setLoading(true);
    try {
      const data = await getTopics(subsidiary || undefined, year ? parseInt(year) : undefined);
      setWords(data.words || []);
      setTotalDocs(data.total_docs);
      setTotalChunks(data.total_chunks);
      setTypeBreakdown(data.document_type_breakdown || {});
    } catch (e) {
      setWords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [subsidiary, year]);

  const chartData = words.slice(0, 20).map(w => ({ word: w.word, count: Math.round(w.count) }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <div className="page-title-icon" style={{ background: 'rgba(34,211,238,0.12)', border: '1px solid rgba(34,211,238,0.25)' }}>
              <Tag size={22} color="#22D3EE" />
            </div>
            Topic Explorer
          </h1>
          <p className="page-desc">Analyze key topics, terminology, and keyword distributions across ingested documents</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={load}><RefreshCw size={14} /></button>
      </div>

      {/* Filters + View Toggle */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="form-group" style={{ flex: 1, minWidth: 200 }}>
          <label className="form-label">Filter by Subsidiary</label>
          <select className="form-select" value={subsidiary} onChange={(e) => setSubsidiary(e.target.value)}>
            {SUBSIDIARIES.map(s => <option key={s} value={s}>{s || 'All Subsidiaries'}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ minWidth: 130 }}>
          <label className="form-label">Filter by Year</label>
          <select className="form-select" value={year} onChange={(e) => setYear(e.target.value)}>
            {YEARS.map(y => <option key={y} value={y}>{y || 'All Years'}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className={`btn btn-sm ${view === 'cloud' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('cloud')}>
            <Tag size={13} /> Word Cloud
          </button>
          <button className={`btn btn-sm ${view === 'chart' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('chart')}>
            <BarChart2 size={13} /> Bar Chart
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
        <div className="glass-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#22D3EE' }}>{totalDocs}</div>
          <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Documents Analyzed</div>
        </div>
        <div className="glass-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#818CF8' }}>{totalChunks}</div>
          <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Text Chunks</div>
        </div>
        <div className="glass-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#38BDF8' }}>{words.length}</div>
          <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Unique Terms</div>
        </div>
        {Object.entries(typeBreakdown).slice(0, 1).map(([type, count]) => (
          <div key={type} className="glass-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10B981' }}>{count}</div>
            <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Top: {type}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
          Loading topics...
        </div>
      ) : words.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
          <Tag size={36} style={{ margin: '0 auto 1rem', opacity: 0.3, display: 'block' }} />
          <div>No topics available yet.</div>
          <div style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Ingest documents to generate topic analysis.</div>
        </div>
      ) : view === 'cloud' ? (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div className="word-cloud-container">
            {words.map((w, i) => {
              const size = 0.7 + w.weight * 1.8;
              const color = WORD_COLORS[i % WORD_COLORS.length];
              const opacity = 0.5 + w.weight * 0.5;
              return (
                <span
                  key={w.word}
                  className="word-tag"
                  title={`"${w.word}" — frequency: ${w.count.toFixed(1)}`}
                  style={{
                    fontSize: `${size}rem`,
                    color,
                    opacity,
                    background: `${color}18`,
                    border: `1px solid ${color}30`,
                  }}
                >
                  {w.word}
                </span>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Top 20 Terms by Frequency</h2>
          <ResponsiveContainer width="100%" height={380}>
            <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, left: 80, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.3)" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#94A3B8', fontSize: 11 }} />
              <YAxis type="category" dataKey="word" tick={{ fill: '#94A3B8', fontSize: 11 }} width={75} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(51,65,85,0.5)', borderRadius: 8 }} />
              <Bar dataKey="count" fill="#38BDF8" radius={[0, 4, 4, 0]} name="Frequency" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Doc type breakdown */}
      {Object.keys(typeBreakdown).length > 0 && (
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.75rem' }}>Document Type Breakdown</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {Object.entries(typeBreakdown).map(([type, count]) => (
              <div key={type} className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.875rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{count}</span>
                <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{type}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

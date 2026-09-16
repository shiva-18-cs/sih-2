import React, { useState, useEffect } from 'react';
import { getDashboardStats, getProductionTrends, getKPIBenchmark } from '../services/api';
import type { DashboardStats, TrendDataPoint } from '../types';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { FileText, AlertTriangle, FileBarChart2, Search, CheckCircle2, TrendingUp, Database, Cpu, RefreshCw } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trends, setTrends] = useState<TrendDataPoint[]>([]);
  const [kpis, setKpis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, t, k] = await Promise.all([getDashboardStats(), getProductionTrends(), getKPIBenchmark()]);
      setStats(s);
      setTrends(t.trend_data);
      setKpis(k.kpis || []);
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const PIE_COLORS = ['#38BDF8', '#818CF8', '#10B981', '#F59E0B', '#FB7185', '#A855F7'];

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="stat-grid">
        {[...Array(4)].map((_, i) => <div key={i} className="stat-card"><div className="skeleton" style={{ height: 80 }} /></div>)}
      </div>
      <div className="glass-panel" style={{ padding: '2rem', height: 280 }}><div className="skeleton" style={{ height: '100%' }} /></div>
    </div>
  );

  if (error) return <div className="alert alert-error"><AlertTriangle size={18} /><span>{error}</span></div>;
  if (!stats) return null;

  const typeBreakdown = Object.entries(stats.breakdowns.by_document_type).map(([name, value]) => ({ name, value }));
  const subBreakdown = Object.entries(stats.breakdowns.by_subsidiary).map(([name, value]) => ({ name: name.split(' ')[0], value }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <div className="page-title-icon" style={{ background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.25)' }}>
              <TrendingUp size={22} color="#38BDF8" />
            </div>
            Executive Dashboard
          </h1>
          <p className="page-desc">Real-time platform KPIs and intelligence metrics for CMPDI/CIL operations</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={load}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(56,189,248,0.12)' }}>
            <FileText size={20} color="#38BDF8" />
          </div>
          <div className="stat-value" style={{ color: '#38BDF8' }}>{stats.ingestion.total_documents}</div>
          <div className="stat-label">Documents Ingested</div>
          <div className="stat-sub">{stats.ingestion.flagged_documents} flagged (low OCR confidence)</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(251,113,133,0.12)' }}>
            <AlertTriangle size={20} color="#FB7185" />
          </div>
          <div className="stat-value" style={{ color: '#FB7185' }}>{stats.conflicts.open_conflicts}</div>
          <div className="stat-label">Open Conflicts</div>
          <div className="stat-sub">{stats.conflicts.resolved_conflicts} resolved of {stats.conflicts.total_conflicts} total</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.12)' }}>
            <FileBarChart2 size={20} color="#10B981" />
          </div>
          <div className="stat-value" style={{ color: '#10B981' }}>{stats.reports.total_reports}</div>
          <div className="stat-label">Reports Generated</div>
          <div className="stat-sub">{stats.reports.pending_approval} pending approval</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(168,85,247,0.12)' }}>
            <Search size={20} color="#A855F7" />
          </div>
          <div className="stat-value" style={{ color: '#A855F7' }}>{stats.queries.answer_rate_pct}%</div>
          <div className="stat-label">AI Query Answer Rate</div>
          <div className="stat-sub">{stats.queries.total_queries} queries, ~{stats.queries.avg_latency_ms}ms avg</div>
        </div>
      </div>

      {/* Secondary KPIs */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.12)' }}>
            <Database size={20} color="#F59E0B" />
          </div>
          <div className="stat-value" style={{ color: '#F59E0B' }}>{stats.ingestion.embedding_coverage_pct}%</div>
          <div className="stat-label">Embedding Coverage</div>
          <div className="stat-sub">{stats.ingestion.embedded_chunks}/{stats.ingestion.total_chunks} chunks indexed</div>
          <div className="progress-bar" style={{ marginTop: '0.75rem' }}>
            <div className="progress-fill" style={{ width: `${stats.ingestion.embedding_coverage_pct}%` }} />
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(34,211,238,0.12)' }}>
            <Cpu size={20} color="#22D3EE" />
          </div>
          <div className="stat-value" style={{ color: '#22D3EE' }}>{stats.ingestion.avg_ocr_confidence.toFixed(1)}%</div>
          <div className="stat-label">Avg OCR Confidence</div>
          <div className="stat-sub">Across all ingested documents</div>
          <div className="progress-bar" style={{ marginTop: '0.75rem' }}>
            <div className="progress-fill" style={{ width: `${stats.ingestion.avg_ocr_confidence}%`, background: 'linear-gradient(90deg, #22D3EE, #10B981)' }} />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Production Trends */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} color="#38BDF8" /> Coal Production & Overburden Trends (MT / MCM)
          </h2>
          {trends.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={trends} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.3)" />
                <XAxis dataKey="year" tick={{ fill: '#94A3B8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(51,65,85,0.5)', borderRadius: 8 }} labelStyle={{ color: '#F1F5F9' }} itemStyle={{ color: '#94A3B8' }} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#94A3B8' }} />
                <Line type="monotone" dataKey="coal_production_mt" stroke="#38BDF8" strokeWidth={2.5} dot={{ r: 4, fill: '#38BDF8' }} name="Coal Production (MT)" />
                <Line type="monotone" dataKey="overburden_mcm" stroke="#818CF8" strokeWidth={2.5} dot={{ r: 4, fill: '#818CF8' }} name="Overburden (MCM)" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontSize: '0.875rem' }}>
              No production trend data yet. Ingest documents to populate.
            </div>
          )}
        </div>

        {/* Document Type Pie */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Documents by Type</h2>
          {typeBreakdown.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={typeBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {typeBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(51,65,85,0.5)', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.5rem' }}>
                {typeBreakdown.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                    <span style={{ color: '#94A3B8', flex: 1 }}>{item.name}</span>
                    <span style={{ fontWeight: 700 }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontSize: '0.875rem', textAlign: 'center' }}>
              No documents yet.<br />Use "Documents" to ingest reports.
            </div>
          )}
        </div>
      </div>

      {/* Subsidiary Bar Chart */}
      {subBreakdown.length > 0 && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Documents per Subsidiary</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={subBreakdown} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.3)" />
              <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(51,65,85,0.5)', borderRadius: 8 }} />
              <Bar dataKey="value" fill="#38BDF8" radius={[4, 4, 0, 0]} name="Documents" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* KPI Benchmark */}
      {kpis.length > 0 && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={18} color="#10B981" /> KPI Benchmark vs. Targets
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            {kpis.map((kpi, i) => {
              const isOnTrack = kpi.status === 'on_track';
              const pct = kpi.unit === '%' ? kpi.value : Math.min(100, (kpi.value / Math.max(kpi.target, 1)) * 100);
              return (
                <div key={i} className="glass-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 500 }}>{kpi.metric}</span>
                    <span className={`badge ${isOnTrack ? 'badge-emerald' : 'badge-amber'}`} style={{ fontSize: '0.6rem' }}>
                      {isOnTrack ? '✓ On Track' : '⚠ Below'}
                    </span>
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: isOnTrack ? '#10B981' : '#F59E0B' }}>
                    {kpi.value}{kpi.unit}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', marginBottom: '0.5rem' }}>Target: {kpi.target}{kpi.unit}</div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${Math.min(100, pct)}%`, background: isOnTrack ? 'linear-gradient(90deg, #10B981, #22D3EE)' : 'linear-gradient(90deg, #F59E0B, #FB7185)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

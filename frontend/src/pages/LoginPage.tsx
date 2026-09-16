import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Layers, User, Lock, AlertTriangle, ChevronRight, ShieldCheck } from 'lucide-react';

const ENTERPRISE_ROLES = [
  { username: 'coordinator', role: 'Project Coordinator', badge: 'badge-blue' },
  { username: 'director', role: 'Director / Senior Officer', badge: 'badge-violet' },
  { username: 'auditor', role: 'Auditor', badge: 'badge-emerald' },
  { username: 'admin', role: 'Administrator', badge: 'badge-rose' },
  { username: 'agency', role: 'Implementation Agency', badge: 'badge-amber' },
];

const ROLE_PASSWORDS: Record<string, string> = {
  coordinator: 'coord123',
  director: 'direct123',
  auditor: 'audit123',
  admin: 'admin123',
  agency: 'agency123',
};

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('coordinator');
  const [password, setPassword] = useState('coord123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(username, password);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRole = (u: string) => {
    setUsername(u);
    setPassword(ROLE_PASSWORDS[u] || 'coord123');
  };

  return (
    <div className="login-bg">
      <div style={{ width: '100%', maxWidth: 960, display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '2.5rem', alignItems: 'center' }}>
        
        {/* Left panel - branding & capabilities */}
        <div style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '2rem' }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg, #0284C7, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(37,99,235,0.4)' }}>
              <Layers size={28} color="white" />
            </div>
            <div>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, background: 'linear-gradient(135deg, #38BDF8, #818CF8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                CMPDI / CIL
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 500 }}>
                Geological & Mining Intelligence Platform
              </div>
            </div>
          </div>
          
          <h1 style={{ fontSize: '2.1rem', fontWeight: 900, lineHeight: 1.25, marginBottom: '1rem', letterSpacing: '-0.03em' }}>
            Enterprise Geological &<br />
            <span style={{ background: 'linear-gradient(135deg, #38BDF8, #818CF8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Mining Reporting Solution
            </span>
          </h1>
          
          <p style={{ color: '#94A3B8', fontSize: '0.92rem', lineHeight: 1.7, marginBottom: '2rem' }}>
            Centralized document intelligence, multi-engine OCR parsing, cross-document verification, and automated reporting for coal subsidiaries.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { title: 'Source-Grounded AI Query', desc: 'Precision retrieval with exact page citations and provenance' },
              { title: 'Multi-Modal Ingestion & OCR', desc: 'Automated processing of PDF, DOCX, XLSX, and scanned logs' },
              { title: 'Automated Discrepancy Detection', desc: 'Cross-document verification and audit resolution workflows' },
              { title: 'Role-Based Governance', desc: 'Strict RBAC controls and immutable chronological audit logs' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#38BDF8', marginTop: '0.45rem', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#F1F5F9' }}>{item.title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel - authentication form */}
        <div className="login-card">
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.35rem' }}>Sign In to Platform</h2>
            <p style={{ fontSize: '0.82rem', color: '#64748B' }}>Enter your authorized credentials to access your workspace</p>
          </div>

          {/* Role selector */}
          <div style={{ marginBottom: '1.5rem', background: 'rgba(15,23,42,0.6)', padding: '0.85rem', borderRadius: 10, border: '1px solid rgba(51,65,85,0.4)' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94A3B8', marginBottom: '0.6rem' }}>
              Select Role Profile
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {ENTERPRISE_ROLES.map((u) => {
                const isSelected = username === u.username;
                return (
                  <button
                    key={u.username}
                    type="button"
                    onClick={() => handleSelectRole(u.username)}
                    className={`badge ${u.badge}`}
                    style={{
                      cursor: 'pointer',
                      fontSize: '0.72rem',
                      padding: '0.3rem 0.6rem',
                      border: isSelected ? '1.5px solid currentColor' : '1px solid transparent',
                      opacity: isSelected ? 1 : 0.6,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {u.role}
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
                <input
                  id="login-username"
                  className="form-input"
                  style={{ paddingLeft: '2.25rem' }}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
                <input
                  id="login-password"
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: '2.25rem' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="alert alert-error">
                <AlertTriangle size={16} />
                <span>{error}</span>
              </div>
            )}

            <button
              id="login-submit"
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                  Authenticating...
                </span>
              ) : (
                <>Sign In <ChevronRight size={16} /></>
              )}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '0.5rem', fontSize: '0.75rem', color: '#64748B' }}>
              <ShieldCheck size={13} color="#10B981" />
              <span>Secure access for authorized personnel</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

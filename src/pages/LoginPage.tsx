import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Shield, KeyRound, ArrowRight, Check } from 'lucide-react';

export default function LoginPage() {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('coordinator');
  const [password, setPassword] = useState('demo123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const DEMO_ACCOUNTS = [
    { username: 'coordinator', role: 'Project Coordinator', desc: 'Manage ingestion, run conflict detection & draft reports' },
    { username: 'director', role: 'Director / Senior Officer', desc: 'High-level approval, statutory reviews & sign-offs' },
    { username: 'admin', role: 'Administrator', desc: 'Full system configuration, user management & master overrides' },
    { username: 'auditor', role: 'Auditor', desc: 'Statutory audit trail inspection & verification rights' },
    { username: 'agency', role: 'Implementation Agency', desc: 'Document uploading & multi-engine OCR monitoring' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const selectAccount = (u: string) => {
    setUsername(u);
    setPassword('demo123');
    setError(null);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at top, #0D1B2A 0%, #060B17 100%)', padding: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: '460px' }} className="glass-panel animate-in">
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--gradient-hero)', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-glow-blue)' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>CMPDI / CIL Intelligence</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Geological, Mining & Statutory Report Intelligence</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(225,29,72,0.15)', border: '1px solid rgba(225,29,72,0.3)', color: '#FB7185', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.75rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Username</label>
            <input
              id="login-username-input"
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password-input"
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <KeyRound size={16} style={{ position: 'absolute', right: 12, top: 12, color: '#64748B' }} />
            </div>
          </div>

          <button
            id="login-submit-button"
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Platform'}
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Shield size={13} />
            <span>Select Demonstration Role (1-Click)</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.username}
                id={`demo-user-${acc.username}`}
                type="button"
                onClick={() => selectAccount(acc.username)}
                style={{
                  textAlign: 'left',
                  padding: '0.6rem 0.8rem',
                  borderRadius: '8px',
                  background: username === acc.username ? 'rgba(56,189,248,0.12)' : 'rgba(15,23,42,0.5)',
                  border: `1px solid ${username === acc.username ? 'rgba(56,189,248,0.3)' : 'var(--border)'}`,
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: username === acc.username ? 'var(--accent-blue)' : 'var(--text-primary)' }}>
                    {acc.role} <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>({acc.username})</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
                    {acc.desc}
                  </div>
                </div>
                {username === acc.username && <Check size={16} color="#38BDF8" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

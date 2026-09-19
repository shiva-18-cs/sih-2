import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Shield, KeyRound, ArrowRight, Check, Lock, Layers, CheckCircle2 } from 'lucide-react';

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
    await performLogin(username, password);
  };

  const performLogin = async (u: string, p: string) => {
    setError(null);
    setLoading(true);
    try {
      await login(u, p);
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

  const quickSignInAs = async (u: string) => {
    setUsername(u);
    setPassword('demo123');
    await performLogin(u, 'demo123');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F3F4F9',
        padding: '2rem 1.5rem',
        backgroundImage: 'radial-gradient(at 0% 0%, #EEF2FF 0, transparent 50%), radial-gradient(at 100% 100%, #E0E7FF 0, transparent 50%)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '500px',
          background: '#FFFFFF',
          borderRadius: 'var(--radius-md)',
          border: '1px solid #E2E8F0',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
          padding: '2.25rem',
        }}
        className="animate-in"
      >
        {/* Emblem & Branding Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(135deg, #4F46E5 0%, #3730A3 100%)',
              margin: '0 auto 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
              color: '#FFFFFF',
            }}
          >
            <Layers size={26} />
          </div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.35rem' }}>
            CMPDI / CIL Geological & Mining Intelligence
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Central Mine Planning & Design Institute • Secure Repository
          </p>
        </div>

        {error && (
          <div
            style={{
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#DC2626',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-xs)',
              fontSize: '0.82rem',
              marginBottom: '1.25rem',
            }}
          >
            {error}
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Username
            </label>
            <input
              id="login-username-input"
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{ background: '#FFFFFF', fontSize: '0.86rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password-input"
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ background: '#FFFFFF', fontSize: '0.86rem' }}
              />
              <KeyRound size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <button
            id="login-submit-button"
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '0.75rem 1.25rem', marginTop: '0.5rem', justifyContent: 'center', fontSize: '0.88rem' }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Workspace'}
            <ArrowRight size={15} />
          </button>
        </form>

        {/* Role Quick Profiles for Evaluation */}
        <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1.25rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Shield size={14} color="#4F46E5" />
              <span>Role-Based Access Presets</span>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>Select profile to load</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.username}
                id={`demo-user-${acc.username}`}
                type="button"
                disabled={loading}
                onClick={() => quickSignInAs(acc.username)}
                style={{
                  textAlign: 'left',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-xs)',
                  background: username === acc.username ? '#EEF2FF' : '#F8FAFC',
                  border: `1px solid ${username === acc.username ? '#4F46E5' : '#E2E8F0'}`,
                  color: 'var(--text-primary)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: username === acc.username ? '#4F46E5' : 'var(--text-primary)' }}>
                    {acc.role} <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>({acc.username})</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                    {acc.desc}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.74rem', color: '#4F46E5', fontWeight: 600, flexShrink: 0, paddingLeft: '0.65rem' }}>
                  <span>Access</span>
                  <ArrowRight size={13} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Security Disclaimer */}
        <div style={{ marginTop: '1.25rem', paddingTop: '0.85rem', borderTop: '1px solid #F1F5F9', textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          <Lock size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.3rem' }} />
          Authorized CIL Personnel • 256-bit Encrypted Session • Ministry of Coal, Govt. of India
        </div>
      </div>
    </div>
  );
}

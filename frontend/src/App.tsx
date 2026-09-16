import React, { useState, useEffect, createContext, useContext } from 'react';
import { login as apiLogin, getCurrentUser } from './services/api';
import type { User, UserRole } from './types';

import { AuthContext, AuthCtx } from './contexts/AuthContext';

// ─── Page Imports ─────────────────────────────────────────────────────────────
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DocumentsPage from './pages/DocumentsPage';
import QueryPage from './pages/QueryPage';
import ReportsPage from './pages/ReportsPage';
import ValidationPage from './pages/ValidationPage';
import TopicsPage from './pages/TopicsPage';
import AuditPage from './pages/AuditPage';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';

// ─── Page names ───────────────────────────────────────────────────────────────
export type PageName = 'dashboard' | 'documents' | 'query' | 'reports' | 'validation' | 'topics' | 'audit';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('cmpdi_token'));
  const [currentPage, setCurrentPage] = useState<PageName>('dashboard');
  const [loadingUser, setLoadingUser] = useState(true);

  const [showDataEnvModal, setShowDataEnvModal] = useState(false);

  // Try to restore session on mount
  useEffect(() => {
    if (token) {
      getCurrentUser()
        .then((u) => setUser(u))
        .catch(() => {
          localStorage.removeItem('cmpdi_token');
          setToken(null);
        })
        .finally(() => setLoadingUser(false));
    } else {
      setLoadingUser(false);
    }
  }, []);

  const loginFn = async (username: string, password: string) => {
    const data = await apiLogin(username, password);
    const tk = data.access_token;
    localStorage.setItem('cmpdi_token', tk);
    setToken(tk);
    const u = await getCurrentUser();
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem('cmpdi_token');
    setToken(null);
    setUser(null);
    setCurrentPage('dashboard');
  };

  const authValue: AuthCtx = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    login: loginFn,
    logout,
  };

  if (loadingUser) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060B17' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #0284C7, #7C3AED)', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <div style={{ color: '#94A3B8', fontSize: '0.9rem' }}>Loading CMPDI Platform...</div>
        </div>
      </div>
    );
  }

  if (!authValue.isAuthenticated) {
    return (
      <AuthContext.Provider value={authValue}>
        <LoginPage />
      </AuthContext.Provider>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <DashboardPage />;
      case 'documents': return <DocumentsPage />;
      case 'query': return <QueryPage />;
      case 'reports': return <ReportsPage />;
      case 'validation': return <ValidationPage />;
      case 'topics': return <TopicsPage />;
      case 'audit': return <AuditPage />;
      default: return <DashboardPage />;
    }
  };

  return (
    <AuthContext.Provider value={authValue}>
      <div className="app-layout">
        <Sidebar
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          onOpenDataEnvironment={() => setShowDataEnvModal(true)}
        />
        <div className="main-content">
          <TopHeader
            currentPage={currentPage}
            onOpenDataEnvironment={() => setShowDataEnvModal(true)}
          />
          <main className="page-content animate-in">
            {renderPage()}
          </main>
        </div>
      </div>

      {/* Data Environment Disclosure Modal */}
      {showDataEnvModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(3, 7, 18, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
          onClick={() => setShowDataEnvModal(false)}
        >
          <div
            className="glass-panel"
            style={{
              maxWidth: 520,
              width: '100%',
              padding: '2rem',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              border: '1px solid rgba(56,189,248,0.25)',
              background: '#0B132B',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F1F5F9' }}>Data Environment</h3>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>System validation & evaluation scope</div>
                </div>
              </div>
              <button
                onClick={() => setShowDataEnvModal(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '1.2rem', padding: '0.25rem' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: '#94A3B8', fontSize: '0.88rem', lineHeight: 1.6 }}>
              <p>
                The current environment contains <strong style={{ color: '#E2E8F0' }}>synthetic demonstration data</strong> used for system validation, performance verification, and functionality testing.
              </p>
              <div style={{ background: 'rgba(15,23,42,0.6)', padding: '0.85rem 1rem', borderRadius: 8, border: '1px solid rgba(51,65,85,0.4)', fontSize: '0.82rem' }}>
                <div style={{ fontWeight: 600, color: '#38BDF8', marginBottom: '0.25rem' }}>Environment Overview:</div>
                <ul style={{ paddingLeft: '1.2rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <li>All reports, metrics, and ground-truth answer keys are generated for evaluation.</li>
                  <li>Multi-modal ingestion pipeline active (PDF, DOCX, XLSX, OCR).</li>
                  <li>Cross-document consistency validation engine operational.</li>
                  <li>Source-grounded RAG with exact document page citations enabled.</li>
                </ul>
              </div>
            </div>

            <div style={{ marginTop: '1.75rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowDataEnvModal(false)}
                style={{ padding: '0.45rem 1.25rem' }}
              >
                Acknowledge & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

import React, { useState, useEffect } from 'react';
import { AuthContext } from './contexts/AuthContext';
import { login as apiLogin, getCurrentUser } from './services/api';
import type { User } from './types';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DocumentsPage from './pages/DocumentsPage';
import ValidationPage from './pages/ValidationPage';
import QueryPage from './pages/QueryPage';
import ReportsPage from './pages/ReportsPage';
import TopicsPage from './pages/TopicsPage';
import AuditPage from './pages/AuditPage';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import { Database, CheckCircle2, Cpu, FileSpreadsheet, ShieldAlert } from 'lucide-react';

export type PageName =
  | 'dashboard'
  | 'documents'
  | 'validation'
  | 'query'
  | 'reports'
  | 'topics'
  | 'audit';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('cmpdi_token'));
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<PageName>('dashboard');
  const [showDataEnvModal, setShowDataEnvModal] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('cmpdi_token');
      if (savedToken) {
        try {
          const u = await getCurrentUser();
          setUser(u);
          setToken(savedToken);
        } catch (e) {
          localStorage.removeItem('cmpdi_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const handleLogin = async (username: string, pass: string) => {
    const data = await apiLogin(username, pass);
    localStorage.setItem('cmpdi_token', data.access_token);
    setToken(data.access_token);
    setUser(data.user);
  };

  const handleLogout = () => {
    localStorage.removeItem('cmpdi_token');
    setToken(null);
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060B17', color: '#94A3B8' }}>
        <p>Initializing CMPDI Mining Intelligence...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthContext.Provider
        value={{
          user: null,
          token: null,
          isAuthenticated: false,
          login: handleLogin,
          logout: handleLogout,
        }}
      >
        <LoginPage />
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: true,
        login: handleLogin,
        logout: handleLogout,
      }}
    >
      <div className="app-layout">
        <Sidebar
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          onOpenDataEnvironment={() => setShowDataEnvModal(true)}
        />

        <div className="main-content">
          <TopHeader currentPage={currentPage} />
          <main className="page-content">
            {currentPage === 'dashboard' && <DashboardPage onNavigate={setCurrentPage} />}
            {currentPage === 'documents' && <DocumentsPage />}
            {currentPage === 'validation' && <ValidationPage />}
            {currentPage === 'query' && <QueryPage />}
            {currentPage === 'reports' && <ReportsPage />}
            {currentPage === 'topics' && <TopicsPage />}
            {currentPage === 'audit' && <AuditPage />}
          </main>
        </div>

        {/* Synthetic Environment Info Modal */}
        {showDataEnvModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '1.5rem' }}>
            <div className="glass-panel animate-in" style={{ width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Database size={20} color="#38BDF8" />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>CMPDI Synthetic Demonstration Environment</h3>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowDataEnvModal(false)}>✕</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <p>
                  This deployment is preloaded with an authoritative synthetic mining dataset modeling Coal India Limited (CIL) subsidiaries (NCSL, EMSL, CCSL) with realistic operational scenarios:
                </p>

                <div style={{ background: 'rgba(15,23,42,0.8)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 700, color: '#38BDF8', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <ShieldAlert size={16} color="#FB7185" />
                    <span>Injected Cross-Document Discrepancies</span>
                  </div>
                  <ul style={{ paddingLeft: '1.25rem', lineHeight: 1.7, fontSize: '0.8rem' }}>
                    <li><strong>CONF-2024-001 (Critical):</strong> NCSL Mine-A 2023 Coal Production variance between Annual Report (12.45 MT) and Dispatch Ledger (11.80 MT).</li>
                    <li><strong>CONF-2024-002 (Warning):</strong> EMSL 2023 Overburden Removal variance between Contractor Billing (8.42 MCM) and Survey Sheet (7.90 MCM).</li>
                    <li><strong>CONF-2024-003 (Info):</strong> CCSL Block-IV 2022 Proven Reserve Estimate variance between Exploration Summary (45.2 MT) and DGMS Return (43.8 MT).</li>
                  </ul>
                </div>

                <div style={{ background: 'rgba(15,23,42,0.8)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 700, color: '#34D399', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle2 size={16} color="#34D399" />
                    <span>Domain Test Queries & Negative Tests</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', lineHeight: 1.6 }}>
                    Query the RAG engine for factual production metrics or try negative out-of-domain prompts (e.g. Uranium or space satellites) to verify strict anti-hallucination rejection.
                  </p>
                </div>
              </div>

              <div style={{ textAlign: 'right', marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <button className="btn btn-primary btn-sm" onClick={() => setShowDataEnvModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthContext.Provider>
  );
}

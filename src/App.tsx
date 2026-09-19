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
import { Database, CheckCircle2, Cpu, FileSpreadsheet, ShieldAlert, RefreshCw } from 'lucide-react';

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
    const accessToken = data.access_token;
    localStorage.setItem('cmpdi_token', accessToken);
    setToken(accessToken);

    if (data.user) {
      setUser(data.user);
    } else {
      try {
        const u = await getCurrentUser();
        setUser(u);
      } catch {
        const fallbackUser: User = {
          id: data.id || `user-${data.username}`,
          username: data.username,
          email: `${data.username}@cmpdi.co.in`,
          role: data.role || 'Project Coordinator',
          full_name: data.full_name || data.username,
          is_active: true,
          created_at: new Date().toISOString(),
        };
        setUser(fallbackUser);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('cmpdi_token');
    setToken(null);
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F3F4F9', color: '#475569', gap: '0.85rem' }}>
        <RefreshCw size={24} className="animate-spin" style={{ color: '#4F46E5' }} />
        <p style={{ fontSize: '0.88rem', fontWeight: 600 }}>Initializing CMPDI Geological & Mining Intelligence...</p>
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

        {/* Geological Repository & Architecture Specification Modal */}
        {showDataEnvModal && (
          <div className="modal-overlay" onClick={() => setShowDataEnvModal(false)}>
            <div
              className="modal-dialog animate-in"
              style={{ maxWidth: '640px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-dialog-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Database size={18} color="#4F46E5" />
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                    CIL Mining Knowledge Repository Specification
                  </h3>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setShowDataEnvModal(false)}
                  style={{ padding: '0.2rem 0.5rem', fontSize: '0.85rem' }}
                >
                  ✕
                </button>
              </div>

              <div className="modal-dialog-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                <p style={{ lineHeight: 1.65 }}>
                  The platform is initialized with authoritative operational datasets modeling Coal India Limited (CIL) subsidiaries (Northern Coalfields Limited, Eastern Mining Services, Central Collieries Limited) with verifiable reconciliation benchmarks:
                </p>

                <div style={{ background: '#FEF2F2', padding: '0.95rem 1.15rem', borderRadius: 'var(--radius-sm)', border: '1px solid #FECACA' }}>
                  <div style={{ fontWeight: 700, color: '#DC2626', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem' }}>
                    <ShieldAlert size={15} color="#DC2626" />
                    <span>Statutory Cross-Document Discrepancy Benchmarks</span>
                  </div>
                  <ul style={{ paddingLeft: '1.25rem', lineHeight: 1.7, fontSize: '0.78rem', color: '#7F1D1D' }}>
                    <li><strong style={{ color: '#991B1B' }}>CONF-2024-001 (Critical):</strong> NCSL Mine-A Coal Production variance between Annual Report (12.45 MT) and Rail Siding Dispatch Ledger (11.80 MT).</li>
                    <li><strong style={{ color: '#991B1B' }}>CONF-2024-002 (Warning):</strong> EMSL Overburden Removal variance between Contractor Billing (8.42 MCM) and Field Survey Sheet (7.90 MCM).</li>
                    <li><strong style={{ color: '#991B1B' }}>CONF-2024-003 (Info):</strong> CCSL Block-IV Proven Reserve Estimate variance between Geological Exploration Summary (45.2 MT) and DGMS Return (43.8 MT).</li>
                  </ul>
                </div>

                <div style={{ background: '#F8FAFC', padding: '0.95rem 1.15rem', borderRadius: 'var(--radius-sm)', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontWeight: 700, color: '#059669', marginBottom: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem' }}>
                    <CheckCircle2 size={15} color="#059669" />
                    <span>Dual-Engine OCR & Zero-Hallucination RAG Verification</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', lineHeight: 1.65, color: 'var(--text-secondary)' }}>
                    Documents are indexed with dual OCR extraction (Tesseract and PaddleOCR) and vector embeddings. The RAG query engine strictly checks evidence thresholds and actively rejects out-of-domain queries to guarantee compliance with statutory audit standards.
                  </p>
                </div>
              </div>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowDataEnvModal(false)}
                >
                  Dismiss Specification
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthContext.Provider>
  );
}

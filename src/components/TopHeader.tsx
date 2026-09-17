import React, { useContext, useEffect, useState } from 'react';
import { Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import { checkHealth } from '../services/api';
import type { PageName } from '../App';

interface TopHeaderProps {
  currentPage: PageName;
}

const PAGE_TITLES: Record<PageName, string> = {
  dashboard: 'Executive Mining Dashboard',
  documents: 'Multi-Modal Ingestion & OCR Repository',
  validation: 'Cross-Document Conflict Detection Engine',
  query: 'Source-Grounded Semantic RAG Engine',
  reports: 'Statutory & Management Report Studio',
  topics: 'Domain Taxonomy & Topic Frequency',
  audit: 'Immutable Regulatory Audit Trail',
};

export default function TopHeader({ currentPage }: TopHeaderProps) {
  const { user } = useContext(AuthContext);
  const [healthy, setHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    checkHealth()
      .then(() => setHealthy(true))
      .catch(() => setHealthy(false));
  }, []);

  return (
    <header className="top-header">
      <div className="header-title-container">
        <h1 className="header-page-title">{PAGE_TITLES[currentPage] || currentPage}</h1>
      </div>

      <div className="header-actions">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: healthy ? '#34D399' : '#FB7185', background: healthy ? 'rgba(16,185,129,0.1)' : 'rgba(225,29,72,0.1)', padding: '0.3rem 0.75rem', borderRadius: '9999px', border: `1px solid ${healthy ? 'rgba(16,185,129,0.25)' : 'rgba(225,29,72,0.25)'}` }}>
          {healthy ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
          <span>{healthy ? 'System Operational' : 'Checking Connection'}</span>
        </div>

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(51,65,85,0.25)', padding: '0.35rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <Shield size={14} className="text-sky-400" />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user.role}</span>
          </div>
        )}
      </div>
    </header>
  );
}

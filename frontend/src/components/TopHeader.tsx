import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { PageName } from '../App';
import { ShieldCheck, Info } from 'lucide-react';

const PAGE_NAMES: Record<PageName, string> = {
  dashboard: 'Executive Dashboard',
  documents: 'Document Ingestion & OCR',
  query: 'AI Query',
  reports: 'Automated Report Generator',
  validation: 'Conflict Detection & Review',
  topics: 'Topic Explorer',
  audit: 'Audit Trail & Compliance Logs',
};

interface Props {
  currentPage: PageName;
  onOpenDataEnvironment?: () => void;
}

export default function TopHeader({ currentPage, onOpenDataEnvironment }: Props) {
  const { user } = useAuth();

  return (
    <header className="top-header">
      <div className="header-breadcrumb">
        <span style={{ fontWeight: 600 }}>CMPDI / CIL Intelligence</span>
        <span style={{ color: '#475569' }}>/</span>
        <span className="current">{PAGE_NAMES[currentPage]}</span>
      </div>
      <div className="header-actions">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#94A3B8' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
          <span>System Operational</span>
        </div>
        {onOpenDataEnvironment && (
          <button
            onClick={onOpenDataEnvironment}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            title="Data Environment Information"
          >
            <Info size={13} />
            <span>Data Environment</span>
          </button>
        )}
      </div>
    </header>
  );
}

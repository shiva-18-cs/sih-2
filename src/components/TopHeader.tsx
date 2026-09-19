import React, { useContext, useEffect, useState } from 'react';
import { Shield, CheckCircle2, AlertCircle, Activity, Sparkles } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import { checkHealth } from '../services/api';
import type { PageName } from '../App';

interface TopHeaderProps {
  currentPage: PageName;
}

const BREADCRUMB_MAP: Record<PageName, { section: string; title: string }> = {
  dashboard: { section: 'Executive Overview', title: 'Dashboard' },
  documents: { section: 'Knowledge Base', title: 'Documents & OCR' },
  query: { section: 'Analytical Core', title: 'AI Query' },
  topics: { section: 'Taxonomy Engine', title: 'Topic Explorer' },
  reports: { section: 'Statutory Documentation', title: 'Report Generator' },
  validation: { section: 'Discrepancy Workspace', title: 'Conflict Review' },
  audit: { section: 'Compliance & Ledger', title: 'Statutory Audit Trail' },
};

export default function TopHeader({ currentPage }: TopHeaderProps) {
  const { user, login } = useContext(AuthContext);
  const [healthy, setHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    checkHealth()
      .then(() => setHealthy(true))
      .catch(() => setHealthy(false));
  }, []);

  const { section, title } = BREADCRUMB_MAP[currentPage] || { section: 'System', title: currentPage };

  const handleRoleChange = async (newUsername: string) => {
    if (!newUsername || newUsername === user?.username) return;
    try {
      await login(newUsername, 'demo123');
    } catch (err) {
      console.error('Role switch failed', err);
    }
  };

  return (
    <header className="top-header" role="banner">
      {/* Contextual Breadcrumb */}
      <div className="header-breadcrumb">
        <span className="header-context">CMPDI</span>
        <span className="header-separator">/</span>
        <span className="header-context">{section}</span>
        <span className="header-separator">/</span>
        <span className="header-title">{title}</span>
      </div>

      {/* Action / Telemetry Area */}
      <div className="header-actions">
        {/* Real-time System Health Indicator */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.3rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            background: healthy ? '#ECFDF5' : '#FEF2F2',
            border: `1px solid ${healthy ? '#A7F3D0' : '#FECACA'}`,
            fontSize: '0.74rem',
            fontWeight: 600,
            color: healthy ? '#059669' : '#DC2626',
            boxShadow: 'var(--shadow-xs)',
          }}
          title="Tesseract/PaddleOCR cluster, pgvector embedding store, and rule validation engine active"
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: healthy ? '#10B981' : '#EF4444',
              boxShadow: healthy ? '0 0 6px rgba(16, 185, 129, 0.5)' : 'none',
            }}
          />
          <span>{healthy ? 'Cluster Operational' : 'Connecting Engine'}</span>
        </div>

        {/* User Role Switcher for Testing Authorizations */}
        {user && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.25rem 0.65rem',
              borderRadius: 'var(--radius-sm)',
              background: '#FFFFFF',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <Shield size={13} color="#4F46E5" />
            <select
              id="header-role-switcher"
              aria-label="Active Security Role"
              value={user.username}
              onChange={(e) => handleRoleChange(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '0.15rem 0.25rem',
                fontSize: '0.76rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                cursor: 'pointer',
                outline: 'none',
                width: 'auto',
              }}
              title="Switch enterprise role to inspect RBAC privileges"
            >
              <option value="coordinator" style={{ background: '#FFFFFF', color: '#0F172A' }}>Project Coordinator</option>
              <option value="director" style={{ background: '#FFFFFF', color: '#0F172A' }}>Director / Senior Officer</option>
              <option value="admin" style={{ background: '#FFFFFF', color: '#0F172A' }}>Administrator</option>
              <option value="auditor" style={{ background: '#FFFFFF', color: '#0F172A' }}>Auditor</option>
              <option value="agency" style={{ background: '#FFFFFF', color: '#0F172A' }}>Implementation Agency</option>
            </select>
          </div>
        )}
      </div>
    </header>
  );
}

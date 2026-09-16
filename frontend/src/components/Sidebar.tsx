import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { PageName } from '../App';
import {
  LayoutDashboard, FileText, Search, FileBarChart2, ShieldAlert,
  Tag, ClipboardList, LogOut, Layers, Info
} from 'lucide-react';

interface NavItem {
  id: PageName;
  label: string;
  icon: React.ReactNode;
  section?: string;
  roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={17} />, section: 'OVERVIEW' },
  { id: 'documents', label: 'Documents & OCR', icon: <FileText size={17} />, section: 'INTELLIGENCE' },
  { id: 'query', label: 'AI Query', icon: <Search size={17} /> },
  { id: 'topics', label: 'Topic Explorer', icon: <Tag size={17} /> },
  { id: 'reports', label: 'Report Generator', icon: <FileBarChart2 size={17} />, section: 'GOVERNANCE' },
  { id: 'validation', label: 'Conflict Review', icon: <ShieldAlert size={17} /> },
  { id: 'audit', label: 'Audit Trail', icon: <ClipboardList size={17} />, roles: ['Administrator', 'Director/Senior Officer', 'Auditor'] },
];

const ROLE_COLORS: Record<string, string> = {
  'Administrator': 'badge-rose',
  'Project Coordinator': 'badge-blue',
  'Director/Senior Officer': 'badge-violet',
  'Implementation Agency': 'badge-amber',
  'Auditor': 'badge-emerald',
};

interface Props {
  currentPage: PageName;
  onNavigate: (page: PageName) => void;
  onOpenDataEnvironment?: () => void;
}

export default function Sidebar({ currentPage, onNavigate, onOpenDataEnvironment }: Props) {
  const { user, logout } = useAuth();
  let lastSection = '';

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Layers size={20} color="white" />
          </div>
          <div>
            <div className="sidebar-logo-text">CMPDI / CIL</div>
            <div className="sidebar-subtitle">Geological & Mining Platform</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const showSection = item.section && item.section !== lastSection;
          if (item.section) lastSection = item.section;

          // Role filtering
          if (item.roles && user && !item.roles.includes(user.role)) return null;

          return (
            <React.Fragment key={item.id}>
              {showSection && (
                <div className="nav-section-label">{item.section}</div>
              )}
              <button
                className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
                onClick={() => onNavigate(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </button>
            </React.Fragment>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="sidebar-footer">
        {user && (
          <div style={{ marginBottom: '0.75rem', padding: '0.75rem', background: 'rgba(17,24,39,0.7)', borderRadius: 10, border: '1px solid rgba(51,65,85,0.4)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.2rem' }}>
              {user.role}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748B', marginBottom: '0.4rem' }}>
              Authorized User ({user.username})
            </div>
            <span className={`badge ${ROLE_COLORS[user.role] || 'badge-gray'}`} style={{ fontSize: '0.65rem' }}>
              {user.role}
            </span>
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {onOpenDataEnvironment && (
            <button
              className="nav-item"
              onClick={onOpenDataEnvironment}
              style={{ fontSize: '0.78rem', color: '#94A3B8' }}
            >
              <Info size={15} className="nav-icon" />
              Data Environment
            </button>
          )}
          <button className="nav-item" onClick={logout} style={{ color: '#FB7185' }}>
            <LogOut size={16} className="nav-icon" />
            Sign Out
          </button>
        </div>
        <div style={{ marginTop: '0.75rem', fontSize: '0.65rem', color: '#475569', textAlign: 'center', letterSpacing: '0.02em' }}>
          CMPDI / CIL Intelligence Platform
        </div>
      </div>
    </aside>
  );
}

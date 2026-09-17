import React, { useContext } from 'react';
import {
  LayoutDashboard,
  Files,
  Search,
  FileCheck2,
  AlertTriangle,
  Layers,
  ShieldCheck,
  LogOut,
  Database,
  User as UserIcon,
  LucideIcon,
} from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import type { PageName } from '../App';

interface SidebarProps {
  currentPage: PageName;
  onNavigate: (page: PageName) => void;
  onOpenDataEnvironment: () => void;
}

interface NavItemDef {
  page: PageName;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItemDef[] = [
  { page: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
  { page: 'documents', label: 'Document Repository', icon: Files },
  { page: 'validation', label: 'Cross-Doc Validation', icon: AlertTriangle },
  { page: 'query', label: 'Source-Grounded RAG', icon: Search },
  { page: 'reports', label: 'Intelligence Reports', icon: FileCheck2 },
  { page: 'topics', label: 'Topic & Keyword Engine', icon: Layers },
  { page: 'audit', label: 'Statutory Audit Trail', icon: ShieldCheck },
];

export default function Sidebar({ currentPage, onNavigate, onOpenDataEnvironment }: SidebarProps) {
  const { user, logout } = useContext(AuthContext);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <div className="sidebar-logo-text">CMPDI / CIL</div>
            <div className="sidebar-subtitle">Mining Intelligence Platform</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Core Capabilities</div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.page;
          return (
            <button
              key={item.page}
              id={`nav-item-${item.page}`}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onNavigate(item.page)}
            >
              <Icon size={18} className="nav-icon" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button
          id="data-env-button"
          onClick={onOpenDataEnvironment}
          className="btn btn-secondary btn-sm"
          style={{ width: '100%', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.78rem' }}
        >
          <Database size={14} className="text-cyan-400" />
          <span>Synthetic Environment</span>
        </button>

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflow: 'hidden' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <UserIcon size={16} color="#38BDF8" />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {user.username}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {user.role}
                </div>
              </div>
            </div>
            <button
              id="logout-button"
              onClick={logout}
              title="Sign Out"
              style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '0.4rem', borderRadius: '6px' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

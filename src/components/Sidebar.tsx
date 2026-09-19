import React, { useContext } from 'react';
import {
  LayoutDashboard,
  FileText,
  Sparkles,
  Layers,
  FileBarChart,
  Scale,
  ShieldCheck,
  LogOut,
  Database,
  User as UserIcon,
  LucideIcon,
  Shield,
  ChevronRight,
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
  badge?: string;
  badgeType?: 'warning' | 'info' | 'purple';
}

const PRIMARY_NAV_ITEMS: NavItemDef[] = [
  { page: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { page: 'documents', label: 'Documents & OCR', icon: FileText },
  { page: 'query', label: 'AI Query', icon: Sparkles, badge: 'DeepSearch', badgeType: 'purple' },
  { page: 'topics', label: 'Topic Explorer', icon: Layers },
  { page: 'reports', label: 'Report Generator', icon: FileBarChart },
  { page: 'validation', label: 'Conflict Review', icon: Scale, badge: '2 Open', badgeType: 'warning' },
];

const SECONDARY_NAV_ITEMS: NavItemDef[] = [
  { page: 'audit', label: 'Statutory Audit Trail', icon: ShieldCheck },
];

export default function Sidebar({ currentPage, onNavigate, onOpenDataEnvironment }: SidebarProps) {
  const { user, logout } = useContext(AuthContext);

  return (
    <aside className="sidebar" aria-label="Main Navigation">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="sidebar-brand-mark">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <div style={{ minWidth: 0 }}>
          <div className="sidebar-brand-text">CMPDI / CIL</div>
          <div className="sidebar-brand-sub">Geological Intelligence</div>
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="sidebar-nav">
        <div className="nav-section-title">Operational Workspace</div>
        {PRIMARY_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.page;
          return (
            <button
              key={item.page}
              id={`nav-item-${item.page}`}
              type="button"
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onNavigate(item.page)}
            >
              <Icon size={17} className="nav-icon" />
              <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.label}
              </span>
              {item.badge && (
                <span
                  className={`badge ${
                    item.badgeType === 'purple'
                      ? 'badge-purple'
                      : item.badgeType === 'warning'
                      ? 'badge-warning'
                      : 'badge-info'
                  }`}
                  style={{ fontSize: '0.65rem', padding: '0.12rem 0.45rem' }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="nav-section-title" style={{ marginTop: '0.75rem' }}>Governance & Ledger</div>
        {SECONDARY_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.page;
          return (
            <button
              key={item.page}
              id={`nav-item-${item.page}`}
              type="button"
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onNavigate(item.page)}
            >
              <Icon size={17} className="nav-icon" />
              <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Footer / User Profile & Environment Modal */}
      <div className="sidebar-footer">
        <button
          id="data-env-button"
          type="button"
          onClick={onOpenDataEnvironment}
          className="btn btn-secondary btn-sm"
          style={{ width: '100%', justifyContent: 'flex-start', gap: '0.55rem', fontSize: '0.76rem', padding: '0.45rem 0.75rem' }}
          title="Inspect CIL Geological Repository Data Specification"
        >
          <Database size={14} color="#4F46E5" />
          <span style={{ flex: 1, textAlign: 'left' }}>Repository Data Spec</span>
          <ChevronRight size={13} color="var(--text-dim)" />
        </button>

        {user && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
              padding: '0.65rem 0.75rem',
              background: '#FFFFFF',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
                  border: '1px solid #C7D2FE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: '#4F46E5',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                }}
              >
                {user.username ? user.username[0].toUpperCase() : 'U'}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.username}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.role}
                </div>
              </div>
            </div>
            <button
              id="sidebar-logout-button"
              type="button"
              onClick={logout}
              className="btn btn-ghost"
              style={{ padding: '0.35rem', color: 'var(--text-dim)' }}
              title="Sign Out"
            >
              <LogOut size={15} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

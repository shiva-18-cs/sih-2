import React from 'react';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface ConflictBadgeProps {
  status: string;
}

export const ConflictBadge: React.FC<ConflictBadgeProps> = ({ status }) => {
  if (status === 'resolved') {
    return (
      <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        <CheckCircle size={12} /> Resolved
      </span>
    );
  }
  return (
    <span className="badge badge-rose" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      <AlertCircle size={12} /> Unresolved Conflict
    </span>
  );
};

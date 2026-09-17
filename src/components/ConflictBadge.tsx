import React from 'react';

interface ConflictBadgeProps {
  severity?: 'critical' | 'warning' | 'info';
  status?: string;
}

export default function ConflictBadge({ severity = 'warning', status }: ConflictBadgeProps) {
  if (status === 'resolved') {
    return (
      <span className="badge badge-success">
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
        Resolved
      </span>
    );
  }

  if (severity === 'critical') {
    return (
      <span className="badge badge-critical">
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FB7185', display: 'inline-block' }} />
        Critical Discrepancy
      </span>
    );
  }

  if (severity === 'info') {
    return (
      <span className="badge badge-info">
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#38BDF8', display: 'inline-block' }} />
        Info / Observation
      </span>
    );
  }

  return (
    <span className="badge badge-warning">
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F59E0B', display: 'inline-block' }} />
      Warning Variance
    </span>
  );
}

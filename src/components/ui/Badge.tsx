import React from 'react';
import { Shield, CheckCircle2, AlertTriangle, XCircle, Clock, Sparkles } from 'lucide-react';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'info' | 'purple' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  id?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  id,
}) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-medium',
    lg: 'px-3 py-1.5 text-sm font-medium',
  };

  const variantClasses = {
    default: 'bg-slate-100 text-slate-800 border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    destructive: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    outline: 'bg-transparent text-slate-600 border-slate-300',
  };

  return (
    <span
      id={id}
      className={`inline-flex items-center gap-1.5 rounded-md border whitespace-nowrap ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

// Verified Student Badge with Shield & Tooltip
export const VerifiedStudentBadge: React.FC<{ registrationNumber?: string; id?: string }> = ({
  registrationNumber,
  id,
}) => {
  return (
    <div
      id={id || 'verified-student-badge'}
      className="group relative inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-1 rounded-md text-xs font-semibold shadow-xs"
      title="Identity verified with official student enrollment records"
    >
      <Shield className="w-3.5 h-3.5 text-blue-600 fill-blue-100" />
      <span>Verified Student</span>
      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
      {registrationNumber && (
        <span className="font-mono text-[11px] text-blue-600 pl-1 border-l border-blue-200">
          {registrationNumber}
        </span>
      )}
    </div>
  );
};

// Attendance State Badge
export const AttendanceStateBadge: React.FC<{
  state: 'PRESENT' | 'FLAGGED' | 'ABSENT' | 'EXCUSED';
  id?: string;
}> = ({ state, id }) => {
  switch (state) {
    case 'PRESENT':
      return (
        <Badge id={id} variant="success">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Present</span>
        </Badge>
      );
    case 'FLAGGED':
      return (
        <Badge id={id} variant="warning">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          <span>Flagged (Geofence)</span>
        </Badge>
      );
    case 'EXCUSED':
      return (
        <Badge id={id} variant="info">
          <Clock className="w-3 h-3 text-blue-600" />
          <span>Excused (Leave)</span>
        </Badge>
      );
    case 'ABSENT':
      return (
        <Badge id={id} variant="destructive">
          <XCircle className="w-3 h-3 text-rose-600" />
          <span>Absent</span>
        </Badge>
      );
    default:
      return <Badge id={id}>{state}</Badge>;
  }
};

// Risk Level Badge
export const RiskLevelBadge: React.FC<{
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  id?: string;
}> = ({ level, id }) => {
  switch (level) {
    case 'LOW':
      return (
        <Badge id={id} variant="success">
          <CheckCircle2 className="w-3 h-3" />
          <span>Low Risk (Good Standing)</span>
        </Badge>
      );
    case 'MEDIUM':
      return (
        <Badge id={id} variant="warning">
          <AlertTriangle className="w-3 h-3" />
          <span>Moderate Risk</span>
        </Badge>
      );
    case 'HIGH':
    case 'CRITICAL':
      return (
        <Badge id={id} variant="destructive">
          <AlertTriangle className="w-3 h-3" />
          <span>High Risk (Intervention Needed)</span>
        </Badge>
      );
    default:
      return <Badge id={id}>{level}</Badge>;
  }
};

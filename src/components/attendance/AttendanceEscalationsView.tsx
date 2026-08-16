import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  MapPin,
  AlertTriangle,
  Clock,
  User,
  Filter,
  Check,
  X,
  FileCheck,
} from 'lucide-react';
import { usePortalStore } from '../../lib/store';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Select } from '../ui/Input';

export const AttendanceEscalationsView: React.FC = () => {
  const { attendanceScans, updateScanState, attendanceSessions } = usePortalStore();

  const [filterState, setFilterState] = useState<string>('FLAGGED');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const filteredScans = attendanceScans.filter((scan) => {
    if (filterState === 'ALL') return true;
    return scan.state === filterState;
  });

  const flaggedCount = attendanceScans.filter((s) => s.state === 'FLAGGED').length;
  const verifiedCount = attendanceScans.filter((s) => s.state === 'VERIFIED').length;
  const excusedCount = attendanceScans.filter((s) => s.state === 'EXCUSED').length;

  const handleAction = (scanId: string, newState: 'VERIFIED' | 'EXCUSED' | 'FAILED', notes: string) => {
    updateScanState(scanId, newState, notes);
    setSuccessToast(`Record updated to ${newState}`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Attendance Integrity Escalations & Geofence Audits
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Oversight console for flagged out-of-bounds check-ins, mock GPS alerts, and student attendance appeals
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            options={[
              { value: 'FLAGGED', label: `Flagged Infractions (${flaggedCount})` },
              { value: 'EXCUSED', label: `Excused / Approved (${excusedCount})` },
              { value: 'VERIFIED', label: `Verified Standard (${verifiedCount})` },
              { value: 'ALL', label: `All Scans (${attendanceScans.length})` },
            ]}
          />
        </div>
      </div>

      {successToast && (
        <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-lg border border-emerald-200 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successToast}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
          <div className="flex items-center justify-between">
            <p className="text-xs text-amber-800 font-medium">Pending Flagged Reviews</p>
            <ShieldAlert className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-700 mt-1">{flaggedCount}</p>
          <span className="text-[10px] text-amber-600">Requires administrative resolution</span>
        </div>

        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
          <div className="flex items-center justify-between">
            <p className="text-xs text-emerald-800 font-medium">Excused on Appeal</p>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{excusedCount}</p>
          <span className="text-[10px] text-emerald-600">Duty leave or verified exemption</span>
        </div>

        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <p className="text-xs text-blue-800 font-medium">Verified Compliance</p>
            <FileCheck className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-700 mt-1">{verifiedCount}</p>
          <span className="text-[10px] text-blue-600">Within strict classroom perimeter</span>
        </div>
      </div>

      {/* Scans Table */}
      <Card>
        <CardHeader
          title={`Attendance Logs (${filteredScans.length})`}
          subtitle="Real-time GPS validation logs with distance deviation from classroom beacon"
        />
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Session / Course</th>
                  <th className="py-3 px-4">GPS Coordinates & Distance</th>
                  <th className="py-3 px-4">Integrity Status</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">HOD Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredScans.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No records match the current integrity filter.
                    </td>
                  </tr>
                ) : (
                  filteredScans.map((scan) => {
                    const isFlagged = scan.state === 'FLAGGED';
                    return (
                      <tr key={scan.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{scan.studentName}</div>
                          <div className="font-mono text-[11px] text-slate-500">
                            {scan.registrationNumber}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-blue-700">{scan.courseCode}</span>
                          <span className="text-slate-500 block text-[11px]">{scan.classCode}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-slate-700 font-mono">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{scan.distanceMeters.toFixed(1)}m from beacon</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Lat: {scan.latitude?.toFixed(4)}, Lng: {scan.longitude?.toFixed(4)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {scan.state === 'VERIFIED' && (
                            <Badge variant="green">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Verified</span>
                            </Badge>
                          )}
                          {scan.state === 'FLAGGED' && (
                            <Badge variant="amber">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              <span>Flagged Deviation</span>
                            </Badge>
                          )}
                          {scan.state === 'EXCUSED' && (
                            <Badge variant="blue">
                              <Check className="w-3 h-3 text-blue-600" />
                              <span>Excused / Approved</span>
                            </Badge>
                          )}
                          {scan.state === 'FAILED' && (
                            <Badge variant="rose">
                              <XCircle className="w-3 h-3 text-rose-600" />
                              <span>Rejected</span>
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-mono">
                          {new Date(scan.scannedAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {isFlagged ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() =>
                                  handleAction(
                                    scan.id,
                                    'EXCUSED',
                                    'Approved under HOD academic discretion'
                                  )
                                }
                                className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold rounded text-[11px] transition-colors cursor-pointer"
                              >
                                Approve / Excuse
                              </button>
                              <button
                                onClick={() =>
                                  handleAction(
                                    scan.id,
                                    'FAILED',
                                    'Confirmed out of classroom boundaries'
                                  )
                                }
                                className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold rounded text-[11px] transition-colors cursor-pointer"
                              >
                                Confirm Absence
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400">Processed</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

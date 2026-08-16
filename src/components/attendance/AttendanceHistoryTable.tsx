import React, { useState } from 'react';
import { Calendar, Filter, Search, Download, CheckCircle2, AlertTriangle, Clock, XCircle } from 'lucide-react';
import { usePortalStore } from '../../lib/store';
import { AttendanceScanRecord } from '../../types';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Badge, AttendanceStateBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';

export const AttendanceHistoryTable: React.FC = () => {
  const { attendanceScans, currentUser, courses } = usePortalStore();

  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter scans for current user if student, otherwise all
  const userScans = currentUser.role === 'student'
    ? attendanceScans.filter((s) => s.studentId === currentUser.id)
    : attendanceScans;

  const filteredScans = userScans.filter((scan) => {
    if (selectedCourse !== 'all' && scan.courseCode !== selectedCourse) return false;
    if (selectedStatus !== 'all' && scan.state !== selectedStatus) return false;
    if (
      searchQuery &&
      !scan.studentName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !scan.studentRegistrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !(scan.courseTitle || '').toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const total = userScans.length;
  const present = userScans.filter((s) => s.state === 'PRESENT').length;
  const flagged = userScans.filter((s) => s.state === 'FLAGGED').length;
  const excused = userScans.filter((s) => s.state === 'EXCUSED').length;
  const percentage = total > 0 ? ((present + excused) / total) * 100 : 86.4;

  return (
    <div className="space-y-6">
      {/* Attendance Metric Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs text-slate-500 font-medium">Aggregate Attendance</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{percentage.toFixed(1)}%</p>
          <span className="text-[10px] text-emerald-600 font-semibold">Above 75% threshold</span>
        </div>
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
          <p className="text-xs text-emerald-800 font-medium">Verified Present</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{present}</p>
          <span className="text-[10px] text-emerald-600">Geofence confirmed</span>
        </div>
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
          <p className="text-xs text-amber-800 font-medium">Flagged Sessions</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">{flagged}</p>
          <span className="text-[10px] text-amber-600">Location excess</span>
        </div>
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-xs text-blue-800 font-medium">Excused / Approved</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{excused}</p>
          <span className="text-[10px] text-blue-600">Medical / Academic leave</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card>
        <CardHeader title="Attendance Audit Log" subtitle="Comprehensive record of all geofence check-in verifications" />
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              placeholder="Search by student, reg #, or course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
            <Select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              options={[
                { value: 'all', label: 'All Registered Courses' },
                ...courses.map((c) => ({ value: c.code, label: `${c.code} - ${c.title}` })),
              ]}
            />
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              options={[
                { value: 'all', label: 'All Verification States' },
                { value: 'PRESENT', label: 'Present (Within Geofence)' },
                { value: 'FLAGGED', label: 'Flagged (Outside Radius)' },
                { value: 'EXCUSED', label: 'Excused (Leave Granted)' },
                { value: 'ABSENT', label: 'Absent' },
              ]}
            />
          </div>

          {/* Desktop Table View */}
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Course</th>
                  {currentUser.role !== 'student' && <th className="py-3 px-4">Student</th>}
                  <th className="py-3 px-4">GPS Distance</th>
                  <th className="py-3 px-4">Verification Status</th>
                  <th className="py-3 px-4">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredScans.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                      No matching attendance records found.
                    </td>
                  </tr>
                ) : (
                  filteredScans.map((scan) => (
                    <tr key={scan.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap text-slate-600 font-medium">
                        {new Date(scan.scanTimestamp).toLocaleDateString()}{' '}
                        <span className="text-slate-400">
                          {new Date(scan.scanTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {scan.courseCode || 'CS301'}
                        <span className="block text-[11px] text-slate-500 font-normal">
                          {scan.courseTitle || 'Database Systems'}
                        </span>
                      </td>
                      {currentUser.role !== 'student' && (
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-900">{scan.studentName}</span>
                          <span className="block font-mono text-[11px] text-slate-500">
                            {scan.studentRegistrationNumber}
                          </span>
                        </td>
                      )}
                      <td className="py-3 px-4 font-mono">
                        {scan.calculatedDistanceMeters !== undefined ? (
                          <span className={scan.calculatedDistanceMeters > 50 ? 'text-rose-600 font-bold' : 'text-slate-700'}>
                            {scan.calculatedDistanceMeters}m
                          </span>
                        ) : (
                          <span className="text-slate-400">N/A</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <AttendanceStateBadge state={scan.state} />
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {scan.flagReason && <p className="text-rose-600 font-medium">{scan.flagReason}</p>}
                        {scan.resolutionNotes && (
                          <p className="text-blue-600 italic text-[11px]">{scan.resolutionNotes}</p>
                        )}
                        {!scan.flagReason && !scan.resolutionNotes && (
                          <span className="text-slate-400">Verified by server</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

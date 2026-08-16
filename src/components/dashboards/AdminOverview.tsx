import React from 'react';
import {
  Building2,
  Users,
  FileCheck2,
  ShieldCheck,
  Server,
  Layers,
  Database,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { usePortalStore } from '../../lib/store';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const AdminOverview: React.FC<{ onNavigate: (section: string) => void }> = ({
  onNavigate,
}) => {
  const { departments, classes, courses, studentMaster } = usePortalStore();

  const totalEnrollment = departments.reduce((acc, d) => acc + d.studentCount, 0);
  const totalFaculty = departments.reduce((acc, d) => acc + d.facultyCount, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-purple-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="bg-purple-500/20 text-purple-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-purple-400/30">
            Institutional Administration Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            National Educational Governance University
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Central registry cockpit • Monitoring university-wide student master rosters, department allocations, and compliance audits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={() => onNavigate('roster')}
            leftIcon={<FileCheck2 className="w-4 h-4" />}
            className="bg-purple-600 hover:bg-purple-700 text-white shadow-md"
          >
            Upload Student CSV Roster
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-4 sm:p-5">
            <p className="text-xs text-slate-500 font-medium">Campus Student Count</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{totalEnrollment}</p>
            <span className="text-[11px] text-emerald-600 block mt-1">4 Active Departments</span>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-4 sm:p-5">
            <p className="text-xs text-slate-500 font-medium">University Faculty</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{totalFaculty}</p>
            <span className="text-[11px] text-blue-600 block mt-1">Appointed & Verified</span>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-4 sm:p-5">
            <p className="text-xs text-slate-500 font-medium">Active Courses</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">{courses.length}</p>
            <span className="text-[11px] text-purple-600 block mt-1">Curriculum Syllabi Mapped</span>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-4 sm:p-5">
            <p className="text-xs text-slate-500 font-medium">Master Roster Entries</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">{studentMaster.length}</p>
            <span className="text-[11px] text-emerald-600 block mt-1">Institutional Verified</span>
          </CardContent>
        </Card>
      </div>

      {/* University Departments Directory */}
      <Card>
        <CardHeader
          title="University Departments & Academic Leadership"
          subtitle="Governing departments and their respective student enrollments and HOD authorities"
        />
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Dept Code</th>
                  <th className="py-3 px-4">Department Name</th>
                  <th className="py-3 px-4">Head of Department</th>
                  <th className="py-3 px-4">Students</th>
                  <th className="py-3 px-4">Faculty</th>
                  <th className="py-3 px-4">Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {departments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-purple-700">{dept.code}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{dept.name}</td>
                    <td className="py-3 px-4 text-slate-600">{dept.hodName || 'Prof. Appointed'}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">{dept.studentCount}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{dept.facultyCount}</td>
                    <td className="py-3 px-4">
                      <span className="text-emerald-700 font-bold">{dept.avgAttendance}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

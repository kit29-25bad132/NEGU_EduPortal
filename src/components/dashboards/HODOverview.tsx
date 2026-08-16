import React from 'react';
import {
  Building2,
  Users,
  BarChart3,
  Sparkles,
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { usePortalStore } from '../../lib/store';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const HODOverview: React.FC<{ onNavigate: (section: string) => void }> = ({ onNavigate }) => {
  const { currentUser, departments, classes, courses, attendanceScans, aiInsights } = usePortalStore();

  const cseDept = departments.find((d) => d.code === 'CSE') || departments[0];
  const deptInsight = aiInsights.find((i) => i.insightType === 'DEPARTMENT_SUMMARY');
  const flaggedScans = attendanceScans.filter((s) => s.state === 'FLAGGED');

  return (
    <div className="space-y-6">
      {/* HOD Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-indigo-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="bg-indigo-500/20 text-indigo-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-indigo-400/30">
            Department Leadership Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {cseDept.name} (CSE)
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            HOD Executive Cockpit • Overseeing {cseDept.studentCount} students, {cseDept.facultyCount} faculty, and {cseDept.coursesCount} active course offerings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={() => onNavigate('reports')}
            leftIcon={<BarChart3 className="w-4 h-4" />}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
          >
            Institutional Audit
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-4 sm:p-5">
            <p className="text-xs text-slate-500 font-medium">Department Enrollment</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{cseDept.studentCount}</p>
            <span className="text-[11px] text-emerald-600 block mt-1">100% Active Registration</span>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-4 sm:p-5">
            <p className="text-xs text-slate-500 font-medium">Department Attendance</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">{cseDept.avgAttendance}%</p>
            <span className="text-[11px] text-emerald-600 block mt-1">+2.4% vs Previous Term</span>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-4 sm:p-5">
            <p className="text-xs text-slate-500 font-medium">Faculty Members</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{cseDept.facultyCount}</p>
            <span className="text-[11px] text-slate-500 block mt-1">Student/Faculty Ratio: 17:1</span>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-4 sm:p-5">
            <p className="text-xs text-slate-500 font-medium">Unresolved Geofence Flags</p>
            <p className="text-2xl font-bold text-amber-700 mt-1">{flaggedScans.length}</p>
            <span className="text-[11px] text-amber-600 block mt-1">Pending teacher sign-off</span>
          </CardContent>
        </Card>
      </div>

      {/* AI Department Risk Insight */}
      {deptInsight && (
        <Card className="border-indigo-200 bg-gradient-to-r from-white via-indigo-50/20 to-white">
          <CardHeader
            title={
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <span>AI Department Risk & Performance Pulse</span>
              </div>
            }
            subtitle="Automated synthetic analysis of department compliance and student standing"
          />
          <CardContent className="space-y-4">
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {deptInsight.summary}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {deptInsight.riskFactors.map((rf, i) => (
                <div key={i} className="p-3 bg-white rounded-lg border border-indigo-100 text-xs">
                  <span className="text-slate-500 block">{rf.factor}</span>
                  <span className="font-bold text-slate-900 text-base">{rf.metric}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Leadership Recommendations:
              </p>
              <ul className="space-y-1 text-xs text-slate-600">
                {deptInsight.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Class Section Breakdown */}
      <Card>
        <CardHeader
          title="Department Class Sections & Mentors"
          subtitle="Overview of sections, faculty advisors, and enrollment capacity"
        />
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Section Code</th>
                  <th className="py-3 px-4">Academic Program</th>
                  <th className="py-3 px-4">Class Advisor</th>
                  <th className="py-3 px-4">Enrolled Students</th>
                  <th className="py-3 px-4">Academic Term</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {classes.map((cls) => (
                  <tr key={cls.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">{cls.code}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{cls.name}</td>
                    <td className="py-3 px-4 text-slate-600">{cls.advisorName || 'Faculty Advisor'}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">{cls.studentCount}</td>
                    <td className="py-3 px-4 text-slate-500 font-mono">{cls.academicYear}</td>
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

import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  TrendingUp,
  Users,
  Award,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { usePortalStore } from '../../lib/store';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Select } from '../ui/Input';

export const AcademicReportGenerator: React.FC = () => {
  const { departments, classes, courses, attendanceScans, grades } = usePortalStore();

  const [selectedDept, setSelectedDept] = useState('all');

  // Chart Data: Department Attendance Comparison
  const deptAttendanceData = departments.map((d) => ({
    name: d.code,
    attendance: d.avgAttendance,
    students: d.studentCount,
  }));

  // Chart Data: Attendance Trend over 6 weeks
  const attendanceTrendData = [
    { week: 'Week 1', attendance: 82.1, target: 75 },
    { week: 'Week 2', attendance: 84.5, target: 75 },
    { week: 'Week 3', attendance: 83.2, target: 75 },
    { week: 'Week 4', attendance: 86.8, target: 75 },
    { week: 'Week 5', attendance: 85.6, target: 75 },
    { week: 'Week 6', attendance: 88.4, target: 75 },
  ];

  // Chart Data: Grade Distribution
  const gradeDistributionData = [
    { grade: 'Grade A+ (90-100%)', count: 24, fill: '#059669' },
    { grade: 'Grade A (80-89%)', count: 32, fill: '#2563eb' },
    { grade: 'Grade B (70-79%)', count: 18, fill: '#4f46e5' },
    { grade: 'Grade C (60-69%)', count: 8, fill: '#d97706' },
    { grade: 'Grade D (50-59%)', count: 4, fill: '#dc2626' },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Institutional Performance Analytics & Reports
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit academic compliance, attendance velocity, and cross-departmental examination standing
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer className="w-3.5 h-3.5" />}
          >
            Export PDF Report
          </Button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs text-slate-500 font-medium">Campus Enrollment</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">1,570</p>
          <span className="text-[10px] text-emerald-600 font-semibold">Across 4 Departments</span>
        </div>
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
          <p className="text-xs text-emerald-800 font-medium">Institutional Avg Attendance</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">85.4%</p>
          <span className="text-[10px] text-emerald-600">+2.3% vs previous semester</span>
        </div>
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-xs text-blue-800 font-medium">Passing Rate</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">94.2%</p>
          <span className="text-[10px] text-blue-600">Continuous Evaluation</span>
        </div>
        <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
          <p className="text-xs text-indigo-800 font-medium">Geofence Compliance</p>
          <p className="text-2xl font-bold text-indigo-700 mt-1">98.8%</p>
          <span className="text-[10px] text-indigo-600">Anti-Proxy Integrity</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend Line Chart */}
        <Card>
          <CardHeader
            title="Weekly Attendance Trend (%)"
            subtitle="Campus aggregate attendance trajectory against institutional 75% cutoff threshold"
          />
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <XAxis dataKey="week" stroke="#64748b" fontSize={12} />
                <YAxis domain={[60, 100]} stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="attendance"
                  name="Actual Attendance %"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  name="Mandatory Threshold (75%)"
                  stroke="#dc2626"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department Comparison Bar Chart */}
        <Card>
          <CardHeader
            title="Department Attendance Comparison (%)"
            subtitle="Average student attendance across CSE, AI&DS, ECE, and Mechanical Engineering"
          />
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptAttendanceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis domain={[70, 100]} stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="attendance" name="Avg Attendance %" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Grade Distribution Bar */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Summative Grade Distribution"
            subtitle="Normalized distribution of marks awarded in Midterm and Continuous Assessments"
          />
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeDistributionData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <XAxis type="number" stroke="#64748b" fontSize={12} />
                <YAxis dataKey="grade" type="category" stroke="#64748b" fontSize={12} width={160} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" name="Number of Students" fill="#4f46e5" radius={[0, 6, 6, 0]}>
                  {gradeDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

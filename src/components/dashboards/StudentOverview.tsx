import React from 'react';
import {
  Radio,
  Sparkles,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingUp,
  FileText,
  MapPin,
} from 'lucide-react';
import { usePortalStore } from '../../lib/store';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { VerifiedStudentBadge, Badge } from '../ui/Badge';
import { AIInsightsCard } from '../ai/AIInsightsCard';

export const StudentOverview: React.FC<{ onNavigate: (section: string) => void }> = ({
  onNavigate,
}) => {
  const { currentUser, courses, attendanceSessions, attendanceScans, assignments, leaveRequests } =
    usePortalStore();

  const activeSession = attendanceSessions.find((s) => s.status === 'ACTIVE');
  const userScans = attendanceScans.filter((s) => s.studentId === currentUser.id);
  const presentCount = userScans.filter((s) => s.state === 'PRESENT' || s.state === 'EXCUSED').length;
  const attendanceRate = userScans.length > 0 ? (presentCount / userScans.length) * 100 : 86.4;

  const pendingAssignments = assignments.slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-blue-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-blue-500/20 text-blue-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-blue-400/30">
              Academic Year 2025-26 • Semester {currentUser.semester || 6}
            </span>
            <VerifiedStudentBadge registrationNumber={currentUser.registrationNumber} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome back, {currentUser.fullName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Your academic performance is strong. You have 1 active attendance broadcast waiting and 2 upcoming coursework deadlines.
          </p>
        </div>

        {activeSession && (
          <Button
            variant="primary"
            size="lg"
            onClick={() => onNavigate('attendance')}
            leftIcon={<Radio className="w-5 h-5 animate-pulse" />}
            className="bg-emerald-600 hover:bg-emerald-700 border-emerald-500 text-white shadow-lg shrink-0"
            id="overview-quick-scan-btn"
          >
            Live Check-In Ready
          </Button>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-4 sm:p-5">
            <p className="text-xs text-slate-500 font-medium">Cumulative Attendance</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{attendanceRate.toFixed(1)}%</p>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Above 75% Mandate</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-4 sm:p-5">
            <p className="text-xs text-slate-500 font-medium">Cumulative GPA</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {currentUser.currentGpa || 3.82} <span className="text-xs text-slate-400 font-normal">/ 4.0</span>
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-blue-600 font-medium mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Top 5% in CSE-3A</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-4 sm:p-5">
            <p className="text-xs text-slate-500 font-medium">Enrolled Subjects</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{courses.length}</p>
            <span className="text-[11px] text-slate-500 block mt-1">21 Total Credits</span>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-4 sm:p-5">
            <p className="text-xs text-slate-500 font-medium">Coursework Due</p>
            <p className="text-2xl font-bold text-amber-700 mt-1">{pendingAssignments.length}</p>
            <span className="text-[11px] text-amber-600 block mt-1">Next due in 4 days</span>
          </CardContent>
        </Card>
      </div>

      {/* Active Session Callout if broadcast is running */}
      {activeSession && (
        <Card className="border-emerald-300 bg-emerald-50/40 shadow-xs">
          <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>Active Classroom Broadcast Now</span>
              </div>
              <h4 className="text-base font-bold text-slate-900">
                {activeSession.courseCode} - {activeSession.courseTitle}
              </h4>
              <p className="text-xs text-slate-600">
                Instructor: {activeSession.teacherName} • Room: Hall 302 • Geofence Radius: {activeSession.allowedRadiusMeters}m
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={() => onNavigate('attendance')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
            >
              Open Geofence Check-In
            </Button>
          </CardContent>
        </Card>
      )}

      {/* AI Standing Card */}
      <AIInsightsCard onOpenStudyPlanner={() => onNavigate('ai-insights')} />

      {/* Course Schedule Grid */}
      <Card>
        <CardHeader
          title="Current Registered Courses & Lecture Timetable"
          subtitle="Spring 2026 Academic Term"
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('courses')}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              View All Courses
            </Button>
          }
        />
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Course Title</th>
                  <th className="py-3 px-4">Instructor</th>
                  <th className="py-3 px-4">Weekly Schedule</th>
                  <th className="py-3 px-4">Room / Hall</th>
                  <th className="py-3 px-4">Credits</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">{course.code}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{course.title}</td>
                    <td className="py-3 px-4 text-slate-600">{course.instructorName || 'Faculty'}</td>
                    <td className="py-3 px-4 text-slate-600">{course.schedule}</td>
                    <td className="py-3 px-4 text-slate-500 font-medium">{course.room}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">{course.credits}</td>
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

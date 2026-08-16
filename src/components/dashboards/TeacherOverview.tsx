import React from 'react';
import {
  Radio,
  MapPin,
  Users,
  Sparkles,
  FileText,
  Award,
  AlertTriangle,
  CheckCircle2,
  Play,
  ArrowRight,
  Clock,
  BookOpen,
} from 'lucide-react';
import { usePortalStore } from '../../lib/store';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const TeacherOverview: React.FC<{ onNavigate: (section: string) => void }> = ({
  onNavigate,
}) => {
  const { currentUser, courses, classes, attendanceSessions, attendanceScans, assignments, leaveRequests } =
    usePortalStore();

  const activeSession = attendanceSessions.find((s) => s.status === 'ACTIVE');
  const flaggedScans = attendanceScans.filter((s) => s.state === 'FLAGGED');
  const pendingLeaves = leaveRequests.filter((l) => l.status === 'PENDING');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-blue-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-blue-500/20 text-blue-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-blue-400/30">
              Faculty Workspace • {currentUser.departmentName}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {currentUser.fullName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Course Coordinator for CS301 (Database Management) & CS302 (Machine Learning). Section CSE-3A active.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="lg"
            onClick={() => onNavigate('attendance')}
            leftIcon={activeSession ? <Radio className="w-5 h-5 animate-pulse" /> : <Play className="w-4 h-4 fill-white" />}
            className={activeSession ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'}
          >
            {activeSession ? 'Manage Active Attendance' : 'Start Geofence Attendance'}
          </Button>
        </div>
      </div>

      {/* Flagged Attention Banner */}
      {flaggedScans.length > 0 && (
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 text-amber-950">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold">
                {flaggedScans.length} Students Flagged Outside Classroom Boundary
              </p>
              <p className="text-amber-800 mt-0.5">
                Students attempted to check in while exceeding the 50m allowable radius. Requires manual verification.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('attendance')}
            className="text-xs text-amber-900 border-amber-300 bg-white shrink-0"
          >
            Review Flagged Scans
          </Button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-4 sm:p-5">
            <p className="text-xs text-slate-500 font-medium">Assigned Classes</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">2 Sections</p>
            <span className="text-[11px] text-slate-500 block mt-1">CSE-3A & CSE-3B (126 Students)</span>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-4 sm:p-5">
            <p className="text-xs text-slate-500 font-medium">Active Attendance</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">88.2%</p>
            <span className="text-[11px] text-emerald-600 block mt-1">Verified via Haversine GPS</span>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-4 sm:p-5">
            <p className="text-xs text-slate-500 font-medium">Pending Submissions</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">37</p>
            <span className="text-[11px] text-blue-600 block mt-1">AI Rubric grading available</span>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-4 sm:p-5">
            <p className="text-xs text-slate-500 font-medium">Pending Leaves</p>
            <p className="text-2xl font-bold text-amber-700 mt-1">{pendingLeaves.length}</p>
            <span className="text-[11px] text-amber-600 block mt-1">Duty & medical applications</span>
          </CardContent>
        </Card>
      </div>

      {/* Quick Tool Launchers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader
            title={
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <MapPin className="w-5 h-5 text-blue-600" />
                <span>Geofenced Attendance</span>
              </div>
            }
            subtitle="Broadcast classroom sessions with customizable geofence radius"
          />
          <CardContent className="text-xs text-slate-600">
            Automates student check-ins with server-side GPS verification and real-time live feeds.
          </CardContent>
          <CardFooter>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onNavigate('attendance')}
              className="w-full text-xs"
            >
              Open Attendance Terminal
            </Button>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-indigo-100">
          <CardHeader
            title={
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <span>AI Exam Paper Studio</span>
              </div>
            }
            subtitle="Synthesize comprehensive university question papers"
          />
          <CardContent className="text-xs text-slate-600">
            Generate questions mapped to syllabus units, Bloom's cognitive taxonomy, and mark rubrics.
          </CardContent>
          <CardFooter>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onNavigate('ai-tools')}
              className="w-full text-xs bg-indigo-600 hover:bg-indigo-700 border-indigo-600"
            >
              Launch Question Paper Studio
            </Button>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader
            title={
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <Award className="w-5 h-5 text-emerald-600" />
                <span>Spreadsheet Gradebook</span>
              </div>
            }
            subtitle="Live marks entry grid with automatic letter grades"
          />
          <CardContent className="text-xs text-slate-600">
            Fast batch grade entry with class average analytics and institutional database persistence.
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('grades')}
              className="w-full text-xs"
            >
              Open Gradebook Spreadsheet
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

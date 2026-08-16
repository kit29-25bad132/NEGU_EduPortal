import React, { useState } from 'react';
import {
  GraduationCap,
  LayoutDashboard,
  MapPin,
  Radio,
  BookOpen,
  FileText,
  Award,
  CalendarCheck,
  Sparkles,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Bell,
  ChevronRight,
  Menu,
  X,
  Shield,
  Building2,
  FileCheck2,
  Layers,
  HelpCircle,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { usePortalStore } from '../../lib/store';
import { UserRole } from '../../types';
import { VerifiedStudentBadge, Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface DashboardShellProps {
  children: React.ReactNode;
  activeSection: string;
  onSectionChange: (section: string) => void;
  onNavigateHome: () => void;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({
  children,
  activeSection,
  onSectionChange,
  onNavigateHome,
}) => {
  const {
    currentRole,
    currentUser,
    setRole,
    logout,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = usePortalStore();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);

  const unreadNotifs = notifications.filter((n) => !n.isRead);

  // Navigation Links tailored to authenticated role
  const roleNavItems: Record<UserRole, { id: string; label: string; icon: React.ReactNode; badge?: string }[]> = {
    student: [
      { id: 'overview', label: 'Dashboard Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
      { id: 'attendance', label: 'Attendance & Geofence', icon: <MapPin className="w-4 h-4" />, badge: 'GPS' },
      { id: 'courses', label: 'My Enrolled Courses', icon: <BookOpen className="w-4 h-4" /> },
      { id: 'assignments', label: 'Assignments & Submissions', icon: <FileText className="w-4 h-4" /> },
      { id: 'grades', label: 'Examinations & Grades', icon: <Award className="w-4 h-4" /> },
      { id: 'leave', label: 'Academic Leave Requests', icon: <CalendarCheck className="w-4 h-4" /> },
      { id: 'ai-insights', label: 'AI Academic Intelligence', icon: <Sparkles className="w-4 h-4" />, badge: 'AI' },
      { id: 'reports', label: 'Performance Reports', icon: <BarChart3 className="w-4 h-4" /> },
    ],
    teacher: [
      { id: 'overview', label: 'Faculty Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      { id: 'attendance', label: 'Live Geofence Attendance', icon: <Radio className="w-4 h-4" />, badge: 'Live' },
      { id: 'classes', label: 'Class & Student Rosters', icon: <Users className="w-4 h-4" /> },
      { id: 'assignments', label: 'Assignments & AI Grading', icon: <FileText className="w-4 h-4" /> },
      { id: 'grades', label: 'Exam Spreadsheet Grades', icon: <Award className="w-4 h-4" /> },
      { id: 'ai-tools', label: 'AI Question Generator', icon: <Sparkles className="w-4 h-4" />, badge: 'GenAI' },
      { id: 'leave', label: 'Leave Reviews & Approvals', icon: <CalendarCheck className="w-4 h-4" /> },
      { id: 'reports', label: 'Class Academic Reports', icon: <BarChart3 className="w-4 h-4" /> },
    ],
    hod: [
      { id: 'overview', label: 'Department Overview', icon: <Building2 className="w-4 h-4" /> },
      { id: 'attendance-escalations', label: 'Attendance Escalations', icon: <MapPin className="w-4 h-4" />, badge: 'Flags' },
      { id: 'classes', label: 'Classes & Faculty Load', icon: <Users className="w-4 h-4" /> },
      { id: 'ai-risk', label: 'AI Department Risk Report', icon: <Sparkles className="w-4 h-4" />, badge: 'At-Risk' },
      { id: 'courses', label: 'Department Curriculum', icon: <BookOpen className="w-4 h-4" /> },
      { id: 'reports', label: 'Institutional Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    ],
    admin: [
      { id: 'overview', label: 'Executive Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
      { id: 'roster', label: 'Student Roster Upload', icon: <FileCheck2 className="w-4 h-4" />, badge: 'CSV' },
      { id: 'departments', label: 'Departments & Programs', icon: <Building2 className="w-4 h-4" /> },
      { id: 'classes', label: 'Classes & Staff Mapping', icon: <Layers className="w-4 h-4" /> },
      { id: 'courses', label: 'University Courses', icon: <BookOpen className="w-4 h-4" /> },
      { id: 'reports', label: 'University Reports & Audit', icon: <BarChart3 className="w-4 h-4" /> },
    ],
  };

  const navItems = roleNavItems[currentRole] || roleNavItems.student;

  const roleMeta: Record<UserRole, { label: string; tag: string; color: string }> = {
    student: { label: 'Student Portal', tag: 'Undergraduate', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    teacher: { label: 'Faculty Portal', tag: 'Course Instructor', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    hod: { label: 'HOD Authority', tag: 'Department Head', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    admin: { label: 'Admin Portal', tag: 'System Administrator', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-800 antialiased">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-2" onClick={onNavigateHome}>
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="font-bold text-base text-slate-900">NEGU-EduPortal</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-slate-600 rounded-lg hover:bg-slate-100"
            aria-label="Toggle navigation menu"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar (Desktop & Mobile Drawer) */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-72 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Sidebar Brand */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={onNavigateHome}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-900 to-blue-700 flex items-center justify-center text-white shadow-xs">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-base text-slate-900 tracking-tight block">
                  NEGU-EduPortal
                </span>
                <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">
                  Academic Platform
                </span>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User & Role Badge */}
          <div className="p-4 mx-3 my-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${roleMeta[currentRole].color}`}>
                {roleMeta[currentRole].label}
              </span>
              {currentRole === 'student' && <VerifiedStudentBadge registrationNumber={currentUser.registrationNumber} />}
            </div>
            <h4 className="font-bold text-sm text-slate-900 truncate">{currentUser.fullName}</h4>
            <p className="text-xs text-slate-500 truncate mt-0.5">
              {currentUser.departmentName || 'National Educational Governance University'}
            </p>
            {currentUser.classCode && (
              <p className="text-[11px] font-mono text-blue-600 font-semibold mt-1">
                Section: {currentUser.classCode} • Sem {currentUser.semester || 6}
              </p>
            )}
          </div>

          {/* Role Navigation Menu */}
          <div className="px-3 py-2 flex-1">
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Workspace Navigation
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSectionChange(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs border border-blue-100'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={isActive ? 'text-blue-600' : 'text-slate-400'}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                          isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Sidebar Footer / Quick Switcher */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/50 space-y-2">
          {/* Role Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Role: <strong className="capitalize">{currentRole}</strong></span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${roleSwitcherOpen ? 'rotate-90' : ''}`} />
            </button>

            {roleSwitcherOpen && (
              <div className="absolute bottom-12 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 space-y-1 z-50 animate-in fade-in zoom-in-95">
                <p className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase">Demo Switcher</p>
                {(['student', 'teacher', 'hod', 'admin'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setRole(r);
                      setRoleSwitcherOpen(false);
                      onSectionChange('overview');
                    }}
                    className={`w-full text-left px-2.5 py-1.5 text-xs rounded-md capitalize transition-colors cursor-pointer ${
                      currentRole === r ? 'bg-blue-600 text-white font-semibold' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {r} View
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Home and Logout */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onNavigateHome}
              className="w-full text-xs h-8"
            >
              Public Home
            </Button>
            <button
              onClick={logout}
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="hidden md:flex bg-white border-b border-slate-200 px-6 py-3.5 items-center justify-between sticky top-0 z-20 shadow-2xs">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-900 capitalize">{currentRole} Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-blue-600 font-medium capitalize">
              {navItems.find((i) => i.id === activeSection)?.label || activeSection}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Academic Session Pill */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full border border-slate-200">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Academic Year 2025-26 • Spring Semester</span>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="relative p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifs.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadNotifs.length}
                  </span>
                )}
              </button>

              {notifDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 py-3 z-50 animate-in fade-in zoom-in-95"
                  onMouseLeave={() => setNotifDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Notifications ({notifications.length})
                      </h4>
                      <p className="text-[11px] text-slate-400">Institutional updates & alerts</p>
                    </div>
                    {unreadNotifs.length > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-[11px] text-blue-600 hover:underline font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-6">No notifications</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={`p-3 text-xs transition-colors hover:bg-slate-50 cursor-pointer ${
                            !n.isRead ? 'bg-blue-50/40 font-medium' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-slate-900">{n.title}</span>
                            {!n.isRead && (
                              <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
                            )}
                          </div>
                          <p className="text-slate-600 leading-relaxed">{n.message}</p>
                          <span className="text-[10px] text-slate-400 block mt-1">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Mini */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {currentUser.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>
              <div className="hidden xl:block text-left">
                <span className="block text-xs font-semibold text-slate-900 leading-tight truncate">
                  {currentUser.fullName}
                </span>
                <span className="block text-[10px] text-slate-500 capitalize">
                  {currentRole}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Section Content */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

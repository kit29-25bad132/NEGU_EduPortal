/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePortalStore } from './lib/store';
import { UserRole } from './types';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { DashboardShell } from './components/layout/DashboardShell';
import { CampusDirectoryModal } from './components/layout/CampusDirectoryModal';
import { HelpCenterModal } from './components/layout/HelpCenterModal';

// Role-specific overviews
import { StudentOverview } from './components/dashboards/StudentOverview';
import { TeacherOverview } from './components/dashboards/TeacherOverview';
import { HODOverview } from './components/dashboards/HODOverview';
import { AdminOverview } from './components/dashboards/AdminOverview';

// Feature modules
import { TeacherAttendanceSession } from './components/attendance/TeacherAttendanceSession';
import { StudentQRCheckIn } from './components/attendance/StudentQRCheckIn';
import { AttendanceHistoryTable } from './components/attendance/AttendanceHistoryTable';
import { AttendanceEscalationsView } from './components/attendance/AttendanceEscalationsView';
import { AssignmentManager } from './components/academic/AssignmentManager';
import { GradeSheetTable } from './components/academic/GradeSheetTable';
import { CourseCatalogView } from './components/academic/CourseCatalogView';
import { ClassRosterManager } from './components/academic/ClassRosterManager';
import { DepartmentProgramManager } from './components/academic/DepartmentProgramManager';
import { AIQuestionPaperGenerator } from './components/academic/AIQuestionPaperGenerator';
import { LeaveManager } from './components/leave/LeaveManager';
import { AIInsightsCard } from './components/ai/AIInsightsCard';
import { AdaptiveStudyPlanView } from './components/ai/AdaptiveStudyPlanView';
import { AIRiskReportView } from './components/ai/AIRiskReportView';
import { AcademicReportGenerator } from './components/reports/AcademicReportGenerator';
import { RosterUploadModal } from './components/admin/RosterUploadModal';

export default function App() {
  const { currentUser, setRole } = usePortalStore();
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [isDirectoryOpen, setIsDirectoryOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const handleGlobalNavigate = (view: string) => {
    if (view === 'home' || view === 'overview') {
      setActiveSection('overview');
    } else if (view === 'courses') {
      setActiveSection('courses');
    } else if (view === 'contact') {
      setIsDirectoryOpen(true);
    } else if (view === 'help') {
      setIsHelpOpen(true);
    } else if (view.startsWith('dashboard-')) {
      const role = view.replace('dashboard-', '') as UserRole;
      setRole(role);
      setActiveSection('overview');
    } else {
      setActiveSection(view);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        if (currentUser.role === 'student') {
          return <StudentOverview onNavigate={setActiveSection} />;
        }
        if (currentUser.role === 'teacher') {
          return <TeacherOverview onNavigate={setActiveSection} />;
        }
        if (currentUser.role === 'hod') {
          return <HODOverview onNavigate={setActiveSection} />;
        }
        return <AdminOverview onNavigate={setActiveSection} />;

      case 'attendance':
        return (
          <div className="space-y-8">
            {currentUser.role === 'student' ? (
              <StudentQRCheckIn />
            ) : (
              <TeacherAttendanceSession />
            )}
            <AttendanceHistoryTable />
          </div>
        );

      case 'attendance-escalations':
        return <AttendanceEscalationsView />;

      case 'assignments':
        return <AssignmentManager />;

      case 'grades':
        return <GradeSheetTable />;

      case 'courses':
        return <CourseCatalogView />;

      case 'classes':
        return <ClassRosterManager />;

      case 'departments':
        return <DepartmentProgramManager />;

      case 'leave':
        return <LeaveManager />;

      case 'ai-insights':
        return (
          <div className="space-y-8">
            <AIInsightsCard />
            <AdaptiveStudyPlanView />
          </div>
        );

      case 'ai-risk':
        return <AIRiskReportView />;

      case 'ai-tools':
        return <AIQuestionPaperGenerator />;

      case 'reports':
        return <AcademicReportGenerator />;

      case 'roster':
        return <RosterUploadModal />;

      default:
        if (currentUser.role === 'student') {
          return <StudentOverview onNavigate={setActiveSection} />;
        }
        if (currentUser.role === 'teacher') {
          return <TeacherOverview onNavigate={setActiveSection} />;
        }
        if (currentUser.role === 'hod') {
          return <HODOverview onNavigate={setActiveSection} />;
        }
        return <AdminOverview onNavigate={setActiveSection} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 text-slate-900 antialiased font-sans">
      <Navbar currentView={activeSection} onNavigate={handleGlobalNavigate} />
      <div className="flex-1 w-full">
        <DashboardShell
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          onNavigateHome={() => setActiveSection('overview')}
        >
          {renderContent()}
        </DashboardShell>
      </div>
      <Footer />

      {/* Modals */}
      <CampusDirectoryModal
        isOpen={isDirectoryOpen}
        onClose={() => setIsDirectoryOpen(false)}
      />
      <HelpCenterModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}



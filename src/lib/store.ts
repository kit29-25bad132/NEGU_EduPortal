import { useState, useEffect } from 'react';
import {
  UserProfile,
  UserRole,
  Department,
  AcademicClass,
  Course,
  AttendanceSession,
  AttendanceScanRecord,
  Assignment,
  Submission,
  Exam,
  GradeRecord,
  LeaveRequest,
  AIInsight,
  SystemNotification,
  StudentMasterRecord,
  AIQuestionPaperDraft,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_STUDENT_MASTER,
  INITIAL_DEPARTMENTS,
  INITIAL_CLASSES,
  INITIAL_COURSES,
  INITIAL_ATTENDANCE_SESSIONS,
  INITIAL_ATTENDANCE_SCANS,
  INITIAL_ASSIGNMENTS,
  INITIAL_SUBMISSIONS,
  INITIAL_EXAMS,
  INITIAL_GRADES,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_AI_INSIGHTS,
  INITIAL_NOTIFICATIONS,
} from './mockData';

const STORAGE_KEY = 'negu_eduportal_state_v1';

interface PortalState {
  currentRole: UserRole;
  currentUser: UserProfile;
  studentMaster: StudentMasterRecord[];
  departments: Department[];
  classes: AcademicClass[];
  courses: Course[];
  attendanceSessions: AttendanceSession[];
  attendanceScans: AttendanceScanRecord[];
  assignments: Assignment[];
  submissions: Submission[];
  exams: Exam[];
  grades: GradeRecord[];
  leaveRequests: LeaveRequest[];
  aiInsights: AIInsight[];
  notifications: SystemNotification[];
  questionPapers: AIQuestionPaperDraft[];
}

function getInitialState(): PortalState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        currentUser: parsed.currentUser || INITIAL_USERS[parsed.currentRole || 'student'],
      };
    }
  } catch (e) {
    // fallback
  }

  return {
    currentRole: 'student',
    currentUser: INITIAL_USERS.student,
    studentMaster: INITIAL_STUDENT_MASTER,
    departments: INITIAL_DEPARTMENTS,
    classes: INITIAL_CLASSES,
    courses: INITIAL_COURSES,
    attendanceSessions: INITIAL_ATTENDANCE_SESSIONS,
    attendanceScans: INITIAL_ATTENDANCE_SCANS,
    assignments: INITIAL_ASSIGNMENTS,
    submissions: INITIAL_SUBMISSIONS,
    exams: INITIAL_EXAMS,
    grades: INITIAL_GRADES,
    leaveRequests: INITIAL_LEAVE_REQUESTS,
    aiInsights: INITIAL_AI_INSIGHTS,
    notifications: INITIAL_NOTIFICATIONS,
    questionPapers: [],
  };
}

let globalState = getInitialState();
const listeners = new Set<() => void>();

function notify() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(globalState));
  } catch (e) {}
  listeners.forEach((l) => l());
}

export function usePortalStore() {
  const [state, setState] = useState<PortalState>(globalState);

  useEffect(() => {
    const update = () => setState({ ...globalState });
    listeners.add(update);
    return () => {
      listeners.delete(update);
    };
  }, []);

  // Action methods
  const setRole = (role: UserRole) => {
    globalState = {
      ...globalState,
      currentRole: role,
      currentUser: INITIAL_USERS[role],
    };
    notify();
  };

  const loginUser = (email: string, role: UserRole, registrationNumber?: string) => {
    const defaultUser = INITIAL_USERS[role];
    const user: UserProfile = {
      ...defaultUser,
      email,
      registrationNumber: registrationNumber || defaultUser.registrationNumber,
      isVerified: true,
    };
    globalState = {
      ...globalState,
      currentRole: role,
      currentUser: user,
    };
    notify();
  };

  const logout = () => {
    globalState = {
      ...globalState,
      currentRole: 'student',
      currentUser: INITIAL_USERS.student,
    };
    notify();
  };

  // Attendance Actions
  const startAttendanceSession = (session: AttendanceSession) => {
    globalState = {
      ...globalState,
      attendanceSessions: [session, ...globalState.attendanceSessions],
    };
    notify();
  };

  const closeAttendanceSession = (sessionId: string) => {
    globalState = {
      ...globalState,
      attendanceSessions: globalState.attendanceSessions.map((s) =>
        s.id === sessionId ? { ...s, status: 'CLOSED', endTime: new Date().toLocaleTimeString() } : s
      ),
    };
    notify();
  };

  const addAttendanceScan = (scan: AttendanceScanRecord) => {
    // Check for duplicate scan
    const existingIdx = globalState.attendanceScans.findIndex(
      (s) => s.sessionId === scan.sessionId && s.studentId === scan.studentId
    );

    let updatedScans = [...globalState.attendanceScans];
    if (existingIdx >= 0) {
      updatedScans[existingIdx] = scan;
    } else {
      updatedScans = [scan, ...updatedScans];
    }

    // Recalculate session stats
    const sessionScans = updatedScans.filter((s) => s.sessionId === scan.sessionId);
    const present = sessionScans.filter((s) => s.state === 'PRESENT').length;
    const flagged = sessionScans.filter((s) => s.state === 'FLAGGED').length;
    const excused = sessionScans.filter((s) => s.state === 'EXCUSED').length;
    const total = 64;

    const updatedSessions = globalState.attendanceSessions.map((sess) => {
      if (sess.id === scan.sessionId) {
        return {
          ...sess,
          stats: {
            totalStudents: total,
            present,
            flagged,
            excused,
            notScanned: Math.max(0, total - (present + flagged + excused)),
          },
        };
      }
      return sess;
    });

    globalState = {
      ...globalState,
      attendanceScans: updatedScans,
      attendanceSessions: updatedSessions,
    };
    notify();
  };

  const resolveAttendanceScan = (scanId: string, newState: 'PRESENT' | 'ABSENT' | 'EXCUSED', notes?: string) => {
    const updatedScans = globalState.attendanceScans.map((s) =>
      s.id === scanId
        ? {
            ...s,
            state: newState,
            resolutionNotes: notes || `Manually resolved to ${newState} by instructor`,
            flagReason: undefined,
          }
        : s
    );

    globalState = {
      ...globalState,
      attendanceScans: updatedScans,
    };
    notify();
  };

  // Leave Actions
  const applyLeave = (req: Omit<LeaveRequest, 'id' | 'createdAt' | 'status'>) => {
    const newLeave: LeaveRequest = {
      ...req,
      id: `leave-${Date.now()}`,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    globalState = {
      ...globalState,
      leaveRequests: [newLeave, ...globalState.leaveRequests],
      notifications: [
        {
          id: `notif-${Date.now()}`,
          userId: 'user-tch-01',
          title: 'New Leave Request Received',
          message: `${req.studentName} applied for academic leave (${req.fromDate} to ${req.toDate}).`,
          type: 'leave_status',
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        ...globalState.notifications,
      ],
    };
    notify();
  };

  const reviewLeave = (leaveId: string, status: 'APPROVED' | 'REJECTED', notes?: string) => {
    const targetLeave = globalState.leaveRequests.find((l) => l.id === leaveId);
    const updatedLeaves = globalState.leaveRequests.map((l) =>
      l.id === leaveId
        ? {
            ...l,
            status,
            reviewedBy: globalState.currentUser.id,
            reviewerName: globalState.currentUser.fullName,
            reviewedAt: new Date().toISOString(),
            reviewerNotes: notes,
          }
        : l
    );

    // If approved, automatically excuse any attendance on that date
    let updatedScans = [...globalState.attendanceScans];
    if (status === 'APPROVED' && targetLeave) {
      updatedScans = updatedScans.map((scan) => {
        if (scan.studentId === targetLeave.studentId && scan.sessionDate === targetLeave.fromDate) {
          return {
            ...scan,
            state: 'EXCUSED',
            resolutionNotes: `Auto-excused via approved leave request (${targetLeave.reason.slice(0, 30)}...)`,
          };
        }
        return scan;
      });
    }

    globalState = {
      ...globalState,
      leaveRequests: updatedLeaves,
      attendanceScans: updatedScans,
      notifications: [
        {
          id: `notif-${Date.now()}`,
          userId: targetLeave?.studentId || 'user-std-01',
          title: `Leave Request ${status}`,
          message: `Your academic leave from ${targetLeave?.fromDate} to ${targetLeave?.toDate} was ${status.toLowerCase()}.${notes ? ` Note: ${notes}` : ''}`,
          type: 'leave_status',
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        ...globalState.notifications,
      ],
    };
    notify();
  };

  // Assignment Actions
  const createAssignment = (asg: Omit<Assignment, 'id' | 'createdAt' | 'totalSubmissions' | 'gradedCount'>) => {
    const newAsg: Assignment = {
      ...asg,
      id: `asg-${Date.now()}`,
      createdAt: new Date().toISOString(),
      totalSubmissions: 0,
      gradedCount: 0,
    };
    globalState = {
      ...globalState,
      assignments: [newAsg, ...globalState.assignments],
      notifications: [
        {
          id: `notif-${Date.now()}`,
          userId: 'user-std-01',
          title: `New Assignment Published: ${asg.title}`,
          message: `${asg.courseCode} assignment due on ${new Date(asg.dueDate).toLocaleDateString()}.`,
          type: 'assignment_due',
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        ...globalState.notifications,
      ],
    };
    notify();
  };

  const submitAssignment = (sub: Omit<Submission, 'id' | 'submittedAt' | 'status'>) => {
    const newSub: Submission = {
      ...sub,
      id: `sub-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: 'SUBMITTED',
    };
    const updatedAssignments = globalState.assignments.map((a) =>
      a.id === sub.assignmentId ? { ...a, totalSubmissions: (a.totalSubmissions || 0) + 1 } : a
    );
    globalState = {
      ...globalState,
      submissions: [newSub, ...globalState.submissions],
      assignments: updatedAssignments,
    };
    notify();
  };

  const gradeSubmission = (
    submissionId: string,
    marks: number,
    feedback: string,
    aiFeedback?: { strengths?: string[]; weaknesses?: string[]; suggestions?: string[] }
  ) => {
    const updatedSubmissions = globalState.submissions.map((s) =>
      s.id === submissionId
        ? {
            ...s,
            status: 'GRADED' as const,
            marksAwarded: marks,
            teacherFeedback: feedback,
            aiStrengths: aiFeedback?.strengths || s.aiStrengths,
            aiWeaknesses: aiFeedback?.weaknesses || s.aiWeaknesses,
            aiSuggestions: aiFeedback?.suggestions || s.aiSuggestions,
          }
        : s
    );
    globalState = {
      ...globalState,
      submissions: updatedSubmissions,
    };
    notify();
  };

  // Exam & Grade Actions
  const createExam = (exam: Omit<Exam, 'id'>) => {
    const newExam: Exam = {
      ...exam,
      id: `exam-${Date.now()}`,
    };
    globalState = {
      ...globalState,
      exams: [newExam, ...globalState.exams],
    };
    notify();
  };

  const saveGrades = (newGrades: GradeRecord[]) => {
    const existing = [...globalState.grades];
    newGrades.forEach((ng) => {
      const idx = existing.findIndex((g) => g.examId === ng.examId && g.studentId === ng.studentId);
      if (idx >= 0) existing[idx] = ng;
      else existing.push(ng);
    });
    globalState = {
      ...globalState,
      grades: existing,
    };
    notify();
  };

  // AI Question Papers
  const addQuestionPaper = (draft: AIQuestionPaperDraft) => {
    globalState = {
      ...globalState,
      questionPapers: [draft, ...globalState.questionPapers],
    };
    notify();
  };

  // Roster Import
  const importRosterRecords = (records: StudentMasterRecord[]) => {
    const existingMap = new Map(globalState.studentMaster.map((r) => [r.registrationNumber, r]));
    records.forEach((r) => existingMap.set(r.registrationNumber, r));
    globalState = {
      ...globalState,
      studentMaster: Array.from(existingMap.values()),
    };
    notify();
  };

  // Notifications
  const markNotificationRead = (notifId: string) => {
    globalState = {
      ...globalState,
      notifications: globalState.notifications.map((n) =>
        n.id === notifId ? { ...n, isRead: true } : n
      ),
    };
    notify();
  };

  const markAllNotificationsRead = () => {
    globalState = {
      ...globalState,
      notifications: globalState.notifications.map((n) => ({ ...n, isRead: true })),
    };
    notify();
  };

  // Toggle study block in adaptive study plan
  const toggleStudyBlock = (insightId: string, day: string, subject: string) => {
    const updated = globalState.aiInsights.map((insight) => {
      if (insight.id === insightId && insight.studyBlocks) {
        return {
          ...insight,
          studyBlocks: insight.studyBlocks.map((b) =>
            b.day === day && b.subject === subject ? { ...b, completed: !b.completed } : b
          ),
        };
      }
      return insight;
    });
    globalState = {
      ...globalState,
      aiInsights: updated,
    };
    notify();
  };

  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEY);
    globalState = getInitialState();
    notify();
  };

  return {
    ...state,
    setRole,
    loginUser,
    logout,
    startAttendanceSession,
    closeAttendanceSession,
    addAttendanceScan,
    resolveAttendanceScan,
    applyLeave,
    reviewLeave,
    createAssignment,
    submitAssignment,
    gradeSubmission,
    createExam,
    saveGrades,
    addQuestionPaper,
    importRosterRecords,
    markNotificationRead,
    markAllNotificationsRead,
    toggleStudyBlock,
    resetAllData,
  };
}

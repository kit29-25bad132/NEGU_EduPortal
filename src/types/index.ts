/**
 * NEGU-EduPortal Type Definitions
 * Unified Academic Operating System
 */

export type UserRole = 'student' | 'teacher' | 'hod' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  departmentId?: string;
  departmentCode?: string;
  departmentName?: string;
  classId?: string;
  classCode?: string;
  registrationNumber?: string;
  isVerified: boolean;
  batchYear?: number;
  semester?: number;
  currentGpa?: number;
}

export interface StudentMasterRecord {
  id: string;
  registrationNumber: string;
  officialName: string;
  officialEmail: string;
  departmentCode: string;
  classCode: string;
  batchYear: number;
  status: 'ACTIVE' | 'SUSPENDED' | 'GRADUATED' | 'LEAVE';
}

export interface Department {
  id: string;
  code: string;
  name: string;
  description: string;
  hodId?: string;
  hodName?: string;
  studentCount: number;
  facultyCount: number;
  coursesCount: number;
  avgAttendance: number;
}

export interface AcademicClass {
  id: string;
  departmentId: string;
  departmentCode: string;
  code: string; // e.g. "CSE-3A"
  name: string; // e.g. "B.Tech CSE Year 3 Section A"
  academicYear: string;
  semester: number;
  advisorId?: string;
  advisorName?: string;
  mentorIds?: string[];
  studentCount: number;
}

export interface Course {
  id: string;
  code: string; // e.g. "CS301"
  title: string; // e.g. "Database Management Systems"
  departmentId: string;
  departmentCode: string;
  credits: number;
  semester: number;
  syllabus: string;
  instructorId?: string;
  instructorName?: string;
  schedule: string;
  room: string;
  category: 'Core' | 'Elective' | 'Lab' | 'Seminar';
  enrolledStudentsCount: number;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
}

export type AttendanceState = 'PRESENT' | 'FLAGGED' | 'ABSENT' | 'EXCUSED';

export interface AttendanceSession {
  id: string;
  classId: string;
  classCode: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  teacherId: string;
  teacherName: string;
  sessionDate: string; // YYYY-MM-DD
  startTime: string;
  endTime?: string;
  status: 'ACTIVE' | 'CLOSED' | 'CANCELLED';
  latitude: number;
  longitude: number;
  allowedRadiusMeters: number;
  rotationIntervalSeconds: number;
  stats?: {
    totalStudents: number;
    present: number;
    flagged: number;
    notScanned: number;
    excused: number;
  };
}

export interface AttendanceScanRecord {
  id: string;
  sessionId: string;
  studentId: string;
  studentName: string;
  studentRegistrationNumber: string;
  state: AttendanceState;
  scanTimestamp: string;
  studentLatitude?: number;
  studentLongitude?: number;
  calculatedDistanceMeters?: number;
  flagReason?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
  courseCode?: string;
  courseTitle?: string;
  sessionDate?: string;
}

export interface AttendanceRotatingToken {
  sessionId: string;
  nonce: string;
  tokenHash: string;
  expiresAt: number; // unix timestamp ms
  serverTime: number;
}

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface LeaveRequest {
  id: string;
  studentId: string;
  studentName: string;
  registrationNumber: string;
  classId: string;
  classCode: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: LeaveStatus;
  reviewedBy?: string;
  reviewerName?: string;
  reviewedAt?: string;
  reviewerNotes?: string;
  createdAt: string;
}

export interface Assignment {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  classId: string;
  classCode: string;
  teacherId: string;
  teacherName: string;
  title: string;
  description: string;
  dueDate: string;
  maxMarks: number;
  attachmentUrl?: string;
  createdAt: string;
  totalSubmissions?: number;
  gradedCount?: number;
}

export type SubmissionStatus = 'SUBMITTED' | 'GRADED' | 'LATE' | 'RESUBMIT_REQUESTED';

export interface Submission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  courseCode: string;
  studentId: string;
  studentName: string;
  registrationNumber: string;
  content: string;
  attachmentUrl?: string;
  submittedAt: string;
  status: SubmissionStatus;
  marksAwarded?: number;
  maxMarks: number;
  teacherFeedback?: string;
  aiDraftFeedback?: string;
  aiStrengths?: string[];
  aiWeaknesses?: string[];
  aiSuggestions?: string[];
}

export interface Exam {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  classId: string;
  classCode: string;
  title: string;
  examDate: string;
  maxMarks: number;
  weightagePercent: number;
}

export interface GradeRecord {
  id: string;
  examId: string;
  examTitle: string;
  courseCode: string;
  courseTitle: string;
  studentId: string;
  studentName: string;
  registrationNumber: string;
  marksObtained: number;
  maxMarks: number;
  percentage: number;
  letterGrade: string;
  remarks?: string;
  gradedAt: string;
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface RiskFactor {
  factor: string;
  metric: string;
  status: 'critical' | 'warning' | 'positive';
}

export interface StudyBlock {
  day: string;
  subject: string;
  durationMinutes: number;
  focusTopic: string;
  completed: boolean;
}

export interface AIInsight {
  id: string;
  studentId?: string;
  studentName?: string;
  departmentId?: string;
  classId?: string;
  insightType: 'STUDENT_RISK' | 'STUDY_PLAN' | 'DEPARTMENT_SUMMARY' | 'QUESTION_PAPER';
  riskLevel: RiskLevel;
  title: string;
  summary: string;
  riskFactors: RiskFactor[];
  recommendations: string[];
  studyBlocks?: StudyBlock[];
  confidenceScore: number;
  createdAt: string;
}

export interface AIQuestionItem {
  id: number;
  type: 'Multiple Choice' | 'Short Answer' | 'Analytical / Problem Solving' | 'Design / Architecture';
  question: string;
  marks: number;
  bloomLevel: 'Remember' | 'Understand' | 'Apply' | 'Analyze' | 'Evaluate';
  rubricHint?: string;
}

export interface AIQuestionPaperDraft {
  courseCode: string;
  courseTitle: string;
  syllabusTopics: string[];
  difficulty: 'Standard' | 'Challenging' | 'Comprehensive';
  totalMarks: number;
  durationMinutes: number;
  instructions: string[];
  questions: AIQuestionItem[];
}

export interface SystemNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'attendance_flag' | 'leave_status' | 'assignment_due' | 'grade_published' | 'ai_insight' | 'system';
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface RosterValidationRow {
  rowNumber: number;
  registrationNumber: string;
  officialName: string;
  officialEmail: string;
  departmentCode: string;
  classCode: string;
  batchYear: number;
  isValid: boolean;
  errors: string[];
}

export interface RosterValidationResult {
  totalRows: number;
  validCount: number;
  invalidCount: number;
  duplicateCount: number;
  rows: RosterValidationRow[];
}

import { z } from 'zod';

// Authentication & Registration Schemas
export const loginSchema = z.object({
  email: z.string().email('Please provide a valid institutional email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Please enter your official college email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  registrationNumber: z.string().min(3, 'Official registration number is required'),
  role: z.enum(['student', 'teacher', 'hod', 'admin']).default('student'),
  departmentCode: z.string().optional(),
});

// Attendance Schemas
export const startAttendanceSessionSchema = z.object({
  classId: z.string().min(1, 'Class ID is required'),
  courseId: z.string().min(1, 'Course ID is required'),
  teacherId: z.string().min(1, 'Teacher ID is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  allowedRadiusMeters: z.number().min(10).max(1000).default(50),
  rotationIntervalSeconds: z.number().min(5).max(60).default(15),
});

export const scanAttendanceSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  studentId: z.string().min(1, 'Student ID is required'),
  tokenNonce: z.string().min(1, 'Token nonce is required'),
  tokenHash: z.string().min(1, 'Token hash is required'),
  studentLatitude: z.number().min(-90).max(90),
  studentLongitude: z.number().min(-180).max(180),
});

export const resolveAttendanceFlagSchema = z.object({
  scanId: z.string().min(1, 'Scan ID is required'),
  resolvedState: z.enum(['PRESENT', 'ABSENT', 'EXCUSED']),
  resolutionNotes: z.string().optional(),
  resolvedBy: z.string().min(1, 'Teacher ID is required'),
});

// Leave Request Schema
export const leaveRequestSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  classId: z.string().min(1, 'Class ID is required'),
  fromDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid start date (YYYY-MM-DD) is required'),
  toDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid end date (YYYY-MM-DD) is required'),
  reason: z.string().min(10, 'Please provide a detailed academic leave justification (min 10 characters)'),
});

export const reviewLeaveSchema = z.object({
  leaveId: z.string().min(1, 'Leave ID is required'),
  status: z.enum(['APPROVED', 'REJECTED']),
  reviewerNotes: z.string().optional(),
  reviewedBy: z.string().min(1, 'Reviewer ID is required'),
});

// Assignment Schemas
export const createAssignmentSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
  classId: z.string().min(1, 'Class ID is required'),
  teacherId: z.string().min(1, 'Teacher ID is required'),
  title: z.string().min(3, 'Assignment title is required'),
  description: z.string().min(10, 'Assignment description is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  maxMarks: z.number().min(1).max(500).default(100),
  attachmentUrl: z.string().optional(),
});

export const submitAssignmentSchema = z.object({
  assignmentId: z.string().min(1, 'Assignment ID is required'),
  studentId: z.string().min(1, 'Student ID is required'),
  content: z.string().min(5, 'Submission content/code/answer is required'),
  attachmentUrl: z.string().optional(),
});

// Grade Entry Schema
export const gradeEntrySchema = z.object({
  examId: z.string().min(1, 'Exam ID is required'),
  studentId: z.string().min(1, 'Student ID is required'),
  marksObtained: z.number().min(0),
  maxMarks: z.number().min(1),
  remarks: z.string().optional(),
  gradedBy: z.string().min(1, 'Graded by ID is required'),
});

// AI Question Paper Generator Schema
export const generateQuestionPaperSchema = z.object({
  courseTitle: z.string().min(2),
  courseCode: z.string().min(2),
  syllabusTopics: z.array(z.string()).min(1, 'At least one topic required'),
  difficulty: z.enum(['Standard', 'Challenging', 'Comprehensive']).default('Standard'),
  totalMarks: z.number().default(100),
  durationMinutes: z.number().default(180),
});

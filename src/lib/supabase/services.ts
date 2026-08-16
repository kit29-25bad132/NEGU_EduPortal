import { getSupabaseClient } from './client';
import {
  Department,
  AcademicClass,
  Course,
  AttendanceSession,
  AttendanceScanRecord,
  Assignment,
  Submission,
  LeaveRequest,
} from '../../types';

// ============================================================================
// 1. DEPARTMENTS
// ============================================================================
export async function fetchDepartments(): Promise<Department[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase.from('departments').select('*').order('name');
  if (error) {
    console.error('Error fetching departments:', error.message);
    return [];
  }
  return (data || []).map((d) => ({
    id: d.id,
    code: d.code,
    name: d.name,
    description: d.description || '',
    hodId: d.hod_id || undefined,
    studentCount: 0,
    facultyCount: 0,
    coursesCount: 0,
    avgAttendance: 85,
  }));
}

export async function createDepartment(dept: Omit<Department, 'id'>): Promise<Department | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('departments')
    .insert([
      {
        code: dept.code,
        name: dept.name,
        description: dept.description,
        hod_id: dept.hodId,
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return {
    id: data.id,
    code: data.code,
    name: data.name,
    description: data.description || '',
    hodId: data.hod_id || undefined,
    studentCount: 0,
    facultyCount: 0,
    coursesCount: 0,
    avgAttendance: 85,
  };
}

// ============================================================================
// 2. CLASSES
// ============================================================================
export async function fetchClasses(): Promise<AcademicClass[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('classes')
    .select('*, departments(code, name)')
    .order('code');

  if (error) {
    console.error('Error fetching classes:', error.message);
    return [];
  }

  return (data || []).map((c) => ({
    id: c.id,
    departmentId: c.department_id,
    departmentCode: c.departments?.code || 'CSE',
    code: c.code,
    name: c.name,
    academicYear: c.academic_year,
    semester: c.semester,
    advisorId: c.advisor_id || '',
    studentCount: 0,
  }));
}

// ============================================================================
// 3. COURSES
// ============================================================================
export async function fetchCourses(): Promise<Course[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('courses')
    .select('*, departments(code)')
    .order('code');

  if (error) {
    console.error('Error fetching courses:', error.message);
    return [];
  }

  return (data || []).map((c) => ({
    id: c.id,
    code: c.code,
    title: c.name || c.title || 'Academic Course',
    departmentId: c.department_id,
    departmentCode: c.departments?.code || 'CSE',
    credits: c.credits || 3,
    semester: c.semester || 1,
    syllabus: c.syllabus || 'Standard Curriculum Syllabus',
    instructorId: c.teacher_id || c.instructor_id,
    schedule: c.schedule || 'Mon/Wed 10:00 AM',
    room: c.room || 'LH-101',
    category: c.category || 'Core',
    enrolledStudentsCount: 45,
    status: 'ACTIVE',
  }));
}

// ============================================================================
// 4. ATTENDANCE SESSIONS & SCANS
// ============================================================================
export async function fetchAttendanceSessions(): Promise<AttendanceSession[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('attendance_sessions')
    .select('*, classes(name, code), courses(code, name, title)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching attendance sessions:', error.message);
    return [];
  }

  return (data || []).map((s) => ({
    id: s.id,
    classId: s.class_id,
    classCode: s.classes?.code || 'CSE-3A',
    courseId: s.course_id,
    courseCode: s.courses?.code || 'CS301',
    courseTitle: s.courses?.title || s.courses?.name || 'Course',
    teacherId: s.teacher_id,
    teacherName: 'Prof. Instructor',
    sessionDate: s.date || new Date().toISOString().split('T')[0],
    startTime: s.start_time || '09:00 AM',
    endTime: s.end_time || undefined,
    status: s.status as 'ACTIVE' | 'CLOSED' | 'CANCELLED',
    latitude: s.geofence_lat || 12.9716,
    longitude: s.geofence_lng || 77.5946,
    allowedRadiusMeters: s.allowed_radius_meters || 50,
    rotationIntervalSeconds: s.rotation_interval_seconds || 15,
    stats: {
      totalStudents: s.total_students || 0,
      present: s.present_count || 0,
      flagged: s.flagged_count || 0,
      excused: s.excused_count || 0,
      notScanned: Math.max(0, (s.total_students || 0) - (s.present_count || 0 + s.flagged_count || 0)),
    },
  }));
}

export async function createAttendanceSessionInDb(session: AttendanceSession): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const { error } = await supabase.from('attendance_sessions').insert([
    {
      id: session.id,
      class_id: session.classId,
      course_id: session.courseId,
      teacher_id: session.teacherId,
      date: session.sessionDate,
      start_time: session.startTime,
      status: session.status,
      geofence_lat: session.latitude,
      geofence_lng: session.longitude,
      allowed_radius_meters: session.allowedRadiusMeters,
      rotation_interval_seconds: session.rotationIntervalSeconds,
      total_students: session.stats?.totalStudents || 64,
      present_count: session.stats?.present || 0,
      flagged_count: session.stats?.flagged || 0,
      excused_count: session.stats?.excused || 0,
    },
  ]);

  if (error) {
    console.error('Failed to create attendance session record:', error.message);
  }
}

export async function recordAttendanceScanInDb(scan: AttendanceScanRecord): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const { error } = await supabase.from('attendance_scans').upsert(
    [
      {
        id: scan.id,
        session_id: scan.sessionId,
        student_id: scan.studentId,
        scanned_at: scan.scanTimestamp,
        state: scan.state,
        distance_meters: scan.calculatedDistanceMeters,
        flag_reason: scan.flagReason || null,
      },
    ],
    { onConflict: 'session_id,student_id' }
  );

  if (error) {
    console.error('Failed to save attendance scan:', error.message);
  }
}

// ============================================================================
// 5. ASSIGNMENTS & SUBMISSIONS
// ============================================================================
export async function fetchAssignments(): Promise<Assignment[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('assignments')
    .select('*, courses(code, title, name), classes(code)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching assignments:', error.message);
    return [];
  }

  return (data || []).map((a) => ({
    id: a.id,
    courseId: a.course_id,
    courseCode: a.courses?.code || 'CS301',
    courseTitle: a.courses?.title || a.courses?.name || 'Course',
    classId: a.class_id,
    classCode: a.classes?.code || 'CSE-3A',
    teacherId: a.teacher_id || 'usr-teacher-01',
    teacherName: 'Faculty Advisor',
    title: a.title,
    description: a.description || '',
    dueDate: a.due_date,
    maxMarks: a.total_marks || 100,
    attachmentUrl: a.attachment_url || undefined,
    createdAt: a.created_at,
  }));
}

export async function fetchSubmissions(): Promise<Submission[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('submissions')
    .select('*, assignments(title), profiles(full_name)')
    .order('submitted_at', { ascending: false });

  if (error) {
    console.error('Error fetching submissions:', error.message);
    return [];
  }

  return (data || []).map((s) => ({
    id: s.id,
    assignmentId: s.assignment_id,
    assignmentTitle: s.assignments?.title || 'Assignment Submission',
    courseCode: 'CS301',
    studentId: s.student_id,
    studentName: s.profiles?.full_name || 'Student',
    registrationNumber: 'NEGU2026001',
    content: s.text_response || s.file_url || 'Submission content',
    attachmentUrl: s.file_url || undefined,
    submittedAt: s.submitted_at,
    status: s.status as 'SUBMITTED' | 'GRADED' | 'LATE',
    marksAwarded: s.marks_obtained !== null ? s.marks_obtained : undefined,
    maxMarks: 100,
    teacherFeedback: s.feedback || undefined,
  }));
}

// ============================================================================
// 6. LEAVE REQUESTS
// ============================================================================
export async function fetchLeaveRequests(): Promise<LeaveRequest[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('leave_requests')
    .select('*, profiles(full_name)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching leave requests:', error.message);
    return [];
  }

  return (data || []).map((l) => ({
    id: l.id,
    studentId: l.student_id,
    studentName: l.profiles?.full_name || 'Student',
    registrationNumber: 'NEGU2026001',
    classId: 'cls-cse-3a',
    classCode: 'CSE-3A',
    fromDate: l.start_date,
    toDate: l.end_date,
    reason: l.reason,
    status: l.status as 'PENDING' | 'APPROVED' | 'REJECTED',
    reviewedBy: l.reviewed_by || undefined,
    reviewedAt: l.reviewed_at || undefined,
    createdAt: l.created_at || new Date().toISOString(),
  }));
}

export async function submitLeaveRequestInDb(req: Omit<LeaveRequest, 'id' | 'createdAt'>): Promise<LeaveRequest | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('leave_requests')
    .insert([
      {
        student_id: req.studentId,
        leave_type: 'PERSONAL',
        start_date: req.fromDate,
        end_date: req.toDate,
        reason: req.reason,
        status: req.status,
      },
    ])
    .select('*, profiles(full_name)')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: data.id,
    studentId: data.student_id,
    studentName: data.profiles?.full_name || req.studentName,
    registrationNumber: req.registrationNumber,
    classId: req.classId,
    classCode: req.classCode,
    fromDate: data.start_date,
    toDate: data.end_date,
    reason: data.reason,
    status: data.status,
    createdAt: data.created_at,
  };
}

// ============================================================================
// 7. FILE STORAGE HELPERS
// ============================================================================
export async function uploadFileToBucket(
  bucketName: 'avatars' | 'assignment-submissions' | 'course-materials',
  filePath: string,
  file: File
): Promise<string> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { error } = await supabase.storage.from(bucketName).upload(filePath, file, {
    upsert: true,
  });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);
  return publicUrlData.publicUrl;
}

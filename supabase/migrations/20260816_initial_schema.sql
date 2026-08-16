-- ============================================================================
-- NEGU-EduPortal: Academic Operating System Database Schema
-- Version: 1.0.0 (PostgreSQL 15+ / Supabase Compatible)
-- Features: RLS, UUID PKs, Foreign Keys, Check Constraints, Geofencing, AI Insights
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. DEPARTMENTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    hod_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 2. CLASSES / SECTIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL, -- e.g. "CSE-3A"
    name VARCHAR(255) NOT NULL, -- e.g. "B.Tech CSE Year 3 Section A"
    academic_year VARCHAR(20) NOT NULL, -- e.g. "2025-2026"
    semester INT NOT NULL CHECK (semester BETWEEN 1 AND 8),
    advisor_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (department_id, code, academic_year)
);

-- ----------------------------------------------------------------------------
-- 3. USER PROFILES (Extends Supabase auth.users)
-- ----------------------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('student', 'teacher', 'hod', 'admin');

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    avatar_url TEXT,
    phone VARCHAR(30),
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 4. STUDENT MASTER ROSTER (Official University Enrollment Directory)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS student_master (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_number VARCHAR(50) UNIQUE NOT NULL,
    official_name VARCHAR(255) NOT NULL,
    official_email VARCHAR(255) UNIQUE NOT NULL,
    department_code VARCHAR(20) NOT NULL,
    class_code VARCHAR(50) NOT NULL,
    batch_year INT NOT NULL,
    status VARCHAR(30) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'GRADUATED', 'LEAVE')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 5. CLASS STAFF (Advisors, Mentors, Course Instructors)
-- ----------------------------------------------------------------------------
CREATE TYPE staff_class_role AS ENUM ('advisor', 'mentor', 'course_instructor');

CREATE TABLE IF NOT EXISTS class_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role staff_class_role NOT NULL DEFAULT 'course_instructor',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(class_id, staff_id, role)
);

-- ----------------------------------------------------------------------------
-- 6. CLASS STUDENTS (Enrollment mapping)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS class_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    roll_number VARCHAR(50),
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(class_id, student_id)
);

-- ----------------------------------------------------------------------------
-- 7. COURSES (Subjects)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL, -- e.g. "CS301"
    title VARCHAR(255) NOT NULL, -- e.g. "Database Management Systems"
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    credits INT NOT NULL DEFAULT 3 CHECK (credits > 0),
    semester INT NOT NULL CHECK (semester BETWEEN 1 AND 8),
    syllabus TEXT,
    instructor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    schedule VARCHAR(100), -- e.g. "Mon, Wed, Fri 09:00 - 10:00 AM"
    room VARCHAR(50), -- e.g. "Hall 302"
    status VARCHAR(30) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'ARCHIVED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 8. ATTENDANCE SESSIONS (Teacher live attendance broadcast)
-- ----------------------------------------------------------------------------
CREATE TYPE session_status AS ENUM ('ACTIVE', 'CLOSED', 'CANCELLED');

CREATE TABLE IF NOT EXISTS attendance_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    session_date DATE NOT NULL DEFAULT CURRENT_DATE,
    start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_time TIMESTAMPTZ,
    status session_status NOT NULL DEFAULT 'ACTIVE',
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    allowed_radius_meters INT NOT NULL DEFAULT 50 CHECK (allowed_radius_meters > 0),
    rotation_interval_seconds INT NOT NULL DEFAULT 15,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 9. ATTENDANCE TOKENS (Rotating signed nonces for anti-proxy QR)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendance_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    nonce VARCHAR(100) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 10. ATTENDANCE SCANS / RECORDS
-- ----------------------------------------------------------------------------
CREATE TYPE attendance_state AS ENUM ('PRESENT', 'FLAGGED', 'ABSENT', 'EXCUSED');

CREATE TABLE IF NOT EXISTS attendance_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    state attendance_state NOT NULL DEFAULT 'PRESENT',
    scan_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    student_latitude DOUBLE PRECISION,
    student_longitude DOUBLE PRECISION,
    calculated_distance_meters DOUBLE PRECISION,
    flag_reason TEXT, -- e.g. "Outside allowable geofence (94m > 50m)"
    resolved_by UUID REFERENCES profiles(id),
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (session_id, student_id)
);

-- ----------------------------------------------------------------------------
-- 11. LEAVE REQUESTS
-- ----------------------------------------------------------------------------
CREATE TYPE leave_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE IF NOT EXISTS leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    reason TEXT NOT NULL,
    status leave_status NOT NULL DEFAULT 'PENDING',
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    reviewer_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 12. ASSIGNMENTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    due_date TIMESTAMPTZ NOT NULL,
    max_marks INT NOT NULL DEFAULT 100 CHECK (max_marks > 0),
    attachment_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 13. SUBMISSIONS
-- ----------------------------------------------------------------------------
CREATE TYPE submission_status AS ENUM ('SUBMITTED', 'GRADED', 'LATE', 'RESUBMIT_REQUESTED');

CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT,
    attachment_url TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status submission_status NOT NULL DEFAULT 'SUBMITTED',
    marks_awarded INT CHECK (marks_awarded >= 0),
    teacher_feedback TEXT,
    ai_draft_feedback TEXT,
    ai_strengths TEXT[],
    ai_weaknesses TEXT[],
    ai_suggestions TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(assignment_id, student_id)
);

-- ----------------------------------------------------------------------------
-- 14. EXAMS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL, -- e.g. "Mid-Semester Examination 2026"
    exam_date DATE NOT NULL,
    max_marks INT NOT NULL DEFAULT 100 CHECK (max_marks > 0),
    weightage_percent INT DEFAULT 30,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 15. GRADES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    marks_obtained DOUBLE PRECISION NOT NULL CHECK (marks_obtained >= 0),
    letter_grade VARCHAR(5), -- e.g. "A+", "B", "F"
    remarks TEXT,
    graded_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(exam_id, student_id)
);

-- ----------------------------------------------------------------------------
-- 16. AI INSIGHTS & ACADEMIC RISK ANALYTICS
-- ----------------------------------------------------------------------------
CREATE TYPE risk_level AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

CREATE TABLE IF NOT EXISTS ai_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    insight_type VARCHAR(50) NOT NULL, -- 'STUDENT_RISK', 'STUDY_PLAN', 'DEPARTMENT_SUMMARY'
    risk_level risk_level DEFAULT 'LOW',
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    risk_factors JSONB, -- list of factor objects: {factor: string, metric: string, status: string}
    recommendations JSONB, -- list of actionable strings
    study_blocks JSONB, -- structured schedule blocks
    confidence_score DOUBLE PRECISION DEFAULT 0.92,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_department ON profiles(department_id);
CREATE INDEX IF NOT EXISTS idx_student_master_regno ON student_master(registration_number);
CREATE INDEX IF NOT EXISTS idx_student_master_email ON student_master(official_email);
CREATE INDEX IF NOT EXISTS idx_classes_dept ON classes(department_id);
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_class ON attendance_sessions(class_id);
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_course ON attendance_sessions(course_id);
CREATE INDEX IF NOT EXISTS idx_attendance_scans_session ON attendance_scans(session_id);
CREATE INDEX IF NOT EXISTS idx_attendance_scans_student ON attendance_scans(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_scans_state ON attendance_scans(state);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_exam ON grades(exam_id);
CREATE INDEX IF NOT EXISTS idx_grades_student ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_leave_student ON leave_requests(student_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION get_auth_user_role() 
RETURNS user_role AS $$
    SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 1. Profiles Policies
CREATE POLICY "Users can read own profile" ON profiles
    FOR SELECT USING (auth.uid() = id OR get_auth_user_role() IN ('teacher', 'hod', 'admin'));

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- 2. Attendance Scans Policies
CREATE POLICY "Students can view own scans" ON attendance_scans
    FOR SELECT USING (student_id = auth.uid() OR get_auth_user_role() IN ('teacher', 'hod', 'admin'));

CREATE POLICY "Students can insert own scans" ON attendance_scans
    FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY "Teachers and HODs can update scans" ON attendance_scans
    FOR UPDATE USING (get_auth_user_role() IN ('teacher', 'hod', 'admin'));

-- 3. Leave Requests Policies
CREATE POLICY "Students can manage own leave" ON leave_requests
    FOR ALL USING (student_id = auth.uid());

CREATE POLICY "Teachers and HODs can view/review leave" ON leave_requests
    FOR ALL USING (get_auth_user_role() IN ('teacher', 'hod', 'admin'));

-- 4. Assignments & Submissions Policies
CREATE POLICY "Public read for class assignments" ON assignments
    FOR SELECT USING (TRUE);

CREATE POLICY "Teachers can manage assignments" ON assignments
    FOR ALL USING (get_auth_user_role() IN ('teacher', 'hod', 'admin'));

CREATE POLICY "Students can view own submissions" ON submissions
    FOR SELECT USING (student_id = auth.uid() OR get_auth_user_role() IN ('teacher', 'hod', 'admin'));

CREATE POLICY "Students can insert own submissions" ON submissions
    FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY "Teachers can grade submissions" ON submissions
    FOR UPDATE USING (get_auth_user_role() IN ('teacher', 'hod', 'admin'));

-- 5. Grades Policies
CREATE POLICY "Students view own grades" ON grades
    FOR SELECT USING (student_id = auth.uid() OR get_auth_user_role() IN ('teacher', 'hod', 'admin'));

CREATE POLICY "Teachers manage grades" ON grades
    FOR ALL USING (get_auth_user_role() IN ('teacher', 'hod', 'admin'));

-- 6. AI Insights Policies
CREATE POLICY "Students view own AI insights" ON ai_insights
    FOR SELECT USING (student_id = auth.uid() OR get_auth_user_role() IN ('teacher', 'hod', 'admin'));

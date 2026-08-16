# NEGU-Edu Portal

### AI-Powered, Secure & Role-Based College Education Management Platform

> A unified digital education platform connecting **Students, Teachers, HODs and Administrators** through secure academic management, QR-based attendance, geofencing, assignments, examinations, analytics and explainable AI-powered academic insights.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%7C%20Auth%20%7C%20RLS-3ECF8E?logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Status](https://img.shields.io/badge/Status-Working%20Prototype-success)]()

---

## 🚀 Live Prototype

### **[▶ Launch NEGU-Edu Portal](https://negu-edu-portal.vercel.app/)**

> **Replace `YOUR_VERCEL_URL_HERE` with the actual deployed Vercel URL before submitting.**

**GitHub Repository:** `YOUR_GITHUB_REPOSITORY_URL`

The prototype demonstrates the complete academic workflow from authentication and role-based dashboards to attendance, assignments, grades, reports and AI-generated insights.

---

## 🎯 Problem

College academic operations are often fragmented across different systems and manual processes.

Students, teachers, HODs and administrators may need to use separate workflows for:

* Attendance
* Academic records
* Assignments
* Examinations
* Leave requests
* Student management
* Course/class management
* Academic reporting
* Performance monitoring

This fragmentation creates unnecessary administrative work, weak visibility into student progress and limited early intervention.

NEGU-Edu Portal brings these workflows together into one secure, role-aware platform.

---

# 💡 Our Solution

NEGU-Edu Portal is a centralized college education management platform designed around four primary roles:

```text
                    NEGU-Edu Portal
                           │
          ┌────────────────┼────────────────┐
          │                │                │
       Student          Teacher             HOD
          │                │                │
          └────────────────┼────────────────┘
                           │
                         Admin
                           │
                    Next.js 14 App
                           │
            ┌──────────────┼──────────────┐
            │              │              │
         Supabase        AI Engine      Realtime
            │              │              │
          RLS          Gemini/Groq     Dashboard
```

The platform combines **academic management + secure access control + attendance intelligence + AI-driven insights** rather than functioning as only a CRUD portal.

---

# ⭐ Core Features

## 1. Role-Based Authentication

Four distinct roles are supported:

| Role    | Primary Responsibility                      |
| ------- | ------------------------------------------- |
| Student | Academic activities and personal progress   |
| Teacher | Classes, attendance, assignments and grades |
| HOD     | Department-level monitoring and escalation  |
| Admin   | Institution-wide management                 |

Users are routed to their appropriate dashboard after authentication.

```text
Login
  ↓
Server-side role resolution
  ↓
┌──────────┬──────────┬──────────┬──────────┐
Student    Teacher      HOD       Admin
  ↓           ↓          ↓          ↓
Dashboard  Dashboard  Dashboard  Dashboard
```

---

# 📚 2. Academic Management

Administrators can manage:

* Departments
* Classes
* Courses
* Students
* Teachers
* Staff assignments

Academic relationships are maintained through a normalized relational database.

```text
Department
    ↓
Class
    ↓
Students

Department
    ↓
Courses

Class
    ↓
Class Staff
    ↓
Teachers
```

---

# 📍 3. Secure QR + Geofence Attendance

Attendance is designed as a secure multi-step workflow.

```text
Teacher
   ↓
Create Attendance Session
   ↓
Signed / Rotating QR
   ↓
Student Scans QR
   ↓
Server Validates Token
   ↓
Server Validates Location
   ↓
Attendance Recorded
   ↓
Teacher Dashboard Updated
```

The system includes protections against:

* Duplicate attendance
* Invalid tokens
* Expired QR codes
* Unauthorized access
* Location spoofing attempts
* Cross-student attendance manipulation

Attendance scans enforce uniqueness at the database level:

```text
UNIQUE(session_id, student_id)
```

---

# 🤖 4. AI Academic Intelligence

NEGU-Edu does not use AI merely as a chatbot.

The platform first derives structured academic signals and then uses an AI model to generate human-readable insights.

```text
Attendance
     +
Academic Performance
     +
Student Records
     ↓
Rule-Based Academic Analysis
     ↓
Risk / Weakness Identification
     ↓
AI Reasoning Layer
     ↓
Explainable Recommendation
     ↓
Student / Teacher / HOD Dashboard
```

Examples of generated insights include:

* Attendance concerns
* Weak academic areas
* Subject-level improvement recommendations
* Early intervention suggestions
* Student performance summaries

The design intentionally keeps deterministic calculations separate from generative AI so that core academic metrics remain explainable.

---

# 📝 5. Assignments & Submissions

Teachers can:

* Create assignments
* Set deadlines
* Assign work to classes
* Review submissions
* Grade students

Students can:

* View assignments
* Submit work
* Track submission status
* View results

---

# 🧪 6. Examinations & Grades

The platform supports:

* Examination records
* Student grades
* Teacher grade entry
* Student result viewing
* Academic performance analysis

The grade data also feeds the AI insight layer.

---

# 📨 7. Leave Management

Students can submit leave requests.

Teachers/HODs can review requests according to their permissions.

The workflow is designed to remain within the same authenticated academic ecosystem.

---

# 📊 8. Analytics & Reports

Dashboards provide role-specific visibility.

### Student

* Attendance
* Assignments
* Grades
* Leave
* AI insights

### Teacher

* Classes
* Students
* Attendance
* Assignments
* Grades

### HOD

* Department attendance
* Student performance
* Flagged students
* Escalations
* AI reports

### Admin

* Departments
* Classes
* Courses
* Students
* Teachers
* Institution-level reports

---

# 🔐 Security Architecture

Security is a core architectural requirement rather than an afterthought.

## Row Level Security

Supabase Row Level Security is enabled across protected tables.

Access is determined by authenticated identity and role.

```text
Student
  ↓
Own data only

Teacher
  ↓
Assigned classes / courses / students

HOD
  ↓
Own department

Admin
  ↓
Institution-wide access
```

Security helper functions include:

```text
is_admin()
is_hod_of(department_id)
```

---

## Authentication Security

Authentication is handled through Supabase Auth.

Passwords are never stored directly inside application tables.

Student registration additionally validates:

```text
College Email
       +
Registration Number
       ↓
student_master
       ↓
Verified Student
       ↓
Department + Class
```

Unauthorized access attempts are rejected through server-side authorization and database RLS.

---

# 🗄️ Database Architecture

The core relational schema contains:

```text
departments
classes
profiles
student_master
class_staff
class_students
courses

attendance_sessions
attendance_tokens
attendance_scans

leave_requests

assignments
submissions

exams
grades

ai_insights
```

Important relationships include:

```text
Department
 ├── Classes
 │    ├── Students
 │    └── Staff
 │
 └── Courses

Class
 └── Attendance Sessions
       └── Attendance Scans

Assignment
 └── Submissions

Exam
 └── Grades
```

The database uses:

* Primary keys
* Foreign keys
* Unique constraints
* NOT NULL constraints
* CHECK constraints
* Performance indexes
* Row Level Security

---

# 🏗️ Technical Architecture

```text
┌───────────────────────────────────────────┐
│                User Interface              │
│        Next.js 14 + TypeScript +          │
│             Tailwind CSS                  │
└─────────────────────┬─────────────────────┘
                      │
                      ▼
┌───────────────────────────────────────────┐
│             Next.js App Router            │
│            Server/API Layer                │
└───────────────┬───────────────┬───────────┘
                │               │
                ▼               ▼
       ┌────────────────┐  ┌───────────────┐
       │    Supabase    │  │   AI Layer    │
       │                │  │               │
       │ Auth           │  │ Gemini        │
       │ PostgreSQL     │  │ Groq          │
       │ RLS            │  │               │
       │ Realtime       │  │ Insights      │
       └────────────────┘  └───────────────┘
```

---

# 🧰 Tech Stack

| Layer           | Technology          |
| --------------- | ------------------- |
| Frontend        | Next.js 14          |
| Language        | TypeScript          |
| UI              | Tailwind CSS        |
| Components      | shadcn/ui           |
| Backend         | Next.js Server/API  |
| Database        | Supabase PostgreSQL |
| Authentication  | Supabase Auth       |
| Authorization   | PostgreSQL RLS      |
| AI              | Gemini / Groq       |
| Charts          | Recharts            |
| Validation      | Zod                 |
| Email           | Resend              |
| Deployment      | Vercel              |
| Version Control | Git + GitHub        |

The implementation follows the project's defined architecture rather than introducing unnecessary technologies.

---

# 📁 Project Structure

```text
NEGU-EduPortal/
│
├── app/
│   ├── auth/
│   ├── dashboard/
│   │   ├── admin/
│   │   ├── hod/
│   │   ├── teacher/
│   │   └── student/
│   └── api/
│
├── components/
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   └── ...
│
├── supabase/
│   └── migrations/
│
├── docs/
│   └── architecture.md
│
├── public/
│
├── .env.example
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

---

# ⚡ Quick Start

## Requirements

* Node.js 18+
* npm
* Supabase project
* Required AI API keys
* Git

## Clone

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd NEGU-EduPortal
```

## Install dependencies

```bash
npm install
```

## Configure environment

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key

RESEND_API_KEY=your_resend_api_key
```

> Never commit `.env.local` or production secrets.

## Run locally

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# 🧪 Validation & Testing

Before deployment, the project is validated using:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## End-to-End Role Testing

### Student

```text
Register
 ↓
College verification
 ↓
Student dashboard
 ↓
Attendance
 ↓
Assignments
 ↓
Submission
 ↓
Grades
 ↓
Leave
 ↓
AI Insights
```

### Teacher

```text
Login
 ↓
Teacher dashboard
 ↓
Class
 ↓
Attendance
 ↓
QR
 ↓
Assignments
 ↓
Grades
```

### HOD

```text
Login
 ↓
Department dashboard
 ↓
Attendance
 ↓
Flagged students
 ↓
Escalations
 ↓
AI reports
```

### Admin

```text
Login
 ↓
Admin dashboard
 ↓
Departments
 ↓
Classes
 ↓
Courses
 ↓
Students
 ↓
Teachers
 ↓
Reports
```

---

# 🔒 Security Testing

The following unauthorized scenarios are explicitly tested:

```text
Student → Another student's data       ❌
Student → Teacher data                  ❌
Teacher → Another teacher's class      ❌
HOD → Another department                ❌
Expired QR                              ❌
Duplicate attendance                   ❌
Invalid QR token                        ❌
Invalid coordinates                     ❌
Unauthorized API request                ❌
```

Expected result:

```text
ACCESS DENIED
```

---

# 🚀 Deployment

The application is designed for deployment on Vercel.

Production environment variables must be configured in the deployment platform.

Deployment flow:

```text
GitHub
   ↓
Vercel
   ↓
Next.js Production Build
   ↓
Live Application
   ↓
Production Smoke Test
```

After deployment, the live URL must be tested independently from localhost.

---

# 📌 Architecture Documentation

Detailed architecture documentation is available at:

```text
docs/architecture.md
```

It documents:

* Frontend architecture
* API/server architecture
* Supabase integration
* RLS security model
* Authentication
* Attendance architecture
* AI architecture
* Database relationships
* Deployment architecture

---

# 🏆 What Makes NEGU-Edu Different?

NEGU-Edu is designed as more than a conventional college CRUD application.

### 1. Security-first architecture

Authorization is enforced at the database layer using PostgreSQL RLS rather than relying only on frontend route protection.

### 2. AI with structured academic signals

AI recommendations are generated from actual academic indicators rather than functioning as an isolated chatbot.

### 3. Secure attendance workflow

QR attendance is combined with server-side validation, session control, uniqueness constraints and geolocation checks.

### 4. Four-role ecosystem

Students, teachers, HODs and administrators operate inside one connected system.

### 5. Actionable intelligence

The system moves from:

```text
Raw Academic Data
       ↓
Analytics
       ↓
AI Insight
       ↓
Recommended Action
```

instead of merely displaying static records.

### 6. Scalable architecture

The system separates:

```text
UI
↓
Server/API
↓
Database
↓
Authorization
↓
AI Services
```

allowing individual modules to evolve without redesigning the entire platform.

---

# 🧠 Design Philosophy

The project follows five principles:

**Secure by default**

Sensitive operations are protected through authentication, server-side authorization and RLS.

**Explainable AI**

Academic calculations remain understandable and AI-generated recommendations are derived from identifiable signals.

**Role-aware**

Every user sees the information and actions appropriate to their role.

**Modular**

Major academic capabilities are isolated into maintainable modules.

**Production-minded**

Environment variables, validation, database constraints, error handling, testing and deployment are treated as first-class concerns.

---

# 📈 Future Scope

The current prototype provides the foundation for a larger institutional platform.

Potential future extensions include:

* Advanced predictive student-risk models
* Personalized learning recommendations
* Automated timetable optimization
* AI-assisted question-paper generation
* Advanced plagiarism detection
* Parent/guardian portal
* Mobile application
* Institution-wide analytics
* Notification automation
* Deeper LMS integration
* Multi-college deployment
* Advanced anomaly detection for attendance

---

# 👥 Team

Built for **BUILDATHON 2026**.

**Team:** [YOUR TEAM NAME]

| Responsibility        | Member     |
| --------------------- | ---------- |
| Frontend & UI/UX      | [Member 1] |
| Backend & Database    | [Member 2] |
| AI & Intelligence     | [Member 3] |
| QA, Security & DevOps | [Member 4] |

---

# 🏁 BUILDATHON 2026

This project was developed for **BUILDATHON 2026 Round 1**.

The competition requires teams to submit a public GitHub repository and evaluates implementation, functionality, code quality, architecture, security and innovation through AI-assisted repository analysis.

The project therefore prioritizes:

```text
Functional Execution
        +
Code Quality
        +
Architecture
        +
Security
        +
Innovation
        +
Clear Documentation
```

---

# 📜 License

This project is developed as a hackathon prototype.

Add the appropriate project license here before public release.

---

# ⭐ Project Links

| Resource          | Link                                               |
| ----------------- | -------------------------------------------------- |
| 🚀 Live Prototype | **[OPEN LIVE APP](https://negu-edu-portal.vercel.app/)**          |
| 💻 GitHub         | **[VIEW SOURCE CODE](https://github.com/kit29-25bad132/NEGU_EduPortal.git)** |
| 🏗️ Architecture  | `docs/architecture.md`                             |
| 📖 Documentation  | `README.md`                                        |

---

## Built with purpose.

**NEGU-Edu Portal — Turning fragmented academic operations into one secure, intelligent ecosystem.**

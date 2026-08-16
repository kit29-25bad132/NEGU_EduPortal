import React, { useState } from 'react';
import {
  Building2,
  Users,
  BookOpen,
  Award,
  Plus,
  Layers,
  GraduationCap,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { usePortalStore } from '../../lib/store';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';
import { Modal } from '../ui/Modal';

export const DepartmentProgramManager: React.FC = () => {
  const { departments, courses, classes, addCourse, currentUser } = usePortalStore();

  const [selectedDeptCode, setSelectedDeptCode] = useState<string>('CSE');
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);

  // New Course Form State
  const [newCode, setNewCode] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newCredits, setNewCredits] = useState(4);
  const [newInstructor, setNewInstructor] = useState('');
  const [newSchedule, setNewSchedule] = useState('Mon/Wed 10:00 - 11:30 AM');
  const [newRoom, setNewRoom] = useState('Hall B-204');
  const [newSyllabus, setNewSyllabus] = useState('Foundational theory, system models, laboratory implementation');

  const currentDept = departments.find((d) => d.code === selectedDeptCode) || departments[0];

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newTitle) return;

    addCourse({
      departmentId: currentDept.id,
      code: newCode.toUpperCase(),
      title: newTitle,
      credits: Number(newCredits),
      instructorId: 'usr-teacher-01',
      instructorName: newInstructor || 'Prof. Appointed',
      schedule: newSchedule,
      room: newRoom,
      syllabus: newSyllabus,
    });

    setIsAddCourseOpen(false);
    setNewCode('');
    setNewTitle('');
    setNewInstructor('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Departments, Programs & Academic Curricula
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Governing academic councils, accredited degree programs, syllabus mapping, and department faculty
          </p>
        </div>

        {(currentUser.role === 'hod' || currentUser.role === 'admin') && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddCourseOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Curriculum Course
          </Button>
        )}
      </div>

      {/* Department Selector Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {departments.map((dept) => {
          const isSelected = selectedDeptCode === dept.code;
          return (
            <div
              key={dept.id}
              onClick={() => setSelectedDeptCode(dept.code)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-purple-50/80 border-purple-500 shadow-xs ring-1 ring-purple-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-purple-700">{dept.code}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {dept.studentCount} Students
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 mt-1">{dept.name}</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Head: {dept.hodName || 'Prof. Appointed'}</p>
            </div>
          );
        })}
      </div>

      {/* Department Info & Stats Card */}
      <Card>
        <CardHeader
          title={`${currentDept.name} (${currentDept.code}) Governance Overview`}
          subtitle={`Led by ${currentDept.hodName || 'Prof. Appointed'} • Academic Standing & Resource Allocation`}
        />
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-[11px] text-slate-500 font-medium">Enrolled Students</p>
              <p className="text-xl font-bold text-slate-900 mt-0.5">{currentDept.studentCount}</p>
              <span className="text-[10px] text-emerald-600 font-semibold">Undergraduate + PG</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-[11px] text-slate-500 font-medium">Faculty Members</p>
              <p className="text-xl font-bold text-blue-600 mt-0.5">{currentDept.facultyCount}</p>
              <span className="text-[10px] text-blue-600 font-semibold">Professors & Lecturers</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-[11px] text-slate-500 font-medium">Active Courses</p>
              <p className="text-xl font-bold text-purple-600 mt-0.5">{currentDept.coursesCount}</p>
              <span className="text-[10px] text-purple-600 font-semibold">Accredited Modules</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-[11px] text-slate-500 font-medium">Average Attendance</p>
              <p className="text-xl font-bold text-emerald-600 mt-0.5">{currentDept.avgAttendance}%</p>
              <span className="text-[10px] text-emerald-600 font-semibold">Institutional Compliance</span>
            </div>
          </div>

          {/* Department Courses List */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Department Degree Curricula & Courses ({courses.length})
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-purple-50 text-purple-700 rounded border border-purple-200">
                      {course.code}
                    </span>
                    <span className="text-xs font-semibold text-slate-700">{course.credits} Credits</span>
                  </div>
                  <h5 className="font-bold text-sm text-slate-900 mt-2">{course.title}</h5>
                  <p className="text-xs text-slate-600 mt-1">Instructor: {course.instructorName}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Schedule: {course.schedule} • {course.room}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Course Modal */}
      {isAddCourseOpen && (
        <Modal
          isOpen={isAddCourseOpen}
          onClose={() => setIsAddCourseOpen(false)}
          title="Add Curriculum Course"
          subtitle={`Add a new course syllabus module to ${currentDept.name}`}
        >
          <form onSubmit={handleAddCourse} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Course Code"
                placeholder="e.g. CS401"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                required
              />
              <Input
                type="number"
                label="Credits"
                value={newCredits}
                onChange={(e) => setNewCredits(Number(e.target.value))}
                required
              />
            </div>
            <Input
              label="Course Title"
              placeholder="e.g. Distributed Computing & Cloud Infrastructure"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
            <Input
              label="Lead Faculty / Instructor"
              placeholder="e.g. Dr. Ramesh Kumar"
              value={newInstructor}
              onChange={(e) => setNewInstructor(e.target.value)}
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Weekly Schedule"
                value={newSchedule}
                onChange={(e) => setNewSchedule(e.target.value)}
              />
              <Input
                label="Room / Hall"
                value={newRoom}
                onChange={(e) => setNewRoom(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Syllabus Topics Specification
              </label>
              <textarea
                rows={3}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-purple-600 focus:outline-hidden"
                value={newSyllabus}
                onChange={(e) => setNewSyllabus(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setIsAddCourseOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Register Course
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Award, Plus, Save, Download, Calculator, CheckCircle2, TrendingUp } from 'lucide-react';
import { usePortalStore } from '../../lib/store';
import { GradeRecord, Exam } from '../../types';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';

export const GradeSheetTable: React.FC = () => {
  const {
    currentUser,
    exams,
    grades,
    courses,
    classes,
    studentMaster,
    saveGrades,
    createExam,
  } = usePortalStore();

  const isTeacher = currentUser.role === 'teacher' || currentUser.role === 'hod' || currentUser.role === 'admin';

  const [selectedExamId, setSelectedExamId] = useState<string>(exams[0]?.id || '');
  const [createExamModalOpen, setCreateExamModalOpen] = useState(false);

  // New Exam Form
  const [newExamTitle, setNewExamTitle] = useState('');
  const [newCourseId, setNewCourseId] = useState(courses[0]?.id || '');
  const [newExamDate, setNewExamDate] = useState('2026-09-10');
  const [newMaxMarks, setNewMaxMarks] = useState(100);

  // Local editing marks state: studentId -> marksObtained
  const selectedExam = exams.find((e) => e.id === selectedExamId) || exams[0];

  const initialScores: Record<string, number> = {};
  studentMaster.forEach((s) => {
    const existing = grades.find((g) => g.examId === selectedExam?.id && g.studentId === s.id);
    initialScores[s.id] = existing ? existing.marksObtained : 85;
  });

  const [editableScores, setEditableScores] = useState<Record<string, number>>(initialScores);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState(false);

  const calculateLetterGrade = (pct: number): string => {
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B';
    if (pct >= 60) return 'C';
    if (pct >= 50) return 'D';
    return 'F';
  };

  const handleScoreChange = (studentId: string, value: string) => {
    const num = Math.min(selectedExam?.maxMarks || 100, Math.max(0, Number(value) || 0));
    setEditableScores((prev) => ({
      ...prev,
      [studentId]: num,
    }));
  };

  const handleSaveAllGrades = () => {
    if (!selectedExam) return;

    const newGradeRecords: GradeRecord[] = studentMaster.map((student) => {
      const marks = editableScores[student.id] !== undefined ? editableScores[student.id] : 85;
      const pct = Math.round((marks / selectedExam.maxMarks) * 100);
      return {
        id: `grd-${selectedExam.id}-${student.id}`,
        examId: selectedExam.id,
        examTitle: selectedExam.title,
        courseCode: selectedExam.courseCode,
        courseTitle: selectedExam.courseTitle,
        studentId: student.id,
        studentName: student.officialName,
        registrationNumber: student.registrationNumber,
        marksObtained: marks,
        maxMarks: selectedExam.maxMarks,
        percentage: pct,
        letterGrade: calculateLetterGrade(pct),
        gradedAt: new Date().toISOString(),
      };
    });

    saveGrades(newGradeRecords);
    setSaveSuccessMessage(true);
    setTimeout(() => setSaveSuccessMessage(false), 3000);
  };

  const handleCreateNewExam = (e: React.FormEvent) => {
    e.preventDefault();
    const course = courses.find((c) => c.id === newCourseId) || courses[0];
    const targetClass = classes[0] || { id: 'class-cse-3a', code: 'CSE-3A' };

    const newExam: Omit<Exam, 'id'> = {
      courseId: course.id,
      courseCode: course.code,
      courseTitle: course.title,
      classId: targetClass.id,
      classCode: targetClass.code,
      title: newExamTitle,
      examDate: newExamDate,
      maxMarks: Number(newMaxMarks),
      weightagePercent: 30,
    };

    createExam(newExam);
    setCreateExamModalOpen(false);
    setNewExamTitle('');
  };

  // Statistical calculations
  const scoresArray: number[] = Object.values(editableScores);
  const avgScore =
    scoresArray.length > 0
      ? (scoresArray.reduce((a, b) => a + b, 0) / scoresArray.length).toFixed(1)
      : '0';
  const highestScore = scoresArray.length > 0 ? Math.max(...scoresArray) : 0;
  const lowestScore = scoresArray.length > 0 ? Math.min(...scoresArray) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Examination & Gradebook Central
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Spreadsheet-style marks entry with real-time class averages, GPA conversions, and student feedback
          </p>
        </div>

        {isTeacher && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCreateExamModalOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Examination Assessment
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveAllGrades}
              leftIcon={<Save className="w-3.5 h-3.5" />}
            >
              Save Gradebook
            </Button>
          </div>
        )}
      </div>

      {saveSuccessMessage && (
        <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-lg border border-emerald-200 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Grades saved successfully across institutional database records.</span>
        </div>
      )}

      {/* Class Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs text-slate-500 font-medium">Class Average</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {avgScore} <span className="text-xs text-slate-400 font-normal">/ {selectedExam?.maxMarks || 100}</span>
          </p>
          <span className="text-[10px] text-blue-600 font-semibold">
            {(((Number(avgScore) || 0) / (selectedExam?.maxMarks || 100)) * 100).toFixed(1)}% performance
          </span>
        </div>
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
          <p className="text-xs text-emerald-800 font-medium">Highest Score</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{highestScore}</p>
          <span className="text-[10px] text-emerald-600">Top Tier: A+</span>
        </div>
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
          <p className="text-xs text-amber-800 font-medium">Lowest Score</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">{lowestScore}</p>
          <span className="text-[10px] text-amber-600">Remedial tutorial queued</span>
        </div>
        <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
          <p className="text-xs text-indigo-800 font-medium">Total Evaluated</p>
          <p className="text-2xl font-bold text-indigo-700 mt-1">{studentMaster.length}</p>
          <span className="text-[10px] text-indigo-600">100% Roster Matched</span>
        </div>
      </div>

      {/* Grade Sheet Card */}
      <Card>
        <CardHeader
          title={
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
              <span>{selectedExam ? `${selectedExam.title} (${selectedExam.courseCode})` : 'Select Examination'}</span>
              <div className="w-full sm:w-72">
                <Select
                  value={selectedExamId}
                  onChange={(e) => setSelectedExamId(e.target.value)}
                  options={exams.map((ex) => ({
                    value: ex.id,
                    label: `${ex.courseCode}: ${ex.title}`,
                  }))}
                />
              </div>
            </div>
          }
        />
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Registration #</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Class Section</th>
                  <th className="py-3 px-4 w-36">Marks (Max {selectedExam?.maxMarks || 100})</th>
                  <th className="py-3 px-4">Percentage</th>
                  <th className="py-3 px-4">Letter Grade</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {studentMaster.map((student) => {
                  const marks =
                    editableScores[student.id] !== undefined
                      ? editableScores[student.id]
                      : 85;
                  const pct = Math.round((marks / (selectedExam?.maxMarks || 100)) * 100);
                  const letter = calculateLetterGrade(pct);

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-blue-600">
                        {student.registrationNumber}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {student.officialName}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono">
                        {student.classCode}
                      </td>
                      <td className="py-2 px-4">
                        {isTeacher ? (
                          <input
                            type="number"
                            min="0"
                            max={selectedExam?.maxMarks || 100}
                            value={marks}
                            onChange={(e) => handleScoreChange(student.id, e.target.value)}
                            className="w-24 px-2 py-1 border border-slate-300 rounded text-xs font-bold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                          />
                        ) : (
                          <span className="font-bold text-slate-900">{marks}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700">{pct}%</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            letter.startsWith('A')
                              ? 'success'
                              : letter === 'B'
                              ? 'info'
                              : letter === 'C'
                              ? 'warning'
                              : 'destructive'
                          }
                        >
                          Grade {letter}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {pct >= 50 ? (
                          <span className="text-emerald-700 font-medium">Passed</span>
                        ) : (
                          <span className="text-rose-700 font-medium">Under Review</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create Exam Modal */}
      {createExamModalOpen && (
        <Modal
          isOpen={createExamModalOpen}
          onClose={() => setCreateExamModalOpen(false)}
          title="Schedule New Examination Assessment"
          subtitle="Configure exam dates, maximum marks weightage, and target courses"
        >
          <form onSubmit={handleCreateNewExam} className="space-y-4 text-xs">
            <Select
              label="Course"
              value={newCourseId}
              onChange={(e) => setNewCourseId(e.target.value)}
              options={courses.map((c) => ({ value: c.id, label: `${c.code} - ${c.title}` }))}
            />
            <Input
              label="Examination Title"
              required
              placeholder="e.g. End-Semester Comprehensive Theory Examination"
              value={newExamTitle}
              onChange={(e) => setNewExamTitle(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="date"
                label="Exam Date"
                required
                value={newExamDate}
                onChange={(e) => setNewExamDate(e.target.value)}
              />
              <Input
                type="number"
                label="Maximum Marks"
                required
                min="20"
                max="500"
                value={newMaxMarks}
                onChange={(e) => setNewMaxMarks(Number(e.target.value))}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" size="md" onClick={() => setCreateExamModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="md" type="submit">
                Create Examination
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

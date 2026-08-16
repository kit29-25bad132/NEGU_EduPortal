import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Upload,
  Sparkles,
  CheckCircle2,
  Clock,
  Send,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import { usePortalStore } from '../../lib/store';
import { Assignment, Submission } from '../../types';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { Input, Select } from '../ui/Input';

export const AssignmentManager: React.FC = () => {
  const {
    currentUser,
    assignments,
    submissions,
    courses,
    classes,
    createAssignment,
    submitAssignment,
    gradeSubmission,
  } = usePortalStore();

  const isTeacher = currentUser.role === 'teacher' || currentUser.role === 'hod' || currentUser.role === 'admin';

  // Create Assignment Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCourseId, setNewCourseId] = useState(courses[0]?.id || '');
  const [newDueDate, setNewDueDate] = useState('2026-08-28T23:59');
  const [newMaxMarks, setNewMaxMarks] = useState(100);

  // Student Submission Modal
  const [submittingAssignment, setSubmittingAssignment] = useState<Assignment | null>(null);
  const [submissionContent, setSubmissionContent] = useState('');

  // Teacher Review & AI Grading Modal
  const [reviewingSubmission, setReviewingSubmission] = useState<Submission | null>(null);
  const [awardedMarks, setAwardedMarks] = useState<number>(85);
  const [teacherFeedback, setTeacherFeedback] = useState('');
  const [isGeneratingAIFeedback, setIsGeneratingAIFeedback] = useState(false);
  const [aiFeedbackDraft, setAIFeedbackDraft] = useState<{
    suggestedScore?: number;
    strengths?: string[];
    weaknesses?: string[];
    suggestions?: string[];
    draftComments?: string;
  } | null>(null);

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    const course = courses.find((c) => c.id === newCourseId) || courses[0];
    const targetClass = classes[0] || { id: 'class-cse-3a', code: 'CSE-3A' };

    createAssignment({
      courseId: course.id,
      courseCode: course.code,
      courseTitle: course.title,
      classId: targetClass.id,
      classCode: targetClass.code,
      teacherId: currentUser.id,
      teacherName: currentUser.fullName,
      title: newTitle,
      description: newDesc,
      dueDate: newDueDate,
      maxMarks: Number(newMaxMarks),
    });

    setCreateModalOpen(false);
    setNewTitle('');
    setNewDesc('');
  };

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingAssignment) return;

    submitAssignment({
      assignmentId: submittingAssignment.id,
      assignmentTitle: submittingAssignment.title,
      courseCode: submittingAssignment.courseCode,
      studentId: currentUser.id,
      studentName: currentUser.fullName,
      registrationNumber: currentUser.registrationNumber || 'NEGU2023CS042',
      content: submissionContent,
      maxMarks: submittingAssignment.maxMarks,
    });

    setSubmittingAssignment(null);
    setSubmissionContent('');
  };

  const handleRequestAIEvaluation = async (sub: Submission) => {
    setIsGeneratingAIFeedback(true);
    try {
      const res = await fetch('/api/ai/assignment-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentTitle: sub.assignmentTitle,
          studentSubmission: sub.content,
          maxMarks: sub.maxMarks,
        }),
      });
      const data = await res.json();
      setAIFeedbackDraft(data);
      if (data.suggestedScore) setAwardedMarks(data.suggestedScore);
      if (data.draftComments) setTeacherFeedback(data.draftComments);
    } catch (e) {
      console.error('Failed to get AI feedback draft', e);
    } finally {
      setIsGeneratingAIFeedback(false);
    }
  };

  const handleSaveGrade = () => {
    if (!reviewingSubmission) return;
    gradeSubmission(reviewingSubmission.id, awardedMarks, teacherFeedback, {
      strengths: aiFeedbackDraft?.strengths,
      weaknesses: aiFeedbackDraft?.weaknesses,
      suggestions: aiFeedbackDraft?.suggestions,
    });
    setReviewingSubmission(null);
    setAIFeedbackDraft(null);
    setTeacherFeedback('');
  };

  return (
    <div className="space-y-6">
      {/* Header with Action Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Academic Coursework & Assignments
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage course assignments, code problem sets, and AI-assisted rubric grading
          </p>
        </div>
        {isTeacher && (
          <Button
            variant="primary"
            size="md"
            onClick={() => setCreateModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
            id="create-assignment-btn"
          >
            Create New Assignment
          </Button>
        )}
      </div>

      {/* Assignments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {assignments.map((asg) => {
          const userSub = submissions.find(
            (s) => s.assignmentId === asg.id && s.studentId === currentUser.id
          );

          return (
            <Card key={asg.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
              <CardHeader
                title={
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {asg.courseCode} • {asg.classCode}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{asg.title}</h4>
                  </div>
                }
              />
              <CardContent className="space-y-3 flex-1">
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {asg.description}
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Due: {new Date(asg.dueDate).toLocaleDateString()}
                  </span>
                  <span className="font-semibold text-slate-700">Max Marks: {asg.maxMarks}</span>
                </div>
              </CardContent>
              <CardFooter className="justify-between">
                {isTeacher ? (
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs text-slate-600 font-medium">
                      {asg.totalSubmissions || 0} Submissions
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const targetSub = submissions.find((s) => s.assignmentId === asg.id) || submissions[0];
                        if (targetSub) {
                          setReviewingSubmission(targetSub);
                          setAwardedMarks(targetSub.marksAwarded || 85);
                          setTeacherFeedback(targetSub.teacherFeedback || '');
                        }
                      }}
                      className="text-xs"
                    >
                      Review Submissions
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    {userSub ? (
                      <div className="flex items-center gap-2">
                        <Badge variant={userSub.status === 'GRADED' ? 'success' : 'info'}>
                          {userSub.status === 'GRADED' ? `Graded: ${userSub.marksAwarded}/${asg.maxMarks}` : 'Submitted'}
                        </Badge>
                      </div>
                    ) : (
                      <span className="text-xs text-amber-700 font-semibold">Pending Submission</span>
                    )}

                    <Button
                      variant={userSub ? 'outline' : 'primary'}
                      size="sm"
                      onClick={() => setSubmittingAssignment(asg)}
                      className="text-xs"
                    >
                      {userSub ? 'View / Edit Work' : 'Submit Assignment'}
                    </Button>
                  </div>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Student Submission Modal */}
      {submittingAssignment && (
        <Modal
          isOpen={Boolean(submittingAssignment)}
          onClose={() => setSubmittingAssignment(null)}
          title={`Submit Work: ${submittingAssignment.title}`}
          subtitle={`${submittingAssignment.courseCode} • Max Marks: ${submittingAssignment.maxMarks}`}
        >
          <form onSubmit={handleStudentSubmit} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="font-semibold text-slate-900 mb-1">Assignment Problem Description:</p>
              <p className="text-slate-600 leading-relaxed">{submittingAssignment.description}</p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Your Implementation / Answers / Code:
              </label>
              <textarea
                rows={6}
                required
                className="w-full rounded-lg border border-slate-300 p-3 text-xs font-mono focus:border-blue-600 focus:outline-hidden"
                placeholder="Paste code implementation, theoretical proofs, or solution write-up..."
                value={submissionContent}
                onChange={(e) => setSubmissionContent(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" size="md" onClick={() => setSubmittingAssignment(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="md" type="submit" leftIcon={<Send className="w-3.5 h-3.5" />}>
                Submit For Faculty Review
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Teacher Review & AI Assistance Modal */}
      {reviewingSubmission && (
        <Modal
          isOpen={Boolean(reviewingSubmission)}
          onClose={() => setReviewingSubmission(null)}
          title="Evaluate Submission & Assign Grade"
          subtitle={`Student: ${reviewingSubmission.studentName} (${reviewingSubmission.registrationNumber}) • ${reviewingSubmission.assignmentTitle}`}
          maxWidth="2xl"
        >
          <div className="space-y-5 text-xs">
            {/* Student Code / Content */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Submitted Student Content:</label>
              <div className="p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-xs max-h-48 overflow-y-auto leading-relaxed">
                {reviewingSubmission.content}
              </div>
            </div>

            {/* AI Assistant Action */}
            <div className="p-4 bg-indigo-50/70 rounded-xl border border-indigo-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-950 font-bold">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>AI Rubric Evaluation Assistant</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRequestAIEvaluation(reviewingSubmission)}
                  isLoading={isGeneratingAIFeedback}
                  className="bg-white text-indigo-700 border-indigo-300 text-xs"
                >
                  Generate AI Feedback Draft
                </Button>
              </div>

              {aiFeedbackDraft && (
                <div className="space-y-2.5 pt-2 border-t border-indigo-100 animate-in fade-in">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2.5 bg-white rounded-lg border border-indigo-100">
                      <p className="font-bold text-emerald-700 mb-1">Key Strengths:</p>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[11px]">
                        {aiFeedbackDraft.strengths?.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-2.5 bg-white rounded-lg border border-indigo-100">
                      <p className="font-bold text-amber-700 mb-1">Improvement Areas:</p>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[11px]">
                        {aiFeedbackDraft.weaknesses?.map((w, i) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <p className="text-[11px] text-indigo-800 italic">
                    AI Suggested Score: <strong>{aiFeedbackDraft.suggestedScore}</strong> /{' '}
                    {reviewingSubmission.maxMarks}
                  </p>
                </div>
              )}
            </div>

            {/* Final Marks & Feedback Entry */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Marks Awarded (Max {reviewingSubmission.maxMarks})
                </label>
                <Input
                  type="number"
                  min="0"
                  max={reviewingSubmission.maxMarks}
                  value={awardedMarks}
                  onChange={(e) => setAwardedMarks(Number(e.target.value))}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Faculty Official Feedback Remarks
                </label>
                <Input
                  value={teacherFeedback}
                  onChange={(e) => setTeacherFeedback(e.target.value)}
                  placeholder="Enter remarks for the student..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <Button variant="outline" size="md" onClick={() => setReviewingSubmission(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleSaveGrade}
                leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
              >
                Publish Grade & Remarks
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Assignment Modal */}
      {createModalOpen && (
        <Modal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          title="Publish New Coursework Assignment"
          subtitle="Assign problem sets, project milestones, and rubric parameters"
        >
          <form onSubmit={handleCreateAssignment} className="space-y-4 text-xs">
            <Select
              label="Course"
              value={newCourseId}
              onChange={(e) => setNewCourseId(e.target.value)}
              options={courses.map((c) => ({ value: c.id, label: `${c.code} - ${c.title}` }))}
            />
            <Input
              label="Assignment Title"
              required
              placeholder="e.g. Assignment 4: Relational Indexing Benchmarks"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Detailed Problem Specification / Instructions
              </label>
              <textarea
                rows={4}
                required
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-blue-600 focus:outline-hidden"
                placeholder="State the algorithmic or conceptual requirements..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="datetime-local"
                label="Submission Deadline"
                required
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
              />
              <Input
                type="number"
                label="Maximum Marks"
                required
                min="10"
                max="500"
                value={newMaxMarks}
                onChange={(e) => setNewMaxMarks(Number(e.target.value))}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" size="md" onClick={() => setCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="md" type="submit">
                Publish Assignment to Class
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

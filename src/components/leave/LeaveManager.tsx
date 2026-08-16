import React, { useState } from 'react';
import { Calendar, Plus, CheckCircle2, XCircle, Clock, AlertCircle, Send, Check, X } from 'lucide-react';
import { usePortalStore } from '../../lib/store';
import { LeaveRequest } from '../../types';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { Input, Select } from '../ui/Input';

export const LeaveManager: React.FC = () => {
  const {
    currentUser,
    leaveRequests,
    applyLeave,
    reviewLeave,
  } = usePortalStore();

  const isFaculty = currentUser.role === 'teacher' || currentUser.role === 'hod' || currentUser.role === 'admin';

  // Apply Leave Modal
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [fromDate, setFromDate] = useState('2026-08-25');
  const [toDate, setToDate] = useState('2026-08-26');
  const [reason, setReason] = useState('');

  // Review Modal
  const [reviewingLeave, setReviewingLeave] = useState<LeaveRequest | null>(null);
  const [reviewerNotes, setReviewerNotes] = useState('');

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    applyLeave({
      studentId: currentUser.id,
      studentName: currentUser.fullName,
      registrationNumber: currentUser.registrationNumber || 'NEGU2023CS042',
      classId: currentUser.classId || 'class-cse-3a',
      classCode: currentUser.classCode || 'CSE-3A',
      fromDate,
      toDate,
      reason,
    });

    setApplyModalOpen(false);
    setReason('');
  };

  const handleReview = (status: 'APPROVED' | 'REJECTED') => {
    if (!reviewingLeave) return;
    reviewLeave(reviewingLeave.id, status, reviewerNotes);
    setReviewingLeave(null);
    setReviewerNotes('');
  };

  // Filter requests
  const visibleRequests = isFaculty
    ? leaveRequests
    : leaveRequests.filter((l) => l.studentId === currentUser.id);

  const pendingCount = visibleRequests.filter((l) => l.status === 'PENDING').length;
  const approvedCount = visibleRequests.filter((l) => l.status === 'APPROVED').length;
  const rejectedCount = visibleRequests.filter((l) => l.status === 'REJECTED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Academic Leave & Duty Exemption Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit institutional leave requests with automatic attendance excusal synchronization
          </p>
        </div>

        {!isFaculty && (
          <Button
            variant="primary"
            size="md"
            onClick={() => setApplyModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
            id="apply-leave-btn"
          >
            Apply for Academic Leave
          </Button>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
          <p className="text-xs text-amber-800 font-medium">Pending Review</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">{pendingCount}</p>
          <span className="text-[10px] text-amber-600">Awaiting faculty signature</span>
        </div>
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
          <p className="text-xs text-emerald-800 font-medium">Approved & Excused</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{approvedCount}</p>
          <span className="text-[10px] text-emerald-600">Attendance updated</span>
        </div>
        <div className="p-4 bg-slate-100 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-600 font-medium">Rejected</p>
          <p className="text-2xl font-bold text-slate-700 mt-1">{rejectedCount}</p>
          <span className="text-[10px] text-slate-500">Unjustified absence</span>
        </div>
      </div>

      {/* Requests List */}
      <Card>
        <CardHeader
          title={isFaculty ? 'Pending & Historical Leave Applications' : 'My Leave Applications'}
          subtitle="Approved requests automatically link to attendance sessions to excuse absences without academic penalty"
        />
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {visibleRequests.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <Calendar className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                No leave applications recorded.
              </div>
            ) : (
              visibleRequests.map((req) => (
                <div key={req.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{req.studentName}</span>
                      <span className="font-mono text-xs text-slate-500">({req.registrationNumber})</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {req.classCode}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      "{req.reason}"
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        Duration: {req.fromDate} to {req.toDate}
                      </span>
                      <span>•</span>
                      <span>Applied: {new Date(req.createdAt).toLocaleDateString()}</span>
                      {req.reviewerName && (
                        <>
                          <span>•</span>
                          <span className="text-blue-600">
                            Reviewed by {req.reviewerName}
                          </span>
                        </>
                      )}
                    </div>

                    {req.reviewerNotes && (
                      <p className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded border border-slate-200/80 mt-2">
                        <strong>Faculty Note:</strong> {req.reviewerNotes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Badge
                      variant={
                        req.status === 'APPROVED'
                          ? 'success'
                          : req.status === 'REJECTED'
                          ? 'destructive'
                          : 'warning'
                      }
                    >
                      {req.status === 'APPROVED' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Approved & Excused</span>
                        </>
                      ) : req.status === 'REJECTED' ? (
                        <>
                          <XCircle className="w-3 h-3 text-rose-600" />
                          <span>Rejected</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Pending Approval</span>
                        </>
                      )}
                    </Badge>

                    {isFaculty && req.status === 'PENDING' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setReviewingLeave(req);
                          setReviewerNotes('');
                        }}
                        className="text-xs"
                      >
                        Review Request
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Apply Leave Modal */}
      {applyModalOpen && (
        <Modal
          isOpen={applyModalOpen}
          onClose={() => setApplyModalOpen(false)}
          title="Apply for Academic / Duty Leave"
          subtitle="Submit official leave request for faculty endorsement"
        >
          <form onSubmit={handleApply} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="date"
                label="From Date"
                required
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
              <Input
                type="date"
                label="To Date"
                required
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Academic Justification / Reason for Absence
              </label>
              <textarea
                rows={4}
                required
                placeholder="e.g. Representing university at IEEE National Conference / Medical treatment certificate attached..."
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-blue-600 focus:outline-hidden"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <div className="p-3 bg-blue-50 text-blue-900 rounded-lg text-[11px] leading-relaxed">
              <strong>Institutional Policy:</strong> Upon approval by your course advisor, attendance for classes held during this window will be marked <strong>EXCUSED</strong>.
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" size="md" onClick={() => setApplyModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="md" type="submit" leftIcon={<Send className="w-3.5 h-3.5" />}>
                Submit Leave Application
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Review Modal */}
      {reviewingLeave && (
        <Modal
          isOpen={Boolean(reviewingLeave)}
          onClose={() => setReviewingLeave(null)}
          title="Review Academic Leave Application"
          subtitle={`Applicant: ${reviewingLeave.studentName} (${reviewingLeave.registrationNumber})`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Leave Duration:</span>
                <span className="font-bold text-slate-900">
                  {reviewingLeave.fromDate} to {reviewingLeave.toDate}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Stated Reason:</span>
                <p className="font-medium text-slate-800">{reviewingLeave.reason}</p>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Faculty Endorsement Remarks / Conditions (Optional)
              </label>
              <Input
                placeholder="e.g. Approved. Student must submit missed lab journal on return."
                value={reviewerNotes}
                onChange={(e) => setReviewerNotes(e.target.value)}
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <Button
                variant="destructive"
                size="md"
                onClick={() => handleReview('REJECTED')}
                leftIcon={<X className="w-3.5 h-3.5" />}
              >
                Reject Request
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => handleReview('APPROVED')}
                leftIcon={<Check className="w-3.5 h-3.5" />}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Approve & Auto-Excuse Attendance
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

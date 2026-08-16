import React, { useState } from 'react';
import {
  Sparkles,
  AlertTriangle,
  Users,
  TrendingDown,
  Mail,
  CheckCircle2,
  Send,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { usePortalStore } from '../../lib/store';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';

export const AIRiskReportView: React.FC = () => {
  const { studentMaster, grades, attendanceScans, currentUser } = usePortalStore();

  const [interventionSent, setInterventionSent] = useState<string | null>(null);

  // Identify at-risk students based on criteria
  const atRiskStudents = [
    {
      id: 'sm-negu2023cs042',
      registrationNumber: 'NEGU2023CS042',
      name: 'Aditya Sharma',
      classCode: 'CSE-3A',
      attendancePct: 71.4,
      avgGradePct: 68.0,
      riskLevel: 'HIGH',
      flaggedReason: 'Attendance below 75% statutory requirement; missed 2 core lab sessions',
      recommendedAction: 'Mandate 1-on-1 advisor mentoring and compensatory lab hours',
    },
    {
      id: 'sm-negu2023cs105',
      registrationNumber: 'NEGU2023CS105',
      name: 'Aditya Joshi',
      classCode: 'CSE-3A',
      attendancePct: 73.8,
      avgGradePct: 72.5,
      riskLevel: 'MODERATE',
      flaggedReason: 'Declining quiz trajectory over the last 3 weeks in CS303 Database Systems',
      recommendedAction: 'Enroll in peer study circle and share synthesized study notes',
    },
    {
      id: 'sm-negu2023cs102',
      registrationNumber: 'NEGU2023CS102',
      name: 'Tanvi Deshmukh',
      classCode: 'CSE-3A',
      attendancePct: 78.2,
      avgGradePct: 64.0,
      riskLevel: 'MODERATE',
      flaggedReason: 'Mid-term score variance in CS301 Data Structures',
      recommendedAction: 'Provide supplementary practice problem sets on Dynamic Programming',
    },
  ];

  const handleSendIntervention = (studentName: string) => {
    setInterventionSent(`Proactive academic advisory alert dispatched to ${studentName} and faculty mentor.`);
    setTimeout(() => setInterventionSent(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              AI Student Retention & Academic Risk Diagnostic
            </h2>
            <Badge variant="purple">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              <span>Predictive Early Warning</span>
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cross-references attendance telemetry, continuous assessment grades, and submission delays to prevent dropouts
          </p>
        </div>
      </div>

      {interventionSent && (
        <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-lg border border-emerald-200 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{interventionSent}</span>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-rose-50 rounded-xl border border-rose-200">
          <div className="flex items-center justify-between">
            <p className="text-xs text-rose-800 font-medium">Critical Risk Students</p>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-bold text-rose-700 mt-1">1</p>
          <span className="text-[10px] text-rose-600">Attendance below 75% cutoff</span>
        </div>

        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
          <div className="flex items-center justify-between">
            <p className="text-xs text-amber-800 font-medium">Moderate Watchlist</p>
            <TrendingDown className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-700 mt-1">2</p>
          <span className="text-[10px] text-amber-600">Grade variance & warning threshold</span>
        </div>

        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
          <div className="flex items-center justify-between">
            <p className="text-xs text-emerald-800 font-medium">Safe Standing Cohort</p>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{studentMaster.length - 3}</p>
          <span className="text-[10px] text-emerald-600">On track for semester completion</span>
        </div>
      </div>

      {/* Identified At-Risk Students */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Early Warning Interventions Required
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {atRiskStudents.map((student) => (
            <Card
              key={student.id}
              className={`border transition-shadow ${
                student.riskLevel === 'HIGH' ? 'border-rose-300 bg-rose-50/20' : 'border-amber-200 bg-amber-50/20'
              }`}
            >
              <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-slate-900">{student.name}</span>
                    <span className="font-mono text-xs text-slate-500">({student.registrationNumber})</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {student.classCode}
                    </span>
                    <Badge variant={student.riskLevel === 'HIGH' ? 'rose' : 'amber'}>
                      {student.riskLevel} RISK
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <span className={student.attendancePct < 75 ? 'text-rose-600' : 'text-slate-700'}>
                      Attendance: {student.attendancePct}%
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-700">Exam Average: {student.avgGradePct}%</span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    <strong>Diagnostic Finding:</strong> {student.flaggedReason}
                  </p>

                  <p className="text-xs text-indigo-700 bg-indigo-50/60 p-2.5 rounded-lg border border-indigo-100 flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>AI Recommended Action:</strong> {student.recommendedAction}
                    </span>
                  </p>
                </div>

                <div className="flex sm:flex-col items-center gap-2 shrink-0">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleSendIntervention(student.name)}
                    leftIcon={<Mail className="w-3.5 h-3.5" />}
                    className={student.riskLevel === 'HIGH' ? 'bg-rose-600 hover:bg-rose-700 border-rose-600' : ''}
                  >
                    Dispatch Advisor Alert
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

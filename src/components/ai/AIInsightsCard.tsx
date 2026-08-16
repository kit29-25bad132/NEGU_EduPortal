import React, { useState } from 'react';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Clock,
  Check,
} from 'lucide-react';
import { usePortalStore } from '../../lib/store';
import { AIInsight, RiskLevel } from '../../types';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge, RiskLevelBadge } from '../ui/Badge';

export const AIInsightsCard: React.FC<{ onOpenStudyPlanner?: () => void }> = ({
  onOpenStudyPlanner,
}) => {
  const { currentUser, aiInsights, toggleStudyBlock } = usePortalStore();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeInsight, setActiveInsight] = useState<AIInsight>(
    aiInsights[0] || {
      id: 'ai-fallback',
      insightType: 'STUDENT_RISK',
      riskLevel: 'LOW',
      title: 'Strong Academic Trajectory',
      summary: 'Attendance is steady at 86.4% and recent assessment marks place performance in the top tier of section CSE-3A.',
      riskFactors: [
        { factor: 'Overall Attendance Rate', metric: '86.4%', status: 'positive' },
        { factor: 'Mid-Semester Exam Average', metric: '90.5%', status: 'positive' },
        { factor: 'Assignment Submission Velocity', metric: '100% on time', status: 'positive' },
      ],
      recommendations: [
        'Consolidate B+ tree query optimization concepts for the upcoming end-term examination.',
        'Review backpropagation matrix derivatives before the neural networks practical lab.',
        'Maintain attendance above 85% to maximize continuous internal evaluation credits.',
      ],
      confidenceScore: 0.94,
      createdAt: new Date().toISOString(),
    }
  );

  const handleRefreshInsights = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: currentUser.fullName,
          attendancePercent: 86.4,
          currentGpa: currentUser.currentGpa || 3.82,
          missingAssignments: 1,
          recentScores: [89, 92, 85, 94],
          courseName: 'Computer Science & Engineering',
        }),
      });

      const data = await res.json();
      setActiveInsight((prev) => ({
        ...prev,
        ...data,
        createdAt: new Date().toISOString(),
      }));
    } catch (e) {
      console.error('Failed to refresh AI insights', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Card */}
      <Card className="border-indigo-200 shadow-sm bg-gradient-to-br from-white via-indigo-50/20 to-white">
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span>AI Academic Standing & Risk Analysis</span>
            </div>
          }
          subtitle="Real-time multi-variable academic risk evaluation powered by Gemini AI"
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshInsights}
              isLoading={isRefreshing}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              className="text-xs text-indigo-700 border-indigo-200 bg-white"
            >
              Recalculate AI Pulse
            </Button>
          }
        />
        <CardContent className="space-y-6">
          {/* Status Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white rounded-xl border border-indigo-100 shadow-2xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <RiskLevelBadge level={activeInsight.riskLevel} />
                <span className="text-[11px] text-slate-400 font-mono">
                  Confidence Score: {(activeInsight.confidenceScore * 100).toFixed(0)}%
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900 mt-1">{activeInsight.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{activeInsight.summary}</p>
            </div>

            {onOpenStudyPlanner && (
              <Button
                variant="primary"
                size="md"
                onClick={onOpenStudyPlanner}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                className="bg-indigo-600 hover:bg-indigo-700 text-xs shrink-0"
              >
                Open Weekly Study Plan
              </Button>
            )}
          </div>

          {/* Explainable Risk Factors Breakdown */}
          <div>
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Diagnostic Metric Factors
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {activeInsight.riskFactors.map((rf, i) => (
                <div
                  key={i}
                  className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                    rf.status === 'positive'
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                      : rf.status === 'warning'
                      ? 'bg-amber-50/60 border-amber-200 text-amber-950'
                      : 'bg-rose-50/60 border-rose-200 text-rose-950'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">{rf.factor}</span>
                    {rf.status === 'positive' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    )}
                  </div>
                  <p className="text-lg font-bold text-slate-900">{rf.metric}</p>
                  <p className="text-[10px] text-slate-500 capitalize">{rf.status} Standing</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actionable Academic Recommendations */}
          <div>
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Actionable Recommendations
            </h5>
            <div className="space-y-2">
              {activeInsight.recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="p-3 bg-white rounded-lg border border-slate-200 flex items-start gap-3 text-xs"
                >
                  <div className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-[11px] mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-slate-700 font-medium leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

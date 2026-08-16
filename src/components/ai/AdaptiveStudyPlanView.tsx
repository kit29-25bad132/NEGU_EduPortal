import React from 'react';
import { Calendar, Clock, CheckCircle2, Circle, Sparkles, BookOpen, Target, Check } from 'lucide-react';
import { usePortalStore } from '../../lib/store';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const AdaptiveStudyPlanView: React.FC = () => {
  const { aiInsights, toggleStudyBlock } = usePortalStore();

  const activeInsight = aiInsights[0];
  const blocks = activeInsight?.studyBlocks || [];

  const completedCount = blocks.filter((b) => b.completed).length;
  const progressPct = blocks.length > 0 ? (completedCount / blocks.length) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Adaptive Weekly Study Blueprint
            </h2>
            <Badge variant="purple">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              <span>AI Personalized</span>
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Dynamic study blocks allocated based on upcoming course deadlines and assessment weights
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-2xs">
          <Target className="w-4 h-4 text-indigo-600" />
          <div className="text-xs">
            <span className="text-slate-500">Weekly Completion: </span>
            <strong className="text-slate-900 font-bold">
              {completedCount} of {blocks.length} Sessions ({progressPct.toFixed(0)}%)
            </strong>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
        <div
          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        ></div>
      </div>

      {/* Daily Study Blocks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {blocks.map((block, idx) => (
          <div
            key={idx}
            onClick={() => toggleStudyBlock(activeInsight.id, block.day, block.subject)}
            className={`p-5 rounded-2xl border transition-all cursor-pointer select-none space-y-3 ${
              block.completed
                ? 'bg-emerald-50/50 border-emerald-200 shadow-2xs'
                : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {block.day}
              </span>
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                  block.completed
                    ? 'bg-emerald-600 text-white'
                    : 'border-2 border-slate-300 text-transparent hover:border-indigo-600'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="space-y-1">
              <h4
                className={`text-sm font-bold ${
                  block.completed ? 'text-emerald-950 line-through' : 'text-slate-900'
                }`}
              >
                {block.subject}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Focus: {block.focusTopic}
              </p>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
              <span className="flex items-center gap-1 font-semibold text-indigo-700">
                <Clock className="w-3.5 h-3.5" />
                {block.durationMinutes} Minutes Focus
              </span>
              <span className={block.completed ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                {block.completed ? 'Completed' : 'Pending'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

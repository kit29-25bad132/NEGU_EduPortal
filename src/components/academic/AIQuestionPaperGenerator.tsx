import React, { useState } from 'react';
import { Sparkles, Printer, Download, BookOpen, Layers, CheckCircle2, RefreshCw } from 'lucide-react';
import { usePortalStore } from '../../lib/store';
import { Course, AIQuestionPaperDraft } from '../../types';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Select, Input } from '../ui/Input';
import { Badge } from '../ui/Badge';

export const AIQuestionPaperGenerator: React.FC = () => {
  const { courses, addQuestionPaper, questionPapers } = usePortalStore();

  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || '');
  const [difficulty, setDifficulty] = useState<'Standard' | 'Challenging' | 'Comprehensive'>('Standard');
  const [totalMarks, setTotalMarks] = useState<number>(100);
  const [durationMinutes, setDurationMinutes] = useState<number>(180);
  const [topicsInput, setTopicsInput] = useState<string>(
    'B+ Trees, Query Optimization, Concurrency Locking Protocols, ACID Transactions, Write-Ahead Logs'
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [activeDraft, setActiveDraft] = useState<AIQuestionPaperDraft | null>(
    questionPapers[0] || null
  );

  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const topics = topicsInput
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const res = await fetch('/api/ai/question-paper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseCode: selectedCourse.code,
          courseTitle: selectedCourse.title,
          syllabusTopics: topics,
          difficulty,
          totalMarks: Number(totalMarks),
          durationMinutes: Number(durationMinutes),
        }),
      });

      const draft: AIQuestionPaperDraft = await res.json();
      setActiveDraft(draft);
      addQuestionPaper(draft);
    } catch (e) {
      console.error('Failed to generate question paper draft', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Description */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              AI Examination Question Paper Studio
            </h2>
            <Badge variant="purple">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              <span>Gemini 2.5 Flash</span>
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Synthesize university-standard examination papers mapped to Bloom's taxonomy and syllabus modules
          </p>
        </div>

        {activeDraft && (
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer className="w-3.5 h-3.5" />}
          >
            Print / Export PDF Paper
          </Button>
        )}
      </div>

      {/* Generator Configuration Card */}
      <Card className="border-indigo-100 shadow-sm bg-gradient-to-r from-white via-indigo-50/20 to-white">
        <CardHeader
          title="Paper Synthesis Parameters"
          subtitle="Configure target course, syllabus weightages, cognitive difficulty, and time limits"
        />
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <Select
              label="Course"
              value={selectedCourseId}
              onChange={(e) => {
                setSelectedCourseId(e.target.value);
                const c = courses.find((crs) => crs.id === e.target.value);
                if (c) setTopicsInput(c.syllabus);
              }}
              options={courses.map((c) => ({ value: c.id, label: `${c.code} - ${c.title}` }))}
            />
            <Select
              label="Cognitive Rigor / Difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              options={[
                { value: 'Standard', label: 'Standard (Balanced Recall & Analysis)' },
                { value: 'Challenging', label: 'Challenging (Problem Solving & Design)' },
                { value: 'Comprehensive', label: 'Comprehensive (Full Bloom Synthesis)' },
              ]}
            />
            <Input
              type="number"
              label="Total Marks"
              value={totalMarks}
              onChange={(e) => setTotalMarks(Number(e.target.value))}
            />
            <Input
              type="number"
              label="Duration (Minutes)"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Syllabus Topics (Comma-separated)
            </label>
            <Input
              value={topicsInput}
              onChange={(e) => setTopicsInput(e.target.value)}
              placeholder="e.g. Relational Algebra, SQL Optimization, B+ Trees, Concurrency Locking..."
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={handleGenerate}
              isLoading={isGenerating}
              leftIcon={<Sparkles className="w-4 h-4 text-indigo-200" />}
              className="bg-indigo-600 hover:bg-indigo-700 border-indigo-600"
              id="generate-question-paper-btn"
            >
              Generate AI Question Paper Draft
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated Paper Preview */}
      {activeDraft && (
        <div className="bg-white rounded-2xl border border-slate-300 shadow-md p-8 max-w-4xl mx-auto space-y-6 print:border-none print:shadow-none">
          {/* Institutional University Paper Header */}
          <div className="text-center space-y-1 pb-6 border-b-2 border-slate-900">
            <h3 className="font-bold text-lg text-slate-900 tracking-wider uppercase">
              National Educational Governance University
            </h3>
            <p className="text-xs font-semibold text-slate-700 uppercase tracking-widest">
              Department of Computer Science & Engineering
            </p>
            <div className="pt-2 text-xs font-bold text-slate-900">
              End-Semester Summative Examination • Spring 2026
            </div>
            <div className="flex justify-between items-center text-xs font-semibold text-slate-800 pt-3 px-4 border-t border-slate-200">
              <span>Course Code: {activeDraft.courseCode}</span>
              <span>Course: {activeDraft.courseTitle}</span>
              <span>Max Marks: {activeDraft.totalMarks}</span>
              <span>Time: {activeDraft.durationMinutes / 60} Hours</span>
            </div>
          </div>

          {/* General Instructions */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
            <p className="font-bold text-slate-900">General Instructions to Candidates:</p>
            <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[11px]">
              {activeDraft.instructions.map((ins, i) => (
                <li key={i}>{ins}</li>
              ))}
            </ul>
          </div>

          {/* Questions Section */}
          <div className="space-y-6 pt-2">
            {activeDraft.questions.map((q, idx) => (
              <div key={q.id || idx} className="space-y-2 pb-4 border-b border-slate-100 last:border-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="font-bold text-sm text-slate-900 font-mono">Q{idx + 1}.</span>
                    <div>
                      <p className="text-xs text-slate-900 font-medium leading-relaxed">{q.question}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          Type: {q.type}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                          Bloom's Level: {q.bloomLevel}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="font-bold text-xs text-slate-900 shrink-0 font-mono">
                    [{q.marks} Marks]
                  </div>
                </div>

                {q.rubricHint && (
                  <div className="ml-7 p-2.5 bg-slate-50 rounded-md text-[11px] text-slate-600 italic border-l-2 border-indigo-400">
                    <strong>Rubric Criteria:</strong> {q.rubricHint}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer Sign-off */}
          <div className="pt-8 border-t border-slate-200 flex justify-between text-xs text-slate-500">
            <span>Prepared by: Course Coordinator</span>
            <span>Approved by: Board of Academic Studies (BoS)</span>
          </div>
        </div>
      )}
    </div>
  );
};

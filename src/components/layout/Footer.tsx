import React from 'react';
import { GraduationCap, ShieldCheck, Lock, Globe, Server, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5 text-white">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-bold text-base tracking-tight">NEGU-EduPortal</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              One Campus. One Intelligent Academic Platform. Comprehensive operating system combining attendance, academics, leave, and AI-driven insights.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 text-[11px] font-medium pt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>All Institutional Systems Operational</span>
            </div>
          </div>

          {/* Academic Modules */}
          <div>
            <h4 className="text-slate-200 font-semibold text-xs uppercase tracking-wider mb-3">
              Academic Core
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="hover:text-white transition-colors cursor-pointer">Live Geofence & GPS Attendance</li>
              <li className="hover:text-white transition-colors cursor-pointer">Student Master Roster Sync</li>
              <li className="hover:text-white transition-colors cursor-pointer">Assignment & Rubric Management</li>
              <li className="hover:text-white transition-colors cursor-pointer">Examination & Spreadsheet Grading</li>
              <li className="hover:text-white transition-colors cursor-pointer">Academic Leave Approvals</li>
            </ul>
          </div>

          {/* AI Intelligence */}
          <div>
            <h4 className="text-slate-200 font-semibold text-xs uppercase tracking-wider mb-3">
              AI Academic Intelligence
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="hover:text-white transition-colors cursor-pointer">Explainable Risk Analysis</li>
              <li className="hover:text-white transition-colors cursor-pointer">Adaptive Weekly Study Planner</li>
              <li className="hover:text-white transition-colors cursor-pointer">AI Question Paper Generator</li>
              <li className="hover:text-white transition-colors cursor-pointer">Submission Rubric Assistant</li>
              <li className="hover:text-white transition-colors cursor-pointer">HOD Department Analytics</li>
            </ul>
          </div>

          {/* Institutional Compliance */}
          <div>
            <h4 className="text-slate-200 font-semibold text-xs uppercase tracking-wider mb-3">
              Security & Compliance
            </h4>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                <span>PostgreSQL Row Level Security (RLS)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>HMAC Rotating Token Verification</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Globe className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Haversine GPS Geofence Auditing</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Server className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Supabase / Cloud Run Deployable</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <p>© 2026 National Educational Governance University (NEGU). Built for BUILDATHON 2026.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-300 cursor-pointer">Academic Honor Code</span>
            <span>•</span>
            <span className="hover:text-slate-300 cursor-pointer">API Documentation</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

import React, { useState } from 'react';
import {
  GraduationCap,
  Shield,
  Menu,
  X,
  UserCheck,
  ChevronDown,
  Sparkles,
  BookOpen,
  HelpCircle,
  Mail,
  LogIn,
} from 'lucide-react';
import { usePortalStore } from '../../lib/store';
import { UserRole } from '../../types';
import { Button } from '../ui/Button';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { currentRole, currentUser, setRole } = usePortalStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'courses', label: 'Academic Courses' },
    { id: 'contact', label: 'Campus Directory' },
    { id: 'help', label: 'Help Center' },
  ];

  const roleLabels: Record<UserRole, { title: string; badge: string; color: string }> = {
    student: { title: 'Student', badge: 'Verified Student', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    teacher: { title: 'Faculty / Teacher', badge: 'Course Coordinator', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    hod: { title: 'Head of Department', badge: 'Department Authority', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    admin: { title: 'Dean / Administrator', badge: 'Institutional Admin', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  };

  const handleRoleSelect = (role: UserRole) => {
    setRole(role);
    setRoleDropdownOpen(false);
    onNavigate(`dashboard-${role}`);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo & Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => onNavigate('home')}
            id="brand-logo-btn"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 via-blue-900 to-blue-700 flex items-center justify-center text-white shadow-md shadow-blue-900/10 ring-1 ring-white/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-slate-900 tracking-tight">NEGU-EduPortal</span>
                <span className="bg-blue-100 text-blue-800 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded tracking-wider">
                  OS v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Academic Operating System
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                  currentView === link.id
                    ? 'text-blue-600 bg-blue-50/80 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right Action Bar */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Quick Role Switcher for Hackathon Live Demo */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50/80 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer"
                title="Switch role view for demonstration"
                id="role-switch-trigger"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Role: <strong className="text-slate-900">{roleLabels[currentRole].title}</strong></span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {roleDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onMouseLeave={() => setRoleDropdownOpen(false)}
                >
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Demo Role Switcher (4 Roles)
                  </div>
                  {(['student', 'teacher', 'hod', 'admin'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => handleRoleSelect(r)}
                      className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between transition-colors hover:bg-slate-50 cursor-pointer ${
                        currentRole === r ? 'bg-blue-50/70 text-blue-700 font-semibold' : 'text-slate-700'
                      }`}
                    >
                      <span className="capitalize font-medium">{roleLabels[r].title}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${roleLabels[r].color}`}>
                        {roleLabels[r].badge}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Portal Dashboard Button */}
            <Button
              variant="primary"
              size="sm"
              onClick={() => onNavigate(`dashboard-${currentRole}`)}
              leftIcon={<Shield className="w-3.5 h-3.5" />}
              id="enter-portal-btn"
            >
              Open Dashboard
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate(`dashboard-${currentRole}`)}
              className="text-xs px-2.5 h-8"
            >
              Dashboard
            </Button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  onNavigate(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 text-sm font-medium rounded-lg ${
                  currentView === link.id ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase">Switch Active Role</p>
            <div className="grid grid-cols-2 gap-2">
              {(['student', 'teacher', 'hod', 'admin'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    handleRoleSelect(r);
                    setMobileMenuOpen(false);
                  }}
                  className={`p-2 text-left rounded-lg border text-xs ${
                    currentRole === r
                      ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <p className="font-medium capitalize">{r}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

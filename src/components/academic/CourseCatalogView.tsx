import React, { useState } from 'react';
import { BookOpen, Clock, MapPin, User, CheckCircle2, Search, Sparkles } from 'lucide-react';
import { usePortalStore } from '../../lib/store';
import { Course } from '../../types';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input, Select } from '../ui/Input';

export const CourseCatalogView: React.FC = () => {
  const { courses, currentUser } = usePortalStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');

  const filteredCourses = courses.filter((c) => {
    if (
      searchQuery &&
      !c.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !c.code.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !(c.instructorName || '').toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Academic Courses & Curricula Catalog
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Course syllabus specifications, faculty coordinators, weekly lecture schedules, and venue assignments
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search by course code, title, or professor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
            <CardHeader
              title={
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200">
                      {course.code}
                    </span>
                    <span className="text-xs font-bold text-slate-700 font-mono">
                      {course.credits} Credits
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{course.title}</h4>
                </div>
              }
            />
            <CardContent className="space-y-3 flex-1 text-xs">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-slate-600">
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-medium">{course.instructorName || 'Department Faculty'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{course.schedule}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Room / Venue: {course.room}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Key Syllabus Units:
                </p>
                <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                  {course.syllabus}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Download,
  Plus,
  Mail,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { usePortalStore } from '../../lib/store';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';
import { Badge, VerifiedStudentBadge } from '../ui/Badge';
import { Modal } from '../ui/Modal';

export const ClassRosterManager: React.FC = () => {
  const { classes, studentMaster, currentUser, addStudentMaster } = usePortalStore();

  const [selectedClassCode, setSelectedClassCode] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);

  // New Student Form State
  const [newReg, setNewReg] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newClass, setNewClass] = useState(classes[0]?.code || 'CSE-3A');

  const filteredStudents = studentMaster.filter((s) => {
    if (selectedClassCode !== 'all' && s.classCode !== selectedClassCode) return false;
    if (
      searchQuery &&
      !s.officialName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !s.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !s.officialEmail.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReg || !newName || !newEmail) return;

    addStudentMaster({
      id: `sm-${newReg.toLowerCase()}`,
      registrationNumber: newReg.toUpperCase(),
      officialName: newName,
      officialEmail: newEmail.toLowerCase(),
      departmentCode: 'CSE',
      classCode: newClass,
      batchYear: 2026,
      status: 'ACTIVE',
    });

    setIsAddStudentOpen(false);
    setNewReg('');
    setNewName('');
    setNewEmail('');
  };

  const handleExportCSV = () => {
    const headers = 'RegistrationNumber,OfficialName,OfficialEmail,DepartmentCode,ClassCode\n';
    const rows = filteredStudents
      .map(
        (s) =>
          `${s.registrationNumber},"${s.officialName}",${s.officialEmail},${s.departmentCode},${s.classCode}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student_roster_${selectedClassCode}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Academic Class Sections & Student Rosters
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified student enrollment registries, advisor assignments, and department class rosters
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export Class CSV
          </Button>
          {(currentUser.role === 'teacher' ||
            currentUser.role === 'hod' ||
            currentUser.role === 'admin') && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddStudentOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Student Record
            </Button>
          )}
        </div>
      </div>

      {/* Class Section Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {classes.map((cls) => {
          const count = studentMaster.filter((s) => s.classCode === cls.code).length;
          const isSelected = selectedClassCode === cls.code;
          return (
            <div
              key={cls.id}
              onClick={() => setSelectedClassCode(isSelected ? 'all' : cls.code)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-blue-50/80 border-blue-500 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-blue-700">{cls.code}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {count} Students
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 mt-1">{cls.name}</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Advisor: {cls.advisorName}</p>
            </div>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search by student name, registration ID, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="w-full sm:w-64">
              <Select
                value={selectedClassCode}
                onChange={(e) => setSelectedClassCode(e.target.value)}
                options={[
                  { value: 'all', label: 'All Sections' },
                  ...classes.map((c) => ({ value: c.code, label: `Section ${c.code}` })),
                ]}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Master Table */}
      <Card>
        <CardHeader
          title={`Enrolled Students Directory (${filteredStudents.length})`}
          subtitle="Real-time master enrollment list synced with official admissions registration database"
        />
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Registration #</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Institutional Email</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Section</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No matching student records found.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-blue-600">
                        {student.registrationNumber}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900">{student.officialName}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">{student.officialEmail}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-700">
                          {student.departmentCode}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {student.classCode}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Enrolled
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Student Modal */}
      {isAddStudentOpen && (
        <Modal
          isOpen={isAddStudentOpen}
          onClose={() => setIsAddStudentOpen(false)}
          title="Add New Student Master Record"
          subtitle="Enroll a new student into the official institutional academic registry"
        >
          <form onSubmit={handleAddStudent} className="space-y-4 text-xs">
            <Input
              label="Registration Number"
              placeholder="e.g. NEGU2023CS106"
              value={newReg}
              onChange={(e) => setNewReg(e.target.value)}
              required
            />
            <Input
              label="Official Student Full Name"
              placeholder="e.g. Rohini Bhattacharya"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
            />
            <Input
              type="email"
              label="Institutional Email"
              placeholder="e.g. rohini.b@negu.edu"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
            />
            <Select
              label="Academic Section"
              value={newClass}
              onChange={(e) => setNewClass(e.target.value)}
              options={classes.map((c) => ({ value: c.code, label: `${c.code} (${c.name})` }))}
            />
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setIsAddStudentOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Save & Enroll Student
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

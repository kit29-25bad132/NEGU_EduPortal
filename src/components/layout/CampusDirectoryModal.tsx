import React, { useState } from 'react';
import { Mail, Phone, MapPin, Building, Search, UserCheck } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';

interface CampusDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CampusDirectoryModal: React.FC<CampusDirectoryModalProps> = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState('');

  const contacts = [
    {
      name: 'Dr. Anand Ramanathan',
      role: 'Head of Computer Science & Engineering',
      dept: 'CSE Dept',
      email: 'hod.cse@negu.edu',
      phone: '+91 80 2841 3301',
      room: 'Academic Block A, Room 302',
    },
    {
      name: 'Dr. K. S. Venkatesh',
      role: 'Professor & Academic Dean',
      dept: 'Deanery Office',
      email: 'dean.academics@negu.edu',
      phone: '+91 80 2841 3300',
      room: 'Administrative Block, Floor 2',
    },
    {
      name: 'Prof. Sunita Rao',
      role: 'Head of Electronics & Communication',
      dept: 'ECE Dept',
      email: 'hod.ece@negu.edu',
      phone: '+91 80 2841 3305',
      room: 'Academic Block B, Room 204',
    },
    {
      name: 'Dr. Rajesh Nair',
      role: 'Controller of Examinations',
      dept: 'Evaluation Cell',
      email: 'coe@negu.edu',
      phone: '+91 80 2841 3310',
      room: 'Examination Tower, Ground Floor',
    },
    {
      name: 'Registrar & Admissions Cell',
      role: 'Student Admissions & Master Records',
      dept: 'Central Registry',
      email: 'admissions@negu.edu',
      phone: '+91 80 2841 3320',
      room: 'Student Center, Hall 1',
    },
  ];

  const filtered = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.role.toLowerCase().includes(search.toLowerCase()) ||
      c.dept.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Campus & Faculty Directory"
      subtitle="Institutional contact directory for university administration, HODs, and academic departments"
    >
      <div className="space-y-4 text-xs">
        <Input
          placeholder="Search by faculty name, department, or office..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />

        <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 space-y-2">
          {filtered.map((c, i) => (
            <div key={i} className="pt-2 pb-2 space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900">{c.name}</h4>
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-[10px]">
                  {c.dept}
                </span>
              </div>
              <p className="text-slate-600 font-medium">{c.role}</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-slate-500 pt-1 text-[11px]">
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-400" />
                  {c.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  {c.phone}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {c.room}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};

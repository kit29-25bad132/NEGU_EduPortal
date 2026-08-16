import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertTriangle, Download, Database, Check } from 'lucide-react';
import { usePortalStore } from '../../lib/store';
import { RosterValidationResult, StudentMasterRecord } from '../../types';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';

export const RosterUploadModal: React.FC = () => {
  const { studentMaster, importRosterRecords } = usePortalStore();

  const [csvContent, setCsvContent] = useState<string>(
    `RegistrationNumber,OfficialName,OfficialEmail,DepartmentCode,ClassCode
NEGU2023CS101,Vikramaditya Seth,vikram.seth@negu.edu,CSE,CSE-3A
NEGU2023CS102,Tanvi Deshmukh,tanvi.deshmukh@negu.edu,CSE,CSE-3A
NEGU2023CS103,Sameer Kulkarni,sameer.kulkarni@negu.edu,CSE,CSE-3A
NEGU2023CS104,Gayatri Nair,gayatri.nair@negu.edu,CSE,CSE-3A
NEGU2023CS105,Aditya Joshi,aditya.joshi@negu.edu,CSE,CSE-3A`
  );

  const [validationResult, setValidationResult] = useState<RosterValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  const handleValidateCsv = async () => {
    setIsValidating(true);
    setImportSuccess(false);
    try {
      const res = await fetch('/api/roster/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvText: csvContent }),
      });
      const data = await res.json();
      setValidationResult(data);
    } catch (e) {
      console.error('CSV validation error', e);
    } finally {
      setIsValidating(false);
    }
  };

  const handleCommitImport = () => {
    if (!validationResult) return;
    setIsImporting(true);

    const validRecords: StudentMasterRecord[] = validationResult.rows
      .filter((r) => r.isValid)
      .map((r) => ({
        id: `sm-${r.registrationNumber.toLowerCase()}`,
        registrationNumber: r.registrationNumber,
        officialName: r.officialName,
        officialEmail: r.officialEmail,
        departmentCode: r.departmentCode,
        classCode: r.classCode,
        batchYear: r.batchYear,
        status: 'ACTIVE',
      }));

    importRosterRecords(validRecords);
    setIsImporting(false);
    setImportSuccess(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Institutional Student Master Roster Upload
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Sync official admissions roll numbers, institutional emails, and department class sections
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const blob = new Blob([csvContent], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'sample_student_roster.csv';
              a.click();
            }}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Download CSV Template
          </Button>
        </div>
      </div>

      {importSuccess && (
        <div className="p-4 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            Successfully imported {validationResult?.validCount} verified student records into the official institutional master database!
          </span>
        </div>
      )}

      {/* CSV Input Card */}
      <Card>
        <CardHeader
          title="Upload or Paste Roster CSV Data"
          subtitle="Strict validation prevents duplicate registrations or invalid institutional email domains"
        />
        <CardContent className="space-y-4">
          <div>
            <textarea
              rows={7}
              className="w-full rounded-xl border border-slate-300 p-3 font-mono text-xs text-slate-900 focus:border-blue-600 focus:outline-hidden leading-relaxed"
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              placeholder="Paste comma-separated student records with headers..."
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={handleValidateCsv}
              isLoading={isValidating}
              leftIcon={<Upload className="w-4 h-4" />}
            >
              Parse & Validate CSV Roster
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Validation Results Preview */}
      {validationResult && (
        <Card className="border-blue-200 shadow-sm animate-in fade-in duration-200">
          <CardHeader
            title={
              <div className="flex items-center gap-3">
                <span>Roster Pre-Import Validation Summary</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  {validationResult.validCount} Valid
                </span>
                {validationResult.invalidCount > 0 && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold">
                    {validationResult.invalidCount} Invalid Rows
                  </span>
                )}
              </div>
            }
          />
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-slate-200">
                <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Row</th>
                    <th className="py-3 px-4">Registration #</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Official Email</th>
                    <th className="py-3 px-4">Department & Class</th>
                    <th className="py-3 px-4">Validation Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {validationResult.rows.map((row) => (
                    <tr
                      key={row.rowNumber}
                      className={row.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/50'}
                    >
                      <td className="py-3 px-4 font-mono text-slate-400">{row.rowNumber}</td>
                      <td className="py-3 px-4 font-mono font-bold text-blue-600">
                        {row.registrationNumber}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{row.officialName}</td>
                      <td className="py-3 px-4 text-slate-600 font-mono">{row.officialEmail}</td>
                      <td className="py-3 px-4 text-slate-700">
                        {row.departmentCode} • {row.classCode}
                      </td>
                      <td className="py-3 px-4">
                        {row.isValid ? (
                          <Badge variant="success">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Valid Record</span>
                          </Badge>
                        ) : (
                          <div className="space-y-1">
                            <Badge variant="destructive">
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              <span>Error</span>
                            </Badge>
                            <p className="text-[10px] text-rose-700">{row.errors.join(', ')}</p>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={handleCommitImport}
                isLoading={isImporting}
                disabled={validationResult.validCount === 0}
                leftIcon={<Database className="w-4 h-4" />}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Commit {validationResult.validCount} Valid Records to Database
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Master Database Records Table */}
      <Card>
        <CardHeader
          title={`Enrolled Student Master Directory (${studentMaster.length} Students)`}
          subtitle="Official institutional identities authorized for attendance check-ins and academic coursework"
        />
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider text-[11px] sticky top-0">
                <tr>
                  <th className="py-3 px-4">Registration #</th>
                  <th className="py-3 px-4">Official Name</th>
                  <th className="py-3 px-4">Institutional Email</th>
                  <th className="py-3 px-4">Dept & Section</th>
                  <th className="py-3 px-4">Batch</th>
                  <th className="py-3 px-4">Enrollment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {studentMaster.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">
                      {student.registrationNumber}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {student.officialName}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono">{student.officialEmail}</td>
                    <td className="py-3 px-4 text-slate-700 font-semibold">
                      {student.departmentCode} • {student.classCode}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono">{student.batchYear}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                        <Check className="w-3 h-3" />
                        <span>Active</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

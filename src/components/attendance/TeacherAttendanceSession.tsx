import React, { useState, useEffect } from 'react';
import {
  Play,
  Square,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  RefreshCw,
  Sliders,
  Check,
  X,
  Eye,
  ShieldCheck,
  Radio,
  Signal,
  CheckCheck,
} from 'lucide-react';
import { usePortalStore } from '../../lib/store';
import { AttendanceSession, AttendanceScanRecord } from '../../types';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge, AttendanceStateBadge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { Select, Input } from '../ui/Input';

export const TeacherAttendanceSession: React.FC = () => {
  const {
    attendanceSessions,
    attendanceScans,
    courses,
    classes,
    currentUser,
    startAttendanceSession,
    closeAttendanceSession,
    resolveAttendanceScan,
  } = usePortalStore();

  const [activeSession, setActiveSession] = useState<AttendanceSession | null>(
    attendanceSessions.find((s) => s.status === 'ACTIVE') || null
  );

  // New session form state
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || '');
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || '');
  const [radiusMeters, setRadiusMeters] = useState(50);
  const [isStarting, setIsStarting] = useState(false);

  // Active session details
  const [currentNonce, setCurrentNonce] = useState('');
  const [broadcastCode, setBroadcastCode] = useState('');

  // Flag Resolution Modal
  const [resolvingScan, setResolvingScan] = useState<AttendanceScanRecord | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Synchronize active session if store updates
  useEffect(() => {
    const live = attendanceSessions.find((s) => s.status === 'ACTIVE');
    setActiveSession(live || null);
    if (live) {
      setBroadcastCode(live.id.slice(0, 6).toUpperCase());
    }
  }, [attendanceSessions]);

  // Generate & Rotate Token for session
  const fetchNewToken = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/attendance/session/token?sessionId=${sessionId}`);
      const data = await res.json();
      setCurrentNonce(data.nonce);
    } catch (e) {
      console.error('Failed to sync session token', e);
    }
  };

  useEffect(() => {
    if (!activeSession) return;
    fetchNewToken(activeSession.id);
  }, [activeSession?.id]);

  const handleStartSession = async () => {
    setIsStarting(true);
    try {
      const selectedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];
      const selectedClass = classes.find((c) => c.id === selectedClassId) || classes[0];

      // Geolocation or default campus center
      let lat = 12.9716;
      let lng = 77.5946;
      if (navigator.geolocation) {
        try {
          const pos: GeolocationPosition = await new Promise((res, rej) =>
            navigator.geolocation.getCurrentPosition(res, rej, { timeout: 3000 })
          );
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        } catch (geoErr) {
          // fallback to default campus
        }
      }

      const res = await fetch('/api/attendance/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: selectedClass.id,
          courseId: selectedCourse.id,
          teacherId: currentUser.id,
          latitude: lat,
          longitude: lng,
          allowedRadiusMeters: Number(radiusMeters),
          rotationIntervalSeconds: 15,
        }),
      });

      const data = await res.json();
      const newSession: AttendanceSession = {
        id: data.sessionId,
        classId: selectedClass.id,
        classCode: selectedClass.code,
        courseId: selectedCourse.id,
        courseCode: selectedCourse.code,
        courseTitle: selectedCourse.title,
        teacherId: currentUser.id,
        teacherName: currentUser.fullName,
        sessionDate: new Date().toISOString().split('T')[0],
        startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'ACTIVE',
        latitude: lat,
        longitude: lng,
        allowedRadiusMeters: Number(radiusMeters),
        rotationIntervalSeconds: 15,
        stats: {
          totalStudents: 64,
          present: 0,
          flagged: 0,
          notScanned: 64,
          excused: 0,
        },
      };

      startAttendanceSession(newSession);
      setActiveSession(newSession);
      setBroadcastCode(newSession.id.slice(0, 6).toUpperCase());
    } catch (e) {
      console.error('Failed to start session', e);
    } finally {
      setIsStarting(false);
    }
  };

  const handleCloseSession = () => {
    if (activeSession) {
      closeAttendanceSession(activeSession.id);
      setActiveSession(null);
    }
  };

  // Filter scans for active session
  const currentScans = activeSession
    ? attendanceScans.filter((s) => s.sessionId === activeSession.id)
    : [];
  const presentCount = currentScans.filter((s) => s.state === 'PRESENT').length;
  const flaggedCount = currentScans.filter((s) => s.state === 'FLAGGED').length;
  const excusedCount = currentScans.filter((s) => s.state === 'EXCUSED').length;
  const totalStudents = activeSession?.stats?.totalStudents || 64;
  const notScannedCount = Math.max(0, totalStudents - (presentCount + flaggedCount + excusedCount));

  const handleResolveFlag = (state: 'PRESENT' | 'ABSENT' | 'EXCUSED') => {
    if (!resolvingScan) return;
    resolveAttendanceScan(resolvingScan.id, state, resolutionNotes);
    setResolvingScan(null);
    setResolutionNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Session Controls Header */}
      {!activeSession ? (
        <Card className="border-blue-200 shadow-sm">
          <CardHeader
            title="Launch Classroom Geofence Attendance Session"
            subtitle="Start live GPS geofenced attendance broadcast with server-side Haversine verification"
          />
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Target Course"
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                options={courses.map((c) => ({ value: c.id, label: `${c.code} - ${c.title}` }))}
              />
              <Select
                label="Academic Section / Class"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                options={classes.map((cl) => ({ value: cl.id, label: `${cl.code} (${cl.name})` }))}
              />
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Geofence Radius: <strong className="text-blue-600">{radiusMeters} meters</strong>
                </label>
                <input
                  type="range"
                  min="20"
                  max="200"
                  step="10"
                  value={radiusMeters}
                  onChange={(e) => setRadiusMeters(Number(e.target.value))}
                  className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>20m (Strict)</span>
                  <span>50m (Classroom)</span>
                  <span>200m (Auditorium)</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100 flex items-start gap-3 text-xs text-blue-900">
              <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">GPS Geofence Verification Active</p>
                <p className="text-blue-700 mt-0.5 leading-relaxed">
                  Enrolled students in the selected class section can check in directly from their student dashboard. Geolocation coordinates are computed server-side via the Haversine formula. Check-ins outside {radiusMeters}m will be flagged for review.
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                variant="primary"
                size="lg"
                onClick={handleStartSession}
                isLoading={isStarting}
                leftIcon={<Play className="w-4 h-4 fill-white" />}
                id="start-attendance-btn"
              >
                Start Live Attendance Broadcast
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Active Live Session State */
        <div className="space-y-6">
          {/* Active Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-blue-900/40 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>LIVE SESSION BROADCASTING</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight">
                {activeSession.courseCode} - {activeSession.courseTitle}
              </h2>
              <p className="text-xs text-slate-300">
                Class: <strong className="text-white">{activeSession.classCode}</strong> • Started at {activeSession.startTime} • Geofence: {activeSession.allowedRadiusMeters}m radius
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchNewToken(activeSession.id)}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              >
                Sync Session
              </Button>
              <Button
                variant="destructive"
                size="md"
                onClick={handleCloseSession}
                leftIcon={<Square className="w-4 h-4 fill-white" />}
                id="close-attendance-btn"
              >
                End Session & Lock Attendance
              </Button>
            </div>
          </div>

          {/* Live Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <Card className="border-slate-200">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Total Enrolled</p>
                  <p className="text-xl font-bold text-slate-900">{totalStudents}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-emerald-200 bg-emerald-50/30">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-emerald-800 font-medium">Present (Verified)</p>
                  <p className="text-xl font-bold text-emerald-700">{presentCount}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50/30">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-amber-800 font-medium">Flagged (Geofence)</p>
                  <p className="text-xl font-bold text-amber-700">{flaggedCount}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50/30">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-blue-800 font-medium">Excused (Leave)</p>
                  <p className="text-xl font-bold text-blue-700">{excusedCount}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 col-span-2 lg:col-span-1">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Not Yet Checked In</p>
                  <p className="text-xl font-bold text-slate-700">{notScannedCount}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Session Overview & Live Check-in Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Session Info Terminal Panel */}
            <div className="lg:col-span-4 space-y-4">
              <Card className="border-blue-200 shadow-sm">
                <CardHeader
                  title="Session Broadcast Terminal"
                  subtitle="Active geofence parameters and security credentials"
                />
                <CardContent className="space-y-4 text-xs">
                  <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3 font-mono">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                      <span className="text-slate-400">Broadcast ID:</span>
                      <span className="font-bold text-blue-400">{broadcastCode || 'ACTIVE'}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                      <span className="text-slate-400">Class Section:</span>
                      <span className="font-bold text-emerald-400">{activeSession.classCode}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                      <span className="text-slate-400">Geofence Radius:</span>
                      <span className="font-bold text-amber-400">{activeSession.allowedRadiusMeters} meters</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">GPS Origin:</span>
                      <span className="text-[11px] text-slate-300">
                        {activeSession.latitude?.toFixed(4)}, {activeSession.longitude?.toFixed(4)}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 space-y-1">
                    <div className="flex items-center gap-2 font-bold">
                      <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
                      <span>Live Check-in Open</span>
                    </div>
                    <p className="text-[11px] text-emerald-800">
                      Students in section {activeSession.classCode} can submit instant one-click check-ins from their student dashboard.
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="justify-center">
                  <span className="text-slate-500 text-xs flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    Geofence active: {activeSession.allowedRadiusMeters}m boundary enforced
                  </span>
                </CardFooter>
              </Card>
            </div>

            {/* Live Feed & Flagged Resolution Panel */}
            <div className="lg:col-span-8 space-y-6">
              {/* Flagged Review Alert if Any */}
              {flaggedCount > 0 && (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>{flaggedCount} Students Flagged Outside Geofence</span>
                    </div>
                    <span className="text-[11px] text-amber-700">Requires Teacher Resolution</span>
                  </div>

                  <div className="space-y-2">
                    {currentScans
                      .filter((s) => s.state === 'FLAGGED')
                      .map((scan) => (
                        <div
                          key={scan.id}
                          className="p-3 bg-white rounded-lg border border-amber-200 flex items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <p className="font-bold text-slate-900">
                              {scan.studentName}{' '}
                              <span className="font-mono text-slate-500 font-normal">
                                ({scan.studentRegistrationNumber})
                              </span>
                            </p>
                            <p className="text-rose-600 font-medium mt-0.5">{scan.flagReason}</p>
                          </div>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setResolvingScan(scan)}
                            className="text-xs shrink-0"
                          >
                            Resolve Flag
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Full Live Check-in Feed */}
              <Card>
                <CardHeader
                  title="Live Check-in Feed"
                  subtitle={`Showing all ${currentScans.length} student check-ins processed in this session`}
                />
                <CardContent className="p-0">
                  <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
                    {currentScans.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 text-xs">
                        <Signal className="w-8 h-8 mx-auto text-slate-300 mb-2 animate-pulse" />
                        Waiting for student check-ins. Students check in using their student portal.
                      </div>
                    ) : (
                      currentScans.map((scan) => (
                        <div
                          key={scan.id}
                          className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-xs"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{scan.studentName}</span>
                              <span className="font-mono text-slate-500">
                                {scan.studentRegistrationNumber}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                              <span>
                                Distance:{' '}
                                <strong className="text-slate-700">
                                  {scan.calculatedDistanceMeters !== undefined
                                    ? `${scan.calculatedDistanceMeters}m`
                                    : 'N/A'}
                                </strong>
                              </span>
                              <span>•</span>
                              <span>
                                {new Date(scan.scanTimestamp).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit',
                                })}
                              </span>
                            </div>
                            {scan.resolutionNotes && (
                              <p className="text-[11px] text-blue-600 italic">
                                Note: {scan.resolutionNotes}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <AttendanceStateBadge state={scan.state} />
                            {scan.state === 'FLAGGED' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setResolvingScan(scan)}
                                className="h-7 text-[11px]"
                              >
                                Review
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Flag Resolution Modal */}
      {resolvingScan && (
        <Modal
          isOpen={Boolean(resolvingScan)}
          onClose={() => setResolvingScan(null)}
          title="Resolve Geofence Attendance Flag"
          subtitle={`Student: ${resolvingScan.studentName} (${resolvingScan.studentRegistrationNumber})`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="font-bold text-amber-900">Flag Reason:</p>
              <p className="text-amber-800 mt-0.5">{resolvingScan.flagReason}</p>
              <p className="text-slate-600 mt-1">
                Calculated Distance: <strong>{resolvingScan.calculatedDistanceMeters}m</strong> (Allowed:{' '}
                {activeSession?.allowedRadiusMeters || 50}m)
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Resolution Notes / Faculty Justification (Optional)
              </label>
              <Input
                placeholder="e.g. Student verified sitting in rear auditorium wing or laboratory"
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
              />
            </div>

            <div className="pt-2">
              <p className="font-semibold text-slate-700 mb-2">Select Resolution Action:</p>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => handleResolveFlag('PRESENT')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Mark Present
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => handleResolveFlag('EXCUSED')}
                  className="text-blue-700 border-blue-300 hover:bg-blue-50"
                >
                  Mark Excused
                </Button>
                <Button
                  variant="destructive"
                  size="md"
                  onClick={() => handleResolveFlag('ABSENT')}
                >
                  Confirm Absent
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

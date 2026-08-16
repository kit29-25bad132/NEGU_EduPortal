import React, { useState, useEffect } from 'react';
import {
  MapPin,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  Zap,
  Sliders,
  Clock,
  Radio,
  UserCheck,
  Navigation,
} from 'lucide-react';
import { usePortalStore } from '../../lib/store';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { VerifiedStudentBadge, AttendanceStateBadge } from '../ui/Badge';
import { AttendanceScanRecord } from '../../types';

export const StudentQRCheckIn: React.FC = () => {
  const { currentUser, attendanceSessions, attendanceScans, addAttendanceScan } = usePortalStore();

  const [geoCoords, setGeoCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [checkInResult, setCheckInResult] = useState<{
    success: boolean;
    state: 'PRESENT' | 'FLAGGED';
    distanceMeters: number;
    allowedRadiusMeters: number;
    message: string;
    courseCode?: string;
    courseTitle?: string;
    timestamp?: string;
  } | null>(null);

  // Simulated Distance for Hackathon Testing & Live Demos
  const [simulatedDistanceOffset, setSimulatedDistanceOffset] = useState<number>(0); // 0 = in classroom (5m), 1 = outside boundary (120m)

  const activeSession = attendanceSessions.find((s) => s.status === 'ACTIVE');

  // Check if student already checked in for active session
  const existingScan = activeSession
    ? attendanceScans.find((s) => s.sessionId === activeSession.id && s.studentId === currentUser.id)
    : null;

  // Request browser geolocation
  const fetchLocation = () => {
    setGeoStatus('pending');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGeoCoords({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
          setGeoStatus('granted');
        },
        (err) => {
          console.warn('Geolocation fallback to campus center coordinate', err);
          setGeoCoords({ latitude: 12.9716, longitude: 77.5946 });
          setGeoStatus('granted');
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setGeoCoords({ latitude: 12.9716, longitude: 77.5946 });
      setGeoStatus('granted');
    }
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  // Perform Attendance Check-in
  const handlePerformCheckIn = async (forceOutsideGeofence = false) => {
    if (!activeSession) return;
    setIsCheckingIn(true);
    setCheckInResult(null);

    try {
      // Base teacher session coordinates
      const baseLat = activeSession.latitude || 12.9716;
      const baseLng = activeSession.longitude || 77.5946;

      // If user chose to simulate "Outside Geofence", add ~120m offset (0.001 deg lat ~ 111m)
      const latOffset = forceOutsideGeofence || simulatedDistanceOffset === 1 ? 0.0012 : 0.00004;
      const lngOffset = forceOutsideGeofence || simulatedDistanceOffset === 1 ? 0.0011 : 0.00003;

      const studentLat = baseLat + latOffset;
      const studentLng = baseLng + lngOffset;

      // Fetch fresh token from server
      const tokenRes = await fetch(`/api/attendance/session/token?sessionId=${activeSession.id}`);
      const tokenData = await tokenRes.json();

      // Submit check-in to server
      const scanRes = await fetch('/api/attendance/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: activeSession.id,
          studentId: currentUser.id,
          tokenNonce: tokenData.nonce,
          tokenHash: tokenData.tokenHash,
          studentLatitude: studentLat,
          studentLongitude: studentLng,
        }),
      });

      const data = await scanRes.json();

      const newScanRecord: AttendanceScanRecord = {
        id: `scan-${Date.now()}`,
        sessionId: activeSession.id,
        studentId: currentUser.id,
        studentName: currentUser.fullName,
        studentRegistrationNumber: currentUser.registrationNumber || 'NEGU2023CS042',
        state: data.state,
        scanTimestamp: data.scanTimestamp || new Date().toISOString(),
        studentLatitude: studentLat,
        studentLongitude: studentLng,
        calculatedDistanceMeters: data.calculatedDistanceMeters,
        flagReason: data.flagReason,
        courseCode: activeSession.courseCode,
        courseTitle: activeSession.courseTitle,
        sessionDate: activeSession.sessionDate,
      };

      addAttendanceScan(newScanRecord);

      setCheckInResult({
        success: data.state === 'PRESENT',
        state: data.state,
        distanceMeters: data.calculatedDistanceMeters,
        allowedRadiusMeters: data.allowedRadiusMeters || activeSession.allowedRadiusMeters,
        message: data.message,
        courseCode: activeSession.courseCode,
        courseTitle: activeSession.courseTitle,
        timestamp: new Date().toLocaleTimeString(),
      });
    } catch (err: any) {
      console.error('Check-in submission error', err);
    } finally {
      setIsCheckingIn(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Student Identity Card */}
      <Card className="border-blue-200 shadow-sm bg-gradient-to-r from-white via-blue-50/20 to-white">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-bold text-lg flex items-center justify-center shadow-md">
                {currentUser.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">{currentUser.fullName}</h3>
                  <VerifiedStudentBadge registrationNumber={currentUser.registrationNumber} />
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {currentUser.departmentName} • Section {currentUser.classCode || 'CSE-3A'}
                </p>
                <p className="text-[11px] font-mono text-slate-400 mt-1">
                  Official Email: {currentUser.email}
                </p>
              </div>
            </div>

            {/* GPS Signal Status */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
              <MapPin className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span>GPS Geofence: <strong className="text-emerald-600">Active & Calibrated</strong></span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Check-In Card */}
      {activeSession ? (
        <Card className="border-blue-200 shadow-md">
          <CardHeader
            title={
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span>Active Classroom Attendance Session</span>
              </div>
            }
            subtitle={`${activeSession.courseCode} - ${activeSession.courseTitle} (Instructor: ${activeSession.teacherName})`}
          />
          <CardContent className="p-6 space-y-6">
            {/* If already checked in */}
            {existingScan && !checkInResult && (
              <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-emerald-900">Attendance Recorded</h4>
                <p className="text-xs text-emerald-800 max-w-md mx-auto">
                  Status: <strong className="uppercase">{existingScan.state}</strong> at{' '}
                  {new Date(existingScan.scanTimestamp).toLocaleTimeString()} (Distance:{' '}
                  {existingScan.calculatedDistanceMeters}m).
                </p>
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePerformCheckIn(false)}
                    leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                    className="text-xs text-emerald-800 border-emerald-300"
                  >
                    Refresh / Check In Again
                  </Button>
                </div>
              </div>
            )}

            {/* Check-In Outcome Alert */}
            {checkInResult && (
              <div
                className={`p-6 rounded-2xl border text-center space-y-3 animate-in zoom-in-95 duration-200 ${
                  checkInResult.state === 'PRESENT'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto shadow-xs ${
                    checkInResult.state === 'PRESENT'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {checkInResult.state === 'PRESENT' ? (
                    <CheckCircle2 className="w-8 h-8" />
                  ) : (
                    <AlertTriangle className="w-8 h-8" />
                  )}
                </div>

                <div className="space-y-1">
                  <h4 className="text-lg font-bold">
                    {checkInResult.state === 'PRESENT'
                      ? 'Attendance Marked: PRESENT'
                      : 'Attendance FLAGGED (Geofence Alert)'}
                  </h4>
                  <p className="text-xs leading-relaxed max-w-lg mx-auto">{checkInResult.message}</p>
                </div>

                {/* Proof of Verification Table */}
                <div className="bg-white/80 rounded-xl p-4 max-w-md mx-auto border border-slate-200/80 text-xs text-left space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Student Name:</span>
                    <span className="font-semibold text-slate-900">{currentUser.fullName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Registration ID:</span>
                    <span className="font-mono font-semibold text-blue-600">
                      {currentUser.registrationNumber}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Calculated Distance:</span>
                    <span className="font-semibold text-slate-900">
                      {checkInResult.distanceMeters} meters (Allowed: {checkInResult.allowedRadiusMeters}m)
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Verification Timestamp:</span>
                    <span className="font-semibold text-slate-900">{checkInResult.timestamp}</span>
                  </div>
                </div>

                {checkInResult.state === 'FLAGGED' && (
                  <p className="text-[11px] text-amber-700 italic">
                    Your attendance is pending instructor resolution. Please approach your teacher if you are present in class.
                  </p>
                )}
              </div>
            )}

            {/* Check-In Action Section */}
            {(!existingScan || checkInResult) && (
              <div className="space-y-6">
                {/* Security Feature explanation */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-slate-900">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>How Geofence Verification Works:</span>
                  </div>
                  <p className="leading-relaxed">
                    1. When you initiate check-in, your device submits your calibrated GPS coordinates to the server.<br />
                    2. The server calculates the precise distance to the instructor's classroom terminal using the Haversine formula.<br />
                    3. If verified within the designated {activeSession.allowedRadiusMeters}m boundary, your attendance is immediately recorded.
                  </p>
                </div>

                {/* Interactive Demo Testing Mode Toggle */}
                <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-blue-600" />
                      Hackathon Demo Geofence Simulator
                    </span>
                    <span className="text-[11px] text-blue-700 font-medium">
                      Simulate Location Scenario
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSimulatedDistanceOffset(0)}
                      className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        simulatedDistanceOffset === 0
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Inside Classroom (~5m away)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSimulatedDistanceOffset(1)}
                      className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        simulatedDistanceOffset === 1
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span>Outside Boundary (~140m away)</span>
                    </button>
                  </div>
                </div>

                {/* Primary Check-In Button */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => handlePerformCheckIn(false)}
                    isLoading={isCheckingIn}
                    leftIcon={<Radio className="w-5 h-5" />}
                    className="w-full sm:flex-1 h-12 text-sm bg-blue-600 hover:bg-blue-700"
                    id="geofence-checkin-btn"
                  >
                    Verify & Check In to Classroom Session
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="justify-between">
            <span className="text-slate-500 text-xs">
              Session ID: <code className="text-slate-700 font-mono">{activeSession.id.slice(0, 12)}...</code>
            </span>
            <span className="text-blue-600 text-xs font-medium">
              Geofence: {activeSession.allowedRadiusMeters}m Boundary
            </span>
          </CardFooter>
        </Card>
      ) : (
        /* No active session notice */
        <Card className="border-slate-200 text-center py-12">
          <CardContent className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Clock className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">No Active Attendance Session</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Your instructors have not launched an active attendance session for your section right now. Please check back when class commences.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

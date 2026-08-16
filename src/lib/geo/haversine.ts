/**
 * Haversine Formula for Accurate Geodesic Distance Calculation
 * Used for Attendance Geofence Validation
 */

export interface LatLng {
  latitude: number;
  longitude: number;
}

const EARTH_RADIUS_METERS = 6371000; // 6,371 km in meters

/**
 * Calculates great-circle distance between two points in meters
 */
export function calculateHaversineDistance(point1: LatLng, point2: LatLng): number {
  const lat1Rad = toRadians(point1.latitude);
  const lat2Rad = toRadians(point2.latitude);
  const deltaLatRad = toRadians(point2.latitude - point1.latitude);
  const deltaLngRad = toRadians(point2.longitude - point1.longitude);

  const a =
    Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLngRad / 2) * Math.sin(deltaLngRad / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = EARTH_RADIUS_METERS * c;
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Server-authoritative geofence status evaluator
 */
export function evaluateGeofenceStatus(
  teacherLocation: LatLng,
  studentLocation: LatLng,
  allowedRadiusMeters: number
): {
  isWithinGeofence: boolean;
  calculatedDistanceMeters: number;
  allowedRadiusMeters: number;
  excessDistanceMeters: number;
} {
  const distance = calculateHaversineDistance(teacherLocation, studentLocation);
  const isWithin = distance <= allowedRadiusMeters;
  const excess = isWithin ? 0 : Math.round((distance - allowedRadiusMeters) * 10) / 10;

  return {
    isWithinGeofence: isWithin,
    calculatedDistanceMeters: distance,
    allowedRadiusMeters,
    excessDistanceMeters: excess,
  };
}

/**
 * Human-friendly distance display
 */
export function formatDistance(distanceMeters: number): string {
  if (distanceMeters < 1000) {
    return `${Math.round(distanceMeters)}m`;
  }
  return `${(distanceMeters / 1000).toFixed(2)}km`;
}

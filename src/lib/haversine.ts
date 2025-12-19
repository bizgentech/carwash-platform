/**
 * Haversine formula to calculate distance between two points on Earth
 * Returns distance in kilometers
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param coord1 First coordinate {latitude, longitude}
 * @param coord2 Second coordinate {latitude, longitude}
 * @returns Distance in kilometers
 */
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Earth's radius in kilometers

  const lat1 = toRadians(coord1.latitude);
  const lat2 = toRadians(coord2.latitude);
  const deltaLat = toRadians(coord2.latitude - coord1.latitude);
  const deltaLon = toRadians(coord2.longitude - coord1.longitude);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in km
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Check if a point is within a certain radius from a center point
 * @param center Center coordinate
 * @param point Point to check
 * @param radiusKm Radius in kilometers
 * @returns true if point is within radius
 */
export function isWithinRadius(center: Coordinates, point: Coordinates, radiusKm: number): boolean {
  const distance = calculateDistance(center, point);
  return distance <= radiusKm;
}

/**
 * Calculate match score based on rating and proximity
 * @param rating Washer rating (0-5)
 * @param distanceKm Distance in km
 * @param maxDistance Maximum distance for normalization (default: 50km)
 * @returns Score between 0 and 1
 */
export function calculateMatchScore(
  rating: number,
  distanceKm: number,
  maxDistance: number = 50
): number {
  // Normalize rating to 0-1 (5 stars = 1.0)
  const normalizedRating = rating / 5;

  // Normalize proximity to 0-1 (closer = higher score)
  // If distance is 0, proximity is 1. If distance >= maxDistance, proximity is 0
  const normalizedProximity = Math.max(0, 1 - (distanceKm / maxDistance));

  // Weighted score: 70% rating, 30% proximity
  const score = (normalizedRating * 0.7) + (normalizedProximity * 0.3);

  return score;
}

/**
 * Sort washers by match score
 */
export interface WasherWithDistance {
  id: string;
  name: string;
  rating: number;
  distanceKm: number;
  score: number;
  [key: string]: any;
}

export function sortWashersByScore(washers: WasherWithDistance[]): WasherWithDistance[] {
  return washers.sort((a, b) => b.score - a.score);
}

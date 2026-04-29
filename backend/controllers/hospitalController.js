import {
  findNearbyHospitals,
  searchHospitalsByLocation,
  getUserLocation,
} from '../services/hospitalService.js';
import { asyncHandler, AppError } from '../middleware/errorMiddleware.js';

export const searchByLocation = asyncHandler(async (req, res) => {
  const { location } = req.body;
  if (!location?.trim()) throw new AppError('Location is required', 400);

  const hospitals = await searchHospitalsByLocation(location);
  res.json({ success: true, data: hospitals, count: hospitals.length });
});

export const autoLocation = asyncHandler(async (req, res) => {
  const location = await getUserLocation();
  if (!location) throw new AppError('Could not detect location', 400);

  const hospitals = await findNearbyHospitals(location.lat, location.lon);
  res.json({
    success: true,
    location: `${location.city}, ${location.country}`,
    data: hospitals,
    count: hospitals.length,
  });
});

export const nearbyByCoords = asyncHandler(async (req, res) => {
  const { latitude, longitude } = req.body;
  if (!latitude || !longitude) throw new AppError('Latitude and longitude are required', 400);

  const hospitals = await findNearbyHospitals(latitude, longitude);
  res.json({ success: true, data: hospitals, count: hospitals.length });
});

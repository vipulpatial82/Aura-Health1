import axios from 'axios';
import logger from '../config/logger.js';
import { generateDirectionsUrl, getUserLocationByIP, getLocationCoordinates } from './locationService.js';

const findNearbyHospitals = async (lat, lon) => {
  const query = `
  [out:json];
  (
    node["amenity"="hospital"](around:3000,${lat},${lon});
    way["amenity"="hospital"](around:3000,${lat},${lon});
    relation["amenity"="hospital"](around:3000,${lat},${lon});
  );
  out center tags;
  `;

  try {
    const res = await axios.post(
      'https://overpass-api.de/api/interpreter',
      query,
      { headers: { 'Content-Type': 'text/plain' }, timeout: 10000 }
    );

    return res.data.elements.slice(0, 10).map((place, index) => ({
      id: index + 1,
      name: place.tags.name || 'Unnamed Hospital',
      address: place.tags['addr:street'] || place.tags['addr:full'] || 'Address not available',
      phone: place.tags.phone || 'Contact info not available',
      website: place.tags.website || 'N/A',
      emergency: place.tags.emergency === 'yes' ? '24/7 Emergency' : 'Regular hours',
      directionsUrl: generateDirectionsUrl(
        place.tags['addr:street'] || place.tags['addr:full'] || place.tags.name || 'Hospital'
      ),
    }));
  } catch (error) {
    logger.error('Error fetching hospitals from Overpass API', { message: error.message });
    return [];
  }
};

const searchHospitalsByLocation = async (locationName) => {
  const coordinates = await getLocationCoordinates(locationName);
  if (coordinates) {
    return findNearbyHospitals(coordinates.lat, coordinates.lon);
  }
  return [];
};

const getUserLocation = async () => {
  return getUserLocationByIP();
};

export { findNearbyHospitals, searchHospitalsByLocation, getUserLocation };

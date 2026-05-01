import axios from 'axios';
import logger from '../config/logger.js';
import { generateDirectionsUrl, getUserLocationByIP, getLocationCoordinates } from './locationService.js';

const findNearbyHospitals = async (lat, lon) => {
  const query = `
  [out:json][timeout:25];
  (
    node["amenity"="hospital"](around:10000,${lat},${lon});
    way["amenity"="hospital"](around:10000,${lat},${lon});
    relation["amenity"="hospital"](around:10000,${lat},${lon});
  );
  out body center tags;
  `;

  try {
    const res = await axios.post(
      'https://overpass-api.de/api/interpreter',
      query,
      { headers: { 'Content-Type': 'text/plain' }, timeout: 10000 }
    );

    return res.data.elements.slice(0, 12).map((place, index) => {
      const lat = place.lat || place.center?.lat;
      const lon = place.lon || place.center?.lon;
      return {
        id: place.id || index + 1,
        name: place.tags.name || 'Unnamed Hospital',
        address: [
          place.tags['addr:housenumber'],
          place.tags['addr:street'],
          place.tags['addr:city'],
        ].filter(Boolean).join(', ') || place.tags['addr:full'] || 'Address not available',
        phone: place.tags.phone || place.tags['contact:phone'] || null,
        website: place.tags.website || place.tags['contact:website'] || null,
        emergency: place.tags.emergency === 'yes' ? '24/7 Emergency' : 'Regular hours',
        directionsUrl: lat && lon
          ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`
          : generateDirectionsUrl(place.tags.name || 'Hospital'),
      };
    });
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

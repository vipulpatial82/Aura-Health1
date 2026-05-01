import axios from 'axios';
import logger from '../config/logger.js';
import { generateDirectionsUrl, getUserLocationByIP, getLocationCoordinates } from './locationService.js';

const OVERPASS_URLS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];

const buildQuery = (lat, lon) => `
[out:json][timeout:25];
(
  node["amenity"="hospital"](around:10000,${lat},${lon});
  way["amenity"="hospital"](around:10000,${lat},${lon});
  relation["amenity"="hospital"](around:10000,${lat},${lon});
);
out body center tags;
`;

const formatHospital = (place, index) => {
  const lat = place.lat || place.center?.lat;
  const lon = place.lon || place.center?.lon;
  const tags = place.tags || {};
  return {
    id: place.id || index + 1,
    name: tags.name || 'Unnamed Hospital',
    address: [
      tags['addr:housenumber'],
      tags['addr:street'],
      tags['addr:city'],
    ].filter(Boolean).join(', ') || tags['addr:full'] || 'Address not available',
    phone: tags.phone || tags['contact:phone'] || null,
    website: tags.website || tags['contact:website'] || null,
    emergency: tags.emergency === 'yes' ? '24/7 Emergency' : 'Regular hours',
    directionsUrl: lat && lon
      ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`
      : generateDirectionsUrl(tags.name || 'Hospital'),
  };
};

const findNearbyHospitals = async (lat, lon) => {
  const query = buildQuery(lat, lon);

  for (const url of OVERPASS_URLS) {
    try {
      const res = await axios.post(url, query, {
        headers: { 'Content-Type': 'text/plain' },
        timeout: 28000,
      });

      const elements = res.data?.elements;
      if (!Array.isArray(elements)) continue;

      const hospitals = elements
        .filter(e => e.tags?.name)
        .slice(0, 12)
        .map(formatHospital);

      if (hospitals.length > 0) return hospitals;
    } catch (err) {
      logger.error(`Overpass API failed (${url}): ${err.message}`);
      continue;
    }
  }

  logger.error('All Overpass mirrors failed');
  return [];
};

const searchHospitalsByLocation = async (locationName) => {
  const coordinates = await getLocationCoordinates(locationName);
  if (!coordinates) return [];
  return findNearbyHospitals(coordinates.lat, coordinates.lon);
};

const getUserLocation = async () => getUserLocationByIP();

export { findNearbyHospitals, searchHospitalsByLocation, getUserLocation };

import axios from 'axios';
import logger from '../config/logger.js';
import { generateDirectionsUrl, getUserLocationByIP, getLocationCoordinates } from './locationService.js';

const OVERPASS_URLS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

const buildQuery = (lat, lon) =>
  `[out:json][timeout:20];(node["amenity"="hospital"](around:10000,${lat},${lon});way["amenity"="hospital"](around:10000,${lat},${lon}););out body center tags;`;

const formatHospital = (place, index) => {
  const plat = place.lat || place.center?.lat;
  const plon = place.lon || place.center?.lon;
  const tags = place.tags || {};
  return {
    id: place.id || index + 1,
    name: tags.name || 'Unnamed Hospital',
    address: [
      tags['addr:housenumber'],
      tags['addr:street'],
      tags['addr:city'] || tags['addr:district'],
    ].filter(Boolean).join(', ') || tags['addr:full'] || tags['addr:suburb'] || 'Address not available',
    phone: tags.phone || tags['contact:phone'] || tags.fax || null,
    website: tags.website || tags['contact:website'] || null,
    emergency: tags.emergency === 'yes' ? '24/7 Emergency' : 'Regular hours',
    speciality: tags['healthcare:speciality'] || null,
    beds: tags.beds || null,
    directionsUrl: plat && plon
      ? `https://www.google.com/maps/dir/?api=1&destination=${plat},${plon}`
      : generateDirectionsUrl(tags.name || 'Hospital'),
  };
};

const findNearbyHospitals = async (lat, lon) => {
  const query = buildQuery(lat, lon);

  for (const url of OVERPASS_URLS) {
    try {
      const res = await axios.post(url, `data=${encodeURIComponent(query)}`, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 25000,
      });

      const elements = res.data?.elements;
      if (!Array.isArray(elements) || elements.length === 0) continue;

      const hospitals = elements
        .filter(e => e.tags?.name)
        .slice(0, 12)
        .map(formatHospital);

      if (hospitals.length > 0) {
        logger.info(`Found ${hospitals.length} hospitals via ${url}`);
        return hospitals;
      }
    } catch (err) {
      logger.error(`Overpass failed (${url}): ${err.message}`);
    }
  }

  return [];
};

const searchHospitalsByLocation = async (locationName) => {
  const coordinates = await getLocationCoordinates(locationName);
  if (!coordinates) return [];
  return findNearbyHospitals(coordinates.lat, coordinates.lon);
};

const getUserLocation = async () => getUserLocationByIP();

export { findNearbyHospitals, searchHospitalsByLocation, getUserLocation };

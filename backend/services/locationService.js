import logger from '../config/logger.js';

const ALLOWED_HOSTS = new Set(['nominatim.openstreetmap.org', 'ip-api.com']);

const safeFetch = (url, options) => {
  const { hostname } = new URL(url);
  if (!ALLOWED_HOSTS.has(hostname)) throw new Error(`Blocked request to disallowed host: ${hostname}`);
  return fetch(url, options);
};

export const generateDirectionsUrl = (hospitalAddress) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(hospitalAddress)}`;

export const getLocationCoordinates = async (locationName) => {
  if (!locationName || locationName.trim().length > 200) return null;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await safeFetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}`,
      { headers: { 'User-Agent': 'AuraHealth/1.0' }, signal: controller.signal }
    );
    clearTimeout(timeout);
    const data = await res.json();
    if (data.length > 0) return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  } catch (err) {
    logger.error('Geocoding error', { message: err.message });
  }
  return null;
};

export const getUserLocationByIP = async () => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await safeFetch('https://ip-api.com/json/', { signal: controller.signal });
    clearTimeout(timeout);
    const data = await res.json();
    if (!data.city) return null;
    return { city: data.city, lat: data.lat, lon: data.lon, country: data.country };
  } catch (err) {
    logger.error('IP geolocation error', { message: err.message });
    return null;
  }
};

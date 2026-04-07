module.exports = async function getLocationFromIp(ip) {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`http://ip-api.com/json/${ip}`);
    const data = await response.json();

    return {
      ip,
      country: data.country,
      city: data.city,
      region: data.regionName,
      lat: data.lat,
      lon: data.lon,
    };
  } catch (error) {
    console.error("Error getting IP location:", error);
    return null;
  }
};

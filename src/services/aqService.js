export async function getAQData(city) {
    return {
      city,
      aqi: null,
      pm25: null,
      source: 'placeholder',
      fetchedAt: new Date().toISOString(),
    };
  }
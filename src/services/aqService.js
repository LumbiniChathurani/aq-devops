import axios from 'axios';

let redis = null;

async function getRedis() {
  if (redis) return redis;
  try {
    const { createClient } = await import('redis');
    redis = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
    redis.on('error', () => {});
    await Promise.race([
      redis.connect(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 500))
    ]);
    return redis;
  } catch {
    redis = null;
    return null;
  }
}

export async function getAQData(city) {
  const cacheKey = `aqi:${city.toLowerCase()}`;
  const client = await getRedis();

  if (client) {
    try {
      const cached = await client.get(cacheKey);
      if (cached) {
        console.log(`Cache HIT for ${city}`);
        return { ...JSON.parse(cached), fromCache: true };
      }
    } catch {
      // ignore cache errors
    }
  }

  console.log(`Cache MISS for ${city} — fetching from API`);

  const response = await axios.get('https://api.openaq.org/v3/locations', {
    params: { city, limit: 5 },
    headers: {
      'X-API-Key': process.env.OPENAQ_API_KEY || '',
    },
  });

  const data = {
    city,
    locations: response.data.results || [],
    fetchedAt: new Date().toISOString(),
    fromCache: false,
  };

  if (client) {
    try {
      await client.set(cacheKey, JSON.stringify(data), { EX: 600 });
    } catch {
      // ignore cache errors
    }
  }

  return data;
}
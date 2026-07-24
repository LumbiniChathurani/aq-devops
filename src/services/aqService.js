import { createClient } from 'redis';
import axios from 'axios';

const redis = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });

redis.on('error', (err) => console.error('Redis error:', err));
await redis.connect();

export async function getAQData(city) {
  const cacheKey = `aqi:${city.toLowerCase()}`;

  // Check Redis first
  const cached = await redis.get(cacheKey);
  if (cached) {
    console.log(`Cache HIT for ${city}`);
    return { ...JSON.parse(cached), fromCache: true };
  }

  console.log(`Cache MISS for ${city} — fetching from API`);

  // Fetch from OpenAQ v3 API
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

  // Store in Redis for 10 minutes
  await redis.set(cacheKey, JSON.stringify(data), { EX: 600 });

  return data;
}
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export const redisClient = {
  get: (key: string) => redis.get<string>(key),
  set: async (key: string, value: string, ttl?: number) => {
    if (ttl) await redis.setex(key, ttl, value)
    else await redis.set(key, value)
  },
  del: (key: string) => redis.del(key),
  exists: async (key: string) => (await redis.exists(key)) === 1,
  invalidatePattern: async (pattern: string) => {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) await Promise.all(keys.map(k => redis.del(k)))
  },
  flushAll: () => redis.flushdb(),
  isRedisConnected: () => true,
  connect: async () => { },
  disconnect: async () => { },
}
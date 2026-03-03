import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Même API que ton ancien client pour ne rien casser
export const redisClient = {
  get: (key: string) => redis.get<string>(key),

  set: async (key: string, value: string, ttl?: number) => {
    if (ttl) {
      await redis.setex(key, ttl, value)
    } else {
      await redis.set(key, value)
    }
  },

  del: (key: string) => redis.del(key),

  exists: async (key: string) => {
    const result = await redis.exists(key)
    return result === 1
  },

  invalidatePattern: async (pattern: string) => {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await Promise.all(keys.map(k => redis.del(k)))
    }
  },

  flushAll: () => redis.flushdb(),

  isRedisConnected: () => true, // Upstash HTTP, toujours dispo

  connect: async () => { },    // no-op, plus nécessaire
  disconnect: async () => { }, // no-op, plus nécessaire
}


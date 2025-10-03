import { Redis } from '@upstash/redis'

// 创建Redis客户端实例
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Redis键名前缀
const REDIS_KEYS = {
  COUNTER: 'counter:',
  USER_SESSION: 'session:',
  RATE_LIMIT: 'rate_limit:',
  CACHE: 'cache:',
} as const

// 计数器相关的Redis操作
export const counterCache = {
  // 获取计数器值
  async get(userId: string, counterName: string): Promise<number | null> {
    const key = `${REDIS_KEYS.COUNTER}${userId}:${counterName}`
    const value = await redis.get<number>(key)
    return value
  },

  // 设置计数器值
  async set(userId: string, counterName: string, value: number, ttl: number = 3600): Promise<void> {
    const key = `${REDIS_KEYS.COUNTER}${userId}:${counterName}`
    await redis.set(key, value, { ex: ttl })
  },

  // 增加计数器值
  async increment(userId: string, counterName: string, increment: number = 1): Promise<number> {
    const key = `${REDIS_KEYS.COUNTER}${userId}:${counterName}`
    return await redis.incrby(key, increment)
  },

  // 删除计数器
  async del(userId: string, counterName: string): Promise<void> {
    const key = `${REDIS_KEYS.COUNTER}${userId}:${counterName}`
    await redis.del(key)
  },
}

// 用户会话缓存
export const sessionCache = {
  // 获取用户会话信息
  async getSession(userId: string): Promise<any | null> {
    const key = `${REDIS_KEYS.USER_SESSION}${userId}`
    return await redis.get(key)
  },

  // 设置用户会话信息
  async setSession(userId: string, sessionData: any, ttl: number = 86400): Promise<void> {
    const key = `${REDIS_KEYS.USER_SESSION}${userId}`
    await redis.set(key, sessionData, { ex: ttl })
  },

  // 删除用户会话
  async deleteSession(userId: string): Promise<void> {
    const key = `${REDIS_KEYS.USER_SESSION}${userId}`
    await redis.del(key)
  },
}

// 速率限制
export const rateLimit = {
  // 检查速率限制
  async checkLimit(identifier: string, limit: number, window: number): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const key = `${REDIS_KEYS.RATE_LIMIT}${identifier}`
    const now = Math.floor(Date.now() / 1000)
    const windowStart = now - window

    // 使用Redis的有序集合来实现滑动窗口
    const pipeline = redis.pipeline()
    
    // 移除过期的请求记录
    pipeline.zremrangebyscore(key, 0, windowStart)
    
    // 添加当前请求
    pipeline.zadd(key, { score: now, member: `${now}-${Math.random()}` })
    
    // 获取当前窗口内的请求数
    pipeline.zcard(key)
    
    // 设置过期时间
    pipeline.expire(key, window)
    
    const results = await pipeline.exec()
    const currentCount = (results?.[2] as any)?.[1] as number || 0
    
    const allowed = currentCount <= limit
    const remaining = Math.max(0, limit - currentCount)
    const resetTime = now + window

    return { allowed, remaining, resetTime }
  },
}

// 通用缓存操作
export const cache = {
  // 获取缓存
  async get<T>(key: string): Promise<T | null> {
    const fullKey = `${REDIS_KEYS.CACHE}${key}`
    return await redis.get<T>(fullKey)
  },

  // 设置缓存
  async set<T>(key: string, value: T, ttl: number = 3600): Promise<void> {
    const fullKey = `${REDIS_KEYS.CACHE}${key}`
    await redis.set(fullKey, value, { ex: ttl })
  },

  // 删除缓存
  async del(key: string): Promise<void> {
    const fullKey = `${REDIS_KEYS.CACHE}${key}`
    await redis.del(fullKey)
  },

  // 检查缓存是否存在
  async exists(key: string): Promise<boolean> {
    const fullKey = `${REDIS_KEYS.CACHE}${key}`
    const result = await redis.exists(fullKey)
    return result === 1
  },
}

// 健康检查
export const healthCheck = async (): Promise<boolean> => {
  try {
    await redis.ping()
    return true
  } catch (error) {
    console.error('Redis health check failed:', error)
    return false
  }
}

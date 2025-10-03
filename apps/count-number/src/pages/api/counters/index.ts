import { NextApiRequest, NextApiResponse } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase'
import { counterService } from '@/lib/database'
import { rateLimit } from '@/lib/redis'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 速率限制
  const ip = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || 'unknown'
  const rateLimitResult = await rateLimit.checkLimit(ip, 100, 60) // 100 requests per minute
  
  if (!rateLimitResult.allowed) {
    return res.status(429).json({ 
      error: 'Too many requests',
      resetTime: rateLimitResult.resetTime 
    })
  }

  try {
    // 验证用户身份
    const supabase = createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const userId = user.id

    switch (req.method) {
      case 'GET':
        const counters = await counterService.getUserCounters(userId)
        return res.status(200).json(counters)

      case 'POST':
        const { name, value = 0 } = req.body
        
        if (!name) {
          return res.status(400).json({ error: 'Name is required' })
        }

        const newCounter = await counterService.createCounter({
          user_id: userId,
          name,
          value,
        })
        
        return res.status(201).json(newCounter)

      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Counters API error:', error)
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    })
  }
}

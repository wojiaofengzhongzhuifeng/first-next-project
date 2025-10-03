import { NextApiRequest, NextApiResponse } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase'
import { counterService } from '@/lib/database'
import { rateLimit } from '@/lib/redis'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid counter ID' })
  }

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
      case 'PUT':
        const { value, increment } = req.body
        
        if (increment !== undefined) {
          // 增加计数器值
          const updatedCounter = await counterService.incrementCounter(
            id, 
            userId, 
            increment
          )
          return res.status(200).json(updatedCounter)
        } else if (value !== undefined) {
          // 设置计数器值
          const updatedCounter = await counterService.updateCounter(id, { value })
          return res.status(200).json(updatedCounter)
        } else {
          return res.status(400).json({ error: 'Value or increment is required' })
        }

      case 'DELETE':
        await counterService.deleteCounter(id, userId)
        return res.status(204).end()

      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Counter API error:', error)
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    })
  }
}

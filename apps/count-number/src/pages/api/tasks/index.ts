import { NextApiRequest, NextApiResponse } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase'
import { taskService } from '@/lib/database'
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
        const tasks = await taskService.getUserTasks(userId)
        return res.status(200).json(tasks)

      case 'POST':
        const { title, description, priority = 'medium', completed = false } = req.body
        
        if (!title) {
          return res.status(400).json({ error: 'Title is required' })
        }

        const newTask = await taskService.createTask({
          user_id: userId,
          title,
          description,
          priority,
          completed,
        })
        
        return res.status(201).json(newTask)

      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Tasks API error:', error)
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    })
  }
}

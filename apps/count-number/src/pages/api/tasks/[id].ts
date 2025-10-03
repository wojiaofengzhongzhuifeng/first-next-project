import { NextApiRequest, NextApiResponse } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase'
import { taskService } from '@/lib/database'
import { rateLimit } from '@/lib/redis'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid task ID' })
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
        const { title, description, priority, completed } = req.body
        
        const updateData: any = {}
        if (title !== undefined) updateData.title = title
        if (description !== undefined) updateData.description = description
        if (priority !== undefined) updateData.priority = priority
        if (completed !== undefined) updateData.completed = completed

        const updatedTask = await taskService.updateTask(id, updateData)
        return res.status(200).json(updatedTask)

      case 'DELETE':
        await taskService.deleteTask(id, userId)
        return res.status(204).end()

      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Task API error:', error)
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    })
  }
}

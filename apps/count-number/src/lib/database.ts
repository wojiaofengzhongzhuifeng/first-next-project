import { createServiceSupabaseClient } from './supabase'
import { counterCache, cache } from './redis'

// 简化的类型定义
interface Counter {
  id: string
  user_id: string
  name: string
  value: number
  created_at: string
  updated_at: string
}

interface Task {
  id: string
  user_id: string
  title: string
  description: string | null
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  created_at: string
  updated_at: string
}

interface UserPreferences {
  id: string
  user_id: string
  theme: 'light' | 'dark' | 'system'
  language: 'zh-CN' | 'en'
  created_at: string
  updated_at: string
}

// 计数器数据库操作
export const counterService = {
  // 获取用户的计数器
  async getUserCounters(userId: string): Promise<Counter[]> {
    const supabase = createServiceSupabaseClient()
    
    // 先尝试从缓存获取
    const cacheKey = `user_counters:${userId}`
    const cached = await cache.get<Counter[]>(cacheKey)
    if (cached) return cached

    const { data, error } = await supabase
      .from('counters')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    // 缓存结果
    await cache.set(cacheKey, data || [], 300) // 5分钟缓存

    return data || []
  },

  // 创建计数器
  async createCounter(counter: {
    user_id: string
    name: string
    value?: number
  }): Promise<Counter> {
    const supabase = createServiceSupabaseClient()
    
    const { data, error } = await supabase
      .from('counters')
      .insert(counter)
      .select()
      .single()

    if (error) throw error

    // 清除相关缓存
    await cache.del(`user_counters:${counter.user_id}`)

    return data
  },

  // 更新计数器
  async updateCounter(id: string, updates: {
    value?: number
  }): Promise<Counter> {
    const supabase = createServiceSupabaseClient()
    
    const { data, error } = await supabase
      .from('counters')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // 更新Redis缓存
    if (updates.value !== undefined && data.user_id && data.name) {
      await counterCache.set(data.user_id, data.name, updates.value)
    }

    // 清除相关缓存
    await cache.del(`user_counters:${data.user_id}`)

    return data
  },

  // 删除计数器
  async deleteCounter(id: string, userId: string): Promise<void> {
    const supabase = createServiceSupabaseClient()
    
    const { error } = await supabase
      .from('counters')
      .delete()
      .eq('id', id)

    if (error) throw error

    // 清除缓存
    await cache.del(`user_counters:${userId}`)
  },

  // 增加计数器值（带缓存优化）
  async incrementCounter(id: string, userId: string, increment: number = 1): Promise<Counter> {
    const supabase = createServiceSupabaseClient()
    
    // 先获取当前计数器
    const { data: currentCounter, error: fetchError } = await supabase
      .from('counters')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    // 使用Redis原子操作增加计数
    const newValue = await counterCache.increment(userId, currentCounter.name, increment)

    // 更新数据库
    const { data, error } = await supabase
      .from('counters')
      .update({ 
        value: newValue, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // 清除相关缓存
    await cache.del(`user_counters:${userId}`)

    return data
  },
}

// 任务数据库操作
export const taskService = {
  // 获取用户的任务
  async getUserTasks(userId: string): Promise<Task[]> {
    const supabase = createServiceSupabaseClient()
    
    // 先尝试从缓存获取
    const cacheKey = `user_tasks:${userId}`
    const cached = await cache.get<Task[]>(cacheKey)
    if (cached) return cached

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    // 缓存结果
    await cache.set(cacheKey, data || [], 300) // 5分钟缓存

    return data || []
  },

  // 创建任务
  async createTask(task: {
    user_id: string
    title: string
    description?: string
    priority?: 'low' | 'medium' | 'high'
    completed?: boolean
  }): Promise<Task> {
    const supabase = createServiceSupabaseClient()
    
    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select()
      .single()

    if (error) throw error

    // 清除相关缓存
    await cache.del(`user_tasks:${task.user_id}`)

    return data
  },

  // 更新任务
  async updateTask(id: string, updates: {
    title?: string
    description?: string
    priority?: 'low' | 'medium' | 'high'
    completed?: boolean
  }): Promise<Task> {
    const supabase = createServiceSupabaseClient()
    
    const { data, error } = await supabase
      .from('tasks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // 清除相关缓存
    if (data) {
      await cache.del(`user_tasks:${data.user_id}`)
    }

    return data
  },

  // 删除任务
  async deleteTask(id: string, userId: string): Promise<void> {
    const supabase = createServiceSupabaseClient()
    
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)

    if (error) throw error

    // 清除缓存
    await cache.del(`user_tasks:${userId}`)
  },

  // 获取任务统计
  async getTaskStats(userId: string): Promise<{
    total: number
    completed: number
    pending: number
    byPriority: Record<string, number>
  }> {
    const tasks = await this.getUserTasks(userId)
    
    const stats = {
      total: tasks.length,
      completed: tasks.filter(t => t.completed).length,
      pending: tasks.filter(t => !t.completed).length,
      byPriority: tasks.reduce((acc, task) => {
        acc[task.priority] = (acc[task.priority] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    }

    return stats
  },
}

// 用户偏好数据库操作
export const userPreferencesService = {
  // 获取用户偏好
  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    const supabase = createServiceSupabaseClient()
    
    // 先尝试从缓存获取
    const cacheKey = `user_preferences:${userId}`
    const cached = await cache.get<UserPreferences>(cacheKey)
    if (cached) return cached

    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error
    }

    // 缓存结果
    if (data) {
      await cache.set(cacheKey, data, 600) // 10分钟缓存
    }

    return data
  },

  // 创建或更新用户偏好
  async upsertUserPreferences(preferences: {
    user_id: string
    theme?: 'light' | 'dark' | 'system'
    language?: 'zh-CN' | 'en'
  }): Promise<UserPreferences> {
    const supabase = createServiceSupabaseClient()
    
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({
        ...preferences,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    // 更新缓存
    await cache.set(`user_preferences:${preferences.user_id}`, data, 600)

    return data
  },

  // 更新用户偏好
  async updateUserPreferences(userId: string, updates: {
    theme?: 'light' | 'dark' | 'system'
    language?: 'zh-CN' | 'en'
  }): Promise<UserPreferences> {
    const supabase = createServiceSupabaseClient()
    
    const { data, error } = await supabase
      .from('user_preferences')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error

    // 更新缓存
    await cache.set(`user_preferences:${userId}`, data, 600)

    return data
  },
}

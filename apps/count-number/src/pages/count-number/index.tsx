import React, { useEffect } from 'react'
import { AuthContainer } from '@/source/_components/AuthComponents'
import { useAuth } from '@/source/store/authStore'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

// 计数器组件
const CounterManager: React.FC = () => {
  const [counters, setCounters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newCounterName, setNewCounterName] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchCounters()
    }
  }, [user])

  const fetchCounters = async () => {
    try {
      const response = await fetch('/api/counters')
      if (response.ok) {
        const data = await response.json()
        setCounters(data)
      }
    } catch (error) {
      console.error('Failed to fetch counters:', error)
    } finally {
      setLoading(false)
    }
  }

  const createCounter = async () => {
    if (!newCounterName.trim()) return

    try {
      const response = await fetch('/api/counters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCounterName }),
      })

      if (response.ok) {
        setNewCounterName('')
        fetchCounters()
      }
    } catch (error) {
      console.error('Failed to create counter:', error)
    }
  }

  const incrementCounter = async (id: string) => {
    try {
      const response = await fetch(`/api/counters/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ increment: 1 }),
      })

      if (response.ok) {
        fetchCounters()
      }
    } catch (error) {
      console.error('Failed to increment counter:', error)
    }
  }

  const decrementCounter = async (id: string) => {
    try {
      const response = await fetch(`/api/counters/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ increment: -1 }),
      })

      if (response.ok) {
        fetchCounters()
      }
    } catch (error) {
      console.error('Failed to decrement counter:', error)
    }
  }

  const deleteCounter = async (id: string) => {
    try {
      const response = await fetch(`/api/counters/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchCounters()
      }
    } catch (error) {
      console.error('Failed to delete counter:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 创建新计数器 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          创建新计数器
        </h2>
        <div className="flex space-x-2">
          <input
            type="text"
            value={newCounterName}
            onChange={(e) => setNewCounterName(e.target.value)}
            placeholder="计数器名称"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            onKeyPress={(e) => e.key === 'Enter' && createCounter()}
          />
          <Button onClick={createCounter}>创建</Button>
        </div>
      </div>

      {/* 计数器列表 */}
      <div className="space-y-4">
        {counters.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            还没有计数器，创建一个吧！
          </div>
        ) : (
          counters.map((counter) => (
            <div
              key={counter.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {counter.name}
                  </h3>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {counter.value}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => decrementCounter(counter.id)}
                  >
                    -1
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => incrementCounter(counter.id)}
                  >
                    +1
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteCounter(counter.id)}
                  >
                    删除
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// 任务管理组件
const TaskManager: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchTasks()
    }
  }, [user])

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks')
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const createTask = async () => {
    if (!newTaskTitle.trim()) return

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTaskTitle }),
      })

      if (response.ok) {
        setNewTaskTitle('')
        fetchTasks()
      }
    } catch (error) {
      console.error('Failed to create task:', error)
    }
  }

  const toggleTask = async (id: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed }),
      })

      if (response.ok) {
        fetchTasks()
      }
    } catch (error) {
      console.error('Failed to toggle task:', error)
    }
  }

  const deleteTask = async (id: string) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchTasks()
      }
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 创建新任务 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          创建新任务
        </h2>
        <div className="flex space-x-2">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="任务标题"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            onKeyPress={(e) => e.key === 'Enter' && createTask()}
          />
          <Button onClick={createTask} className="bg-green-600 hover:bg-green-700">
            创建
          </Button>
        </div>
      </div>

      {/* 任务列表 */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            还没有任务，创建一个吧！
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id, task.completed)}
                    className="h-5 w-5 text-green-600 rounded focus:ring-green-500"
                  />
                  <span
                    className={`${
                      task.completed
                        ? 'line-through text-gray-500'
                        : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {task.title}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      task.priority === 'high'
                        ? 'bg-red-100 text-red-800'
                        : task.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {task.priority}
                  </span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteTask(task.id)}
                  >
                    删除
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// 主应用组件
const AppContent: React.FC = () => {
  const { isLoggedIn } = useAuth()
  const [activeTab, setActiveTab] = useState<'counters' | 'tasks'>('counters')

  if (!isLoggedIn) {
    return <AuthContainer />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 导航栏 */}
      <div className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              全链路MVP应用
            </h1>
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('counters')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'counters'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                计数器
              </button>
              <button
                onClick={() => setActiveTab('tasks')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'tasks'
                    ? 'bg-green-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                任务
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            {activeTab === 'counters' ? <CounterManager /> : <TaskManager />}
          </div>
          
          {/* 用户信息面板 */}
          <div className="lg:sticky lg:top-8 h-fit">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                用户信息
              </h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-lg">
                      {useAuth().displayName?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {useAuth().displayName}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {useAuth().user?.email}
                    </p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    功能特性
                  </h3>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <li>✅ Supabase数据库</li>
                    <li>✅ Upstash Redis缓存</li>
                    <li>✅ 用户认证系统</li>
                    <li>✅ 实时数据同步</li>
                    <li>✅ 速率限制保护</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CountNumberPage() {
  return <AppContent />
}

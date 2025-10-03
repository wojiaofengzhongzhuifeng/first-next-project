import React from 'react'

import { useUserPreferencesStore } from '@/source/store/userPreferencesStore'
import { useTaskManagerStore } from '@/source/store/taskManagerStore'

function Page({ test }: { test: number }) {
  const { theme, language, setTheme, setLanguage } = useUserPreferencesStore()
  const { tasks, addTask, getTaskStats } = useTaskManagerStore()
  const stats = getTaskStats()

  const handleAddTaskBasedOnTheme = () => {
    const taskThemes = {
      light: '浅色主题任务',
      dark: '深色主题任务',
      system: '系统主题任务',
    }

    addTask({
      title: `${taskThemes[theme]} - 数字: ${test}`,
      description: `当前语言: ${language === 'zh-CN' ? '中文' : 'English'}, 任务总数: ${stats.total}`,
      completed: false,
      priority: stats.total > 5 ? 'high' : 'medium',
    })
  }

  const handleSwitchThemeBasedOnTasks = () => {
    if (stats.total > 10) {
      setTheme('dark')
    } else if (stats.total > 5) {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  return (
    <div
      className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}
    >
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          两个域组件数据互通演示
        </h1>

        {/* 域间数据交互演示区 */}
        <div
          className={`mb-8 p-6 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
        >
          <h2 className="text-xl font-semibold mb-4">跨域数据交互演示</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div
              className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-blue-900' : 'bg-blue-50'}`}
            >
              <h3 className="font-semibold mb-2">数字域状态</h3>
              <p className="text-sm">当前数字: {test}</p>
            </div>

            <div
              className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-green-900' : 'bg-green-50'}`}
            >
              <h3 className="font-semibold mb-2">用户偏好域状态</h3>
              <p className="text-sm">主题: {theme}</p>
              <p className="text-sm">语言: {language}</p>
            </div>

            <div
              className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-orange-900' : 'bg-orange-50'}`}
            >
              <h3 className="font-semibold mb-2">任务管理域状态</h3>
              <p className="text-sm">总任务: {stats.total}</p>
              <p className="text-sm">已完成: {stats.completed}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleAddTaskBasedOnTheme}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              根据主题和数字添加任务
            </button>
            <button
              onClick={handleSwitchThemeBasedOnTasks}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              根据任务数量切换主题
            </button>
          </div>
        </div>

        {/* 两个域的组件展示 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">数字操作域组件</h2>
            <div
              className={`p-4 rounded-lg border-4 ${theme === 'dark' ? 'border-blue-400 bg-gray-800' : 'border-blue-600 bg-white'}`}
            >
              <div
                className={`mb-3 p-2 rounded text-sm font-medium ${theme === 'dark' ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'}`}
              >
                📊 数字操作域 - 负责数字的增减操作
              </div>
              <NumberAction data={test} />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">用户偏好域组件</h2>
            <div
              className={`p-4 rounded-lg border-4 ${theme === 'dark' ? 'border-green-400 bg-gray-800' : 'border-green-600 bg-white'}`}
            >
              <div
                className={`mb-3 p-2 rounded text-sm font-medium ${theme === 'dark' ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'}`}
              >
                🎨 用户偏好域 - 负责主题、语言等设置
              </div>
              <UserPreferences />
            </div>
          </div>
        </div>

        {/* 任务管理域组件 */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">任务管理域组件</h2>
          <div
            className={`p-4 rounded-lg border-4 ${theme === 'dark' ? 'border-orange-400 bg-gray-800' : 'border-orange-600 bg-white'}`}
          >
            <div
              className={`mb-3 p-2 rounded text-sm font-medium ${theme === 'dark' ? 'bg-orange-900 text-orange-200' : 'bg-orange-100 text-orange-800'}`}
            >
              📋 任务管理域 - 负责任务的增删改查
            </div>
            <TaskManager />
          </div>
        </div>

        {/* 数据流说明 */}
        <div
          className={`mt-8 p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}
        >
          <h2 className="text-xl font-semibold mb-4">跨域数据流说明</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">数据交互方式</h3>
              <ul className="text-sm space-y-1">
                <li>🔄 页面组件协调多个域的Store</li>
                <li>📊 数字域 → 任务域: 根据数字生成任务</li>
                <li>🎯 主题域 → 任务域: 根据主题设置任务</li>
                <li>📈 任务域 → 主题域: 根据任务数量切换主题</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">架构优势</h3>
              <ul className="text-sm space-y-1">
                <li>✅ 松耦合 - 各域独立管理状态</li>
                <li>🎯 精准更新 - 只更新相关状态</li>
                <li>🔧 易维护 - 单一职责原则</li>
                <li>📊 可观测 - 清晰的数据流向</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default Page

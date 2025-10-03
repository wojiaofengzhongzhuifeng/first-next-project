import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AuthUser } from '@/types/database'

interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}

interface AuthActions {
  setUser: (user: AuthUser | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, metadata?: any) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateProfile: (metadata: any) => Promise<void>
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // 初始状态
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,

      // Actions
      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
          error: null,
        })
      },

      setLoading: (isLoading) => {
        set({ isLoading })
      },

      setError: (error) => {
        set({ error })
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const { supabase } = await import('@/lib/supabase')
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (error) throw error

          set({
            user: data.user as AuthUser,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : '登录失败',
            isLoading: false,
          })
          throw error
        }
      },

      signup: async (email: string, password: string, metadata = {}) => {
        set({ isLoading: true, error: null })
        
        try {
          const { supabase } = await import('@/lib/supabase')
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: metadata,
            },
          })

          if (error) throw error

          set({
            user: data.user as AuthUser,
            isAuthenticated: !!data.user,
            isLoading: false,
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : '注册失败',
            isLoading: false,
          })
          throw error
        }
      },

      logout: async () => {
        set({ isLoading: true })
        
        try {
          const { supabase } = await import('@/lib/supabase')
          await supabase.auth.signOut()
          
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : '登出失败',
            isLoading: false,
          })
        }
      },

      resetPassword: async (email: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const { supabase } = await import('@/lib/supabase')
          const { error } = await supabase.auth.resetPasswordForEmail(email)
          
          if (error) throw error
          
          set({ isLoading: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : '重置密码失败',
            isLoading: false,
          })
          throw error
        }
      },

      updateProfile: async (metadata: any) => {
        set({ isLoading: true, error: null })
        
        try {
          const { supabase } = await import('@/lib/supabase')
          const { data, error } = await supabase.auth.updateUser({
            data: metadata,
          })

          if (error) throw error

          set({
            user: data.user as AuthUser,
            isLoading: false,
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : '更新资料失败',
            isLoading: false,
          })
          throw error
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// 选择器函数
export const useAuth = () => {
  const auth = useAuthStore()
  return {
    ...auth,
    // 便捷的布尔值
    isLoggedIn: auth.isAuthenticated && !!auth.user,
    // 用户显示名称
    displayName: auth.user?.user_metadata?.display_name || auth.user?.email || '未知用户',
    // 用户头像
    avatarUrl: auth.user?.user_metadata?.avatar_url,
  }
}

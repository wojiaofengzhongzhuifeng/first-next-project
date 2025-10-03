import { createClient } from '@supabase/supabase-js'
import { parseCookies, setCookie, destroyCookie } from 'nookies'

// 客户端Supabase实例
export const createSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// 服务端Supabase客户端（用于API路由）
export const createServiceSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// 创建服务器端Supabase客户端（用于API路由）
export const createServerSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

// 从请求中获取Supabase客户端（用于API路由）
export const createSupabaseFromRequest = (req: any) => {
  const cookies = parseCookies({ req })
  const accessToken = cookies['sb-access-token']
  const refreshToken = cookies['sb-refresh-token']

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      auth: {
        persistSession: false,
      },
    }
  )
}

// 设置认证Cookie
export const setAuthCookies = (res: any, accessToken: string, refreshToken: string) => {
  setCookie({ res }, 'sb-access-token', accessToken, {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  })

  setCookie({ res }, 'sb-refresh-token', refreshToken, {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  })
}

// 清除认证Cookie
export const clearAuthCookies = (res: any) => {
  destroyCookie({ res }, 'sb-access-token', { path: '/' })
  destroyCookie({ res }, 'sb-refresh-token', { path: '/' })
}

// 导出单例实例
export const supabase = createSupabaseClient()

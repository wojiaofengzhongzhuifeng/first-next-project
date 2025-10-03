import { createServerSupabaseClient } from '@/lib/supabase'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const supabase = createServerSupabaseClient()
    const { action, ...data } = req.body

    switch (action) {
      case 'signin':
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        })
        
        if (signInError) throw signInError
        
        return res.status(200).json({ user: signInData.user, session: signInData.session })

      case 'signup':
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: data.metadata || {},
          },
        })
        
        if (signUpError) throw signUpError
        
        return res.status(200).json({ user: signUpData.user, session: signUpData.session })

      case 'signout':
        const { error: signOutError } = await supabase.auth.signOut()
        if (signOutError) throw signOutError
        
        return res.status(200).json({ message: 'Signed out successfully' })

      case 'reset-password':
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(data.email)
        if (resetError) throw resetError
        
        return res.status(200).json({ message: 'Password reset email sent' })

      case 'update-user':
        const { data: updateData, error: updateError } = await supabase.auth.updateUser({
          data: data.metadata || {},
        })
        
        if (updateError) throw updateError
        
        return res.status(200).json({ user: updateData.user })

      default:
        return res.status(400).json({ error: 'Invalid action' })
    }
  } catch (error) {
    console.error('Auth API error:', error)
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    })
  }
}

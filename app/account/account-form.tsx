'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'

interface Props {
  user: User
}

export default function AccountForm({ user }: Props) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState({
    username: '',
    fullName: '',
    avatarUrl: ''
  })

  const updateProfile = async () => {
    try {
      setLoading(true)

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...profile,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      updateProfile()
    }}>
      <div className="space-y-4">
        {/* Form fields */}
      </div>
    </form>
  )
} 

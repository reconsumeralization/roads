import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import AccountForm from './account-form'

export default async function AccountPage() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
      <AccountForm user={user} />
    </div>
  )
}

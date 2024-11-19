'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createItem(formData: FormData) {
  try {
    // Validate input
    const name = formData.get('name')
    if (!name || typeof name !== 'string') {
      return {
        error: 'Invalid name provided',
      }
    }

    // Process data
    await db.item.create({
      data: {
        name,
      },
    })

    // Revalidate and redirect on success
    revalidatePath('/items')
    redirect('/items')
  } catch (error) {
    // Return error message for form
    return {
      error: 'Failed to create item. Please try again.',
    }
  }
}

'use client'

import { useFormState } from 'react-dom'
import { createItem } from '@/lib/actions'

export function ItemForm() {
  const [state, formAction] = useFormState(createItem, {
    error: null,
  })

  return (
    <form action={formAction}>
      <input type="text" name="name" required />
      {state.error && (
        <p className="text-sm text-red-500" aria-live="polite">
          {state.error}
        </p>
      )}
      <button type="submit">Create Item</button>
    </form>
  )
}

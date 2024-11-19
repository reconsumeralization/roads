import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { withToast } from '@/hoc/withToast'
import type { WithToastProps } from '@/hoc/withToast'

interface NotificationFormProps extends WithToastProps {
  onSubmit: (data: FormData) => Promise<void>
}

function NotificationFormBase({ showToast, onSubmit }: NotificationFormProps) {
  const form = useForm({
    resolver: zodResolver(displayFormSchema),
    defaultValues: {
      items: ['recents', 'home'],
    },
  })

  const handleSubmit = async (data: FormData) => {
    try {
      await onSubmit(data)
      showToast({
        title: 'Success',
        description: 'Your notification preferences have been updated.',
        variant: 'default',
      })
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Failed to update preferences. Please try again.',
        variant: 'destructive',
      })
    }
  }

  return <Form {...form}>{/* Form fields */}</Form>
}

export const NotificationForm = withToast(NotificationFormBase)

import { useLeadStore } from '@/stores/useLeadStore'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { withErrorBoundary } from '@/hocs/withErrorBoundary'
import { withLoading } from '@/hocs/withLoading'

interface LeadFormProps {
  isLoading?: boolean
}

function LeadFormComponent({ isLoading }: LeadFormProps) {
  const { handleNewLead } = useLeadStore()
  const { sendNotification } = useNotificationStore()

  const onSubmit = async (data: LeadFormData) => {
    try {
      await handleNewLead({
        ...data,
        timestamp: new Date(),
        status: 'NEW',
      })

      sendNotification({
        type: 'SUCCESS',
        message: 'New lead captured successfully',
      })
    } catch (error) {
      sendNotification({
        type: 'ERROR',
        message: 'Failed to capture lead',
      })
    }
  }

  return <form onSubmit={onSubmit}>{/* Form JSX */}</form>
}

// Compose multiple HOCs
export const LeadForm = withErrorBoundary(
  withLoading(
    LeadFormComponent,
    <div className="custom-loader">Loading lead form...</div>
  ),
  <div className="custom-error">
    <h3>Error loading lead form</h3>
    <p>Please try again later</p>
  </div>
)

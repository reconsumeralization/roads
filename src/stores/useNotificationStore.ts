import { useBusinessStore } from './useBusinessStore'
import { shallow } from 'zustand/shallow'

export const useNotificationStore = () => {
  return useBusinessStore(
    (state) => ({
      notifications: state.domains.notifications,
      sendNotification: state.sendNotification,
      markNotificationRead: state.markNotificationRead,
    }),
    shallow
  )
}

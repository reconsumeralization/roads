import { useBusinessStore } from './useBusinessStore'
import { shallow } from 'zustand/shallow'

export const useLeadStore = () => {
  return useBusinessStore(
    (state) => ({
      leads: state.domains.leadGeneration.capture.forms,
      handleNewLead: state.handleNewLead,
      updateLeadStatus: state.updateLeadStatus,
    }),
    shallow
  )
}

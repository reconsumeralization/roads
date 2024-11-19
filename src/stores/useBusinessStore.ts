import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { BusinessProtocol } from '@/types/core-protocol'

interface BusinessState extends BusinessProtocol {
  // Lead Management
  handleNewLead: (lead: Lead) => Promise<void>
  updateLeadStatus: (leadId: string, status: LeadStatus) => void

  // Notification System
  sendNotification: (notification: Notification) => Promise<void>
  markNotificationRead: (notificationId: string) => void

  // Content Management
  updateContent: (content: WebContent) => Promise<void>
  optimizeContent: (contentId: string) => Promise<void>

  // Analytics & Research
  trackMetric: (metric: BusinessMetric) => void
  generateInsights: () => Promise<ResearchInsight[]>
}

export const useBusinessStore = create<BusinessState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        id: 'concrete-business',
        version: '1.0.0',
        name: 'ConcreteBusinessOperations',

        // Lead Management
        handleNewLead: async (lead) => {
          set((state) => {
            state.domains.leadGeneration.capture.forms.push(lead)
          })
          await get().sendNotification({
            type: 'NEW_LEAD',
            data: lead,
          })
        },

        // Notification System
        sendNotification: async (notification) => {
          set((state) => {
            state.domains.notifications.push(notification)
          })
        },

        // Content Management
        updateContent: async (content) => {
          set((state) => {
            state.domains.contentManagement[content.id] = content
          })
          await get().optimizeContent(content.id)
        },

        // Research & Analytics
        trackMetric: (metric) => {
          set((state) => {
            state.domains.research.metrics.push(metric)
          })
        },
      })),
      {
        name: 'concrete-business-storage',
        storage: window.localStorage,
      }
    )
  )
)

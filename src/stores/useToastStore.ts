import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { motion, AnimatePresence } from 'framer-motion-3d'
import type { ToastPosition, ToastVariant, ToastPriority } from '@/types'

interface Toast {
  id: string
  title: string
  description?: string
  variant: ToastVariant
  position: ToastPosition
  priority: ToastPriority
  duration?: number
  progress?: number
  isPaused?: boolean
  action?: {
    label: string
    onClick: () => void
  }
  onDismiss?: () => void
}

interface ToastStore {
  toasts: Toast[]
  pausedToasts: Set<string>
  config: {
    maxToasts: number
    defaultDuration: number
    defaultPosition: ToastPosition
  }
  // Actions
  addToast: (toast: Omit<Toast, 'id'>) => string
  updateToast: (id: string, update: Partial<Toast>) => void
  dismissToast: (id: string) => void
  pauseToast: (id: string) => void
  resumeToast: (id: string) => void
  clearAllToasts: () => void
  // Config
  updateConfig: (config: Partial<ToastStore['config']>) => void
}

export const useToastStore = create<ToastStore>()(
  subscribeWithSelector((set, get) => ({
    toasts: [],
    pausedToasts: new Set(),
    config: {
      maxToasts: 3,
      defaultDuration: 5000,
      defaultPosition: 'bottom-right',
    },

    addToast: (toast) => {
      const id = crypto.randomUUID()
      const { maxToasts } = get().config

      set((state) => {
        // Sort by priority and remove excess toasts
        const sortedToasts = [...state.toasts, { ...toast, id }]
          .sort((a, b) => b.priority - a.priority)
          .slice(0, maxToasts)

        return { toasts: sortedToasts }
      })

      // Auto-dismiss after duration
      if (toast.duration !== Infinity) {
        const duration = toast.duration || get().config.defaultDuration
        setTimeout(() => get().dismissToast(id), duration)
      }

      return id
    },

    updateToast: (id, update) => {
      set((state) => ({
        toasts: state.toasts.map((t) =>
          t.id === id ? { ...t, ...update } : t
        ),
      }))
    },

    dismissToast: (id) => {
      const toast = get().toasts.find((t) => t.id === id)
      if (toast?.onDismiss) toast.onDismiss()

      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
        pausedToasts: new Set([...state.pausedToasts].filter((i) => i !== id)),
      }))
    },

    pauseToast: (id) => {
      set((state) => ({
        pausedToasts: new Set([...state.pausedToasts, id]),
      }))
    },

    resumeToast: (id) => {
      set((state) => ({
        pausedToasts: new Set([...state.pausedToasts].filter((i) => i !== id)),
      }))
    },

    clearAllToasts: () => {
      get().toasts.forEach((toast) => {
        if (toast.onDismiss) toast.onDismiss()
      })
      set({ toasts: [], pausedToasts: new Set() })
    },

    updateConfig: (config) => {
      set((state) => ({
        config: { ...state.config, ...config },
      }))
    },
  }))
)

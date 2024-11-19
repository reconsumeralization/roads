import { render, act, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { UnifiedToast } from '../components/UnifiedToast'
import { mockWebGLContext, createTestCanvas } from './test-utils'

expect.extend(toHaveNoViolations)

describe('UnifiedToast Accessibility Tests', () => {
  let canvas: HTMLCanvasElement
  let gl: WebGLRenderingContext

  beforeEach(() => {
    canvas = createTestCanvas()
    gl = mockWebGLContext(canvas)
  })

  afterEach(() => {
    canvas.remove()
  })

  it('meets WCAG accessibility guidelines', async () => {
    const { container } = render(
      <UnifiedToast
        toast={{
          id: 'a11y-test',
          title: 'Accessibility Test',
          description: 'Testing accessibility features',
        }}
      />
    )

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('supports keyboard navigation and interaction', async () => {
    const onDismiss = jest.fn()
    const { container } = render(
      <UnifiedToast
        toast={{
          id: 'keyboard-test',
          title: 'Keyboard Test',
        }}
        onDismiss={onDismiss}
      />
    )

    const alert = container.querySelector('[role="alert"]')!

    // Tab navigation
    fireEvent.keyDown(alert, { key: 'Tab' })
    expect(document.activeElement).toBe(alert)

    // Escape to dismiss
    fireEvent.keyDown(alert, { key: 'Escape' })
    expect(onDismiss).toHaveBeenCalled()

    // Enter to trigger action
    fireEvent.keyDown(alert, { key: 'Enter' })
    expect(alert).toHaveAttribute('data-pressed', 'true')
  })

  it('maintains focus during animations', async () => {
    const { container } = render(
      <UnifiedToast
        toast={{
          id: 'focus-test',
          title: 'Focus Test',
        }}
      />
    )

    const alert = container.querySelector('[role="alert"]')!
    alert.focus()

    await act(async () => {
      // Trigger animation
      fireEvent.mouseEnter(alert)

      // Verify focus is maintained
      expect(document.activeElement).toBe(alert)

      // Let animation complete
      await new Promise((resolve) => setTimeout(resolve, 300))

      // Focus should still be maintained
      expect(document.activeElement).toBe(alert)
    })
  })

  it('handles screen reader announcements properly', () => {
    const { container } = render(
      <UnifiedToast
        toast={{
          id: 'sr-test',
          title: 'Screen Reader Test',
          description: 'Important notification',
          variant: 'destructive',
        }}
      />
    )

    const alert = container.querySelector('[role="alert"]')!

    // Verify ARIA attributes
    expect(alert).toHaveAttribute('aria-live', 'assertive')
    expect(alert).toHaveAttribute('aria-atomic', 'true')
    expect(alert).toHaveAttribute('aria-label', expect.any(String))
  })
})

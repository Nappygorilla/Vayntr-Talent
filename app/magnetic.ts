'use client'

import { useEffect } from 'react'

const SELECTOR = '.button'
/** Hard ceiling: the button never travels further than this from its resting spot. */
const MAX_OFFSET = 6
/** Fraction of that ceiling reached at the very edge of the button. */
const EDGE_RATIO = 0.78
/** The lift the stylesheets already apply to primary buttons on hover. */
const HOVER_LIFT = -1
const TRANSITION_MS = 160

type Geometry = { left: number; top: number; width: number; height: number }

/**
 * A deliberately weak magnetic pull: while the pointer is inside a primary
 * button, it drifts toward the cursor in proportion to how far the cursor is
 * from the center — at most a few pixels, and never past MAX_OFFSET. Delegated
 * so it keeps working for buttons rendered after mount. Skipped entirely for
 * touch input and for anyone who asked for reduced motion.
 */
export function useMagneticButtons() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!finePointer.matches || reducedMotion.matches) return

    let active: HTMLElement | null = null
    let geometry: Geometry | null = null
    let frame = 0
    let resetTimer = 0
    let lastX = 0
    let lastY = 0

    function buttonFor(target: EventTarget | null) {
      if (!(target instanceof Element)) return null
      const candidate = target.closest<HTMLElement>(SELECTOR)
      if (!candidate) return null
      if (candidate.hasAttribute('disabled') || candidate.getAttribute('aria-disabled') === 'true') return null
      return candidate
    }

    function deactivate() {
      if (!active) return
      const previous = active
      active = null
      geometry = null
      window.clearTimeout(resetTimer)
      previous.style.transform = ''
      resetTimer = window.setTimeout(() => {
        previous.style.transition = ''
        previous.style.willChange = ''
      }, TRANSITION_MS + 40)
    }

    function activate(button: HTMLElement) {
      if (active === button) return
      deactivate()
      active = button
      measure(button)
      // Inline rather than a class: React re-renders reset className, which would
      // drop a class this hook added, but leave the transform behind.
      button.style.transition = `transform ${TRANSITION_MS}ms cubic-bezier(.18, .9, .24, 1)`
      button.style.willChange = 'transform'
    }

    function measure(button: HTMLElement) {
      const rect = button.getBoundingClientRect()
      geometry = { left: rect.left, top: rect.top, width: rect.width, height: rect.height }
    }

    function update() {
      if (!active || !geometry) return
      const halfWidth = Math.max(geometry.width / 2, 1)
      const halfHeight = Math.max(geometry.height / 2, 1)
      const dx = lastX - (geometry.left + halfWidth)
      const dy = lastY - (geometry.top + halfHeight)
      const clamp = (value: number) => Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, value))
      const x = clamp((dx / halfWidth) * MAX_OFFSET * EDGE_RATIO)
      const y = clamp((dy / halfHeight) * MAX_OFFSET * EDGE_RATIO + HOVER_LIFT)
      active.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`
    }

    function handleOver(event: PointerEvent) {
      const button = buttonFor(event.target)
      if (!button) return
      activate(button)
      lastX = event.clientX
      lastY = event.clientY
      update()
    }

    function handleMove(event: PointerEvent) {
      if (!active) {
        handleOver(event)
        return
      }
      if (!active.isConnected) {
        deactivate()
        return
      }
      lastX = event.clientX
      lastY = event.clientY
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        update()
      })
    }

    function handleOut(event: PointerEvent) {
      if (!active) return
      const next = event.relatedTarget
      if (next instanceof Node && active.contains(next)) return
      deactivate()
    }

    function reset() {
      deactivate()
    }

    function handleResize() {
      // The pull is measured against the button's own box, so a reflow invalidates it.
      reset()
    }

    document.addEventListener('pointerover', handleOver)
    document.addEventListener('pointermove', handleMove)
    document.addEventListener('pointerout', handleOut)
    document.addEventListener('pointerdown', reset, true)
    window.addEventListener('scroll', reset, { passive: true })
    window.addEventListener('resize', handleResize)
    window.addEventListener('blur', reset)

    return () => {
      document.removeEventListener('pointerover', handleOver)
      document.removeEventListener('pointermove', handleMove)
      document.removeEventListener('pointerout', handleOut)
      document.removeEventListener('pointerdown', reset, true)
      window.removeEventListener('scroll', reset)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('blur', reset)
      if (frame) cancelAnimationFrame(frame)
      window.clearTimeout(resetTimer)
      if (active) {
        active.style.transform = ''
        active.style.transition = ''
        active.style.willChange = ''
      }
    }
  }, [])
}

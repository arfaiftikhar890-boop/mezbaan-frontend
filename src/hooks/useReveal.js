
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Fades elements into view as they scroll on screen.
export function useRevealOnScroll() {
  const { pathname } = useLocation()

  useEffect(() => {
    // Disable reveal animations on admin pages.
    if (pathname.startsWith('/admin')) {
      document
        .querySelectorAll('[data-reveal]')
        .forEach((el) => {
          el.classList.add('in')
          el.removeAttribute('data-seen')
        })

      return
    }

    // Find elements that have not been revealed yet.
    const els = () =>
      document.querySelectorAll(
        '[data-reveal]:not(.in):not([data-seen])'
      )

    // Show all elements if IntersectionObserver is unavailable.
    if (!('IntersectionObserver' in window)) {
      document
        .querySelectorAll('[data-reveal]')
        .forEach((el) => el.classList.add('in'))

      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in')
            io.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -6% 0px',
      }
    )

    // Observe elements that need reveal animation.
    const scan = () => {
      els().forEach((el) => {
        el.setAttribute('data-seen', '1')
        io.observe(el)
      })
    }

    scan()

    // Detect newly added elements.
    const root = document.getElementById('root')

    if (!root) {
      io.disconnect()
      return
    }

    const mo = new MutationObserver(scan)

    mo.observe(root, {
      childList: true,
      subtree: true,
    })

    // Clean up when the route changes.
    return () => {
      io.disconnect()
      mo.disconnect()
    }
  }, [pathname])
}

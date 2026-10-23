// A little dot flies from the Add button to the cart icon in the header.
export function flyToCart(fromEl) {
  const target = document.querySelector('[data-cart-target]')
  if (!fromEl || !target || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const a = fromEl.getBoundingClientRect()
  const b = target.getBoundingClientRect()
  const sx = a.left + a.width / 2
  const sy = a.top + a.height / 2
  const dx = b.left + b.width / 2 - sx
  const dy = b.top + b.height / 2 - sy
  const dot = document.createElement('div')
  dot.className = 'fly-dot'
  dot.style.left = `${sx - 14}px`
  dot.style.top = `${sy - 14}px`
  document.body.appendChild(dot)
  const anim = dot.animate(
    [
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: `translate(${dx * 0.45}px, ${Math.min(dy, 0) - 90}px) scale(.85)`, opacity: 1, offset: 0.45 },
      { transform: `translate(${dx}px, ${dy}px) scale(.25)`, opacity: 0.5 },
    ],
    { duration: 760, easing: 'cubic-bezier(.45,.05,.55,.95)' },
  )
  anim.onfinish = () => {
    dot.remove()
    target.classList.remove('bump')
    void target.offsetWidth
    target.classList.add('bump')
  }
}

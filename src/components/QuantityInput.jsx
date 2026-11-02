import { useState, useEffect } from 'react'

export default function QuantityInput({ value, onChange, min = 0, max = 999, className = '' }) {
  const [text, setText] = useState(String(value))

  useEffect(() => {
    setText(String(value))
  }, [value])

  const commit = () => {
    let n = parseInt(text, 10)
    if (isNaN(n)) n = min
    n = Math.min(max, Math.max(min, n))
    setText(String(n))
    onChange(n)
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      className={`qty-input ${className}`}
      value={text}
      aria-label="Quantity"
      onFocus={(e) => e.target.select()}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => setText(e.target.value.replace(/\D/g, ''))}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          commit()
          e.target.blur()
        }
      }}
    />
  )
}

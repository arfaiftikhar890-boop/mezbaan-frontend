import { useCallback, useEffect, useState } from 'react'
import { api } from '../api'
import { PREFERRED_CATEGORY_ORDER } from '../config'

export function useMenu() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    try {
      setItems(await api('/menu'))
      setError('')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload()
  }, [reload])

  return { items, loading, error, reload, demo: false }
}

export function categoriesOf(items) {
  const set = [...new Set(items.map((i) => i.category || 'Other'))]
  return set.sort((a, b) => {
    const ia = PREFERRED_CATEGORY_ORDER.indexOf(a)
    const ib = PREFERRED_CATEGORY_ORDER.indexOf(b)
    if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
    return a.localeCompare(b)
  })
}

export function groupByCategory(items) {
  return categoriesOf(items).map((name) => ({
    name,
    items: items
      .filter((i) => (i.category || 'Other') === name)
      .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0) || a.name.localeCompare(b.name)),
  }))
}

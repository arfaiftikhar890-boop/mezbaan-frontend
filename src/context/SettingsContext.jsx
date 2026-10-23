import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../api'
import { CONTACT, DEFAULT_SETTINGS } from '../config'
import { BRAND } from '../config'

const SettingsContext = createContext({ settings: DEFAULT_SETTINGS, reload: () => {} })

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)

  const reload = useCallback(async () => {
    try {
      const data = await api('/settings')
      const blank = (v) => !v || /^0300-?0000000$|^923000000000$/.test(String(v).replace(/\s/g, ''))
      setSettings({
        ...DEFAULT_SETTINGS,
        ...data,
        phone: blank(data.phone) ? CONTACT.phone : data.phone,
        whatsapp: blank(data.whatsapp) ? CONTACT.whatsapp : data.whatsapp,
      })
    } catch {
      /* keep defaults if the server is unreachable */
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload()
  }, [reload])

  useEffect(() => {
    document.title = BRAND
  }, [])

  const value = useMemo(() => ({ settings, reload }), [settings, reload])
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSettings = () => useContext(SettingsContext).settings
// eslint-disable-next-line react-refresh/only-export-components
export const useReloadSettings = () => useContext(SettingsContext).reload

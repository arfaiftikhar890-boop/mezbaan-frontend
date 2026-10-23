import { useLocation } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { telHref, waLink } from '../lib/utils'

// Round Call and WhatsApp buttons that stay on every customer page.
export default function ContactDock() {
  const s = useSettings()
  const { pathname } = useLocation()
  if (pathname.startsWith('/admin')) return null
  return (
    <div className={`dock ${pathname.startsWith('/menu') ? 'up' : ''}`}>
      <a className="wa" href={waLink(s.whatsapp, 'Hi! I would like to place an order.')} target="_blank" rel="noreferrer" aria-label="Order on WhatsApp">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.9L2 22l5.25-1.38A9.9 9.9 0 1 0 12.04 2zm0 1.8a8.1 8.1 0 1 1-4.3 15l-.3-.18-3.1.82.83-3.03-.2-.32A8.1 8.1 0 0 1 12.04 3.8zm-3.1 3.9c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5s1.07 2.9 1.22 3.1c.15.2 2.1 3.2 5.1 4.5 2.5 1.07 3 .86 3.55.8.55-.05 1.77-.72 2.02-1.42.25-.7.25-1.3.18-1.42-.08-.12-.28-.2-.58-.35-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.8-1.67-2.1-.18-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.2-.24-.58-.49-.5-.67-.5z" />
        </svg>
        <span>WhatsApp us</span>
      </a>
      <a className="tel" href={telHref(s.phone)} aria-label={`Call ${s.phone}`}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
        </svg>
        <span>Call {s.phone}</span>
      </a>
    </div>
  )
}

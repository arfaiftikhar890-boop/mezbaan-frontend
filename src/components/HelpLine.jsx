import { useSettings } from '../context/SettingsContext'
import { telHref, waLink } from '../lib/utils'

export default function HelpLine({ className = '' }) {
  const s = useSettings()
  return (
    <p className={`helpline ${className}`}>
      Need help with your order? Call <a href={telHref(s.phone)}>{s.phone}</a> or{' '}
      <a href={waLink(s.whatsapp, 'Hi! I need help with my order.')} target="_blank" rel="noreferrer">
        message us on WhatsApp
      </a>
      .
    </p>
  )
}

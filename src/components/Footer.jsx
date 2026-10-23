import { Link } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { telHref, waLink } from '../lib/utils'
import { LogoMark } from './Art'
import { BRAND } from '../config'

const YEAR = new Date().getFullYear()

export default function Footer() {
  const s = useSettings()
  return (
    <footer className="footer" id="contact">
      <div className="container footer-inner">
        <div>
          <div className="brand brand-light">
            <LogoMark size={36} />
            <span className="brand-name">{BRAND}</span>
          </div>
          <p>{s.tagline}</p>
        </div>
        <div>
          <h4>Visit us</h4>
          <p>{s.address}</p>
          <p>{s.hours}</p>
        </div>
        <div>
          <h4>Order and contact</h4>
          <p>
            <a className="footer-call" href={telHref(s.phone)}>
              {s.phone}
            </a>
          </p>
          <p>
            <a href={waLink(s.whatsapp, 'Hi! I have a question.')} target="_blank" rel="noreferrer">
              Chat on WhatsApp
            </a>
          </p>
          <p>
            <Link to="/menu">See the menu</Link>
          </p>
        </div>
      </div>
      <div className="container footer-note">
        © {YEAR} {BRAND}. All rights reserved.
        <div className="powered-by">Powered by EloraTech</div>
      </div>
    </footer>
  )
}

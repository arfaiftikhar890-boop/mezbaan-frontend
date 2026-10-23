import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useMenu, categoriesOf } from '../hooks/useMenu'
import { useSettings } from '../context/SettingsContext'
import { telHref, waLink } from '../lib/utils'
import { assetUrl } from '../api'
import ItemCard from '../components/ItemCard'
import { CategoryArt, LogoMark, tintOf } from '../components/Art'
import { BRAND } from '../config'

function payWays(s) {
  const g = s.gateways || {}
  return [
    s.codEnabled && 'Cash on delivery',
    (g.jazzcash || s.easypaisaEnabled) && 'JazzCash',
    (g.easypaisa || s.easypaisaEnabled) && 'Easypaisa',
    s.bankEnabled && 'Bank transfer',
  ].filter(Boolean)
}

const FALLBACK_WORDS = ['Pulao', 'Biryani', 'Halwa Puri', 'Parathas', 'Lassi', 'Chai', 'Shakes']

export default function Home() {
  const s = useSettings()
  const { items } = useMenu()
  const heroRef = useRef(null)
  const available = items.filter((i) => i.available !== false)
  const popular = (available.some((i) => i.featured) ? available.filter((i) => i.featured) : available).slice(0, 8)
  const cats = categoriesOf(items)
  const ways = payWays(s)
  // One real photo per category: a featured item with a picture if there is one, otherwise any item with a picture.
  const photoOf = (c) => {
    const inCat = available.filter((i) => (i.category || 'Other') === c && i.imageUrl)
    return (inCat.find((i) => i.featured) || inCat[0])?.imageUrl
  }
  const words = cats.length ? cats : FALLBACK_WORDS

  // The hero photo follows the pointer a little (desktop only).
  function move(e) {
    if (e.pointerType === 'touch') return
    const el = heroRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.setProperty('--ry', `${(x * 10).toFixed(2)}deg`)
    el.style.setProperty('--rx', `${(-y * 8).toFixed(2)}deg`)
  }
  function leave() {
    heroRef.current?.style.setProperty('--ry', '0deg')
    heroRef.current?.style.setProperty('--rx', '0deg')
  }

  return (
    <>
      <section className="hero" onPointerMove={move} onPointerLeave={leave}>
        <span className="orb orb-1" aria-hidden="true" />
        <span className="orb orb-2" aria-hidden="true" />
        <span className="orb orb-3" aria-hidden="true" />
        <div className="container hero-inner">
          <div className="hero-copy">
            <h1>
              {BRAND.split(' ').map((w, i) => (
                <span key={i}>
                  <span className="w">
                    <span style={{ '--i': i }}>{w}</span>
                  </span>{' '}
                </span>
              ))}
            </h1>
            <p className="hero-sub rise" style={{ '--k': 1 }}>
              {s.tagline}
            </p>
            <div className="hero-actions rise" style={{ '--k': 2 }}>
              <Link to="/menu" className="btn btn-lg btn-saffron">
                Order now
              </Link>
              <a className="btn btn-lg btn-ghost" href={telHref(s.phone)}>
                Call {s.phone}
              </a>
            </div>
            <p className="hero-hours rise" style={{ '--k': 3 }}>
              Open {s.hours}
            </p>
          </div>
          <div className="hero-media" ref={heroRef}>
            <div className="plate-stage">
              <span className="plate-glow" aria-hidden="true" />
              <span className="plate-ring plate-ring-1" aria-hidden="true" />
              <span className="plate-ring plate-ring-2" aria-hidden="true" />
              <div className="plate-float">
                <img className="plate-img" src="/hero-bbq-platter.jpg" width="1408" height="768" alt="BBQ platter served at MEZBAAN" fetchPriority="high" />
              </div>
              <svg className="plate-steam" viewBox="0 0 200 120" aria-hidden="true">
                <path d="M50 110 C38 85 62 70 50 42 C44 28 54 16 50 4" />
                <path d="M100 112 C88 84 112 66 100 38 C94 22 104 12 100 0" />
                <path d="M150 110 C138 86 162 72 150 44 C144 30 154 18 150 6" />
              </svg>
              <span className="spice sp-1" aria-hidden="true" />
              <span className="spice sp-2" aria-hidden="true" />
              <span className="spice sp-3" aria-hidden="true" />
              <span className="spice sp-4" aria-hidden="true" />
              <span className="spice sp-5" aria-hidden="true" />
            </div>
            <div className="spin-badge" aria-hidden="true">
              <svg viewBox="0 0 120 120">
                <defs>
                  <path id="badge-circle" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
                </defs>
                <text fontSize="11.5" fontWeight="800" letterSpacing="2" fill="currentColor">
                  <textPath href="#badge-circle" textLength="268">
                    FRESH • HOT • DESI • DAILY •{' '}
                  </textPath>
                </text>
              </svg>
              <span className="badge-mid">
                <LogoMark size={54} />
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          {[0, 1].map((n) => (
            <div className="ticker-half" key={n}>
              {words.concat(words).map((w, i) => (
                <span key={i}>{w}</span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {!s.acceptingOrders && <div className="notice notice-warn container">We are not taking online orders right now. Please check back soon.</div>}

      {ways.length > 0 && (
        <div className="container payways" aria-label="Ways to pay" data-reveal>
          <span className="payways-title">Pay with</span>
          {ways.map((w) => (
            <span key={w} className="payway">
              {w}
            </span>
          ))}
        </div>
      )}

      {cats.length > 0 && (
        <section className="container section">
          <h2 className="uline" data-reveal>
            Browse the menu
          </h2>
          <div className="cat-tiles">
            {cats.map((c, i) => (
              <Link key={c} to={`/menu?cat=${encodeURIComponent(c)}`} className="cat-tile" style={{ background: tintOf(c), '--i': i }} data-reveal>
                {photoOf(c) ? (
                  <span className="cat-photo">
                    <img src={assetUrl(photoOf(c))} alt="" loading="lazy" />
                  </span>
                ) : (
                  <CategoryArt category={c} />
                )}
                <span className="cat-name">{c}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {popular.length > 0 && (
        <section className="container section">
          <div className="section-head">
            <h2 className="uline" data-reveal>
              Popular right now
            </h2>
            <Link to="/menu" className="link">
              See the full menu
            </Link>
          </div>
          <div className="grid">
            {popular.map((i, n) => (
              <div className="rv" key={i.id} data-reveal style={{ '--i': n % 4 }}>
                <ItemCard item={i} />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="container section">
        <div className="banners">
          <img src="/banner-chole-thali.jpg" alt="Chole, puri and halwa thali at MEZBAAN" />
          <img src="/banner-parathas.jpg" alt="Traditional parathas at MEZBAAN" style={{ '--i': 2 }} />
          <img src="/banner-halwa-puri-breakfast.jpg" alt="Traditional Halwa Puri breakfast at MEZBAAN" style={{ '--i': 4 }} />
        </div>
      </section>

      <section className="container section about" id="story">
        <div data-reveal="left">
          <h2 className="uline">Our story</h2>
          <p className="about-text">{s.about}</p>
        </div>
        <div className="info-box" data-reveal="right">
          <h3>Find us</h3>
          <p>{s.address}</p>
          <p>{s.hours}</p>
          <a className="info-call" href={telHref(s.phone)}>
            {s.phone}
          </a>
          <div className="info-actions">
            <a className="btn btn-saffron" href={telHref(s.phone)}>
              Call now
            </a>
            <a className="btn btn-ghost" href={waLink(s.whatsapp, 'Hi! I would like to place an order.')} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  )
}

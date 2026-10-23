// Original, hand-drawn SVG artwork used across the site: the logo, the hero scene and the
// illustrations shown for menu items that have no photo yet. Upload real photos in Admin → Menu
// and they replace these automatically.

const INK = '#1e3a6e'
const GREEN = '#132a52'
const LEAF = '#3f6fb0'
const SAFFRON = '#8fb4e6'
const CREAM = '#eef3fa'
const BROWN = '#5b6b85'
const ROSE = '#7f9fd0'

export function LogoMark({ size = 40 }) {
  return (
    <img
      src="/mezbaan-logo.png"
      width={size}
      height={size}
      alt="Logo"
      className="logo-mark"
      style={{ borderRadius: '50%', objectFit: 'cover' }}
    />
  )
}

/* ------------------------------ single dishes ------------------------------ */

function Coffee() {
  return (
    <g>
      <ellipse cx="60" cy="94" rx="38" ry="8" fill="#fff" />
      <path d="M82 54h6a9 9 0 0 1 0 18h-9" fill="none" stroke={INK} strokeWidth="6" strokeLinecap="round" />
      <path d="M28 48h54v14a27 27 0 0 1-27 27h0A27 27 0 0 1 28 62z" fill={INK} />
      <ellipse cx="55" cy="48" rx="27" ry="6" fill={BROWN} />
      <path d="M49 48c3-3.5 8-3.5 12 0-4 3-8.500 3-12 0z" fill="#d9a77a" />
      <g className="steam" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" opacity=".55">
        <path d="M44 36c-4-5 4-8 0-14" />
        <path d="M56 38c-4-5 4-8 0-16" />
        <path d="M68 36c-4-5 4-8 0-14" />
      </g>
    </g>
  )
}

function Breakfast() {
  return (
    <g>
      <circle cx="60" cy="64" r="40" fill="#fff" />
      <circle cx="60" cy="64" r="31" fill="none" stroke="#dfe9e2" strokeWidth="2" />
      <path d="M38 58c-2-9 8-14 16-11 8-6 22-1 22 10 6 4 3 16-7 17-6 6-18 4-22-2-8 1-12-6-9-14z" fill="#fffdf6" stroke="#e6ecd9" strokeWidth="1.5" />
      <circle cx="58" cy="60" r="10" fill={SAFFRON} />
      <circle cx="55" cy="57" r="3" fill="#ffd675" />
      <rect x="76" y="70" width="22" height="18" rx="4" fill="#d9a35f" transform="rotate(-18 87 79)" />
      <rect x="79" y="73" width="16" height="12" rx="3" fill="#f0c98e" transform="rotate(-18 87 79)" />
      <path d="M30 78c4 2 8 0 10-3" fill="none" stroke={LEAF} strokeWidth="3.5" strokeLinecap="round" />
    </g>
  )
}

function Sandwich() {
  return (
    <g>
      <ellipse cx="60" cy="100" rx="40" ry="6" fill="#fff" opacity=".8" />
      <path d="M20 54a40 22 0 0 1 80 0z" fill="#d9a35f" />
      <circle cx="42" cy="42" r="2" fill="#f6dba7" />
      <circle cx="60" cy="37" r="2" fill="#f6dba7" />
      <circle cx="78" cy="42" r="2" fill="#f6dba7" />
      <path d="M16 56c6 6 10-2 16 2s10-4 16 0 10-4 16 0 10-4 16 0 10-2 14 0v6H16z" fill={LEAF} />
      <rect x="20" y="64" width="80" height="8" rx="4" fill={ROSE} />
      <path d="M18 72h84l-6 7H24z" fill={SAFFRON} />
      <path d="M20 80h80v8a10 10 0 0 1-10 10H30a10 10 0 0 1-10-10z" fill="#d9a35f" />
    </g>
  )
}

function Dessert() {
  return (
    <g>
      <ellipse cx="60" cy="96" rx="42" ry="8" fill="#fff" />
      <path d="M22 88V58L96 46v42z" fill="#f6d6a8" />
      <path d="M22 58L96 46v8L22 66z" fill="#fff5e0" />
      <path d="M22 70L96 58v6L22 76z" fill={BROWN} />
      <path d="M22 58c4 8 8 8 12 0s8 8 12 0 8 8 12 0 8 8 12 0 8 6 14-2l0-10L22 58z" fill="#f48aa0" transform="translate(0 -12)" />
      <path d="M96 46v42l-18-4V50z" fill="#e9bf86" opacity=".5" />
      <circle cx="58" cy="30" r="9" fill="#d2314f" />
      <path d="M58 22c1-6 5-9 9-10" fill="none" stroke={LEAF} strokeWidth="3" strokeLinecap="round" />
      <circle cx="55" cy="27" r="2.5" fill="#f58ca1" />
    </g>
  )
}

function Drink() {
  return (
    <g>
      <path d="M72 14l-12 34" stroke={ROSE} strokeWidth="6" strokeLinecap="round" />
      <path d="M32 40h56l-7 56a8 8 0 0 1-8 7H47a8 8 0 0 1-8-7z" fill="#fff" opacity=".85" />
      <path d="M35 58h50l-4 38a8 8 0 0 1-8 7H47a8 8 0 0 1-8-7z" fill={SAFFRON} />
      <path d="M35 58h50l-.8 6H35.800z" fill="#ffd979" />
      <rect x="46" y="72" width="14" height="14" rx="3" fill="#fff" opacity=".7" transform="rotate(-14 53 79)" />
      <rect x="62" y="80" width="12" height="12" rx="3" fill="#fff" opacity=".6" transform="rotate(12 68 86)" />
      <circle cx="90" cy="44" r="14" fill={LEAF} />
      <circle cx="90" cy="44" r="10" fill="#cdeb8b" />
      <path d="M90 34v20M80 44h20M83 37l14 14M97 37L83 51" stroke={LEAF} strokeWidth="1.5" />
    </g>
  )
}

function Plate() {
  return (
    <g>
      <circle cx="60" cy="62" r="40" fill="#fff" />
      <circle cx="60" cy="62" r="28" fill="none" stroke="#dfe9e2" strokeWidth="2" />
      <path d="M44 62a16 16 0 0 1 32 0z" fill={SAFFRON} />
      <rect x="40" y="62" width="40" height="5" rx="2.500" fill={INK} />
      <circle cx="60" cy="44" r="3" fill={INK} />
    </g>
  )
}

const ART = {
  Coffee,
  Breakfast,
  Sandwiches: Sandwich,
  Desserts: Dessert,
  Drinks: Drink,
  'Chai & Coffee': Coffee,
  'Shakes & Coolers': Drink,
  'Lassi & Flavored Milk': Drink,
  Beverages: Drink,
}

export const CATEGORY_TINT = {
  Coffee: '#e8f0fb',
  Breakfast: '#d6e4f5',
  Sandwiches: '#dde8f7',
  Desserts: '#c3d7f0',
  Drinks: '#eef3fa',
  'Chai & Coffee': '#e8f0fb',
  'Shakes & Coolers': '#d6e4f5',
  'Lassi & Flavored Milk': '#dde8f7',
  Beverages: '#c3d7f0',
}
export const tintOf = (category) => CATEGORY_TINT[category] || '#eef3fa'

export function CategoryArt({ category, className = '' }) {
  const Piece = ART[category] || Plate
  return (
    <svg viewBox="0 0 120 120" className={`cat-art ${className}`} aria-hidden="true" focusable="false">
      <Piece />
    </svg>
  )
}

/* ------------------------------- hero scene ------------------------------- */

export function HeroArt() {
  return (
    <svg viewBox="0 0 460 440" className="hero-art" role="img" aria-label="A latte, an iced drink and a slice of cake">
      <circle cx="240" cy="226" r="196" fill={SAFFRON} />
      <circle cx="240" cy="226" r="150" fill="#b5cdef" />
      <path d="M40 392h390" stroke={CREAM} strokeWidth="6" strokeLinecap="round" opacity=".5" />
      <g transform="translate(118 112) scale(2.5)">
        <Coffee />
      </g>
      <g transform="translate(-6 232) scale(1.55)">
        <Drink />
      </g>
      <g transform="translate(298 262) scale(1.45)">
        <Dessert />
      </g>
      <g fill={CREAM}>
        <circle cx="64" cy="108" r="6" />
        <circle cx="404" cy="132" r="9" />
        <circle cx="378" cy="70" r="4" />
      </g>
    </svg>
  )
}

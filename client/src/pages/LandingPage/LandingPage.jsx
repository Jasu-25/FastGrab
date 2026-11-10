import { useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Apple,
  ArrowRight,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Croissant,
  CupSoda,
  Globe,
  LocateFixed,
  Mail,
  MapPin,
  MessageCircle,
  Pill,
  Plus,
  QrCode,
  Search,
  Shirt,
  ShoppingBag,
  ShoppingBasket,
  ShoppingCart,
  Star,
  Store,
  Timer,
} from 'lucide-react'
import Logo from '../../components/Logo.jsx'
import { AppleIcon, PlayStoreIcon } from '../../components/BrandIcons.jsx'
import './LandingPage.css'

// ---------- Static content (will come from the API later) ----------

const CATEGORIES = [
  { label: 'Groceries', icon: Apple, tone: 'green' },
  { label: 'Bakery', icon: Croissant, tone: 'orange' },
  { label: 'Beverages', icon: CupSoda, tone: 'blue' },
  { label: 'Pharmacy', icon: Pill, tone: 'red' },
  { label: 'Clothing', icon: Shirt, tone: 'purple' },
  { label: 'More', icon: Plus, tone: 'neutral' },
]

// `image`: put a photo in src/assets and import it here to replace the placeholder.
const STORES = [
  {
    name: 'GreenGrocer Central',
    description: 'Fresh organic produce, dairy and pantry essentials',
    rating: 4.8,
    reviews: '2.4k',
    readyIn: '20 m',
    distance: '0.4 km',
    nextSlot: '14:30',
    tag: 'Free Pickup',
    icon: ShoppingBasket,
    tone: 'green',
    image: null,
  },
  {
    name: "Baker's Corner",
    description: 'Artisan sourdough, pastries and morning coffee',
    rating: 4.9,
    reviews: '1.8k',
    readyIn: '15 m',
    distance: '1.2 km',
    nextSlot: '14:15',
    tag: '₹20 deposit',
    icon: Croissant,
    tone: 'orange',
    image: null,
  },
  {
    name: 'Urban Mart',
    description: 'Household supplies, toiletries and general goods',
    rating: 4.6,
    reviews: '3k',
    readyIn: '45 m',
    distance: '0.8 km',
    nextSlot: '15:00',
    tag: 'Free Pickup',
    icon: Store,
    tone: 'teal',
    image: null,
  },
  {
    name: 'MediPlus Pharmacy',
    description: 'Medicines, wellness and personal care',
    rating: 4.7,
    reviews: '980',
    readyIn: '10 m',
    distance: '1.5 km',
    nextSlot: '14:10',
    tag: 'Free Pickup',
    icon: Pill,
    tone: 'red',
    image: null,
  },
  {
    name: 'Chai & Co.',
    description: 'Fresh brews, snacks and grab-and-go breakfast',
    rating: 4.5,
    reviews: '640',
    readyIn: '10 m',
    distance: '0.6 km',
    nextSlot: '14:05',
    tag: 'Free Pickup',
    icon: CupSoda,
    tone: 'blue',
    image: null,
  },
]

const STEPS = [
  {
    title: 'Choose & Shop',
    text: 'Browse stores nearby and add your daily essentials to the cart.',
    icon: Store,
  },
  {
    title: 'Schedule Pickup',
    text: 'Select a convenient 15-minute time slot for your pickup today or later.',
    icon: CalendarClock,
  },
  {
    title: 'Grab & Go',
    text: 'Show your QR code at the designated counter and collect your packed bags.',
    icon: QrCode,
  },
]

const CURRENT_YEAR = new Date().getFullYear()

const AVATARS = [
  { initials: 'AK', color: '#f7c59f' },
  { initials: 'PR', color: '#b5d8f7' },
  { initials: 'SM', color: '#c8ecd9' },
]

// ---------- Sections ----------

function Navbar() {
  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Logo />

        <label className="navbar__search">
          <Search size={16} aria-hidden="true" />
          <span className="sr-only">Search for stores or items</span>
          <input type="search" placeholder="Search for stores or items..." />
        </label>

        <div className="navbar__actions">
          <button type="button" className="navbar__location">
            <MapPin size={16} aria-hidden="true" />
            Bengaluru, IN
          </button>
          <button type="button" className="navbar__cart" aria-label="Cart, 0 items">
            <ShoppingCart size={20} />
            <span className="navbar__cart-badge">0</span>
          </button>
          <Link to="/get-started" className="btn btn--primary btn--sm">
            Login
          </Link>
        </div>
      </div>
    </header>
  )
}

function Hero() {
  const handleExplore = (e) => {
    e.preventDefault()
    document.getElementById('stores')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="hero">
      <div className="container hero__inner">
        <div className="hero__content">
          <span className="hero__badge">
            <span className="hero__badge-dot" />
            No Queues. No Delivery Fees.
          </span>

          <h1 className="hero__title">
            Order Ahead.
            <span>Grab &amp; Go.</span>
          </h1>

          <p className="hero__text">
            Pre-order from your favourite local supermarkets and shops. Schedule a pickup time
            that suits you and collect your packed items in seconds.
          </p>

          <form className="hero__search" onSubmit={handleExplore}>
            <label className="hero__search-input">
              <span className="sr-only">Your location</span>
              <input type="text" placeholder="Enter your current location..." />
              <button type="button" className="hero__locate" aria-label="Use my current location">
                <LocateFixed size={18} />
              </button>
            </label>
            <button type="submit" className="btn btn--accent">
              Explore Stores <ArrowRight size={18} />
            </button>
          </form>

          <div className="hero__social">
            <div className="avatar-stack">
              {AVATARS.map((a) => (
                <span key={a.initials} className="avatar" style={{ background: a.color }}>
                  {a.initials}
                </span>
              ))}
            </div>
            <p>
              <strong>10k+</strong> happy commuters saving time daily
            </p>
          </div>
        </div>

        <div className="hero__visual">
          <div className="hero__image">
            {/* Replace this placeholder with a photo: <img src={heroImg} alt="..." /> */}
            <div className="hero__placeholder">
              <ShoppingBag size={96} strokeWidth={1.25} />
              <span>FastGrab</span>
            </div>
          </div>

          <div className="hero__stat">
            <span className="hero__stat-icon">
              <Timer size={20} />
            </span>
            <div>
              <p className="hero__stat-label">Avg. saving</p>
              <p className="hero__stat-value">15 mins / day</p>
            </div>
            <span className="hero__stat-bar" />
          </div>
        </div>
      </div>
    </section>
  )
}

function Categories() {
  return (
    <section className="categories">
      <div className="container">
        <div className="section-head">
          <h2 className="section-title">Browse Categories</h2>
          <a href="#stores" className="link">
            View All
          </a>
        </div>

        <div className="categories__grid">
          {CATEGORIES.map(({ label, icon: Icon, tone }) => (
            <button key={label} type="button" className="category-card">
              <span className={`category-card__icon tone-${tone}`}>
                <Icon size={22} />
              </span>
              {label}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

function StoreCard({ store }) {
  const Icon = store.icon
  return (
    <article className="store-card">
      <div className={`store-card__media tone-${store.tone}`}>
        {store.image ? (
          <img src={store.image} alt={store.name} />
        ) : (
          <Icon size={56} strokeWidth={1.25} aria-hidden="true" />
        )}
        <span className="store-card__rating">
          <Star size={13} fill="currentColor" strokeWidth={0} />
          {store.rating} <span>({store.reviews})</span>
        </span>
        <span className="store-card__ready">Ready in {store.readyIn}</span>
      </div>

      <div className="store-card__body">
        <div className="store-card__row">
          <h3>{store.name}</h3>
          <span className="store-card__distance">{store.distance}</span>
        </div>
        <p className="store-card__desc">{store.description}</p>
        <div className="store-card__tags">
          <span className="tag tag--slot">Next Slot: {store.nextSlot}</span>
          <span className="tag">{store.tag}</span>
        </div>
      </div>
    </article>
  )
}

function NearbyStores() {
  const trackRef = useRef(null)

  const scroll = (direction) => {
    const track = trackRef.current
    if (!track) return
    track.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: 'smooth' })
  }

  return (
    <section className="stores" id="stores">
      <div className="container">
        <div className="section-head">
          <div>
            <h2 className="section-title">Nearby FastGrab Stores</h2>
            <p className="section-subtitle">Pickup ready in as little as 30 minutes.</p>
          </div>
          <div className="stores__arrows">
            <button type="button" className="icon-btn" onClick={() => scroll(-1)} aria-label="Previous stores">
              <ChevronLeft size={18} />
            </button>
            <button type="button" className="icon-btn" onClick={() => scroll(1)} aria-label="Next stores">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="stores__track" ref={trackRef}>
          {STORES.map((store) => (
            <StoreCard key={store.name} store={store} />
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  return (
    <section className="how">
      <div className="container">
        <h2 className="how__title">Skip the Queues in 3 Steps</h2>
        <p className="how__subtitle">
          FastGrab is designed for the modern commute. Order on your way, pick up as you pass.
        </p>

        <ol className="how__steps">
          {STEPS.map(({ title, text, icon: Icon }, i) => (
            <li key={title} className="how__step">
              <span className="how__icon">
                <Icon size={24} />
                <span className="how__num">{i + 1}</span>
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>

        <Link to="/get-started" className="btn btn--accent btn--lg">
          Get Started Now
        </Link>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <Logo />
            <p>The future of local shopping. Fast, convenient, and queue-free pickup for everyone.</p>
            <div className="footer__socials">
              <a href="#" aria-label="Website">
                <Globe size={16} />
              </a>
              <a href="#" aria-label="Email us">
                <Mail size={16} />
              </a>
              <a href="#" aria-label="Chat with us">
                <MessageCircle size={16} />
              </a>
            </div>
          </div>

          <div>
            <h4>Company</h4>
            <ul>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Careers</a></li>
              <li><Link to="/merchant/signup">Partner with Us</Link></li>
              <li><Link to="/merchant/login">Store Login</Link></li>
            </ul>
          </div>

          <div>
            <h4>Support</h4>
            <ul>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Safety Information</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
            </ul>
          </div>

          <div>
            <h4>Mobile App</h4>
            <p className="footer__app-text">Download the app for the fastest pickup experience.</p>
            <div className="footer__apps">
              <a href="#" className="app-btn">
                <AppleIcon size={20} />
                <span>
                  <small>Download on the</small>
                  App Store
                </span>
              </a>
              <a href="#" className="app-btn">
                <PlayStoreIcon size={18} />
                <span>
                  <small>Get it on</small>
                  Google Play
                </span>
              </a>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <p>© {CURRENT_YEAR} FastGrab Technologies. All rights reserved.</p>
          <div className="footer__pay">
            <span>UPI</span>
            <span>RuPay</span>
            <span>VISA</span>
            <span>Mastercard</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Categories />
        <NearbyStores />
        <HowItWorks />
      </main>
      <Footer />
    </>
  )
}

export default LandingPage

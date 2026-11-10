import { useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Apple,
  ArrowRight,
  BadgePercent,
  Bell,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleX,
  Croissant,
  CupSoda,
  Globe,
  Heart,
  LocateFixed,
  Mail,
  MapPin,
  MessageCircle,
  PackageCheck,
  Pill,
  Plus,
  QrCode,
  Quote,
  Search,
  ShieldCheck,
  Shirt,
  ShoppingBasket,
  ShoppingCart,
  Star,
  Store,
  Timer,
  TrendingUp,
} from 'lucide-react'
import Logo from '../../components/Logo.jsx'
import { AppleIcon, PlayStoreIcon } from '../../components/BrandIcons.jsx'
import QueueIllustration from './QueueIllustration.jsx'
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

const STORES = [
  { name: 'GreenGrocer Central', description: 'Fresh organic produce, dairy and pantry essentials', rating: 4.8, reviews: '2.4k', readyIn: '20 m', distance: '0.4 km', nextSlot: '14:30', tag: 'Free Pickup', icon: ShoppingBasket, tone: 'green' },
  { name: "Baker's Corner", description: 'Artisan sourdough, pastries and morning coffee', rating: 4.9, reviews: '1.8k', readyIn: '15 m', distance: '1.2 km', nextSlot: '14:15', tag: '₹20 deposit', icon: Croissant, tone: 'orange' },
  { name: 'Urban Mart', description: 'Household supplies, toiletries and general goods', rating: 4.6, reviews: '3k', readyIn: '45 m', distance: '0.8 km', nextSlot: '15:00', tag: 'Free Pickup', icon: Store, tone: 'teal' },
  { name: 'Metro Pharmacy', description: 'Medicines, wellness and personal care', rating: 4.7, reviews: '980', readyIn: '10 m', distance: '0.7 km', nextSlot: '14:10', tag: 'Free Pickup', icon: Pill, tone: 'red' },
  { name: 'Chai & Co.', description: 'Fresh brews, snacks and grab-and-go breakfast', rating: 4.5, reviews: '640', readyIn: '10 m', distance: '0.6 km', nextSlot: '14:05', tag: 'Free Pickup', icon: CupSoda, tone: 'blue' },
]

const STATS = [
  { value: '10k+', label: 'Happy customers' },
  { value: '1,000+', label: 'Partner stores' },
  { value: '15 min', label: 'Saved per trip' },
  { value: '4.8★', label: 'Average rating' },
]

const OLD_WAY = [
  ['Search every aisle for your items', '10 min'],
  ['Find out something is out of stock', '5 min'],
  ['Stand in the billing queue', '15 min'],
  ['Pack your bags at the counter', '5 min'],
]

const NEW_WAY = [
  ['Order from your phone, on the way', '2 min'],
  ['See live stock before you buy', '0 min'],
  ['Shop packs it before you arrive', '0 min'],
  ['Scan your QR and walk out', '1 min'],
]

const STEPS = [
  { title: 'Choose & Shop', text: 'Browse stores nearby and add your daily essentials to the cart.', icon: Store },
  { title: 'Schedule Pickup', text: 'Select a convenient 15-minute time slot for your pickup today or later.', icon: CalendarClock },
  { title: 'Grab & Go', text: 'Show your QR code at the designated counter and collect your packed bags.', icon: QrCode },
]

const FEATURES = [
  { icon: TrendingUp, title: 'Live stock', text: 'Only see what is actually on the shelf right now.' },
  { icon: CalendarClock, title: 'Your time, your slot', text: '15-minute pickup windows that fit around your day.' },
  { icon: Bell, title: 'Ready alerts', text: 'Get notified the moment your order is packed.' },
  { icon: QrCode, title: 'QR hand-over', text: 'Collect in seconds with one quick scan at the counter.' },
  { icon: ShieldCheck, title: 'Secure payments', text: 'Pay by UPI or card, or pay at pickup where available.' },
  { icon: BadgePercent, title: 'No delivery fees', text: 'You collect, so you never pay for delivery or tips.' },
]

const TESTIMONIALS = [
  { name: 'Priya S.', role: 'Daily commuter', initials: 'PS', color: '#f7c59f', text: 'I order my breakfast on the metro and pick it up the second I step out. No queues, ever.' },
  { name: 'Arjun M.', role: 'Working parent', initials: 'AM', color: '#b5d8f7', text: 'Weekly groceries used to take an hour. Now I collect a packed bag on my way home in five minutes.' },
  { name: 'Neha K.', role: 'Student', initials: 'NK', color: '#c8ecd9', text: 'Knowing the stock before I leave home means no more wasted trips. Super easy to use.' },
]

const AVATARS = [
  { initials: 'AK', color: '#f7c59f' },
  { initials: 'PR', color: '#b5d8f7' },
  { initials: 'SM', color: '#c8ecd9' },
]

const CURRENT_YEAR = new Date().getFullYear()

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
          <button type="button" className="navbar__cart" aria-label="Cart">
            <ShoppingCart size={20} />
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
            Skip the aisles and the billing line. Pre-order from your favourite local supermarkets and
            shops, pick a pickup time, and collect your packed bag in seconds.
          </p>

          <form className="hero__search" onSubmit={(e) => e.preventDefault()}>
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
            <QueueIllustration />
          </div>

          <div className="hero__toast">
            <span className="hero__toast-icon">
              <PackageCheck size={18} />
            </span>
            <div>
              <p className="hero__toast-title">Order #FG-8821 is ready</p>
              <p className="hero__toast-text">Pickup counter · Desk 2</p>
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

function StatsStrip() {
  return (
    <section className="stats" aria-label="FastGrab in numbers">
      <div className="container stats__grid">
        {STATS.map((s) => (
          <div key={s.label} className="stats__item">
            <strong>{s.value}</strong>
            <span>{s.label}</span>
          </div>
        ))}
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
    <button type="button" className="store-card">
      <div className={`store-card__media tone-${store.tone}`}>
        <Icon size={56} strokeWidth={1.25} aria-hidden="true" />
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
    </button>
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
          {/* data-keep-action: these arrows scroll the carousel instead of opening Get Started */}
          <div className="stores__arrows" data-keep-action>
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

function Comparison() {
  return (
    <section className="compare">
      <div className="container">
        <p className="eyebrow">Why FastGrab</p>
        <h2 className="section-title section-title--center">Why wait in line?</h2>
        <p className="section-lead">A typical grocery run takes over half an hour. With FastGrab it takes about three minutes.</p>

        <div className="compare__grid">
          <div className="compare__card compare__card--old">
            <div className="compare__head">
              <h3>The usual way</h3>
              <span className="compare__time compare__time--bad">~35 min</span>
            </div>
            <ul>
              {OLD_WAY.map(([text, time]) => (
                <li key={text}>
                  <CircleX size={18} />
                  <span>{text}</span>
                  <small>{time}</small>
                </li>
              ))}
            </ul>
          </div>

          <div className="compare__card compare__card--new">
            <div className="compare__head">
              <h3>
                With <span>FastGrab</span>
              </h3>
              <span className="compare__time compare__time--good">~3 min</span>
            </div>
            <ul>
              {NEW_WAY.map(([text, time]) => (
                <li key={text}>
                  <CircleCheck size={18} />
                  <span>{text}</span>
                  <small>{time}</small>
                </li>
              ))}
            </ul>
            <button type="button" className="btn btn--accent btn--block">
              Start saving time <ArrowRight size={18} />
            </button>
          </div>
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
        <p className="how__subtitle">FastGrab is designed for the modern commute. Order on your way, pick up as you pass.</p>

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

function Features() {
  return (
    <section className="features">
      <div className="container">
        <p className="eyebrow">Made for busy days</p>
        <h2 className="section-title section-title--center">Everything you need for a 3-minute shop</h2>
        <div className="features__grid">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <article key={title} className="feature">
              <span className="feature__icon">
                <Icon size={22} />
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Testimonials() {
  return (
    <section className="testimonials">
      <div className="container">
        <p className="eyebrow">Loved by locals</p>
        <h2 className="section-title section-title--center">People are skipping the queue every day</h2>
        <div className="testimonials__grid">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="quote-card">
              <Quote size={28} className="quote-card__mark" />
              <div className="quote-card__stars" aria-label="5 out of 5 stars">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
                ))}
              </div>
              <blockquote>{t.text}</blockquote>
              <figcaption>
                <span className="avatar" style={{ background: t.color }}>{t.initials}</span>
                <span>
                  <strong>{t.name}</strong>
                  <small>{t.role}</small>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

function BusinessBand() {
  return (
    <section className="business">
      <div className="container">
        <div className="business__inner">
          <div className="business__text">
            <p className="business__eyebrow">For shop owners</p>
            <h2>Turn pre-orders into happy regulars.</h2>
            <p>
              No setup fee and no subscription. Your first ₹50,000 in FastGrab sales every month is
              commission-free.
            </p>
          </div>
          <button type="button" className="btn btn--primary btn--lg">
            Partner with FastGrab <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  )
}

function FinalCta() {
  return (
    <section className="final-cta">
      <div className="container final-cta__inner">
        <Heart size={30} className="final-cta__icon" />
        <h2>Your time matters. Get it back.</h2>
        <p>Join thousands of shoppers who order ahead and grab their essentials on the go.</p>
        <div className="final-cta__actions">
          <Link to="/get-started" className="btn btn--accent btn--lg">
            Create free account <ArrowRight size={18} />
          </Link>
          <Link to="/get-started" className="btn btn--outline btn--lg">
            I already have one
          </Link>
        </div>
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
              <a href="#" aria-label="Website"><Globe size={16} /></a>
              <a href="#" aria-label="Email us"><Mail size={16} /></a>
              <a href="#" aria-label="Chat with us"><MessageCircle size={16} /></a>
            </div>
          </div>

          <div>
            <h4>Company</h4>
            <ul>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Partner with Us</a></li>
              <li><a href="#">Store Login</a></li>
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
                <span><small>Download on the</small>App Store</span>
              </a>
              <a href="#" className="app-btn">
                <PlayStoreIcon size={18} />
                <span><small>Get it on</small>Google Play</span>
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

const INTERACTIVE = 'a, button, input, select, textarea, label, [role="button"]'

function LandingPage() {
  const navigate = useNavigate()

  /**
   * Visitors aren't signed in yet, so any button, link or input on the
   * landing page sends them to Get Started. Exceptions: the logo, which goes
   * home, and anything inside [data-keep-action], such as the carousel arrows.
   */
  const handleClickCapture = (e) => {
    const target = e.target.closest(INTERACTIVE)
    if (!target || target.closest('[data-keep-action]') || target.closest('.logo')) return
    e.preventDefault()
    e.stopPropagation()
    navigate('/get-started')
  }

  return (
    <div className="landing" onClickCapture={handleClickCapture}>
      <Navbar />
      <main>
        <Hero />
        <StatsStrip />
        <Categories />
        <NearbyStores />
        <Comparison />
        <HowItWorks />
        <Features />
        <Testimonials />
        <BusinessBand />
        <FinalCta />
      </main>
      <Footer />
    </div>
  )
}

export default LandingPage

import './App.css'

const steps = [
  { title: 'Discover', text: 'Find nearby registered stores and browse their products.' },
  { title: 'Order ahead', text: 'Add items to your cart and pick a pickup date and time slot.' },
  { title: 'Shop prepares', text: 'The merchant confirms, packs, and marks your order ready.' },
  { title: 'Grab & go', text: 'Show your QR code or order ID at the store and collect.' },
]

function App() {
  return (
    <main className="page">
      <header className="hero">
        <h1>FastGrab</h1>
        <p className="tagline">Order ahead. Grab &amp; go.</p>
        <p className="lead">
          Pre-order from nearby stores and collect at your chosen pickup time,
          skipping the shopping and billing queue.
        </p>
      </header>

      <section className="steps">
        {steps.map((step, i) => (
          <article key={step.title} className="step">
            <span className="step-num">{i + 1}</span>
            <h2>{step.title}</h2>
            <p>{step.text}</p>
          </article>
        ))}
      </section>
    </main>
  )
}

export default App

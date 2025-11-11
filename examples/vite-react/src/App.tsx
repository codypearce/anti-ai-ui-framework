import { useState } from 'react'
import {
  RunawayButton,
  CookieHell,
  FakeDownloadGrid,
  PopupChaos,
  PasswordHell,
  ShiftingInterface,
  SemanticGaslighting,
  MarqueeInputs
} from 'anti-ai-ui'
import './App.css'

function App() {
  const [showCookieHell, setShowCookieHell] = useState(false)
  const [showPopups, setShowPopups] = useState(false)
  const [showShifting, setShowShifting] = useState(false)
  const [message, setMessage] = useState('')

  return (
    <div className="app">
      <header className="header">
        <h1>anti-ai-ui + Vite + React ⚡</h1>
        <p>Lightning-fast automation resistance powered by Vite</p>
        <div className="badges">
          <span className="badge">⚡ Vite</span>
          <span className="badge">⚛️ React 18</span>
          <span className="badge">🤖 Anti-AI</span>
        </div>
      </header>

      <main className="content">
        <section className="card">
          <h2>🏃 Runaway Button</h2>
          <p>Try to catch this button in a Vite app with HMR enabled!</p>
          <div className="demo">
            <RunawayButton
              evasionDistance={150}
              speed={1.5}
              jitter={8}
              onCatch={() => {
                setMessage('✅ Caught it! Fast refresh working!')
                setTimeout(() => setMessage(''), 3000)
              }}
            >
              Catch Me!
            </RunawayButton>
            {message && <div className="alert alert-success">{message}</div>}
          </div>
        </section>

        <section className="card">
          <h2>🍪 Cookie Hell</h2>
          <p>Nested cookie banners with Vite's instant updates.</p>
          <div className="demo">
            <button className="btn" onClick={() => setShowCookieHell(true)}>
              Show Cookie Banner
            </button>
            {showCookieHell && (
              <CookieHell
                depth={3}
                toggleCount={5}
                onAcceptAll={() => {
                  setShowCookieHell(false)
                  setMessage('✅ Cookies accepted (Vite is fast!)')
                  setTimeout(() => setMessage(''), 3000)
                }}
                onRejectAll={() => {
                  setShowCookieHell(false)
                  setMessage('❌ Cookies rejected')
                  setTimeout(() => setMessage(''), 3000)
                }}
                onClose={() => setShowCookieHell(false)}
              />
            )}
            {message && <div className="alert">{message}</div>}
          </div>
        </section>

        <section className="card">
          <h2>📥 Fake Download Grid</h2>
          <p>Only one button is real. Vite builds it instantly.</p>
          <div className="demo">
            <FakeDownloadGrid
              rows={3}
              cols={3}
              onRealClick={() => alert('✅ Real download! (Built by Vite)')}
              onFakeClick={() => alert('❌ Fake! Try again')}
            />
          </div>
        </section>

        <section className="card">
          <h2>🎪 Popup Chaos</h2>
          <p>Multiple popups with Vite's reactive state management.</p>
          <div className="demo">
            <button className="btn" onClick={() => setShowPopups(true)}>
              Trigger Popups
            </button>
            {showPopups && (
              <PopupChaos
                popupCount={4}
                closeOrder={[3, 0, 2, 1]}
                onAllClosed={() => {
                  setShowPopups(false)
                  setMessage('✅ All closed in correct order!')
                  setTimeout(() => setMessage(''), 3000)
                }}
              />
            )}
            {message && <div className="alert alert-success">{message}</div>}
          </div>
        </section>

        <section className="card">
          <h2>🔐 Password Hell</h2>
          <p>Ever-changing requirements with Vite's instant validation.</p>
          <div className="demo">
            <PasswordHell
              requirementChangeInterval={5000}
              onSubmit={(password) => {
                setMessage(`✅ Password accepted: ${password}`)
                setTimeout(() => setMessage(''), 3000)
              }}
            />
            {message && <div className="alert alert-success">{message}</div>}
          </div>
        </section>

        <section className="card">
          <h2>🎭 Semantic Gaslighting</h2>
          <p>Buttons that lie, updated instantly by Vite.</p>
          <div className="demo">
            <SemanticGaslighting
              buttons={[
                { label: 'Submit', actualAction: 'cancel' },
                { label: 'Cancel', actualAction: 'submit' },
                { label: 'Reset', actualAction: 'noop' }
              ]}
              onSubmit={() => {
                setMessage('✅ Submitted (you clicked Cancel)')
                setTimeout(() => setMessage(''), 3000)
              }}
              onCancel={() => {
                setMessage('❌ Cancelled (you clicked Submit)')
                setTimeout(() => setMessage(''), 3000)
              }}
            />
            {message && <div className="alert">{message}</div>}
          </div>
        </section>

        <section className="card">
          <h2>🔀 Shifting Interface</h2>
          <p>Form elements that move around with Vite's HMR.</p>
          <div className="demo">
            <button className="btn" onClick={() => setShowShifting(!showShifting)}>
              {showShifting ? 'Stop Shifting' : 'Start Shifting'}
            </button>
            {showShifting && (
              <div style={{ marginTop: '20px' }}>
                <ShiftingInterface
                  shiftInterval={2000}
                  duplicateChance={0.3}
                  colorChangeInterval={3000}
                />
              </div>
            )}
          </div>
        </section>

        <section className="card">
          <h2>🎪 Marquee Inputs</h2>
          <p>Moving inputs with Vite's blazing-fast animations.</p>
          <div className="demo" style={{ minHeight: '200px' }}>
            <MarqueeInputs
              count={5}
              lanes={2}
              speed={100}
              direction="right"
              placeholder="Type while it moves..."
              onChange={(value) => console.log('Input changed:', value)}
              onSubmit={(value) => {
                setMessage(`✅ Submitted: ${value}`)
                setTimeout(() => setMessage(''), 3000)
              }}
            />
            {message && <div className="alert alert-success" style={{ marginTop: '16px' }}>{message}</div>}
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>
          Built with <strong>Vite</strong> ⚡ + <strong>React</strong> ⚛️ + <strong>anti-ai-ui</strong> 🤖
        </p>
        <p>
          <a href="https://github.com/yourusername/anti-ai-ui" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          {' · '}
          <a href="https://vitejs.dev" target="_blank" rel="noopener noreferrer">
            Vite Docs
          </a>
        </p>
      </footer>
    </div>
  )
}

export default App

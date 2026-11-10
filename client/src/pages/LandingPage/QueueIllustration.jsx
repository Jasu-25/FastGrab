/**
 * Hero illustration: a FastGrab customer collects a ready bag at the pickup
 * counter while other shoppers wait in the billing queue.
 * Pure SVG, so it scales crisply and needs no image file.
 */

const SKIN = ['#f2c7a5', '#c98f62', '#e8b48c', '#8d5a3b', '#f5d3b8']
const INK = '#1f2d29'

/** A simple standing person. (0,0) is the point between their feet. */
function Person({ x, shirt, pants = '#34495e', skin = SKIN[0], hair = INK, mood = 'neutral', arms = 'down', basket = false, flip = false, hairStyle = 'short' }) {
  const mouth =
    mood === 'happy' ? 'M -6 -183 Q 0 -177 6 -183' : mood === 'sad' ? 'M -5 -179 Q 0 -184 5 -179' : 'M -5 -181 L 5 -181'

  return (
    <g transform={`translate(${x} 400) scale(${flip ? -0.92 : 0.92} 0.92)`}>
      <ellipse cx="0" cy="2" rx="34" ry="6" fill="#0a4a38" opacity="0.08" />
      {/* legs + shoes */}
      <rect x="-15" y="-84" width="13" height="84" rx="6" fill={pants} />
      <rect x="2" y="-84" width="13" height="84" rx="6" fill={pants} />
      <ellipse cx="-9" cy="-2" rx="11" ry="5" fill={INK} />
      <ellipse cx="9" cy="-2" rx="11" ry="5" fill={INK} />
      {/* body */}
      <rect x="-27" y="-168" width="54" height="96" rx="24" fill={shirt} />
      {/* arms */}
      {arms === 'down' && (
        <>
          <path d="M -22 -150 Q -32 -118 -28 -90" stroke={shirt} strokeWidth="12" strokeLinecap="round" fill="none" />
          <path d="M 22 -150 Q 32 -118 28 -90" stroke={shirt} strokeWidth="12" strokeLinecap="round" fill="none" />
          <circle cx="-28" cy="-88" r="6" fill={skin} />
          <circle cx="28" cy="-88" r="6" fill={skin} />
        </>
      )}
      {arms === 'reach' && (
        <>
          <path d="M -22 -150 Q -30 -118 -28 -92" stroke={shirt} strokeWidth="12" strokeLinecap="round" fill="none" />
          <circle cx="-28" cy="-90" r="6" fill={skin} />
          <path d="M 22 -150 Q 44 -150 58 -146" stroke={shirt} strokeWidth="12" strokeLinecap="round" fill="none" />
          <circle cx="62" cy="-146" r="6.5" fill={skin} />
        </>
      )}
      {arms === 'watch' && (
        <>
          <path d="M -22 -150 Q -32 -118 -28 -90" stroke={shirt} strokeWidth="12" strokeLinecap="round" fill="none" />
          <circle cx="-28" cy="-88" r="6" fill={skin} />
          <path d="M 22 -150 Q 40 -128 18 -122" stroke={shirt} strokeWidth="12" strokeLinecap="round" fill="none" />
          <rect x="10" y="-128" width="10" height="9" rx="2" fill={INK} />
          <circle cx="8" cy="-122" r="6" fill={skin} />
        </>
      )}
      {basket && (
        <g transform="translate(-30 -92)">
          <path d="M -12 -10 Q 0 -26 12 -10" stroke="#9a6b3f" strokeWidth="3" fill="none" />
          <rect x="-16" y="-10" width="32" height="20" rx="4" fill="#d9a066" />
          <circle cx="-7" cy="-11" r="5" fill="#e04545" />
          <circle cx="4" cy="-12" r="5" fill="#f5a524" />
          <rect x="-2" y="-22" width="6" height="12" rx="2" fill="#3b6fe0" />
        </g>
      )}
      {/* neck + head */}
      <rect x="-6" y="-176" width="12" height="12" fill={skin} />
      <circle cx="0" cy="-192" r="21" fill={skin} />
      {hairStyle === 'long' ? (
        <path d="M -23 -186 Q -26 -216 0 -216 Q 26 -216 23 -186 L 25 -160 Q 18 -170 18 -194 Q 0 -204 -18 -194 Q -18 -170 -25 -160 Z" fill={hair} />
      ) : (
        <path d="M -21 -192 A 21 21 0 0 1 21 -192 Q 12 -203 0 -202 Q -12 -203 -21 -192 Z" fill={hair} />
      )}
      {/* face */}
      <circle cx="-7" cy="-193" r="2.2" fill={INK} />
      <circle cx="7" cy="-193" r="2.2" fill={INK} />
      <path d={mouth} stroke={INK} strokeWidth="2" strokeLinecap="round" fill="none" />
    </g>
  )
}

function QueueIllustration() {
  return (
    <svg
      viewBox="0 0 640 500"
      className="queue-illustration"
      role="img"
      aria-label="A FastGrab customer collects a packed order at the pickup counter while other shoppers wait in a long billing queue."
    >
      <defs>
        <linearGradient id="qi-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f2faf6" />
          <stop offset="1" stopColor="#e3f4ec" />
        </linearGradient>
        <linearGradient id="qi-counter" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0c6b4f" />
          <stop offset="1" stopColor="#0a4a38" />
        </linearGradient>
      </defs>

      {/* room */}
      <rect width="640" height="500" fill="url(#qi-wall)" />
      <rect y="392" width="640" height="108" fill="#d4ece0" />
      <rect y="392" width="640" height="3" fill="#bfe1d0" />

      {/* back shelves */}
      <g transform="translate(14 0)">
        <rect x="292" y="120" width="170" height="170" rx="8" fill="#ffffff" stroke="#d6e6de" />
        {[160, 205, 250].map((y) => (
          <rect key={y} x="292" y={y} width="170" height="5" fill="#d6e6de" />
        ))}
        {[
          ['#f5a524', 302, 132, 18, 28], ['#e04545', 324, 138, 16, 22], ['#3b6fe0', 344, 130, 20, 30], ['#13b886', 368, 136, 18, 24], ['#8b4fe0', 390, 132, 16, 28], ['#f07a1a', 410, 138, 22, 22], ['#22a559', 436, 134, 18, 26],
          ['#3b6fe0', 302, 178, 22, 27], ['#f5a524', 328, 182, 18, 23], ['#13b886', 350, 176, 16, 29], ['#e04545', 370, 180, 20, 25], ['#22a559', 394, 178, 18, 27], ['#f07a1a', 416, 182, 16, 23], ['#8b4fe0', 436, 176, 18, 29],
          ['#13b886', 302, 222, 18, 28], ['#e04545', 324, 226, 20, 24], ['#f07a1a', 348, 220, 16, 30], ['#3b6fe0', 368, 224, 22, 26], ['#f5a524', 394, 222, 18, 28], ['#22a559', 416, 226, 18, 24], ['#e04545', 438, 220, 16, 30],
        ].map(([fill, x, y, w, h], i) => (
          <rect key={i} x={x} y={y} width={w} height={h} rx="3" fill={fill} opacity="0.85" />
        ))}
      </g>

      {/* FastGrab pickup sign */}
      <g>
        <line x1="90" y1="0" x2="90" y2="48" stroke="#9fb8ad" strokeWidth="2" />
        <line x1="210" y1="0" x2="210" y2="48" stroke="#9fb8ad" strokeWidth="2" />
        <rect x="56" y="46" width="188" height="52" rx="12" fill="#0a4a38" />
        <rect x="70" y="58" width="24" height="28" rx="7" fill="#13b886" />
        <path d="M 84 61 L 76 73 L 82 73 L 79 83 L 88 70 L 82 70 Z" fill="#0a4a38" />
        <text x="104" y="71" fill="#ffffff" fontSize="17" fontWeight="800" fontFamily="Manrope, system-ui, sans-serif">FastGrab</text>
        <text x="104" y="88" fill="#3fd9a0" fontSize="11" fontWeight="800" letterSpacing="2" fontFamily="Manrope, system-ui, sans-serif">PICKUP</text>
      </g>

      {/* billing sign */}
      <g>
        <line x1="540" y1="0" x2="540" y2="52" stroke="#c2ccd0" strokeWidth="2" />
        <line x1="610" y1="0" x2="610" y2="52" stroke="#c2ccd0" strokeWidth="2" />
        <rect x="518" y="50" width="114" height="38" rx="10" fill="#e3e8eb" />
        <text x="575" y="75" textAnchor="middle" fill="#6b7a80" fontSize="14" fontWeight="800" letterSpacing="2" fontFamily="Manrope, system-ui, sans-serif">BILLING</text>
      </g>

      {/* staff behind pickup counter */}
      <Person x={92} shirt="#13b886" pants="#0a4a38" skin={SKIN[1]} mood="happy" arms="reach" />
      {/* cashier behind billing counter */}
      <Person x={590} shirt="#94a3b8" pants="#475569" skin={SKIN[2]} hair="#5b3a29" hairStyle="long" mood="neutral" flip />

      {/* pickup counter */}
      <rect x="24" y="286" width="232" height="14" rx="4" fill="#13b886" />
      <rect x="30" y="298" width="220" height="96" rx="6" fill="url(#qi-counter)" />
      <text x="140" y="352" textAnchor="middle" fill="#3fd9a0" fontSize="15" fontWeight="800" fontFamily="Manrope, system-ui, sans-serif">Order ahead.</text>
      <text x="140" y="372" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="700" fontFamily="Manrope, system-ui, sans-serif">Grab &amp; Go</text>

      {/* billing counter + register */}
      <rect x="516" y="244" width="40" height="30" rx="4" fill="#475569" />
      <rect x="520" y="248" width="32" height="20" rx="2" fill="#a5f3d3" />
      <rect x="532" y="274" width="8" height="14" fill="#475569" />
      <rect x="502" y="286" width="138" height="14" rx="4" fill="#cfd8dc" />
      <rect x="508" y="298" width="132" height="96" rx="6" fill="#e3e8eb" />

      {/* packed paper bag on the counter */}
      <g>
        <path d="M 156 236 Q 168 214 180 236" stroke="#8a6a48" strokeWidth="4" fill="none" />
        <rect x="142" y="234" width="52" height="54" rx="5" fill="#c99a6b" />
        <rect x="142" y="234" width="52" height="8" fill="#b88a5c" />
        <rect x="158" y="252" width="20" height="22" rx="5" fill="#0a4a38" />
        <path d="M 170 255 L 164 264 L 168 264 L 166 271 L 173 261 L 169 261 Z" fill="#3fd9a0" />
      </g>

      {/* happy FastGrab customer collecting, with phone QR */}
      <Person x={236} shirt="#3fd9a0" pants="#1e3a5f" skin={SKIN[4]} hair="#6b4226" hairStyle="long" mood="happy" arms="reach" flip />
      <g transform="translate(264 312) rotate(-8)">
        <rect x="-9" y="-16" width="18" height="30" rx="4" fill={INK} />
        <rect x="-6" y="-12" width="12" height="20" rx="2" fill="#ffffff" />
        <rect x="-4" y="-9" width="4" height="4" fill="#0a4a38" />
        <rect x="1" y="-9" width="3" height="3" fill="#0a4a38" />
        <rect x="-4" y="-3" width="3" height="3" fill="#0a4a38" />
        <rect x="0" y="-2" width="4" height="4" fill="#13b886" />
        <rect x="-3" y="3" width="6" height="2" fill="#0a4a38" />
      </g>

      {/* billing queue (facing the billing counter) */}
      <Person x={460} shirt="#e09f6b" pants="#4b5563" skin={SKIN[3]} mood="sad" basket />
      <Person x={392} shirt="#9b87c9" pants="#334155" skin={SKIN[0]} hair="#2d1b12" mood="sad" arms="watch" />
      <Person x={324} shirt="#7c8ea3" pants="#1f2937" skin={SKIN[2]} hair="#111827" hairStyle="long" mood="sad" basket />

      {/* queue floor markers */}
      <line x1="296" y1="430" x2="490" y2="430" stroke="#9fb8ad" strokeWidth="3" strokeDasharray="10 9" strokeLinecap="round" />

      {/* status badges */}
      <g>
        <rect x="128" y="128" width="128" height="36" rx="18" fill="#ffffff" stroke="#a8e6cf" strokeWidth="2" />
        <circle cx="149" cy="146" r="10" fill="#13b886" />
        <path d="M 144 146 L 148 150 L 155 142" stroke="#ffffff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <text x="166" y="151" fill="#0a4a38" fontSize="13" fontWeight="800" fontFamily="Manrope, system-ui, sans-serif">0 min wait</text>
      </g>
      <g>
        <rect x="322" y="72" width="140" height="36" rx="18" fill="#ffffff" stroke="#fca5a5" strokeWidth="2" />
        <circle cx="343" cy="90" r="10" fill="none" stroke="#d93a3a" strokeWidth="2.5" />
        <path d="M 343 84 L 343 90 L 347 93" stroke="#d93a3a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <text x="360" y="95" fill="#d93a3a" fontSize="13" fontWeight="800" fontFamily="Manrope, system-ui, sans-serif">~15 min queue</text>
      </g>

      {/* sparkles near the pickup */}
      <g fill="#13b886">
        <path d="M 270 210 l 3 8 l 8 3 l -8 3 l -3 8 l -3 -8 l -8 -3 l 8 -3 z" />
        <path d="M 120 214 l 2 5 l 5 2 l -5 2 l -2 5 l -2 -5 l -5 -2 l 5 -2 z" opacity="0.7" />
      </g>
    </svg>
  )
}

export default QueueIllustration

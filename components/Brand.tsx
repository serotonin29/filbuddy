export function Brand({ className = "h-9 w-auto" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 212 78"
      role="img"
      aria-label="FilBuddy — FILKOM UPI YPTK Padang"
      className={className}
    >
      <defs>
        <linearGradient id="fb-brand-indigo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6366f1" />
          <stop offset="1" stopColor="#4f46e5" />
        </linearGradient>
        <linearGradient id="fb-brand-mint" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#10b981" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
        <filter id="fb-brand-glow" x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#10b981" floodOpacity="0.18" />
        </filter>
      </defs>

      {/* Logo mark: dua bubble chat (mentoring & barter) + code prompt + centang */}
      <g transform="translate(-18,-10)" filter="url(#fb-brand-glow)">
        {/* Bubble utama (indigo) */}
        <path
          d="M22 28 C22 20.3 28.3 14 36 14 H66 C73.7 14 80 20.3 80 28 V52 C80 59.7 73.7 66 66 66 H44 L30 76 V66 H36 C28.3 66 22 59.7 22 52 Z"
          fill="url(#fb-brand-indigo)"
        />
        {/* Ikon terminal/code prompt */}
        <path
          d="M36 36 L43 42 L36 48"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <line x1="47" y1="48" x2="56" y2="48" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />

        {/* Bubble kedua (emerald) — pertukaran skill */}
        <path
          d="M48 48 C48 42.5 52.5 38 58 38 H82 C87.5 38 92 42.5 92 48 V68 C92 73.5 87.5 78 82 78 H78 V86 L68 78 H58 C52.5 78 48 73.5 48 68 Z"
          fill="url(#fb-brand-mint)"
          stroke="#ffffff"
          strokeWidth="3"
        />
        {/* Centang kolaborasi */}
        <path
          d="M64 58 L68 62 L76 54"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>

      {/* Wordmark */}
      <text
        x="82"
        y="42"
        style={{ fontFamily: "var(--font-jakarta), 'Plus Jakarta Sans', sans-serif" }}
        fontSize="30"
        fontWeight="800"
        letterSpacing="-0.5"
      >
        <tspan fill="#0f172a">Fil</tspan>
        <tspan fill="#4f46e5">Buddy</tspan>
      </text>

      {/* Subtitle kampus */}
      <text
        x="84"
        y="58"
        style={{ fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace" }}
        fontSize="9.5"
        fontWeight="600"
        letterSpacing="1.8"
        fill="#94a3b8"
      >
        FILKOM UPI YPTK
      </text>
    </svg>
  );
}

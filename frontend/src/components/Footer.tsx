import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

const credits = [
  { role: 'AI, Frontend & Backend Development', name: 'Ranjith Kumar',      highlight: false },
  { role: 'UI/UX Design',                       name: 'Soundharrajan',      highlight: false },
  { role: 'Project Contributor',                name: 'Venkatesh',          highlight: false },
  { role: 'Faculty Mentor & Guide',             name: 'Mrs. V. Vaidehi',    highlight: true  },
];

const features = [
  { emoji: '🍔', label: 'Food', glowColor: 'rgba(245, 158, 11, 0.35)', hoverBg: 'rgba(245, 158, 11, 0.08)', hoverBorder: 'rgba(245, 158, 11, 0.22)' },
  { emoji: '🥤', label: 'Drinks', glowColor: 'rgba(56, 189, 248, 0.35)', hoverBg: 'rgba(56, 189, 248, 0.08)', hoverBorder: 'rgba(56, 189, 248, 0.22)' },
  { emoji: '🎵', label: 'Music', glowColor: 'rgba(232, 121, 249, 0.35)', hoverBg: 'rgba(232, 121, 249, 0.08)', hoverBorder: 'rgba(232, 121, 249, 0.22)' },
  { emoji: '😊', label: 'Mood', glowColor: 'rgba(52, 211, 153, 0.35)', hoverBg: 'rgba(52, 211, 153, 0.08)', hoverBorder: 'rgba(52, 211, 153, 0.22)' },
];

const Footer = () => (
  <footer className="relative z-10 mt-auto border-t border-white/[0.04]">

    {/* Ultra-fine top edge glow line */}
    <div className="absolute top-0 inset-x-0 h-px
                    bg-gradient-to-r from-transparent via-violet-500/25 to-transparent" />
    <div className="absolute top-0 inset-x-0 h-[2px] blur-[2px]
                    bg-gradient-to-r from-transparent via-cyan-500/15 to-transparent" />

    {/* Subtle ambient light backdrops */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-45">
      <div className="absolute -bottom-24 left-1/4 w-[350px] h-[150px] rounded-full bg-violet-600/10 blur-[80px]" />
      <div className="absolute -bottom-24 right-1/4 w-[350px] h-[150px] rounded-full bg-cyan-600/10 blur-[80px]" />
    </div>

    <div className="relative bg-[#050408]/90 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8 sm:py-10">

        {/* ── TWO-COLUMN GRID ── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-8 sm:gap-6">

          {/* ── LEFT — Brand ── */}
          <div className="flex flex-col gap-2.5">

            {/* Logo Group */}
            <div className="flex items-center gap-2">
              <Link
                to="/"
                aria-label="Mealody AI"
                className="group relative inline-flex items-center gap-3 select-none"
              >
                <img src="/logo.png" alt="Mealody AI Logo" className="h-9 w-9 rounded-xl object-cover shadow-md border border-white/10 group-hover:scale-105 transition-transform" />
                <span
                  className="text-xl font-heading font-black tracking-tight leading-none"
                  style={{
                    background: 'linear-gradient(135deg, #c084fc 0%, #f472b6 50%, #38bdf8 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    filter: 'drop-shadow(0 0 10px rgba(192,132,252,0.25))',
                    transition: 'filter 0.3s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.filter = 'drop-shadow(0 0 16px rgba(192,132,252,0.55))')}
                  onMouseLeave={e => (e.currentTarget.style.filter = 'drop-shadow(0 0 10px rgba(192,132,252,0.25))')}
                >
                  Mealody AI
                </span>
                <span className="flex h-1.5 w-1.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-violet-500"></span>
                </span>
              </Link>
            </div>

            {/* Tagline */}
            <p
              className="text-[10px] font-bold tracking-[0.22em] uppercase leading-relaxed text-slate-400/60 cursor-default select-none transition-colors duration-300"
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(148,163,184,0.6)')}
            >
              Your Mood.&ensp;Your Meal.&ensp;Your Melody.
            </p>

            {/* Feature chips */}
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {features.map((f) => (
                <div
                  key={f.label}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.015] border border-white/[0.03] transition-all duration-300 cursor-default select-none"
                  style={{
                    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.02)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = f.hoverBg;
                    e.currentTarget.style.borderColor = f.hoverBorder;
                    e.currentTarget.style.boxShadow = `0 0 12px ${f.glowColor}, inset 0 1px 1px rgba(255,255,255,0.04)`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.015)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.03)';
                    e.currentTarget.style.boxShadow = 'inset 0 1px 1px rgba(255,255,255,0.02)';
                  }}
                >
                  <span className="text-xs filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">{f.emoji}</span>
                  <span className="text-[10px] font-semibold tracking-wider text-slate-400/80 uppercase">
                    {f.label}
                  </span>
                </div>
              ))}
            </div>

          </div>

          {/* ── RIGHT — Credits ── */}
          <div className="flex flex-col gap-4 sm:items-end sm:text-right">
            {credits.map((c) => (
              <div
                key={c.name}
                className="group flex flex-col gap-1"
              >
                {/* Role label */}
                <span
                  className="text-[9px] font-extrabold uppercase tracking-[0.22em] leading-none transition-colors duration-300"
                  style={{
                    color: c.highlight ? 'rgba(244, 114, 182, 0.55)' : 'rgba(148, 163, 184, 0.35)'
                  }}
                >
                  {c.role}
                </span>

                {/* Name */}
                <span
                  className="text-[12.5px] font-semibold leading-none transition-all duration-300 cursor-default select-none"
                  style={{
                    color: c.highlight
                      ? 'rgba(244,114,182,0.80)'
                      : 'rgba(203,213,225,0.70)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = c.highlight
                      ? 'rgba(244,114,182,1)'
                      : '#ffffff';
                    e.currentTarget.style.textShadow = c.highlight
                      ? '0 0 16px rgba(244,114,182,0.45)'
                      : '0 0 14px rgba(192,132,252,0.40)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = c.highlight
                      ? 'rgba(244,114,182,0.80)'
                      : 'rgba(203,213,225,0.70)';
                    e.currentTarget.style.textShadow = 'none';
                  }}
                >
                  {c.name}
                </span>
              </div>
            ))}
          </div>

        </div>

        {/* ── DIVIDER — premium gradient rule ── */}
        <div className="mt-8 relative flex items-center justify-center">
          <div
            className="h-[1px] w-full"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 15%, rgba(167,139,250,0.18) 50%, rgba(255,255,255,0.06) 85%, transparent 100%)',
            }}
          />
          {/* Subtle jewel reflection at center */}
          <div
            className="absolute left-1/2 -translate-x-1/2 w-8 h-[2px] rounded-full blur-[1px] bg-gradient-to-r from-violet-400 to-cyan-400 opacity-60"
            style={{
              boxShadow: '0 0 8px rgba(167,139,250,0.6)',
            }}
          />
        </div>

        {/* ── BOTTOM ROW — copyright ── */}
        <div
          className="pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <p
            className="text-[11px] tracking-wider text-slate-400/40 select-none cursor-default"
          >
            &copy;&nbsp;2026&nbsp;
            <span
              className="font-bold tracking-tight hover:opacity-100 transition-opacity duration-300"
              style={{
                background: 'linear-gradient(90deg,#a78bfa,#38bdf8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                opacity: 0.85,
              }}
            >
              Mealody AI
            </span>
            &nbsp;&mdash;&nbsp;All rights reserved
          </p>

          <p
            className="text-[11px] flex items-center gap-1.5 text-slate-400/30 select-none cursor-default"
          >
            Built with
            <Heart className="w-2.5 h-2.5 fill-pink-500/60 text-pink-500/60 animate-pulse" />
            for food lovers &amp; music souls
          </p>
        </div>

      </div>
    </div>

    {/* Bottom edge glow */}
    <div className="absolute bottom-0 inset-x-0 h-px
                    bg-gradient-to-r from-transparent via-violet-500/10 to-transparent" />
  </footer>
);

export default Footer;

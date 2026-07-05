'use client';

import { useState, useEffect, useRef } from 'react';

const THEMES = {
  black: { name:'Black', background:'#0b0b0b', ink:'#f0ebe3', dimmed:'#a09888', accent:'#c9a86c', dot:'#1a1a1a', dotRing:'rgba(255,255,255,0.2)', glass:false },
  red: { name:'Red', background:'#1a0a0a', ink:'#f0e0e0', dimmed:'#b08070', accent:'#c04040', dot:'#b03030', dotRing:'rgba(255,200,200,0.2)', glass:false },
  orange: { name:'Orange', background:'#1a1208', ink:'#f0e8d8', dimmed:'#b09060', accent:'#d08030', dot:'#c07020', dotRing:'rgba(255,200,120,0.2)', glass:false },
  white: { name:'White Minimal', background:'#f5f0ea', ink:'#1a1a1a', dimmed:'#6a6a6a', accent:'#1a1a1a', dot:'#f5f0ea', dotRing:'rgba(0,0,0,0.25)', glass:false },
  glass: { name:'Glass', background:'#0a0a0a', ink:'#f0f0f0', dimmed:'#b0b0b0', accent:'#d0d0d0', dot:'rgba(255,255,255,0.35)', dotRing:'rgba(255,255,255,0.15)', glass:true },
  dune: { name:'Dune', background:'#1a1610', ink:'#f0e8d0', dimmed:'#b09870', accent:'#d0a060', dot:'#b89860', dotRing:'rgba(200,160,100,0.25)', glass:true },
};

const HOLD_DURATION = 7000; // 7 seconds, per owner's spec

export default function Navbar({ siteName, theme, setTheme, logoVersion = 0, onHoldComplete }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [fillPercent, setFillPercent] = useState(0);
  const holdingRef = useRef(false);
  const animRef = useRef(null);
  const startTimeRef = useRef(0);
  const current = THEMES[theme];

  useEffect(() => {
    const t = THEMES[theme];
    document.body.style.background = t.background;
    document.body.style.color = t.ink;
    document.documentElement.style.setProperty('--accent', t.accent);
    document.documentElement.style.setProperty('--dimmed', t.dimmed);
    document.documentElement.style.setProperty('--ink', t.ink);
    document.documentElement.style.setProperty('--background', t.background);
  }, [theme]);

  const stopHold = () => {
    holdingRef.current = false;
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setFillPercent(0);
  };

  const startHold = (e) => {
    e.preventDefault();
    if (holdingRef.current) return;
    holdingRef.current = true;
    startTimeRef.current = Date.now();

    const tick = () => {
      if (!holdingRef.current) return;
      const elapsed = Date.now() - startTimeRef.current;
      const p = Math.min(elapsed / HOLD_DURATION, 1);
      setFillPercent(p * 100);
      if (p >= 1) {
        stopHold();
        onHoldComplete();
        return;
      }
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
  };

  return (
    <nav className={`navbar ${current.glass ? 'navbar-glass' : ''}`}>
      <div className="nav-left">
        <div className="nav-logo-chip">
          <img
            src={`/logo.png?v=${logoVersion}`}
            alt={siteName}
            onError={(e) => {
              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%230b0b0b' rx='20'/%3E%3Ctext x='22' y='72' font-family='Georgia,serif' font-size='60' font-style='italic' fill='white' font-weight='bold'%3EV%3C/text%3E%3Ctext x='48' y='72' font-family='Georgia,serif' font-size='50' fill='white' font-weight='bold'%3Eyu%3C/text%3E%3Ccircle cx='44' cy='44' r='10' fill='%230b0b0b'/%3E%3Ccircle cx='48' cy='44' r='8' fill='white'/%3E%3Cpolygon points='20,70 38,50 50,65 62,45 80,70' fill='%230b0b0b'/%3E%3Cpath d='M30 78 Q40 73 50 78 Q60 83 70 78' stroke='white' stroke-width='2' fill='none'/%3E%3Cpath d='M30 86 Q40 81 50 86 Q60 91 70 86' stroke='white' stroke-width='2' fill='none' opacity='0.5'/%3E%3C/svg%3E";
            }}
          />
        </div>

        <div
          className="wordmark-hold-wrap"
          onMouseDown={startHold}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
          onTouchStart={startHold}
          onTouchEnd={stopHold}
          onTouchCancel={stopHold}
          title="Hold for 7 seconds to open the editor"
        >
          <span className="nav-wordmark" style={{ transform: fillPercent > 0 ? 'scale(1.02)' : 'scale(1)' }}>
            {siteName || 'vyu.frames'}
          </span>
          <div className="wordmark-progress-track">
            <div className="wordmark-progress-fill" style={{ width: `${fillPercent}%` }} />
          </div>
        </div>
      </div>

      <div className="nav-right" style={{ position: 'relative' }}>
        <button className="theme-toggle-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
          <span className="theme-dot" style={{ background: current.dot, borderColor: current.dotRing }}></span>
          <span>{current.name}</span>
          <span style={{ marginLeft: '4px', fontSize: '0.7rem' }}>▾</span>
        </button>
        <div className={`theme-dropdown ${dropdownOpen ? 'open' : ''}`}>
          {Object.keys(THEMES).map((key) => {
            const t = THEMES[key];
            return (
              <button key={key} className="theme-option" onClick={() => { setTheme(key); setDropdownOpen(false); localStorage.setItem('vyu-theme', key); }}>
                <span className="dot-swatch" style={{ background: t.dot, borderColor: t.dotRing }}></span>
                {t.name}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

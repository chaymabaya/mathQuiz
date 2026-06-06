import { useEffect, useState, useRef } from 'react';

const COLORS = ['#1a73e8','#ff6d00','#1e8e3e','#9c27b0','#f44336','#ffeb3b','#00bcd4','#e91e63','#4caf50','#ff9800'];
const rand = (a, b) => a + Math.random() * (b - a);

const PARTICLES = Array.from({ length: 100 }, (_, i) => ({
  id: i,
  x:        rand(0, 100),
  color:    COLORS[i % COLORS.length],
  size:     rand(7, 15),
  delay:    rand(0, 0.7),
  duration: rand(1.4, 2.6),
  swing:    rand(-60, 60),
  isRect:   i % 3 !== 0,
}));

export default function Confetti({ trigger }) {
  const [active, setActive] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!trigger) return;
    setActive(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setActive(false), 3000);
    return () => clearTimeout(timerRef.current);
  }, [trigger]);

  if (!active) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999, overflow: 'hidden' }}>
      {PARTICLES.map(p => (
        <div
          key={p.id}
          className="confetti-particle"
          style={{
            left:              `${p.x}%`,
            width:             p.isRect ? p.size * 0.55 : p.size,
            height:            p.isRect ? p.size * 1.8  : p.size,
            background:        p.color,
            borderRadius:      p.isRect ? '3px' : '50%',
            animationDuration: `${p.duration}s`,
            animationDelay:    `${p.delay}s`,
            '--swing':         `${p.swing}px`,
          }}
        />
      ))}
    </div>
  );
}

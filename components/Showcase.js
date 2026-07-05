'use client';

import { useState } from 'react';

const STACK_SIZE = 4;

function pad(n) {
  return String(n).padStart(2, '0');
}

export default function Showcase({ images = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const hasImages = images.length > 0;
  const total = images.length;
  const current = hasImages ? images[activeIndex % total] : null;

  const stackImages = [];
  if (hasImages) {
    const count = Math.min(STACK_SIZE, total - 1);
    for (let i = 1; i <= count; i++) {
      stackImages.push(images[(activeIndex + i) % total]);
    }
  }

  const goTo = (index) => setActiveIndex(((index % total) + total) % total);
  const goNext = () => hasImages && goTo(activeIndex + 1);
  const goPrev = () => hasImages && goTo(activeIndex - 1);

  const heroStyle = current
    ? { backgroundImage: `url(/images/${current.filename})` }
    : { background: 'linear-gradient(135deg, #1a1a1a, #0b0b0b)' };

  return (
    <div className="showcase-wrap">
      <div className="showcase-hero" style={heroStyle}>
        {!hasImages && (
          <div className="showcase-empty-note">No photos yet — hold the site name above to open the editor and add your first one.</div>
        )}

        <div className="showcase-text">
          {current?.location && <div className="showcase-eyebrow">{current.location}</div>}
          <h1 className="showcase-title">{current?.title || (hasImages ? 'Untitled' : 'vyu.frames')}</h1>
          {current?.description && <p className="showcase-desc">{current.description}</p>}
        </div>

        {stackImages.length > 0 && (
          <div className="showcase-stack">
            {stackImages.map((img) => (
              <div
                key={img.id}
                className="stack-card"
                style={{ backgroundImage: `url(/images/${img.filename})` }}
                onClick={() => goTo(images.indexOf(img))}
              >
                <div className="stack-card-label">
                  {img.location && <span className="stack-eyebrow">{img.location}</span>}
                  {img.title}
                </div>
              </div>
            ))}
          </div>
        )}

        {hasImages && (
          <>
            <div className="showcase-controls">
              <button className="showcase-arrow-btn" onClick={goPrev} aria-label="Previous">‹</button>
              <button className="showcase-arrow-btn" onClick={goNext} aria-label="Next">›</button>
              <div className="showcase-progress-track">
                <div className="showcase-progress-fill" style={{ width: `${((activeIndex % total) + 1) / total * 100}%` }} />
              </div>
            </div>
            <div className="showcase-counter">{pad((activeIndex % total) + 1)} / {pad(total)}</div>
          </>
        )}
      </div>
    </div>
  );
}

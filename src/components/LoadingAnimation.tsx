import { useEffect, useState } from 'react';

const FACTS = [
  'The world has 195 countries waiting to be explored…',
  'There are over 10,000 UNESCO World Heritage Sites…',
  'The Great Wall of China stretches over 13,000 miles…',
  'Over 1.4 billion tourists travel internationally each year…',
  'Crafting your perfect day-by-day adventure…',
  'Researching the best local experiences for you…',
  'Optimising your budget for maximum adventure…',
  'Finding hidden gems and must-see spots…',
];

export default function LoadingAnimation() {
  const [factIndex, setFactIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const factTimer = setInterval(() => {
      setFactIndex((i) => (i + 1) % FACTS.length);
    }, 2800);

    const progressTimer = setInterval(() => {
      setProgress((p) => Math.min(p + 1.5, 92));
    }, 200);

    return () => {
      clearInterval(factTimer);
      clearInterval(progressTimer);
    };
  }, []);

  return (
    <div className="loading-container fade-up">
      <div className="loading-card">
        {/* Animated plane */}
        <div className="plane-track">
          <div className="moving-plane">✈️</div>
          <div className="track-clouds">
            <span>☁️</span>
            <span>☁️</span>
            <span>☁️</span>
          </div>
        </div>

        <h2>Creating Your Adventure</h2>

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <p className="loading-fact" key={factIndex}>
          {FACTS[factIndex]}
        </p>

        <div className="loading-dots">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}

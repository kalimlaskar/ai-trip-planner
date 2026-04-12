import { DayItinerary } from '../types';

const DAY_COLORS = [
  '#1565c0',
  '#2e7d32',
  '#6a1b9a',
  '#c62828',
  '#00838f',
  '#e65100',
  '#1b5e20',
  '#4527a0',
  '#880e4f',
  '#bf360c',
];

interface Props {
  day: DayItinerary;
}

export default function DayCard({ day }: Props) {
  const color = DAY_COLORS[(day.day - 1) % DAY_COLORS.length];

  return (
    <div className="day-card" style={{ '--day-color': color } as React.CSSProperties}>
      <div className="day-header" style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
        <div className="day-number">Day {day.day}</div>
        <div className="day-title">{day.title}</div>
        <div className="day-cost">💰 {day.estimatedCost}</div>
      </div>

      <div className="day-body">
        <div className="time-slot">
          <div className="time-label">🌅 Morning</div>
          <p>{day.morning}</p>
        </div>

        <div className="time-slot">
          <div className="time-label">☀️ Afternoon</div>
          <p>{day.afternoon}</p>
        </div>

        <div className="time-slot">
          <div className="time-label">🌙 Evening</div>
          <p>{day.evening}</p>
        </div>

        <div className="highlight-box">
          <span className="badge-icon">⭐</span>
          <span>{day.highlight}</span>
        </div>

        <div className="tip-box">
          <span className="badge-icon">💡</span>
          <span>{day.tips}</span>
        </div>
      </div>
    </div>
  );
}

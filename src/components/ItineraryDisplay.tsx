import { ItineraryData } from '../types';
import DayCard from './DayCard';

interface Props {
  itinerary: ItineraryData;
}

export default function ItineraryDisplay({ itinerary }: Props) {
  return (
    <div className="itinerary-container">
      {/* ─── Overview Banner ─── */}
      <div className="itinerary-header">
        <h2>🗺️ {itinerary.destination}</h2>
        <p className="overview-text">{itinerary.overview}</p>
        <div className="trip-meta">
          <div className="meta-item">
            <span>📅</span>
            <span>{itinerary.days.length} Days</span>
          </div>
          <div className="meta-item">
            <span>💰</span>
            <span>{itinerary.totalBudget}</span>
          </div>
          <div className="meta-item">
            <span>🌤️</span>
            <span>{itinerary.bestTimeToVisit}</span>
          </div>
          <div className="meta-item">
            <span>{itinerary.currency.includes('INR') ? '🇮🇳' : '💱'}</span>
            <span>{itinerary.currency}</span>
          </div>
        </div>
      </div>

      {/* ─── Day Cards ─── */}
      <div className="days-grid">
        {itinerary.days.map((day) => (
          <DayCard key={day.day} day={day} />
        ))}
      </div>

      {/* ─── Budget + Tips ─── */}
      <div className="extras-grid">
        {/* Budget Breakdown */}
        <div className="info-card">
          <h3>💰 Budget Breakdown</h3>
          <div className="budget-items">
            {[
              { icon: '🏨', label: 'Accommodation', value: itinerary.budgetBreakdown.accommodation },
              { icon: '🍽️', label: 'Food & Dining', value: itinerary.budgetBreakdown.food },
              { icon: '🎭', label: 'Activities', value: itinerary.budgetBreakdown.activities },
              { icon: '🚗', label: 'Transportation', value: itinerary.budgetBreakdown.transportation },
            ].map(({ icon, label, value }) => (
              <div key={label} className="budget-item">
                <span className="budget-icon">{icon}</span>
                <div>
                  <div className="budget-label">{label}</div>
                  <div className="budget-value">{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Essential Tips */}
        <div className="info-card">
          <h3>🎯 Essential Travel Tips</h3>
          <ul className="tips-list">
            {itinerary.essentialTips.map((tip, i) => (
              <li key={i} className="tip-item">
                <span className="tip-number">{i + 1}</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

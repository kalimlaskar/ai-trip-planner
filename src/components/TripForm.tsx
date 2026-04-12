import { useState } from 'react';

interface TripFormProps {
  onSubmit: (destination: string, days: number, budget: string) => void;
}

const POPULAR: string[] = [
  'Paris, France',
  'Tokyo, Japan',
  'Bali, Indonesia',
  'New York, USA',
  'Barcelona, Spain',
  'Rome, Italy',
  'Santorini, Greece',
  'Dubai, UAE',
];

export default function TripForm({ onSubmit }: TripFormProps) {
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState(7);
  const [budget, setBudget] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim() || !budget.trim()) return;
    onSubmit(destination.trim(), days, budget.trim());
  };

  return (
    <div className="form-container fade-up">
      <div className="form-card">
        <div className="form-header">
          <span className="form-emoji">🗺️</span>
          <h2>Plan Your Dream Trip</h2>
          <p>Enter your details and let AI craft the perfect itinerary</p>
        </div>

        <form onSubmit={handleSubmit} className="trip-form">
          {/* Destination */}
          <div className="form-group">
            <label htmlFor="destination">
              <span className="label-icon">📍</span> Destination
            </label>
            <input
              id="destination"
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g., Paris, France"
              required
            />
            <div className="suggestions">
              {POPULAR.map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`suggestion-chip${destination === d ? ' active' : ''}`}
                  onClick={() => setDestination(d)}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Days + Budget */}
          <div className="form-row">
            <div className="form-group">
              <label>
                <span className="label-icon">📅</span> Duration
              </label>
              <div className="days-input">
                <button
                  type="button"
                  className="days-btn"
                  onClick={() => setDays((d) => Math.max(1, d - 1))}
                  aria-label="Decrease days"
                >
                  −
                </button>
                <span className="days-value">
                  {days} {days === 1 ? 'day' : 'days'}
                </span>
                <button
                  type="button"
                  className="days-btn"
                  onClick={() => setDays((d) => Math.min(30, d + 1))}
                  aria-label="Increase days"
                >
                  +
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="budget">
                <span className="label-icon">💰</span> Budget
              </label>
              <input
                id="budget"
                type="text"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g., $2000 or budget"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-large">
            <span>✈️</span> Generate My Itinerary
          </button>
        </form>
      </div>
    </div>
  );
}

import { useState } from 'react';
import TripForm from './components/TripForm';
import LoadingAnimation from './components/LoadingAnimation';
import ItineraryDisplay from './components/ItineraryDisplay';
import { ItineraryData } from './types';

type AppState = 'idle' | 'loading' | 'success' | 'error';

export default function App() {
  const [state, setState] = useState<AppState>('idle');
  const [itinerary, setItinerary] = useState<ItineraryData | null>(null);
  const [error, setError] = useState<string>('');

  const generateItinerary = async (destination: string, days: number, budget: string) => {
    setState('loading');
    setError('');
    setItinerary(null);

    try {
      const response = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination, days, budget }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: 'Server error' }));
        throw new Error(errData.error || 'Failed to generate itinerary');
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let lineBuffer = '';
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        lineBuffer += decoder.decode(value, { stream: true });
        const lines = lineBuffer.split('\n');
        lineBuffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') {
            // Strip possible markdown code fences before parsing
            const cleaned = fullText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
            const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('Could not extract JSON from response. Please try again.');
            const parsed: ItineraryData = JSON.parse(jsonMatch[0]);
            setItinerary(parsed);
            setState('success');
            return;
          }
          try {
            const chunk = JSON.parse(data);
            if (chunk.error) throw new Error(chunk.error);
            if (chunk.text) fullText += chunk.text;
          } catch {
            // skip malformed SSE chunks (partial JSON strings are expected)
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setState('error');
    }
  };

  const handleReset = () => {
    setState('idle');
    setItinerary(null);
    setError('');
  };

  return (
    <div className="app">
      {/* ─── Hero ─── */}
      <header className="hero">
        <div className="hero-clouds">
          <span className="cloud cloud-1">☁️</span>
          <span className="cloud cloud-2">☁️</span>
          <span className="cloud cloud-3">☁️</span>
        </div>
        <div className="hero-content">
          <div className="hero-icon">✈️</div>
          <h1>Trip Planner AI</h1>
          <p className="hero-sub">Powered by Gemini — your intelligent travel companion</p>
        </div>
      </header>

      {/* ─── Main ─── */}
      <main className="main-content">
        {state === 'idle' && <TripForm onSubmit={generateItinerary} />}

        {state === 'loading' && <LoadingAnimation />}

        {state === 'error' && (
          <div className="error-card fade-up">
            <div className="error-icon">⚠️</div>
            <h2>Something went wrong</h2>
            <p>{error}</p>
            <button onClick={handleReset} className="btn btn-primary">
              Try Again
            </button>
          </div>
        )}

        {state === 'success' && itinerary && (
          <div className="fade-up">
            <ItineraryDisplay itinerary={itinerary} />
            <div className="reset-section">
              <button onClick={handleReset} className="btn btn-secondary btn-large">
                ✈️ Plan Another Trip
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ─── Footer ─── */}
      <footer className="footer">
        <p>✈️ Trip Planner AI &nbsp;·&nbsp; Powered by WanderGateway</p>
      </footer>
    </div>
  );
}

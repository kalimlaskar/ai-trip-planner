import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

// ─── Currency detection ───────────────────────────────────────────────────────
const INDIA_KEYWORDS = [
  'india', 'mumbai', 'delhi', 'new delhi', 'bangalore', 'bengaluru', 'chennai',
  'kolkata', 'calcutta', 'hyderabad', 'pune', 'ahmedabad', 'jaipur', 'surat',
  'lucknow', 'kanpur', 'nagpur', 'indore', 'thane', 'bhopal', 'visakhapatnam',
  'vizag', 'patna', 'vadodara', 'ghaziabad', 'ludhiana', 'agra', 'nashik',
  'goa', 'kochi', 'cochin', 'trivandrum', 'thiruvananthapuram', 'coimbatore',
  'madurai', 'varanasi', 'banaras', 'amritsar', 'allahabad', 'prayagraj',
  'ranchi', 'howrah', 'jabalpur', 'guwahati', 'chandigarh', 'mysore', 'mysuru',
  'jodhpur', 'udaipur', 'shimla', 'manali', 'darjeeling', 'rishikesh',
  'haridwar', 'dehradun', 'leh', 'ladakh', 'kashmir', 'srinagar', 'jammu',
];

function getCurrency(destination) {
  const lower = destination.toLowerCase();
  const isIndia = INDIA_KEYWORDS.some((kw) => lower.includes(kw));
  return isIndia
    ? { code: 'INR', symbol: '₹', label: 'Indian Rupee (INR)' }
    : { code: 'USD', symbol: '$', label: 'US Dollar (USD)' };
}

// ─── Model detection (cached per warm instance) ───────────────────────────────
const PREFERRED_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-2.0-flash-001',
  'gemini-2.0-flash-lite',
  'gemini-flash-latest',
];

let activeModel = '';

async function detectModel() {
  if (activeModel) return;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
    );
    const data = await res.json();
    const available = (data.models || [])
      .filter((m) => m.supportedGenerationMethods?.includes('generateContent'))
      .map((m) => m.name.replace('models/', ''));

    for (const preferred of PREFERRED_MODELS) {
      if (available.includes(preferred)) {
        activeModel = preferred;
        break;
      }
    }
    if (!activeModel && available.length > 0) {
      activeModel = available[0];
    }
  } catch {
    activeModel = 'gemini-2.5-flash';
  }
}

// ─── Vercel serverless handler ────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { destination, days, budget } = req.body;

  if (!destination || !days || !budget) {
    return res.status(400).json({ error: 'Missing required fields: destination, days, budget' });
  }

  if (!API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
  }

  await detectModel();

  if (!activeModel) {
    return res.status(500).json({ error: 'No available Gemini model found for this API key.' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const currency = getCurrency(destination);

  const prompt = `You are an expert travel planner. Create a detailed day-by-day travel itinerary.
Return ONLY a valid JSON object — no markdown code blocks, no backticks, no extra text before or after.

Trip Details:
- Destination: ${destination}
- Duration: ${days} days
- Total Budget: ${budget}
- Currency to use for ALL prices: ${currency.label} (symbol: ${currency.symbol})

IMPORTANT: Every price, cost estimate, and budget figure MUST be expressed in ${currency.code} using the ${currency.symbol} symbol. Do not use any other currency.

Return exactly this JSON structure:
{
  "destination": "${destination}",
  "overview": "2-3 sentence overview of why this destination is amazing",
  "totalBudget": "${budget}",
  "currency": "${currency.label}",
  "bestTimeToVisit": "Best season/months to visit",
  "days": [
    {
      "day": 1,
      "title": "Catchy day theme title",
      "morning": "Detailed morning activity description with specific places",
      "afternoon": "Detailed afternoon activity with specific attractions",
      "evening": "Detailed evening plan including dinner recommendations",
      "estimatedCost": "Estimated cost for the day in ${currency.code} (e.g. ${currency.symbol}80-120 or ${currency.symbol}6500-10000)",
      "highlight": "The single most memorable thing about this day",
      "tips": "One practical tip that will enhance this day"
    }
  ],
  "budgetBreakdown": {
    "accommodation": "Price range per night",
    "food": "Estimated per day (budget to mid-range)",
    "activities": "Estimated total for all activities",
    "transportation": "Getting around cost estimate"
  },
  "essentialTips": [
    "Tip about local customs or etiquette",
    "Tip about safety",
    "Tip about transportation",
    "Tip about food/dining",
    "Tip about money/payments"
  ]
}

Generate exactly ${days} objects in the days array (day 1 through day ${days}).
IMPORTANT: Return ONLY the JSON — no markdown, no explanation, no code fences.`;

  try {
    const model = genAI.getGenerativeModel({ model: activeModel });
    const result = await model.generateContentStream(prompt);

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('Gemini API error:', err);
    const message = err instanceof Error ? err.message : 'Failed to generate itinerary';
    res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
    res.end();
  }
}

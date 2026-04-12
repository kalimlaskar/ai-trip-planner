export interface DayItinerary {
  day: number;
  title: string;
  morning: string;
  afternoon: string;
  evening: string;
  estimatedCost: string;
  highlight: string;
  tips: string;
}

export interface BudgetBreakdown {
  accommodation: string;
  food: string;
  activities: string;
  transportation: string;
}

export interface ItineraryData {
  destination: string;
  overview: string;
  totalBudget: string;
  currency: string;
  bestTimeToVisit: string;
  days: DayItinerary[];
  budgetBreakdown: BudgetBreakdown;
  essentialTips: string[];
}

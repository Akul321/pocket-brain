export interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  notes: string;
  ai_note: string;
  payment_method: string;
  recurring: "yes" | "no";
  created_at: string;
}

export const PAYMENT_METHODS = ["UPI", "Cash", "Card", "Net Banking", "Wallet", "Other"];

export interface Budget {
  id: number;
  category: string;
  monthly_limit: number;
  month: string;
  spent: number;
  remaining: number;
  percentage: number;
  status: "safe" | "near" | "over";
  created_at: string;
}

export interface Goal {
  id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  monthly_contribution: number;
  deadline: string | null;
  priority: "low" | "medium" | "high";
  progress_pct: number;
  remaining_amount: number;
  estimated_months: number | null;
  ai_suggestion: string;
  created_at: string;
}

export interface Insight {
  text: string;
  severity: "success" | "warning" | "danger" | "info";
  insight_type: string;
}

export interface Summary {
  monthly_income: number;
  monthly_expenses: number;
  net_savings: number;
  savings_rate: number;
  cash_left: number;
  risk_level: "Low" | "Medium" | "High";
  top_category: string;
  insights: Insight[];
}

export interface Risk {
  score: number;
  level: "Low" | "Medium" | "High";
  risks: { label: string; detail: string; severity: string }[];
  recommendations: string[];
}

export interface SimulateResult {
  current_savings: number;
  simulated_savings: number;
  current_savings_rate: number;
  simulated_savings_rate: number;
  current_cash_left: number;
  simulated_cash_left: number;
  risk_change: string;
  recommendation: string;
}

export interface UserProfile {
  id: number;
  name: string;
  currency: string;
  monthly_income_target: number;
}

export const CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Rent",
  "Subscriptions",
  "Education",
  "Entertainment",
  "Health",
  "Investments",
  "Income",
  "Miscellaneous",
];

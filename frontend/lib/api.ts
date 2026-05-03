import axios from "axios";
import type {
  Transaction,
  Budget,
  Goal,
  Summary,
  Risk,
  SimulateResult,
  UserProfile,
  Insight,
} from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({ baseURL: BASE });

// Summary
export const getSummary = () => api.get<Summary>("/api/summary").then((r) => r.data);
export const getInsights = () => api.get<Insight[]>("/api/insights").then((r) => r.data);

// Profile
export const getProfile = () =>
  api.get<UserProfile>("/api/profile").then((r) => r.data).catch(() => null);
export const updateProfile = (data: Partial<UserProfile>) =>
  api.put<UserProfile>("/api/profile", data).then((r) => r.data);
export const resetDemo = () => api.post("/api/reset-demo").then((r) => r.data);
export const initApp = (mode: "fresh" | "demo", name: string, currency = "₹", monthly_income_target = 50000) =>
  api.post("/api/init", { mode, name, currency, monthly_income_target }).then((r) => r.data);

// Transactions
export const getTransactions = (params?: Record<string, string>) =>
  api.get<Transaction[]>("/api/transactions", { params }).then((r) => r.data);
export const createTransaction = (data: Partial<Transaction>) =>
  api.post<Transaction>("/api/transactions", data).then((r) => r.data);
export const updateTransaction = (id: number, data: Partial<Transaction>) =>
  api.put<Transaction>(`/api/transactions/${id}`, data).then((r) => r.data);
export const deleteTransaction = (id: number) =>
  api.delete(`/api/transactions/${id}`).then((r) => r.data);
export const importCSV = (file: File) => {
  const form = new FormData();
  form.append("file", file);
  return api.post("/api/transactions/import", form).then((r) => r.data);
};
export const exportCSV = () => `${BASE}/api/transactions/export`;

// Budgets
export const getBudgets = () => api.get<Budget[]>("/api/budgets").then((r) => r.data);
export const createBudget = (data: Partial<Budget>) =>
  api.post<Budget>("/api/budgets", data).then((r) => r.data);
export const deleteBudget = (id: number) => api.delete(`/api/budgets/${id}`).then((r) => r.data);

// Goals
export const getGoals = () => api.get<Goal[]>("/api/goals").then((r) => r.data);
export const createGoal = (data: Partial<Goal>) =>
  api.post<Goal>("/api/goals", data).then((r) => r.data);
export const updateGoal = (id: number, data: Partial<Goal>) =>
  api.put<Goal>(`/api/goals/${id}`, data).then((r) => r.data);
export const deleteGoal = (id: number) => api.delete(`/api/goals/${id}`).then((r) => r.data);

// Coach
export const askCoach = (message: string, history: { role: string; content: string }[] = []) =>
  api.post<{ reply: string }>("/api/coach", { message, history }).then((r) => r.data);

// Simulator
export const simulate = (params: Record<string, number | string | undefined>) =>
  api.post<SimulateResult>("/api/simulate", params).then((r) => r.data);

// Risk
export const getRisk = () => api.get<Risk>("/api/risk").then((r) => r.data);

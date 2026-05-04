import axios from "axios";
import type { Transaction, Budget, Goal, Summary, Risk, SimulateResult, UserProfile, Insight } from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({ baseURL: BASE });

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("pb_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("pb_token");
      localStorage.removeItem("pb_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// Auth
export const register = (data: { email: string; password: string; name: string; currency?: string; monthly_income_target?: number }) =>
  api.post<{ access_token: string; name: string; user_id: number }>("/api/auth/register", data).then((r) => r.data);

export const login = (data: { email: string; password: string }) =>
  api.post<{ access_token: string; name: string; user_id: number }>("/api/auth/login", data).then((r) => r.data);

export const logout = () => {
  localStorage.removeItem("pb_token");
  localStorage.removeItem("pb_user");
  window.location.href = "/login";
};

// Summary
export const getSummary = () => api.get<Summary>("/api/summary").then((r) => r.data);
export const getInsights = () => api.get<Insight[]>("/api/insights").then((r) => r.data);

// Profile
export const getProfile = () => api.get<UserProfile>("/api/profile").then((r) => r.data);
export const updateProfile = (data: Partial<UserProfile>) =>
  api.put<UserProfile>("/api/profile", data).then((r) => r.data);
export const resetDemo = () => api.post("/api/reset-demo").then((r) => r.data);
export const initApp = (mode: "fresh" | "demo") =>
  api.post("/api/init", { mode }).then((r) => r.data);

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

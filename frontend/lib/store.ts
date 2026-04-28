import { create } from "zustand";

interface AppStore {
  refreshKey: number;
  triggerRefresh: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  refreshKey: 0,
  triggerRefresh: () => set((state) => ({ refreshKey: state.refreshKey + 1 })),
}));

import { create } from 'zustand';

export type Page = 'home' | 'appointment' | 'login' | 'dashboard';

interface NavigationState {
  currentPage: Page;
  setPage: (page: Page) => void;
}

export const useNavigation = create<NavigationState>((set) => ({
  currentPage: 'home',
  setPage: (page) => set({ currentPage: page }),
}));

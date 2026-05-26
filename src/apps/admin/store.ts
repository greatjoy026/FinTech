import { create } from 'zustand';

interface AdminStore {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  
  isCommandPaletteOpen: boolean;
  toggleCommandPalette: () => void;
  
  isNotificationsOpen: boolean;
  toggleNotifications: () => void;
  setNotificationsOpen: (open: boolean) => void;
  
  view: string;
  setView: (view: string) => void;
}

export const useAdminStore = create<AdminStore>((set) => ({
  isSidebarOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  
  isCommandPaletteOpen: false,
  toggleCommandPalette: () => set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen })),
  
  isNotificationsOpen: false,
  toggleNotifications: () => set((state) => ({ isNotificationsOpen: !state.isNotificationsOpen })),
  setNotificationsOpen: (open) => set({ isNotificationsOpen: open }),
  
  view: 'overview',
  setView: (view) => set({ view }),
}));

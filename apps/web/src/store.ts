import { create } from 'zustand';

interface User {
  id: string;
  handle?: string;
  role: 'user' | 'admin';
}

interface Cult {
  id: string;
  slug: string;
  name: string;
  symbol?: string;
  description?: string;
  member_count: number;
  daily_active_members?: number;
  composite_score?: number;
  rank?: number;
}

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  top10: Cult[];
  currentCult: Cult | null;
  wsConnection: WebSocket | null;
  
  setUser: (user: User | null) => void;
  setTop10: (cults: Cult[]) => void;
  setCurrentCult: (cult: Cult | null) => void;
  setWsConnection: (ws: WebSocket | null) => void;
  
  login: () => Promise<void>;
  logout: () => Promise<void>;
  fetchTop10: () => Promise<void>;
  createCult: (data: any) => Promise<Cult>;
  joinCult: (cultId: string) => Promise<void>;
  leaveCult: (cultId: string) => Promise<void>;
}

const API_URL = import.meta.env.PROD ? 'https://the-sect-api.workers.dev' : '';

export const useStore = create<AppState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  top10: [],
  currentCult: null,
  wsConnection: null,
  
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setTop10: (top10) => set({ top10 }),
  setCurrentCult: (currentCult) => set({ currentCult }),
  setWsConnection: (wsConnection) => set({ wsConnection }),
  
  login: async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          type: 'dev',
          identifier: `user_${Date.now()}`
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        set({ user: data.user, isAuthenticated: true });
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  },
  
  logout: async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  },
  
  fetchTop10: async () => {
    try {
      const res = await fetch(`${API_URL}/api/top10`);
      if (res.ok) {
        const data = await res.json();
        set({ top10: data });
      }
    } catch (error) {
      console.error('Failed to fetch top 10:', error);
    }
  },
  
  createCult: async (data) => {
    const res = await fetch(`${API_URL}/api/cults`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to create cult');
    }
    
    const cult = await res.json();
    get().fetchTop10();
    return cult;
  },
  
  joinCult: async (cultId) => {
    const res = await fetch(`${API_URL}/api/cults/${cultId}/join`, {
      method: 'POST',
      credentials: 'include'
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to join cult');
    }
    
    get().fetchTop10();
  },
  
  leaveCult: async (cultId) => {
    const res = await fetch(`${API_URL}/api/cults/${cultId}/leave`, {
      method: 'POST',
      credentials: 'include'
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to leave cult');
    }
    
    get().fetchTop10();
  }
}));
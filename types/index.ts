export interface User {
  id: string;
  phone: string;
  name: string;
  status: 'active' | 'blocked';
  created: string;
  updated: string;
}

export interface Client {
  id?: string;
  name: string;
  user: string;
  phone: string;
  plate: string;
  created?: string;
  updated?: string;
}

export interface Wash {
  id?: string;
  user: string;
  client: string;
  service: 'exterior' | 'interior' | 'full' | 'other';
  price: number;
  payment_method: 'cash' | 'wave' | 'om';
  created?: string;
  updated?: string;
  expand?: {
    client: Client;
    user: User;
  };
}

export interface DayStats {
  totalWashes: number;
  totalRevenue: number;
}

export type AuthStore = {
  isAuthenticated: boolean;
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
};

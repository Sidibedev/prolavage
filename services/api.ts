import PocketBase from 'pocketbase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Client, Wash } from '@/types';

// Configure your PocketBase URL here
const PB_URL = 'https://prolavage-pocketbase.onrender.com'; // Replace with your actual URL

class PocketBaseClient {
  public pb: PocketBase;

  constructor() {
    this.pb = new PocketBase(PB_URL);
    this.loadAuthFromStorage();
  }

  private async loadAuthFromStorage() {
    try {
      const authData = await AsyncStorage.getItem('pb_auth');
      if (authData) {
        const parsed = JSON.parse(authData);
        this.pb.authStore.save(parsed.token, parsed.model);
      }
    } catch (error) {
      console.error('Error loading auth from storage:', error);
    }
  }

  private async saveAuthToStorage() {
    try {
      const authData = {
        token: this.pb.authStore.token,
        model: this.pb.authStore.model,
      };
      await AsyncStorage.setItem('pb_auth', JSON.stringify(authData));
    } catch (error) {
      console.error('Error saving auth to storage:', error);
    }
  }

  async login(phone: string, pin: string): Promise<User> {
    try {
      const authData = await this.pb
        .collection('users')
        .authWithPassword(phone, pin);
      await this.saveAuthToStorage();
      return authData.record as User;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(name: string, phone: string, pin: string) {
    // 1) créer le compte
    const rec = await this.pb.collection('users').create({
      username: phone, // on se connecte avec phone comme username
      phone,
      name,
      status: 'active', // tu peux mettre 'blocked' si tu veux valider manuellement
      password: pin,
      passwordConfirm: pin,
    });

    // 2) auto-login derrière pour entrer direct dans l’app
    await this.pb.collection('users').authWithPassword(phone, pin);
    await this.saveAuthToStorage();

    return rec; // ou retourne this.pb.authStore.model si tu veux
  }

  async logout() {
    this.pb.authStore.clear();
    await AsyncStorage.removeItem('pb_auth');
  }

  async createClient(
    clientData: Omit<Client, 'id' | 'created' | 'updated'>
  ): Promise<Client> {
    try {
      const client = await this.pb.collection('clients').create(clientData);
      return client as Client;
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  }

  async searchClients(query: string, userId: string): Promise<Client[]> {
    try {
      const parts = [`user = "${userId}"`]; // 🔒 limite à l'utilisateur connecté
      if (query.trim()) {
        parts.push(`(name~"${query}" || phone~"${query}" || plate~"${query}")`);
      }
      const filter = parts.join(' && ');

      const clients = await this.pb.collection('clients').getList(1, 10, {
        filter,
        sort: '-created',
      });
      return clients.items as Client[];
    } catch (error) {
      console.error('Error searching clients:', error);
      return [];
    }
  }

  async createWash(
    washData: Omit<Wash, 'id' | 'created' | 'updated'>
  ): Promise<Wash> {
    try {
      const wash = await this.pb.collection('washes').create(washData);
      return wash as Wash;
    } catch (error) {
      console.error('Error creating wash:', error);
      throw error;
    }
  }

  async getUserWashes(userId: string): Promise<Wash[]> {
    try {
      const washes = await this.pb.collection('washes').getList(1, 100, {
        filter: `user = "${userId}"`,
        sort: '-created',
        expand: 'client,user',
      });
      return washes.items as Wash[];
    } catch (error) {
      console.error('Error fetching user washes:', error);
      return [];
    }
  }

  async getTodayStats(
    userId: string
  ): Promise<{ totalWashes: number; totalRevenue: number }> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const washes = await this.pb.collection('washes').getList(1, 1000, {
        filter: `user = "${userId}" && created >= "${today} 00:00:00"`,
      });

      const totalWashes = washes.items.length;
      const totalRevenue = washes.items.reduce(
        (sum, wash: any) => sum + wash.price,
        0
      );

      return { totalWashes, totalRevenue };
    } catch (error) {
      console.error('Error fetching today stats:', error);
      return { totalWashes: 0, totalRevenue: 0 };
    }
  }

  isAuthenticated(): boolean {
    return this.pb.authStore.isValid;
  }

  getCurrentUser(): User | null {
    return this.pb.authStore.model as User | null;
  }

  handleAuthError(error: any): boolean {
    if (error?.status === 403 || error?.status === 401) {
      return true; // Should redirect to blocked/login
    }
    return false;
  }
}

export const api = new PocketBaseClient();

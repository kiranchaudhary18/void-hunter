import { API_BASE_URL } from '../config/gameConfig.js';

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    const token = localStorage.getItem('void_hunter_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers
      }
    };

    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error.message);
      throw error;
    }
  }

  // Authentication Endpoints
  auth = {
    register: (userData) => this.request('/auth/register', { method: 'POST', body: userData }),
    login: (credentials) => this.request('/auth/login', { method: 'POST', body: credentials }),
    getMe: () => this.request('/auth/me', { method: 'GET' })
  };

  // Starships & Hangar Endpoints
  ships = {
    getShips: () => this.request('/ships', { method: 'GET' }),
    selectShip: (shipId) => this.request(`/ships/${shipId}/select`, { method: 'POST' }),
    unlockShip: (shipId) => this.request(`/ships/${shipId}/unlock`, { method: 'POST' }),
    upgradeShip: (shipId, moduleType) => this.request(`/ships/${shipId}/upgrade`, { method: 'POST', body: { moduleType } })
  };

  // Power-Ups Endpoints (Section 26-28)
  powerups = {
    getPowerUps: () => this.request('/powerups', { method: 'GET' }),
    acquirePowerUp: (powerUpId) => this.request(`/powerups/${powerUpId}/acquire`, { method: 'POST' })
  };

  // Economy Endpoints
  economy = {
    getConfig: () => this.request('/economy/config', { method: 'GET' })
  };
}

export const api = new ApiService();
export default api;

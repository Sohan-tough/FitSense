// API configuration and utility functions
const API_BASE_URL = 'http://localhost:5000/api';

// API utility functions
export const api = {
  // Authentication endpoints
  async register(userData: { email: string; password: string; name: string }) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }
    
    return response.json();
  },

  async login(credentials: { email: string; password: string }) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }
    
    return response.json();
  },

  // Assessment endpoints
  async createAssessment(assessmentData: any) {
    const response = await fetch(`${API_BASE_URL}/assessments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(assessmentData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Assessment creation failed');
    }
    
    return response.json();
  },

  async getUserAssessments(userId: number) {
    const response = await fetch(`${API_BASE_URL}/assessments/${userId}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch assessments');
    }
    
    return response.json();
  },

  async updateAssessment(assessmentData: any) {
    const response = await fetch(`${API_BASE_URL}/assessments/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(assessmentData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Assessment update failed');
    }
    
    return response.json();
  },

  async getLatestAssessment(userId: number) {
    const response = await fetch(`${API_BASE_URL}/assessments/latest/${userId}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch latest assessment');
    }
    
    return response.json();
  },

  // User endpoints
  async getUser(userId: number) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch user');
    }
    
    return response.json();
  },

  // Session validation
  async validateSession(userId: number) {
    const response = await fetch(`${API_BASE_URL}/auth/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Session validation failed');
    }
    
    return response.json();
  },

  // Logout
  async logout() {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Logout failed');
    }
    
    return response.json();
  },

  // Health check
  async healthCheck() {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.json();
  },

  // Recalculate calorie analysis with custom duration
  async recalculateCalorieAnalysis(assessmentData: any, predictions: any, durationDays: number) {
    const response = await fetch(`${API_BASE_URL}/assessments/recalculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        assessment_data: assessmentData,
        predictions: predictions,
        duration_days: durationDays
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Recalculation failed');
    }
    
    return response.json();
  },
};

// Session storage utilities for user session
export const storage = {
  setUser(user: any) {
    // Store user data in sessionStorage (clears when tab is closed)
    sessionStorage.setItem('fitsense_user', JSON.stringify(user));
    // Also store a session timestamp
    sessionStorage.setItem('fitsense_session_start', Date.now().toString());
  },

  getUser() {
    const user = sessionStorage.getItem('fitsense_user');
    const sessionStart = sessionStorage.getItem('fitsense_session_start');
    
    // If no user or no session start time, return null
    if (!user || !sessionStart) {
      return null;
    }
    
    // Check if session is older than 24 hours (optional security measure)
    const sessionAge = Date.now() - parseInt(sessionStart);
    const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    if (sessionAge > maxSessionAge) {
      this.clearUser();
      return null;
    }
    
    return JSON.parse(user);
  },

  clearUser() {
    sessionStorage.removeItem('fitsense_user');
    sessionStorage.removeItem('fitsense_session_start');
  },

  removeUser() {
    this.clearUser();
  },

  isLoggedIn() {
    return !!this.getUser();
  },
};


export interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "manager" | "admin";
  createdAt: string;
  lastActive: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
  confirmPassword: string;
}

export interface UserProfile {
  name: string;
  email: string;
} 
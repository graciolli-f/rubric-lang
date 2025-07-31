/**
 * Type definitions for authentication and user management
 * No side effects, pure type definitions
 */

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  USER = 'user',
  MANAGER = 'manager',
  ADMIN = 'admin'
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface Session {
  userId: string;
  token: string;
  expiresAt: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetData {
  token: string;
  newPassword: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface AuthConfig {
  tokenExpiryMinutes: number;
  refreshTokenExpiryDays: number;
  passwordMinLength: number;
  requireSpecialChars: boolean;
}
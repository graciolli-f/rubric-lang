export type UserRole = "user" | "manager" | "admin";

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  updatedAt?: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type SignupData = {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
};

export type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
};

export const USER_ROLES: readonly UserRole[] = [
  "user",
  "manager", 
  "admin"
] as const;

export function isValidRole(value: unknown): value is UserRole {
  return typeof value === "string" && USER_ROLES.includes(value as UserRole);
}

export function isValidUser(value: unknown): value is User {
  if (!value || typeof value !== "object") return false;
  
  const user = value as Record<string, unknown>;
  
  return (
    typeof user.id === "string" &&
    typeof user.email === "string" &&
    user.email.includes("@") &&
    typeof user.name === "string" &&
    user.name.length > 0 &&
    isValidRole(user.role) &&
    typeof user.createdAt === "string" &&
    (user.updatedAt === undefined || typeof user.updatedAt === "string") &&
    (user.avatar === undefined || typeof user.avatar === "string")
  );
} 
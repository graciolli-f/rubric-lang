export type UserRole = "user" | "manager" | "admin";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  lastLoginAt?: string;
};

export type UserSession = {
  user: User;
  token: string;
  expiresAt: string;
};

export type LoginFormData = {
  email: string;
  password: string;
};

export type SignupFormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export const USER_ROLES: readonly UserRole[] = [
  "user",
  "manager", 
  "admin"
] as const;

export function isValidUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && USER_ROLES.includes(value as UserRole);
}

export function isValidUser(value: unknown): value is User {
  if (!value || typeof value !== "object") return false;
  
  const user = value as Record<string, unknown>;
  
  return (
    typeof user.id === "string" &&
    typeof user.name === "string" &&
    typeof user.email === "string" &&
    isValidUserRole(user.role) &&
    (user.avatar === undefined || typeof user.avatar === "string") &&
    typeof user.createdAt === "string" &&
    (user.lastLoginAt === undefined || typeof user.lastLoginAt === "string")
  );
} 
// Simple utility functions for demonstration purposes
// In a real app, use proper cryptographic libraries and backend validation

export const hashPassword = async (password: string): Promise<string> => {
  // Simulate password hashing - in real app, this would happen on the server
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const validatePassword = async (password: string, hash: string): Promise<boolean> => {
  // Simulate password validation - in real app, this would happen on the server
  const hashedPassword = await hashPassword(password);
  return hashedPassword === hash;
};

export const generateToken = (): string => {
  // Generate a simple JWT-like token for demonstration
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ 
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    iat: Date.now(),
    sub: 'user'
  }));
  const signature = btoa(Math.random().toString(36));
  return `${header}.${payload}.${signature}`;
};

export const verifyToken = (token: string): boolean => {
  try {
    const [, payload] = token.split('.');
    const decoded = JSON.parse(atob(payload));
    return decoded.exp > Date.now();
  } catch {
    return false;
  }
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}; 
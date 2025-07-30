export const validateEmail = (email: string): string | null => {
  if (!email) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return 'Password must contain at least one uppercase letter, lowercase letter, and number';
  }
  return null;
};

export const validateName = (name: string): string | null => {
  if (!name) return 'Name is required';
  if (name.trim().length < 2) return 'Name must be at least 2 characters';
  if (name.trim().length > 50) return 'Name must be less than 50 characters';
  return null;
};

export const validateGroupName = (name: string): string | null => {
  if (!name) return 'Group name is required';
  if (name.trim().length < 3) return 'Group name must be at least 3 characters';
  if (name.trim().length > 100) return 'Group name must be less than 100 characters';
  return null;
};

export const validateDescription = (description: string): string | null => {
  if (description && description.length > 500) {
    return 'Description must be less than 500 characters';
  }
  return null;
};

export const validateComment = (comment: string, required: boolean = false): string | null => {
  if (required && !comment) return 'Comment is required';
  if (comment && comment.length > 1000) return 'Comment must be less than 1000 characters';
  return null;
};

// Receipt file validation
const MAX_RECEIPT_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_RECEIPT_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const validateReceiptFile = (file: File): string | null => {
  // Check file type
  if (!ALLOWED_RECEIPT_TYPES.includes(file.type)) {
    return 'Invalid file type. Please use JPEG, PNG, or WebP format.';
  }
  
  // Check file size
  if (file.size > MAX_RECEIPT_FILE_SIZE) {
    return 'File size too large. Please use files under 5MB.';
  }
  
  return null;
}; 
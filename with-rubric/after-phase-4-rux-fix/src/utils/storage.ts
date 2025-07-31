export const getStorageItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn('Failed to read from localStorage:', error);
    return null;
  }
};

export const setStorageItem = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.warn('Failed to write to localStorage:', error);
  }
};

export const removeStorageItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn('Failed to remove from localStorage:', error);
  }
};

export const clearStorage = (): void => {
  try {
    localStorage.clear();
  } catch (error) {
    console.warn('Failed to clear localStorage:', error);
  }
}; 
/**
 * Business logic for receipt image management
 * Handles receipt photo storage, validation, and retrieval
 */

import { fileToBase64, createThumbnailCanvas, resizeImageCanvas, getImageDimensions as getImageDimensionsUtil, validateImageFile } from '../utils/image';
import type { ValidationResult } from '../utils/validation';

// Service configuration
const CONFIG = {
  maxFileSize: 5242880, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  thumbnailSize: 150,
  storageKeyPrefix: 'receipt_'
} as const;

/**
 * Upload a receipt file and store it in localStorage
 * Returns the storage key for the receipt
 */
export async function uploadReceipt(file: File): Promise<string> {
  try {
    // Validate the file
    const validation = validateReceiptFile(file);
    if (!validation.isValid) {
      throw new Error(`Invalid receipt file: ${validation.errors.join(', ')}`);
    }

    // Convert to base64
    const base64 = await fileToBase64(file);
    
    // Resize if too large (max 800x800)
    const resizedBase64 = await resizeImageCanvas(base64, 800, 800);
    
    // Create thumbnail
    const thumbnail = await createThumbnailCanvas(resizedBase64, CONFIG.thumbnailSize);
    
    // Generate unique ID
    const receiptId = crypto.randomUUID();
    const storageKey = `${CONFIG.storageKeyPrefix}${receiptId}`;
    const thumbnailKey = `${CONFIG.storageKeyPrefix}thumb_${receiptId}`;
    
    // Store in localStorage
    const receiptData = {
      id: receiptId,
      image: resizedBase64,
      thumbnail,
      mimeType: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString()
    };
    
    localStorage.setItem(storageKey, JSON.stringify(receiptData));
    localStorage.setItem(thumbnailKey, thumbnail);
    
    return receiptId;
  } catch (error) {
    throw new Error(`Failed to upload receipt: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete a receipt from localStorage
 */
export async function deleteReceipt(receiptId: string): Promise<void> {
  try {
    const storageKey = `${CONFIG.storageKeyPrefix}${receiptId}`;
    const thumbnailKey = `${CONFIG.storageKeyPrefix}thumb_${receiptId}`;
    
    localStorage.removeItem(storageKey);
    localStorage.removeItem(thumbnailKey);
  } catch (error) {
    throw new Error(`Failed to delete receipt: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get a receipt's full image data from localStorage
 */
export async function getReceipt(receiptId: string): Promise<string | null> {
  try {
    const storageKey = `${CONFIG.storageKeyPrefix}${receiptId}`;
    const stored = localStorage.getItem(storageKey);
    
    if (!stored) {
      return null;
    }
    
    const receiptData = JSON.parse(stored);
    return receiptData.image;
  } catch (error) {
    console.error('Failed to get receipt:', error);
    return null;
  }
}

/**
 * Get a receipt's thumbnail from localStorage
 */
export async function getReceiptThumbnail(receiptId: string): Promise<string | null> {
  try {
    const thumbnailKey = `${CONFIG.storageKeyPrefix}thumb_${receiptId}`;
    return localStorage.getItem(thumbnailKey);
  } catch (error) {
    console.error('Failed to get receipt thumbnail:', error);
    return null;
  }
}

/**
 * Validate a receipt file
 */
export function validateReceiptFile(file: File): ValidationResult {
  try {
    return validateImageFile(file);
  } catch (error) {
    return {
      isValid: false,
      errors: [error instanceof Error ? error.message : 'Validation failed']
    };
  }
}

/**
 * Resize an image to specified dimensions
 */
export async function resizeImage(base64: string, maxWidth: number, maxHeight: number): Promise<string> {
  try {
    return await resizeImageCanvas(base64, maxWidth, maxHeight);
  } catch (error) {
    throw new Error(`Failed to resize image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create a thumbnail from a base64 image
 */
export async function createThumbnail(base64: string): Promise<string> {
  try {
    return await createThumbnailCanvas(base64, CONFIG.thumbnailSize);
  } catch (error) {
    throw new Error(`Failed to create thumbnail: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get image dimensions from base64 string
 */
export async function getImageDimensions(base64: string): Promise<{width: number; height: number}> {
  try {
    return await getImageDimensionsUtil(base64);
  } catch (error) {
    throw new Error(`Failed to get image dimensions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Clear all receipts from localStorage
 */
export async function clearAllReceipts(): Promise<void> {
  try {
    const keys = Object.keys(localStorage);
    const receiptKeys = keys.filter(key => key.startsWith(CONFIG.storageKeyPrefix));
    
    receiptKeys.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    throw new Error(`Failed to clear receipts: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get total storage usage for receipts in bytes
 */
export async function getStorageUsage(): Promise<number> {
  try {
    const keys = Object.keys(localStorage);
    const receiptKeys = keys.filter(key => key.startsWith(CONFIG.storageKeyPrefix));
    
    let totalSize = 0;
    receiptKeys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        totalSize += new Blob([value]).size;
      }
    });
    
    return totalSize;
  } catch (error) {
    console.error('Failed to calculate storage usage:', error);
    return 0;
  }
}
/**
 * Pure utility functions for image processing
 * Handles file conversion, image resizing, and validation
 */

import type { ValidationResult } from './validation';
import { validateFile } from './validation';

// Configuration constants
const CONFIG = {
  maxFileSize: 5242880, // 5MB
  thumbnailSize: 150,
  supportedTypes: ["image/jpeg", "image/png", "image/webp"]
} as const;

// Exported constants
export const SUPPORTED_IMAGE_TYPES = CONFIG.supportedTypes;
export const MAX_IMAGE_SIZE = CONFIG.maxFileSize;
export const THUMBNAIL_SIZE = CONFIG.thumbnailSize;

/**
 * Converts a File object to base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remove data URL prefix to get just base64
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to read file as data URL'));
        }
      };
      reader.onerror = () => reject(new Error('File reading failed'));
      reader.readAsDataURL(file);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Converts base64 string to data URL with mime type
 */
export function base64ToDataUrl(base64: string, mimeType: string): string {
  return `data:${mimeType};base64,${base64}`;
}

/**
 * Extracts base64 data from data URL
 */
export function dataUrlToBase64(dataUrl: string): string {
  return dataUrl.split(',')[1];
}

/**
 * Gets image dimensions from base64 string
 */
export function getImageDimensions(base64: string): Promise<{width: number, height: number}> {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      
      const cleanup = () => {
        img.onload = null;
        img.onerror = null;
      };
      
      img.onload = () => {
        const dimensions = {
          width: img.naturalWidth,
          height: img.naturalHeight
        };
        cleanup();
        resolve(dimensions);
      };
      
      img.onerror = () => {
        cleanup();
        reject(new Error('Failed to load image'));
      };
      
      img.src = base64ToDataUrl(base64, 'image/jpeg'); // Default to jpeg for dimensions
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Resizes an image using canvas to specified max dimensions
 */
export function resizeImageCanvas(base64: string, maxWidth: number, maxHeight: number): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      
      const cleanup = () => {
        img.onload = null;
        img.onerror = null;
      };
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            cleanup();
            reject(new Error('Canvas context not available'));
            return;
          }
          
          // Calculate new dimensions maintaining aspect ratio
          let { width, height } = img;
          const aspectRatio = width / height;
          
          if (width > maxWidth) {
            width = maxWidth;
            height = width / aspectRatio;
          }
          
          if (height > maxHeight) {
            height = maxHeight;
            width = height * aspectRatio;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw resized image
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to base64
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          const resizedBase64 = dataUrlToBase64(dataUrl);
          
          cleanup();
          resolve(resizedBase64);
        } catch (error) {
          cleanup();
          reject(error);
        }
      };
      
      img.onerror = () => {
        cleanup();
        reject(new Error('Failed to load image for resizing'));
      };
      
      img.src = base64ToDataUrl(base64, 'image/jpeg');
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Creates a thumbnail from base64 image
 */
export function createThumbnailCanvas(base64: string, size: number = THUMBNAIL_SIZE): Promise<string> {
  return resizeImageCanvas(base64, size, size);
}

/**
 * Validates if a MIME type is a supported image type
 */
export function isValidImageType(mimeType: string): boolean {
  return SUPPORTED_IMAGE_TYPES.includes(mimeType);
}

/**
 * Validates if a file size is within limits
 */
export function isValidImageSize(file: File, maxSizeBytes: number = MAX_IMAGE_SIZE): boolean {
  return file.size <= maxSizeBytes;
}

/**
 * Validates an image file comprehensively
 */
export function validateImageFile(file: File): ValidationResult {
  return validateFile(file, {
    maxSize: MAX_IMAGE_SIZE,
    allowedTypes: SUPPORTED_IMAGE_TYPES
  });
}
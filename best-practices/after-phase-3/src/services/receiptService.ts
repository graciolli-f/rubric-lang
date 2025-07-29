export class ReceiptError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ReceiptError';
  }
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function validateReceiptFile(file: File): void {
  if (!file) {
    throw new ReceiptError('No file provided');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new ReceiptError('File size must be less than 5MB');
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new ReceiptError('File must be a JPEG, PNG, or WebP image');
  }
}

export function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      validateReceiptFile(file);
      
      const reader = new FileReader();
      
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      
      reader.onerror = () => {
        reject(new ReceiptError('Failed to read file'));
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      reject(error);
    }
  });
}

export function createThumbnail(base64Image: string, maxWidth: number = 100, maxHeight: number = 100): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new ReceiptError('Canvas not supported'));
        return;
      }
      
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and convert to base64
      ctx.drawImage(img, 0, 0, width, height);
      const thumbnailBase64 = canvas.toDataURL('image/jpeg', 0.8);
      resolve(thumbnailBase64);
    };
    
    img.onerror = () => {
      reject(new ReceiptError('Failed to load image for thumbnail'));
    };
    
    img.src = base64Image;
  });
}

export function getImageDimensions(base64Image: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    
    img.onerror = () => {
      reject(new ReceiptError('Failed to load image'));
    };
    
    img.src = base64Image;
  });
} 
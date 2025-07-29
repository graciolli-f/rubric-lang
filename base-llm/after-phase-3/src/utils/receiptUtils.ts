export class ReceiptUtils {
  static async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = error => reject(error);
    });
  }

  static async compressImage(file: File, maxWidth: number = 800, quality: number = 0.8): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      
      // Convert file to data URL for the image
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          img.src = e.target.result as string;
        }
      };
      reader.readAsDataURL(file);
    });
  }

  static validateImageFile(file: File): { isValid: boolean; error?: string } {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return { isValid: false, error: 'Please select an image file' };
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return { isValid: false, error: 'Image must be smaller than 5MB' };
    }

    // Check supported formats
    const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!supportedTypes.includes(file.type)) {
      return { isValid: false, error: 'Supported formats: JPEG, PNG, WebP' };
    }

    return { isValid: true };
  }

  static generateThumbnail(base64Image: string, size: number = 100): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Set canvas to square thumbnail size
        canvas.width = size;
        canvas.height = size;

        // Calculate dimensions to maintain aspect ratio
        const { width, height } = img;
        let sx = 0, sy = 0, sw = width, sh = height;

        if (width > height) {
          sx = (width - height) / 2;
          sw = height;
        } else if (height > width) {
          sy = (height - width) / 2;
          sh = width;
        }

        // Draw thumbnail (cropped to square)
        ctx?.drawImage(img, sx, sy, sw, sh, 0, 0, size, size);
        const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
        resolve(thumbnail);
      };

      img.onerror = () => reject(new Error('Failed to generate thumbnail'));
      img.src = base64Image;
    });
  }

  static async processReceiptImage(file: File): Promise<{ 
    original: string; 
    thumbnail: string; 
  }> {
    try {
      // Validate the file first
      const validation = this.validateImageFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Compress the original image
      const compressedImage = await this.compressImage(file, 1200, 0.85);
      
      // Generate thumbnail
      const thumbnail = await this.generateThumbnail(compressedImage, 80);

      return {
        original: compressedImage,
        thumbnail
      };
    } catch (error) {
      throw new Error(`Failed to process receipt image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
} 
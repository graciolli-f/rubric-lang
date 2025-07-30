const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export async function processReceiptFile(file: File): Promise<{
  base64: string;
  fileName: string;
  fileSize: number;
}> {
  if (!validateReceiptFile(file)) {
    throw new Error('Invalid file type or size. Please use JPEG, PNG, or WebP under 5MB.');
  }
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      const base64 = reader.result as string;
      resolve({
        base64,
        fileName: file.name,
        fileSize: file.size,
      });
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

export function validateReceiptFile(file: File): boolean {
  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return false;
  }
  
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return false;
  }
  
  return true;
}

export function createThumbnail(base64: string, maxWidth: number, maxHeight: number): string {
  // For now, return the original base64. In a real app, you might want to 
  // actually resize the image using canvas
  return base64;
}

export function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.');
  return lastDot === -1 ? '' : fileName.substring(lastDot + 1).toLowerCase();
} 